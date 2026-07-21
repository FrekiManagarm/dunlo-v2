import { describe, expect, it } from "vitest";

import {
  QUALIFICATION_POLICY_VERSION,
  qualifyDiagnostic,
  type QualificationInput,
} from "./qualification";

const baseInput = (
  overrides: Partial<QualificationInput> = {},
): QualificationInput => ({
  coverageComplete: true,
  decisionWindowComplete: true,
  dominantCurrency: "usd",
  normalizedMrrUsd: 2_499_999,
  monthlyAddressableUsd: 14_700,
  addressableNowUsd: 0,
  fxRateToUsd: 1,
  ...overrides,
});

describe("qualifyDiagnostic", () => {
  it.each([
    [2_499_999, "mrr_under_25k", 4_900],
    [2_500_000, "mrr_25k_to_50k", 9_900],
    [4_999_999, "mrr_25k_to_50k", 9_900],
    [5_000_000, "mrr_50k_plus", 19_900],
  ] as const)(
    "selects the correct plan at MRR %i",
    (normalizedMrrUsd, planCode, planPriceUsd) => {
      expect(
        qualifyDiagnostic(
          baseInput({
            normalizedMrrUsd,
            monthlyAddressableUsd: planPriceUsd * 3,
          }),
        ),
      ).toMatchObject({
        planCode,
        planPriceUsd,
        requiredAddressableUsd: planPriceUsd * 3,
      });
    },
  );

  it.each([
    [2_499_999, 4_900],
    [2_500_000, 9_900],
    [5_000_000, 19_900],
  ] as const)(
    "recommends activation exactly at the 3x threshold for a $%i plan",
    (normalizedMrrUsd, planPriceUsd) => {
      expect(
        qualifyDiagnostic(
          baseInput({
            normalizedMrrUsd,
            monthlyAddressableUsd: planPriceUsd * 3,
          }),
        ),
      ).toMatchObject({
        verdict: "activation_recommended",
        planPriceUsd,
        breakEvenUsd: planPriceUsd,
        requiredAddressableUsd: planPriceUsd * 3,
      });

      expect(
        qualifyDiagnostic(
          baseInput({
            normalizedMrrUsd,
            monthlyAddressableUsd: planPriceUsd * 3 - 1,
          }),
        ).verdict,
      ).toBe("monitoring_recommended");
    },
  );

  it("keeps above-$100k MRR accounts visible for manual fit review", () => {
    expect(
      qualifyDiagnostic(
        baseInput({
          normalizedMrrUsd: 10_000_001,
          monthlyAddressableUsd: 59_700,
        }),
      ),
    ).toMatchObject({
      verdict: "activation_recommended",
      planCode: "mrr_50k_plus",
      manualFitReviewRequired: true,
    });
  });

  it("can qualify a current open addressable amount without complete history", () => {
    expect(
      qualifyDiagnostic(
        baseInput({
          decisionWindowComplete: false,
          monthlyAddressableUsd: 0,
          addressableNowUsd: 14_700,
        }),
      ),
    ).toEqual({
      verdict: "activation_recommended",
      planCode: "mrr_under_25k",
      planPriceUsd: 4_900,
      breakEvenUsd: 4_900,
      requiredAddressableUsd: 14_700,
      manualFitReviewRequired: false,
      qualificationBasis: "current_open",
      policyVersion: QUALIFICATION_POLICY_VERSION,
    });
  });

  it("does not issue a commercial verdict when pagination coverage is incomplete", () => {
    expect(
      qualifyDiagnostic(
        baseInput({ coverageComplete: false, addressableNowUsd: 999_999 }),
      ),
    ).toMatchObject({ verdict: "insufficient_data", planCode: null });
  });

  it("does not issue a commercial verdict without a dominant currency", () => {
    expect(
      qualifyDiagnostic(baseInput({ dominantCurrency: null })),
    ).toMatchObject({ verdict: "insufficient_data", planCode: null });
  });

  it("does not issue a commercial verdict without a usable FX reference", () => {
    expect(qualifyDiagnostic(baseInput({ fxRateToUsd: null }))).toMatchObject({
      verdict: "insufficient_data",
      planCode: null,
    });
  });
});
