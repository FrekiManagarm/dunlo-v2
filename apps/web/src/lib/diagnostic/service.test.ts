import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

import {
  DiagnosticService,
  DiagnosticRunLeaseLostError,
  DiagnosticRunRetryableError,
  type DiagnosticConnection,
  type DiagnosticWindow,
  type DiagnosticProgress,
  type DiagnosticRepository,
  type DiagnosticServiceOptions,
  type DiagnosticSnapshotView,
} from "./service";
import type {
  AccountEvidence,
  Coverage,
  Page,
  StripeDiagnosticSource,
} from "./stripe-source";

const NOW = new Date("2026-07-19T12:00:00.000Z");

const WINDOW: DiagnosticWindow = {
  analysisStartsAt: new Date("2026-04-21T00:00:00.000Z"),
  analysisEndsAt: new Date("2026-07-20T00:00:00.000Z"),
  decisionStartsAt: new Date("2026-06-20T00:00:00.000Z"),
  decisionEndsAt: new Date("2026-07-20T00:00:00.000Z"),
};

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
  connectionPhase?: DiagnosticConnection["phase"];
  source?: StripeDiagnosticSource;
  run?: {
    status: Exclude<DiagnosticProgress["status"], "idle">;
    leaseExpiresAt: Date;
    leaseOwnerId?: string;
  };
  reclaimBeforePersist?: boolean;
  clock?: () => Date;
  delayProgressAt?: number;
}) {
  const snapshots: DiagnosticSnapshotView[] = options?.current
    ? [options.current]
    : [];
  const findings: Array<{ snapshotId: string }> = [];
  const phases: string[] = [];
  const clock = options?.clock ?? (() => NOW);
  const progress = new Map<
    string,
    {
      status: Exclude<DiagnosticProgress["status"], "idle">;
      checkpoints: DiagnosticProgress["checkpoints"];
      errorCategory: DiagnosticProgress["errorCategory"];
    }
  >();
  const runs = new Map<
    string,
    {
      status: Exclude<DiagnosticProgress["status"], "idle">;
      leaseExpiresAt: Date;
      leaseOwnerId: string;
    }
  >();
  if (options?.run) {
    runs.set("conn_1", {
      ...options.run,
      leaseOwnerId: options.run.leaseOwnerId ?? "existing-owner",
    });
  }
  let ownerNumber = 0;
  let progressSaveCount = 0;
  let releaseDelayedProgress: (() => void) | undefined;
  const delayedProgress = new Promise<void>((resolve) => {
    releaseDelayedProgress = resolve;
  });
  const persist = vi.fn(
    async ({ snapshot, newFindings, phase, leaseOwnerId }) => {
      if (options?.reclaimBeforePersist) {
        runs.set(snapshot.connectionId, {
          status: "running",
          leaseExpiresAt: new Date(NOW.getTime() + 600_000),
          leaseOwnerId: "replacement-owner",
        });
      }
      if (runs.get(snapshot.connectionId)?.leaseOwnerId !== leaseOwnerId) {
        return { leaseLost: true as const };
      }
      const existing = snapshots.find(
        (candidate) =>
          candidate.analysisStartsAt.getTime() ===
            snapshot.analysisStartsAt.getTime() &&
          candidate.analysisEndsAt.getTime() ===
            snapshot.analysisEndsAt.getTime(),
      );
      if (existing)
        return { snapshot: existing, created: false, leaseLost: false };
      for (const existing of snapshots) existing.isCurrent = false;
      snapshots.push(snapshot);
      findings.push(...newFindings.map(() => ({ snapshotId: snapshot.id })));
      phases.push(phase);
      return { snapshot, created: true, leaseLost: false };
    },
  );
  const transaction = vi.fn(async (work) => work({ persist }));

  const repository: DiagnosticRepository = {
    getConnection: vi.fn(async () => connection(options?.connectionPhase)),
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
    claimRun: vi.fn(async ({ connectionId, now }) => {
      const run = runs.get(connectionId);
      const leaseOwnerId = `owner-${++ownerNumber}`;
      if (run) {
        if (
          run.status === "failed" ||
          (run.status === "running" && run.leaseExpiresAt <= now)
        ) {
          runs.set(connectionId, {
            status: "running",
            leaseExpiresAt: new Date(now.getTime() + 300_000),
            leaseOwnerId,
          });
          progress.set(connectionId, {
            status: "running",
            checkpoints: [],
            errorCategory: null,
          });
          return { owner: true as const, leaseOwnerId };
        }
        return {
          owner: false as const,
          status: run.status,
        };
      }
      runs.set(connectionId, {
        status: "running",
        leaseExpiresAt: new Date(now.getTime() + 300_000),
        leaseOwnerId,
      });
      progress.set(connectionId, {
        status: "running",
        checkpoints: [],
        errorCategory: null,
      });
      return { owner: true as const, leaseOwnerId };
    }),
    saveProgress: vi.fn(
      async ({ connectionId, leaseOwnerId, progress: nextProgress }) => {
        progressSaveCount += 1;
        if (progressSaveCount === options?.delayProgressAt) {
          await delayedProgress;
        }
        const run = runs.get(connectionId);
        if (!run || run.leaseOwnerId !== leaseOwnerId) return false;
        run.leaseExpiresAt = new Date(clock().getTime() + 300_000);
        progress.set(connectionId, nextProgress);
        return true;
      },
    ),
    transaction,
    persist,
  };

  return {
    repository,
    snapshots,
    findings,
    phases,
    progress,
    runs,
    releaseDelayedProgress,
    transaction,
  };
}

