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

  it("fences stale authorization, concurrent webhook creation, and pre-activation events", () => {
    const callback = source("src/routes/api/stripe/callback.ts");
    const webhooks = source("src/lib/stripe-webhooks.ts");
    const webhookRoute = source("src/routes/api/stripe/webhook.ts");
    const sequences = source("src/functions/sequences.ts");
    const summary = source("src/components/diagnostic/activation-summary.tsx");

    expect(callback).toContain(
      'eq(stripeConnection.phase, "diagnostic_ready")',
    );
    expect(callback).toContain(
      'eq(diagnosticSnapshot.verdict, "activation_recommended")',
    );
    expect(webhooks).toContain("pg_advisory_xact_lock");
    expect(webhookRoute).toContain("recoveryActivatedAt");
    expect(webhookRoute).toContain("event.created * 1000");
    expect(sequences).toContain("Confirm recovery before activating sequences");
    expect(sequences).toContain('connection?.phase === "recovery_active"');
    expect(summary).toContain("useForm");
    expect(summary).toContain("z.literal(true)");
    expect(source("src/routes/onboarding.tsx")).toContain("ActivationRetry");
  });
});
