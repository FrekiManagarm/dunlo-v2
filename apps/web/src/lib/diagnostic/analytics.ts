import type { DiagnosticVerdict } from "./types";

export const DIAGNOSTIC_EVENT_NAMES = [
  "diagnostic_report_viewed",
  "diagnostic_activation_requested",
  "diagnostic_monitoring_requested",
] as const;

const FORBIDDEN_PROPERTY =
  /amount|revenue|customer|invoice|email|decline|currency/i;

type DiagnosticAnalyticsInput = {
  verdict: DiagnosticVerdict;
  planCode?: string | null;
} & Record<string, unknown>;

type DiagnosticAnalyticsClient = {
  capture: (
    event: (typeof DIAGNOSTIC_EVENT_NAMES)[number],
    properties: Record<string, string>,
  ) => void;
};

export function diagnosticAnalyticsPayload(input: DiagnosticAnalyticsInput) {
  for (const key of Object.keys(input)) {
    if (FORBIDDEN_PROPERTY.test(key)) {
      throw new Error(
        `Diagnostic analytics property \"${key}\" is not allowed.`,
      );
    }
  }

  return {
    verdict: input.verdict,
    ...(input.planCode ? { plan_band: input.planCode } : {}),
  };
}

export function captureDiagnosticReportViewed(
  client: DiagnosticAnalyticsClient,
  input: DiagnosticAnalyticsInput,
) {
  client.capture("diagnostic_report_viewed", diagnosticAnalyticsPayload(input));
}
