import {
  diagnosticFinding,
  diagnosticSnapshot,
  stripeConnection,
  type ConnectionPhase,
} from "@dunlo-v2/db/schema/domain";
import { and, eq } from "drizzle-orm";

import Stripe from "stripe";

import {
  ADDRESSABILITY_POLICY_VERSION,
  classifyFailure,
} from "./addressability";
import {
  createEcbReferenceRateAdapter,
  selectDominantCurrency,
  type EcbReferenceRateAdapter,
  type FxRateMetadata,
} from "./fx";
import { qualifyDiagnostic } from "./qualification";
import {
  normalizeRecurringRevenue,
  type RecurringRevenueLine,
} from "./recurring-revenue";
import {
  createStripeDiagnosticSource,
  type Coverage,
  type InvoiceEvidence,
  type PaymentEvidence,
  type StripeReadClient,
  type StripeDiagnosticSource,
  type SubscriptionEvidence,
} from "./stripe-source";
import type {
  DiagnosticCategory,
  DiagnosticCheckpoint,
  DiagnosticFindingInput,
  DiagnosticVerdict,
  MoneyByCurrency,
} from "./types";

const ANALYSIS_WINDOW_DAYS = 90;
const DECISION_WINDOW_DAYS = 30;
const DAY_MS = 86_400_000;

export type DiagnosticConnection = {
  id: string;
  userId: string;
  accessToken: string;
  phase: ConnectionPhase;
};

export type DiagnosticWindow = {
  analysisStartsAt: Date;
  analysisEndsAt: Date;
  decisionStartsAt: Date;
  decisionEndsAt: Date;
};

export type DiagnosticSnapshotView = {
  id: string;
  connectionId: string;
  isCurrent: boolean;
  status: string;
  verdict: DiagnosticVerdict;
  analysisStartsAt: Date;
  analysisEndsAt: Date;
  decisionStartsAt: Date;
  decisionEndsAt: Date;
  decisionWindowComplete: boolean;
  coverageComplete: boolean;
  staleAt: Date | null;
  pagesLoaded: number;
  recordsLoaded: number;
  findingsCount: number;
};

export type DiagnosticProgress = {
  connectionId: string;
  status: "idle" | "running" | "completed" | "failed";
  checkpoints: DiagnosticCheckpoint[];
  errorCategory: "source" | "persistence" | null;
};

export type DiagnosticRunResult = {
  snapshot: DiagnosticSnapshotView;
  phase: ConnectionPhase;
  reused: boolean;
};

type PersistedDiagnosticSnapshot = DiagnosticSnapshotView & {
  userId: string;
  fixedMrr: number;
  variableMrr: number;
  limitedConfidenceMrr: number;
  excludedMrr: number;
  dominantCurrency: string;
  dominantCurrencyShareBps: number;
  observedFailed: number;
  naturallyRecovered: number;
  openAutomatable: number;
  openHuman: number;
  historicallyLostAutomatable: number;
  historicallyLostHuman: number;
  excludedAmount: number;
  monthlyAddressable: number;
  addressableNow: number;
  planCode: string;
  planPriceUsd: number;
  breakEvenUsd: number;
  classifierVersion: string;
  qualificationVersion: string;
  fxSource: string;
  fxSeriesKeys: string[];
  fxRateDate: string;
  fxFetchedAt: Date;
  fxRateToUsd: string;
  failureCategory: string;
};

export type DiagnosticPersistence = {
  snapshot: PersistedDiagnosticSnapshot;
  newFindings: DiagnosticFindingInput[];
  phase: ConnectionPhase;
};

export type DiagnosticRepository = {
  getConnection(connectionId: string): Promise<DiagnosticConnection | null>;
  findSnapshotForWindow(
    connectionId: string,
    window: DiagnosticWindow,
  ): Promise<DiagnosticSnapshotView | null>;
  getCurrent(connectionId: string): Promise<DiagnosticSnapshotView | null>;
  transaction(
    work: (persistence: Pick<DiagnosticRepository, "persist">) => Promise<void>,
  ): Promise<void>;
  persist(input: DiagnosticPersistence): Promise<void>;
};

