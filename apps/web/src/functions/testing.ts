import { db } from "@dunlo-v2/db";
import {
  escalation,
  failedPayment,
  recoveryAttempt,
  recoverySequence,
  sequenceStep,
} from "@dunlo-v2/db/schema/domain";
import { env } from "@dunlo-v2/env/server";
import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq } from "drizzle-orm";
import type Stripe from "stripe";

import { generateEscalationDraft } from "@/functions/escalations";
import { getStripeConnection } from "@/functions/stripe";
import { getConnectedStripe } from "@/lib/stripe";
import { authMiddleware } from "@/middleware/auth";

const TEST_CUSTOMERS = [
  { name: "Sophie Marchand", email: "sophie.marchand@example.com" },
  { name: "Lucas Fontaine", email: "lucas.fontaine@example.com" },
  { name: "Emma Leclerc", email: "emma.leclerc@example.com" },
  { name: "Thomas Renard", email: "thomas.renard@example.com" },
];

const TEST_FAILURE_SCENARIOS = [
  {
    failureCode: "card_declined",
    paymentMethod: "pm_card_visa_chargeDeclined",
  },
  {
    failureCode: "expired_card",
    paymentMethod: "pm_card_chargeDeclinedExpiredCard",
  },
  {
    failureCode: "insufficient_funds",
    paymentMethod: "pm_card_visa_chargeDeclinedInsufficientFunds",
  },
] as const;

export type SimulateFailedPaymentResult = {
  paymentId: string;
  stripePaymentIntentId: string;
  stripeAccountId: string;
  customerName: string;
  amount: number;
  failureCode: string;
};

export type SimulateEscalationResult = {
  paymentId: string;
  stripePaymentIntentId: string;
  stripeAccountId: string;
  escalationId: string;
  customerName: string;
  amount: number;
};

export type SimulateRecoveryResult = {
  paymentId: string;
  customerName: string | null;
  amount: number;
};

function assertDevelopment() {
  if (env.NODE_ENV !== "development") {
    throw new Error("Testing actions are only available in development");
  }
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

async function findSequence(userId: string, failureCode: string) {
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

function stripeFailureCode(paymentIntent: Stripe.PaymentIntent): string {
  return (
    paymentIntent.last_payment_error?.decline_code ??
    paymentIntent.last_payment_error?.code ??
    "card_declined"
  );
}

function stripeFailureMessage(
  paymentIntent: Stripe.PaymentIntent,
): string | null {
  return paymentIntent.last_payment_error?.message ?? null;
}

function latestCharge(
  paymentIntent: Stripe.PaymentIntent,
): Stripe.Charge | null {
  return typeof paymentIntent.latest_charge === "object" &&
    paymentIntent.latest_charge !== null
    ? paymentIntent.latest_charge
    : null;
}

async function createStripeFailedPaymentIntent({
  userId,
  customer,
  amount,
  paymentMethod,
}: {
  userId: string;
  customer: { name: string; email: string };
  amount: number;
  paymentMethod: string;
}) {
  const connection = await getStripeConnection(userId);
  if (!connection) throw new Error("Stripe not connected");

  const stripe = getConnectedStripe(connection.accessToken);
  const stripeCustomer = await stripe.customers.create({
    name: customer.name,
    email: customer.email,
    metadata: {
      source: "dunlo_testing",
      userId,
    },
  });

  let paymentIntent: Stripe.PaymentIntent | null = null;

  try {
    paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: connection.escalationCurrency,
      customer: stripeCustomer.id,
      receipt_email: customer.email,
      payment_method: paymentMethod,
      confirm: true,
      description: "Dunlo test failed payment",
      metadata: {
        source: "dunlo_testing",
        userId,
      },
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
    });
  } catch (error) {
    const stripeError = error as Stripe.StripeRawError & {
      payment_intent?: Stripe.PaymentIntent;
    };
    paymentIntent = stripeError.payment_intent ?? null;

    if (!paymentIntent) {
      throw error;
    }
  }

  const fullPaymentIntent = await stripe.paymentIntents.retrieve(
    paymentIntent.id,
    {
      expand: ["latest_charge"],
    },
  );

  return {
    connection,
    stripeCustomerId: stripeCustomer.id,
    paymentIntent: fullPaymentIntent,
  };
}

