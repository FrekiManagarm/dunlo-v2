import { createServerFn } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";
import { db } from "@dunlo-v2/db";
import {
  benchmarkSnapshot,
  failedPayment,
  stripeConnection,
} from "@dunlo-v2/db/schema/domain";
import { and, desc, eq, gte } from "drizzle-orm";
import type Stripe from "stripe";

import { authMiddleware } from "@/middleware/auth";
import { getConnectedStripe } from "@/lib/stripe";
import {
  BENCHMARK_FAILURE_CODES,
  DYNAMIC_BENCHMARK_MIN_USERS,
  GLOBAL_FAILED_PAYMENT_AVERAGE,
  benchmarkCopySource,
  bpsToRate,
  estimatePercentile,
  getBenchmarkFailureCode,
  rateToBps,
  toBenchmarkCode,
  type BenchmarkCode,
} from "@/lib/benchmark";
import { formatAmount } from "@/lib/template";

const SAMPLE_WINDOW_DAYS = 90;
const SNAPSHOT_TTL_MS = 24 * 60 * 60 * 1000;

type SnapshotLike = typeof benchmarkSnapshot.$inferSelect;

type StripePaymentIntentLike = Pick<
  Stripe.PaymentIntent,
  "amount" | "created" | "currency" | "last_payment_error" | "status"
>;

function rate(part: number, total: number): number {
  return total > 0 ? (part / total) * 100 : 0;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2) return sorted[mid] ?? 0;
  return ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function centsToMrrRange(monthlyCents: number): string {
  if (monthlyCents <= 0) return "unknown";
  if (monthlyCents < 500_000) return "<$5k";
  if (monthlyCents < 2_000_000) return "$5k-$20k";
  if (monthlyCents < 10_000_000) return "$20k-$100k";
  return "$100k+";
}

function snapshotRate(snapshot: SnapshotLike, code: BenchmarkCode): number {
  switch (code) {
    case "card_expired":
      return bpsToRate(snapshot.cardExpiredRateBps);
    case "insufficient_funds":
      return bpsToRate(snapshot.insufficientFundsRateBps);
    case "do_not_honor":
      return bpsToRate(snapshot.doNotHonorRateBps);
    case "card_velocity_exceeded":
      return bpsToRate(snapshot.cardVelocityExceededRateBps);
    case "other":
      return bpsToRate(snapshot.otherRateBps);
  }
}

function snapshotRatesByCode(snapshot: SnapshotLike) {
  return BENCHMARK_FAILURE_CODES.map((item) => ({
    code: item.code,
    label: item.label,
    sequenceFailureCode: item.sequenceFailureCode,
    rate: snapshotRate(snapshot, item.code),
    averageRate: item.averageRate,
    publicAverageRate: item.publicAverageRate,
    recoverableRate: item.recoverableRate,
    status:
      snapshotRate(snapshot, item.code) > item.averageRate
        ? ("above" as const)
        : ("normal" as const),
  }));
}

function fallbackSnapshot(userId: string): SnapshotLike {
  const now = new Date();
  return {
    id: "fallback",
    userId,
    sampleStartsAt: new Date(now.getTime() - SAMPLE_WINDOW_DAYS * 86400_000),
    sampleEndsAt: now,
    totalChargeCount: 0,
    failedChargeCount: 0,
    recoveredFailureCount: 0,
    failedPaymentRateBps: rateToBps(GLOBAL_FAILED_PAYMENT_AVERAGE),
    recoveryRateBps: 0,
    cardExpiredRateBps: rateToBps(0.8),
    insufficientFundsRateBps: rateToBps(1.2),
    doNotHonorRateBps: rateToBps(0.6),
    cardVelocityExceededRateBps: rateToBps(0.4),
    otherRateBps: rateToBps(2),
    mrrRange: "unknown",
    benchmarkOptOut: false,
    createdAt: now,
    updatedAt: now,
  };
}

