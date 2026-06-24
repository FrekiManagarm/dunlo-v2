import { AnimatePresence, motion } from "framer-motion";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { usePostHog } from "posthog-js/react";
import {
  CheckCircle2,
  ChevronDown,
  Clock,
  Copy,
  Plus,
  RotateCcw,
  Trash2,
  Zap,
} from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import {
  addSequenceStep,
  deleteSequenceStep,
  resetSequencesToDefault,
  toggleSequence,
  updateSequenceStep,
  type SequenceWithSteps,
} from "@/functions/sequences";
import { sequencesQueryOptions } from "@/lib/queries";

const searchSchema = z.object({
  seq: z.string().optional(),
  step: z.string().optional(),
});

export const Route = createFileRoute("/_dashboard/sequences")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Recovery sequences — Dunlo" },
    ],
  }),
  validateSearch: searchSchema,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(sequencesQueryOptions()),
  component: RouteComponent,
});

const TEMPLATE_VARS = [
  "customer_name",
  "amount",
  "currency",
  "last_four",
  "failure_reason",
  "product_name",
  "update_payment_url",
  "sender_name",
] as const;

const SAMPLE_VARS: Record<string, string> = {
  customer_name: "Maxime Beauchamp",
  amount: "247.00",
  currency: "EUR",
  last_four: "4242",
  failure_reason: "Your card was declined",
  product_name: "Pro plan",
  update_payment_url: "https://pay.example.com/u/abc123",
  sender_name: "Aurélie Marchand",
};

