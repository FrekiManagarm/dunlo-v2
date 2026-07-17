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
    expect(RECOVERY_EXAMPLES).toStrictEqual([
      {
        reason: "Expired card",
        stripeCode: "expired_card",
        customerMeaning: "The customer needs a secure payment update link.",
        action: "Customer action",
        status: "Email ready",
        isExample: true,
      },
      {
        reason: "Insufficient funds",
        stripeCode: "insufficient_funds",
        customerMeaning: "Timing matters more than sending another reminder now.",
        action: "Wait 4 hours",
        status: "Retry scheduled",
        isExample: true,
      },
      {
        reason: "High-value account",
        stripeCode: "founder_threshold",
        customerMeaning: "Keep an important customer relationship human.",
        action: "Founder review",
        status: "Draft prepared",
        isExample: true,
      },
    ]);

    for (const item of RECOVERY_EXAMPLES) {
      expect(Object.hasOwn(item, "companyName")).toBe(false);
      expect(Object.hasOwn(item, "amount")).toBe(false);
      expect(Object.hasOwn(item, "recoveredValue")).toBe(false);
    }
  });

  test("publishes trust facts instead of synthetic customer proof", () => {
    expect(TRUST_ITEMS).toStrictEqual([
      {
        title: "Stripe OAuth",
        body: "Connect without sharing Stripe credentials with Dunlo.",
        href: "/privacy",
      },
      {
        title: "No card storage",
        body: "Payment updates stay inside Stripe-hosted flows.",
        href: "/privacy",
      },
      {
        title: "Founder control",
        body: "Pause sensitive accounts before a recovery message is sent.",
        href: "/#founder-review",
      },
      {
        title: "Free in beta",
        body: "No recovered-revenue cut while Dunlo remains in beta.",
        href: "/#pricing",
      },
    ]);
  });

  test("keeps visible FAQ and JSON-LD content in one source", () => {
    expect(FAQ_ITEMS).toStrictEqual([
      {
        question: "Is this just Stripe Smart Retries with nicer emails?",
        answer:
          "No. Stripe can retry cards. Dunlo handles the customer-facing recovery layer around Stripe: message, timing, founder review, and recovered-payment reporting.",
      },
      {
        question: "Will customers know an automation sent the email?",
        answer:
          "The copy is plain, specific, and tied to the payment reason. High-value or sensitive accounts can pause for founder review before anything is sent.",
      },
      {
        question: "How does Dunlo connect to Stripe?",
        answer:
          "Dunlo uses Stripe OAuth. You authorize access in Stripe and can revoke that connection from Stripe or Dunlo.",
      },
      {
        question: "Does Dunlo store card numbers?",
        answer:
          "No. Card updates happen through Stripe-hosted flows. Dunlo uses payment and subscription context, not full card numbers or CVC data.",
      },
      {
        question: "Do I pay during beta?",
        answer:
          "No. Dunlo is free during beta and does not take a percentage of recovered revenue during that period. Pricing changes will be communicated before billing starts.",
      },
      {
        question: "Can sensitive accounts require founder review?",
        answer:
          "Yes. Important accounts can pause before a message is sent so a founder can review the Stripe context and prepared draft.",
      },
    ]);
  });

  test("keeps pricing and resources intentionally compact", () => {
    expect(PRICING_FEATURES).toStrictEqual([
      "Stripe failure-reason detection",
      "Recovery emails matched to the failure",
      "Stripe-hosted payment update links",
      "Founder review for sensitive accounts",
      "Recovered-payment tracking",
    ]);
    expect(RESOURCE_LINKS).toStrictEqual([
      {
        href: "/stripe-failed-payment-recovery-software",
        title: "Stripe recovery software",
        body: "See the complete failed-payment recovery workflow.",
      },
      {
        href: "/stripe-dunning-schedule-calculator",
        title: "Dunning schedule calculator",
        body: "Plan email timing and retries by failure reason.",
      },
      {
        href: "/stripe-decline-codes",
        title: "Stripe decline codes",
        body: "Translate issuer responses into a useful next step.",
      },
      {
        href: "/benchmark",
        title: "Failed-payment benchmark",
        body: "Estimate failed MRR using visible assumptions.",
      },
    ]);
  });
});
