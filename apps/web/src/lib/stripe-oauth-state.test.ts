import { describe, expect, it } from "vitest";

import {
  createStripeOAuthState,
  verifyStripeOAuthState,
} from "./stripe-oauth-state";

const secret = "a-test-secret-that-is-long-enough-for-hmac-signing";
const issuedAt = new Date("2026-07-19T10:00:00.000Z");

describe("Stripe OAuth state", () => {
  it("seals the diagnostic nonce, user, intent, issue time, and return path", () => {
    const state = createStripeOAuthState(
      {
        nonce: "nonce_123",
        userId: "user_123",
        intent: "diagnostic",
        issuedAt,
        returnPath: "/onboarding?step=2",
      },
      secret,
    );

    expect(
      verifyStripeOAuthState(state.sealed, {
        nonce: state.nonce,
        userId: "user_123",
        now: new Date("2026-07-19T10:09:59.999Z"),
        secret,
      }),
    ).toEqual({
      nonce: "nonce_123",
      userId: "user_123",
      intent: "diagnostic",
      targetStripeAccountId: undefined,
      issuedAt: issuedAt.toISOString(),
      returnPath: "/onboarding?step=2",
    });
    expect(state.sealed).not.toContain("user_123");
  });

  it("rejects a tampered sealed state", () => {
    const state = createStripeOAuthState(
      {
        nonce: "nonce_123",
        userId: "user_123",
        intent: "diagnostic",
        issuedAt,
        returnPath: "/onboarding?step=2",
      },
      secret,
    );

    expect(() =>
      verifyStripeOAuthState(`${state.sealed}x`, {
        nonce: state.nonce,
        userId: "user_123",
        now: issuedAt,
        secret,
      }),
    ).toThrow("invalid_oauth_state");
  });

  it("rejects a state presented by a different user", () => {
    const state = createStripeOAuthState(
      {
        nonce: "nonce_123",
        userId: "user_123",
        intent: "diagnostic",
        issuedAt,
        returnPath: "/onboarding?step=2",
      },
      secret,
    );

    expect(() =>
      verifyStripeOAuthState(state.sealed, {
        nonce: state.nonce,
        userId: "user_456",
        now: issuedAt,
        secret,
      }),
    ).toThrow("oauth_state_user_mismatch");
  });

  it("rejects a state after ten minutes", () => {
    const state = createStripeOAuthState(
      {
        nonce: "nonce_123",
        userId: "user_123",
        intent: "diagnostic",
        issuedAt,
        returnPath: "/onboarding?step=2",
      },
      secret,
    );

    expect(() =>
      verifyStripeOAuthState(state.sealed, {
        nonce: state.nonce,
        userId: "user_123",
        now: new Date("2026-07-19T10:10:00.001Z"),
        secret,
      }),
    ).toThrow("oauth_state_expired");
  });

  it("requires a target Stripe account for activation", () => {
    expect(() =>
      createStripeOAuthState(
        {
          nonce: "nonce_123",
          userId: "user_123",
          intent: "activation",
          issuedAt,
          returnPath: "/onboarding?step=3",
        },
        secret,
      ),
    ).toThrow("activation_target_required");
  });
});