function renderTemplate(t: string, vars: Record<string, string>): string {
  return t.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`);
}

function delayLabel(hours: number): string {
  if (hours === 0) return "Immediately";
  if (hours < 24) return `After ${hours}h`;
  const d = Math.round(hours / 24);
  return d === 1 ? "After 1 day" : `After ${d} days`;
}

function totalDelayLabel(steps: SequenceWithSteps["steps"]): string {
  const total = steps.reduce((sum, step) => sum + step.delayHours, 0);
  if (total === 0) return "Immediate";
  if (total < 24) return `${total}h`;
  const days = Math.round(total / 24);
  return days === 1 ? "1 day" : `${days} days`;
}

type StepLike = SequenceWithSteps["steps"][number];
type EditState = { subject: string; body: string; delayHours: number };
type SaveStatus = "idle" | "saving" | "saved";

function RouteComponent() {
  const posthog = usePostHog();
  const queryClient = useQueryClient();
  const { data: sequences } = useSuspenseQuery(sequencesQueryOptions());
  const navigate = Route.useNavigate();
  const search = Route.useSearch();

  const [edits, setEdits] = useState<Record<string, EditState>>({});
  const [saveStatus, setSaveStatus] = useState<Record<string, SaveStatus>>({});
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const savedTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const selectedSeq = useMemo<SequenceWithSteps | undefined>(
    () => sequences.find((s) => s.id === search.seq) ?? sequences[0],
    [sequences, search.seq],
  );

  const expandedStepId = useMemo(() => {
    if (!selectedSeq) return null;
    if (!search.step) return selectedSeq.steps[0]?.id ?? null;
    return selectedSeq.steps.find((s) => s.id === search.step)
      ? search.step
      : (selectedSeq.steps[0]?.id ?? null);
  }, [selectedSeq, search.step]);

  const handleSelectSeq = (id: string) =>
    void navigate({ to: "/sequences", search: { seq: id, step: undefined } });

  const handleToggleExpand = (id: string) => {
    const next = expandedStepId === id ? undefined : id;
    void navigate({
      to: "/sequences",
      search: { seq: selectedSeq?.id, step: next },
    });
  };

  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ["sequences"] }),
    [queryClient],
  );

  const updateStepMutation = useMutation({
    mutationFn: (data: {
      stepId: string;
      subject: string;
      body: string;
      delayHours: number;
    }) => updateSequenceStep({ data }),
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Save failed");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (data: { sequenceId: string; isActive: boolean }) =>
      toggleSequence({ data }),
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    },
  });

  const addStepMutation = useMutation({
    mutationFn: (data: {
      sequenceId: string;
      stepNumber: number;
      subject: string;
      body: string;
      delayHours: number;
    }) => addSequenceStep({ data }),
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Failed to add step");
    },
  });

  const deleteStepMutation = useMutation({
    mutationFn: (stepId: string) => deleteSequenceStep({ data: { stepId } }),
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => resetSequencesToDefault(),
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Reset failed");
    },
  });

  const { mutateAsync: saveStep } = updateStepMutation;
  const { mutateAsync: toggleSelectedSequence } = toggleMutation;
  const { mutateAsync: addStep } = addStepMutation;
  const { mutateAsync: deleteStep } = deleteStepMutation;
  const { mutateAsync: resetSequences } = resetMutation;

  const getEdit = (step: StepLike): EditState =>
    edits[step.id] ?? {
      subject: step.subject,
      body: step.body,
      delayHours: step.delayHours,
    };

  const setEdit = (step: StepLike, patch: Partial<EditState>) => {
    const current = edits[step.id] ?? {
      subject: step.subject,
      body: step.body,
      delayHours: step.delayHours,
    };
    const next = { ...current, ...patch };
    setEdits((prev) => ({ ...prev, [step.id]: next }));
    setSaveStatus((s) => ({ ...s, [step.id]: "saving" }));
    clearTimeout(saveTimers.current[step.id]);
    clearTimeout(savedTimers.current[step.id]);
    saveTimers.current[step.id] = setTimeout(async () => {
      try {
        await saveStep({
          stepId: step.id,
          subject: next.subject,
          body: next.body,
          delayHours: next.delayHours,
        });
        setSaveStatus((s) => ({ ...s, [step.id]: "saved" }));
        await invalidate();
        savedTimers.current[step.id] = setTimeout(() => {
          setSaveStatus((s) => ({ ...s, [step.id]: "idle" }));
        }, 1500);
      } catch {
        setSaveStatus((s) => ({ ...s, [step.id]: "idle" }));
      }
    }, 900);
  };

  const handleToggleActive = async () => {
    if (!selectedSeq) return;
    const newEnabled = !selectedSeq.isActive;
    try {
      await toggleSelectedSequence({
        sequenceId: selectedSeq.id,
        isActive: newEnabled,
      });
      await invalidate();
      posthog.capture("sequence_toggled", {
        sequence_id: selectedSeq.id,
        enabled: newEnabled,
      });
      toast.success(
        selectedSeq.isActive ? "Sequence paused" : "Sequence enabled",
      );
    } catch {}
  };

  const handleAddStep = async () => {
    if (!selectedSeq) return;
    const nextNumber = (selectedSeq.steps.at(-1)?.stepNumber ?? 0) + 1;
    try {
      await addStep({
        sequenceId: selectedSeq.id,
        stepNumber: nextNumber,
        subject: "New step subject",
        body: "Hi {{customer_name}},\n\nYour message here.\n\n{{sender_name}}",
        delayHours: 24,
      });
      await invalidate();
      toast.success("Step added");
    } catch {}
  };

  const handleDeleteStep = async (stepId: string) => {
    if (!window.confirm("Delete this step?")) return;
    try {
      await deleteStep(stepId);
      await invalidate();
      toast.success("Step deleted");
    } catch {}
  };

  const handleReset = async () => {
    if (
      !window.confirm(
        "Reset all sequences to defaults? This will delete your customizations.",
      )
    )
      return;
    try {
      await resetSequences();
      setEdits({});
      await invalidate();
      toast.success("Sequences reset to defaults");
    } catch {}
  };

  const previewStep =
    selectedSeq?.steps.find((step) => step.id === expandedStepId) ??
    selectedSeq?.steps[0];
  const previewEdit = previewStep ? getEdit(previewStep) : null;

  if (sequences.length === 0) {
    return (
      <div className="flex min-h-[80dvh] flex-col items-center justify-center px-6 py-28 text-center">
        <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-dunlo/[0.07]">
          <Zap size={22} strokeWidth={2} className="text-dunlo" />
        </div>
        <p className="text-sm font-semibold text-zinc-800">No sequences yet</p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-500">
          Connect Stripe from the dashboard to seed default recovery sequences.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-50">
      <header className="sticky top-0 z-20 border-b border-zinc-200/70 bg-zinc-50/90 px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-950 sm:text-2xl">
              Recovery sequences
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Edit the emails sent after a payment fails.
            </p>
          </div>
          <button
            onClick={handleReset}
            disabled={resetMutation.isPending}
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 text-xs font-semibold text-zinc-600 transition-all hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-50"
          >
            <RotateCcw
              size={13}
              strokeWidth={2}
              className={resetMutation.isPending ? "animate-spin" : ""}
            />
            Reset
          </button>
        </div>
      </header>

      <main className="w-full space-y-5 px-4 py-5 sm:px-6">
        <div className="overflow-x-auto rounded-2xl border border-zinc-200/70 bg-white p-2">
          <div className="flex min-w-max gap-1">
            {sequences.map((seq) => {
              const active = seq.id === selectedSeq?.id;
              return (
                <button
                  key={seq.id}
                  onClick={() => handleSelectSeq(seq.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all active:scale-[0.98] ${
                    active
                      ? "bg-zinc-950 text-white"
                      : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                  }`}
                >
                  <span
                    className={`size-2 rounded-full ${
                      seq.isActive ? "bg-dunlo" : "bg-zinc-300"
                    }`}
                  />
                  {seq.name}
                  <span
                    className={`font-mono text-[10px] ${
                      active ? "text-white/55" : "text-zinc-300"
                    }`}
                  >
                    {seq.steps.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {selectedSeq && (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
            <section className="overflow-hidden rounded-2xl border border-zinc-200/70 bg-white">
              <div className="flex flex-col gap-5 border-b border-zinc-100 px-5 py-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold tracking-tight text-zinc-950">
                        {selectedSeq.name}
                      </h2>
                      <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-mono text-[10px] font-semibold text-zinc-500">
                        {selectedSeq.failureCode}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-zinc-500">
                      {selectedSeq.steps.length}{" "}
                      {selectedSeq.steps.length === 1 ? "email" : "emails"} in
                      this sequence
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-semibold ${
                        selectedSeq.isActive
                          ? "text-dunlo-deep"
                          : "text-zinc-400"
                      }`}
                    >
                      {selectedSeq.isActive ? "Active" : "Paused"}
                    </span>
                    <button
                      role="switch"
                      aria-checked={selectedSeq.isActive}
                      onClick={handleToggleActive}
                      disabled={toggleMutation.isPending}
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-1 transition-all active:scale-[0.98] disabled:opacity-50 ${
                        selectedSeq.isActive ? "bg-dunlo" : "bg-zinc-200"
                      }`}
                    >
                      <motion.span
                        layout
                        transition={{
                          type: "spring",
                          stiffness: 480,
                          damping: 32,
                        }}
                        className={`size-4 rounded-full bg-white shadow-sm ${
                          selectedSeq.isActive ? "ml-auto" : "mr-auto"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <SequenceStat
                    label="Steps"
                    value={String(selectedSeq.steps.length)}
                  />
                  <SequenceStat
                    label="Runway"
                    value={totalDelayLabel(selectedSeq.steps)}
                  />
                  <SequenceStat
                    label="Mode"
                    value={selectedSeq.isActive ? "Active" : "Paused"}
                  />
                  <SequenceStat label="Save" value="Auto" />
                </div>
              </div>

              <div className="px-4 py-5 sm:px-5">
                <div className="relative">
                  <div className="absolute bottom-8 left-[15px] top-2 w-px bg-zinc-200" />
                  <div className="relative mb-4 flex items-start gap-4">
                    <div className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-950 ring-4 ring-white">
                      <Zap size={13} strokeWidth={2} className="text-dunlo" />
                    </div>
                    <div className="pt-0.5">
                      <p className="text-sm font-semibold text-zinc-950">
                        Payment fails
                      </p>
                      <p className="mt-1 text-xs text-zinc-400">
                        Trigger for this sequence
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {selectedSeq.steps.map((step) => (
                      <StepCard
                        key={step.id}
                        step={step}
                        expanded={expandedStepId === step.id}
                        onToggleExpand={() => handleToggleExpand(step.id)}
                        edit={getEdit(step)}
                        onEdit={(patch) => setEdit(step, patch)}
                        status={saveStatus[step.id] ?? "idle"}
                        canDelete={selectedSeq.steps.length > 1}
                        deleting={
                          deleteStepMutation.isPending &&
                          deleteStepMutation.variables === step.id
                        }
                        onDelete={() => handleDeleteStep(step.id)}
                      />
                    ))}
                  </div>

                  <div className="relative mt-5 flex items-center gap-4">
                    <button
                      onClick={handleAddStep}
                      disabled={addStepMutation.isPending}
                      className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-dashed border-zinc-300 bg-white text-zinc-400 ring-4 ring-white transition-all hover:border-dunlo/50 hover:text-dunlo active:scale-[0.98] disabled:opacity-50"
                    >
                      <Plus size={14} strokeWidth={2.4} />
                    </button>
                    <button
                      onClick={handleAddStep}
                      disabled={addStepMutation.isPending}
                      className="text-sm font-semibold text-zinc-500 transition-colors hover:text-zinc-900 disabled:opacity-50"
                    >
                      {addStepMutation.isPending ? "Adding…" : "Add a step"}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <aside className="space-y-5 lg:sticky lg:top-[94px] lg:self-start">
              {previewStep && previewEdit && (
                <PreviewPanel
                  step={previewStep}
                  edit={previewEdit}
                  status={saveStatus[previewStep.id] ?? "idle"}
                />
              )}
              <VariablesPanel />
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

function SequenceStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
        {label}
      </p>
      <p className="mt-1 truncate font-mono text-sm font-semibold text-zinc-950">
        {value}
      </p>
    </div>
  );
}

function StepCard({
  step,
  expanded,
  onToggleExpand,
  edit,
  onEdit,
  status,
  canDelete,
  deleting,
  onDelete,
}: {
  step: StepLike;
  expanded: boolean;
  onToggleExpand: () => void;
  edit: EditState;
  onEdit: (patch: Partial<EditState>) => void;
  status: SaveStatus;
  canDelete: boolean;
  deleting: boolean;
  onDelete: () => void;
}) {
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);

  const insertVar = (name: string) => {
    const ta = bodyRef.current;
    const token = `{{${name}}}`;
    if (!ta) {
      onEdit({ body: edit.body + " " + token });
      return;
    }
    const start = ta.selectionStart ?? ta.value.length;
    const end = ta.selectionEnd ?? ta.value.length;
    const next = ta.value.slice(0, start) + token + ta.value.slice(end);
    onEdit({ body: next });
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + token.length;
      ta.setSelectionRange(pos, pos);
    });
  };

  const bodyFirstLine = edit.body.split("\n").find((l) => l.trim()) ?? "";

  return (
    <motion.div layout="position" className="relative flex items-start gap-4">
      <div className="relative z-10 mt-3 flex size-8 shrink-0 items-center justify-center rounded-full bg-white ring-4 ring-white">
        <div
          className={`flex size-8 items-center justify-center rounded-full font-mono text-[10px] font-bold ${
            expanded
              ? "bg-dunlo text-white"
              : "border border-zinc-200 bg-white text-zinc-500"
          }`}
        >
          {step.stepNumber}
        </div>
      </div>

      <div
        className={`min-w-0 flex-1 overflow-hidden rounded-2xl border transition-all ${
          expanded ? "border-dunlo/25 bg-white" : "border-zinc-100 bg-zinc-50"
        }`}
      >
        <button
          onClick={onToggleExpand}
          className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-zinc-50 active:bg-zinc-100"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Step {step.stepNumber}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[10px] font-medium text-zinc-500">
                <Clock size={10} strokeWidth={2} />
                {delayLabel(edit.delayHours)}
              </span>
              <SaveBadge status={status} />
            </div>
            <p className="mt-3 truncate text-sm font-semibold text-zinc-950">
              {edit.subject || (
                <span className="font-normal italic text-zinc-300">
                  No subject
                </span>
              )}
            </p>
            {!expanded && bodyFirstLine && (
              <p className="mt-1 line-clamp-1 text-xs leading-relaxed text-zinc-400">
                {bodyFirstLine}
              </p>
            )}
          </div>
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="mt-1 shrink-0"
          >
            <ChevronDown size={16} strokeWidth={2} className="text-zinc-400" />
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.section
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: "hidden" }}
            >
              <div className="space-y-5 border-t border-zinc-100 px-5 pb-5 pt-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[150px_minmax(0,1fr)]">
                  <div>
                    <FieldLabel>Delay</FieldLabel>
                    <div className="mt-2 flex h-10 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3">
                      <input
                        type="number"
                        min={0}
                        max={720}
                        value={edit.delayHours}
                        onChange={(e) =>
                          onEdit({
                            delayHours: Math.max(
                              0,
                              Number(e.target.value) || 0,
                            ),
                          })
                        }
                        className="min-w-0 flex-1 bg-transparent text-center font-mono text-sm font-semibold text-zinc-950 outline-none"
                      />
                      <span className="text-xs text-zinc-400">hours</span>
                    </div>
                  </div>

                  <div>
                    <FieldLabel>Subject</FieldLabel>
                    <input
                      type="text"
                      value={edit.subject}
                      onChange={(e) => onEdit({ subject: e.target.value })}
                      placeholder="Email subject line"
                      className="mt-2 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-950 outline-none transition-all placeholder:text-zinc-300 focus:border-dunlo/40 focus:ring-2 focus:ring-dunlo/10"
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel>Body</FieldLabel>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {TEMPLATE_VARS.map((v) => (
                      <button
                        key={v}
                        onClick={() => insertVar(v)}
                        className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 font-mono text-[10px] font-semibold text-zinc-500 transition-all hover:border-dunlo/40 hover:bg-dunlo/[0.06] hover:text-dunlo-deep active:scale-[0.98]"
                      >
                        {v}
                      </button>
                    ))}
                  </div>

                  <textarea
                    ref={bodyRef}
                    value={edit.body}
                    onChange={(e) => onEdit({ body: e.target.value })}
                    rows={9}
                    className="mt-3 w-full resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2.5 font-mono text-[12.5px] leading-[1.7] text-zinc-800 outline-none transition-all placeholder:text-zinc-300 focus:border-dunlo/40 focus:ring-2 focus:ring-dunlo/10"
                  />
                </div>

                {canDelete && (
                  <div className="flex items-center justify-end border-t border-zinc-100 pt-4">
                    <button
                      onClick={onDelete}
                      disabled={deleting}
                      className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-zinc-400 transition-all hover:bg-red-50 hover:text-red-600 active:scale-[0.98] disabled:opacity-50"
                    >
                      <Trash2 size={13} strokeWidth={2} />
                      {deleting ? "Deleting…" : "Delete step"}
                    </button>
                  </div>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function PreviewPanel({
  step,
  edit,
  status,
}: {
  step: StepLike;
  edit: EditState;
  status: SaveStatus;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200/70 bg-white">
      <div className="flex items-center justify-between gap-4 border-b border-zinc-100 px-4 py-3.5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            Preview
          </p>
          <p className="mt-1 text-sm font-semibold text-zinc-950">
            Step {step.stepNumber}
          </p>
        </div>
        <SaveBadge status={status} />
      </div>
      <div className="p-3">
        <EmailPreview
          subject={edit.subject}
          body={edit.body}
          delayHours={edit.delayHours}
        />
      </div>
    </section>
  );
}

function VariablesPanel() {
  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200/70 bg-white">
      <div className="border-b border-zinc-100 px-4 py-3.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Variables
        </p>
        <p className="mt-1 text-sm font-semibold text-zinc-950">
          Insert from the editor
        </p>
      </div>
      <div className="grid grid-cols-1 divide-y divide-zinc-100">
        {TEMPLATE_VARS.map((variable) => (
          <button
            key={variable}
            onClick={() => {
              void navigator.clipboard?.writeText(`{{${variable}}}`);
              toast.success("Variable copied");
            }}
            className="group flex items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors hover:bg-zinc-50 active:bg-zinc-100"
          >
            <span className="min-w-0 truncate font-mono text-[11px] font-semibold text-zinc-600">
              {`{{${variable}}}`}
            </span>
            <Copy
              size={12}
              strokeWidth={2}
              className="shrink-0 text-zinc-300 group-hover:text-dunlo"
            />
          </button>
        ))}
      </div>
    </section>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
      {children}
    </label>
  );
}

function SaveBadge({ status }: { status: SaveStatus }) {
  return (
    <AnimatePresence mode="wait">
      {status === "saving" && (
        <motion.span
          key="saving"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-700"
        >
          <span className="size-1 animate-pulse rounded-full bg-amber-500" />
          Saving
        </motion.span>
      )}
      {status === "saved" && (
        <motion.span
          key="saved"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="inline-flex items-center gap-1 rounded-full bg-dunlo/[0.08] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-dunlo-deep"
        >
          <span className="size-1 rounded-full bg-dunlo" />
          Saved
        </motion.span>
      )}
    </AnimatePresence>
  );
}

function EmailPreview({
  subject,
  body,
  delayHours,
}: {
  subject: string;
  body: string;
  delayHours: number;
}) {
  const rSubject = renderTemplate(subject, SAMPLE_VARS);
  const rBody = renderTemplate(body, SAMPLE_VARS);

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-100 bg-white">
      <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50 px-4 py-2.5">
        <span className="flex items-center gap-1 font-mono text-[10px] text-zinc-400">
          <Clock size={10} strokeWidth={2} />
          {delayLabel(delayHours)}
        </span>
        <CheckCircle2 size={13} strokeWidth={2} className="text-dunlo" />
      </div>
      <div className="space-y-1 border-b border-zinc-100 px-4 py-3 text-[11px]">
        <PreviewLine
          label="From"
          value="Aurélie Marchand <recovery@your-domain.com>"
        />
        <PreviewLine label="To" value="maxime@beauchamp.io" />
        <PreviewLine label="Subject" value={rSubject || "-"} bold />
      </div>
      <div className="whitespace-pre-wrap px-4 py-4 text-[12.5px] leading-[1.7] text-zinc-700">
        {rBody || <span className="italic text-zinc-300">Body is empty</span>}
      </div>
    </div>
  );
}

function PreviewLine({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex gap-2">
      <span className="w-12 shrink-0 font-medium text-zinc-400">{label}</span>
      <span
        className={`min-w-0 truncate ${bold ? "font-semibold text-zinc-950" : "text-zinc-700"}`}
      >
        {value}
      </span>
    </div>
  );
}
