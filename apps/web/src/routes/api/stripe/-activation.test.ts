import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) =>
  readFileSync(join(process.cwd(), path), "utf8");

describe("recovery activation boundary", () => {
  it("keeps write authorization bound to an eligible account and reconciles one webhook", () => {
    const activation = source("src/routes/api/stripe/activate.ts");
    const webhooks = source("src/lib/stripe-webhooks.ts");

    expect(activation).toContain('"activation_recommended"');
    expect(activation).toContain("stripeAccountId");
    expect(activation).toContain("session.user.id");
    expect(webhooks).toContain("reconcileWebhook");
    expect(webhooks).not.toContain("setupWebhooks");
  });

  it("seeds disabled workflows and advances email configuration only from write authorization", () => {
    const stripe = source("src/functions/stripe.ts");
    const email = source("src/functions/email-provider.ts");

    expect(stripe).toContain("isActive: options.isActive ?? false");
    expect(email).toContain('eq(stripeConnection.phase, "write_authorized")');
    expect(email).toContain('phase: "email_configured"');
  });

  it("requires explicit final confirmation before future-only recovery begins", () => {
    const confirmation = source("src/routes/api/stripe/recovery/confirm.ts");
    const onboarding = source("src/routes/onboarding.tsx");

    expect(confirmation).toContain("accepted: z.literal(true)");
    expect(confirmation).toContain('eq(stripeConnection.scope, "read_write")');
    expect(confirmation).toContain("webhookEndpointId");
    expect(confirmation).toContain("emailProvider");
    expect(confirmation).toContain('phase: "recovery_active"');
    expect(confirmation).toContain("recovery_activated");
    expect(confirmation).toContain("selectedSequenceIds");
    expect(onboarding).toContain("ActivationSummary");
    expect(onboarding).not.toContain("syncExistingFailedPayments");
  });
});
