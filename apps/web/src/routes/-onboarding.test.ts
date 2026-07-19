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
