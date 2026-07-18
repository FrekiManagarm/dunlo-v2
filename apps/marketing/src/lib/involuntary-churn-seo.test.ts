import { describe, expect, test } from "vitest";

import { readMarketingSource } from "./source-test-utils";

const source = readMarketingSource("content/blog/involuntary-churn-in-saas.mdx");
const sitemap = readMarketingSource("src/app/sitemap.ts");
const title = "Involuntary Churn in SaaS: Causes & Fixes | Dunlo";
const description =
  "Learn what involuntary churn means for SaaS, how failed payments become churn, how to measure the revenue loss, and which recovery steps reduce it today.";

describe("involuntary churn SEO owner", () => {
  test("declares separate search and editorial metadata", () => {
    expect(title.length).toBeLessThanOrEqual(60);
    expect(description.length).toBeGreaterThanOrEqual(150);
    expect(description.length).toBeLessThanOrEqual(160);
    expect(source).toContain(`seoTitle: "${title}"`);
    expect(source).toContain(`description: "${description}"`);
    expect(source).toContain('updated: "2026-07-13"');
    expect(source).toContain('title: "What Is Involuntary Churn in SaaS?"');
    expect(sitemap).toContain("lastModified: post.updated ?? post.date");
  });

  test("links to calculator, failed-payment pillar, and benchmark", () => {
    for (const href of [
      "/involuntary-churn-calculator",
      "/stripe-failed-payments",
      "/benchmark",
    ]) {
      expect(source).toContain(`](${href})`);
    }
  });

  test("matches the calculator model and current Stripe behavior", () => {
    expect(source).toContain(
      "If you want to estimate the leak before reading, use the free [involuntary churn calculator](/involuntary-churn-calculator). It estimates failed MRR, monthly recovery potential, and annualized upside from your MRR band.",
    );
    expect(source).toContain(
      "Run a directional estimate with your own MRR using the [involuntary churn calculator](/involuntary-churn-calculator). It applies MRR-band failure rates and a 62% illustrative modeled recovery assumption, so compare the result with actual failed invoices in Stripe.",
    );
    expect(source).not.toContain("card_expired");
    expect(source).toContain("| Expired card | `expired_card` |");
    expect(source).toContain("https://docs.stripe.com/payments/cards/overview");
    expect(source).toContain("https://docs.stripe.com/testing");
    expect(source).not.toContain("Turn on Stripe's card account updater");
  });

  test("cites primary and industry sources", () => {
    for (const url of [
      "https://stripe.com/blog/how-we-built-it-smart-retries",
      "https://docs.stripe.com/billing/revenue-recovery",
      "https://www.paddle.com/resources/payment-failure",
    ]) {
      expect(source).toContain(url);
    }
  });

  test("labels the table as a planning scenario", () => {
    expect(source).toContain(
      "This is a planning scenario, not a universal SaaS benchmark.",
    );
  });
});
