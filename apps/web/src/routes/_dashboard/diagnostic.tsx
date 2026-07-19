import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";

import { DiagnosticReport } from "@/components/diagnostic/diagnostic-report";
import { ProgressStep } from "@/components/diagnostic/progress-step";
import { diagnosticAnalyticsPayload } from "@/lib/diagnostic/analytics";
import {
  diagnosticReportQueryOptions,
  diagnosticStateQueryOptions,
} from "@/lib/queries";

export const Route = createFileRoute("/_dashboard/diagnostic")({
  head: () => ({ meta: [{ title: "Diagnostic — Dunlo" }] }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(diagnosticStateQueryOptions()),
  component: DiagnosticPage,
});

function DiagnosticPage() {
  const posthog = usePostHog();
  const { data: state } = useSuspenseQuery(diagnosticStateQueryOptions());
  const report = useQuery({
    ...diagnosticReportQueryOptions(state.connectionId ?? "missing"),
    enabled: Boolean(state.connectionId && state.phase !== "diagnosing"),
  });

  useEffect(() => {
    if (!report.data) return;
    posthog.capture(
      "diagnostic_report_viewed",
      diagnosticAnalyticsPayload({
        verdict: report.data.verdict,
        planCode: report.data.planCode,
      }),
    );
  }, [posthog, report.data]);

  if (!state.connectionId) {
    return (
      <Page>
        <h1 className="text-2xl font-bold text-zinc-950">
          Your private diagnostic starts with read-only Stripe access.
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Connect Stripe to analyze recurring subscription invoices without
          enabling recovery.
        </p>
        <Link
          to="/onboarding"
          className="mt-6 inline-flex h-11 items-center rounded-full bg-dunlo px-5 text-sm font-semibold text-white"
        >
          Start diagnostic
        </Link>
      </Page>
    );
  }
  if (state.phase === "diagnosing")
    return (
      <Page>
        <ProgressStep
          checkpoints={state.progress.checkpoints}
          errorCategory={state.progress.errorCategory}
        />
      </Page>
    );
  if (report.isLoading || !report.data)
    return (
      <Page>
        <p role="status" className="text-sm text-zinc-600">
          Loading diagnostic report…
        </p>
      </Page>
    );
  return (
    <Page>
      <DiagnosticReport report={report.data} />
    </Page>
  );
}

function Page({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 lg:px-8">{children}</div>
  );
}
