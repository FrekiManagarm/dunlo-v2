import {
  normalizeCurrency,
  type MoneyByCurrency,
} from "./types";

export type RecurringRevenueLineKind =
  | "recurring"
  | "one_off"
  | "tax"
  | "credit"
  | "refund";

export type RecurringRevenuePricing = "fixed" | "metered";
export type RecurringRevenueInterval = "day" | "week" | "month" | "year";

export type RecurringRevenueLine = {
  amount: number;
  discountAmount?: number;
  currency: string;
  kind: RecurringRevenueLineKind;
  pricing: RecurringRevenuePricing;
  interval: RecurringRevenueInterval;
  intervalCount: number;
};

export type RecurringRevenueInvoice = {
  id: string;
  finalizedAt: string;
  status: string;
  lines: readonly RecurringRevenueLine[];
};

export type RecurringRevenueSubscription = {
  id: string;
  status: string;
  lines: readonly RecurringRevenueLine[];
  finalizedInvoices: readonly RecurringRevenueInvoice[];
};

export type RecurringRevenueInput = {
  subscriptions: readonly RecurringRevenueSubscription[];
};

export type RecurringRevenueResult = {
  fixedMrr: MoneyByCurrency;
  variableMrr: MoneyByCurrency;
  limitedConfidenceMrr: MoneyByCurrency;
  excludedMrr: MoneyByCurrency;
};

const activeSubscriptionStatuses = new Set(["active", "past_due"]);
const finalInvoiceStatuses = new Set(["open", "paid", "uncollectible", "void"]);
const monthlyIntervalFactors: Record<RecurringRevenueInterval, number> = {
  day: 365 / 12,
  week: 52 / 12,
  month: 1,
  year: 12,
};

export function normalizeRecurringRevenue(
  input: RecurringRevenueInput,
): RecurringRevenueResult {
  const result: RecurringRevenueResult = {
    fixedMrr: {},
    variableMrr: {},
    limitedConfidenceMrr: {},
    excludedMrr: {},
  };

  for (const subscription of input.subscriptions) {
    const isCurrent = activeSubscriptionStatuses.has(subscription.status);

    for (const line of subscription.lines) {
      if (line.kind !== "recurring" || line.pricing !== "fixed") {
        continue;
      }

      const amount = normalizeFixedMrr(line);
      addAmount(isCurrent ? result.fixedMrr : result.excludedMrr, line.currency, amount);
    }

    const variableMrr = normalizeVariableMrr(subscription.finalizedInvoices);

    for (const [currency, amount] of Object.entries(variableMrr.amounts)) {
      addAmount(
        isCurrent ? result.variableMrr : result.excludedMrr,
        currency,
        amount,
      );

      if (isCurrent && variableMrr.isLimitedConfidence) {
        addAmount(result.limitedConfidenceMrr, currency, amount);
      }
    }
  }

  return result;
}

function normalizeFixedMrr(line: RecurringRevenueLine): number {
  const amount = netLineAmount(line);
  const intervalMonths = line.intervalCount * monthlyIntervalFactors[line.interval];

  assertPositiveSafeInteger(line.intervalCount, "Interval count");

  return Math.round(amount / intervalMonths);
}

function normalizeVariableMrr(
  invoices: readonly RecurringRevenueInvoice[],
): { amounts: MoneyByCurrency; isLimitedConfidence: boolean } {
  const latestInvoices = invoices
    .filter((invoice) => finalInvoiceStatuses.has(invoice.status))
    .slice()
    .sort((left, right) => right.finalizedAt.localeCompare(left.finalizedAt))
    .slice(0, 3);

  if (latestInvoices.length === 0) {
    return { amounts: {}, isLimitedConfidence: false };
  }

  const totals: MoneyByCurrency = {};

  for (const invoice of latestInvoices) {
    for (const line of invoice.lines) {
      if (line.kind !== "recurring" || line.pricing !== "metered") {
        continue;
      }

      addAmount(totals, line.currency, netLineAmount(line));
    }
  }

  return {
    amounts: Object.fromEntries(
      Object.entries(totals).map(([currency, amount]) => [
        currency,
        Math.round(amount / latestInvoices.length),
      ]),
    ),
    isLimitedConfidence: latestInvoices.length < 3,
  };
}

function netLineAmount(line: RecurringRevenueLine): number {
  assertNonNegativeSafeInteger(line.amount, "Line amount");
  const discountAmount = line.discountAmount ?? 0;
  assertNonNegativeSafeInteger(discountAmount, "Discount amount");

  if (discountAmount > line.amount) {
    throw new Error("Discount amount cannot exceed line amount.");
  }

  return line.amount - discountAmount;
}

function addAmount(
  amounts: MoneyByCurrency,
  currency: string,
  amount: number,
): void {
  const normalizedCurrency = normalizeCurrency(currency);
  const total = (amounts[normalizedCurrency] ?? 0) + amount;

  assertNonNegativeSafeInteger(total, "MRR amount");
  amounts[normalizedCurrency] = total;
}

function assertPositiveSafeInteger(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${label} must be a positive safe integer.`);
  }
}

function assertNonNegativeSafeInteger(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative safe integer.`);
  }
}
