import { describe, expect, test } from "vitest";
import { readMarketingSource } from "./source-test-utils";

const source = readMarketingSource("src/app/stripe-dunning/page.tsx");
const sitemap = readMarketingSource("src/app/sitemap.ts");
const title = "Stripe Dunning for SaaS: Recovery Guide | Dunlo";
const description =
  "Learn how Stripe dunning combines retries, customer emails, payment update paths, and recovery measurement to prevent failed-payment churn in SaaS teams.";

describe("Stripe dunning SEO owner", () => {
  test("uses the approved metadata and direct definition", () => {
    expect(title.length).toBeLessThanOrEqual(60);
    expect(description.length).toBeGreaterThanOrEqual(150);
    expect(description.length).toBeLessThanOrEqual(160);
    expect(source).toContain(JSON.stringify(title));
    expect(source).toContain(JSON.stringify(description));
    expect(source).toContain("Stripe dunning for SaaS failed-payment recovery");
    expect(source).toContain(
      "Stripe dunning is the workflow for recovering a failed subscription payment",
    );
    expect(sitemap).toMatch(
      /path: "\/stripe-dunning"[^}]*lastModified: "2026-07-13"/,
    );
    expect(source).toMatch(
      /id="workflow"\s+className="[^"]*scroll-mt-24[^"]*"/,
    );
    expect(source).toMatch(
      /className="[^"]*lg:col-span-2[^"]*"[^>]*>\s*<CtaSection \/>/,
    );
    expect(source).toContain(
      "Stripe Smart Retries optimizes retry timing, and Stripe also provides native recovery emails, hosted update flows, analytics, customer recovery views, and automations. A broader workflow becomes useful when the team needs failure-specific customer copy and founder-reviewed personal outreach for accounts that warrant a human touch.",
    );
  });

  test("links to supporting pages and three Stripe sources", () => {
    for (const href of [
      "/stripe-dunning-schedule-calculator",
      "/stripe-decline-codes",
      "/stripe-failed-payment-recovery-software",
      "https://docs.stripe.com/billing/revenue-recovery",
      "https://docs.stripe.com/billing/revenue-recovery/smart-retries",
      "https://docs.stripe.com/declines/codes",
    ]) {
      expect(source).toContain(href);
    }
    expect(source).toContain("opens in a new tab");
  });
});
