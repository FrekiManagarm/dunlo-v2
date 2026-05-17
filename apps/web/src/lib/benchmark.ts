export type BenchmarkCode =
  | "card_expired"
  | "insufficient_funds"
  | "do_not_honor"
  | "card_velocity_exceeded"
  | "other";

export type BenchmarkFailureCode = {
  code: BenchmarkCode;
  sequenceFailureCode: string;
  label: string;
  averageRate: number;
  publicAverageRate: number;
  recoverableRate: number;
  aliases: readonly string[];
};

export const GLOBAL_FAILED_PAYMENT_AVERAGE = 4.8;
export const DYNAMIC_BENCHMARK_MIN_USERS = 20;
export const PUBLIC_REPORT_MIN_USERS = 30;

export const BENCHMARK_FAILURE_CODES: readonly BenchmarkFailureCode[] = [
  {
    code: "card_expired",
    sequenceFailureCode: "expired_card",
    label: "Card expired",
    averageRate: 0.8,
    publicAverageRate: 0.8,
    recoverableRate: 63,
    aliases: ["card_expired", "expired_card"],
  },
  {
    code: "insufficient_funds",
    sequenceFailureCode: "insufficient_funds",
    label: "Insufficient funds",
    averageRate: 1.2,
    publicAverageRate: 1.9,
    recoverableRate: 31,
    aliases: ["insufficient_funds"],
  },
  {
    code: "do_not_honor",
    sequenceFailureCode: "do_not_honor",
    label: "Bank declined",
    averageRate: 0.6,
    publicAverageRate: 0.7,
    recoverableRate: 44,
    aliases: ["do_not_honor", "card_declined", "generic_decline"],
  },
  {
    code: "card_velocity_exceeded",
    sequenceFailureCode: "card_declined",
    label: "Velocity exceeded",
    averageRate: 0.4,
    publicAverageRate: 0.4,
    recoverableRate: 12,
    aliases: ["card_velocity_exceeded", "velocity_exceeded"],
  },
  {
    code: "other",
    sequenceFailureCode: "card_declined",
    label: "Other declines",
    averageRate: 2,
    publicAverageRate: 1,
    recoverableRate: 24,
    aliases: ["other"],
  },
] as const;

export function toBenchmarkCode(raw: string | null | undefined): BenchmarkCode {
  const normalized = raw?.trim().toLowerCase() ?? "";
  const match = BENCHMARK_FAILURE_CODES.find((item) =>
    item.aliases.includes(normalized),
  );
  return match?.code ?? "other";
}

export function getBenchmarkFailureCode(code: BenchmarkCode) {
  return (
    BENCHMARK_FAILURE_CODES.find((item) => item.code === code) ??
    BENCHMARK_FAILURE_CODES[BENCHMARK_FAILURE_CODES.length - 1]
  );
}

export function rateToBps(rate: number): number {
  return Math.max(0, Math.round(rate * 100));
}

export function bpsToRate(bps: number | null | undefined): number {
  return Number(((bps ?? 0) / 100).toFixed(1));
}

export function formatRate(rate: number): string {
  return `${rate.toFixed(1)}%`;
}

export function estimatePercentile(rate: number, average: number): number {
  if (rate <= average * 0.55) return 18;
  if (rate <= average * 0.8) return 31;
  if (rate <= average) return 47;
  if (rate <= average * 1.25) return 63;
  if (rate <= average * 1.6) return 78;
  if (rate <= average * 2.1) return 89;
  return 94;
}

export function benchmarkCopySource(sampleSize: number): string {
  return sampleSize >= DYNAMIC_BENCHMARK_MIN_USERS
    ? `Based on ${sampleSize.toLocaleString("en-US")} anonymized Stripe accounts analyzed by Dunlo`
    : "Based on public Stripe and ProfitWell baselines while Dunlo builds its anonymized sample";
}