export type DiagnosticServiceOptions = {
  repository: DiagnosticRepository;
  createSource(connection: DiagnosticConnection): StripeDiagnosticSource;
  fx: EcbReferenceRateAdapter;
};

type DiagnosticRunInput = {
  connectionId: string;
  reason: string;
  now: Date;
};

export class DiagnosticService {
  private readonly progress = new Map<string, DiagnosticProgress>();

  constructor(private readonly options: DiagnosticServiceOptions) {}

  async run(input: DiagnosticRunInput): Promise<DiagnosticRunResult> {
    const window = diagnosticWindow(input.now);
    const connection = await this.options.repository.getConnection(
      input.connectionId,
    );

    if (!connection) {
      throw new Error("Diagnostic connection was not found.");
    }

    const existing = await this.options.repository.findSnapshotForWindow(
      input.connectionId,
      window,
    );

    if (existing) {
      this.progress.set(input.connectionId, {
        connectionId: input.connectionId,
        status: "completed",
        checkpoints: ["snapshot_persisted"],
        errorCategory: null,
      });
      return { snapshot: existing, phase: connection.phase, reused: true };
    }

    this.progress.set(input.connectionId, {
      connectionId: input.connectionId,
      status: "running",
      checkpoints: [],
      errorCategory: null,
    });

    try {
      const source = this.options.createSource(connection);
      const account = await source.loadAccount();
      this.checkpoint(input.connectionId, "account_loaded");

      const subscriptions = await loadAllSubscriptions(source);
      const invoices = await loadAllInvoices(source, window);
      this.checkpoint(input.connectionId, "invoices_loaded");

      const paymentEvidence = await source.loadPaymentEvidence(
        invoices.items.map((invoice) => invoice.id),
      );
      this.checkpoint(input.connectionId, "payment_evidence_loaded");

      const coverage = mergeCoverage([
        account.coverage,
        ...subscriptions.coverages,
        ...invoices.coverages,
        ...paymentEvidence.map((evidence) => evidence.coverage),
      ]);
      const revenue = normalizeRevenue(subscriptions.items, invoices.items);
      const dominant = selectDominantCurrency(
        sumMrr(revenue.fixedMrr, revenue.variableMrr),
      );
      const fx = dominant
        ? await this.options.fx.getRateToUsd(dominant.currency)
        : {
            status: "unavailable" as const,
            reason: "rate_unavailable" as const,
            currency: "usd",
          };
      this.checkpoint(input.connectionId, "revenue_normalized");

      const classified = classifyInvoices(
        invoices.items,
        subscriptions.items,
        paymentEvidence,
        input.now,
      );
      this.checkpoint(input.connectionId, "findings_classified");

      const snapshot = createSnapshot({
        connection,
        window,
        coverage,
        revenue,
        dominant,
        fx: fx.status === "available" ? fx.metadata : null,
        fxFailure: fx.status === "available" ? null : fx.reason,
        classified,
      });
      const phase = phaseFor(snapshot.verdict, connection.phase);

      await this.options.repository.transaction(async (persistence) => {
        await persistence.persist({
          snapshot,
          newFindings: classified.findings,
          phase,
        });
      });
      this.checkpoint(input.connectionId, "snapshot_persisted");
      this.progress.set(input.connectionId, {
        connectionId: input.connectionId,
        status: "completed",
        checkpoints: this.progress.get(input.connectionId)?.checkpoints ?? [],
        errorCategory: null,
      });

      return { snapshot, phase, reused: false };
    } catch (error) {
      const current = this.progress.get(input.connectionId);
      this.progress.set(input.connectionId, {
        connectionId: input.connectionId,
        status: "failed",
        checkpoints: current?.checkpoints ?? [],
        errorCategory: current?.checkpoints.includes("findings_classified")
          ? "persistence"
          : "source",
      });
      throw error;
    }
  }

