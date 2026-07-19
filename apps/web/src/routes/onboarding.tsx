import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { usePostHog } from "posthog-js/react";
import { useEffect, useState } from "react";
import { z } from "zod";

import { DiagnosticReport } from "@/components/diagnostic/diagnostic-report";
import { ActivationSummary } from "@/components/diagnostic/activation-summary";
import { MonitoringConsent } from "@/components/diagnostic/monitoring-consent";
import { PermissionStep } from "@/components/diagnostic/permission-step";
import { ProgressStep } from "@/components/diagnostic/progress-step";
import {
  enableMonitoring,
  type DiagnosticStateView,
} from "@/functions/diagnostic";
import { getUser } from "@/functions/get-user";
import { captureDiagnosticEvent } from "@/lib/diagnostic/analytics";
import {
  diagnosticConnectionQueryOptions,
  diagnosticReportQueryOptions,
  diagnosticStateQueryOptions,
} from "@/lib/queries";

const searchSchema = z.object({ connectionId: z.string().min(1).optional() });

const REPORT_PHASES = new Set([
  "diagnostic_ready",
  "monitoring",
  "activation_requested",
  "write_authorized",
  "email_configured",
  "recovery_active",
]);

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Set up your diagnostic — Dunlo" },
    ],
  }),
  validateSearch: searchSchema,
  beforeLoad: async () => {
    const session = await getUser();
    if (!session?.user)
      throw redirect({ to: "/login", search: { mode: "signin" } });
    return { session };
  },
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(diagnosticConnectionQueryOptions()),
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();
  const { data: discoveredState } = useSuspenseQuery(
    diagnosticConnectionQueryOptions(),
  );
  const connectionId = search.connectionId ?? discoveredState.connectionId;

  if (!connectionId)
    return (
      <OnboardingShell>
        <PermissionStep />
      </OnboardingShell>
    );

  return (
    <ConnectedOnboarding
      connectionId={connectionId}
      discoveredState={discoveredState}
    />
  );
}

function ConnectedOnboarding({
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
    "idle" | "unavailable" | "enabled" | "error"
  >("idle");
  const [readOnlyConfirmed, setReadOnlyConfirmed] = useState(false);

  useEffect(() => {
    if (!report.data) return;
    captureDiagnosticEvent(posthog, "diagnostic_report_viewed", {
      verdict: report.data.verdict,
      planCode: report.data.planCode,
    });
  }, [posthog, report.data]);

  if (!stateQuery.data && connectionId !== discoveredState.connectionId)
    return (
      <OnboardingShell>
        <p role="status" className="text-sm text-zinc-600">
          Loading your diagnostic…
        </p>
      </OnboardingShell>
    );
  if (state.phase === "diagnosing")
    return (
      <OnboardingShell>
        <ProgressStep
          checkpoints={state.progress.checkpoints}
          errorCategory={state.progress.errorCategory}
        />
      </OnboardingShell>
    );
  if (report.isLoading || !report.data)
    return (
      <OnboardingShell>
        <p role="status" className="text-sm text-zinc-600">
          Loading your private diagnostic…
        </p>
      </OnboardingShell>
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
      if (response.ok) setMonitoringStatus("enabled");
    } catch {
      setMonitoringStatus("error");
    }
  };
  const keepReadOnly = () => setReadOnlyConfirmed(true);
  if (state.phase === "write_authorized")
    return (
      <OnboardingShell>
        <EmailProviderStep />
      </OnboardingShell>
    );
  if (state.phase === "email_configured" || state.phase === "recovery_active")
    return (
      <OnboardingShell>
        <ActivationSummary
          connectionId={connectionId}
          active={state.phase === "recovery_active"}
        />
      </OnboardingShell>
    );

  return (
    <OnboardingShell>
      <DiagnosticReport
        report={report.data}
        onRequestActivation={requestActivation}
        onEnableMonitoring={requestMonitoring}
        onKeepReadOnly={keepReadOnly}
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
    </OnboardingShell>
  );
}

function OnboardingShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh bg-zinc-50 px-5 py-10 font-sans">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        {children}
      </div>
    </main>
  );
}

function EmailProviderStep() {
  return (
    <section>
      <h1 className="text-2xl font-bold text-zinc-950">
        Configure your sending domain
      </h1>
      <p className="mt-2 text-sm leading-6 text-zinc-600">
        Email-provider setup and activation progression are not available yet.
        Recovery remains off until Task 12 is complete.
      </p>
      <Link
        to="/settings"
        className="mt-6 inline-flex h-11 items-center rounded-full bg-dunlo px-5 text-sm font-semibold text-white"
      >
        View email settings
      </Link>
    </section>
  );
}
