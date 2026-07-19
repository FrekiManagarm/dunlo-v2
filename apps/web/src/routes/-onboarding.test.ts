import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const onboardingSource = readFileSync(
  join(process.cwd(), "src/routes/onboarding.tsx"),
  "utf8",
);

const dashboardBenchmarkSource = readFileSync(
  join(process.cwd(), "src/routes/dashboard.benchmark.tsx"),
  "utf8",
);

const dashboardDiagnosticSource = readFileSync(
  join(process.cwd(), "src/routes/_dashboard/diagnostic.tsx"),
  "utf8",
);

const diagnosticQueriesSource = readFileSync(
  join(process.cwd(), "src/lib/queries.ts"),
  "utf8",
);

describe("onboarding flow", () => {
  it("derives the guided screen from the persisted diagnostic phase", () => {
    expect(onboardingSource).toContain("diagnosticStateQueryOptions");
    expect(onboardingSource).toContain('phase === "diagnosing"');
    expect(onboardingSource).toContain("diagnostic_ready");
    expect(onboardingSource).not.toContain(".max(4)");
    expect(onboardingSource).not.toContain("Your Stripe benchmark is ready");
    expect(onboardingSource).toContain("/api/stripe/connect?intent=activation");
    expect(onboardingSource).toContain(
      "connectionId=${encodeURIComponent(connectionId)}",
    );
    expect(onboardingSource).toContain('setMonitoringStatus("enabled")');
    expect(onboardingSource).not.toContain('"current"');
    expect(onboardingSource).toContain(
      "Your Stripe connection remains read-only",
    );
    expect(onboardingSource).toContain(
      "Recovery and monitoring are\n          not enabled",
    );
    expect(onboardingSource).toContain(
      'active={state.phase === "recovery_active"}',
    );
  });

  it("redirects the old authenticated benchmark path to diagnostic", () => {
    expect(dashboardBenchmarkSource).toContain('to: "/diagnostic"');
    expect(dashboardBenchmarkSource).not.toContain("userBenchmarkQueryOptions");
  });

  it("gives the dashboard report usable activation and monitoring callbacks", () => {
    expect(dashboardDiagnosticSource).toContain(
      "/api/stripe/connect?intent=activation",
    );
    expect(dashboardDiagnosticSource).toContain("enableMonitoring");
    expect(dashboardDiagnosticSource).toContain("onKeepReadOnly");
  });

  it("polls an idle or running diagnostic using its connection id", () => {
    expect(diagnosticQueriesSource).toContain(
      '["diagnostic", "state", connectionId]',
    );
    expect(diagnosticQueriesSource).toContain("shouldPollDiagnosticProgress");
    expect(diagnosticQueriesSource).not.toContain('"current"');
  });
});
