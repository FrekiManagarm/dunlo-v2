export type StripeMode = "live" | "test";

export type TimeWindow = {
  start: number;
  end: number;
};

export type CoverageFailure = {
  code: "stripe_rate_limited";
  cursor: string | null;
};

export type Coverage =
  | {
      status: "complete";
      pageCount: number;
      recordCount: number;
    }
  | {
      status: "partial";
      pageCount: number;
      recordCount: number;
      failure: CoverageFailure;
    };

export type Page<T> = {
  data: T[];
  hasMore: boolean;
  nextCursor: string | null;
  coverage: Coverage;
};

export type AccountEvidence = {
  id: string | null;
  mode: StripeMode | null;
  country: string | null;
  defaultCurrency: string | null;
  createdAt: number | null;
  coverage: Coverage;
};

export type SubscriptionEvidence = {
  id: string;
  status: string;
  mode: StripeMode;
  items: StripeInvoiceLine[];
};

export type InvoiceLineEvidence = StripeInvoiceLine;

export type InvoiceEvidence = {
  id: string;
  subscriptionId: string | null;
  paymentIntentId: string | null;
  customerId: string | null;
  status: string | null;
  amountDue: number | null;
  currency: string | null;
  createdAt: number | null;
  finalizedAt: number | null;
  mode: StripeMode;
  lines: InvoiceLineEvidence[];
};

export type PaymentEvidence = {
  invoiceId: string;
  paymentIntentId: string | null;
  chargeId: string | null;
  failureCode: string | null;
  declineCode: string | null;
  adviceCode: string | null;
  mode: StripeMode;
  coverage: Coverage;
};

export interface StripeDiagnosticSource {
  loadAccount(): Promise<AccountEvidence>;
  loadSubscriptions(cursor?: string): Promise<Page<SubscriptionEvidence>>;
  loadInvoices(
    window: TimeWindow,
    cursor?: string,
  ): Promise<Page<InvoiceEvidence>>;
  loadPaymentEvidence(invoiceIds: string[]): Promise<PaymentEvidence[]>;
}

type StripeObject = {
  id: string;
  livemode?: boolean;
  [key: string]: unknown;
};

type StripeInvoiceLine = StripeObject;

type StripeList<T> = {
  data: T[];
  has_more: boolean;
};

type StripeSubscription = StripeObject & {
  status: string;
  items?: StripeList<StripeInvoiceLine>;
};

type StripeInvoice = StripeObject & {
  subscription?: string | StripeObject | null;
  payment_intent?: string | StripeObject | null;
  lines?: StripeList<StripeInvoiceLine>;
};

type StripePaymentIntent = StripeObject & {
  latest_charge?: string | StripeObject | null;
};

export type StripeReadClient = {
  accounts: {
    retrieve(): Promise<StripeObject>;
  };
  subscriptions: {
    list(
      params: Record<string, unknown>,
    ): Promise<StripeList<StripeSubscription>>;
  };
  invoices: {
    list(params: Record<string, unknown>): Promise<StripeList<StripeInvoice>>;
    listLineItems(
      invoiceId: string,
      params: Record<string, unknown>,
    ): Promise<StripeList<StripeInvoiceLine>>;
  };
  paymentIntents: {
    retrieve(paymentIntentId: string): Promise<StripePaymentIntent>;
  };
  charges: {
    retrieve(chargeId: string): Promise<StripeObject>;
  };
};

type RetryOptions = {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
};

type StripeDiagnosticSourceOptions = {
  retry?: Partial<RetryOptions>;
  sleep?: (milliseconds: number) => Promise<void>;
};

const DEFAULT_RETRY: RetryOptions = {
  maxAttempts: 3,
  baseDelayMs: 250,
  maxDelayMs: 2_000,
};

const completeCoverage = (
  pageCount: number,
  recordCount: number,
): Coverage => ({
  status: "complete",
  pageCount,
  recordCount,
});

const partialCoverage = (
  pageCount: number,
  recordCount: number,
  cursor: string | null,
): Coverage => ({
  status: "partial",
  pageCount,
  recordCount,
  failure: {
    code: "stripe_rate_limited",
    cursor,
  },
});

