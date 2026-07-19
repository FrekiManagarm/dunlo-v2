import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createStripeOAuthState,
  verifyStripeOAuthState,
} from "../lib/stripe-oauth-state";

const mocks = vi.hoisted(() => {
  const selectLimit = vi.fn();
  const updateWhere = vi.fn();
  const updateSet = vi.fn();
  const insertValues = vi.fn();
  const builder = {
    from: vi.fn(),
    innerJoin: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: selectLimit,
  };
  builder.from.mockReturnValue(builder);
  builder.innerJoin.mockReturnValue(builder);
  builder.where.mockReturnValue(builder);
  builder.orderBy.mockReturnValue(builder);
  return {
    authSession: vi.fn(),
    selectLimit,
    selectWhere: builder.where,
    updateWhere,
    updateSet,
    insertValues,
    triggerDiagnostic: vi.fn(),
    reconcileWebhook: vi.fn(),
    seedDefaultSequences: vi.fn(),
    fetch: vi.fn(),
    db: {
      select: vi.fn(() => builder),
      update: vi.fn(() => ({
        set: updateSet,
      })),
      insert: vi.fn(() => ({ values: insertValues })),
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
vi.mock("@dunlo-v2/db/encrypt", () => ({ encrypt: (value: string) => value }));
vi.mock("@dunlo-v2/db/schema/domain", () => ({
  stripeConnection: {
    id: "id",
    userId: "userId",
    stripeAccountId: "stripeAccountId",
    phase: "phase",
  },
  diagnosticSnapshot: {
    connectionId: "connectionId",
    isCurrent: "isCurrent",
    verdict: "verdict",
    planCode: "planCode",
    createdAt: "createdAt",
  },
}));
vi.mock("@dunlo-v2/env/server", () => ({
  env: {
    APP_URL: "https://app.dunlo.test",
    BETTER_AUTH_SECRET: "a-test-secret-that-is-long-enough-for-hmac-signing",
    NODE_ENV: "test",
    STRIPE_CLIENT_ID: "ca_test",
    STRIPE_SECRET_KEY: "sk_test",
  },
}));
vi.mock("drizzle-orm", () => ({
  and: (...args: unknown[]) => args,
  desc: (value: unknown) => value,
  eq: (...args: unknown[]) => args,
  inArray: (...args: unknown[]) => args,
}));
vi.mock("@/trigger/run-diagnostic", () => ({
  triggerDiagnostic: mocks.triggerDiagnostic,
}));
vi.mock(
  "@/lib/stripe-oauth-state",
  async () => import("../lib/stripe-oauth-state"),
);
vi.mock("@/lib/stripe-webhooks", () => ({
  reconcileWebhook: mocks.reconcileWebhook,
}));
vi.mock("@/functions/stripe", () => ({
  seedDefaultSequences: mocks.seedDefaultSequences,
}));

const oauthSecret = "a-test-secret-that-is-long-enough-for-hmac-signing";

type RouteWithGetHandler = {
  options: {
    server: {
      handlers: { GET(request: { request: Request }): Promise<Response> };
    };
  };
};

function callbackRequest(state: ReturnType<typeof createStripeOAuthState>) {
  return {
    request: new Request(
      `https://app.dunlo.test/api/stripe/callback?state=${state.nonce}&code=code_123`,
      { headers: { cookie: `stripe_oauth_state=${state.sealed}` } },
    ),
  };
}

function token(
  scope: "read_only" | "read_write",
  stripeAccountId = "acct_123",
) {
  return new Response(
    JSON.stringify({
      access_token: "access_123",
      scope,
      stripe_user_id: stripeAccountId,
      livemode: true,
    }),
    { status: 200 },
  );
}

function oauthStateFromResponse(response: Response) {
  const location = new URL(response.headers.get("location")!);
  const sealed = response.headers
    .get("set-cookie")!
    .match(/stripe_oauth_state=([^;]+)/)?.[1];
  return verifyStripeOAuthState(sealed!, {
    nonce: location.searchParams.get("state")!,
    userId: "user_123",
    now: new Date(),
    secret: oauthSecret,
  });
}

describe("Stripe OAuth route contracts", () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.authSession.mockResolvedValue({ user: { id: "user_123" } });
    mocks.selectLimit.mockReset();
    mocks.selectWhere.mockClear();
    mocks.updateWhere.mockReset().mockResolvedValue(undefined);
    mocks.updateSet.mockReset().mockImplementation(() => ({
      where: mocks.updateWhere,
    }));
    mocks.insertValues.mockReset().mockResolvedValue(undefined);
    mocks.triggerDiagnostic.mockReset().mockResolvedValue(undefined);
    mocks.reconcileWebhook.mockReset().mockResolvedValue({
      webhookEndpointId: "we_123",
      webhookSecret: "whsec_123",
    });
    mocks.seedDefaultSequences.mockReset().mockResolvedValue(undefined);
    mocks.fetch.mockReset();
    vi.stubGlobal("fetch", mocks.fetch);
  });

  afterEach(() => vi.unstubAllGlobals());

  it("starts diagnostic OAuth with read-only scope and rejects active connections", async () => {
    mocks.selectLimit.mockResolvedValueOnce([{ phase: "recovery_active" }]);
    const { Route } = (await import("./api/stripe/connect")) as {
      Route: RouteWithGetHandler;
    };

    const response = await Route.options.server.handlers.GET({
      request: new Request("https://app.dunlo.test/api/stripe/connect"),
    });

    expect(response.headers.get("location")).toBe(
      "/onboarding?error=diagnostic_downgrade_not_allowed",
    );
  });

  it("starts diagnostic OAuth with read-only scope and a sealed internal return path", async () => {
    mocks.selectLimit.mockResolvedValueOnce([]);
    const { Route } = (await import("./api/stripe/connect")) as {
      Route: RouteWithGetHandler;
    };

    const response = await Route.options.server.handlers.GET({
      request: new Request(
        "https://app.dunlo.test/api/stripe/connect?returnTo=%2F%5Cevil.example",
      ),
    });
    const location = new URL(response.headers.get("location")!);

    expect(location.searchParams.get("scope")).toBe("read_only");
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    expect(oauthStateFromResponse(response)).toMatchObject({
      intent: "diagnostic",
      returnPath: "/onboarding?step=2",
    });
  });

  it("starts activation OAuth with read-write scope bound to the recommended account", async () => {
    mocks.selectLimit.mockResolvedValueOnce([
      { stripeAccountId: "acct_123", planCode: "mrr_25k_to_50k" },
    ]);
    const { Route } = (await import("./api/stripe/connect")) as {
      Route: RouteWithGetHandler;
    };

    const response = await Route.options.server.handlers.GET({
      request: new Request(
        "https://app.dunlo.test/api/stripe/connect?intent=activation&connectionId=conn_123",
      ),
    });
    const location = new URL(response.headers.get("location")!);

    expect(location.searchParams.get("scope")).toBe("read_write");
    expect(oauthStateFromResponse(response)).toMatchObject({
      intent: "activation",
      targetStripeAccountId: "acct_123",
      returnPath: "/onboarding?step=3",
    });
    expect(mocks.selectWhere).toHaveBeenCalledWith(
      expect.arrayContaining([
        ["id", "conn_123"],
        ["userId", "user_123"],
      ]),
    );
  });

  it("rejects activation OAuth without the displayed eligible connection id", async () => {
    mocks.selectLimit.mockResolvedValueOnce([
      { stripeAccountId: "acct_123", planCode: "mrr_25k_to_50k" },
    ]);
    const { Route } = (await import("./api/stripe/connect")) as {
      Route: RouteWithGetHandler;
    };

    const response = await Route.options.server.handlers.GET({
      request: new Request(
        "https://app.dunlo.test/api/stripe/connect?intent=activation",
      ),
    });

    expect(response.headers.get("location")).toBe(
      "/onboarding?error=activation_not_available",
    );
  });

  it("runs the diagnostic callback without write side effects and clears the state cookie", async () => {
    mocks.selectLimit.mockResolvedValueOnce([]);
    mocks.fetch.mockResolvedValueOnce(token("read_only"));
    const state = createStripeOAuthState(
      {
        nonce: "diagnostic_nonce",
        userId: "user_123",
        intent: "diagnostic",
        issuedAt: new Date(),
        returnPath: "/onboarding?step=2",
      },
      oauthSecret,
    );
    const { Route } = (await import("./api/stripe/callback")) as {
      Route: RouteWithGetHandler;
    };

    const response = await Route.options.server.handlers.GET(
      callbackRequest(state),
    );

    expect(response.headers.get("location")).toBe("/onboarding?step=2");
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
    expect(mocks.triggerDiagnostic).toHaveBeenCalledWith({
      connectionId: expect.any(String),
      reason: "initial",
    });
    expect(mocks.reconcileWebhook).not.toHaveBeenCalled();
    expect(mocks.seedDefaultSequences).not.toHaveBeenCalled();
    expect(mocks.insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        scope: "read_only",
        phase: "diagnosing",
        webhookEndpointId: null,
        webhookSecret: null,
      }),
    );
  });

  it("rejects a diagnostic callback that would downgrade an active account", async () => {
    mocks.selectLimit.mockResolvedValueOnce([
      { id: "conn_123", userId: "user_123", phase: "recovery_active" },
    ]);
    mocks.fetch.mockResolvedValueOnce(token("read_only"));
    const state = createStripeOAuthState(
      {
        nonce: "diagnostic_nonce",
        userId: "user_123",
        intent: "diagnostic",
        issuedAt: new Date(),
        returnPath: "/onboarding?step=2",
      },
      oauthSecret,
    );
    const { Route } = (await import("./api/stripe/callback")) as {
      Route: RouteWithGetHandler;
    };

    const response = await Route.options.server.handlers.GET(
      callbackRequest(state),
    );

    expect(response.headers.get("location")).toBe(
      "/onboarding?error=diagnostic_downgrade_not_allowed",
    );
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
    expect(mocks.triggerDiagnostic).not.toHaveBeenCalled();
    expect(mocks.reconcileWebhook).not.toHaveBeenCalled();
    expect(mocks.seedDefaultSequences).not.toHaveBeenCalled();
    expect(mocks.updateWhere).not.toHaveBeenCalled();
  });

  it("rejects an activation account mismatch without write side effects", async () => {
    mocks.fetch.mockResolvedValueOnce(token("read_write", "acct_other"));
    const state = createStripeOAuthState(
      {
        nonce: "activation_nonce",
        userId: "user_123",
        intent: "activation",
        targetStripeAccountId: "acct_123",
        issuedAt: new Date(),
        returnPath: "/onboarding?step=3",
      },
      oauthSecret,
    );
    const { Route } = (await import("./api/stripe/callback")) as {
      Route: RouteWithGetHandler;
    };

    const response = await Route.options.server.handlers.GET(
      callbackRequest(state),
    );

    expect(response.headers.get("location")).toBe(
      "/onboarding?error=stripe_account_mismatch",
    );
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
    expect(mocks.reconcileWebhook).not.toHaveBeenCalled();
    expect(mocks.seedDefaultSequences).not.toHaveBeenCalled();
  });

  it("returns a retryable activation state when webhook reconciliation fails", async () => {
    mocks.selectLimit.mockResolvedValueOnce([{ id: "conn_123" }]);
    mocks.fetch.mockResolvedValueOnce(token("read_write"));
    mocks.reconcileWebhook.mockResolvedValueOnce(null);
    const state = createStripeOAuthState(
      {
        nonce: "activation_nonce",
        userId: "user_123",
        intent: "activation",
        targetStripeAccountId: "acct_123",
        issuedAt: new Date(),
        returnPath: "/onboarding?step=3",
      },
      oauthSecret,
    );
    const { Route } = (await import("./api/stripe/callback")) as {
      Route: RouteWithGetHandler;
    };

    const response = await Route.options.server.handlers.GET(
      callbackRequest(state),
    );

    expect(response.headers.get("location")).toBe(
      "/onboarding?error=activation_retryable",
    );
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
    expect(mocks.seedDefaultSequences).not.toHaveBeenCalled();
    expect(mocks.updateSet).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ phase: "write_authorized" }),
    );
    expect(mocks.updateSet).toHaveBeenNthCalledWith(2, {
      phase: "activation_requested",
    });
  });

  it("activates only after webhook reconciliation and then seeds disabled sequences", async () => {
    mocks.selectLimit.mockResolvedValueOnce([{ id: "conn_123" }]);
    mocks.fetch.mockResolvedValueOnce(token("read_write"));
    const state = createStripeOAuthState(
      {
        nonce: "activation_nonce",
        userId: "user_123",
        intent: "activation",
        targetStripeAccountId: "acct_123",
        issuedAt: new Date(),
        returnPath: "/onboarding?step=3",
      },
      oauthSecret,
    );
    const { Route } = (await import("./api/stripe/callback")) as {
      Route: RouteWithGetHandler;
    };

    const response = await Route.options.server.handlers.GET(
      callbackRequest(state),
    );

    expect(response.headers.get("location")).toBe("/onboarding?step=3");
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
    expect(mocks.reconcileWebhook).toHaveBeenCalledWith(
      "acct_123",
      "access_123",
    );
    expect(mocks.seedDefaultSequences).toHaveBeenCalledWith("user_123", {
      isActive: false,
    });
  });
});
