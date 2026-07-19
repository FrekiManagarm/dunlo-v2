import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const repoRoot = resolve(import.meta.dirname, "../../../../..");

const surfaces = [
  "apps/marketing/src/components/blog-index.tsx",
  "apps/marketing/src/app/blog/[slug]/page.tsx",
  "apps/marketing/src/components/privacy-page.tsx",
  "apps/marketing/src/components/terms-page.tsx",
  "apps/marketing/src/components/public-benchmark.tsx",
  "apps/marketing/src/components/compare/compare-page.tsx",
  "apps/marketing/src/components/alternatives-index.tsx",
  "apps/marketing/src/components/alternatives/alternative-page.tsx",
  "apps/marketing/src/app/product-hunt/page.tsx",
  "apps/marketing/src/app/state-of-stripe-payments-2026/page.tsx",
  "apps/marketing/src/app/mrr-at-risk/page.tsx",
  "apps/marketing/src/app/stripe-dunning/page.tsx",
  "apps/marketing/src/app/stripe-decline-codes/page.tsx",
  "apps/marketing/src/app/stripe-decline-codes/[slug]/page.tsx",
  "apps/marketing/src/app/stripe-failed-payments/page.tsx",
  "apps/marketing/src/app/stripe-failed-payment-email-templates/page.tsx",
  "apps/marketing/src/app/stripe-failed-payment-recovery-software/page.tsx",
  "apps/marketing/src/app/stripe-smart-retries-alternative/page.tsx",
  "apps/marketing/src/app/stripe-dunning-schedule-calculator/page.tsx",
] as const;

const sourceBySurface = surfaces.map((path) => ({
  path,
  source: readFileSync(resolve(repoRoot, path), "utf8"),
}));

describe("marketing design system contract", () => {
  test("uses the landing page palette across every marketing family", () => {
    for (const { path, source } of sourceBySurface) {
      expect(source, path).toContain("dunlo-ink");
      expect(source, path).toContain("dunlo");
    }
  });

  test("keeps subpage heroes on the shared dark and green direction", () => {
    const heroSurfaces = sourceBySurface.filter(
      ({ path }) => !path.includes("privacy") && !path.includes("terms"),
    );

    for (const { path, source } of heroSurfaces) {
      expect(source, path).toContain("bg-dunlo-ink");
    }

    expect(
      readFileSync(
        resolve(repoRoot, "apps/marketing/src/components/privacy-page.tsx"),
        "utf8",
      ),
    ).toContain("bg-dunlo-ink");
    expect(
      readFileSync(
        resolve(repoRoot, "apps/marketing/src/components/terms-page.tsx"),
        "utf8",
      ),
    ).toContain("bg-dunlo-ink");
  });

  test("removes the superseded marketing visual language", () => {
    const bannedPatterns = [
      /bg-stone-(50|100)/,
      /rounded-\[(1\.35|1\.5|1\.75|2)rem\]/,
      /shadow-\[/,
      /bg-\[(linear|radial)-gradient/,
      /border-l-[234]/,
      /BlogNav/,
    ];

    for (const { path, source } of sourceBySurface) {
      for (const pattern of bannedPatterns) {
        expect(source, `${path}: ${pattern}`).not.toMatch(pattern);
      }
    }
  });

  test("uses the shared navigation on editorial and legal surfaces", () => {
    const sharedShellSurfaces = [
      "apps/marketing/src/app/blog/page.tsx",
      "apps/marketing/src/app/blog/[slug]/page.tsx",
      "apps/marketing/src/components/privacy-page.tsx",
      "apps/marketing/src/components/terms-page.tsx",
      "apps/marketing/src/components/alternatives/alternative-page.tsx",
    ];

    for (const path of sharedShellSurfaces) {
      const source = readFileSync(resolve(repoRoot, path), "utf8");
      expect(source, path).toContain("<Nav />");
      expect(source, path).toContain("<Footer />");
    }
  });
});
