import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const retrieve = vi.fn();
  const list = vi.fn();
  const create = vi.fn();
  const updateSet = vi.fn();
  const updateWhere = vi.fn();
  const selectLimit = vi.fn();
  const query = {
    from: () => query,
    where: () => query,
    limit: selectLimit,
  };

  return {
    create,
    list,
    query,
    retrieve,
    selectLimit,
    updateSet,
    updateWhere,
  };
});

vi.mock("stripe", () => ({
  default: class {
    webhookEndpoints = {
      create: mocks.create,
      del: vi.fn(),
      list: mocks.list,
      retrieve: mocks.retrieve,
    };
  },
}));

vi.mock("@dunlo-v2/db", () => ({
  db: {
    select: () => mocks.query,
    update: () => ({ set: mocks.updateSet }),
  },
}));
vi.mock("@dunlo-v2/db/encrypt", () => ({
  decrypt: (value: string) => value,
  encrypt: (value: string) => value,
}));
vi.mock("@dunlo-v2/db/schema/domain", () => ({
  stripeConnection: {},
}));
vi.mock("@dunlo-v2/env/server", () => ({
  env: { APP_URL: "https://app.dunlo.test" },
}));

describe("verifyStoredWebhook", () => {
  it("remotely validates the stored endpoint for its connected Stripe account", async () => {
    const retrieve = vi.fn().mockResolvedValue({ id: "we_stored" });
    const { verifyStoredWebhook } = await import("./stripe-webhooks");

    await expect(
      verifyStoredWebhook(retrieve, "we_stored", "acct_connected"),
    ).resolves.toBe("valid");
    expect(retrieve).toHaveBeenCalledWith("we_stored", {
      stripeAccount: "acct_connected",
    });
  });

  it("identifies a definitive Stripe 404 as a missing stored endpoint", async () => {
    const retrieve = vi.fn().mockRejectedValue({ statusCode: 404 });
    const { verifyStoredWebhook } = await import("./stripe-webhooks");

    await expect(
      verifyStoredWebhook(retrieve, "we_stored", "acct_connected"),
    ).resolves.toBe("missing");
  });

  it.each([new Error("timeout"), { statusCode: 429 }, { statusCode: 500 }])(
    "identifies a transient Stripe failure as retryable",
    async (error) => {
      const retrieve = vi.fn().mockRejectedValue(error);
      const { verifyStoredWebhook } = await import("./stripe-webhooks");

      await expect(
        verifyStoredWebhook(retrieve, "we_stored", "acct_connected"),
      ).resolves.toBe("retryable");
    },
  );
});

describe("reconcileWebhook", () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.retrieve.mockReset();
    mocks.list.mockReset();
    mocks.create.mockReset();
    mocks.updateSet.mockReset().mockImplementation(() => ({
      where: mocks.updateWhere,
    }));
    mocks.updateWhere.mockReset().mockResolvedValue(undefined);
    mocks.selectLimit
      .mockReset()
      .mockResolvedValue([
        { webhookEndpointId: "we_stored", webhookSecret: "whsec_stored" },
      ]);
  });

  it("clears and replaces credentials only after Stripe confirms the endpoint is missing", async () => {
    mocks.retrieve.mockRejectedValue({ statusCode: 404 });
    mocks.list.mockResolvedValue({ data: [] });
    mocks.create.mockResolvedValue({
      id: "we_recreated",
      secret: "whsec_recreated",
    });
    const { reconcileWebhook } = await import("./stripe-webhooks");

    await expect(
      reconcileWebhook("acct_connected", "access_token"),
    ).resolves.toEqual({
      webhookEndpointId: "we_recreated",
      webhookSecret: "whsec_recreated",
    });
    expect(mocks.updateSet).toHaveBeenNthCalledWith(1, {
      webhookEndpointId: null,
      webhookSecret: null,
    });
  });

  it.each([new Error("timeout"), { statusCode: 429 }])(
    "retains local credentials and surfaces a retryable failure on transient verification errors",
    async (error) => {
      mocks.retrieve.mockRejectedValue(error);
      const { reconcileWebhook } = await import("./stripe-webhooks");

      await expect(
        reconcileWebhook("acct_connected", "access_token"),
      ).resolves.toBeNull();
      expect(mocks.updateSet).not.toHaveBeenCalled();
      expect(mocks.list).not.toHaveBeenCalled();
      expect(mocks.create).not.toHaveBeenCalled();
    },
  );
});
