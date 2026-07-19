import type { DiagnosticCategory } from "./types";

export const ADDRESSABILITY_POLICY_VERSION = "2026-07-18.1";

export type FailureEvidence = {
  invoiceStatus: string;
  subscriptionStatus: string | null;
  isRecurring: boolean;
  adviceCode: string | null;
  declineCode: string | null;
  errorCode: string | null;
  isVoluntaryCancellation: boolean;
  hasLegitimatePaymentAction: boolean;
  hasInvoluntaryFailureEvidence: boolean;
  recoveredAfterFailure: boolean;
};

export type ClassificationSourceSignal =
  | "advice_code"
  | "decline_code"
  | "error_code"
  | "exclusion"
  | "lifecycle"
  | "unknown";

export type ClassificationResult = {
  category: DiagnosticCategory;
  reasonCode: string;
  humanReason: string;
  sourceSignal: ClassificationSourceSignal;
  policyVersion: typeof ADDRESSABILITY_POLICY_VERSION;
};

type RecoveryPath = "automatable" | "human";

type RecoverySignal = {
  code: string;
  path: RecoveryPath;
  sourceSignal: "advice_code" | "decline_code" | "error_code";
  humanReason: string;
};

const exclusionCodes = new Set([
  "fraudulent",
  "merchant_blacklist",
  "duplicate",
  "duplicate_transaction",
  "transaction_not_allowed",
  "restricted_card",
  "card_not_supported",
  "currency_not_supported",
  "service_not_allowed",
  "not_permitted",
  "security_violation",
  "api_error",
  "api_connection_error",
  "idempotency_error",
]);

const automatableCodes = new Set([
  "try_again_later",
  "authentication_required",
  "authentication_not_handled",
  "update_payment_method",
  "confirm_card_data",
  "expired_card",
  "incorrect_number",
  "incorrect_cvc",
  "invalid_cvc",
  "invalid_expiry_month",
  "invalid_expiry_year",
  "invalid_number",
  "new_account_information_available",
]);

const humanCodes = new Set([
  "contact_cardholder",
  "refer_to_card_issuer",
  "insufficient_funds",
  "do_not_honor",
]);

const endedSubscriptionStatuses = new Set(["canceled", "ended"]);

export function classifyFailure(evidence: FailureEvidence): ClassificationResult {
  if (evidence.recoveredAfterFailure && evidence.invoiceStatus === "paid") {
    return result(
      "naturally_recovered",
      "naturally_recovered",
      "The failed invoice was later paid without a Dunlo action.",
      "lifecycle",
    );
  }

  const exclusion = findExclusion(evidence);

  if (exclusion) {
    return result("excluded", exclusion, exclusionReason(exclusion), "exclusion");
  }

  const signal = findRecoverySignal(evidence);

  if (!signal) {
    return result(
      "excluded",
      "excluded_unknown",
      "The available payment evidence does not support a safe recovery action.",
      "unknown",
    );
  }

  if (signal.code === "do_not_try_again" && !evidence.hasLegitimatePaymentAction) {
    return result(
      "excluded",
      signal.code,
      "Stripe advises against retrying this payment method and no alternate payment action is available.",
      signal.sourceSignal,
    );
  }

  const category = categoryFor(signal.path, evidence);

  if (!category) {
    const hasHistoricalLifecycle = historicalLifecycle(evidence);

    return result(
      "excluded",
      hasHistoricalLifecycle
        ? "historical_outcome_without_involuntary_failure_evidence"
        : "excluded_unknown",
      hasHistoricalLifecycle
        ? "The historical invoice outcome lacks evidence of an involuntary payment failure."
        : "The available payment evidence does not support a safe recovery action.",
      hasHistoricalLifecycle ? "lifecycle" : "unknown",
    );
  }

  return result(category, signal.code, signal.humanReason, signal.sourceSignal);
}

function findExclusion(evidence: FailureEvidence): string | null {
  if (!evidence.isRecurring) {
    return "non_recurring_invoice";
  }

  if (evidence.isVoluntaryCancellation) {
    return "voluntary_cancellation";
  }

  for (const signal of [
    evidence.errorCode,
    evidence.adviceCode,
    evidence.declineCode,
  ]) {
    const code = normalizeCode(signal);

    if (code && exclusionCodes.has(code)) {
      return code;
    }
  }

  return null;
}

function findRecoverySignal(evidence: FailureEvidence): RecoverySignal | null {
  const adviceCode = normalizeCode(evidence.adviceCode);

  if (adviceCode) {
    return recoverySignal(adviceCode, "advice_code");
  }

  const declineCode = normalizeCode(evidence.declineCode);

  if (declineCode) {
    return recoverySignal(declineCode, "decline_code");
  }

  const errorCode = normalizeCode(evidence.errorCode);

  return errorCode ? recoverySignal(errorCode, "error_code") : null;
}

function recoverySignal(
  code: string,
  sourceSignal: RecoverySignal["sourceSignal"],
): RecoverySignal | null {
  if (code === "do_not_try_again") {
    return {
      code,
      path: "human",
      sourceSignal,
      humanReason:
        "Stripe advises against retrying this payment method; an alternate payment action needs human follow-up.",
    };
  }

  if (automatableCodes.has(code)) {
    return {
      code,
      path: "automatable",
      sourceSignal,
      humanReason: "The payment signal supports an automated recovery workflow.",
    };
  }

  if (humanCodes.has(code)) {
    return {
      code,
      path: "human",
      sourceSignal,
      humanReason: "The payment signal requires customer or issuer follow-up.",
    };
  }

  return null;
}

function categoryFor(
  path: RecoveryPath,
  evidence: FailureEvidence,
): DiagnosticCategory | null {
  if (historicalLifecycle(evidence)) {
    if (!evidence.hasInvoluntaryFailureEvidence) {
      return null;
    }

    return path === "automatable"
      ? "historically_lost_automatable"
      : "historically_lost_human";
  }

  if (evidence.invoiceStatus === "open") {
    return path === "automatable" ? "open_automatable" : "open_human";
  }

  return null;
}

function historicalOutcome(invoiceStatus: string): boolean {
  return invoiceStatus === "void" || invoiceStatus === "uncollectible";
}

function subscriptionEnded(subscriptionStatus: string | null): boolean {
  return subscriptionStatus !== null && endedSubscriptionStatuses.has(subscriptionStatus);
}

function historicalLifecycle(evidence: FailureEvidence): boolean {
  return (
    historicalOutcome(evidence.invoiceStatus) ||
    subscriptionEnded(evidence.subscriptionStatus)
  );
}

function normalizeCode(value: string | null): string | null {
  const normalized = value?.trim().toLowerCase();
  return normalized || null;
}

function exclusionReason(code: string): string {
  if (code === "non_recurring_invoice") {
    return "One-off invoices are outside the recurring-revenue recovery diagnostic.";
  }

  if (code === "voluntary_cancellation") {
    return "The subscription ended through a voluntary cancellation rather than an involuntary payment failure.";
  }

  return "The payment signal is excluded from Dunlo recovery workflows.";
}

function result(
  category: DiagnosticCategory,
  reasonCode: string,
  humanReason: string,
  sourceSignal: ClassificationSourceSignal,
): ClassificationResult {
  return {
    category,
    reasonCode,
    humanReason,
    sourceSignal,
    policyVersion: ADDRESSABILITY_POLICY_VERSION,
  };
}
