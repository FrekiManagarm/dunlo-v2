import type { DiagnosticVerdict } from "./types";

export type DiagnosticReportView = {
  connectionId: string;
  verdict: DiagnosticVerdict;
  planCode: string;
  planPriceUsd: number;
  breakEvenUsd: number;
  dominantCurrency: string;
  monthlyAddressable: number;
  observedFailed: number;
  naturallyRecovered: number;
  openAutomatable: number;
  openHuman: number;
  historicallyLostAutomatable: number;
  historicallyLostHuman: number;
  excludedAmount: number;
  analysisStartsAt: string;
  analysisEndsAt: string;
  decisionWindowComplete: boolean;
  coverageComplete: boolean;
  pagesLoaded: number;
  recordsLoaded: number;
  fxSource: string;
  fxRateDate: string;
  liveMode: boolean | null;
};
