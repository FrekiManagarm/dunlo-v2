import { describe, expect, test } from "vitest";
import {
  FAQ_ITEMS,
  PRICING_FEATURES,
  RECOVERY_EXAMPLES,
  RESOURCE_LINKS,
  TRUST_ITEMS,
} from "./landing-content";

describe("landing content", () => {
  test("labels every simulated recovery record as example data", () => {
    expect(RECOVERY_EXAMPLES).toHaveLength(3);
    expect(RECOVERY_EXAMPLES.every((item) => item.isExample)).toBe(true);
    expect(
      RECOVERY_EXAMPLES.every(
        (item) => !item.companyName && !item.amount && !item.recoveredValue,
      ),
    ).toBe(true);
  });

  test("publishes trust facts instead of synthetic customer proof", () => {
    expect(TRUST_ITEMS.map((item) => item.title)).toEqual([
      "Stripe OAuth",
      "No card storage",
      "Founder control",
      "Free in beta",
    ]);
    expect(TRUST_ITEMS.every((item) => item.body.length > 20)).toBe(true);
  });

  test("keeps visible FAQ and JSON-LD content in one source", () => {
    expect(FAQ_ITEMS).toHaveLength(6);
    expect(FAQ_ITEMS.every((item) => item.question && item.answer)).toBe(true);
  });

  test("keeps pricing and resources intentionally compact", () => {
    expect(PRICING_FEATURES).toHaveLength(5);
    expect(RESOURCE_LINKS).toHaveLength(4);
  });
});
