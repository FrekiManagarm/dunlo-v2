import { createServerFn } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";
import { db } from "@dunlo-v2/db";
import {
  escalation,
  failedPayment,
  recoveryAttempt,
  sequenceStep,
  stripeConnection,
} from "@dunlo-v2/db/schema/domain";
import { and, desc, eq, gte, inArray } from "drizzle-orm";
import { z } from "zod";

import { generateEscalationDraft } from "@/functions/escalations";
import { authMiddleware } from "@/middleware/auth";
import { formatAmount, humanizeFailureCode } from "@/lib/template";

type PaymentStatus =
  | "in_recovery"
  | "recovered"
  | "escalated"
  | "failed"
  | "dismissed";

const MRR_AT_RISK_STATUSES = ["in_recovery", "escalated"] as const;

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function recoveryTrend(rows: (typeof failedPayment.$inferSelect)[], now: Date) {
  const monthStart = startOfMonth(now);
  const daysElapsed = now.getDate();
  const buckets = Array.from({ length: daysElapsed }, (_, index) => {
    const date = new Date(
      monthStart.getFullYear(),
      monthStart.getMonth(),
      index + 1,
    );

    return {
      key: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      failedAmount: 0,
      recoveredAmount: 0,
    };
  });

  const bucketByKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));

  for (const row of rows) {
    const key = row.createdAt.toISOString().slice(0, 10);
    const bucket = bucketByKey.get(key);
    if (!bucket) continue;

    bucket.failedAmount += row.amount;
    if (row.status === "recovered") {
      bucket.recoveredAmount += row.amount;
    }
  }

  return buckets;
}

