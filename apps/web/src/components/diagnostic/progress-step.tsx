import type { DiagnosticCheckpoint } from "../../lib/diagnostic/types";

const checkpointLabels: Record<DiagnosticCheckpoint, string> = {
  account_loaded: "Stripe account loaded",
  invoices_loaded: "Subscription invoices loaded",
  payment_evidence_loaded: "Payment evidence loaded",
  revenue_normalized: "Recurring revenue normalized",
  findings_classified: "Findings classified",
  snapshot_persisted: "Diagnostic saved",
};

export function ProgressStep({
  checkpoints,
  errorCategory,
}: {
  checkpoints: DiagnosticCheckpoint[];
  errorCategory: "source" | "persistence" | null;
}) {
  return (
    <section aria-labelledby="diagnostic-progress">
      <p
        role="status"
        aria-live="polite"
        className="text-sm font-semibold text-dunlo-deep"
      >
        {errorCategory
          ? "Analysis needs attention"
          : "Analyzing your Stripe account"}
      </p>
      <h1
        id="diagnostic-progress"
        className="mt-2 text-2xl font-bold text-zinc-950"
      >
        We save each completed checkpoint.
      </h1>
      <p className="mt-2 text-sm text-zinc-600">
        You can leave this page and return when the diagnostic is ready.
      </p>
      <ol className="mt-6 space-y-3">
        {(Object.keys(checkpointLabels) as DiagnosticCheckpoint[]).map(
          (checkpoint) => (
            <li
              key={checkpoint}
              className="rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-700"
            >
              {checkpoints.includes(checkpoint) ? "Completed: " : "Waiting: "}
              {checkpointLabels[checkpoint]}
            </li>
          ),
        )}
      </ol>
    </section>
  );
}
