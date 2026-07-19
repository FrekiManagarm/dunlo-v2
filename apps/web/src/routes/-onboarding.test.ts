import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const onboardingSource = readFileSync(
  join(process.cwd(), "src/routes/onboarding.tsx"),
  "utf8",
);

const stripeCallbackSource = readFileSync(
  join(process.cwd(), "src/routes/api/stripe/callback.ts"),
  "utf8",
);

const stripeConnectSource = readFileSync(
  join(process.cwd(), "src/routes/api/stripe/connect.ts"),
  "utf8",
);

const dashboardBenchmarkSource = readFileSync(
  join(process.cwd(), "src/routes/dashboard.benchmark.tsx"),
  "utf8",
);

describe("onboarding flow", () => {
  it("starts a read-only diagnostic OAuth flow before any activation", () => {
    expect(stripeConnectSource).toContain('intent === "diagnostic"');
    expect(stripeConnectSource).toContain('"read_only"');
    expect(stripeConnectSource).toContain("diagnostic_oauth_started");
    expect(stripeCallbackSource).toContain('scope: "read_only"');
    expect(stripeCallbackSource).toContain('phase: "diagnosing"');
    expect(stripeCallbackSource).toContain("triggerDiagnostic");
    expect(stripeCallbackSource).not.toContain("importExistingFailedPayments");
    const diagnosticBranch = stripeCallbackSource.slice(
      stripeCallbackSource.indexOf('if (oauthState.intent === "diagnostic")'),
      stripeCallbackSource.indexOf('token.scope !== "read_write"'),
    );
    expect(diagnosticBranch).not.toContain("setupWebhooks");
    expect(diagnosticBranch).not.toContain("seedDefaultSequences");
    expect(diagnosticBranch).toContain(
      'await triggerDiagnostic({ connectionId, reason: "initial" })',
    );
    expect(diagnosticBranch).toContain("webhookEndpointId: null");
    expect(diagnosticBranch).toContain("webhookSecret: null");
  });

  it("keeps write authorization isolated to the activation intent", () => {
    expect(stripeConnectSource).toContain('intent === "activation"');
    expect(stripeConnectSource).toContain('"read_write"');
    expect(stripeConnectSource).toContain("diagnostic_activation_started");
    expect(stripeCallbackSource).toContain('scope: "read_write"');
    expect(stripeCallbackSource).toContain('phase: "write_authorized"');
    expect(stripeCallbackSource).toContain("stripe_account_mismatch");
    expect(stripeCallbackSource).toContain("setupWebhooks");
    expect(stripeCallbackSource).toContain("seedDefaultSequences");
    expect(stripeCallbackSource).toContain(
      "await seedDefaultSequences(session.user.id, { isActive: false })",
    );
    expect(stripeConnectSource).toContain('"/onboarding?step=3"');
  });

  it("includes benchmark review as the second onboarding step", () => {
    expect(onboardingSource).toContain(".max(4)");
    expect(onboardingSource).toContain("Step {step} of 4");
    expect(onboardingSource).toContain("Your Stripe benchmark is ready");
    expect(onboardingSource).toContain(
      "Similar SaaS companies average {formatRate(benchmark.averageRate)}",
    );
  });

  it("continues from the standalone benchmark page to email setup", () => {
    expect(dashboardBenchmarkSource).toContain(
      "search={{ step: 3, error: undefined, msg: undefined }}",
    );
    expect(dashboardBenchmarkSource).not.toContain(
      "search={{ step: 2, error: undefined, msg: undefined }}",
    );
  });
});