function relativeTime(from: Date, now: Date = new Date()): string {
  const diffMs = now.getTime() - from.getTime();
  const sec = Math.max(0, Math.floor(diffMs / 1000));
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} day${day === 1 ? "" : "s"} ago`;
  const month = Math.floor(day / 30);
  if (month < 12) return `${month} month${month === 1 ? "" : "s"} ago`;
  const year = Math.floor(day / 365);
  return `${year} year${year === 1 ? "" : "s"} ago`;
}

function customerDisplayName(row: {
  customerName: string | null;
  customerEmail: string;
}): string {
  if (row.customerName && row.customerName.trim().length > 0) {
    return row.customerName;
  }
  const prefix = row.customerEmail.split("@")[0] ?? row.customerEmail;
  return prefix;
}

function toIsoFromUnix(timestamp: number | null | undefined): string | null {
  return typeof timestamp === "number"
    ? new Date(timestamp * 1000).toISOString()
    : null;
}

async function getStripeCustomerContext({
  encryptedAccessToken,
  stripeCustomerId,
  currency,
}: {
  encryptedAccessToken: string;
  stripeCustomerId: string;
  currency: string;
}) {
  if (!stripeCustomerId) return null;

  try {
    const [{ decrypt }, { getConnectedStripe }] = await Promise.all([
      import("@dunlo-v2/db/encrypt"),
      import("@/lib/stripe"),
    ]);
    const stripe = getConnectedStripe(decrypt(encryptedAccessToken));

    const [customer, subscriptions, paidInvoices] = await Promise.all([
      stripe.customers.retrieve(stripeCustomerId),
      stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: "all",
        limit: 10,
      }),
      stripe.invoices.list({
        customer: stripeCustomerId,
        status: "paid",
        limit: 100,
      }),
    ]);

    const sortedSubscriptions = [...subscriptions.data].sort((a, b) => {
      const statusWeight = (status: string) =>
        status === "active"
          ? 0
          : status === "trialing"
            ? 1
            : status === "past_due"
              ? 2
              : 3;
      return (
        statusWeight(a.status) - statusWeight(b.status) ||
        b.created - a.created
      );
    });
    const subscription = sortedSubscriptions[0] ?? null;
    const item = subscription?.items.data[0] ?? null;
    const price = item?.price ?? null;
    const interval = price?.recurring?.interval ?? null;
    const intervalCount = price?.recurring?.interval_count ?? null;
    const paidInvoiceTimestamps = paidInvoices.data
      .map((invoice) => invoice.created)
      .filter((created): created is number => typeof created === "number");
    const payingSince =
      paidInvoiceTimestamps.length > 0
        ? Math.min(...paidInvoiceTimestamps)
        : subscription?.created;
    const totalPaid = paidInvoices.data.reduce(
      (sum, invoice) => sum + (invoice.amount_paid ?? 0),
      0,
    );
    const invoiceCurrency = paidInvoices.data[0]?.currency ?? currency;

    return {
      stripeAvailable: true,
      customerCreatedAt:
        "deleted" in customer && customer.deleted
          ? null
          : toIsoFromUnix(customer.created),
      payingSince: toIsoFromUnix(payingSince),
      totalPaid,
      totalPaidFormatted: formatAmount(totalPaid, invoiceCurrency),
      paidInvoiceCount: paidInvoices.data.length,
      lastPaidInvoiceAt: toIsoFromUnix(paidInvoices.data[0]?.created),
      subscription: subscription
        ? {
            id: subscription.id,
            status: subscription.status,
            startedAt: toIsoFromUnix(subscription.created),
            currentPeriodEnd: toIsoFromUnix(subscription.current_period_end),
            plan:
              price?.nickname ??
              price?.lookup_key ??
              (typeof price?.product === "string" ? price.product : null) ??
              price?.id ??
              "Subscription",
            interval:
              interval && intervalCount && intervalCount > 1
                ? `${intervalCount} ${interval}s`
                : interval,
          }
        : null,
    };
  } catch (error) {
    console.error("[payments] Stripe customer context failed", error);
    return {
      stripeAvailable: false,
      customerCreatedAt: null,
      payingSince: null,
      totalPaid: null,
      totalPaidFormatted: null,
      paidInvoiceCount: null,
      lastPaidInvoiceAt: null,
      subscription: null,
    };
  }
}

export const getDashboardData = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (!context.session) {
      throw redirect({ to: "/login", search: { mode: "signin" } });
    }
    const userId = context.session.user.id;

    const [connection] = await db
      .select()
      .from(stripeConnection)
      .where(eq(stripeConnection.userId, userId))
      .orderBy(desc(stripeConnection.updatedAt))
      .limit(1);

    const currency = connection?.escalationCurrency ?? "eur";
    const stripeConnected = Boolean(connection);

    if (!connection) {
      return {
        stripeConnected,
        stats: {
          recoveredAmount: 0,
          inRecoveryCount: 0,
          successRate: 0,
          mrrAtRisk: 0,
        },
        recentPayments: [],
        pendingEscalations: 0,
        recoveryTrend: [],
        currency,
      };
    }

    const now = new Date();
    const monthStart = startOfMonth(now);

    const monthRows = await db
      .select()
      .from(failedPayment)
      .where(
        and(
          eq(failedPayment.userId, userId),
          eq(failedPayment.stripeAccountId, connection.stripeAccountId),
          gte(failedPayment.createdAt, monthStart),
        ),
      );

    const activeAtRiskRows = await db
      .select()
      .from(failedPayment)
      .where(
        and(
          eq(failedPayment.userId, userId),
          eq(failedPayment.stripeAccountId, connection.stripeAccountId),
          inArray(failedPayment.status, MRR_AT_RISK_STATUSES),
        ),
      );

    const recoveredAmount = monthRows
      .filter((p) => p.status === "recovered")
      .reduce((acc, p) => acc + p.amount, 0);

    const inRecoveryCount = activeAtRiskRows.filter(
      (p) => p.status === "in_recovery",
    ).length;

    const successDenominatorRows = monthRows.filter((p) =>
      ["recovered", "failed", "dismissed"].includes(p.status),
    );
    const recoveredCountThisMonth = monthRows.filter(
      (p) => p.status === "recovered",
    ).length;
    const successRate =
      successDenominatorRows.length > 0
        ? (recoveredCountThisMonth / successDenominatorRows.length) * 100
        : 0;

    const mrrAtRisk = activeAtRiskRows.reduce((acc, p) => acc + p.amount, 0);

    const recentRows = await db
      .select()
      .from(failedPayment)
      .where(
        and(
          eq(failedPayment.userId, userId),
          eq(failedPayment.stripeAccountId, connection.stripeAccountId),
        ),
      )
      .orderBy(desc(failedPayment.createdAt))
      .limit(20);

    const recentPayments = recentRows.map((row) => ({
      id: row.id,
      name: customerDisplayName(row),
      email: row.customerEmail,
      amount: formatAmount(row.amount, row.currency),
      currency: row.currency,
      status: row.status as PaymentStatus,
      type: humanizeFailureCode(row.failureCode),
      time: relativeTime(row.createdAt, now),
    }));

    const pendingEscalationRows = await db
      .select()
      .from(escalation)
      .innerJoin(failedPayment, eq(escalation.failedPaymentId, failedPayment.id))
      .where(
        and(
          eq(escalation.userId, userId),
          eq(failedPayment.stripeAccountId, connection.stripeAccountId),
          eq(escalation.status, "pending"),
        ),
      );

    return {
      stripeConnected,
      stats: {
        recoveredAmount,
        inRecoveryCount,
        successRate,
        mrrAtRisk,
      },
      recentPayments,
      pendingEscalations: pendingEscalationRows.length,
      recoveryTrend: recoveryTrend(monthRows, now),
      currency,
    };
  });

const PAYMENT_STATUSES = [
  "in_recovery",
  "recovered",
  "escalated",
  "failed",
  "dismissed",
] as const;

const getPaymentsInput = z.object({
  status: z.enum(PAYMENT_STATUSES).optional(),
  limit: z.number().int().min(1).max(200).default(50),
  offset: z.number().int().min(0).default(0),
});

export const getPayments = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator((raw: unknown) => getPaymentsInput.parse(raw))
  .handler(async ({ context, data }) => {
    if (!context.session) {
      throw redirect({ to: "/login", search: { mode: "signin" } });
    }
    const userId = context.session.user.id;
    const { status, limit, offset } = data;

    const [connection] = await db
      .select({ stripeAccountId: stripeConnection.stripeAccountId })
      .from(stripeConnection)
      .where(eq(stripeConnection.userId, userId))
      .orderBy(desc(stripeConnection.updatedAt))
      .limit(1);

    if (!connection) {
      return {
        payments: [],
        hasMore: false,
        limit,
        offset,
      };
    }

    const whereClause = status
      ? and(
          eq(failedPayment.userId, userId),
          eq(failedPayment.stripeAccountId, connection.stripeAccountId),
          eq(failedPayment.status, status),
        )
      : and(
          eq(failedPayment.userId, userId),
          eq(failedPayment.stripeAccountId, connection.stripeAccountId),
        );

    const rows = await db
      .select()
      .from(failedPayment)
      .where(whereClause)
      .orderBy(desc(failedPayment.createdAt))
      .limit(limit + 1)
      .offset(offset);

    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;

    const now = new Date();
    const payments = pageRows.map((row) => ({
      id: row.id,
      name: customerDisplayName(row),
      email: row.customerEmail,
      amount: formatAmount(row.amount, row.currency),
      amountCents: row.amount,
      currency: row.currency,
      status: row.status as PaymentStatus,
      type: humanizeFailureCode(row.failureCode),
      time: relativeTime(row.createdAt, now),
      createdAt: row.createdAt.toISOString(),
    }));

    return {
      payments,
      hasMore,
      limit,
      offset,
    };
  });

export const getPaymentDetail = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator((raw: unknown) => z.object({ id: z.string() }).parse(raw))
  .handler(async ({ context, data }) => {
    if (!context.session) {
      throw redirect({ to: "/login", search: { mode: "signin" } });
    }
    const userId = context.session.user.id;

    const [conn] = await db
      .select({
        stripeAccountId: stripeConnection.stripeAccountId,
        accessToken: stripeConnection.accessToken,
      })
      .from(stripeConnection)
      .where(eq(stripeConnection.userId, userId))
      .orderBy(desc(stripeConnection.updatedAt))
      .limit(1);

    if (!conn) throw new Error("Payment not found");

    const [row] = await db
      .select()
      .from(failedPayment)
      .where(
        and(
          eq(failedPayment.id, data.id),
          eq(failedPayment.userId, userId),
          eq(failedPayment.stripeAccountId, conn.stripeAccountId),
        ),
      )
      .limit(1);

    if (!row) throw new Error("Payment not found");

    const attempts = await db
      .select({
        id: recoveryAttempt.id,
        status: recoveryAttempt.status,
        scheduledAt: recoveryAttempt.scheduledAt,
        sentAt: recoveryAttempt.sentAt,
        stepNumber: sequenceStep.stepNumber,
        delayHours: sequenceStep.delayHours,
        subject: sequenceStep.subject,
      })
      .from(recoveryAttempt)
      .innerJoin(sequenceStep, eq(recoveryAttempt.sequenceStepId, sequenceStep.id))
      .where(eq(recoveryAttempt.failedPaymentId, row.id))
      .orderBy(sequenceStep.stepNumber);

    const [esc] = await db
      .select({ id: escalation.id, status: escalation.status })
      .from(escalation)
      .where(eq(escalation.failedPaymentId, row.id))
      .limit(1);

    const customerPayments = await db
      .select()
      .from(failedPayment)
      .where(
        and(
          eq(failedPayment.userId, userId),
          eq(failedPayment.stripeAccountId, conn.stripeAccountId),
          eq(failedPayment.stripeCustomerId, row.stripeCustomerId),
        ),
      )
      .orderBy(desc(failedPayment.createdAt));

    const firstFailedPaymentAt =
      customerPayments.length > 0
        ? customerPayments.reduce((earliest, payment) =>
            payment.createdAt < earliest ? payment.createdAt : earliest,
          customerPayments[0]!.createdAt)
        : row.createdAt;
    const recoveredCustomerPayments = customerPayments.filter(
      (payment) => payment.status === "recovered",
    );
    const localRecoveredAmount = recoveredCustomerPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );
    const stripeCustomerContext = await getStripeCustomerContext({
      encryptedAccessToken: conn.accessToken,
      stripeCustomerId: row.stripeCustomerId,
      currency: row.currency,
    });

    return {
      id: row.id,
      customerName: row.customerName,
      customerEmail: row.customerEmail,
      amount: row.amount,
      currency: row.currency,
      formattedAmount: formatAmount(row.amount, row.currency),
      failureCode: row.failureCode,
      failureLabel: humanizeFailureCode(row.failureCode),
      failureMessage: row.failureMessage,
      lastFour: row.lastFour,
      status: row.status,
      stripePaymentIntentId: row.stripePaymentIntentId,
      stripeAccountId: row.stripeAccountId ?? conn.stripeAccountId,
      createdAt: row.createdAt.toISOString(),
      recoveredAt: row.recoveredAt?.toISOString() ?? null,
      customerContext: {
        stripeCustomerId: row.stripeCustomerId,
        firstFailedPaymentAt: firstFailedPaymentAt.toISOString(),
        failedPaymentCount: customerPayments.length,
        previousFailedPaymentCount: Math.max(customerPayments.length - 1, 0),
        recoveredFailedPaymentCount: recoveredCustomerPayments.length,
        localRecoveredAmount,
        localRecoveredAmountFormatted: formatAmount(
          localRecoveredAmount,
          row.currency,
        ),
        stripe: stripeCustomerContext,
      },
      attempts: attempts.map((a) => ({
        id: a.id,
        status: a.status,
        scheduledAt: a.scheduledAt.toISOString(),
        sentAt: a.sentAt?.toISOString() ?? null,
        stepNumber: a.stepNumber,
        delayHours: a.delayHours,
        subject: a.subject,
      })),
      escalation: esc ? { id: esc.id, status: esc.status } : null,
    };
  });

export const markPaymentRecovered = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((raw: unknown) => z.object({ id: z.string() }).parse(raw))
  .handler(async ({ context, data }) => {
    if (!context.session) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    const [connection] = await db
      .select({ stripeAccountId: stripeConnection.stripeAccountId })
      .from(stripeConnection)
      .where(eq(stripeConnection.userId, userId))
      .orderBy(desc(stripeConnection.updatedAt))
      .limit(1);

    if (!connection) throw new Error("Payment not found");

    const [row] = await db
      .select({ id: failedPayment.id })
      .from(failedPayment)
      .where(
        and(
          eq(failedPayment.id, data.id),
          eq(failedPayment.userId, userId),
          eq(failedPayment.stripeAccountId, connection.stripeAccountId),
        ),
      )
      .limit(1);

    if (!row) throw new Error("Payment not found");

    await db
      .update(failedPayment)
      .set({ status: "recovered", recoveredAt: new Date() })
      .where(eq(failedPayment.id, row.id));

    await db
      .update(recoveryAttempt)
      .set({ status: "dismissed" })
      .where(
        and(
          eq(recoveryAttempt.failedPaymentId, row.id),
          eq(recoveryAttempt.status, "scheduled"),
        ),
      );

    await db
      .update(escalation)
      .set({ status: "dismissed" })
      .where(
        and(eq(escalation.failedPaymentId, row.id), eq(escalation.status, "pending")),
      );
  });

export const escalatePaymentManually = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((raw: unknown) => z.object({ id: z.string() }).parse(raw))
  .handler(async ({ context, data }) => {
    if (!context.session) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    const [connection] = await db
      .select({ stripeAccountId: stripeConnection.stripeAccountId })
      .from(stripeConnection)
      .where(eq(stripeConnection.userId, userId))
      .orderBy(desc(stripeConnection.updatedAt))
      .limit(1);

    if (!connection) throw new Error("Payment not found");

    const [row] = await db
      .select({ id: failedPayment.id, status: failedPayment.status })
      .from(failedPayment)
      .where(
        and(
          eq(failedPayment.id, data.id),
          eq(failedPayment.userId, userId),
          eq(failedPayment.stripeAccountId, connection.stripeAccountId),
        ),
      )
      .limit(1);

    if (!row) throw new Error("Payment not found");

    const [existing] = await db
      .select({ id: escalation.id })
      .from(escalation)
      .where(eq(escalation.failedPaymentId, row.id))
      .limit(1);

    if (existing) throw new Error("Already escalated");

    await db
      .update(failedPayment)
      .set({ status: "escalated" })
      .where(eq(failedPayment.id, row.id));

    await db
      .update(recoveryAttempt)
      .set({ status: "dismissed" })
      .where(
        and(
          eq(recoveryAttempt.failedPaymentId, row.id),
          eq(recoveryAttempt.status, "scheduled"),
        ),
      );

    const escalationId = crypto.randomUUID();
    await db.insert(escalation).values({
      id: escalationId,
      failedPaymentId: row.id,
      userId,
      status: "pending",
    });

    generateEscalationDraft(escalationId).catch((_e: unknown) => {
      console.error("[payments] escalation draft failed");
    });
  });
