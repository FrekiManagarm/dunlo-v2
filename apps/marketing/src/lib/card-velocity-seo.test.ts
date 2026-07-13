import { describe, expect, test } from "vitest";
import { readMarketingSource } from "./source-test-utils";

const dataSource = readMarketingSource("src/lib/stripe-decline-codes.ts");
const pageSource = readMarketingSource(
  "src/app/stripe-decline-codes/[slug]/page.tsx",
);
const broadArticle = readMarketingSource(
  "content/blog/stripe-failure-codes-the-complete-guide.mdx",
);
const sitemap = readMarketingSource("src/app/sitemap.ts");
const title = "Stripe card_velocity_exceeded: Meaning & Fix | Dunlo";
const description =
  "Learn what Stripe card_velocity_exceeded means, when to retry the payment, and how to guide customers toward issuer approval or another payment method.";
const openingAnswer =
  "Stripe card_velocity_exceeded usually means the issuer applied a spending or velocity limit. Ask the customer to contact the issuer or use another payment method, and retry only when Stripe indicates another attempt may help.";
const searchIntent =
  "SaaS teams need to know whether another attempt is appropriate and which customer action can recover the invoice after this issuer limit.";
const retryTiming =
  "Use Stripe Smart Retries or retry only when the PaymentIntent outcome advice_code is try_again_later. Otherwise, ask the customer to contact the issuer or use another payment method.";
const workflowStep =
  "Use Stripe's advice code to decide whether another retry is appropriate.";
const dedicatedParagraph =
  "This code usually signals an issuer limit rather than a broken subscription. Check Stripe's advice code before another attempt; otherwise give the customer an issuer-approval or alternate-payment path. Read the [Stripe card_velocity_exceeded recovery guide](/stripe-decline-codes/card-velocity-exceeded) for the full customer message, timing, and escalation workflow.";

describe("card velocity SEO owner", () => {
  test("uses focused metadata and an action-oriented opening", () => {
    expect(title.length).toBeLessThanOrEqual(60);
    expect(description.length).toBeGreaterThanOrEqual(150);
    expect(description.length).toBeLessThanOrEqual(160);
    expect(dataSource).toContain(JSON.stringify(title));
    expect(dataSource).toContain(JSON.stringify(description));
    expect(dataSource).toContain(
      "Stripe card_velocity_exceeded: what it means and how to recover the payment",
    );
    expect(dataSource).toContain('dateModified: "2026-07-13"');
    expect(pageSource).toContain("guide.openingAnswer ??");
    expect(pageSource).toContain("guide.dateModified ??");
    expect(sitemap).toContain(
      'lastModified: guide.dateModified ?? "2026-07-03"',
    );
  });

  test("keeps one detailed article link from the broad guide", () => {
    const href = "/stripe-decline-codes/card-velocity-exceeded";
    expect(broadArticle.match(new RegExp(href, "g"))).toHaveLength(1);
    expect(broadArticle).toContain(
      `[Stripe card_velocity_exceeded recovery guide](${href})`,
    );
  });

  test("keeps the detail-page recovery links", () => {
    for (const href of [
      "/stripe-decline-codes",
      "/stripe-dunning",
      "/stripe-dunning-schedule-calculator",
    ]) {
      expect(pageSource).toContain(href);
    }
  });

  test("uses Stripe advice instead of fixed retry timing", () => {
    for (const guidance of [
      openingAnswer,
      searchIntent,
      retryTiming,
      workflowStep,
    ]) {
      expect(dataSource).toContain(JSON.stringify(guidance));
    }
    expect(dataSource).not.toContain("Wait at least 24 hours");
    expect(broadArticle).toContain('updated: "2026-07-13"');
    expect(broadArticle).not.toContain("Wait at least 24 hours");
    expect(broadArticle).not.toContain("Wait 24h+");
    expect(broadArticle).toContain(dedicatedParagraph);
  });
});
