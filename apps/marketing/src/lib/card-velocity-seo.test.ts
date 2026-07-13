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
});
