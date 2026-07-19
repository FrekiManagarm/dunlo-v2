export function MonitoringConsent({
  onConfirm,
  status = "idle",
}: {
  onConfirm: () => void;
  status?: "idle" | "unavailable" | "error";
}) {
  return (
    <section
      aria-labelledby="monitoring-consent"
      className="rounded-2xl border border-zinc-200 bg-white p-6"
    >
      <h2 id="monitoring-consent" className="text-lg font-bold text-zinc-950">
        Keep this diagnostic under review
      </h2>
      <p className="mt-2 text-sm leading-6 text-zinc-600">
        Read-only monitoring refreshes your private diagnostic monthly. It does
        not create webhooks, send recovery messages, or change Stripe.
      </p>
      <button
        type="button"
        onClick={onConfirm}
        className="mt-4 h-10 rounded-full border border-zinc-200 px-4 text-sm font-semibold text-zinc-800"
      >
        {status === "unavailable"
          ? "Try read-only monitoring again"
          : "Enable read-only monitoring"}
      </button>
      {status === "unavailable" ? (
        <p role="status" className="mt-3 text-sm text-zinc-500">
          Monitoring is not available yet. Nothing was enabled; you can retry
          later.
        </p>
      ) : status === "error" ? (
        <p role="status" className="mt-3 text-sm text-red-600">
          We could not request monitoring. Please try again.
        </p>
      ) : null}
    </section>
  );
}
