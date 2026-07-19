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

export const STRIPE_SUPPORTED_CURRENCIES = [
  "aed",
  "afn",
  "all",
  "amd",
  "ang",
  "aoa",
  "ars",
  "aud",
  "awg",
  "azn",
  "bam",
  "bbd",
  "bdt",
  "bgn",
  "bif",
  "bmd",
  "bnd",
  "bob",
  "brl",
  "bsd",
  "bwp",
  "byn",
  "bzd",
  "cad",
  "cdf",
  "chf",
  "clp",
  "cny",
  "cop",
  "crc",
  "cve",
  "czk",
  "djf",
  "dkk",
  "dop",
  "dzd",
  "egp",
  "etb",
  "eur",
  "fjd",
  "fkp",
  "gbp",
  "gel",
  "gip",
  "gmd",
  "gnf",
  "gtq",
  "gyd",
  "hkd",
  "hnl",
  "htg",
  "huf",
  "idr",
  "ils",
  "inr",
  "isk",
  "jmd",
  "jpy",
  "kes",
  "kgs",
  "khr",
  "kmf",
  "krw",
  "kyd",
  "kzt",
  "lak",
  "lbp",
  "lkr",
  "lrd",
  "lsl",
  "mad",
  "mdl",
  "mga",
  "mkd",
  "mmk",
  "mnt",
  "mop",
  "mur",
  "mvr",
  "mwk",
  "mxn",
  "myr",
  "mzn",
  "nad",
  "ngn",
  "nio",
  "nok",
  "npr",
  "nzd",
  "pab",
  "pen",
  "pgk",
  "php",
  "pkr",
  "pln",
  "pyg",
  "qar",
  "ron",
  "rsd",
  "rub",
  "rwf",
  "sar",
  "sbd",
  "scr",
  "sek",
  "sgd",
  "shp",
  "sle",
  "sos",
  "srd",
  "std",
  "szl",
  "thb",
  "tjs",
  "top",
  "try",
  "ttd",
  "twd",
  "tzs",
  "uah",
  "ugx",
  "usd",
  "uyu",
  "uzs",
  "vnd",
  "vuv",
  "wst",
  "xaf",
  "xcd",
  "xcg",
  "xof",
  "xpf",
  "yer",
  "zar",
  "zmw",
] as const;

export type DiagnosticCategory = (typeof DIAGNOSTIC_CATEGORIES)[number];
export type DiagnosticVerdict = (typeof DIAGNOSTIC_VERDICTS)[number];
export type DiagnosticCheckpoint = (typeof DIAGNOSTIC_CHECKPOINTS)[number];
export type MoneyByCurrency = Record<string, number>;

export type Money = {
  amount: number;
  currency: string;
};

const stripeSupportedCurrencySet = new Set<string>(STRIPE_SUPPORTED_CURRENCIES);

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
  .refine((currency) => stripeSupportedCurrencySet.has(currency), {
    message: "Currency must be a supported Stripe currency.",
  });

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
  classifierVersion: z.string().trim().min(1),
  reason: z.string().trim().min(1),
});

export type DiagnosticFindingInput = z.output<
  typeof diagnosticFindingInputSchema
>;

export const moneyByCurrencySchema = z
  .record(z.string(), minorUnitAmountSchema)
  .transform((amounts) =>
    groupMoneyByCurrency(
      Object.entries(amounts).map(([currency, amount]) => ({
        amount,
        currency,
      })),
    ),
  );

export function normalizeCurrency(currency: string): string {
  if (typeof currency !== "string") {
    throw new Error("Currency must be a supported Stripe currency.");
  }

  const normalizedCurrency = currency.trim().toLowerCase();

  if (!stripeSupportedCurrencySet.has(normalizedCurrency)) {
    throw new Error("Currency must be a supported Stripe currency.");
  }

  return normalizedCurrency;
}

export function groupMoneyByCurrency(
  amounts: readonly Money[],
): MoneyByCurrency {
  return amounts.reduce<MoneyByCurrency>((grouped, amount) => {
    const normalizedAmount = normalizeMoney(amount);
    const total =
      (grouped[normalizedAmount.currency] ?? 0) + normalizedAmount.amount;

    assertMinorUnitAmount(total);
    grouped[normalizedAmount.currency] = total;

    return grouped;
  }, {});
}

export function addMoney(left: Money, right: Money): Money {
  const normalizedLeft = normalizeMoney(left);
  const normalizedRight = normalizeMoney(right);

  if (normalizedLeft.currency !== normalizedRight.currency) {
    throw new Error("Cannot add money in different currencies.");
  }

  const amount = normalizedLeft.amount + normalizedRight.amount;
  assertMinorUnitAmount(amount);

  return {
    amount,
    currency: normalizedLeft.currency,
  };
}

function normalizeMoney(money: Money): Money {
  assertMinorUnitAmount(money.amount);

  return {
    amount: money.amount,
    currency: normalizeCurrency(money.currency),
  };
}

function assertMinorUnitAmount(amount: number): void {
  if (!Number.isSafeInteger(amount) || amount < 0) {
    throw new Error("Money amounts must be non-negative safe integers.");
  }
}
