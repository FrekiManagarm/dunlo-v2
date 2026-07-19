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

describe("onboarding flow", () => {
  it("derives the guided screen from the persisted diagnostic phase", () => {
    expect(onboardingSource).toContain("diagnosticStateQueryOptions");
    expect(onboardingSource).toContain('phase === "diagnosing"');
    expect(onboardingSource).toContain("diagnostic_ready");
    expect(onboardingSource).not.toContain(".max(4)");
    expect(onboardingSource).not.toContain("Your Stripe benchmark is ready");
  });

  it("redirects the old authenticated benchmark path to diagnostic", () => {
    expect(dashboardBenchmarkSource).toContain('to: "/diagnostic"');
    expect(dashboardBenchmarkSource).not.toContain("userBenchmarkQueryOptions");
  });
});
