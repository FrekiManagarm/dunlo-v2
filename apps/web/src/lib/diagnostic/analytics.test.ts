import { describe, expect, it, vi } from "vitest";

import {
  captureDiagnosticReportViewed,
  DIAGNOSTIC_EVENT_NAMES,
  diagnosticAnalyticsPayload,
} from "./analytics";

describe("diagnostic analytics", () => {
  it("only emits the approved decision properties", () => {
    expect(DIAGNOSTIC_EVENT_NAMES).toEqual([
      "diagnostic_report_viewed",
      "diagnostic_activation_requested",
      "diagnostic_monitoring_requested",
    ]);
    expect(
      diagnosticAnalyticsPayload({
        verdict: "activation_recommended",
        planCode: "growth",
      }),
    ).toEqual({ verdict: "activation_recommended", plan_band: "growth" });
  });

  it("rejects privacy-sensitive analytics property names", () => {
    expect(() =>
      diagnosticAnalyticsPayload({
        verdict: "monitoring_recommended",
        planCode: "starter",
        amount: 4_900,
      }),
    ).toThrow(/not allowed/i);
  });

  it("centralizes the report-view capture with the safe payload", () => {
    const capture = vi.fn();
    captureDiagnosticReportViewed(
      { capture },
      {
        verdict: "activation_recommended",
        planCode: "growth",
      },
    );
    expect(capture).toHaveBeenCalledWith("diagnostic_report_viewed", {
      verdict: "activation_recommended",
      plan_band: "growth",
    });
  });
});
