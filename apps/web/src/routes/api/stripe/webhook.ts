import { db } from "@dunlo-v2/db";
import {
  failedPayment,
  recoveryAttempt,
  recoverySequence,
  sequenceStep,
  escalation,
} from "@dunlo-v2/db/schema/domain";
import { createFileRoute } from "@tanstack/react-router";
import { and, eq, inArray } from "drizzle-orm";
import type Stripe from "stripe";

import {
  getStripeConnectionByAccountId,
  type DecryptedStripeConnection,
} from "@/functions/stripe";
import { generateEscalationDraft } from "@/functions/escalations";
import { getPlatformStripe, getConnectedStripe } from "@/lib/stripe";
import { sendAlertNotification } from "@/lib/notifications";
import { env } from "@dunlo-v2/env/server";

const FAILURE_EVENTS = new Set<string>([
  "payment_intent.payment_failed",
  "invoice.payment_failed",
]);

const SUCCESS_EVENTS = new Set<string>([
  "payment_intent.succeeded",
  "invoice.payment_succeeded",
]);

const PAYMENT_METHOD_EVENTS = new Set<string>([
  "customer.updated",
]);

function pickFailureCode(
  event: Stripe.Event,
): { code: string; message: string | null } {
  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object as Stripe.PaymentIntent;
    return {
      code:
        pi.last_payment_error?.decline_code ??
        pi.last_payment_error?.code ??
        "card_declined",
      message: pi.last_payment_error?.message ?? null,
    };
  }
  if (event.type === "invoice.payment_failed") {
    const inv = event.data.object as Stripe.Invoice;
    const reason =
      (inv.last_finalization_error?.decline_code as string | undefined) ??
      (inv.last_finalization_error?.code as string | undefined) ??
      "card_declined";
    return {
      code: reason,
      message: inv.last_finalization_error?.message ?? null,
    };
  }
  return { code: "card_declined", message: null };
}

function extractFailureContext(event: Stripe.Event) {
  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object as Stripe.PaymentIntent;
    const piWithCharges = pi as Stripe.PaymentIntent & {
      charges?: { data: Stripe.Charge[] };
    };
    const charge =
      piWithCharges.charges && "data" in piWithCharges.charges
        ? piWithCharges.charges.data[0]
        : (typeof pi.latest_charge === "object" && pi.latest_charge !== null
            ? (pi.latest_charge as Stripe.Charge)
            : undefined);
    return {
      paymentIntentId: pi.id,
      invoiceId: (pi.invoice as string | null) ?? null,
      customerId: (pi.customer as string | null) ?? null,
      amount: pi.amount,
      currency: pi.currency,
      customerEmail:
        (pi.receipt_email as string | null) ??
        (charge?.billing_details?.email as string | null) ??
        null,
      customerName:
        (charge?.billing_details?.name as string | null) ?? null,
      lastFour:
        (charge?.payment_method_details?.card?.last4 as string | null) ?? null,
      description: pi.description ?? null,
    };
  }
  if (event.type === "invoice.payment_failed") {
    const inv = event.data.object as Stripe.Invoice;
    return {
      paymentIntentId:
        typeof inv.payment_intent === "string"
          ? inv.payment_intent
          : inv.payment_intent?.id ?? `inv_${inv.id}`,
      invoiceId: inv.id,
      customerId:
        typeof inv.customer === "string"
          ? inv.customer
          : inv.customer?.id ?? null,
      amount: inv.amount_due,
      currency: inv.currency,
      customerEmail: inv.customer_email ?? null,
      customerName: inv.customer_name ?? null,
      lastFour: null,
      description: inv.description ?? inv.lines?.data?.[0]?.description ?? null,
    };
  }
  return null;
}

type FailedPaymentResult = {
  wasEscalated: boolean;
  customerName: string | null;
  customerEmail: string;
  amount: number;
  currency: string;
} | null;

