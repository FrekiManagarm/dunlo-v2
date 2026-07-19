import { describe, expect, it, vi } from "vitest";

const schemaTaskMock = vi.fn((definition) => definition);
const loggerInfoMock = vi.fn();
const runMock = vi.fn();
const createDiagnosticServiceMock = vi.fn(() => ({ run: runMock }));
const completeMonitoringRefreshMock = vi.fn();

vi.mock("@trigger.dev/sdk", () => ({
  logger: { info: loggerInfoMock },
  schemaTask: schemaTaskMock,
}));

vi.mock("../lib/diagnostic/service", () => ({
  createDiagnosticService: createDiagnosticServiceMock,
}));

vi.mock("../lib/diagnostic/notifications", () => ({
  completeMonitoringRefresh: completeMonitoringRefreshMock,
}));

describe("runDiagnosticTask", () => {
  it("registers the Stripe diagnostic task with its validated payload", async () => {
    const { runDiagnosticTask } = await import("./run-diagnostic");
    const task = runDiagnosticTask as unknown as {
      id: string;
      schema: { parse(value: unknown): unknown };
    };

    expect(schemaTaskMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: "run-stripe-diagnostic" }),
    );
    expect(
      task.schema.parse({ connectionId: "conn_1", reason: "initial" }),
    ).toEqual({
      connectionId: "conn_1",
      reason: "initial",
    });
    expect(
      task.schema.parse({ connectionId: "conn_1", reason: "monitoring" }),
    ).toEqual({
      connectionId: "conn_1",
      reason: "monitoring",
    });
    expect(() => task.schema.parse({ connectionId: "conn_1" })).toThrow();
  });

  it("delegates execution to DiagnosticService and logs only aggregate diagnostics", async () => {
    runMock.mockResolvedValueOnce({
      snapshot: { pagesLoaded: 3, recordsLoaded: 15, findingsCount: 2 },
      phase: "diagnostic_ready",
      reused: false,
    });
    const { runDiagnosticTask } = await import("./run-diagnostic");
    const task = runDiagnosticTask as unknown as {
      run(payload: { connectionId: string; reason: string }): Promise<unknown>;
    };

    await expect(
      task.run({ connectionId: "conn_1", reason: "initial" }),
    ).resolves.toMatchObject({
      phase: "diagnostic_ready",
    });
    expect(runMock).toHaveBeenCalledWith(
      expect.objectContaining({
        connectionId: "conn_1",
        reason: "initial",
        now: expect.any(Date),
      }),
    );
    expect(loggerInfoMock).toHaveBeenCalledWith(
      "Stripe diagnostic completed",
      expect.objectContaining({
        pagesLoaded: 3,
        recordsLoaded: 15,
        findingsCount: 2,
        phase: "diagnostic_ready",
      }),
    );
    expect(JSON.stringify(loggerInfoMock.mock.calls)).not.toContain("conn_1");
  });

  it("processes a completed monitoring refresh through the quiet notification path", async () => {
    runMock.mockResolvedValueOnce({
      snapshot: { pagesLoaded: 3, recordsLoaded: 15, findingsCount: 2 },
      phase: "monitoring",
      reused: false,
    });
    completeMonitoringRefreshMock.mockResolvedValueOnce({ notified: true });
    const { runDiagnosticTask } = await import("./run-diagnostic");
    const task = runDiagnosticTask as unknown as {
      run(payload: { connectionId: string; reason: string }): Promise<unknown>;
    };

    await task.run({ connectionId: "conn_1", reason: "monitoring" });

    expect(completeMonitoringRefreshMock).toHaveBeenCalledWith({
      connectionId: "conn_1",
      now: expect.any(Date),
    });
  });
});