export async function storeBenchmarkSnapshotFromPaymentIntents({
  userId,
  paymentIntents,
}: {
  userId: string;
  paymentIntents: StripePaymentIntentLike[];
}) {
  const now = new Date();
  const startsAt = new Date(now.getTime() - SAMPLE_WINDOW_DAYS * 86400_000);
  const codeCounts: Record<BenchmarkCode, number> = {
    card_expired: 0,
    insufficient_funds: 0,
    do_not_honor: 0,
    card_velocity_exceeded: 0,
    other: 0,
  };

  let totalCharges = 0;
  let failedCharges = 0;
  let succeededAmount = 0;
  let currency = "usd";

  for (const pi of paymentIntents) {
    const isFailed = pi.status === "requires_payment_method";
    const isSucceeded = pi.status === "succeeded";
    if (!isFailed && !isSucceeded) continue;

    totalCharges += 1;
    currency = pi.currency ?? currency;

    if (isSucceeded) {
      succeededAmount += pi.amount;
      continue;
    }

    failedCharges += 1;
    const failureCode =
      pi.last_payment_error?.decline_code ??
      pi.last_payment_error?.code ??
      "other";
    codeCounts[toBenchmarkCode(failureCode)] += 1;
  }

  const rows = await db
    .select({
      status: failedPayment.status,
      createdAt: failedPayment.createdAt,
    })
    .from(failedPayment)
    .where(and(eq(failedPayment.userId, userId), gte(failedPayment.createdAt, startsAt)));

  const recovered = rows.filter((row) => row.status === "recovered").length;
  const monthlyCents = succeededAmount / 3;

  try {
    await db
      .insert(benchmarkSnapshot)
      .values({
        id: crypto.randomUUID(),
        userId,
        sampleStartsAt: startsAt,
        sampleEndsAt: now,
        totalChargeCount: totalCharges,
        failedChargeCount: failedCharges,
        recoveredFailureCount: recovered,
        failedPaymentRateBps: rateToBps(rate(failedCharges, totalCharges)),
        recoveryRateBps: rateToBps(rate(recovered, failedCharges)),
        cardExpiredRateBps: rateToBps(rate(codeCounts.card_expired, totalCharges)),
        insufficientFundsRateBps: rateToBps(
          rate(codeCounts.insufficient_funds, totalCharges),
        ),
        doNotHonorRateBps: rateToBps(rate(codeCounts.do_not_honor, totalCharges)),
        cardVelocityExceededRateBps: rateToBps(
          rate(codeCounts.card_velocity_exceeded, totalCharges),
        ),
        otherRateBps: rateToBps(rate(codeCounts.other, totalCharges)),
        mrrRange: centsToMrrRange(monthlyCents),
      })
      .onConflictDoUpdate({
        target: benchmarkSnapshot.userId,
        set: {
          sampleStartsAt: startsAt,
          sampleEndsAt: now,
          totalChargeCount: totalCharges,
          failedChargeCount: failedCharges,
          recoveredFailureCount: recovered,
          failedPaymentRateBps: rateToBps(rate(failedCharges, totalCharges)),
          recoveryRateBps: rateToBps(rate(recovered, failedCharges)),
          cardExpiredRateBps: rateToBps(rate(codeCounts.card_expired, totalCharges)),
          insufficientFundsRateBps: rateToBps(
            rate(codeCounts.insufficient_funds, totalCharges),
          ),
          doNotHonorRateBps: rateToBps(rate(codeCounts.do_not_honor, totalCharges)),
          cardVelocityExceededRateBps: rateToBps(
            rate(codeCounts.card_velocity_exceeded, totalCharges),
          ),
          otherRateBps: rateToBps(rate(codeCounts.other, totalCharges)),
          mrrRange: centsToMrrRange(monthlyCents),
          updatedAt: now,
        },
      });
  } catch {
    console.warn("[benchmark] snapshot persistence skipped");
  }

  return { totalCharges, failedCharges, currency };
}

export async function syncStripeBenchmarkSnapshot(
  userId: string,
  accessToken: string,
) {
  const stripe = getConnectedStripe(accessToken);
  const since = Math.floor((Date.now() - SAMPLE_WINDOW_DAYS * 86400_000) / 1000);
  const paymentIntents: StripePaymentIntentLike[] = [];

  for await (const pi of stripe.paymentIntents.list({
    limit: 100,
    created: { gte: since },
  })) {
    paymentIntents.push(pi);
    if (paymentIntents.length >= 500) break;
  }

  return storeBenchmarkSnapshotFromPaymentIntents({ userId, paymentIntents });
}

async function getCurrentUserSnapshot(userId: string) {
  let snapshot: SnapshotLike | undefined;

  try {
    [snapshot] = await db
      .select()
      .from(benchmarkSnapshot)
      .where(eq(benchmarkSnapshot.userId, userId))
      .limit(1);
  } catch {
    console.warn("[benchmark] snapshot table unavailable");
    return fallbackSnapshot(userId);
  }

  if (snapshot && Date.now() - snapshot.updatedAt.getTime() < SNAPSHOT_TTL_MS) {
    return snapshot;
  }

  const [connection] = await db
    .select({ accessToken: stripeConnection.accessToken })
    .from(stripeConnection)
    .where(eq(stripeConnection.userId, userId))
    .limit(1);

  if (!connection) return snapshot ?? fallbackSnapshot(userId);

  try {
    const { decrypt } = await import("@dunlo-v2/db/encrypt");
    await syncStripeBenchmarkSnapshot(userId, decrypt(connection.accessToken));
    const [fresh] = await db
      .select()
      .from(benchmarkSnapshot)
      .where(eq(benchmarkSnapshot.userId, userId))
      .limit(1);
    return fresh ?? snapshot ?? fallbackSnapshot(userId);
  } catch (e) {
    console.error("[benchmark] snapshot sync failed", e);
    return snapshot ?? fallbackSnapshot(userId);
  }
}