export async function processFailedPayment(
  event: Stripe.Event,
  connection: DecryptedStripeConnection,
): Promise<FailedPaymentResult> {
  const ctx = extractFailureContext(event);
  if (!ctx) return null;
  if (!ctx.customerEmail) {
    console.warn(
      "[stripe/webhook] skipping failed payment with no customer email",
      ctx.paymentIntentId,
    );
    return null;
  }

  const { code: failureCode, message: failureMessage } = pickFailureCode(event);

  const existing = await db
    .select({ id: failedPayment.id })
    .from(failedPayment)
    .where(eq(failedPayment.stripePaymentIntentId, ctx.paymentIntentId))
    .limit(1);
  if (existing.length > 0) return null;

  const threshold = connection.escalationThreshold;
  const shouldEscalate =
    threshold !== null && threshold > 0 && ctx.amount >= threshold;

  const paymentId = crypto.randomUUID();

  await db.insert(failedPayment).values({
    id: paymentId,
    userId: connection.userId,
    stripePaymentIntentId: ctx.paymentIntentId,
    stripeCustomerId: ctx.customerId ?? "",
    stripeInvoiceId: ctx.invoiceId,
    amount: ctx.amount,
    currency: ctx.currency,
    failureCode,
    failureMessage,
    customerName: ctx.customerName,
    customerEmail: ctx.customerEmail,
    lastFour: ctx.lastFour,
    description: ctx.description,
    status: shouldEscalate ? "escalated" : "in_recovery",
  });

  if (shouldEscalate) {
    const escalationId = crypto.randomUUID();
    await db.insert(escalation).values({
      id: escalationId,
      failedPaymentId: paymentId,
      userId: connection.userId,
      draftSubject: null,
      draftBody: null,
      status: "pending",
    });

    generateEscalationDraft(escalationId).catch((e) =>
      console.error("[stripe/webhook] AI draft failed:", e),
    );
    return {
      wasEscalated: true,
      customerName: ctx.customerName,
      customerEmail: ctx.customerEmail,
      amount: ctx.amount,
      currency: ctx.currency,
    };
  }

  const sequence = await findSequenceForFailureCode(
    connection.userId,
    failureCode,
  );
  if (!sequence) return null;

  const steps = await db
    .select()
    .from(sequenceStep)
    .where(eq(sequenceStep.sequenceId, sequence.id));

  if (steps.length === 0) return null;

  const now = Date.now();
  for (const step of steps.sort((a, b) => a.stepNumber - b.stepNumber)) {
    await db.insert(recoveryAttempt).values({
      id: crypto.randomUUID(),
      failedPaymentId: paymentId,
      sequenceStepId: step.id,
      status: "scheduled",
      scheduledAt: new Date(now + step.delayHours * 3600 * 1000),
    });
  }

  return {
    wasEscalated: false,
    customerName: ctx.customerName,
    customerEmail: ctx.customerEmail,
    amount: ctx.amount,
    currency: ctx.currency,
  };
}

async function findSequenceForFailureCode(userId: string, failureCode: string) {
  const [direct] = await db
    .select()
    .from(recoverySequence)
    .where(
      and(
        eq(recoverySequence.userId, userId),
        eq(recoverySequence.failureCode, failureCode),
        eq(recoverySequence.isActive, true),
      ),
    )
    .limit(1);
  if (direct) return direct;

  const [fallback] = await db
    .select()
    .from(recoverySequence)
    .where(
      and(
        eq(recoverySequence.userId, userId),
        eq(recoverySequence.failureCode, "card_declined"),
        eq(recoverySequence.isActive, true),
      ),
    )
    .limit(1);
  return fallback ?? null;
}

type RecoveredPaymentResult = {
  customerName: string | null;
  customerEmail: string;
  amount: number;
  currency: string;
} | null;

