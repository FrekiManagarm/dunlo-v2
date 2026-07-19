import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const selectLimit = vi.fn();
  const updateWhere = vi.fn();
  const updateSet = vi.fn();
  const execute = vi.fn();
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
    selectQuery,
    selectLimit,
    updateWhere,
    updateSet,
    execute,
    db: {
      select: vi.fn(() => selectQuery),
      update: vi.fn(() => ({ set: updateSet })),
      execute,
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
  failedPayment: {
    stripeAccountId: "payment_account_id",
    userId: "payment_user_id",
  },
  user: "user",
}));
vi.mock("drizzle-orm", () => ({
  and: (...values: unknown[]) => values,
  desc: (value: unknown) => value,
  eq: (column: unknown, value: unknown) => [column, value],
  sql: (strings: TemplateStringsArray, ...values: unknown[]) => ({
    strings,
    values,
  }),
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
  phase: "recovery_active",
};

function requestFor(connectionId = "conn_123") {
  return new Request("https://app.dunlo.test/api/stripe/disconnect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ connectionId }),
  });
}

describe("POST /api/stripe/disconnect", () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.authSession.mockResolvedValue({ user: { id: "user_123" } });
    mocks.selectLimit.mockReset();
    mocks.updateWhere.mockReset().mockReturnValue({
      returning: vi.fn().mockResolvedValue([{ id: "conn_123" }]),
    });
    mocks.updateSet.mockReset().mockImplementation(() => ({
      where: mocks.updateWhere,
    }));
    mocks.execute.mockReset().mockImplementation(function (this: unknown) {
      if (this !== mocks.db) {
        throw new Error("execute lost its database receiver");
      }
      return Promise.resolve({ rows: [{ id: "conn_123" }] });
    });
    mocks.deleteWebhooks.mockReset().mockResolvedValue(undefined);
    mocks.deauthorize
      .mockReset()
      .mockResolvedValue({ stripe_user_id: "acct_123" });
  });

  it("is successful and idempotent when no connection remains", async () => {
    mocks.selectLimit.mockResolvedValue([]);
    const { Route } = (await import("./disconnect")) as {
      Route: RouteWithPostHandler;
    };

    const response = await Route.options.server.handlers.POST({
      request: requestFor(),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      disconnected: true,
      alreadyDisconnected: true,
    });
    expect(mocks.execute).not.toHaveBeenCalled();
  });

  it("does not race a claimed final confirmation into an orphaned remote webhook", async () => {
    mocks.selectLimit.mockResolvedValue([
      { ...connection, phase: "recovery_confirming" },
    ]);
    const { Route } = (await import("./disconnect")) as {
      Route: RouteWithPostHandler;
    };

    const response = await Route.options.server.handlers.POST({
      request: requestFor(),
    });

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: "recovery_confirmation_in_progress",
      retryable: true,
    });
    expect(mocks.deleteWebhooks).not.toHaveBeenCalled();
    expect(mocks.deauthorize).not.toHaveBeenCalled();
    expect(mocks.execute).not.toHaveBeenCalled();
  });

  it("deletes all local connection data with one atomic Neon HTTP statement bound to the database", async () => {
    mocks.selectLimit.mockResolvedValue([connection]);
    const { Route } = (await import("./disconnect")) as {
      Route: RouteWithPostHandler;
    };

    const response = await Route.options.server.handlers.POST({
      request: requestFor(),
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
    expect(mocks.db).not.toHaveProperty("transaction");
    expect(mocks.db).not.toHaveProperty("delete");
    expect(mocks.execute).toHaveBeenCalledTimes(1);
    expect(mocks.execute.mock.contexts[0]).toBe(mocks.db);
    const [statement] = mocks.execute.mock.calls[0] ?? [];
    expect(statement.strings.join("?")).toContain("WITH deleted_payments AS");
    expect(statement.strings.join("?")).toContain("DELETE FROM failed_payment");
    expect(statement.strings.join("?")).toContain(
      "DELETE FROM stripe_connection",
    );
    expect(statement.values).toEqual([
      "acct_123",
      "user_123",
      "conn_123",
      "user_123",
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
      request: requestFor(),
    });

    expect(mocks.updateSet).toHaveBeenLastCalledWith({
      phase: "disconnect_failed",
    });
    expect(mocks.execute).not.toHaveBeenCalled();
    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: "remote_cleanup_failed",
      retryable: true,
    });
  });

  it("does not report success before local deletion finishes", async () => {
    mocks.selectLimit.mockResolvedValue([connection]);
    mocks.execute.mockRejectedValue(new Error("Database unavailable"));
    const { Route } = (await import("./disconnect")) as {
      Route: RouteWithPostHandler;
    };

    const response = await Route.options.server.handlers.POST({
      request: requestFor(),
    });

    expect(mocks.updateSet).toHaveBeenLastCalledWith({
      phase: "disconnect_failed",
    });
    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: "local_cleanup_failed",
      retryable: true,
    });
  });

  it("retries successfully when revocation fails after webhook deletion and the webhook is already removed", async () => {
    mocks.selectLimit.mockResolvedValue([connection]);
    mocks.deleteWebhooks
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce({ statusCode: 404 });
    mocks.deauthorize
      .mockRejectedValueOnce(new Error("Stripe unavailable"))
      .mockResolvedValueOnce({ stripe_user_id: "acct_123" });
    const { Route } = (await import("./disconnect")) as {
      Route: RouteWithPostHandler;
    };

    const firstResponse = await Route.options.server.handlers.POST({
      request: requestFor(),
    });
    expect(firstResponse.status).toBe(502);

    const retryResponse = await Route.options.server.handlers.POST({
      request: requestFor(),
    });

    expect(mocks.deleteWebhooks).toHaveBeenCalledTimes(2);
    expect(mocks.deauthorize).toHaveBeenCalledTimes(2);
    expect(mocks.execute).toHaveBeenCalledTimes(1);
    expect(retryResponse.status).toBe(200);
  });

  it("does not send the local development webhook marker to Stripe", async () => {
    mocks.selectLimit.mockResolvedValue([
      { ...connection, webhookEndpointId: "local_dev_webhook" },
    ]);
    const { Route } = (await import("./disconnect")) as {
      Route: RouteWithPostHandler;
    };

    const response = await Route.options.server.handlers.POST({
      request: requestFor(),
    });

    expect(mocks.deleteWebhooks).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
  });

  it("uses the request connection id with the authenticated user instead of selecting the latest connection", async () => {
    mocks.selectLimit.mockResolvedValue([connection]);
    const { Route } = (await import("./disconnect")) as {
      Route: RouteWithPostHandler;
    };

    await Route.options.server.handlers.POST({
      request: requestFor("conn_selected"),
    });

    expect(mocks.selectQuery.orderBy).not.toHaveBeenCalled();
    expect(mocks.selectQuery.where).toHaveBeenCalledWith([
      ["connection_id", "conn_selected"],
      ["connection_user_id", "user_123"],
    ]);
  });
});
