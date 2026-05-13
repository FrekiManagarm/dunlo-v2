import { createServerFn } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";
import { db } from "@dunlo-v2/db";
import {
  failedPayment,
  escalation,
  stripeConnection,
} from "@dunlo-v2/db/schema/domain";
import { and, desc, eq, gte } from "drizzle-orm";
import { z } from "zod";

import { authMiddleware } from "@/middleware/auth";
import { formatAmount, humanizeFailureCode } from "@/lib/template";

type PaymentStatus =
  | "in_recovery"
  | "recovered"
  | "escalated"
  | "failed"
  | "dismissed";

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
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

export const getDashboardData = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (!context.session) {
      throw redirect({ to: "/login" });
    }
    const userId = context.session.user.id;

    const [connection] = await db
      .select()
      .from(stripeConnection)
      .where(eq(stripeConnection.userId, userId))
      .limit(1);

    const currency = connection?.escalationCurrency ?? "eur";
    const stripeConnected = Boolean(connection);

    const monthStart = startOfMonth(new Date());

    const monthRows = await db
      .select()
      .from(failedPayment)
      .where(
        and(
          eq(failedPayment.userId, userId),
          gte(failedPayment.createdAt, monthStart),
        ),
      );

    const allInRecoveryRows = await db
      .select()
      .from(failedPayment)
      .where(
        and(
          eq(failedPayment.userId, userId),
          eq(failedPayment.status, "in_recovery"),
        ),
      );

    const recoveredAmount = monthRows
      .filter((p) => p.status === "recovered")
      .reduce((acc, p) => acc + p.amount, 0);

    const inRecoveryCount = allInRecoveryRows.length;

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

    const mrrAtRisk = allInRecoveryRows.reduce((acc, p) => acc + p.amount, 0);

    const recentRows = await db
      .select()
      .from(failedPayment)
      .where(eq(failedPayment.userId, userId))
      .orderBy(desc(failedPayment.createdAt))
      .limit(20);

    const now = new Date();
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
      .where(
        and(eq(escalation.userId, userId), eq(escalation.status, "pending")),
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
  .validator((raw: unknown) => getPaymentsInput.parse(raw))
  .handler(async ({ context, data }) => {
    if (!context.session) {
      throw redirect({ to: "/login" });
    }
    const userId = context.session.user.id;
    const { status, limit, offset } = data;

    const whereClause = status
      ? and(eq(failedPayment.userId, userId), eq(failedPayment.status, status))
      : eq(failedPayment.userId, userId);

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
