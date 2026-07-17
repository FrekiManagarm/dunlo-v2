import { describe, expect, test } from "vitest";
import { readMarketingSource } from "./source-test-utils";

const seoSource = readMarketingSource("src/lib/seo.ts");
const heroSource = readMarketingSource(
  "src/components/landing/hero-content.tsx",
);
const sitemapSource = readMarketingSource("src/app/sitemap.ts");
const productHuntSource = readMarketingSource("src/app/product-hunt/page.tsx");

describe("marketing SEO indexation signals", () => {
  test("uses the approved default homepage title", () => {
    expect(seoSource).toContain("Dunlo — Stripe Payment Recovery for SaaS");
  });

  test("uses the approved homepage hero heading", () => {
    expect(heroSource).toContain(
      "Recover failed Stripe payments before they churn.",
    );
  });

  test.each(["/product-hunt", "/llms.txt", "/pricing.md"])(
    "does not publish %s in the sitemap",
    (path) => {
      expect(sitemapSource).not.toContain(`path: "${path}"`);
    },
  );

  test("keeps the Product Hunt page followable but out of the index", () => {
    expect(productHuntSource).toMatch(
      /robots:\s*\{\s*index:\s*false,\s*follow:\s*true,?\s*\}/,
    );
  });
});
