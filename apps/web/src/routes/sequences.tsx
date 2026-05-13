import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  AlertCircle,
  Bell,
  LayoutDashboard,
  LogOut,
  Plus,
  RotateCcw,
  Save,
  Settings,
  Trash2,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/logo";
import { authClient } from "@/lib/auth-client";
import { getUser } from "@/functions/get-user";
import {
  addSequenceStep,
  deleteSequenceStep,
  getSequences,
  resetSequencesToDefault,
  toggleSequence,
  updateSequenceStep,
  type SequenceWithSteps,
} from "@/functions/sequences";

export const Route = createFileRoute("/sequences")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Recovery sequences — Dunlo" },
    ],
  }),
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await getUser();
    return { session };
  },
  loader: async ({ context }) => {
    if (!context.session) {
      throw redirect({ to: "/login" });
    }
    const sequences = await getSequences();
    return { sequences };
  },
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
  const { session } = Route.useRouteContext();
  const { sequences: initialSequences } = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const [sequences, setSequences] = useState<SequenceWithSteps[]>(initialSequences);
  const [busy, setBusy] = useState(false);

  const handleSignOut = () => {
    authClient.signOut({
      fetchOptions: { onSuccess: () => navigate({ to: "/" }) },
    });
  };

  const refresh = async () => {
    const fresh = await getSequences();
    setSequences(fresh);
  };

  const onToggle = async (sequenceId: string, isActive: boolean) => {
    try {
      await toggleSequence({ data: { sequenceId, isActive } });
      setSequences((prev) =>
        prev.map((s) => (s.id === sequenceId ? { ...s, isActive } : s)),
      );
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
    <div className="flex min-h-dvh bg-[#f7f8fa] font-sans">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-gray-100 bg-white lg:flex">
        <div className="flex items-center border-b border-gray-100 px-5 py-4">
          <Logo size={26} />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {[
            { icon: LayoutDashboard, label: "Overview", to: "/dashboard", active: false },
            { icon: Zap, label: "Recovery sequences", to: "/sequences", active: true },
            { icon: AlertCircle, label: "Escalations", to: "/dashboard", active: false },
            { icon: Bell, label: "Alerts", to: "/dashboard", active: false },
            { icon: Settings, label: "Settings", to: "/settings", active: false },
          ].map(({ icon: Icon, label, to, active }) => (
            <button
              key={label}
              onClick={() => navigate({ to })}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>

        <div className="border-t border-gray-100 p-4">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-700">
              {session?.user.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">
                {session?.user.name}
              </p>
              <p className="truncate text-xs text-gray-400">
                {session?.user.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-xs text-gray-400 transition-colors hover:text-gray-700"
          >
            <LogOut size={12} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-100 bg-white/80 px-6 py-4 backdrop-blur-md">
          <div>
            <h1 className="text-base font-bold text-gray-900">Recovery sequences</h1>
            <p className="text-xs text-gray-400">
              One sequence per Stripe failure code. Steps run automatically when a payment fails.
            </p>
          </div>
          <button
            onClick={onReset}
            disabled={busy}
            className="flex shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50"
          >
            <RotateCcw size={12} />
            Reset to defaults
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-900">Available variables</p>
            <p className="mt-1 text-xs text-gray-500">
              Drop these into any subject or body — they're replaced at send time.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {TEMPLATE_VARS.map((v) => (
                <code
                  key={v}
                  className="rounded-md bg-gray-50 px-2 py-1 font-mono text-[11px] text-gray-700"
                >
                  {v}
                </code>
              ))}
            </div>
          </div>

          {sequences.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
              <p className="text-sm font-semibold text-gray-900">No sequences yet</p>
              <p className="mt-1 text-xs text-gray-500">
                Connect Stripe from the dashboard to seed default recovery sequences.
              </p>
            </div>
          ) : (
            sequences.map((seq) => (
              <div
                key={seq.id}
                className="rounded-2xl border border-gray-100 bg-white shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{seq.name}</p>
                    <p className="text-xs text-gray-400">
                      Failure code:{" "}
                      <code className="font-mono text-gray-500">{seq.failureCode}</code>
                    </p>
                  </div>
                  <label className="flex cursor-pointer items-center gap-2">
                    <span className="text-xs font-medium text-gray-500">
                      {seq.isActive ? "Active" : "Paused"}
                    </span>
                    <span
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        seq.isActive ? "bg-dunlo" : "bg-gray-200"
                      }`}
                      onClick={() => onToggle(seq.id, !seq.isActive)}
                    >
                      <span
                        className={`inline-block size-4 transform rounded-full bg-white shadow transition-transform ${
                          seq.isActive ? "translate-x-4" : "translate-x-0.5"
                        }`}
                      />
                    </span>
                  </label>
                </div>

                <div className="divide-y divide-gray-50">
                  {seq.steps.map((step) => (
                    <StepEditor
                      key={step.id}
                      step={step}
                      canDelete={seq.steps.length > 1}
                      onSaved={refresh}
                      onDelete={() => onDelete(step.id)}
                    />
                  ))}
                </div>

                <div className="border-t border-gray-100 px-5 py-3">
                  <button
                    onClick={() => onAddStep(seq)}
                    className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-200"
                  >
                    <Plus size={12} />
                    Add step
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
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
}) {
  const [subject, setSubject] = useState(step.subject);
  const [body, setBody] = useState(step.body);
  const [delayHours, setDelayHours] = useState(step.delayHours);
  const [saving, setSaving] = useState(false);

  const dirty =
    subject !== step.subject ||
    body !== step.body ||
    delayHours !== step.delayHours;

  const onSave = async () => {
    if (subject.trim().length === 0 || body.trim().length === 0) {
      toast.error("Subject and body are required");
      return;
    }
    setSaving(true);
    try {
      await updateSequenceStep({
        data: { stepId: step.id, subject, body, delayHours },
      });
      await onSaved();
      toast.success(`Step ${step.stepNumber} saved`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3 px-5 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-dunlo/15 text-[11px] font-bold text-dunlo-deep">
            {step.stepNumber}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>Send after</span>
            <input
              type="number"
              min={0}
              max={720}
              value={delayHours}
              onChange={(e) => setDelayHours(Number(e.target.value) || 0)}
              className="h-7 w-16 rounded-lg border border-gray-200 bg-white px-2 text-center font-mono text-xs text-gray-900 focus:border-dunlo focus:outline-none"
            />
            <span>hours</span>
          </div>
        </div>
        {canDelete && (
          <button
            onClick={onDelete}
            className="text-gray-400 transition-colors hover:text-red-500"
            aria-label="Delete step"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Subject
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-dunlo focus:outline-none focus:ring-2 focus:ring-dunlo/20"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Body
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 font-mono text-xs text-gray-900 focus:border-dunlo focus:outline-none focus:ring-2 focus:ring-dunlo/20"
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={onSave}
          disabled={!dirty || saving}
          className="flex items-center gap-1.5 rounded-full bg-dunlo px-4 py-1.5 text-xs font-semibold text-white transition-all hover:bg-dunlo-hover active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save size={12} />
          {saving ? "Saving…" : "Save step"}
        </button>
      </div>
    </div>
  );
}