  async getCurrent(
    connectionId: string,
  ): Promise<DiagnosticSnapshotView | null> {
    return this.options.repository.getCurrent(connectionId);
  }

  async getProgress(connectionId: string): Promise<DiagnosticProgress> {
    return (
      this.progress.get(connectionId) ?? {
        connectionId,
        status: "idle",
        checkpoints: [],
        errorCategory: null,
      }
    );
  }

  private checkpoint(
    connectionId: string,
    checkpoint: DiagnosticCheckpoint,
  ): void {
    const current = this.progress.get(connectionId);
    if (!current) return;
    current.checkpoints.push(checkpoint);
  }
}

export function createDiagnosticService(): DiagnosticService {
  return new DiagnosticService({
    repository: createDatabaseRepository(),
    createSource: (connection) =>
      createStripeDiagnosticSource(
        new Stripe(connection.accessToken, {
          apiVersion: "2024-12-18.acacia" as Stripe.LatestApiVersion,
          typescript: true,
        }) as unknown as StripeReadClient,
      ),
    fx: createEcbReferenceRateAdapter({
      fetch: (input) => fetch(input),
      now: () => new Date(),
    }),
  });
}

function diagnosticWindow(now: Date): DiagnosticWindow {
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  );
  return {
    analysisStartsAt: new Date(end.getTime() - ANALYSIS_WINDOW_DAYS * DAY_MS),
    analysisEndsAt: end,
    decisionStartsAt: new Date(end.getTime() - DECISION_WINDOW_DAYS * DAY_MS),
    decisionEndsAt: end,
  };
}

async function loadAllSubscriptions(source: StripeDiagnosticSource): Promise<{
  items: SubscriptionEvidence[];
  coverages: Coverage[];
}> {
  const items: SubscriptionEvidence[] = [];
  const coverages: Coverage[] = [];
  let cursor: string | undefined;

  do {
    const page = await source.loadSubscriptions(cursor);
    items.push(...page.data);
    coverages.push(page.coverage);
    if (page.coverage.status === "partial") break;
    cursor = page.nextCursor ?? undefined;
  } while (cursor);

  return { items, coverages };
}

async function loadAllInvoices(
  source: StripeDiagnosticSource,
  window: DiagnosticWindow,
): Promise<{ items: InvoiceEvidence[]; coverages: Coverage[] }> {
  const items: InvoiceEvidence[] = [];
  const coverages: Coverage[] = [];
  let cursor: string | undefined;
  const range = {
    start: Math.floor(window.analysisStartsAt.getTime() / 1000),
    end: Math.floor(window.analysisEndsAt.getTime() / 1000),
  };

  do {
    const page = await source.loadInvoices(range, cursor);
    items.push(...page.data);
    coverages.push(page.coverage);
    if (page.coverage.status === "partial") break;
    cursor = page.nextCursor ?? undefined;
  } while (cursor);

  return { items, coverages };
}

function mergeCoverage(coverages: Coverage[]): Coverage {
  const pageCount = coverages.reduce(
    (total, coverage) => total + coverage.pageCount,
    0,
  );
  const recordCount = coverages.reduce(
    (total, coverage) => total + coverage.recordCount,
    0,
  );
  const partial = coverages.find((coverage) => coverage.status === "partial");

  return partial && partial.status === "partial"
    ? { status: "partial", pageCount, recordCount, failure: partial.failure }
    : { status: "complete", pageCount, recordCount };
}

