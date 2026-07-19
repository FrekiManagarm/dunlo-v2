import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { usePostHog } from "posthog-js/react";
import { useEffect, useState } from "react";

import { DiagnosticReport } from "@/components/diagnostic/diagnostic-report";
import { MonitoringConsent } from "@/components/diagnostic/monitoring-consent";
import { ProgressStep } from "@/components/diagnostic/progress-step";
import {
  enableMonitoring,
  type DiagnosticStateView,
} from "@/functions/diagnostic";
import { captureDiagnosticEvent } from "@/lib/diagnostic/analytics";
import {
  diagnosticConnectionQueryOptions,
  diagnosticReportQueryOptions,
  diagnosticStateQueryOptions,
} from "@/lib/queries";

const REPORT_PHASES = new Set([
  "diagnostic_ready",
  "monitoring",
  "activation_requested",
  "write_authorized",
  "email_configured",
  "recovery_active",
]);

export const Route = createFileRoute("/_dashboard/diagnostic")({
  head: () => ({ meta: [{ title: "Diagnostic — Dunlo" }] }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(diagnosticConnectionQueryOptions()),
  component: DiagnosticPage,
});

function DiagnosticPage() {
  const { data: discoveredState } = useSuspenseQuery(
    diagnosticConnectionQueryOptions(),
  );
  const connectionId = discoveredState.connectionId;

  if (!connectionId)
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

  return (
    <ConnectedDiagnostic
      connectionId={connectionId}
      discoveredState={discoveredState}
    />
  );
}

function ConnectedDiagnostic({
  connectionId,
  discoveredState,
}: {
  connectionId: string;
  discoveredState: DiagnosticStateView;
}) {
  const posthog = usePostHog();
  const stateQuery = useQuery({
    ...diagnosticStateQueryOptions(connectionId),
  });
  const state = stateQuery.data ?? discoveredState;
  const report = useQuery({
    ...diagnosticReportQueryOptions(connectionId),
    enabled: REPORT_PHASES.has(state.phase ?? ""),
  });
  const [monitoringStatus, setMonitoringStatus] = useState<
    "idle" | "unavailable" | "error"
  >("idle");
  const [readOnlyConfirmed, setReadOnlyConfirmed] = useState(false);

  useEffect(() => {
    if (!report.data) return;
    captureDiagnosticEvent(posthog, "diagnostic_report_viewed", {
      verdict: report.data.verdict,
      planCode: report.data.planCode,
    });
  }, [posthog, report.data]);

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

  const requestActivation = () => {
    captureDiagnosticEvent(posthog, "diagnostic_activation_requested", {
      verdict: report.data.verdict,
      planCode: report.data.planCode,
    });
    window.location.assign(
      `/api/stripe/connect?intent=activation&connectionId=${encodeURIComponent(connectionId)}`,
    );
  };
  const requestMonitoring = async () => {
    captureDiagnosticEvent(posthog, "diagnostic_monitoring_requested", {
      verdict: report.data.verdict,
      planCode: report.data.planCode,
    });
    try {
      const response = await enableMonitoring({ data: { connectionId } });
      setMonitoringStatus(
        response.ok
          ? "idle"
          : response.code === "monitoring_not_available"
            ? "unavailable"
            : "error",
      );
    } catch {
      setMonitoringStatus("error");
    }
  };
  return (
    <Page>
      <DiagnosticReport
        report={report.data}
        onRequestActivation={requestActivation}
        onEnableMonitoring={requestMonitoring}
        onKeepReadOnly={() => setReadOnlyConfirmed(true)}
      />
      {report.data.verdict !== "activation_recommended" ? (
        <div className="mt-6">
          <MonitoringConsent
            onConfirm={requestMonitoring}
            status={monitoringStatus}
          />
        </div>
      ) : null}
      {readOnlyConfirmed ? (
        <p role="status" className="mt-4 text-sm text-zinc-600">
          Your Stripe connection remains read-only. Recovery and monitoring are
          not enabled.
        </p>
      ) : null}
    </Page>
  );
}

function Page({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 lg:px-8">{children}</div>
  );
}
