import { describe, expect, test } from "vitest";
import { readMarketingSource } from "./source-test-utils";

const source = readMarketingSource("src/app/stripe-failed-payments/page.tsx");

describe("failed-payment pillar links", () => {
  test("links contextually to all four refreshed owners", () => {
    for (const href of [
      "/stripe-smart-retries-alternative",
      "/blog/involuntary-churn-in-saas",
      "/stripe-decline-codes/card-velocity-exceeded",
      "/stripe-dunning",
    ]) {
      expect(source).toContain(`href: "${href}"`);
    }
  });
});
