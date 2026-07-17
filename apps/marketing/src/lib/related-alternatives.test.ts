import { describe, expect, test } from "vitest";
import { getRelatedAlternativeSlugs } from "./related-alternatives";

describe("getRelatedAlternativeSlugs", () => {
  test("returns the curated comparisons for Churn Buster", () => {
    expect(getRelatedAlternativeSlugs("churn-buster")).toEqual([
      "churnkey",
      "retryfix",
      "stripe-customer-emails",
    ]);
  });

  test("falls back to three unique comparisons without linking to itself", () => {
    const relatedSlugs = getRelatedAlternativeSlugs(
      "stripe-customer-emails",
    );

    expect(relatedSlugs).toHaveLength(3);
    expect(new Set(relatedSlugs).size).toBe(3);
    expect(relatedSlugs).not.toContain("stripe-customer-emails");
  });
});
