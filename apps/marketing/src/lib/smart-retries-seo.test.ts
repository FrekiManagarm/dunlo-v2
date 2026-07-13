import { describe, expect, test } from "vitest";
import { readMarketingSource } from "./source-test-utils";

const TITLE = "Stripe Smart Retries: Limits & Alternatives | Dunlo";
const DESCRIPTION =
  "Learn how Stripe Smart Retries works, which payment failures need customer action, and when SaaS teams need a broader failed-payment recovery workflow.";
const H1 = "Stripe Smart Retries: what it covers and when SaaS needs more";

const pageSource = readMarketingSource(
  "src/app/stripe-smart-retries-alternative/page.tsx",
);
const sitemapSource = readMarketingSource("src/app/sitemap.ts");

describe("Stripe Smart Retries SEO page", () => {
  test("uses informational-first metadata within search display limits", () => {
    expect(pageSource).toContain(`const TITLE = "${TITLE}";`);
    expect(TITLE.length).toBeLessThanOrEqual(60);
    expect(pageSource).toContain(`  "${DESCRIPTION}";`);
    expect(DESCRIPTION.length).toBeGreaterThanOrEqual(150);
    expect(DESCRIPTION.length).toBeLessThanOrEqual(160);
  });

  test("uses the informational H1 and current modified timestamp", () => {
    expect(pageSource).toContain(`headline: "${H1}"`);
    expect(pageSource).toMatch(
      new RegExp(`<h1[^>]*>\\s*${H1}\\s*</h1>`),
    );
    expect(pageSource).toContain(
      'const MODIFIED_TIME = "2026-07-13T00:00:00.000Z";',
    );
    expect(pageSource).toContain("headline:");
    expect(pageSource).toContain("dateModified: MODIFIED_TIME");
  });

  test("publishes the current sitemap date", () => {
    expect(sitemapSource).toMatch(
      /path: "\/stripe-smart-retries-alternative",\s+lastModified: "2026-07-13"/,
    );
  });

  test.each([
    "/stripe-dunning",
    "/stripe-failed-payment-recovery-software",
    "/benchmark",
  ])("links explicitly to related guide %s", (href) => {
    expect(pageSource).toContain(`href: "${href}"`);
  });

  test.each([
    "https://docs.stripe.com/billing/revenue-recovery/smart-retries",
    "https://docs.stripe.com/billing/revenue-recovery",
    "https://docs.stripe.com/api/events/types#event_types-invoice.payment_failed",
  ])("retains authoritative Stripe source %s", (href) => {
    expect(pageSource).toContain(`href: "${href}"`);
  });
});