function normalizeRevenue(
  subscriptions: SubscriptionEvidence[],
  invoices: InvoiceEvidence[],
) {
  const invoicesBySubscription = new Map<string, InvoiceEvidence[]>();
  for (const invoice of invoices) {
    if (!invoice.subscriptionId) continue;
    invoicesBySubscription.set(invoice.subscriptionId, [
      ...(invoicesBySubscription.get(invoice.subscriptionId) ?? []),
      invoice,
    ]);
  }

  return normalizeRecurringRevenue({
    subscriptions: subscriptions.map((subscription) => ({
      id: subscription.id,
      status: subscription.status,
      lines: subscription.items.map(toRecurringLine),
      finalizedInvoices: (
        invoicesBySubscription.get(subscription.id) ?? []
      ).map((invoice) => ({
        id: invoice.id,
        status: invoice.status ?? "unknown",
        finalizedAt: new Date(
          invoice.finalizedAt ?? invoice.createdAt ?? 0,
        ).toISOString(),
        lines: invoice.lines.map(toRecurringLine),
      })),
    })),
  });
}

function toRecurringLine(line: Record<string, unknown>): RecurringRevenueLine {
  const price = objectValue(line.price);
  const recurring = objectValue(price?.recurring);
  const amount = numberValue(line.amount) ?? 0;
  const type = stringValue(line.type);
  const priceType = stringValue(price?.type);
  const usageType = stringValue(recurring?.usage_type);
  const kind =
    type === "tax"
      ? "tax"
      : amount < 0
        ? type === "refund"
          ? "refund"
          : "credit"
        : priceType === "recurring"
          ? "recurring"
          : "one_off";

  return {
    amount: Math.max(0, amount),
    discountAmount: discountAmount(line),
    currency: stringValue(line.currency) ?? "usd",
    kind,
    pricing: usageType === "metered" ? "metered" : "fixed",
    interval: intervalValue(stringValue(recurring?.interval)),
    intervalCount: numberValue(recurring?.interval_count) ?? 1,
  };
}

function classifyInvoices(
  invoices: InvoiceEvidence[],
  subscriptions: SubscriptionEvidence[],
  paymentEvidence: PaymentEvidence[],
  now: Date,
): {
  findings: DiagnosticFindingInput[];
  categoryAmounts: Record<DiagnosticCategory, number>;
  monthlyAddressableByCurrency: MoneyByCurrency;
  addressableNowByCurrency: MoneyByCurrency;
} {
  const subscriptionsById = new Map(
    subscriptions.map((subscription) => [subscription.id, subscription]),
  );
  const paymentsByInvoice = new Map(
    paymentEvidence.map((evidence) => [evidence.invoiceId, evidence]),
  );
  const categoryAmounts = emptyCategoryAmounts();
  const monthlyAddressableByCurrency: MoneyByCurrency = {};
  const addressableNowByCurrency: MoneyByCurrency = {};
  const findings: DiagnosticFindingInput[] = [];

  for (const invoice of invoices) {
    if (
      !invoice.customerId ||
      invoice.amountDue === null ||
      invoice.amountDue < 0 ||
      !invoice.currency ||
      !invoice.status
    ) {
      continue;
    }

    const subscription = invoice.subscriptionId
      ? subscriptionsById.get(invoice.subscriptionId)
      : undefined;
    const payment = paymentsByInvoice.get(invoice.id);
    const classification = classifyFailure({
      invoiceStatus: invoice.status,
      subscriptionStatus: subscription?.status ?? null,
      isRecurring: Boolean(invoice.subscriptionId),
      adviceCode: payment?.adviceCode ?? null,
      declineCode: payment?.declineCode ?? null,
      errorCode: payment?.errorCode ?? null,
      isVoluntaryCancellation: false,
      hasLegitimatePaymentAction: Boolean(invoice.customerId),
      hasInvoluntaryFailureEvidence: Boolean(
        payment?.adviceCode || payment?.declineCode || payment?.errorCode,
      ),
      recoveredAfterFailure: invoice.status === "paid" && Boolean(payment),
    });
    const failedAt = new Date(
      invoice.finalizedAt ?? invoice.createdAt ?? now.getTime(),
    ).toISOString();
    const finding: DiagnosticFindingInput = {
      stripeInvoiceId: invoice.id,
      stripeCustomerId: invoice.customerId,
      stripeSubscriptionId: invoice.subscriptionId,
      amount: invoice.amountDue,
      currency: invoice.currency,
      failedAt,
      resolvedAt: invoice.status === "paid" ? failedAt : null,
      invoiceStatus: invoice.status,
      subscriptionStatus: subscription?.status ?? null,
      adviceCode: payment?.adviceCode ?? null,
      declineCode: payment?.declineCode ?? null,
      category: classification.category,
      classifierVersion: ADDRESSABILITY_POLICY_VERSION,
      reason: classification.reasonCode,
    };
    findings.push(finding);
    categoryAmounts[classification.category] += invoice.amountDue;

    if (classification.category === "open_automatable") {
      addCurrencyAmount(
        monthlyAddressableByCurrency,
        invoice.currency,
        invoice.amountDue,
      );
      addCurrencyAmount(
        addressableNowByCurrency,
        invoice.currency,
        invoice.amountDue,
      );
    }
    if (classification.category === "historically_lost_automatable") {
      addCurrencyAmount(
        monthlyAddressableByCurrency,
        invoice.currency,
        invoice.amountDue,
      );
    }
  }

  return {
    findings,
    categoryAmounts,
    monthlyAddressableByCurrency,
    addressableNowByCurrency,
  };
}

