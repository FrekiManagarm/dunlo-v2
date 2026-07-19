import type { DiagnosticVerdict } from "../../lib/diagnostic/types";

export type DiagnosticReportView = {
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

type Props = {
  report: DiagnosticReportView;
  onRequestActivation?: () => void;
  onEnableMonitoring?: () => void;
};

const verdictCopy: Record<
  DiagnosticVerdict,
  { title: string; description: string; action: string }
> = {
  activation_recommended: {
    title: "Activation is recommended",
    description:
      "Your current addressable opportunity credibly clears the plan break-even requirement.",
    action: "Authorize recovery",
  },
  monitoring_recommended: {
    title: "Read-only monitoring is recommended",
    description:
      "A paid recovery product is not yet clearly justified by the observed opportunity.",
    action: "Enable read-only monitoring",
  },
  insufficient_data: {
    title: "More diagnostic coverage is needed",
    description:
      "Dunlo cannot issue a reliable commercial recommendation from this snapshot.",
    action: "Keep read-only access",
  },
};

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function DiagnosticReport({
  report,
  onRequestActivation,
  onEnableMonitoring,
}: Props) {
  const copy = verdictCopy[report.verdict];
  const action =
    report.verdict === "activation_recommended"
      ? onRequestActivation
      : onEnableMonitoring;

  return (
    <section aria-labelledby="diagnostic-verdict" className="space-y-6">
      <div className="rounded-2xl border border-dunlo/25 bg-dunlo/8 p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-dunlo-deep">
          Private Stripe diagnostic
        </p>
        <h1
          id="diagnostic-verdict"
          className="mt-2 text-2xl font-bold text-zinc-950"
        >
          {copy.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          {copy.description}
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Monthly addressable opportunity
            </p>
            <p className="mt-1 font-mono text-2xl font-bold text-zinc-950">
              {formatMoney(report.monthlyAddressable, report.dominantCurrency)}
            </p>
          </div>
          <div className="rounded-xl bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Break-even requirement
            </p>
            <p className="mt-1 font-mono text-2xl font-bold text-zinc-950">
              {formatMoney(report.breakEvenUsd, "usd")}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={action}
          className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-dunlo px-5 text-sm font-semibold text-white transition-colors hover:bg-dunlo-hover"
        >
          {copy.action}
        </button>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="text-base font-bold text-zinc-950">
          Observed failed recurring revenue
        </h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric
            label="Observed failures"
            value={report.observedFailed}
            report={report}
          />
          <Metric
            label="Naturally recovered"
            value={report.naturallyRecovered}
            report={report}
          />
          <Metric
            label="Automatable opportunity"
            value={report.openAutomatable}
            report={report}
          />
          <Metric
            label="Founder-review opportunity"
            value={report.openHuman}
            report={report}
          />
          <Metric
            label="Historically lost"
            value={
              report.historicallyLostAutomatable + report.historicallyLostHuman
            }
            report={report}
          />
        </dl>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="text-base font-bold text-zinc-950">
          Coverage and policy
        </h2>
        {report.liveMode === false ? (
          <span className="mt-3 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            Test data
          </span>
        ) : null}
        <dl className="mt-4 grid gap-3 text-sm text-zinc-600 sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-zinc-900">Analysis window</dt>
            <dd>
              {formatDate(report.analysisStartsAt)} –{" "}
              {formatDate(report.analysisEndsAt)}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-zinc-900">Coverage</dt>
            <dd>
              {report.coverageComplete ? "Complete" : "Partial"};{" "}
              {report.pagesLoaded} pages, {report.recordsLoaded} records
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-zinc-900">Decision window</dt>
            <dd>
              {report.decisionWindowComplete
                ? "90-day decision coverage complete"
                : "90-day decision coverage incomplete"}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-zinc-900">FX source</dt>
            <dd>
              {report.fxSource} ({report.fxRateDate})
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-zinc-900">Exclusions</dt>
            <dd>
              {formatMoney(report.excludedAmount, report.dominantCurrency)}{" "}
              excluded from this diagnostic
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  report,
}: {
  label: string;
  value: number;
  report: DiagnosticReportView;
}) {
  return (
    <div className="rounded-xl bg-zinc-50 p-4">
      <dt className="text-xs font-semibold text-zinc-500">{label}</dt>
      <dd className="mt-1 font-mono text-lg font-bold text-zinc-950">
        {formatMoney(value, report.dominantCurrency)}
      </dd>
    </div>
  );
}
