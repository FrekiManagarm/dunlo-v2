import { describe, expect, test } from "vitest";
import { getBlogModifiedDate, getBlogSeoTitle } from "./blog-seo";

describe("blog SEO metadata", () => {
  test("prefers the SEO title over the editorial title", () => {
    expect(
      getBlogSeoTitle({
        title: "What Is Involuntary Churn in SaaS?",
        seoTitle: "Involuntary Churn in SaaS: Causes & Fixes | Dunlo",
      }),
    ).toBe("Involuntary Churn in SaaS: Causes & Fixes | Dunlo");
  });

  test("falls back to the editorial title with the blog suffix", () => {
    expect(getBlogSeoTitle({ title: "What Is Involuntary Churn in SaaS?" })).toBe(
      "What Is Involuntary Churn in SaaS? - Dunlo Blog",
    );
  });

  test("prefers the updated date and falls back to the publication date", () => {
    expect(getBlogModifiedDate({ date: "2026-05-01", updated: "2026-06-15" })).toBe(
      "2026-06-15",
    );
    expect(getBlogModifiedDate({ date: "2026-05-01" })).toBe("2026-05-01");
  });
});