function createService(
  repository: DiagnosticRepository,
  source: StripeDiagnosticSource,
  options?: Pick<DiagnosticServiceOptions, "wait">,
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
    ...options,
  });
}

describe("DiagnosticService", () => {
  it("retains the monitoring lifecycle phase after a successful refresh", async () => {
    const fixture = createRepository({ connectionPhase: "monitoring" });
    const service = createService(fixture.repository, completeSource());

    await expect(
      service.run({
        connectionId: "conn_1",
        reason: "monitoring",
        now: NOW,
      }),
    ).resolves.toMatchObject({ phase: "monitoring" });

    expect(fixture.phases).toEqual(["monitoring"]);
  });

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
    const wait = vi.fn(async () => {});
    const firstService = createService(fixture.repository, firstSource, {
      wait,
    });
    const secondService = createService(fixture.repository, secondSource, {
      wait,
    });

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
      vi.mocked(firstSource.loadAccount).mock.calls.length +
        vi.mocked(secondSource.loadAccount).mock.calls.length,
    ).toBe(1);
    expect(
      vi.mocked(firstSource.loadSubscriptions).mock.calls.length +
        vi.mocked(secondSource.loadSubscriptions).mock.calls.length,
    ).toBe(1);
    expect(
      vi.mocked(firstSource.loadInvoices).mock.calls.length +
        vi.mocked(secondSource.loadInvoices).mock.calls.length,
    ).toBe(1);
    expect(
      vi.mocked(firstSource.loadPaymentEvidence).mock.calls.length +
        vi.mocked(secondSource.loadPaymentEvidence).mock.calls.length,
    ).toBe(1);
  });

  it("reclaims an expired running lease before reading Stripe", async () => {
    const fixture = createRepository({
      run: {
        status: "running",
        leaseExpiresAt: new Date(NOW.getTime() - 1),
      },
    });
    const source = completeSource();
    const service = createService(fixture.repository, source);

    const result = await service.run({
      connectionId: "conn_1",
      reason: "scheduled",
      now: NOW,
    });

    expect(result.reused).toBe(false);
    expect(source.loadAccount).toHaveBeenCalledTimes(1);
  });

  it("keeps a heartbeating owner live during a long subscription page", async () => {
    const fixture = createRepository();
    const ownerSource = completeSource();
    const waiterSource = completeSource();
    let releaseSubscriptions: (() => void) | undefined;
    const subscriptionsReleased = new Promise<void>((resolve) => {
      releaseSubscriptions = resolve;
    });
    const originalLoadSubscriptions = ownerSource.loadSubscriptions;
    ownerSource.loadSubscriptions = vi.fn(async (...args) => {
      await subscriptionsReleased;
      return originalLoadSubscriptions(...args);
    });
    const owner = createService(fixture.repository, ownerSource);
    const waiter = createService(fixture.repository, waiterSource, {
      wait: async () => {},
    });

    const ownerRun = owner.run({
      connectionId: "conn_1",
      reason: "scheduled",
      now: NOW,
    });
    await vi.waitFor(() => {
      expect(ownerSource.loadSubscriptions).toHaveBeenCalledOnce();
    });

    await expect(
      waiter.run({
        connectionId: "conn_1",
        reason: "scheduled",
        now: new Date(NOW.getTime() + 240_000),
      }),
    ).rejects.toBeInstanceOf(DiagnosticRunRetryableError);

    expect(waiterSource.loadAccount).not.toHaveBeenCalled();
    releaseSubscriptions?.();
    await ownerRun;
  });

  it("renews ownership while a Stripe call remains blocked beyond the lease", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    try {
      const fixture = createRepository({
        clock: () => new Date(Date.now()),
      });
      const ownerSource = completeSource();
      const reclaimerSource = completeSource();
      let releaseAccount: (() => void) | undefined;
      const accountReleased = new Promise<void>((resolve) => {
        releaseAccount = resolve;
      });
      const originalLoadAccount = ownerSource.loadAccount;
      ownerSource.loadAccount = vi.fn(async () => {
        await accountReleased;
        return originalLoadAccount();
      });
      const owner = createService(fixture.repository, ownerSource);
      const reclaimer = createService(fixture.repository, reclaimerSource, {
        wait: async () => {},
      });

      const ownerRun = owner.run({
        connectionId: "conn_1",
        reason: "scheduled",
        now: NOW,
      });
      for (let attempt = 0; attempt < 10; attempt += 1) {
        if (vi.mocked(ownerSource.loadAccount).mock.calls.length > 0) break;
        await Promise.resolve();
      }
      expect(ownerSource.loadAccount).toHaveBeenCalledOnce();

      await vi.advanceTimersByTimeAsync(360_000);
      await expect(
        reclaimer.run({
          connectionId: "conn_1",
          reason: "scheduled",
          now: new Date(NOW.getTime() + 360_000),
        }),
      ).rejects.toBeInstanceOf(DiagnosticRunRetryableError);

      expect(reclaimerSource.loadAccount).not.toHaveBeenCalled();
      releaseAccount?.();
      await ownerRun;
    } finally {
      vi.useRealTimers();
    }
  });

  it("drains an in-flight timer renewal before completing progress", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    try {
      const fixture = createRepository({
        clock: () => new Date(Date.now()),
        delayProgressAt: 2,
      });
      const source = completeSource();
      let releaseAccount: (() => void) | undefined;
      const accountReleased = new Promise<void>((resolve) => {
        releaseAccount = resolve;
      });
      const originalLoadAccount = source.loadAccount;
      source.loadAccount = vi.fn(async () => {
        await accountReleased;
        return originalLoadAccount();
      });
      const service = createService(fixture.repository, source);

      const run = service.run({
        connectionId: "conn_1",
        reason: "scheduled",
        now: NOW,
      });
      for (let attempt = 0; attempt < 10; attempt += 1) {
        if (vi.mocked(source.loadAccount).mock.calls.length > 0) break;
        await Promise.resolve();
      }
      await vi.advanceTimersByTimeAsync(60_000);
      expect(fixture.releaseDelayedProgress).toBeDefined();

      releaseAccount?.();
      let settled = false;
      void run.then(() => {
        settled = true;
      });
      for (let attempt = 0; attempt < 100; attempt += 1) {
        if (fixture.transaction.mock.calls.length > 0) break;
        await Promise.resolve();
      }
      expect(fixture.transaction).toHaveBeenCalledOnce();
      expect(settled).toBe(false);
      await expect(service.getProgress("conn_1")).resolves.toMatchObject({
        status: "running",
      });

      fixture.releaseDelayedProgress?.();
      await run;
      await expect(service.getProgress("conn_1")).resolves.toMatchObject({
        status: "completed",
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it("refuses progress from an owner after its lease is reclaimed", async () => {
    const fixture = createRepository();
    const first = await fixture.repository.claimRun({
      connectionId: "conn_1",
      window: WINDOW,
      now: NOW,
    });
    if (!first.owner) throw new Error("Expected initial owner.");
    const second = await fixture.repository.claimRun({
      connectionId: "conn_1",
      window: WINDOW,
      now: new Date(NOW.getTime() + 300_000),
    });
    if (!second.owner) throw new Error("Expected reclaimed owner.");

    await expect(
      fixture.repository.saveProgress({
        connectionId: "conn_1",
        window: WINDOW,
        leaseOwnerId: first.leaseOwnerId,
        progress: {
          status: "completed",
          checkpoints: ["snapshot_persisted"],
          errorCategory: null,
        },
      }),
    ).resolves.toBe(false);
    await expect(
      fixture.repository.getProgress("conn_1"),
    ).resolves.toMatchObject({
      status: "running",
      checkpoints: [],
    });
  });

  it("does not persist diagnostic data after ownership changes", async () => {
    const fixture = createRepository({ reclaimBeforePersist: true });
    const service = createService(fixture.repository, completeSource());

    await expect(
      service.run({
        connectionId: "conn_1",
        reason: "scheduled",
        now: NOW,
      }),
    ).rejects.toBeInstanceOf(DiagnosticRunLeaseLostError);

    expect(fixture.snapshots).toEqual([]);
    expect(fixture.findings).toEqual([]);
    expect(fixture.phases).toEqual([]);
  });

  it("returns a retryable error after bounded waiting for a live owner", async () => {
    const fixture = createRepository({
      run: {
        status: "running",
        leaseExpiresAt: new Date(NOW.getTime() + 60_000),
      },
    });
    const source = completeSource();
    const wait = vi.fn(async () => {});
    const service = createService(fixture.repository, source, { wait });

    await expect(
      service.run({
        connectionId: "conn_1",
        reason: "scheduled",
        now: NOW,
      }),
    ).rejects.toBeInstanceOf(DiagnosticRunRetryableError);

    expect(wait).toHaveBeenCalledTimes(59);
    expect(source.loadAccount).not.toHaveBeenCalled();
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
    expect(fixture.phases).toEqual(["diagnostic_ready"]);
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
