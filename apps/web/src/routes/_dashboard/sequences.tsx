import { AnimatePresence, motion } from "framer-motion";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { usePostHog } from "posthog-js/react";
import {
  ChevronDown,
  Clock,
  Eye,
  EyeOff,
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
    if (!selectedSeq || !search.step) return null;
    return selectedSeq.steps.find((s) => s.id === search.step)
      ? search.step
      : null;
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
      } catch (e) {
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

  if (sequences.length === 0) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center px-6 py-28 text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-dunlo/[0.07]">
          <Zap size={20} className="text-dunlo" />
        </div>
        <p className="text-sm font-semibold text-zinc-800">No sequences yet</p>
        <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-zinc-400">
          Connect Stripe from the dashboard to seed default recovery sequences.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-[#f7f8fa]">
      {/* Sticky header */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-zinc-100">
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div>
            <h1 className="text-[15px] font-semibold tracking-tight text-zinc-900">
              Recovery sequences
            </h1>
            <p className="text-xs text-zinc-400">
              Automated emails sent after a payment fails
            </p>
          </div>
          <button
            onClick={handleReset}
            disabled={resetMutation.isPending}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-600 transition-all hover:bg-zinc-50 active:scale-[0.97] disabled:opacity-50"
          >
            <RotateCcw
              size={12}
              className={resetMutation.isPending ? "animate-spin" : ""}
            />
            Reset defaults
          </button>
        </div>

        {/* Sequence selector cards */}
        <div
          className="flex items-stretch gap-2 overflow-x-auto px-6 pb-4"
          style={{ scrollbarWidth: "none" }}
        >
          {sequences.map((seq) => {
            const active = seq.id === selectedSeq?.id;
            return (
              <button
                key={seq.id}
                onClick={() => handleSelectSeq(seq.id)}
                className={`relative flex shrink-0 flex-col items-start rounded-xl border px-4 py-3 text-left transition-all ${
                  active
                    ? "border-dunlo/25 bg-dunlo/[0.06] ring-1 ring-dunlo/20"
                    : "border-zinc-100 bg-zinc-50/70 hover:border-zinc-200 hover:bg-zinc-50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`size-1.5 shrink-0 rounded-full ${
                      seq.isActive ? "bg-dunlo" : "bg-zinc-300"
                    }`}
                  />
                  <span
                    className={`text-[12px] font-semibold ${active ? "text-zinc-900" : "text-zinc-700"}`}
                  >
                    {seq.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-zinc-400">
                    {seq.failureCode}
                  </span>
                  <span className="text-zinc-300">·</span>
                  <span className="text-[10px] text-zinc-400">
                    {seq.steps.length}{" "}
                    {seq.steps.length === 1 ? "step" : "steps"}
                  </span>
                </div>
                {active && (
                  <motion.span
                    layoutId="seq-selector-underline"
                    className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-dunlo"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Timeline content */}
      {selectedSeq && (
        <div className="mx-auto w-full px-6 pb-24 pt-8">
          {/* Sequence name + active toggle */}
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
                {selectedSeq.name}
              </h2>
              <p className="mt-0.5 font-mono text-[11px] text-zinc-400">
                {selectedSeq.failureCode}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2.5 pt-0.5">
              <span
                className={`text-[12px] font-medium ${
                  selectedSeq.isActive ? "text-dunlo-dim" : "text-zinc-400"
                }`}
              >
                {selectedSeq.isActive ? "Active" : "Paused"}
              </span>
              <button
                role="switch"
                aria-checked={selectedSeq.isActive}
                onClick={handleToggleActive}
                disabled={toggleMutation.isPending}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                  selectedSeq.isActive ? "bg-dunlo" : "bg-zinc-200"
                } disabled:opacity-50`}
              >
                <motion.span
                  layout
                  transition={{ type: "spring", stiffness: 480, damping: 32 }}
                  className={`pointer-events-none inline-block size-4 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.15)] ${
                    selectedSeq.isActive ? "ml-auto mr-0.5" : "ml-0.5 mr-auto"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* The timeline */}
          <div className="relative">
            {/* Vertical track line */}
            <div
              className="absolute left-[13px] top-0 bottom-0 w-px bg-zinc-200"
              aria-hidden
            />

            {/* Trigger node */}
            <div className="relative mb-1 flex items-start gap-4">
              <div className="relative z-10 flex size-[27px] shrink-0 items-center justify-center rounded-full bg-zinc-900 ring-4 ring-[#f7f8fa]">
                <Zap size={12} className="text-dunlo" />
              </div>
              <div className="pb-5 pt-0.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  Trigger event
                </p>
                <p className="mt-0.5 text-[13px] font-semibold text-zinc-800">
                  Payment fails
                </p>
                <span className="mt-1.5 inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-[10px] text-zinc-500">
                  {selectedSeq.failureCode}
                </span>
              </div>
            </div>

            {/* Steps */}
            {selectedSeq.steps.map((step) => (
              <div key={step.id}>
                {/* Delay connector */}
                <div className="relative mb-1 flex items-center gap-4 py-1.5">
                  <div className="size-[27px] shrink-0" />
                  <div className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[10px] font-medium text-zinc-500">
                    <Clock size={9} strokeWidth={2.2} />
                    {delayLabel(step.delayHours)}
                  </div>
                </div>

                {/* Step card */}
                <StepCard
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
              </div>
            ))}

            {/* Add step connector + button */}
            <div className="relative mt-1 flex items-center gap-4 py-2">
              <div className="size-[27px] shrink-0" />
              <div className="h-px flex-1 border-t border-dashed border-zinc-200" />
            </div>
            <div className="relative flex items-center gap-4">
              <button
                onClick={handleAddStep}
                disabled={addStepMutation.isPending}
                className="relative z-10 flex size-[27px] shrink-0 items-center justify-center rounded-full border-2 border-dashed border-zinc-300 bg-[#f7f8fa] text-zinc-400 ring-4 ring-[#f7f8fa] transition-all hover:border-dunlo/50 hover:text-dunlo disabled:opacity-50"
              >
                <Plus size={12} strokeWidth={2.5} />
              </button>
              <button
                onClick={handleAddStep}
                disabled={addStepMutation.isPending}
                className="text-[12px] font-semibold text-zinc-400 transition-colors hover:text-zinc-700 disabled:opacity-50"
              >
                {addStepMutation.isPending ? "Adding…" : "Add a step"}
              </button>
            </div>
          </div>
        </div>
      )}
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
  const [previewOpen, setPreviewOpen] = useState(false);
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

  const bodyFirstLine = step.body.split("\n").find((l) => l.trim()) ?? "";

  return (
    <motion.div
      layout="position"
      className="relative flex items-start gap-4 mb-1"
    >
      {/* Step number badge */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 420, damping: 30 }}
        className={`relative z-10 flex size-[27px] shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold ring-4 ring-[#f7f8fa] transition-colors ${
          expanded
            ? "bg-dunlo text-white shadow-[0_0_0_2px_rgba(0,232,123,0.3)]"
            : "border-2 border-zinc-200 bg-white text-zinc-500"
        }`}
      >
        {step.stepNumber}
      </motion.div>

      {/* Card */}
      <div
        className={`flex-1 overflow-hidden rounded-2xl border transition-all ${
          expanded
            ? "border-dunlo/20 bg-white shadow-[0_2px_20px_-4px_rgba(0,232,123,0.15)]"
            : "border-zinc-100 bg-white hover:border-zinc-200"
        }`}
      >
        {/* Always-visible header */}
        <button
          onClick={onToggleExpand}
          className="flex w-full items-start justify-between px-5 py-4 text-left"
        >
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Step {step.stepNumber}
              </span>
              <SaveBadge status={status} />
            </div>
            <p
              className={`text-[13px] font-semibold leading-snug ${
                expanded ? "text-zinc-900" : "text-zinc-700"
              }`}
            >
              {edit.subject || (
                <span className="font-normal italic text-zinc-300">
                  No subject
                </span>
              )}
            </p>
            {!expanded && bodyFirstLine && (
              <p className="mt-1 line-clamp-1 text-[11px] leading-relaxed text-zinc-400">
                {bodyFirstLine}
              </p>
            )}
          </div>
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="ml-3 mt-0.5 shrink-0"
          >
            <ChevronDown size={14} className="text-zinc-400" />
          </motion.span>
        </button>

        {/* Expanded editor */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.section
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: "hidden" }}
            >
              <div className="space-y-5 border-t border-zinc-100 px-5 pb-5 pt-4">
                {/* Delay */}
                <div>
                  <FieldLabel>Delay from trigger</FieldLabel>
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      type="number"
                      min={0}
                      max={720}
                      value={edit.delayHours}
                      onChange={(e) =>
                        onEdit({
                          delayHours: Math.max(0, Number(e.target.value) || 0),
                        })
                      }
                      className="h-8 w-20 rounded-lg border border-zinc-200 bg-white px-2 text-center font-mono text-[12px] font-semibold text-zinc-900 outline-none transition-colors focus:border-dunlo/40 focus:ring-2 focus:ring-dunlo/15"
                    />
                    <span className="text-[12px] text-zinc-500">hours</span>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <FieldLabel>Subject</FieldLabel>
                  <input
                    type="text"
                    value={edit.subject}
                    onChange={(e) => onEdit({ subject: e.target.value })}
                    placeholder="Email subject line…"
                    className="mt-2 w-full border-b border-zinc-200 bg-transparent pb-2 text-[14px] font-semibold text-zinc-900 placeholder-zinc-300 outline-none transition-colors focus:border-dunlo"
                  />
                </div>

                {/* Body */}
                <div>
                  <div className="flex items-center justify-between">
                    <FieldLabel>Body</FieldLabel>
                    <span className="text-[10px] text-zinc-400">
                      Click a variable to insert
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {TEMPLATE_VARS.map((v) => (
                      <button
                        key={v}
                        onClick={() => insertVar(v)}
                        className="rounded-md border border-zinc-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 transition-all hover:border-dunlo/40 hover:bg-dunlo/5 hover:text-dunlo-deep active:scale-[0.97]"
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                  <textarea
                    ref={bodyRef}
                    value={edit.body}
                    onChange={(e) => onEdit({ body: e.target.value })}
                    rows={10}
                    className="mt-2 w-full resize-none rounded-xl border border-zinc-100 bg-zinc-50/40 px-3 py-2.5 font-mono text-[12.5px] leading-[1.65] text-zinc-800 outline-none transition-all focus:border-dunlo/40 focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,232,123,0.08)]"
                  />
                </div>

                {/* Preview toggle */}
                <div>
                  <button
                    onClick={() => setPreviewOpen((p) => !p)}
                    className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500 transition-colors hover:text-zinc-800"
                  >
                    {previewOpen ? <EyeOff size={11} /> : <Eye size={11} />}
                    {previewOpen ? "Hide preview" : "Preview rendered email"}
                  </button>
                  <AnimatePresence initial={false}>
                    {previewOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        style={{ overflow: "hidden" }}
                      >
                        <div className="mt-3">
                          <EmailPreview
                            subject={edit.subject}
                            body={edit.body}
                            delayHours={edit.delayHours}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Delete */}
                {canDelete && (
                  <div className="flex items-center justify-end border-t border-zinc-100 pt-3">
                    <button
                      onClick={onDelete}
                      disabled={deleting}
                      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 active:scale-[0.97] disabled:opacity-50"
                    >
                      <Trash2 size={11} />
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
          className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-700"
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
          className="inline-flex items-center gap-1 rounded-md bg-dunlo/8 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-dunlo-deep"
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
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-2">
        <div className="flex items-center gap-2 text-[10px] text-zinc-400">
          <span className="size-1.5 rounded-full bg-zinc-200" />
          <span className="size-1.5 rounded-full bg-zinc-200" />
          <span className="size-1.5 rounded-full bg-zinc-200" />
        </div>
        <span className="flex items-center gap-1 font-mono text-[10px] text-zinc-400">
          <Clock size={9} />
          {delayLabel(delayHours)}
        </span>
      </div>
      <div className="space-y-1 border-b border-zinc-50 px-4 py-3 text-[11px]">
        <PreviewLine
          label="From"
          value="Aurélie Marchand <recovery@your-domain.com>"
        />
        <PreviewLine label="To" value="maxime@beauchamp.io" />
        <PreviewLine label="Subject" value={rSubject || "—"} bold />
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
        className={`min-w-0 truncate ${bold ? "font-semibold text-zinc-900" : "text-zinc-700"}`}
      >
        {value}
      </span>
    </div>
  );
}
