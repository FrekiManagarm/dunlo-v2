export function MonitoringConsent({
  onConfirm,
  unavailable = false,
}: {
  onConfirm: () => void;
  unavailable?: boolean;
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
        disabled={unavailable}
        onClick={onConfirm}
        className="mt-4 h-10 rounded-full border border-zinc-200 px-4 text-sm font-semibold text-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Enable read-only monitoring
      </button>
      {unavailable ? (
        <p role="status" className="mt-3 text-sm text-zinc-500">
          Monitoring will be available soon.
        </p>
      ) : null}
    </section>
  );
}
