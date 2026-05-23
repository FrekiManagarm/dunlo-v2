import { describe, expect, test } from "vitest";
import {
  ALTERNATIVE_LINKS,
  FOOTER_SECTIONS,
  HEADER_NAV_LINKS,
} from "./site-navigation";

describe("public site navigation", () => {
  test("keeps the header focused on conversion and high-intent resources", () => {
    expect(HEADER_NAV_LINKS.map((link) => link.label)).toEqual([
      "Features",
      "Pricing",
      "Benchmark",
      "Blog",
    ]);
  });

  test("groups comparison pages under an alternatives hub", () => {
    expect(ALTERNATIVE_LINKS.map((link) => link.href)).toEqual([
      "/alternatives/churn-buster",
      "/alternatives/paddle-retain",
      "/alternatives/slicker",
      "/alternatives/stripe-smart-retries",
      "/alternatives/triggla",
    ]);

    expect(
      FOOTER_SECTIONS.flatMap((section) => section.links).map(
        (link) => link.href,
      ),
    ).toContain("/alternatives");
  });
});
