import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

import {
  DiagnosticService,
  type DiagnosticConnection,
  type DiagnosticRepository,
  type DiagnosticSnapshotView,
} from "./service";
import type {
  AccountEvidence,
  Coverage,
  Page,
  StripeDiagnosticSource,
} from "./stripe-source";

const NOW = new Date("2026-07-19T12:00:00.000Z");

function completeCoverage(recordCount = 1): Coverage {
  return { status: "complete", pageCount: 1, recordCount };
}

function connection(phase: DiagnosticConnection["phase"] = "diagnosing") {
  return {
    id: "conn_1",
    userId: "user_1",
    accessToken: "token",
    phase,
  } satisfies DiagnosticConnection;
}

function completeSource(): StripeDiagnosticSource {
  const subscriptions: Page<
    Awaited<
      ReturnType<StripeDiagnosticSource["loadSubscriptions"]>
    >["data"][number]
  > = {
    data: [
      {
        id: "sub_1",
        status: "active",
        mode: "test",
        items: [
          {
            id: "line_1",
            amount: 2_500_000,
            currency: "usd",
            price: {
              type: "recurring",
              recurring: { interval: "month", interval_count: 1 },
            },
          },
        ],
      },
    ],
    hasMore: false,
    nextCursor: null,
    coverage: completeCoverage(),
  };
  const invoices: Page<
    Awaited<ReturnType<StripeDiagnosticSource["loadInvoices"]>>["data"][number]
  > = {
    data: [
      {
        id: "inv_1",
        subscriptionId: "sub_1",
        paymentIntentId: "pi_1",
        customerId: "cus_1",
        status: "open",
        amountDue: 50_000,
        currency: "usd",
        createdAt: 1_784_347_200,
        finalizedAt: 1_784_347_200,
        mode: "test",
        lines: [],
      },
    ],
    hasMore: false,
    nextCursor: null,
    coverage: completeCoverage(),
  };

  return {
    loadAccount: vi.fn<() => Promise<AccountEvidence>>(async () => ({
      id: "acct_1",
      mode: "test",
      country: "FR",
      defaultCurrency: "usd",
      createdAt: 1_700_000_000,
      coverage: completeCoverage(),
    })),
    loadSubscriptions: vi.fn(async () => subscriptions),
    loadInvoices: vi.fn(async () => invoices),
    loadPaymentEvidence: vi.fn<StripeDiagnosticSource["loadPaymentEvidence"]>(
      async () => [
        {
          invoiceId: "inv_1",
          paymentIntentId: "pi_1",
          chargeId: "ch_1",
          errorCode: "try_again_later",
          declineCode: null,
          adviceCode: null,
          mode: "test",
          coverage: completeCoverage(2),
        },
      ],
    ),
  };
}

function partialSource(): StripeDiagnosticSource {
  const source = completeSource();
  source.loadInvoices = vi.fn<StripeDiagnosticSource["loadInvoices"]>(
    async () => ({
      data: [],
      hasMore: false,
      nextCursor: "inv_cursor",
      coverage: {
        status: "partial",
        pageCount: 1,
        recordCount: 0,
        failure: { code: "stripe_rate_limited", cursor: "inv_cursor" },
      },
    }),
  );
  return source;
}

function createRepository(options?: {
  current?: DiagnosticSnapshotView | null;
  source?: StripeDiagnosticSource;
}) {
  const snapshots: DiagnosticSnapshotView[] = options?.current
    ? [options.current]
    : [];
  const findings: Array<{ snapshotId: string }> = [];
  const phases: string[] = [];
  const persist = vi.fn(async ({ snapshot, newFindings, phase }) => {
    for (const existing of snapshots) existing.isCurrent = false;
    snapshots.push(snapshot);
    findings.push(...newFindings.map(() => ({ snapshotId: snapshot.id })));
    phases.push(phase);
  });
  const transaction = vi.fn(async (work) => work({ persist }));

  const repository: DiagnosticRepository = {
    getConnection: vi.fn(async () => connection()),
    findSnapshotForWindow: vi.fn(
      async (_connectionId, window) =>
        snapshots.find(
          (snapshot) =>
            snapshot.analysisStartsAt.getTime() ===
              window.analysisStartsAt.getTime() &&
            snapshot.analysisEndsAt.getTime() ===
              window.analysisEndsAt.getTime(),
        ) ?? null,
    ),
    getCurrent: vi.fn(
      async () => snapshots.find((snapshot) => snapshot.isCurrent) ?? null,
    ),
    transaction,
    persist,
  };

  return { repository, snapshots, findings, phases, transaction };
}

