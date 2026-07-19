import { describe, expect, it } from "vitest";

import {
  DIAGNOSTIC_CATEGORIES,
  DIAGNOSTIC_CHECKPOINTS,
  addMoney,
  diagnosticFindingInputSchema,
  diagnosticVerdictSchema,
  groupMoneyByCurrency,
  normalizeCurrency,
} from "./types";

describe("diagnostic domain invariants", () => {
  it("assigns every finding to one exclusive category", () => {
    expect(DIAGNOSTIC_CATEGORIES).toEqual([
      "naturally_recovered",
      "open_automatable",
      "open_human",
      "historically_lost_automatable",
      "historically_lost_human",
      "excluded",
    ]);

    const finding = diagnosticFindingInputSchema.parse({
      stripeInvoiceId: "in_123",
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_123",
      amount: 1200,
      currency: "EUR",
      failedAt: "2026-07-18T10:00:00.000Z",
      resolvedAt: null,
      invoiceStatus: "open",
      subscriptionStatus: "active",
      adviceCode: null,
      declineCode: "generic_decline",
      category: "open_automatable",
      classifierVersion: "2026-07-18",
      reason: "Retry is supported by the current decline signal.",
    });

    expect(finding).toMatchObject({
      category: "open_automatable",
      classifierVersion: "2026-07-18",
      currency: "eur",
    });

    expect(() =>
      diagnosticFindingInputSchema.parse({
        stripeInvoiceId: "in_123",
        stripeCustomerId: "cus_123",
        stripeSubscriptionId: null,
        amount: 1200,
        currency: "eur",
        failedAt: "2026-07-18T10:00:00.000Z",
        resolvedAt: null,
        invoiceStatus: "open",
        subscriptionStatus: null,
        adviceCode: null,
        declineCode: null,
        category: ["open_automatable", "open_human"],
        classifierVersion: "2026-07-18",
        reason: "A finding cannot have more than one category.",
      }),
    ).toThrow();
  });

  it("accepts only the supported commercial verdicts", () => {
    expect(diagnosticVerdictSchema.options).toEqual([
      "activation_recommended",
      "monitoring_recommended",
      "insufficient_data",
    ]);
    expect(diagnosticVerdictSchema.parse("monitoring_recommended")).toBe(
      "monitoring_recommended",
    );
    expect(() => diagnosticVerdictSchema.parse("declined")).toThrow();
  });

  it("keeps progress checkpoints ordered and explicit", () => {
    expect(DIAGNOSTIC_CHECKPOINTS).toEqual([
      "account_loaded",
      "invoices_loaded",
      "payment_evidence_loaded",
      "revenue_normalized",
      "findings_classified",
      "snapshot_persisted",
    ]);
  });

  it("groups non-negative minor units by normalized currency", () => {
    expect(
      groupMoneyByCurrency([
        { amount: 1200, currency: "EUR" },
        { amount: 300, currency: "eur" },
        { amount: 500, currency: "USD" },
      ]),
    ).toEqual({ eur: 1500, usd: 500 });
    expect(normalizeCurrency(" EUR ")).toBe("eur");
    expect(() => normalizeCurrency("ZZZ")).toThrow(
      /supported Stripe currency/i,
    );
    expect(() =>
      groupMoneyByCurrency([{ amount: -1, currency: "eur" }]),
    ).toThrow(/non-negative/i);
  });

  it("adds money only when both amounts use the same currency", () => {
    expect(
      addMoney(
        { amount: 500, currency: "EUR" },
        { amount: 700, currency: "eur" },
      ),
    ).toEqual({ amount: 1200, currency: "eur" });
    expect(() =>
      addMoney(
        { amount: 500, currency: "eur" },
        { amount: 700, currency: "usd" },
      ),
    ).toThrow(/different currencies/i);
  });
});
