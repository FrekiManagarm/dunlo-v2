import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const rows: Array<Array<{ id: string }>> = [];
  const where = vi.fn();
  const limit = vi.fn(async () => rows.shift() ?? []);
  const select = vi.fn(() => {
    const query = {
      from: vi.fn(),
      where: (condition: unknown) => {
        where(condition);
        return query;
      },
      limit,
    };
    query.from.mockReturnValue(query);
    return query;
  });
  return {
    rows,
    where,
    limit,
    select,
    schedulesTask: vi.fn((definition) => definition),
    triggerDiagnostic: vi.fn(),
  };
});

vi.mock("@trigger.dev/sdk", () => ({
  schedules: { task: mocks.schedulesTask },
}));

vi.mock("@dunlo-v2/db", () => ({ db: { select: mocks.select } }));

vi.mock("@dunlo-v2/db/schema/domain", () => ({
  stripeConnection: {
    id: "connection_id",
    scope: "connection_scope",
    monitoringEnabled: "monitoring_enabled",
    phase: "connection_phase",
    nextAnalysisAt: "next_analysis_at",
  },
}));

vi.mock("drizzle-orm", () => ({
  and: (...conditions: unknown[]) => ({ op: "and", conditions }),
  eq: (column: string, value: unknown) => ({ op: "eq", column, value }),
  lte: (column: string, value: unknown) => ({ op: "lte", column, value }),
}));

vi.mock("./run-diagnostic", () => ({
  triggerDiagnostic: mocks.triggerDiagnostic,
}));

describe("monitorDiagnosticsTask", () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.rows.length = 0;
    mocks.where.mockClear();
    mocks.limit.mockClear();
    mocks.select.mockClear();
    mocks.schedulesTask.mockClear();
    mocks.triggerDiagnostic.mockReset().mockResolvedValue(undefined);
  });

  it("registers one daily scheduler instead of one cron per customer", async () => {
    await import("./monitor-diagnostics");

    expect(mocks.schedulesTask).toHaveBeenCalledTimes(1);
    expect(mocks.schedulesTask).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "monitor-read-only-diagnostics",
        cron: "0 8 * * *",
      }),
    );
  });

  it("enqueues only due read-only monitoring connections", async () => {
    mocks.rows.push([{ id: "conn_due" }]);
    const { monitorDiagnosticsTask } = await import("./monitor-diagnostics");
    const task = monitorDiagnosticsTask as unknown as {
      run(): Promise<{ queued: number }>;
    };

    await expect(task.run()).resolves.toEqual({ queued: 1 });
    expect(mocks.triggerDiagnostic).toHaveBeenCalledWith({
      connectionId: "conn_due",
      reason: "monitoring",
    });
    expect(mocks.where).toHaveBeenCalledWith({
      op: "and",
      conditions: expect.arrayContaining([
        { op: "eq", column: "connection_scope", value: "read_only" },
        { op: "eq", column: "monitoring_enabled", value: true },
        { op: "eq", column: "connection_phase", value: "monitoring" },
        { op: "lte", column: "next_analysis_at", value: expect.any(Date) },
      ]),
    });
  });
});
