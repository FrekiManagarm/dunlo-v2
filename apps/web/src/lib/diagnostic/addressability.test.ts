import { describe, expect, it } from "vitest";

import {
  ADDRESSABILITY_POLICY_VERSION,
  classifyFailure,
  type FailureEvidence,
} from "./addressability";

const evidence = (
  overrides: Partial<FailureEvidence> = {},
): FailureEvidence => ({
  invoiceStatus: "open",
  subscriptionStatus: "past_due",
  isRecurring: true,
  adviceCode: null,
  declineCode: null,
  errorCode: null,
  isVoluntaryCancellation: false,
  hasLegitimatePaymentAction: false,
  hasInvoluntaryFailureEvidence: false,
  recoveredAfterFailure: false,
  ...overrides,
});

describe("classifyFailure", () => {
  it.each([
    ["fraud", evidence({ declineCode: "fraudulent", adviceCode: "try_again_later" })],
    ["compliance", evidence({ declineCode: "transaction_not_allowed", adviceCode: "try_again_later" })],
    ["duplicate", evidence({ declineCode: "duplicate", adviceCode: "try_again_later" })],
    ["merchant error", evidence({ errorCode: "api_error", adviceCode: "try_again_later" })],
  ])("excludes %s before applying a more permissive advice code", (_name, input) => {
    expect(classifyFailure(input)).toMatchObject({
      category: "excluded",
      sourceSignal: "exclusion",
      policyVersion: ADDRESSABILITY_POLICY_VERSION,
    });
  });

  it("uses an advice code before a conflicting decline code", () => {
    expect(
      classifyFailure(
        evidence({
          adviceCode: "try_again_later",
          declineCode: "do_not_try_again",
        }),
      ),
    ).toMatchObject({
      category: "open_automatable",
      reasonCode: "try_again_later",
      sourceSignal: "advice_code",
    });
  });

  it("keeps do_not_try_again excluded without another legitimate payment action", () => {
    expect(
      classifyFailure(evidence({ adviceCode: "do_not_try_again" })),
    ).toMatchObject({
      category: "excluded",
      reasonCode: "do_not_try_again",
      sourceSignal: "advice_code",
    });
  });

  it("routes do_not_try_again to a human when another legitimate payment action exists", () => {
    expect(
      classifyFailure(
        evidence({
          adviceCode: "do_not_try_again",
          hasLegitimatePaymentAction: true,
        }),
      ),
    ).toMatchObject({
      category: "open_human",
      reasonCode: "do_not_try_again",
      sourceSignal: "advice_code",
    });
  });

  it.each([
    ["authentication", evidence({ declineCode: "authentication_required" }), "authentication_required"],
    ["payment-method update", evidence({ adviceCode: "update_payment_method" }), "update_payment_method"],
  ])("classifies %s flows as automatable", (_name, input, reasonCode) => {
    expect(classifyFailure(input)).toMatchObject({
      category: "open_automatable",
      reasonCode,
    });
  });

  it("classifies a recovered invoice exclusively as naturally recovered", () => {
    expect(
      classifyFailure(
        evidence({
          recoveredAfterFailure: true,
          invoiceStatus: "paid",
          declineCode: "fraudulent",
        }),
      ),
    ).toEqual({
      category: "naturally_recovered",
      reasonCode: "naturally_recovered",
      humanReason: "The failed invoice was later paid without a Dunlo action.",
      sourceSignal: "lifecycle",
      policyVersion: ADDRESSABILITY_POLICY_VERSION,
    });
  });

  it.each(["void", "uncollectible"]) (
    "classifies %s as historically lost only with involuntary-failure evidence",
    (invoiceStatus) => {
      expect(
        classifyFailure(
          evidence({
            invoiceStatus,
            adviceCode: "try_again_later",
            hasInvoluntaryFailureEvidence: true,
          }),
        ),
      ).toMatchObject({
        category: "historically_lost_automatable",
        sourceSignal: "advice_code",
      });

      expect(
        classifyFailure(
          evidence({ invoiceStatus, adviceCode: "try_again_later" }),
        ),
      ).toMatchObject({
        category: "excluded",
        reasonCode: "historical_outcome_without_involuntary_failure_evidence",
        sourceSignal: "lifecycle",
      });
    },
  );

  it("classifies an ended subscription with an automatable failure as historically lost", () => {
    expect(
      classifyFailure(
        evidence({
          invoiceStatus: "open",
          subscriptionStatus: "canceled",
          adviceCode: "try_again_later",
          hasInvoluntaryFailureEvidence: true,
        }),
      ),
    ).toMatchObject({
      category: "historically_lost_automatable",
      sourceSignal: "advice_code",
    });
  });

  it("classifies an ended subscription with a human failure path as historically lost", () => {
    expect(
      classifyFailure(
        evidence({
          invoiceStatus: "open",
          subscriptionStatus: "canceled",
          adviceCode: "do_not_try_again",
          hasLegitimatePaymentAction: true,
          hasInvoluntaryFailureEvidence: true,
        }),
      ),
    ).toMatchObject({
      category: "historically_lost_human",
      sourceSignal: "advice_code",
    });
  });

  it("excludes an ended subscription without involuntary-failure evidence before open classification", () => {
    expect(
      classifyFailure(
        evidence({
          invoiceStatus: "open",
          subscriptionStatus: "canceled",
          adviceCode: "try_again_later",
        }),
      ),
    ).toMatchObject({
      category: "excluded",
      reasonCode: "historical_outcome_without_involuntary_failure_evidence",
      sourceSignal: "lifecycle",
    });
  });

  it("excludes unknown evidence rather than automating it", () => {
    expect(
      classifyFailure(evidence({ declineCode: "future_stripe_code" })),
    ).toEqual({
      category: "excluded",
      reasonCode: "excluded_unknown",
      humanReason: "The available payment evidence does not support a safe recovery action.",
      sourceSignal: "unknown",
      policyVersion: ADDRESSABILITY_POLICY_VERSION,
    });
  });

  it("does not fall through an unknown advice code to a lower-precedence signal", () => {
    expect(
      classifyFailure(
        evidence({
          adviceCode: "future_advice_code",
          declineCode: "try_again_later",
        }),
      ),
    ).toMatchObject({
      category: "excluded",
      reasonCode: "excluded_unknown",
      sourceSignal: "unknown",
    });
  });
});