export async function processRecoveredPayment(
  event: Stripe.Event,
  connection: DecryptedStripeConnection,
): Promise<RecoveredPaymentResult> {
  let paymentIntentId: string | null = null;
  let invoiceId: string | null = null;

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as Stripe.PaymentIntent;
    paymentIntentId = pi.id;
    invoiceId =
      typeof pi.invoice === "string"
        ? pi.invoice
        : (pi.invoice as Stripe.Invoice | null)?.id ?? null;
  } else if (event.type === "invoice.payment_succeeded") {
    const inv = event.data.object as Stripe.Invoice;
    invoiceId = inv.id;
    paymentIntentId =
      typeof inv.payment_intent === "string"
        ? inv.payment_intent
        : inv.payment_intent?.id ?? null;
  }

  if (!paymentIntentId && !invoiceId) return null;

  const matches = await db
    .select()
    .from(failedPayment)
    .where(
      and(
        eq(failedPayment.userId, connection.userId),
        inArray(failedPayment.status, ["in_recovery", "escalated"]),
      ),
    );

  const target = matches.find(
    (p) =>
      (paymentIntentId && p.stripePaymentIntentId === paymentIntentId) ||
      (invoiceId && p.stripeInvoiceId === invoiceId),
  );
  if (!target) return null;

  await db
    .update(failedPayment)
    .set({ status: "recovered", recoveredAt: new Date() })
    .where(eq(failedPayment.id, target.id));

  await db
    .update(recoveryAttempt)
    .set({ status: "dismissed" })
    .where(
      and(
        eq(recoveryAttempt.failedPaymentId, target.id),
        eq(recoveryAttempt.status, "scheduled"),
      ),
    );

  return {
    customerName: target.customerName,
    customerEmail: target.customerEmail,
    amount: target.amount,
    currency: target.currency,
  };
}

export async function processPaymentMethodUpdate(
  event: Stripe.Event,
  connection: DecryptedStripeConnection,
): Promise<void> {
  const customer = event.data.object as Stripe.Customer;
  const prev = (event.data.previous_attributes ?? {}) as Record<string, unknown>;

  const paymentMethodChanged = "invoice_settings" in prev || "default_source" in prev;
  if (!paymentMethodChanged) return;

  const payments = await db
    .select()
    .from(failedPayment)
    .where(
      and(
        eq(failedPayment.userId, connection.userId),
        eq(failedPayment.stripeCustomerId, customer.id),
        eq(failedPayment.status, "in_recovery"),
      ),
    );

  const invoicePayments = payments.filter((p) => p.stripeInvoiceId !== null);
  if (invoicePayments.length === 0) return;

  const stripe = getConnectedStripe(connection.accessToken);

  for (const payment of invoicePayments) {
    try {
      await stripe.invoices.pay(payment.stripeInvoiceId!);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code !== "invoice_already_paid") {
        console.warn(
          "[stripe/webhook] immediate retry failed for invoice",
          payment.stripeInvoiceId,
          code,
        );
      }
    }
  }
}

export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        const sig = request.headers.get("stripe-signature");

        if (!sig) {
          return new Response("Missing stripe-signature header", {
            status: 400,
          });
        }

        const stripe = getPlatformStripe();
        let event: Stripe.Event;
        try {
          event = stripe.webhooks.constructEvent(
            rawBody,
            sig,
            env.STRIPE_WEBHOOK_SECRET,
          );
        } catch (err) {
          console.error("[stripe/webhook] signature verification failed", err);
          return new Response("Invalid signature", { status: 400 });
        }

        const accountId = (event as { account?: string }).account;
        if (!accountId) {
          return new Response("Missing account on event", { status: 400 });
        }

        const connection = await getStripeConnectionByAccountId(accountId);
        if (!connection) {
          return new Response("Unknown connected account", { status: 400 });
        }

        try {
          if (FAILURE_EVENTS.has(event.type)) {
            const result = await processFailedPayment(event, connection);
            if (result) {
              sendAlertNotification({
                userId: connection.userId,
                eventType: result.wasEscalated ? "escalation" : "failure",
                customerName: result.customerName,
                customerEmail: result.customerEmail,
                amount: result.amount,
                currency: result.currency,
              }).catch((e) =>
                console.error("[webhook] alert notification failed", e),
              );
            }
          } else if (SUCCESS_EVENTS.has(event.type)) {
            const result = await processRecoveredPayment(event, connection);
            if (result) {
              sendAlertNotification({
                userId: connection.userId,
                eventType: "recovery",
                customerName: result.customerName,
                customerEmail: result.customerEmail,
                amount: result.amount,
                currency: result.currency,
              }).catch((e) =>
                console.error("[webhook] alert notification failed", e),
              );
            }
          } else if (PAYMENT_METHOD_EVENTS.has(event.type)) {
            await processPaymentMethodUpdate(event, connection);
          }
        } catch (err) {
          console.error(
            "[stripe/webhook] handler error",
            event.type,
            event.id,
            err,
          );
          return new Response("Handler error", { status: 500 });
        }

        return Response.json({ received: true });
      },
    },
  },
});