export function createStripeDiagnosticSource(
  client: StripeReadClient,
  options: StripeDiagnosticSourceOptions = {},
): StripeDiagnosticSource {
  const retry = normalizeRetryOptions(options.retry);
  const sleep = options.sleep ?? defaultSleep;
  const includedInvoices = new Map<string, InvoiceEvidence>();

  return {
    async loadAccount(): Promise<AccountEvidence> {
      const outcome = await retryRateLimit(
        () => client.accounts.retrieve(),
        retry,
        sleep,
      );

      if ("failure" in outcome) {
        return {
          id: null,
          mode: null,
          country: null,
          defaultCurrency: null,
          createdAt: null,
          coverage: partialCoverage(0, 0, null),
        };
      }

      const account = outcome.value;
      return {
        id: account.id,
        mode: modeOf(account),
        country: stringOrNull(account.country),
        defaultCurrency: stringOrNull(account.default_currency),
        createdAt: numberOrNull(account.created),
        coverage: completeCoverage(1, 1),
      };
    },

    async loadSubscriptions(
      cursor?: string,
    ): Promise<Page<SubscriptionEvidence>> {
      const outcome = await retryRateLimit(
        () =>
          client.subscriptions.list(
            withCursor(cursor, {
              limit: 100,
              status: "all",
              expand: ["data.items.data.price"],
            }),
          ),
        retry,
        sleep,
      );

      if ("failure" in outcome) {
        return partialPage(cursor);
      }

      const subscriptions = outcome.value.data.map((subscription) => ({
        id: subscription.id,
        status: subscription.status,
        mode: modeOf(subscription),
        items: subscription.items?.data ?? [],
      }));

      return pageFrom(
        outcome.value,
        subscriptions,
        completeCoverage(1, subscriptions.length),
      );
    },

    async loadInvoices(
      window: TimeWindow,
      cursor?: string,
    ): Promise<Page<InvoiceEvidence>> {
      const outcome = await retryRateLimit(
        () =>
          client.invoices.list(
            withCursor(cursor, {
              limit: 100,
              created: { gte: window.start, lte: window.end },
              expand: ["data.lines"],
            }),
          ),
        retry,
        sleep,
      );

      if ("failure" in outcome) {
        return partialPage(cursor);
      }

      const sourcePage = outcome.value;
      const invoices: InvoiceEvidence[] = [];
      let pageCount = 1;
      let recordCount = 0;

      for (const invoice of sourcePage.data) {
        const subscriptionId = idOrNull(invoice.subscription);
        if (!subscriptionId) {
          continue;
        }

        const lines = await loadAllInvoiceLines(invoice, client, retry, sleep);
        pageCount += lines.pageCount;
        recordCount += lines.lines.length;

        if (lines.failure) {
          return {
            data: [],
            hasMore: false,
            nextCursor: cursor ?? null,
            coverage: partialCoverage(pageCount, recordCount, cursor ?? null),
          };
        }

        const evidence: InvoiceEvidence = {
          id: invoice.id,
          subscriptionId,
          paymentIntentId: idOrNull(invoice.payment_intent),
          customerId: idOrNull(invoice.customer),
          status: stringOrNull(invoice.status),
          amountDue: numberOrNull(invoice.amount_due),
          currency: stringOrNull(invoice.currency),
          createdAt: numberOrNull(invoice.created),
          finalizedAt: numberOrNull(
            objectValue(invoice.status_transitions, "finalized_at"),
          ),
          mode: modeOf(invoice),
          lines: lines.lines,
        };

        invoices.push(evidence);
        includedInvoices.set(evidence.id, evidence);
      }

      return pageFrom(
        sourcePage,
        invoices,
        completeCoverage(pageCount, recordCount + invoices.length),
      );
    },

    async loadPaymentEvidence(
      invoiceIds: string[],
    ): Promise<PaymentEvidence[]> {
      const evidence: PaymentEvidence[] = [];

      for (const invoiceId of invoiceIds) {
        const invoice = includedInvoices.get(invoiceId);
        if (!invoice || !invoice.paymentIntentId) {
          continue;
        }

        const paymentIntent = await retryRateLimit(
          () =>
            client.paymentIntents.retrieve(invoice.paymentIntentId as string),
          retry,
          sleep,
        );

        if ("failure" in paymentIntent) {
          evidence.push(partialPaymentEvidence(invoice));
          continue;
        }

        const chargeId = idOrNull(paymentIntent.value.latest_charge);
        if (!chargeId) {
          evidence.push({
            invoiceId,
            paymentIntentId: paymentIntent.value.id,
            chargeId: null,
            failureCode: stringOrNull(
              paymentIntent.value.last_payment_error &&
                objectValue(paymentIntent.value.last_payment_error, "code"),
            ),
            declineCode: stringOrNull(
              paymentIntent.value.last_payment_error &&
                objectValue(
                  paymentIntent.value.last_payment_error,
                  "decline_code",
                ),
            ),
            adviceCode: stringOrNull(
              paymentIntent.value.last_payment_error &&
                objectValue(
                  paymentIntent.value.last_payment_error,
                  "advice_code",
                ),
            ),
            mode: modeOf(paymentIntent.value),
            coverage: completeCoverage(1, 1),
          });
          continue;
        }

        const charge = await retryRateLimit(
          () => client.charges.retrieve(chargeId),
          retry,
          sleep,
        );

        if ("failure" in charge) {
          evidence.push(
            partialPaymentEvidence(invoice, paymentIntent.value.id, chargeId),
          );
          continue;
        }

        evidence.push({
          invoiceId,
          paymentIntentId: paymentIntent.value.id,
          chargeId: charge.value.id,
          failureCode: stringOrNull(charge.value.failure_code),
          declineCode: stringOrNull(charge.value.failure_code),
          adviceCode: stringOrNull(
            charge.value.outcome &&
              objectValue(charge.value.outcome, "advice_code"),
          ),
          mode: modeOf(charge.value),
          coverage: completeCoverage(2, 2),
        });
      }

      return evidence;
    },
  };
}

