import { describe, expect, it, vi } from "vitest";

const schemaTaskMock = vi.fn((definition) => definition);
const loggerInfoMock = vi.fn();
const runMock = vi.fn();
const createDiagnosticServiceMock = vi.fn(() => ({ run: runMock }));

vi.mock("@trigger.dev/sdk", () => ({
  logger: { info: loggerInfoMock },
  schemaTask: schemaTaskMock,
}));

vi.mock("../lib/diagnostic/service", () => ({
  createDiagnosticService: createDiagnosticServiceMock,
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
});
