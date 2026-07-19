import { describe, expect, test } from "vitest";
import { readMarketingSource } from "./source-test-utils";

const TITLE = "Stripe Smart Retries: Limits & Alternatives | Dunlo";
const DESCRIPTION =
  "Learn how Stripe Smart Retries works, which payment failures need customer action, and when SaaS teams need a broader failed-payment recovery workflow.";
const H1 = "Stripe Smart Retries: what it covers and when SaaS needs more";

const pageSource = readMarketingSource(
  "src/app/stripe-smart-retries-alternative/page.tsx",
);
const normalizedPageSource = pageSource.replace(/\s+/g, " ");
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

  test("distinguishes Smart Retries from Stripe Revenue Recovery", () => {
    const requiredCopy = [
      "Smart Retries optimizes timing. Dunlo adds the human layer.",
      "Stripe Billing's broader Revenue Recovery suite already provides native emails, hosted update pages, analytics, customer recovery views, and automations.",
      "Dunlo adds failure-specific customer copy, founder-reviewed outreach, and a focused queue for teams that want a more hands-on recovery layer.",
    ];
    const requiredSources = [
      "https://docs.stripe.com/billing/revenue-recovery/recovery-analytics",
      "https://docs.stripe.com/billing/automations",
    ];
    const staleClaims = [
      "Smart Retries retries. Dunlo recovers.",
      "Dunlo handles the customer message, update link, owner visibility,",
      "If you use Stripe and want failed-payment emails",
      "it does not create a full customer recovery workflow with failure-specific copy, founder review, recovered revenue reporting",
      "You do not need customer-specific recovery emails yet.",
    ];

    for (const copy of requiredCopy) {
      expect(normalizedPageSource).toContain(copy);
    }
    for (const href of requiredSources) {
      expect(pageSource).toContain(`href: "${href}"`);
    }
    for (const claim of staleClaims) {
      expect(normalizedPageSource).not.toContain(claim);
    }
  });
});