function createSnapshot(input: {
  connection: DiagnosticConnection;
  window: DiagnosticWindow;
  coverage: Coverage;
  revenue: ReturnType<typeof normalizeRevenue>;
  dominant: ReturnType<typeof selectDominantCurrency>;
  fx: FxRateMetadata | null;
  fxFailure: string | null;
  classified: ReturnType<typeof classifyInvoices>;
}): PersistedDiagnosticSnapshot {
  const currency = input.dominant?.currency ?? "usd";
  const rate = input.fx?.rateToUsd ?? 0;
  const fixedMrr = input.revenue.fixedMrr[currency] ?? 0;
  const variableMrr = input.revenue.variableMrr[currency] ?? 0;
  const limitedConfidenceMrr =
    input.revenue.limitedConfidenceMrr[currency] ?? 0;
  const excludedMrr = input.revenue.excludedMrr[currency] ?? 0;
  const monthlyAddressable = toUsd(
    input.classified.monthlyAddressableByCurrency[currency] ?? 0,
    rate,
  );
  const addressableNow = toUsd(
    input.classified.addressableNowByCurrency[currency] ?? 0,
    rate,
  );
  const qualification = qualifyDiagnostic({
    coverageComplete: input.coverage.status === "complete",
    decisionWindowComplete: input.coverage.status === "complete",
    dominantCurrency: input.dominant?.currency ?? null,
    normalizedMrrUsd: input.fx ? toUsd(fixedMrr + variableMrr, rate) : null,
    monthlyAddressableUsd: monthlyAddressable,
    addressableNowUsd: addressableNow,
    fxRateToUsd: input.fx?.rateToUsd ?? null,
  });
  const metadata =
    input.fx ?? unavailableFxMetadata(input.window.analysisEndsAt);

  return {
    id: crypto.randomUUID(),
    connectionId: input.connection.id,
    userId: input.connection.userId,
    isCurrent: true,
    status: input.coverage.status === "complete" ? "complete" : "partial",
    verdict: qualification.verdict,
    ...input.window,
    decisionWindowComplete: input.coverage.status === "complete",
    coverageComplete: input.coverage.status === "complete",
    staleAt: new Date(input.window.analysisEndsAt.getTime() + DAY_MS),
    pagesLoaded: input.coverage.pageCount,
    recordsLoaded: input.coverage.recordCount,
    findingsCount: input.classified.findings.length,
    fixedMrr: toUsd(fixedMrr, rate),
    variableMrr: toUsd(variableMrr, rate),
    limitedConfidenceMrr: toUsd(limitedConfidenceMrr, rate),
    excludedMrr: toUsd(excludedMrr, rate),
    dominantCurrency: currency,
    dominantCurrencyShareBps: input.dominant?.shareBps ?? 0,
    observedFailed: input.classified.findings.length,
    naturallyRecovered: input.classified.categoryAmounts.naturally_recovered,
    openAutomatable: input.classified.categoryAmounts.open_automatable,
    openHuman: input.classified.categoryAmounts.open_human,
    historicallyLostAutomatable:
      input.classified.categoryAmounts.historically_lost_automatable,
    historicallyLostHuman:
      input.classified.categoryAmounts.historically_lost_human,
    excludedAmount: input.classified.categoryAmounts.excluded,
    monthlyAddressable,
    addressableNow,
    planCode: qualification.planCode ?? "insufficient_data",
    planPriceUsd: qualification.planPriceUsd ?? 0,
    breakEvenUsd: qualification.breakEvenUsd ?? 0,
    classifierVersion: ADDRESSABILITY_POLICY_VERSION,
    qualificationVersion: qualification.policyVersion,
    fxSource: metadata.source,
    fxSeriesKeys: metadata.seriesKeys,
    fxRateDate: metadata.rateDate,
    fxFetchedAt: new Date(metadata.fetchedAt),
    fxRateToUsd: String(metadata.rateToUsd),
    failureCategory:
      input.fxFailure ??
      (input.coverage.status === "partial"
        ? input.coverage.failure.code
        : "none"),
  };
}

