import { describe, expect, it, vi } from "vitest";

import { decryptOptionalWebhookSecret } from "../lib/stripe-connection";

describe("Stripe connection credential decoding", () => {
  it("keeps an initial read-only connection usable when it has no webhook secret", async () => {
    const decrypt = vi.fn((value: string) => `plain:${value}`);
    expect(decryptOptionalWebhookSecret(null, decrypt)).toBeNull();
    expect(decrypt).not.toHaveBeenCalled();
    expect(decryptOptionalWebhookSecret("encrypted", decrypt)).toBe(
      "plain:encrypted",
    );
  });
});
