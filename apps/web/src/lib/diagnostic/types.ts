import { z } from "zod";

export const DIAGNOSTIC_CATEGORIES = [
  "naturally_recovered",
  "open_automatable",
  "open_human",
  "historically_lost_automatable",
  "historically_lost_human",
  "excluded",
] as const;

export const DIAGNOSTIC_VERDICTS = [
  "activation_recommended",
  "monitoring_recommended",
  "insufficient_data",
] as const;

export const DIAGNOSTIC_CHECKPOINTS = [
  "account_loaded",
  "invoices_loaded",
  "payment_evidence_loaded",
  "revenue_normalized",
  "findings_classified",
  "snapshot_persisted",
] as const;

export type DiagnosticCategory = (typeof DIAGNOSTIC_CATEGORIES)[number];
export type DiagnosticVerdict = (typeof DIAGNOSTIC_VERDICTS)[number];
export type DiagnosticCheckpoint = (typeof DIAGNOSTIC_CHECKPOINTS)[number];
export type MoneyByCurrency = Record<string, number>;

export type Money = {
  amount: number;
  currency: string;
};

export const diagnosticCategorySchema = z.enum(DIAGNOSTIC_CATEGORIES);
export const diagnosticVerdictSchema = z.enum(DIAGNOSTIC_VERDICTS);
export const diagnosticCheckpointSchema = z.enum(DIAGNOSTIC_CHECKPOINTS);

const minorUnitAmountSchema = z
  .number()
  .int()
  .nonnegative("Money amounts must be non-negative.");

export const currencySchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z]{3}$/, "Currency must be a three-letter ISO currency code.");

export const moneySchema = z.object({
  amount: minorUnitAmountSchema,
  currency: currencySchema,
});

export const diagnosticFindingInputSchema = z.object({
  stripeInvoiceId: z.string().trim().min(1),
  stripeCustomerId: z.string().trim().min(1),
  stripeSubscriptionId: z.string().trim().min(1).nullable(),
  amount: minorUnitAmountSchema,
  currency: currencySchema,
  failedAt: z.string().datetime(),
  resolvedAt: z.string().datetime().nullable(),
  invoiceStatus: z.string().trim().min(1),
  subscriptionStatus: z.string().trim().min(1).nullable(),
  adviceCode: z.string().trim().min(1).nullable(),
  declineCode: z.string().trim().min(1).nullable(),
  category: diagnosticCategorySchema,
  reason: z.string().trim().min(1),
});

export type DiagnosticFindingInput = z.output<typeof diagnosticFindingInputSchema>;

export const moneyByCurrencySchema = z
  .record(z.string(), minorUnitAmountSchema)
  .transform((amounts) =>
    groupMoneyByCurrency(
      Object.entries(amounts).map(([currency, amount]) => ({ amount, currency })),
    ),
  );

export function normalizeCurrency(currency: string): string {
  return currencySchema.parse(currency);
}

export function groupMoneyByCurrency(
  amounts: readonly Money[],
): MoneyByCurrency {
  return amounts.reduce<MoneyByCurrency>((grouped, amount) => {
    const parsedAmount = moneySchema.parse(amount);

    grouped[parsedAmount.currency] =
      (grouped[parsedAmount.currency] ?? 0) + parsedAmount.amount;

    return grouped;
  }, {});
}

export function addMoney(left: Money, right: Money): Money {
  const normalizedLeft = moneySchema.parse(left);
  const normalizedRight = moneySchema.parse(right);

  if (normalizedLeft.currency !== normalizedRight.currency) {
    throw new Error("Cannot add money in different currencies.");
  }

  return {
    amount: normalizedLeft.amount + normalizedRight.amount,
    currency: normalizedLeft.currency,
  };
}
