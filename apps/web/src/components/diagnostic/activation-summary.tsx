import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { sequencesQueryOptions } from "@/lib/queries";

const WORKFLOW_VERSION = "recovery-v1";

export function ActivationSummary({
  connectionId,
  active,
}: {
  connectionId: string;
  active: boolean;
}) {
  const sequences = useQuery(sequencesQueryOptions());
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSequenceIds, setSelectedSequenceIds] = useState<string[]>([]);
  const didInitializeSequences = useRef(false);

  useEffect(() => {
    if (didInitializeSequences.current || !sequences.data?.length) return;
    didInitializeSequences.current = true;
    setSelectedSequenceIds(sequences.data.map((sequence) => sequence.id));
  }, [sequences.data]);

  const toggleSequence = (sequenceId: string) => {
    setSelectedSequenceIds((selected) =>
      selected.includes(sequenceId)
        ? selected.filter((id) => id !== sequenceId)
        : [...selected, sequenceId],
    );
  };

  const confirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/stripe/recovery/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connectionId,
          accepted,
          workflowVersion: WORKFLOW_VERSION,
          selectedSequenceIds,
        }),
      });
      if (!response.ok) throw new Error(await response.text());
      window.location.reload();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Recovery could not be activated.",
      );
      setSubmitting(false);
    }
  };

  return (
    <section aria-labelledby="activation-summary" className="space-y-6">
      <div>
        <h1
          id="activation-summary"
          className="text-2xl font-bold text-zinc-950"
        >
          {active ? "Recovery is active" : "Confirm your recovery workflow"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          {active
            ? "Only failures received after activation can enter the selected recovery sequences."
            : "Recovery remains off until you confirm this workflow. Historical failures are never imported."}
        </p>
      </div>
      {!active ? (
        <>
          <ul className="space-y-2 text-sm text-zinc-700">
            {(sequences.data ?? []).map((sequence) => (
              <li key={sequence.id} className="rounded-xl bg-zinc-50 px-4 py-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedSequenceIds.includes(sequence.id)}
                    onChange={() => toggleSequence(sequence.id)}
                    className="size-4 accent-dunlo"
                  />
                  {sequence.name}
                </label>
              </li>
            ))}
          </ul>
          <label className="flex gap-3 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
              className="mt-1 size-4 accent-dunlo"
            />
            I confirm that Dunlo may apply these selected sequences to future
            payment failures only.
          </label>
          {error ? (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          ) : null}
          <button
            type="button"
            disabled={!accepted || !selectedSequenceIds.length || submitting}
            onClick={confirm}
            className="inline-flex h-11 rounded-full bg-dunlo px-5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {submitting ? "Activating…" : "Activate recovery"}
          </button>
          <p className="text-xs text-zinc-500">
            Workflow version: {WORKFLOW_VERSION}
          </p>
        </>
      ) : null}
    </section>
  );
}
