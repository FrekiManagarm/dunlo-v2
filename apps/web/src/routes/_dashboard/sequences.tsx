import { AnimatePresence, motion } from "framer-motion";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
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
import { useMemo, useRef, useState } from "react";
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
  if (hours === 0) return "Send immediately";
  if (hours < 24) return `After ${hours}h`;
  const d = Math.round(hours / 24);
  return `After ${d}d`;
}

type StepLike = SequenceWithSteps["steps"][number];
type EditState = { subject: string; body: string; delayHours: number };
type SaveStatus = "idle" | "saving" | "saved";

function RouteComponent() {
  const queryClient = useQueryClient();
  const { data: sequences } = useSuspenseQuery(sequencesQueryOptions());
  const navigate = Route.useNavigate();
  const search = Route.useSearch();

  const [resetting, setResetting] = useState(false);
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
    void navigate({
      to: "/sequences",
      search: { seq: id, step: undefined },
    });

  const handleToggleExpand = (id: string) => {
    const next = expandedStepId === id ? undefined : id;
    void navigate({
      to: "/sequences",
      search: { seq: selectedSeq?.id, step: next },
    });
  };

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["sequences"] });

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
        await updateSequenceStep({
          data: {
            stepId: step.id,
            subject: next.subject,
            body: next.body,
            delayHours: next.delayHours,
          },
        });
        setSaveStatus((s) => ({ ...s, [step.id]: "saved" }));
        await invalidate();
        savedTimers.current[step.id] = setTimeout(() => {
          setSaveStatus((s) => ({ ...s, [step.id]: "idle" }));
        }, 1500);
      } catch (e) {
        setSaveStatus((s) => ({ ...s, [step.id]: "idle" }));
        toast.error(e instanceof Error ? e.message : "Save failed");
      }
    }, 900);
  };

  const handleToggleActive = async () => {
    if (!selectedSeq) return;
    try {
      await toggleSequence({
        data: { sequenceId: selectedSeq.id, isActive: !selectedSeq.isActive },
      });
      await invalidate();
      toast.success(
        selectedSeq.isActive ? "Sequence paused" : "Sequence enabled",
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    }
  };

  const handleAddStep = async () => {
    if (!selectedSeq) return;
    const nextNumber = (selectedSeq.steps.at(-1)?.stepNumber ?? 0) + 1;
    try {
      await addSequenceStep({
        data: {
          sequenceId: selectedSeq.id,
          stepNumber: nextNumber,
          subject: "New step subject",
          body: "Hi {{customer_name}},\n\nYour message here.\n\n{{sender_name}}",
          delayHours: 24,
        },
      });
      await invalidate();
      toast.success("Step added");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add step");
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    if (!window.confirm("Delete this step?")) return;
    try {
      await deleteSequenceStep({ data: { stepId } });
      await invalidate();
      toast.success("Step deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  const handleReset = async () => {
    if (
      !window.confirm(
        "Reset all sequences to defaults? This will delete your customizations.",
      )
    )
      return;
    setResetting(true);
    try {
      await resetSequencesToDefault();
      setEdits({});
      await invalidate();
      toast.success("Sequences reset to defaults");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Reset failed");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-full bg-[#f7f8fa]">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-100 bg-white/80 px-6 py-4 backdrop-blur-md">
        <div>
          <h1 className="text-[15px] font-semibold tracking-tight text-zinc-900">
            Recovery sequences
          </h1>
          <p className="text-xs text-zinc-400">
            Automated emails sent when a payment fails
          </p>
        </div>
        <button
          onClick={handleReset}
          disabled={resetting}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-600 transition-all hover:bg-zinc-50 active:scale-[0.97] disabled:opacity-50"
        >
          <RotateCcw size={12} className={resetting ? "animate-spin" : ""} />
          Reset defaults
        </button>
      </header>

      {sequences.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="mx-auto max-w-3xl px-6 pb-20 pt-6">
          {/* Tabs */}
          <nav className="-mx-2 mb-7 flex items-center gap-1 overflow-x-auto px-2 pb-1">
            {sequences.map((seq) => (
              <SequenceTab
                key={seq.id}
                seq={seq}
                active={seq.id === selectedSeq?.id}
                onClick={() => handleSelectSeq(seq.id)}
              />
            ))}
          </nav>

          {selectedSeq && (
            <>
              {/* Meta */}
              <div className="mb-8 flex items-end justify-between gap-6">
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-semibold tracking-tight text-zinc-900">
                    {selectedSeq.name}
                  </h2>
                  <p className="mt-1 text-[12px] text-zinc-500">
                    Fires on{" "}
                    <span className="font-mono text-zinc-700">
                      {selectedSeq.failureCode}
                    </span>{" "}
                    · {selectedSeq.steps.length}{" "}
                    {selectedSeq.steps.length === 1 ? "step" : "steps"}
                  </p>
                </div>
                <ActiveToggle
                  active={selectedSeq.isActive}
                  onToggle={handleToggleActive}
                />
              </div>

              {/* Steps */}
              <StepList
                steps={selectedSeq.steps}
                expandedId={expandedStepId}
                onToggleExpand={handleToggleExpand}
                getEdit={getEdit}
                onEdit={setEdit}
                saveStatus={saveStatus}
                onDelete={handleDeleteStep}
                canDelete={selectedSeq.steps.length > 1}
                onAdd={handleAddStep}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function SequenceTab({
  seq,
  active,
  onClick,
}: {
  seq: SequenceWithSteps;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-[12px] font-semibold transition-colors ${
        active
          ? "text-white"
          : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
      }`}
    >
      {active && (
        <motion.span
          layoutId="seq-tab-pill"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="absolute inset-0 rounded-full bg-zinc-900"
        />
      )}
      <span className="relative flex items-center gap-2">
        <span
          className={`size-1.5 shrink-0 rounded-full ${
            seq.isActive
              ? active
                ? "bg-dunlo-hover"
                : "bg-dunlo"
              : active
                ? "bg-white/40"
                : "bg-zinc-300"
          }`}
        />
        <span className="font-mono text-[11px]">{seq.failureCode}</span>
      </span>
    </button>
  );
}

function ActiveToggle({
  active,
  onToggle,
}: {
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-3">
      <span
        className={`text-[12px] font-medium ${
          active ? "text-dunlo-dim" : "text-zinc-400"
        }`}
      >
        {active ? "Active" : "Paused"}
      </span>
      <button
        role="switch"
        aria-checked={active}
        onClick={onToggle}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
          active ? "bg-dunlo" : "bg-zinc-200"
        }`}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 480, damping: 32 }}
          className={`pointer-events-none inline-block size-4 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.15)] ${
            active ? "ml-auto mr-0.5" : "ml-0.5 mr-auto"
          }`}
        />
      </button>
    </div>
  );
}

function StepList({
  steps,
  expandedId,
  onToggleExpand,
  getEdit,
  onEdit,
  saveStatus,
  onDelete,
  canDelete,
  onAdd,
}: {
  steps: StepLike[];
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
  getEdit: (step: StepLike) => EditState;
  onEdit: (step: StepLike, patch: Partial<EditState>) => void;
  saveStatus: Record<string, SaveStatus>;
  onDelete: (id: string) => void;
  canDelete: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="relative">
      <div
        className="absolute left-3 top-3 bottom-3 w-px bg-zinc-200"
        aria-hidden
      />
      <ul className="space-y-1.5">
        {steps.map((step) => (
          <StepRow
            key={step.id}
            step={step}
            expanded={expandedId === step.id}
            onToggleExpand={() => onToggleExpand(step.id)}
            edit={getEdit(step)}
            onEdit={(patch) => onEdit(step, patch)}
            status={saveStatus[step.id] ?? "idle"}
            canDelete={canDelete}
            onDelete={() => onDelete(step.id)}
          />
        ))}
        <AddStepRow onClick={onAdd} />
      </ul>
    </div>
  );
}

function StepRow({
  step,
  expanded,
  onToggleExpand,
  edit,
  onEdit,
  status,
  canDelete,
  onDelete,
}: {
  step: StepLike;
  expanded: boolean;
  onToggleExpand: () => void;
  edit: EditState;
  onEdit: (patch: Partial<EditState>) => void;
  status: SaveStatus;
  canDelete: boolean;
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

  return (
    <motion.li layout="position" className="relative">
      <button
        onClick={onToggleExpand}
        className={`flex w-full items-start gap-4 rounded-2xl px-3 py-3 text-left transition-colors ${
          expanded ? "bg-white" : "hover:bg-zinc-50"
        }`}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 420, damping: 30 }}
          className={`relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold transition-colors ${
            expanded
              ? "bg-dunlo text-white shadow-[0_0_0_3px_#f7f8fa]"
              : "border-2 border-zinc-200 bg-white text-zinc-600"
          }`}
        >
          {step.stepNumber}
        </motion.span>
        <div className="min-w-0 flex-1 pt-px">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-zinc-800">
                Step {step.stepNumber}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-zinc-50 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">
                <Clock size={9} strokeWidth={2.2} />
                {delayLabel(step.delayHours)}
              </span>
              <SaveBadge status={status} />
            </div>
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0"
            >
              <ChevronDown size={14} className="text-zinc-400" />
            </motion.span>
          </div>
          <p
            className={`mt-1 truncate text-[12px] ${
              expanded ? "text-zinc-500" : "text-zinc-400"
            }`}
          >
            {step.subject || (
              <span className="italic text-zinc-300">No subject</span>
            )}
          </p>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.section
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="space-y-5 pl-10 pr-3 pb-5 pt-2">
              {/* Delay */}
              <div>
                <Label>Delay</Label>
                <div className="mt-2 flex items-center gap-2">
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
                  <span className="text-[12px] text-zinc-500">
                    hours from trigger
                  </span>
                </div>
              </div>

              {/* Subject */}
              <div>
                <Label>Subject</Label>
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
                  <Label>Body</Label>
                  <span className="text-[10px] text-zinc-400">
                    Tap a variable to insert
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {TEMPLATE_VARS.map((v) => (
                    <button
                      key={v}
                      onClick={() => insertVar(v)}
                      className="rounded-md border border-zinc-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 transition-all hover:border-dunlo/40 hover:bg-dunlo/[0.05] hover:text-dunlo-deep active:scale-[0.97]"
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

              {/* Preview disclosure */}
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

              {/* Footer */}
              {canDelete && (
                <div className="flex items-center justify-end border-t border-zinc-100 pt-3">
                  <button
                    onClick={onDelete}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 active:scale-[0.97]"
                  >
                    <Trash2 size={11} />
                    Delete step
                  </button>
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

function AddStepRow({ onClick }: { onClick: () => void }) {
  return (
    <li className="relative">
      <button
        onClick={onClick}
        className="flex w-full items-center gap-4 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-zinc-50"
      >
        <span className="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-zinc-200 bg-[#f7f8fa] text-zinc-400 transition-colors group-hover:border-dunlo/40">
          <Plus size={11} strokeWidth={2.2} />
        </span>
        <span className="text-[12px] font-semibold text-zinc-500">
          Add step
        </span>
      </button>
    </li>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
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
          className="inline-flex items-center gap-1 rounded-md bg-dunlo/[0.08] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-dunlo-deep"
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
        <PreviewLine label="From" value="Aurélie Marchand <recovery@your-domain.com>" />
        <PreviewLine label="To" value="maxime@beauchamp.io" />
        <PreviewLine label="Subject" value={rSubject || "—"} bold />
      </div>
      <div className="whitespace-pre-wrap px-4 py-4 text-[12.5px] leading-[1.7] text-zinc-700">
        {rBody || (
          <span className="italic text-zinc-300">Body is empty</span>
        )}
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

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-28 text-center">
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