export const getUserBenchmarkData = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (!context.session?.user) throw redirect({ to: "/login" });
    const userId = context.session.user.id;
    const snapshot = await getCurrentUserSnapshot(userId);
    const startsAt = new Date(Date.now() - SAMPLE_WINDOW_DAYS * 86400_000);

    const failedRows = await db
      .select({
        amount: failedPayment.amount,
        currency: failedPayment.currency,
        failureCode: failedPayment.failureCode,
      })
      .from(failedPayment)
      .where(and(eq(failedPayment.userId, userId), gte(failedPayment.createdAt, startsAt)))
      .orderBy(desc(failedPayment.createdAt));

    const currency = failedRows[0]?.currency ?? "usd";
    const monthlyFailedAmount =
      failedRows.reduce((sum, row) => sum + row.amount, 0) / 3;
    const userRate = bpsToRate(snapshot.failedPaymentRateBps);
    const excessRate = Math.max(0, userRate - GLOBAL_FAILED_PAYMENT_AVERAGE);
    const excessShare = userRate > 0 ? excessRate / userRate : 0;
    const estimatedMonthlyLeak = Math.round(monthlyFailedAmount * excessShare);
    const breakdown = snapshotRatesByCode(snapshot);
    const biggestLeak =
      [...breakdown].sort(
        (a, b) => b.rate - b.averageRate - (a.rate - a.averageRate),
      )[0] ?? breakdown[0];

    return {
      userRate,
      averageRate: GLOBAL_FAILED_PAYMENT_AVERAGE,
      percentile: estimatePercentile(userRate, GLOBAL_FAILED_PAYMENT_AVERAGE),
      failedChargeCount: snapshot.failedChargeCount,
      totalChargeCount: snapshot.totalChargeCount,
      recoveredFailureCount: snapshot.recoveredFailureCount,
      estimatedMonthlyLeak,
      estimatedMonthlyLeakFormatted: formatAmount(estimatedMonthlyLeak, currency),
      source: benchmarkCopySource(0),
      mrrRange: snapshot.mrrRange,
      updatedAt: snapshot.updatedAt.toISOString(),
      breakdown,
      biggestLeak: {
        code: biggestLeak.code,
        label: biggestLeak.label,
        sequenceFailureCode: biggestLeak.sequenceFailureCode,
      },
    };
  });

export const getPublicBenchmarkData = createServerFn({ method: "GET" }).handler(
  async () => {
    let snapshots: SnapshotLike[] = [];

    try {
      snapshots = await db
        .select()
        .from(benchmarkSnapshot)
        .where(eq(benchmarkSnapshot.benchmarkOptOut, false))
        .orderBy(desc(benchmarkSnapshot.updatedAt))
        .limit(250);
    } catch {
      console.warn("[benchmark] public benchmark using public baseline");
    }

    const eligible = snapshots.length >= DYNAMIC_BENCHMARK_MIN_USERS;
    const sampleSize = eligible ? snapshots.length : 0;
    const globalRate = eligible
      ? bpsToRate(average(snapshots.map((row) => row.failedPaymentRateBps)))
      : GLOBAL_FAILED_PAYMENT_AVERAGE;
    const globalMedian = eligible
      ? bpsToRate(median(snapshots.map((row) => row.failedPaymentRateBps)))
      : GLOBAL_FAILED_PAYMENT_AVERAGE;

    const codeRows = BENCHMARK_FAILURE_CODES.filter(
      (item) => item.code !== "other",
    ).map((item) => {
      const values = snapshots.map((row) => rateToBps(snapshotRate(row, item.code)));
      return {
        code: item.code,
        label: item.label,
        averageRate: eligible
          ? bpsToRate(average(values))
          : item.publicAverageRate,
        medianRate: eligible ? bpsToRate(median(values)) : item.publicAverageRate,
        recoverableRate: item.recoverableRate,
      };
    });

    const analyzedCharges = eligible
      ? snapshots.reduce((sum, row) => sum + row.totalChargeCount, 0)
      : 12_840;
    const updatedAt = snapshots[0]?.updatedAt ?? new Date("2026-05-17T00:00:00Z");

    return {
      sourceMode: eligible ? ("dynamic" as const) : ("public_baseline" as const),
      sampleSize,
      analyzedCharges,
      globalRate,
      globalMedian,
      codeRows,
      minDynamicUsers: DYNAMIC_BENCHMARK_MIN_USERS,
      lastUpdated: updatedAt.toISOString(),
      source: benchmarkCopySource(sampleSize),
      reportReady: snapshots.length >= 30,
      calculatorAverage: globalRate,
    };
  },
);

export function publicCalculatorResult(inputRate: number, monthlyRevenue: number) {
  const rateDelta = Math.max(0, inputRate - GLOBAL_FAILED_PAYMENT_AVERAGE);
  const recoverableMonthly = Math.round(
    monthlyRevenue * (rateDelta / 100) * 0.48,
  );
  return {
    percentile: estimatePercentile(inputRate, GLOBAL_FAILED_PAYMENT_AVERAGE),
    recoverableMonthly,
    biggestIssue: getBenchmarkFailureCode("card_expired").label,
  };
}
