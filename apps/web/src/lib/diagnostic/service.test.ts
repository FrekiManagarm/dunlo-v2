import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

import {
  DiagnosticService,
  type DiagnosticConnection,
  type DiagnosticProgress,
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
  const progress = new Map<
    string,
    {
      status: Exclude<DiagnosticProgress["status"], "idle">;
      checkpoints: DiagnosticProgress["checkpoints"];
      errorCategory: DiagnosticProgress["errorCategory"];
    }
  >();
  const persist = vi.fn(async ({ snapshot, newFindings, phase }) => {
    const existing = snapshots.find(
      (candidate) =>
        candidate.analysisStartsAt.getTime() ===
          snapshot.analysisStartsAt.getTime() &&
        candidate.analysisEndsAt.getTime() ===
          snapshot.analysisEndsAt.getTime(),
    );
    if (existing) return { snapshot: existing, created: false };
    for (const existing of snapshots) existing.isCurrent = false;
    snapshots.push(snapshot);
    findings.push(...newFindings.map(() => ({ snapshotId: snapshot.id })));
    phases.push(phase);
    return { snapshot, created: true };
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
    getProgress: vi.fn(async (connectionId) => {
      const saved = progress.get(connectionId);
      return saved ? { connectionId, ...saved } : null;
    }),
    claimRun: vi.fn(async ({ connectionId }) => {
      if (progress.has(connectionId)) {
        return {
          owner: false as const,
          status: progress.get(connectionId)!.status,
        };
      }
      progress.set(connectionId, {
        status: "running",
        checkpoints: [],
        errorCategory: null,
      });
      return { owner: true as const };
    }),
    saveProgress: vi.fn(async ({ connectionId, progress: nextProgress }) => {
      progress.set(connectionId, nextProgress);
    }),
    transaction,
    persist,
  };

  return { repository, snapshots, findings, phases, progress, transaction };
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
    expect(second.snapshot.findingsCount).toBe(first.snapshot.findingsCount);
    expect(fixture.snapshots).toHaveLength(1);
    expect(fixture.transaction).toHaveBeenCalledTimes(1);
  });

  it("deduplicates genuinely concurrent jobs for the same connection and window", async () => {
    const fixture = createRepository();
    const firstSource = completeSource();
    const secondSource = completeSource();
    const firstService = createService(fixture.repository, firstSource);
    const secondService = createService(fixture.repository, secondSource);

    const results = await Promise.all([
      firstService.run({
        connectionId: "conn_1",
        reason: "initial",
        now: NOW,
      }),
      secondService.run({
        connectionId: "conn_1",
        reason: "initial",
        now: NOW,
      }),
    ]);

    expect(fixture.snapshots).toHaveLength(1);
    expect(fixture.findings).toHaveLength(1);
    expect(results.filter((result) => result.reused)).toHaveLength(1);
    expect(
      firstSource.loadAccount.mock.calls.length +
        secondSource.loadAccount.mock.calls.length,
    ).toBe(1);
    expect(
      firstSource.loadSubscriptions.mock.calls.length +
        secondSource.loadSubscriptions.mock.calls.length,
    ).toBe(1);
    expect(
      firstSource.loadInvoices.mock.calls.length +
        secondSource.loadInvoices.mock.calls.length,
    ).toBe(1);
    expect(
      firstSource.loadPaymentEvidence.mock.calls.length +
        secondSource.loadPaymentEvidence.mock.calls.length,
    ).toBe(1);
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

  it("does not publish account_loaded until subscriptions are loaded", async () => {
    const fixture = createRepository();
    const source = completeSource();
    let resolveSubscriptions: (() => void) | undefined;
    const subscriptionsLoaded = new Promise<void>((resolve) => {
      resolveSubscriptions = resolve;
    });
    const originalLoadSubscriptions = source.loadSubscriptions;
    source.loadSubscriptions = vi.fn(async (...args) => {
      await subscriptionsLoaded;
      return originalLoadSubscriptions(...args);
    });
    const service = createService(fixture.repository, source);

    const run = service.run({
      connectionId: "conn_1",
      reason: "initial",
      now: NOW,
    });

    await vi.waitFor(() => {
      expect(source.loadSubscriptions).toHaveBeenCalledOnce();
    });
    await expect(service.getProgress("conn_1")).resolves.toMatchObject({
      checkpoints: [],
    });

    resolveSubscriptions?.();
    await run;
  });

  it("restores persisted progress after the service is recreated", async () => {
    const fixture = createRepository();
    const firstService = createService(fixture.repository, completeSource());

    await firstService.run({
      connectionId: "conn_1",
      reason: "initial",
      now: NOW,
    });

    const recreatedService = createService(
      fixture.repository,
      completeSource(),
    );
    await expect(recreatedService.getProgress("conn_1")).resolves.toMatchObject(
      {
        status: "completed",
        checkpoints: [
          "account_loaded",
          "invoices_loaded",
          "payment_evidence_loaded",
          "revenue_normalized",
          "findings_classified",
          "snapshot_persisted",
        ],
      },
    );
  });

  it("preserves full checkpoint history when a completed snapshot is reused", async () => {
    const fixture = createRepository();
    const firstService = createService(fixture.repository, completeSource());
    await firstService.run({
      connectionId: "conn_1",
      reason: "initial",
      now: NOW,
    });

    const secondService = createService(fixture.repository, completeSource());
    const reused = await secondService.run({
      connectionId: "conn_1",
      reason: "initial",
      now: NOW,
    });

    expect(reused.reused).toBe(true);
    await expect(secondService.getProgress("conn_1")).resolves.toMatchObject({
      status: "completed",
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
