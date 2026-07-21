import { describe, expect, it } from "vitest";

import { buildDiagnosticExport } from "./export";

describe("buildDiagnosticExport", () => {
  it("exports a privacy-safe, versioned current diagnostic with original-currency totals", () => {
    const exported = buildDiagnosticExport({
      exportedAt: new Date("2026-07-19T10:00:00.000Z"),
      snapshot: {
        verdict: "monitoring_recommended",
        analysisStartsAt: new Date("2026-06-19T00:00:00.000Z"),
        analysisEndsAt: new Date("2026-07-19T00:00:00.000Z"),
        decisionWindowComplete: true,
        coverageComplete: false,
        pagesLoaded: 3,
        recordsLoaded: 14,
        fixedMrr: 12000,
        variableMrr: 2500,
        limitedConfidenceMrr: 400,
        excludedMrr: 100,
        dominantCurrency: "eur",
        dominantCurrencyShareBps: 7500,
        observedFailed: 14,
        naturallyRecovered: 4,
        openAutomatable: 6,
        openHuman: 2,
        historicallyLostAutomatable: 1,
        historicallyLostHuman: 1,
        excludedAmount: 100,
        monthlyAddressable: 7500,
        addressableNow: 6100,
        classifierVersion: "addressability-v3",
        qualificationVersion: "qualification-v2",
        fxSource: "ECB",
        fxSeriesKeys: ["EXR.D.USD.EUR.SP00.A"],
        fxRateDate: "2026-07-18",
        fxFetchedAt: new Date("2026-07-18T08:00:00.000Z"),
        fxRateToUsd: "1.17",
        failureCategory: "partial_source_coverage",
      },
      findings: [
        { amount: 3000, currency: "usd", category: "open_automatable" },
        { amount: 2000, currency: "eur", category: "open_human" },
        { amount: 500, currency: "usd", category: "excluded" },
      ],
    });

    expect(exported).toMatchObject({
      schemaVersion: "dunlo-diagnostic/v1",
      exportedAt: "2026-07-19T10:00:00.000Z",
      diagnostic: {
        summary: {
          verdict: "monitoring_recommended",
          monthlyAddressable: 7500,
          originalCurrencyTotals: [
            { currency: "eur", amount: 2000, findingCount: 1 },
            { currency: "usd", amount: 3500, findingCount: 2 },
          ],
        },
        calculationPolicy: {
          classifierVersion: "addressability-v3",
          qualificationVersion: "qualification-v2",
        },
        coverage: {
          complete: false,
          failureCategory: "partial_source_coverage",
          pagesLoaded: 3,
          recordsLoaded: 14,
        },
        fx: {
          source: "ECB",
          seriesKeys: ["EXR.D.USD.EUR.SP00.A"],
          rateDate: "2026-07-18",
          fetchedAt: "2026-07-18T08:00:00.000Z",
          rateToUsd: "1.17",
        },
      },
    });
  });

  it("does not include identifiers, credentials, or customer PII", () => {
    const serialized = JSON.stringify(
      buildDiagnosticExport({
        exportedAt: new Date("2026-07-19T10:00:00.000Z"),
        snapshot: {
          verdict: "not_recommended",
          analysisStartsAt: new Date("2026-06-19T00:00:00.000Z"),
          analysisEndsAt: new Date("2026-07-19T00:00:00.000Z"),
          decisionWindowComplete: true,
          coverageComplete: true,
          pagesLoaded: 1,
          recordsLoaded: 1,
          fixedMrr: 0,
          variableMrr: 0,
          limitedConfidenceMrr: 0,
          excludedMrr: 0,
          dominantCurrency: "usd",
          dominantCurrencyShareBps: 10000,
          observedFailed: 1,
          naturallyRecovered: 0,
          openAutomatable: 0,
          openHuman: 0,
          historicallyLostAutomatable: 0,
          historicallyLostHuman: 0,
          excludedAmount: 100,
          monthlyAddressable: 0,
          addressableNow: 0,
          classifierVersion: "addressability-v3",
          qualificationVersion: "qualification-v2",
          fxSource: "ECB",
          fxSeriesKeys: [],
          fxRateDate: "2026-07-18",
          fxFetchedAt: new Date("2026-07-18T08:00:00.000Z"),
          fxRateToUsd: "1",
          failureCategory: "none",
        },
        findings: [
          {
            amount: 100,
            currency: "usd",
            category: "excluded",
            stripeCustomerId: "cus_secret",
            customerEmail: "person@example.com",
            accessToken: "sk_secret",
            webhookSecret: "whsec_secret",
          },
        ],
      }),
    );

    expect(serialized).not.toContain("cus_secret");
    expect(serialized).not.toContain("person@example.com");
    expect(serialized).not.toContain("sk_secret");
    expect(serialized).not.toContain("whsec_secret");
  });
});
