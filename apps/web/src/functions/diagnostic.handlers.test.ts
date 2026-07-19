import { beforeEach, describe, expect, it, vi } from "vitest";

type Condition =
  | { op: "and"; conditions: Condition[] }
  | { op: "eq"; column: string; value: unknown };

const mocks = vi.hoisted(() => {
  const rows: unknown[][] = [];
  const where = vi.fn();
  const select = vi.fn(() => {
    const query = {
      from: vi.fn(),
      where: (condition: unknown) => {
        where(condition);
        return query;
      },
      orderBy: vi.fn(),
      limit: vi.fn(),
    };
    query.from.mockReturnValue(query);
    query.orderBy.mockReturnValue(query);
    query.limit.mockImplementation(async () => rows.shift() ?? []);
    return query;
  });
  return { rows, select, where };
});

vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => {
    const builder = {
      middleware: () => builder,
      inputValidator: () => builder,
      handler: (handler: unknown) => handler,
    };
    return builder;
  },
}));

vi.mock("@dunlo-v2/db", () => ({
  db: { select: mocks.select },
}));

vi.mock("@dunlo-v2/db/schema/domain", () => ({
  diagnosticRun: {
    status: "run_status",
    checkpoints: "run_checkpoints",
    errorCategory: "run_error_category",
    connectionId: "run_connection_id",
    updatedAt: "run_updated_at",
  },
  diagnosticSnapshot: {
    connectionId: "snapshot_connection_id",
    userId: "snapshot_user_id",
    isCurrent: "snapshot_is_current",
  },
  stripeConnection: {
    id: "connection_id",
    userId: "connection_user_id",
    updatedAt: "connection_updated_at",
  },
}));

vi.mock("drizzle-orm", () => ({
  and: (...conditions: Condition[]) => ({ op: "and", conditions }),
  desc: (column: string) => column,
  eq: (column: string, value: unknown) => ({ op: "eq", column, value }),
}));

vi.mock("../middleware/auth", () => ({ authMiddleware: {} }));

function containsEq(condition: Condition, column: string, value: unknown) {
  if (condition.op === "eq") {
    return condition.column === column && condition.value === value;
  }
  return condition.conditions.some((child) => containsEq(child, column, value));
}

const ownedConnection = {
  id: "conn_owned",
  userId: "user_owned",
  phase: "diagnostic_ready",
  scope: "read_only",
  monitoringEnabled: false,
  liveMode: true,
  accessToken: "access_token_should_not_leave_server",
  webhookSecret: "webhook_secret_should_not_leave_server",
};

describe("diagnostic server-function handlers", () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.rows.length = 0;
    mocks.select.mockClear();
    mocks.where.mockClear();
  });

  it("returns only a safe state DTO for the authenticated owner and requested connection", async () => {
    mocks.rows.push(
      [ownedConnection],
      [
        {
          status: "running",
          checkpoints: ["loading_invoices"],
          errorCategory: null,
        },
      ],
    );
    const { getDiagnosticState } = await import("./diagnostic");

    const view = await getDiagnosticState({
      context: { session: { user: { id: "user_owned" } } },
      data: { connectionId: "conn_owned" },
    });

    expect(view).toEqual({
      connectionId: "conn_owned",
      phase: "diagnostic_ready",
      scope: "read_only",
      monitoringEnabled: false,
      liveMode: true,
      progress: {
        status: "running",
        checkpoints: ["loading_invoices"],
        errorCategory: null,
      },
    });
    expect(JSON.stringify(view)).not.toMatch(/access_token|webhook_secret/);
    expect(containsEq(mocks.where.mock.calls[0][0], "connection_id", "conn_owned")).toBe(true);
    expect(containsEq(mocks.where.mock.calls[0][0], "connection_user_id", "user_owned")).toBe(true);
  });

  it("rejects a connection id that is not owned by the authenticated user", async () => {
    mocks.rows.push([]);
    const { getDiagnosticState } = await import("./diagnostic");

    await expect(
      getDiagnosticState({
        context: { session: { user: { id: "user_owned" } } },
        data: { connectionId: "conn_other_user" },
      }),
    ).rejects.toThrow(/not found/i);

    expect(
      containsEq(mocks.where.mock.calls[0][0], "connection_id", "conn_other_user"),
    ).toBe(true);
    expect(
      containsEq(mocks.where.mock.calls[0][0], "connection_user_id", "user_owned"),
    ).toBe(true);
  });

  it("returns a report DTO without credentials or raw customer identifiers", async () => {
    mocks.rows.push(
      [ownedConnection],
      [
        {
          verdict: "activation_recommended",
          planCode: "growth",
          stripeCustomerId: "cus_private",
          stripeInvoiceId: "in_private",
          monthlyAddressable: 45_000,
          analysisStartsAt: new Date("2026-01-01T00:00:00.000Z"),
          analysisEndsAt: new Date("2026-01-31T00:00:00.000Z"),
        },
      ],
    );
    const { getDiagnosticReport } = await import("./diagnostic");

    const view = await getDiagnosticReport({
      context: { session: { user: { id: "user_owned" } } },
      data: { connectionId: "conn_owned" },
    });

    expect(view).toMatchObject({
      connectionId: "conn_owned",
      verdict: "activation_recommended",
      planCode: "growth",
      monthlyAddressable: 45_000,
    });
    expect(JSON.stringify(view)).not.toMatch(
      /access_token|webhook_secret|cus_private|in_private/,
    );
    expect(containsEq(mocks.where.mock.calls[0][0], "connection_id", "conn_owned")).toBe(true);
    expect(containsEq(mocks.where.mock.calls[0][0], "connection_user_id", "user_owned")).toBe(true);
  });

  it("rejects a report request for a connection the authenticated user does not own", async () => {
    mocks.rows.push([]);
    const { getDiagnosticReport } = await import("./diagnostic");

    await expect(
      getDiagnosticReport({
        context: { session: { user: { id: "user_owned" } } },
        data: { connectionId: "conn_other_user" },
      }),
    ).rejects.toThrow(/not found/i);

    expect(
      containsEq(mocks.where.mock.calls[0][0], "connection_id", "conn_other_user"),
    ).toBe(true);
    expect(
      containsEq(mocks.where.mock.calls[0][0], "connection_user_id", "user_owned"),
    ).toBe(true);
  });

  it("keeps monitoring unavailable after authorizing the authenticated owner and requested connection", async () => {
    mocks.rows.push([ownedConnection]);
    const { enableMonitoring } = await import("./diagnostic");

    await expect(
      enableMonitoring({
        context: { session: { user: { id: "user_owned" } } },
        data: { connectionId: "conn_owned" },
      }),
    ).resolves.toEqual({ ok: false, code: "monitoring_not_available" });

    expect(containsEq(mocks.where.mock.calls[0][0], "connection_id", "conn_owned")).toBe(true);
    expect(containsEq(mocks.where.mock.calls[0][0], "connection_user_id", "user_owned")).toBe(true);
  });

  it("rejects monitoring for a connection the authenticated user does not own", async () => {
    mocks.rows.push([]);
    const { enableMonitoring } = await import("./diagnostic");

    await expect(
      enableMonitoring({
        context: { session: { user: { id: "user_owned" } } },
        data: { connectionId: "conn_other_user" },
      }),
    ).rejects.toThrow(/not found/i);

    expect(
      containsEq(mocks.where.mock.calls[0][0], "connection_id", "conn_other_user"),
    ).toBe(true);
    expect(
      containsEq(mocks.where.mock.calls[0][0], "connection_user_id", "user_owned")).toBe(true);
  });
});
