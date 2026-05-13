import { motion } from "framer-motion";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, RotateCcw, Save, Trash2, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  addSequenceStep,
  deleteSequenceStep,
  getSequences,
  resetSequencesToDefault,
  toggleSequence,
  updateSequenceStep,
  type SequenceWithSteps,
} from "@/functions/sequences";

export const Route = createFileRoute("/_dashboard/sequences")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Recovery sequences — Dunlo" },
    ],
  }),
  loader: async () => {
    const sequences = await getSequences();
    return { sequences };
  },
  component: RouteComponent,
});

const TEMPLATE_VARS = [
  "{{customer_name}}",
  "{{amount}}",
  "{{currency}}",
  "{{last_four}}",
  "{{failure_reason}}",
  "{{product_name}}",
  "{{update_payment_url}}",
  "{{sender_name}}",
];

function RouteComponent() {
  const { sequences: initialSequences } = Route.useLoaderData();
  const [sequences, setSequences] = useState<SequenceWithSteps[]>(initialSequences);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    const fresh = await getSequences();
    setSequences(fresh);
  };

  const onToggle = async (sequenceId: string, isActive: boolean) => {
    try {
      await toggleSequence({ data: { sequenceId, isActive } });
      setSequences((prev) => prev.map((s) => (s.id === sequenceId ? { ...s, isActive } : s)));
      toast.success(isActive ? "Sequence enabled" : "Sequence paused");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    }
  };

  const onReset = async () => {
    if (!window.confirm("Reset all sequences to defaults? This will delete your customizations.")) {
      return;
    }
    setBusy(true);
    try {
      await resetSequencesToDefault();
      await refresh();
      toast.success("Sequences reset to defaults");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Reset failed");
    } finally {
      setBusy(false);
    }
  };

  const onAddStep = async (seq: SequenceWithSteps) => {
    const nextNumber = (seq.steps.at(-1)?.stepNumber ?? 0) + 1;
    try {
      await addSequenceStep({
        data: {
          sequenceId: seq.id,
          stepNumber: nextNumber,
          subject: "New step subject",
          body: "Hi {{customer_name}},\n\nYour message here.\n\n{{sender_name}}",
          delayHours: 24,
        },
      });
      await refresh();
      toast.success("Step added");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add step");
    }
  };

  const onDelete = async (stepId: string) => {
    if (!window.confirm("Delete this step?")) return;
    try {
      await deleteSequenceStep({ data: { stepId } });
      await refresh();
      toast.success("Step deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  return (
    <>
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-100 bg-white/80 px-6 py-4 backdrop-blur-md">
        <div>
          <h1 className="text-[15px] font-semibold tracking-tight text-zinc-900">
            Recovery sequences
          </h1>
          <p className="text-xs text-zinc-400">Automated emails sent when a payment fails</p>
        </div>
        <button
          onClick={onReset}
          disabled={busy}
          className="flex shrink-0 items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-600 transition-all hover:bg-zinc-50 active:scale-[0.97] disabled:opacity-50"
        >
          <RotateCcw size={12} />
          Reset defaults
        </button>
      </div>

      <div className="p-6 space-y-5">
        <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-[0_1px_4px_0_rgba(0,0,0,0.04)]">
          <p className="text-sm font-semibold text-zinc-900">Template variables</p>
          <p className="mt-1 text-xs text-zinc-400">
            Insert these into any subject or body — replaced at send time.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {TEMPLATE_VARS.map((v) => (
              <code
                key={v}
                className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-mono text-[11px] text-zinc-600"
              >
                {v}
              </code>
            ))}
          </div>
        </div>

        {sequences.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-dunlo/[0.07]">
              <Zap size={20} className="text-dunlo" />
            </div>
            <p className="text-sm font-semibold text-zinc-800">No sequences yet</p>
            <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-zinc-400">
              Connect Stripe from the dashboard to seed default recovery sequences.
            </p>
          </div>
        ) : (
          sequences.map((seq, si) => (
            <motion.div
              key={seq.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: si * 0.05, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl border border-zinc-100 bg-white shadow-[0_1px_4px_0_rgba(0,0,0,0.04)]"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-50">
                <div className="flex items-center gap-3">
                  <div
                    className={`size-2 rounded-full ${seq.isActive ? "bg-dunlo shadow-[0_0_0_3px_rgba(0,232,123,0.15)]" : "bg-zinc-300"}`}
                  />
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">{seq.name}</p>
                    <p className="text-xs text-zinc-400">
                      Code:{" "}
                      <code className="font-mono text-zinc-500">{seq.failureCode}</code>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-medium text-zinc-400">
                    {seq.isActive ? "Active" : "Paused"}
                  </span>
                  <button
                    role="switch"
                    aria-checked={seq.isActive}
                    onClick={() => onToggle(seq.id, !seq.isActive)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      seq.isActive ? "bg-dunlo" : "bg-zinc-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        seq.isActive ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="relative px-5 py-2">
                {seq.steps.length > 1 && (
                  <div className="absolute left-[2.375rem] top-6 bottom-6 w-px bg-zinc-100" />
                )}
                {seq.steps.map((step, idx) => (
                  <StepEditor
                    key={step.id}
                    step={step}
                    canDelete={seq.steps.length > 1}
                    onSaved={refresh}
                    onDelete={() => onDelete(step.id)}
                    isLast={idx === seq.steps.length - 1}
                  />
                ))}
              </div>

              <div className="border-t border-zinc-50 px-5 py-3">
                <button
                  onClick={() => onAddStep(seq)}
                  className="flex items-center gap-1.5 rounded-full border border-dashed border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-500 transition-all hover:border-dunlo/40 hover:bg-dunlo/[0.04] hover:text-dunlo-deep active:scale-[0.97]"
                >
                  <Plus size={12} />
                  Add step
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </>
  );
}

function StepEditor({
  step,
  canDelete,
  onSaved,
  onDelete,
}: {
  step: SequenceWithSteps["steps"][number];
  canDelete: boolean;
  onSaved: () => Promise<void> | void;
  onDelete: () => void;
  isLast: boolean;
}) {
  const [subject, setSubject] = useState(step.subject);
  const [body, setBody] = useState(step.body);
  const [delayHours, setDelayHours] = useState(step.delayHours);
  const [saving, setSaving] = useState(false);

  const dirty = subject !== step.subject || body !== step.body || delayHours !== step.delayHours;

  const onSave = async () => {
    if (subject.trim().length === 0 || body.trim().length === 0) {
      toast.error("Subject and body are required");
      return;
    }
    setSaving(true);
    try {
      await updateSequenceStep({ data: { stepId: step.id, subject, body, delayHours } });
      await onSaved();
      toast.success(`Step ${step.stepNumber} saved`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex gap-4 py-4">
      <div className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full bg-dunlo/[0.07] text-[11px] font-bold text-dunlo-deep">
        {step.stepNumber}
      </div>

      <div className="flex-1 space-y-3 pb-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <span>Send after</span>
            <input
              type="number"
              min={0}
              max={720}
              value={delayHours}
              onChange={(e) => setDelayHours(Number(e.target.value) || 0)}
              className="h-7 w-16 rounded-lg border border-zinc-200 bg-white px-2 text-center font-mono text-xs text-zinc-900 focus:border-dunlo/40 focus:outline-none focus:ring-2 focus:ring-dunlo/20"
            />
            <span>hours</span>
          </div>
          {canDelete && (
            <button
              onClick={onDelete}
              className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500"
              aria-label="Delete step"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="h-9 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 transition-colors focus:border-dunlo/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-dunlo/20"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
            Body
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 font-mono text-xs leading-relaxed text-zinc-800 transition-colors focus:border-dunlo/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-dunlo/20"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={onSave}
            disabled={!dirty || saving}
            className="flex items-center gap-1.5 rounded-full bg-dunlo px-4 py-1.5 text-xs font-semibold text-white transition-all hover:bg-dunlo-hover active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Save size={11} />
            {saving ? "Saving…" : "Save step"}
          </button>
        </div>
      </div>
    </div>
  );
}