function partialPage<T>(cursor?: string): Page<T> {
  return {
    data: [],
    hasMore: false,
    nextCursor: cursor ?? null,
    coverage: partialCoverage(0, 0, cursor ?? null),
  };
}

function partialPaymentEvidence(
  invoice: InvoiceEvidence,
  paymentIntentId = invoice.paymentIntentId,
  chargeId: string | null = null,
): PaymentEvidence {
  return {
    invoiceId: invoice.id,
    paymentIntentId,
    chargeId,
    failureCode: null,
    declineCode: null,
    adviceCode: null,
    mode: invoice.mode,
    coverage: partialCoverage(0, 0, invoice.id),
  };
}

function pageFrom<T extends { id: string }>(
  sourcePage: StripeList<StripeObject>,
  data: T[],
  coverage: Coverage,
): Page<T> {
  const nextCursor = sourcePage.data.at(-1)?.id ?? null;

  return {
    data,
    hasMore: sourcePage.has_more,
    nextCursor: sourcePage.has_more ? nextCursor : null,
    coverage,
  };
}

async function loadAllInvoiceLines(
  invoice: StripeInvoice,
  client: StripeReadClient,
  retry: RetryOptions,
  sleep: (milliseconds: number) => Promise<void>,
): Promise<{
  lines: InvoiceLineEvidence[];
  pageCount: number;
  failure: boolean;
}> {
  const lines = [...(invoice.lines?.data ?? [])];
  let pageCount = 0;
  let hasMore = invoice.lines?.has_more ?? false;
  let cursor = lines.at(-1)?.id;

  while (hasMore) {
    const outcome = await retryRateLimit(
      () =>
        client.invoices.listLineItems(
          invoice.id,
          withCursor(cursor, { limit: 100 }),
        ),
      retry,
      sleep,
    );

    if ("failure" in outcome) {
      return { lines, pageCount, failure: true };
    }

    pageCount += 1;
    lines.push(...outcome.value.data);
    hasMore = outcome.value.has_more;
    cursor = outcome.value.data.at(-1)?.id;
  }

  return { lines, pageCount, failure: false };
}

function withCursor(
  cursor: string | undefined,
  params: Record<string, unknown>,
): Record<string, unknown> {
  return cursor ? { ...params, starting_after: cursor } : params;
}

function modeOf(object: StripeObject): StripeMode {
  return object.livemode ? "live" : "test";
}

function idOrNull(value: unknown): string | null {
  if (typeof value === "string") {
    return value;
  }

  return value &&
    typeof value === "object" &&
    "id" in value &&
    typeof value.id === "string"
    ? value.id
    : null;
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function numberOrNull(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

function objectValue(value: unknown, key: string): unknown {
  return value && typeof value === "object" && key in value
    ? (value as Record<string, unknown>)[key]
    : null;
}

function normalizeRetryOptions(
  retry: Partial<RetryOptions> | undefined,
): RetryOptions {
  const options = { ...DEFAULT_RETRY, ...retry };

  if (
    !Number.isInteger(options.maxAttempts) ||
    options.maxAttempts < 1 ||
    options.baseDelayMs < 0 ||
    options.maxDelayMs < options.baseDelayMs
  ) {
    throw new Error("Invalid Stripe diagnostic retry configuration.");
  }

  return options;
}

async function retryRateLimit<T>(
  operation: () => Promise<T>,
  retry: RetryOptions,
  sleep: (milliseconds: number) => Promise<void>,
): Promise<{ value: T } | { failure: true }> {
  for (let attempt = 1; attempt <= retry.maxAttempts; attempt += 1) {
    try {
      return { value: await operation() };
    } catch (error) {
      if (!isRateLimitError(error)) {
        throw error;
      }

      if (attempt === retry.maxAttempts) {
        return { failure: true };
      }

      const delay = Math.min(
        retry.baseDelayMs * 2 ** (attempt - 1),
        retry.maxDelayMs,
      );
      await sleep(delay);
    }
  }

  return { failure: true };
}

function isRateLimitError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (("statusCode" in error && error.statusCode === 429) ||
      ("status" in error && error.status === 429))
  );
}

function defaultSleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