export async function simulateFailedPaymentForUser(
  userId: string,
): Promise<SimulateFailedPaymentResult> {
  assertDevelopment();

  const customer = pickRandom(TEST_CUSTOMERS);
  const scenario = pickRandom(TEST_FAILURE_SCENARIOS);
  const amount = Math.floor(Math.random() * 4900) + 999;
  const { connection, stripeCustomerId, paymentIntent } =
    await createStripeFailedPaymentIntent({
      userId,
      customer,
      amount,
      paymentMethod: scenario.paymentMethod,
    });

  const failureCode = stripeFailureCode(paymentIntent) ?? scenario.failureCode;
  const charge = latestCharge(paymentIntent);

  const paymentId = crypto.randomUUID();
  await db.insert(failedPayment).values({
    id: paymentId,
    userId,
    stripePaymentIntentId: paymentIntent.id,
    stripeAccountId: connection.stripeAccountId,
    stripeCustomerId,
    amount,
    currency: paymentIntent.currency,
    failureCode,
    failureMessage: stripeFailureMessage(paymentIntent),
    customerName: customer.name,
    customerEmail: customer.email,
    lastFour: charge?.payment_method_details?.card?.last4 ?? null,
    description: paymentIntent.description,
    status: "in_recovery",
    createdAt: new Date(paymentIntent.created * 1000),
  });

  const sequence = await findSequence(userId, failureCode);
  if (sequence) {
    const steps = await db
      .select()
      .from(sequenceStep)
      .where(eq(sequenceStep.sequenceId, sequence.id));

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
  }

  return {
    paymentId,
    stripePaymentIntentId: paymentIntent.id,
    stripeAccountId: connection.stripeAccountId,
    customerName: customer.name,
    amount,
    failureCode,
  };
}

export async function simulateEscalationForUser(
  userId: string,
): Promise<SimulateEscalationResult> {
  assertDevelopment();

  const connection = await getStripeConnection(userId);
  if (!connection) throw new Error("Stripe not connected");

  const threshold = connection.escalationThreshold ?? 50000;
  const amount = threshold + Math.floor(Math.random() * 50000) + 10000;

  const customer = pickRandom(TEST_CUSTOMERS);
  const { stripeCustomerId, paymentIntent } =
    await createStripeFailedPaymentIntent({
      userId,
      customer,
      amount,
      paymentMethod: "pm_card_visa_chargeDeclined",
    });

  const paymentId = crypto.randomUUID();
  await db.insert(failedPayment).values({
    id: paymentId,
    userId,
    stripePaymentIntentId: paymentIntent.id,
    stripeAccountId: connection.stripeAccountId,
    stripeCustomerId,
    amount,
    currency: paymentIntent.currency,
    failureCode: stripeFailureCode(paymentIntent),
    failureMessage: stripeFailureMessage(paymentIntent),
    customerName: customer.name,
    customerEmail: customer.email,
    lastFour:
      latestCharge(paymentIntent)?.payment_method_details?.card?.last4 ?? null,
    description: paymentIntent.description,
    status: "escalated",
    createdAt: new Date(paymentIntent.created * 1000),
  });

  const escalationId = crypto.randomUUID();
  await db.insert(escalation).values({
    id: escalationId,
    failedPaymentId: paymentId,
    userId,
    status: "pending",
  });

  generateEscalationDraft(escalationId).catch((_e: unknown) => {
    console.error("[testing] escalation draft failed");
  });

  return {
    paymentId,
    stripePaymentIntentId: paymentIntent.id,
    stripeAccountId: connection.stripeAccountId,
    escalationId,
    customerName: customer.name,
    amount,
  };
}

export async function simulateRecoveryForUser(
  userId: string,
): Promise<SimulateRecoveryResult> {
  assertDevelopment();

  const [target] = await db
    .select({
      id: failedPayment.id,
      customerName: failedPayment.customerName,
      amount: failedPayment.amount,
    })
    .from(failedPayment)
    .where(
      and(
        eq(failedPayment.userId, userId),
        eq(failedPayment.status, "in_recovery"),
      ),
    )
    .orderBy(desc(failedPayment.createdAt))
    .limit(1);

  if (!target) throw new Error("No in-recovery payment to resolve");

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
    paymentId: target.id,
    customerName: target.customerName,
    amount: target.amount,
  };
}

export const simulateFailedPayment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (!context.session?.user) throw new Error("Unauthorized");
    return simulateFailedPaymentForUser(context.session.user.id);
  });

export const simulateEscalation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (!context.session?.user) throw new Error("Unauthorized");
    return simulateEscalationForUser(context.session.user.id);
  });

export const simulateRecovery = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (!context.session?.user) throw new Error("Unauthorized");
    return simulateRecoveryForUser(context.session.user.id);
  });
