import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

import { readMarketingSource } from "./source-test-utils";

const pricing = readMarketingSource("public/pricing.md");
const llms = readMarketingSource("public/llms.txt");
const alternativePage = readMarketingSource(
  "src/components/alternatives/alternative-page.tsx",
);
const welcomeGuide = readFileSync(
  resolve(process.cwd(), "apps/web/src/components/welcome-guide.tsx"),
  "utf8",
);
const assumptions = readMarketingSource("src/lib/recovery-assumptions.ts");
const allPublicCopy = [pricing, llms, alternativePage, welcomeGuide].join("\n");

describe("public product truth", () => {
  test("removes obsolete pricing and recovery claims", () => {
    expect(allPublicCopy).not.toMatch(/\$19(?:\/mo|\/month)?/i);
    expect(allPublicCopy).not.toMatch(/recover 40[–-]60%/i);
    expect(pricing).not.toMatch(/^## (Solo|Starter|Growth|Scale)$/m);
    expect(pricing).toContain("Free during beta");
    expect(pricing).toContain("before billing starts");
    expect(llms).toContain("Dunlo is free during beta.");
    expect(llms).toContain(
      "Future pricing will be communicated before billing starts. No customer will be charged without notice and consent.",
    );
  });

  test("names calculator values as modeled assumptions", () => {
    expect(assumptions).toContain("MODELED_RECOVERY_ASSUMPTION_RATE");
    expect(assumptions).not.toContain("RECOVERABILITY_RATE");
  });
});
