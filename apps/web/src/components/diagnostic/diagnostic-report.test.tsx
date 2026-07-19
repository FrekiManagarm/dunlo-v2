// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DiagnosticReport } from "./diagnostic-report";

const report = {
  connectionId: "conn_1",
  verdict: "activation_recommended" as const,
  planCode: "growth",
  planPriceUsd: 9_900,
  breakEvenUsd: 29_700,
  dominantCurrency: "usd",
  monthlyAddressable: 45_000,
  observedFailed: 60_000,
  naturallyRecovered: 10_000,
  openAutomatable: 25_000,
  openHuman: 20_000,
  historicallyLostAutomatable: 3_000,
  historicallyLostHuman: 2_000,
  excludedAmount: 5_000,
  originalCurrencyTotals: {
    open_automatable: { usd: 25_000, eur: 1_000 },
    open_human: { usd: 20_000 },
  },
  analysisStartsAt: "2026-04-20T00:00:00.000Z",
  analysisEndsAt: "2026-07-19T00:00:00.000Z",
  decisionWindowComplete: true,
  coverageComplete: true,
  pagesLoaded: 4,
  recordsLoaded: 42,
  fxSource: "ECB reference rates",
  fxRateDate: "2026-07-18",
  liveMode: false,
};

afterEach(cleanup);

describe("DiagnosticReport", () => {
  it("puts the commercial decision before the observed facts", () => {
    const { container } = render(<DiagnosticReport report={report} />);
    const text = container.textContent ?? "";
    expect(text.indexOf("Activation is recommended")).toBeLessThan(
      text.indexOf("Observed failed recurring revenue"),
    );
  });

  it("uses a distinct primary action for every verdict", () => {
    const onRequestActivation = vi.fn();
    const onEnableMonitoring = vi.fn();
    const onKeepReadOnly = vi.fn();
    const { rerender } = render(
      <DiagnosticReport
        report={report}
        onRequestActivation={onRequestActivation}
        onEnableMonitoring={onEnableMonitoring}
        onKeepReadOnly={onKeepReadOnly}
      />,
    );
    expect(
      screen.getByRole("button", { name: /authorize recovery/i }),
    ).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: /authorize recovery/i }),
    );
    expect(onRequestActivation).toHaveBeenCalledOnce();

    rerender(
      <DiagnosticReport
        report={{ ...report, verdict: "monitoring_recommended" }}
        onEnableMonitoring={onEnableMonitoring}
      />,
    );
    expect(
      screen.getByRole("button", { name: /enable read-only monitoring/i }),
    ).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: /enable read-only monitoring/i }),
    );
    expect(onEnableMonitoring).toHaveBeenCalledOnce();

    rerender(
      <DiagnosticReport
        report={{ ...report, verdict: "insufficient_data" }}
        onKeepReadOnly={onKeepReadOnly}
      />,
    );
    expect(
      screen.getByRole("button", { name: /keep read-only access/i }),
    ).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: /keep read-only access/i }),
    );
    expect(onKeepReadOnly).toHaveBeenCalledOnce();
  });

  it("describes addressable opportunity without recovered or guaranteed claims", () => {
    render(<DiagnosticReport report={report} />);
    expect(screen.getByText(/monthly addressable opportunity/i)).toBeTruthy();
    expect(screen.queryByText(/guaranteed/i)).toBeNull();
    expect(screen.queryByText(/recovered by dunlo/i)).toBeNull();
  });

  it("shows the opportunity split and report coverage metadata", () => {
    render(<DiagnosticReport report={report} />);
    expect(screen.getByText(/automatable opportunity/i)).toBeTruthy();
    expect(screen.getByText(/founder-review opportunity/i)).toBeTruthy();
    expect(screen.getByText(/historically lost/i)).toBeTruthy();
    expect(screen.getByText(/90-day decision coverage complete/i)).toBeTruthy();
    expect(screen.getByText(/test data/i)).toBeTruthy();
    expect(screen.getByText(/ECB reference rates/i)).toBeTruthy();
    expect(screen.getByText(/excluded from this diagnostic/i)).toBeTruthy();
  });

  it("keeps original-currency totals separate and never formats a failure count as money", () => {
    render(<DiagnosticReport report={report} />);
    expect(screen.getByText("60,000")).toBeTruthy();
    expect(screen.getByText("€10 + $250")).toBeTruthy();
    expect(screen.queryByText("$600")).toBeNull();
  });
});