function phaseFor(
  verdict: DiagnosticVerdict,
  prior: ConnectionPhase,
): ConnectionPhase {
  if (verdict === "activation_recommended") return "diagnostic_ready";
  if (verdict === "monitoring_recommended") return "monitoring";
  return prior;
}

function createDatabaseRepository(): DiagnosticRepository {
  return {
    async getConnection(connectionId) {
      const database = await loadDb();
      const [row] = await database
        .select({
          id: stripeConnection.id,
          userId: stripeConnection.userId,
          accessToken: stripeConnection.accessToken,
          phase: stripeConnection.phase,
        })
        .from(stripeConnection)
        .where(eq(stripeConnection.id, connectionId))
        .limit(1);
      if (!row) return null;
      const { decrypt } = await import("@dunlo-v2/db/encrypt");
      return { ...row, accessToken: decrypt(row.accessToken) };
    },
    async findSnapshotForWindow(connectionId, window) {
      const database = await loadDb();
      const [row] = await database
        .select()
        .from(diagnosticSnapshot)
        .where(
          and(
            eq(diagnosticSnapshot.connectionId, connectionId),
            eq(diagnosticSnapshot.analysisStartsAt, window.analysisStartsAt),
            eq(diagnosticSnapshot.analysisEndsAt, window.analysisEndsAt),
          ),
        )
        .limit(1);
      return row ? snapshotView(row) : null;
    },
    async getCurrent(connectionId) {
      const database = await loadDb();
      const [row] = await database
        .select()
        .from(diagnosticSnapshot)
        .where(
          and(
            eq(diagnosticSnapshot.connectionId, connectionId),
            eq(diagnosticSnapshot.isCurrent, true),
          ),
        )
        .limit(1);
      return row ? snapshotView(row) : null;
    },
    async transaction(work) {
      const database = await loadDb();
      await database.transaction(async (transaction) => {
        await work(databasePersistence(transaction));
      });
    },
    async persist() {
      throw new Error("Diagnostic persistence must execute in a transaction.");
    },
  };
}

async function loadDb() {
  const module = await import("@dunlo-v2/db");
  return module.db;
}