function createService(
  repository: DiagnosticRepository,
  source: StripeDiagnosticSource,
) {
  return new DiagnosticService({
    repository,
    createSource: () => source,
    fx: {
      getRateToUsd: vi.fn(async () => ({
        status: "available" as const,
        metadata: {
          source: "identity" as const,
          seriesKeys: [],
          rateDate: "2026-07-19",
          fetchedAt: NOW.toISOString(),
          rateToUsd: 1,
        },
      })),
    },
  });
}

describe("DiagnosticService", () => {
  it("creates one job per connection and analysis window", async () => {
    const fixture = createRepository();
    const service = createService(fixture.repository, completeSource());

    const first = await service.run({
      connectionId: "conn_1",
      reason: "initial",
      now: NOW,
    });
    const second = await service.run({
      connectionId: "conn_1",
      reason: "initial",
      now: NOW,
    });

    expect(first.reused).toBe(false);
    expect(second.reused).toBe(true);
    expect(fixture.snapshots).toHaveLength(1);
    expect(fixture.transaction).toHaveBeenCalledTimes(1);
  });

  it("publishes diagnostic checkpoints in their approved order", async () => {
    const fixture = createRepository();
    const service = createService(fixture.repository, completeSource());

    await service.run({ connectionId: "conn_1", reason: "initial", now: NOW });

    await expect(service.getProgress("conn_1")).resolves.toMatchObject({
      checkpoints: [
        "account_loaded",
        "invoices_loaded",
        "payment_evidence_loaded",
        "revenue_normalized",
        "findings_classified",
        "snapshot_persisted",
      ],
    });
  });

  it("persists an insufficient-data snapshot when coverage is incomplete", async () => {
    const fixture = createRepository();
    const service = createService(fixture.repository, partialSource());

    const result = await service.run({
      connectionId: "conn_1",
      reason: "initial",
      now: NOW,
    });

    expect(result.snapshot.verdict).toBe("insufficient_data");
    expect(result.snapshot.coverageComplete).toBe(false);
    expect(fixture.snapshots).toHaveLength(1);
    expect(fixture.phases).toEqual(["diagnosing"]);
  });

  it("atomically replaces the current snapshot and scopes findings to the new snapshot", async () => {
    const previous = snapshot(
      "snapshot_previous",
      new Date("2026-04-01T00:00:00.000Z"),
    );
    const fixture = createRepository({ current: previous });
    const service = createService(fixture.repository, completeSource());

    const result = await service.run({
      connectionId: "conn_1",
      reason: "refresh",
      now: NOW,
    });

    expect(fixture.transaction).toHaveBeenCalledTimes(1);
    expect(previous.isCurrent).toBe(false);
    expect(result.snapshot.isCurrent).toBe(true);
    expect(fixture.findings).toEqual([{ snapshotId: result.snapshot.id }]);
    expect(fixture.phases).toEqual(["diagnostic_ready"]);
  });

  it("leaves the prior current snapshot untouched when retrieval fails", async () => {
    const previous = snapshot(
      "snapshot_previous",
      new Date("2026-04-01T00:00:00.000Z"),
    );
    previous.staleAt = new Date("2026-07-18T00:00:00.000Z");
    const fixture = createRepository({ current: previous });
    const source = completeSource();
    source.loadAccount = vi.fn(async () => {
      throw new Error("Stripe unavailable");
    });
    const service = createService(fixture.repository, source);

    await expect(
      service.run({ connectionId: "conn_1", reason: "refresh", now: NOW }),
    ).rejects.toThrow("Stripe unavailable");

    expect(previous).toMatchObject({
      isCurrent: true,
      staleAt: new Date("2026-07-18T00:00:00.000Z"),
    });
    expect(fixture.transaction).not.toHaveBeenCalled();
    expect(fixture.phases).toEqual([]);
  });

  it("does not write recovery tables", () => {
    const source = readFileSync(
      new URL("./service.ts", import.meta.url),
      "utf8",
    );

    expect(source).not.toMatch(
      /failedPayment|recoveryAttempt|recoverySequence|sequenceStep|escalation/,
    );
  });
});

function snapshot(id: string, analysisStartsAt: Date): DiagnosticSnapshotView {
  return {
    id,
    connectionId: "conn_1",
    isCurrent: true,
    status: "complete",
    verdict: "monitoring_recommended",
    analysisStartsAt,
    analysisEndsAt: new Date(analysisStartsAt.getTime() + 86_400_000),
    decisionStartsAt: analysisStartsAt,
    decisionEndsAt: new Date(analysisStartsAt.getTime() + 86_400_000),
    decisionWindowComplete: true,
    coverageComplete: true,
    staleAt: null,
    pagesLoaded: 1,
    recordsLoaded: 1,
    findingsCount: 0,
  };
}
