type ExportSnapshot = {
  verdict: string;
  analysisStartsAt: Date;
  analysisEndsAt: Date;
  decisionWindowComplete: boolean;
  coverageComplete: boolean;
  pagesLoaded: number;
  recordsLoaded: number;
  fixedMrr: number;
  variableMrr: number;
  limitedConfidenceMrr: number;
  excludedMrr: number;
  dominantCurrency: string;
  dominantCurrencyShareBps: number;
  observedFailed: number;
  naturallyRecovered: number;
  openAutomatable: number;
  openHuman: number;
  historicallyLostAutomatable: number;
  historicallyLostHuman: number;
  excludedAmount: number;
  monthlyAddressable: number;
  addressableNow: number;
  classifierVersion: string;
  qualificationVersion: string;
  fxSource: string;
  fxSeriesKeys: string[];
  fxRateDate: string;
  fxFetchedAt: Date;
  fxRateToUsd: string;
  failureCategory: string;
};

type ExportFinding = {
  amount: number;
  currency: string;
  category: string;
};

export function buildDiagnosticExport(input: {
  exportedAt: Date;
  snapshot: ExportSnapshot;
  findings: ExportFinding[];
}) {
  const originalCurrencyTotals = Array.from(
    input.findings
      .reduce((totals, finding) => {
        const current = totals.get(finding.currency) ?? {
          currency: finding.currency,
          amount: 0,
          findingCount: 0,
        };
        current.amount += finding.amount;
        current.findingCount += 1;
        totals.set(finding.currency, current);
        return totals;
      }, new Map<string, { currency: string; amount: number; findingCount: number }>())
      .values(),
  ).sort((left, right) => left.currency.localeCompare(right.currency));

  const snapshot = input.snapshot;
  return {
    schemaVersion: "dunlo-diagnostic/v1",
    exportedAt: input.exportedAt.toISOString(),
    diagnostic: {
      summary: {
        verdict: snapshot.verdict,
        analysisWindow: {
          startsAt: snapshot.analysisStartsAt.toISOString(),
          endsAt: snapshot.analysisEndsAt.toISOString(),
          decisionWindowComplete: snapshot.decisionWindowComplete,
        },
        mrr: {
          fixed: snapshot.fixedMrr,
          variable: snapshot.variableMrr,
          limitedConfidence: snapshot.limitedConfidenceMrr,
          excluded: snapshot.excludedMrr,
        },
        dominantCurrency: snapshot.dominantCurrency,
        dominantCurrencyShareBps: snapshot.dominantCurrencyShareBps,
        observedFailed: snapshot.observedFailed,
        naturallyRecovered: snapshot.naturallyRecovered,
        openAutomatable: snapshot.openAutomatable,
        openHuman: snapshot.openHuman,
        historicallyLostAutomatable: snapshot.historicallyLostAutomatable,
        historicallyLostHuman: snapshot.historicallyLostHuman,
        excludedAmount: snapshot.excludedAmount,
        monthlyAddressable: snapshot.monthlyAddressable,
        addressableNow: snapshot.addressableNow,
        originalCurrencyTotals,
      },
      calculationPolicy: {
        classifierVersion: snapshot.classifierVersion,
        qualificationVersion: snapshot.qualificationVersion,
      },
      coverage: {
        complete: snapshot.coverageComplete,
        failureCategory: snapshot.failureCategory,
        pagesLoaded: snapshot.pagesLoaded,
        recordsLoaded: snapshot.recordsLoaded,
      },
      fx: {
        source: snapshot.fxSource,
        seriesKeys: snapshot.fxSeriesKeys,
        rateDate: snapshot.fxRateDate,
        fetchedAt: snapshot.fxFetchedAt.toISOString(),
        rateToUsd: snapshot.fxRateToUsd,
      },
    },
  };
}
