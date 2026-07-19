import { describe, expect, it, vi } from "vitest";

vi.mock("@dunlo-v2/db", () => ({ db: {} }));
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
    ).resolves.toBe(true);
    expect(retrieve).toHaveBeenCalledWith("we_stored", {
      stripeAccount: "acct_connected",
    });
  });

  it.each([new Error("stale endpoint"), new Error("No such webhook endpoint")])(
    "treats a stale or missing remote endpoint as invalid without throwing",
    async (error) => {
      const retrieve = vi.fn().mockRejectedValue(error);
      const { verifyStoredWebhook } = await import("./stripe-webhooks");

      await expect(
        verifyStoredWebhook(retrieve, "we_stored", "acct_connected"),
      ).resolves.toBe(false);
    },
  );
});
