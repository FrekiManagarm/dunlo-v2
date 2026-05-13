import { AnimatePresence, motion } from "framer-motion";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, Clock, Plus, RotateCcw, Save, Trash2, Zap } from "lucide-react";
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
  const [selectedId, setSelectedId] = useState<string>(initialSequences[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [varsOpen, setVarsOpen] = useState(false);

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
    if (!window.confirm("Reset all sequences to defaults? This will delete your customizations.")) return;
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

  const selectedSeq = sequences.find((s) => s.id === selectedId);

  return (
    <>
      {/* Page header */}
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
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-600 transition-all hover:bg-zinc-50 active:scale-[0.97] disabled:opacity-50"
        >
          <RotateCcw size={12} className={busy ? "animate-spin" : ""} />
          Reset defaults
        </button>
      </div>

      {sequences.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-dunlo/[0.07]">
            <Zap size={20} className="text-dunlo" />
          </div>
          <p className="text-sm font-semibold text-zinc-800">No sequences yet</p>
          <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-zinc-400">
            Connect Stripe from the dashboard to seed default recovery sequences.
          </p>
        </div>
      ) : (
        <div className="flex gap-0 p-6 pb-12">
          {/* Left: sequence list */}
          <div className="w-[216px] shrink-0 pr-5">
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
              Sequences
            </p>
            <div className="space-y-0.5">
              {sequences.map((seq) => {
                const active = seq.id === selectedId;
                return (
                  <button
                    key={seq.id}
                    onClick={() => setSelectedId(seq.id)}
                    className={`w-full rounded-xl px-2.5 py-2.5 text-left transition-all ${
                      active ? "bg-dunlo/[0.07]" : "hover:bg-zinc-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className={`size-1.5 shrink-0 rounded-full transition-colors ${
                          seq.isActive ? "bg-dunlo" : "bg-zinc-300"
                        }`}
                      />
                      <span
                        className={`text-[13px] font-semibold leading-snug truncate ${
                          active ? "text-dunlo-deep" : "text-zinc-800"
                        }`}
                      >
                        {seq.name}
                      </span>
                    </div>
                    <div className="ml-3.5 flex items-center gap-2">
                      <code
                        className={`font-mono text-[10px] ${
                          active ? "text-dunlo-dim" : "text-zinc-400"
                        }`}
                      >
                        {seq.failureCode}
                      </code>
                      <span className="text-[10px] text-zinc-400">
                        · {seq.steps.length} step{seq.steps.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Template vars toggle */}
            <div className="mt-6">
              <button
                onClick={() => setVarsOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-zinc-50"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-zinc-400">{"{ }"}</span>
                  <span className="text-[11px] font-semibold text-zinc-500">Variables</span>
                </div>
                <ChevronDown
                  size={11}
                  className={`text-zinc-400 transition-transform duration-200 ${
                    varsOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {varsOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap gap-1 px-2 pt-2 pb-1">
                      {TEMPLATE_VARS.map((v) => (
                        <code
                          key={v}
                          className="rounded-md border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-mono text-[9px] text-zinc-500"
                        >
                          {v}
                        </code>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right: sequence editor */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {selectedSeq && (
                <motion.div
                  key={selectedSeq.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-2xl border border-zinc-100 bg-white shadow-[0_1px_4px_0_rgba(0,0,0,0.04)]"
                >
                  {/* Sequence header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-50">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                        {selectedSeq.failureCode}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold tracking-tight text-zinc-900">
                        {selectedSeq.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-medium transition-colors ${
                          selectedSeq.isActive ? "text-dunlo-dim" : "text-zinc-400"
                        }`}
                      >
                        {selectedSeq.isActive ? "Active" : "Paused"}
                      </span>
                      <button
                        role="switch"
                        aria-checked={selectedSeq.isActive}
                        onClick={() => onToggle(selectedSeq.id, !selectedSeq.isActive)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                          selectedSeq.isActive ? "bg-dunlo" : "bg-zinc-200"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                            selectedSeq.isActive ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Steps timeline */}
                  <div className="relative px-6 py-3">
                    {selectedSeq.steps.length > 1 && (
                      <div className="absolute left-[2.625rem] top-7 bottom-7 w-px bg-zinc-100" />
                    )}
                    {selectedSeq.steps.map((step, idx) => (
                      <StepEditor
                        key={step.id}
                        step={step}
                        canDelete={selectedSeq.steps.length > 1}
                        onSaved={refresh}
                        onDelete={() => onDelete(step.id)}
                        isLast={idx === selectedSeq.steps.length - 1}
                      />
                    ))}
                  </div>

                  {/* Add step */}
                  <div className="border-t border-zinc-50 px-6 py-3">
                    <button
                      onClick={() => onAddStep(selectedSeq)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-200 py-2.5 text-xs font-medium text-zinc-400 transition-all hover:border-dunlo/30 hover:bg-dunlo/[0.03] hover:text-dunlo-deep active:scale-[0.99]"
                    >
                      <Plus size={12} />
                      Add step
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
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
      {/* Step number */}
      <div className="relative shrink-0">
        <div
          className={`relative z-10 flex size-8 items-center justify-center rounded-full text-[11px] font-bold transition-all ${
            dirty
              ? "bg-amber-50 text-amber-700 ring-2 ring-amber-200/60"
              : "bg-dunlo/[0.07] text-dunlo-deep"
          }`}
        >
          {step.stepNumber}
        </div>
        {dirty && (
          <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full border border-white bg-amber-400" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-3 min-w-0">
        {/* Delay row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Clock size={11} className="text-zinc-400" />
            <span>Send after</span>
            <input
              type="number"
              min={0}
              max={720}
              value={delayHours}
              onChange={(e) => setDelayHours(Number(e.target.value) || 0)}
              className="h-6 w-14 rounded-lg border border-zinc-200 bg-zinc-50 px-2 text-center font-mono text-xs text-zinc-900 focus:border-dunlo/40 focus:outline-none focus:ring-2 focus:ring-dunlo/10"
            />
            <span>hours</span>
          </div>
          {canDelete && (
            <button
              onClick={onDelete}
              className="rounded-lg p-1.5 text-zinc-300 transition-colors hover:bg-red-50 hover:text-red-500"
              aria-label="Delete step"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>

        {/* Subject */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            placeholder="Email subject line…"
            onChange={(e) => setSubject(e.target.value)}
            className="h-9 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 placeholder-zinc-300 transition-colors focus:border-dunlo/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-dunlo/10"
          />
        </div>

        {/* Body */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
            Body
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 font-mono text-xs leading-relaxed text-zinc-800 placeholder-zinc-300 transition-colors focus:border-dunlo/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-dunlo/10"
          />
        </div>

        {/* Save row */}
        <div className="flex items-center justify-between">
          {dirty ? (
            <span className="text-[11px] text-amber-600 font-medium">Unsaved changes</span>
          ) : (
            <span className="text-[11px] text-zinc-400">Saved</span>
          )}
          <button
            onClick={onSave}
            disabled={!dirty || saving}
            className="flex items-center gap-1.5 rounded-xl bg-dunlo px-3.5 py-1.5 text-xs font-semibold text-white transition-all hover:bg-dunlo-hover active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Save size={11} className={saving ? "animate-pulse" : ""} />
            {saving ? "Saving…" : "Save step"}
          </button>
        </div>
      </div>
    </div>
  );
}
