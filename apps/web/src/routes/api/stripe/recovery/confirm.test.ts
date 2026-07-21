import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const execute = vi.fn();
  const getStripeConnectionById = vi.fn();
  const getSession = vi.fn();
  const reconcileWebhook = vi.fn();
  const state = { phase: "email_configured" };
  const update = vi.fn(() => {
    let patch: { phase?: string } = {};
    const apply = () => {
      if (patch.phase === "recovery_confirming") {
        if (state.phase !== "email_configured") return [];
        state.phase = "recovery_confirming";
        return [{ id: "conn_1" }];
      }
      if (
        patch.phase === "email_configured" &&
        state.phase === "recovery_confirming"
      ) {
        state.phase = "email_configured";
      }
      return [];
    };
    const query = {
      set: vi.fn((next: typeof patch) => {
        patch = next;
        return query;
      }),
      where: vi.fn(() => query),
      returning: vi.fn(async () => apply()),
      then: (onfulfilled: (value: unknown) => unknown) =>
        Promise.resolve(apply()).then(onfulfilled),
    };
    return query;
  });

  return {
    execute,
    getSession,
    getStripeConnectionById,
    reconcileWebhook,
    state,
    update,
  };
});

vi.mock("@dunlo-v2/db", () => ({
  db: { execute: mocks.execute, update: mocks.update },
}));
vi.mock("@dunlo-v2/auth", () => ({
  auth: { api: { getSession: mocks.getSession } },
}));
vi.mock("@/functions/stripe", () => ({
  getStripeConnectionById: mocks.getStripeConnectionById,
}));
vi.mock("@/lib/stripe-webhooks", () => ({
  reconcileWebhook: mocks.reconcileWebhook,
}));
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: unknown) => ({ options }),
}));

type ConfirmationHandler = (input: { request: Request }) => Promise<Response>;

async function confirmationHandler(): Promise<ConfirmationHandler> {
  const { Route } = await import("./confirm");
  return (
    Route as unknown as {
      options: { server: { handlers: { POST: ConfirmationHandler } } };
    }
  ).options.server.handlers.POST;
}

function request(): Request {
  return new Request("https://app.dunlo.test/api/stripe/recovery/confirm", {
    method: "POST",
    body: JSON.stringify({
      connectionId: "conn_1",
      accepted: true,
      workflowVersion: "recovery-v1",
      selectedSequenceIds: ["seq_1"],
    }),
  });
}

describe("atomic recovery confirmation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.state.phase = "email_configured";
    mocks.getSession.mockResolvedValue({ user: { id: "user_1" } });
    mocks.getStripeConnectionById.mockImplementation(async () => ({
      id: "conn_1",
      userId: "user_1",
      stripeAccountId: "acct_1",
      accessToken: "access_1",
      scope: "read_write",
      phase: mocks.state.phase,
    }));
  });

  it("uses one CTE statement and only succeeds when its guarded row is returned", async () => {
    mocks.execute
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ user_id: "u1" }] });
    const { runAtomicRecoveryConfirmation } = await import("./confirm");

    await expect(
      runAtomicRecoveryConfirmation(mocks.execute, {
        connectionId: "c1",
        userId: "u1",
        selectedSequenceIds: ["s1", "s2"],
      }),
    ).resolves.toBe(false);
    await expect(
      runAtomicRecoveryConfirmation(mocks.execute, {
        connectionId: "c1",
        userId: "u1",
        selectedSequenceIds: ["s1", "s2"],
      }),
    ).resolves.toBe(true);
    expect(mocks.execute).toHaveBeenCalledTimes(2);
  });

  it("rolls back after webhook reconciliation returns false and permits a retry", async () => {
    mocks.reconcileWebhook
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    mocks.execute.mockResolvedValueOnce({ rows: [{ user_id: "user_1" }] });
    const confirm = await confirmationHandler();

    await expect(confirm({ request: request() })).resolves.toMatchObject({
      status: 503,
    });
    expect(mocks.state.phase).toBe("email_configured");

    await expect(confirm({ request: request() })).resolves.toMatchObject({
      status: 200,
    });
    expect(mocks.update).toHaveBeenCalledTimes(3);
  });

  it("rolls back after atomic confirmation returns false and permits a retry", async () => {
    mocks.reconcileWebhook.mockResolvedValue(true);
    mocks.execute
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ user_id: "user_1" }] });
    const confirm = await confirmationHandler();

    await expect(confirm({ request: request() })).resolves.toMatchObject({
      status: 409,
    });
    expect(mocks.state.phase).toBe("email_configured");

    await expect(confirm({ request: request() })).resolves.toMatchObject({
      status: 200,
    });
    expect(mocks.update).toHaveBeenCalledTimes(3);
  });

  it("rolls back when confirmation work throws", async () => {
    mocks.reconcileWebhook.mockRejectedValueOnce(
      new Error("Stripe unavailable"),
    );
    const confirm = await confirmationHandler();

    await expect(confirm({ request: request() })).resolves.toMatchObject({
      status: 409,
    });
    expect(mocks.state.phase).toBe("email_configured");
  });
});
