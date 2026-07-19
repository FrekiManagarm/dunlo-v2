import type { DiagnosticVerdict } from "./types";

export const QUALIFICATION_POLICY_VERSION = "2026-07-18.1";

export type QualificationPlanCode =
  | "mrr_under_25k"
  | "mrr_25k_to_50k"
  | "mrr_50k_plus";

export type QualificationInput = {
  coverageComplete: boolean;
  decisionWindowComplete: boolean;
  dominantCurrency: string | null;
  normalizedMrrUsd: number | null;
  monthlyAddressableUsd: number;
  addressableNowUsd: number;
  fxRateToUsd: number | null;
};

export type QualificationResult = {
  verdict: DiagnosticVerdict;
  planCode: QualificationPlanCode | null;
  planPriceUsd: number | null;
  breakEvenUsd: number | null;
  requiredAddressableUsd: number | null;
  manualFitReviewRequired: boolean;
  qualificationBasis: "historical" | "current_open" | null;
  policyVersion: typeof QUALIFICATION_POLICY_VERSION;
};

type QualificationPlan = {
  code: QualificationPlanCode;
  priceUsd: number;
};

const UNDER_25K_MRR_USD = 2_500_000;
const UNDER_50K_MRR_USD = 5_000_000;
const MANUAL_FIT_REVIEW_MRR_USD = 10_000_000;
const REQUIRED_ADDRESSABLE_MULTIPLIER = 3;

export function qualifyDiagnostic(
  input: QualificationInput,
): QualificationResult {
  assertInput(input);

  if (
    !input.coverageComplete ||
    !input.dominantCurrency?.trim() ||
    input.normalizedMrrUsd === null ||
    input.fxRateToUsd === null
  ) {
    return insufficientData();
  }

  const plan = selectPlan(input.normalizedMrrUsd);
  const requiredAddressableUsd =
    plan.priceUsd * REQUIRED_ADDRESSABLE_MULTIPLIER;
  const manualFitReviewRequired =
    input.normalizedMrrUsd > MANUAL_FIT_REVIEW_MRR_USD;

  if (input.decisionWindowComplete) {
    return qualifiedResult(
      input.monthlyAddressableUsd >= requiredAddressableUsd
        ? "activation_recommended"
        : "monitoring_recommended",
      plan,
      requiredAddressableUsd,
      manualFitReviewRequired,
      "historical",
    );
  }

  if (input.addressableNowUsd >= requiredAddressableUsd) {
    return qualifiedResult(
      "activation_recommended",
      plan,
      requiredAddressableUsd,
      manualFitReviewRequired,
      "current_open",
    );
  }

  return insufficientData();
}

function selectPlan(normalizedMrrUsd: number): QualificationPlan {
  if (normalizedMrrUsd < UNDER_25K_MRR_USD) {
    return { code: "mrr_under_25k", priceUsd: 4_900 };
  }

  if (normalizedMrrUsd < UNDER_50K_MRR_USD) {
    return { code: "mrr_25k_to_50k", priceUsd: 9_900 };
  }

  return { code: "mrr_50k_plus", priceUsd: 19_900 };
}

function qualifiedResult(
  verdict: Extract<
    DiagnosticVerdict,
    "activation_recommended" | "monitoring_recommended"
  >,
  plan: QualificationPlan,
  requiredAddressableUsd: number,
  manualFitReviewRequired: boolean,
  qualificationBasis: "historical" | "current_open",
): QualificationResult {
  return {
    verdict,
    planCode: plan.code,
    planPriceUsd: plan.priceUsd,
    breakEvenUsd: plan.priceUsd,
    requiredAddressableUsd,
    manualFitReviewRequired,
    qualificationBasis,
    policyVersion: QUALIFICATION_POLICY_VERSION,
  };
}

function insufficientData(): QualificationResult {
  return {
    verdict: "insufficient_data",
    planCode: null,
    planPriceUsd: null,
    breakEvenUsd: null,
    requiredAddressableUsd: null,
    manualFitReviewRequired: false,
    qualificationBasis: null,
    policyVersion: QUALIFICATION_POLICY_VERSION,
  };
}

function assertInput(input: QualificationInput): void {
  for (const value of [input.monthlyAddressableUsd, input.addressableNowUsd]) {
    assertMoney(value);
  }

  if (input.normalizedMrrUsd !== null) {
    assertMoney(input.normalizedMrrUsd);
  }

  if (
    input.fxRateToUsd !== null &&
    (!Number.isFinite(input.fxRateToUsd) || input.fxRateToUsd <= 0)
  ) {
    throw new Error("FX rate must be a positive finite number.");
  }
}

function assertMoney(value: number): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error("Normalized amounts must be non-negative safe integers.");
  }
}
