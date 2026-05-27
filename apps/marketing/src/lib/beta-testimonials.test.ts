import { describe, expect, test } from "vitest";
import {
  isPublishableBetaTestimonial,
  getPublishableBetaTestimonials,
  type BetaTestimonial,
} from "./beta-testimonials";

const completeTestimonial = {
  founderName: "Maya Kerbrat",
  founderTitle: "Founder",
  companyName: "Ledgerlane",
  mrr: "$18k MRR",
  recoveredPayments: 7,
  recoveredValue: "$1,420 recovered",
  quote:
    "Dunlo showed us failed payments we were missing. The follow-up sequence recovered customers before we had to chase them manually.",
  logoLabel: "Ledgerlane",
  approvedAt: "2026-05-27",
} satisfies BetaTestimonial;

describe("beta testimonials", () => {
  test("only publishes beta testimonials with approval and concrete recovery metrics", () => {
    const draft = { ...completeTestimonial, approvedAt: null };
    const missingMetric = { ...completeTestimonial, recoveredValue: "" };

    expect(isPublishableBetaTestimonial(completeTestimonial)).toBe(true);
    expect(isPublishableBetaTestimonial(draft)).toBe(false);
    expect(isPublishableBetaTestimonial(missingMetric)).toBe(false);
  });

  test("requires direct quotes to stay within the 2-3 sentence limit", () => {
    const longQuote = {
      ...completeTestimonial,
      quote:
        "Dunlo surfaced failed payments fast. The emails worked. We recovered customers. It also made the dashboard easier to trust.",
    };

    expect(isPublishableBetaTestimonial(longQuote)).toBe(false);
  });

  test("keeps publishable testimonials in source order", () => {
    const draft = { ...completeTestimonial, founderName: "Noah Veillet", approvedAt: null };
    const secondApproved = {
      ...completeTestimonial,
      founderName: "Clara Mendes",
      companyName: "Portico Labs",
    };

    expect(
      getPublishableBetaTestimonials([
        completeTestimonial,
        draft,
        secondApproved,
      ]).map((item) => item.companyName),
    ).toEqual(["Ledgerlane", "Portico Labs"]);
  });
});