function databasePersistence(
  executor: any,
): Pick<DiagnosticRepository, "persist"> {
  return {
    async persist({ snapshot, newFindings, phase }) {
      await executor
        .update(diagnosticSnapshot)
        .set({ isCurrent: false })
        .where(
          and(
            eq(diagnosticSnapshot.connectionId, snapshot.connectionId),
            eq(diagnosticSnapshot.isCurrent, true),
          ),
        );
      await executor.insert(diagnosticSnapshot).values(snapshot);
      if (newFindings.length > 0) {
        await executor.insert(diagnosticFinding).values(
          newFindings.map((finding) => ({
            id: crypto.randomUUID(),
            snapshotId: snapshot.id,
            connectionId: snapshot.connectionId,
            stripeInvoiceId: finding.stripeInvoiceId,
            stripeCustomerId: finding.stripeCustomerId,
            stripeSubscriptionId: finding.stripeSubscriptionId,
            amount: finding.amount,
            currency: finding.currency,
            failedAt: new Date(finding.failedAt),
            resolvedAt: finding.resolvedAt
              ? new Date(finding.resolvedAt)
              : null,
            invoiceStatus: finding.invoiceStatus,
            subscriptionStatus: finding.subscriptionStatus,
            adviceCode: finding.adviceCode,
            declineCode: finding.declineCode,
            category: finding.category,
            reason: finding.reason,
            classifierVersion: finding.classifierVersion,
          })),
        );
      }
      await executor
        .update(stripeConnection)
        .set({ phase, lastAnalyzedAt: snapshot.analysisEndsAt })
        .where(eq(stripeConnection.id, snapshot.connectionId));
    },
  };
}

function snapshotView(
  row: typeof diagnosticSnapshot.$inferSelect,
): DiagnosticSnapshotView {
  return {
    id: row.id,
    connectionId: row.connectionId,
    isCurrent: row.isCurrent,
    status: row.status,
    verdict: row.verdict as DiagnosticVerdict,
    analysisStartsAt: row.analysisStartsAt,
    analysisEndsAt: row.analysisEndsAt,
    decisionStartsAt: row.decisionStartsAt,
    decisionEndsAt: row.decisionEndsAt,
    decisionWindowComplete: row.decisionWindowComplete,
    coverageComplete: row.coverageComplete,
    staleAt: row.staleAt,
    pagesLoaded: row.pagesLoaded,
    recordsLoaded: row.recordsLoaded,
    findingsCount: 0,
  };
}

function sumMrr(
  left: MoneyByCurrency,
  right: MoneyByCurrency,
): MoneyByCurrency {
  const result = { ...left };
  for (const [currency, amount] of Object.entries(right)) {
    result[currency] = (result[currency] ?? 0) + amount;
  }
  return result;
}

function emptyCategoryAmounts(): Record<DiagnosticCategory, number> {
  return {
    naturally_recovered: 0,
    open_automatable: 0,
    open_human: 0,
    historically_lost_automatable: 0,
    historically_lost_human: 0,
    excluded: 0,
  };
}

function addCurrencyAmount(
  amounts: MoneyByCurrency,
  currency: string,
  amount: number,
): void {
  const normalized = currency.trim().toLowerCase();
  amounts[normalized] = (amounts[normalized] ?? 0) + amount;
}

function unavailableFxMetadata(now: Date): FxRateMetadata {
  return {
    source: "identity",
    seriesKeys: [],
    rateDate: now.toISOString().slice(0, 10),
    fetchedAt: now.toISOString(),
    rateToUsd: 0,
  };
}

function toUsd(amount: number, rate: number): number {
  return rate > 0 ? Math.round(amount * rate) : 0;
}

function objectValue(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function numberValue(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function intervalValue(value: string | null): RecurringRevenueLine["interval"] {
  return value === "day" || value === "week" || value === "year"
    ? value
    : "month";
}

function discountAmount(line: Record<string, unknown>): number | undefined {
  const discounts = Array.isArray(line.discount_amounts)
    ? line.discount_amounts
    : [];
  const amount = discounts.reduce(
    (total, discount) =>
      total + (numberValue(objectValue(discount)?.amount) ?? 0),
    0,
  );
  return amount > 0 ? amount : undefined;
}
