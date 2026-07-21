import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const selectWhere = vi.fn();
  const selectOrderBy = vi.fn();
  const selectResults: unknown[] = [];
  const select = vi.fn((..._args: unknown[]) => {
    const result = selectResults.shift();
    const query = {
      from: vi.fn(),
      where: selectWhere,
      orderBy: selectOrderBy,
      limit: vi.fn(() => Promise.resolve(result)),
      then: (
        resolve: (value: unknown) => unknown,
        reject?: (reason: unknown) => unknown,
      ) => Promise.resolve(result).then(resolve, reject),
    };
    query.from.mockReturnValue(query);
    query.where.mockReturnValue(query);
    query.orderBy.mockReturnValue(query);
    return query;
  });
  return {
    authSession: vi.fn(),
    select,
    selectWhere,
    selectOrderBy,
    selectResults,
    db: { select },
  };
});

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: unknown) => ({ options }),
}));
vi.mock("@dunlo-v2/auth", () => ({
  auth: { api: { getSession: mocks.authSession } },
}));
vi.mock("@dunlo-v2/db", () => ({ db: mocks.db }));
vi.mock("@dunlo-v2/db/schema/domain", () => ({
  diagnosticFinding: {
    amount: "finding_amount",
    currency: "finding_currency",
    category: "finding_category",
    connectionId: "finding_connection_id",
    snapshotId: "finding_snapshot_id",
  },
  diagnosticSnapshot: {
    id: "snapshot_id",
    connectionId: "snapshot_connection_id",
    userId: "snapshot_user_id",
    isCurrent: "snapshot_is_current",
  },
  stripeConnection: { id: "connection_id", userId: "connection_user_id" },
}));
vi.mock("drizzle-orm", () => ({
  and: (...values: unknown[]) => values,
  eq: (column: unknown, value: unknown) => [column, value],
}));
vi.mock("@/lib/diagnostic/export", () => ({
  buildDiagnosticExport: (input: { snapshot: { fxRateDate: string } }) => ({
    schemaVersion: "dunlo-diagnostic/v1",
    diagnostic: { fx: { rateDate: input.snapshot.fxRateDate } },
  }),
}));

type RouteWithGetHandler = {
  options: {
    server: {
      handlers: { GET(input: { request: Request }): Promise<Response> };
    };
  };
};

const snapshot = {
  id: "snapshot_123",
  verdict: "monitoring_recommended",
  analysisStartsAt: new Date("2026-06-19T00:00:00.000Z"),
  analysisEndsAt: new Date("2026-07-19T00:00:00.000Z"),
  decisionWindowComplete: true,
  coverageComplete: true,
  pagesLoaded: 2,
  recordsLoaded: 4,
  fixedMrr: 1000,
  variableMrr: 200,
  limitedConfidenceMrr: 0,
  excludedMrr: 0,
  dominantCurrency: "eur",
  dominantCurrencyShareBps: 10_000,
  observedFailed: 4,
  naturallyRecovered: 1,
  openAutomatable: 2,
  openHuman: 1,
  historicallyLostAutomatable: 0,
  historicallyLostHuman: 0,
  excludedAmount: 0,
  monthlyAddressable: 1_000,
  addressableNow: 800,
  classifierVersion: "addressability-v3",
  qualificationVersion: "qualification-v2",
  fxSource: "ECB",
  fxSeriesKeys: ["EXR.D.USD.EUR.SP00.A"],
  fxRateDate: "2026-07-18",
  fxFetchedAt: new Date("2026-07-18T08:00:00.000Z"),
  fxRateToUsd: "1.17",
  failureCategory: "none",
};

describe("GET /api/stripe/export", () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.authSession.mockResolvedValue({ user: { id: "user_123" } });
    mocks.select.mockClear();
    mocks.selectWhere.mockClear();
    mocks.selectOrderBy.mockClear();
    mocks.selectResults.splice(0, mocks.selectResults.length);
  });

  it("exports a realistic string-mode date snapshot for the explicit owned connection", async () => {
    mocks.selectResults.push(
      [{ id: "conn_selected" }],
      [snapshot],
      [{ amount: 1_000, currency: "eur", category: "open_automatable" }],
    );
    const { Route } = (await import("./export")) as {
      Route: RouteWithGetHandler;
    };

    const response = await Route.options.server.handlers.GET({
      request: new Request(
        "https://app.dunlo.test/api/stripe/export?connectionId=conn_selected",
      ),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      schemaVersion: "dunlo-diagnostic/v1",
      diagnostic: { fx: { rateDate: "2026-07-18" } },
    });
    expect(mocks.selectOrderBy).not.toHaveBeenCalled();
    expect(mocks.selectWhere).toHaveBeenCalledWith([
      ["connection_id", "conn_selected"],
      ["connection_user_id", "user_123"],
    ]);
  });
});
