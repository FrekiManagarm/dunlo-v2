import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const selectLimit = vi.fn();
  const updateWhere = vi.fn();
  const updateSet = vi.fn();
  const deleteWhere = vi.fn();
  const transaction = vi.fn();
  const selectQuery = {
    from: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: selectLimit,
  };
  selectQuery.from.mockReturnValue(selectQuery);
  selectQuery.where.mockReturnValue(selectQuery);
  selectQuery.orderBy.mockReturnValue(selectQuery);
  return {
    authSession: vi.fn(),
    decrypt: vi.fn((value: string) => value),
    deleteWebhooks: vi.fn(),
    deauthorize: vi.fn(),
    selectLimit,
    updateWhere,
    updateSet,
    deleteWhere,
    transaction,
    db: {
      select: vi.fn(() => selectQuery),
      update: vi.fn(() => ({ set: updateSet })),
      transaction,
    },
  };
});

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: unknown) => ({ options }),
}));
vi.mock("@dunlo-v2/auth", () => ({
  auth: { api: { getSession: mocks.authSession } },
}));
vi.mock("@dunlo-v2/db", () => ({ db: mocks.db }));
vi.mock("@dunlo-v2/db/encrypt", () => ({ decrypt: mocks.decrypt }));
vi.mock("@dunlo-v2/env/server", () => ({
  env: { STRIPE_SECRET_KEY: "sk_test", STRIPE_CLIENT_ID: "ca_test" },
}));
vi.mock("stripe", () => ({
  default: class Stripe {
    oauth = { deauthorize: mocks.deauthorize };
  },
}));
vi.mock("@/lib/stripe-webhooks", () => ({
  deleteWebhooks: mocks.deleteWebhooks,
}));
vi.mock("@dunlo-v2/db/schema/domain", () => ({
  emailProvider: "email_provider",
  stripeConnection: {
    id: "connection_id",
    userId: "connection_user_id",
    stripeAccountId: "connection_account_id",
    accessToken: "connection_access_token",
    webhookEndpointId: "connection_webhook_endpoint_id",
    phase: "connection_phase",
    monitoringEnabled: "connection_monitoring_enabled",
    nextAnalysisAt: "connection_next_analysis_at",
  },
  failedPayment: { stripeAccountId: "payment_account_id" },
  user: "user",
}));
vi.mock("drizzle-orm", () => ({
  and: (...values: unknown[]) => values,
  desc: (value: unknown) => value,
  eq: (column: unknown, value: unknown) => [column, value],
}));

type RouteWithPostHandler = {
  options: {
    server: {
      handlers: { POST(input: { request: Request }): Promise<Response> };
    };
  };
};

const connection = {
  id: "conn_123",
  userId: "user_123",
  stripeAccountId: "acct_123",
  accessToken: "encrypted_access",
  webhookEndpointId: "we_123",
};

function transactionQuery() {
  const query = { where: vi.fn() };
  return query;
}

describe("POST /api/stripe/disconnect", () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.authSession.mockResolvedValue({ user: { id: "user_123" } });
    mocks.selectLimit.mockReset();
    mocks.updateWhere.mockReset().mockResolvedValue(undefined);
    mocks.updateSet.mockReset().mockImplementation(() => ({
      where: mocks.updateWhere,
    }));
    mocks.deleteWhere.mockReset().mockResolvedValue(undefined);
    mocks.deleteWebhooks.mockReset().mockResolvedValue(undefined);
    mocks.deauthorize
      .mockReset()
      .mockResolvedValue({ stripe_user_id: "acct_123" });
    mocks.transaction.mockReset().mockImplementation(async (work) =>
      work({
        delete: vi.fn(() => transactionQuery()),
      }),
    );
  });

  it("is successful and idempotent when no connection remains", async () => {
    mocks.selectLimit.mockResolvedValue([]);
    const { Route } = (await import("./disconnect")) as {
      Route: RouteWithPostHandler;
    };

    const response = await Route.options.server.handlers.POST({
      request: new Request("https://app.dunlo.test/api/stripe/disconnect", {
        method: "POST",
      }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      disconnected: true,
      alreadyDisconnected: true,
    });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("cancels monitoring, removes remote access, deletes only the selected account data, and preserves account-level settings", async () => {
    mocks.selectLimit.mockResolvedValue([connection]);
    const transactionDeletes: Array<{
      table: unknown;
      where: ReturnType<typeof vi.fn>;
    }> = [];
    mocks.transaction.mockImplementation(async (work) =>
      work({
        delete: (table: unknown) => {
          const query = transactionQuery();
          transactionDeletes.push({ table, where: query.where });
          return query;
        },
      }),
    );
    const { Route } = (await import("./disconnect")) as {
      Route: RouteWithPostHandler;
    };

    const response = await Route.options.server.handlers.POST({
      request: new Request("https://app.dunlo.test/api/stripe/disconnect", {
        method: "POST",
      }),
    });

    expect(mocks.updateSet).toHaveBeenCalledWith({
      phase: "disconnecting",
      monitoringEnabled: false,
      nextAnalysisAt: null,
    });
    expect(mocks.deleteWebhooks).toHaveBeenCalledWith(
      "we_123",
      "encrypted_access",
      "acct_123",
    );
    expect(mocks.deauthorize).toHaveBeenCalledWith({
      client_id: "ca_test",
      stripe_user_id: "acct_123",
    });
    expect(mocks.transaction).toHaveBeenCalledTimes(1);
    expect(transactionDeletes).toHaveLength(2);
    expect(transactionDeletes.map(({ table }) => table)).not.toContain(
      "email_provider",
    );
    expect(transactionDeletes.map(({ table }) => table)).not.toContain("user");
    expect(transactionDeletes[0]?.where).toHaveBeenCalledWith([
      "payment_account_id",
      "acct_123",
    ]);
    expect(transactionDeletes[1]?.where).toHaveBeenCalledWith([
      ["connection_id", "conn_123"],
      ["connection_user_id", "user_123"],
    ]);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ disconnected: true });
  });

  it("marks the connection retryable when remote cleanup is partial and does not delete local data", async () => {
    mocks.selectLimit.mockResolvedValue([connection]);
    mocks.deleteWebhooks.mockRejectedValue(new Error("Stripe unavailable"));
    const { Route } = (await import("./disconnect")) as {
      Route: RouteWithPostHandler;
    };

    const response = await Route.options.server.handlers.POST({
      request: new Request("https://app.dunlo.test/api/stripe/disconnect", {
        method: "POST",
      }),
    });

    expect(mocks.updateSet).toHaveBeenLastCalledWith({
      phase: "disconnect_failed",
    });
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: "remote_cleanup_failed",
      retryable: true,
    });
  });
});
