import { AnimatePresence, motion } from "framer-motion";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CheckCircle,
  RefreshCw,
  Send,
  Trash2,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import {
  dismissEscalation,
  getEscalations,
  regenerateEscalationDraft,
  sendEscalationEmail,
  updateEscalationDraft,
  type EscalationRow,
} from "@/functions/escalations";
import { formatAmount, humanizeFailureCode } from "@/lib/template";

export const Route = createFileRoute("/_dashboard/escalations")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Escalations — Dunlo" },
    ],
  }),
  loader: async () => {
    const escalations = await getEscalations();
    return { escalations };
  },
  component: RouteComponent,
});

function relativeTime(from: Date): string {
  const diffMs = Date.now() - from.getTime();
  const sec = Math.max(0, Math.floor(diffMs / 1000));
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

type CardEdit = { subject: string; body: string };
type BusyState = { sending: boolean; regenerating: boolean; dismissing: boolean };

function RouteComponent() {
  const { escalations: initial } = Route.useLoaderData();
  const [items, setItems] = useState<EscalationRow[]>(initial);
  const [edits, setEdits] = useState<Record<string, CardEdit>>(() =>
    Object.fromEntries(
      initial.map((e) => [e.id, { subject: e.draftSubject ?? "", body: e.draftBody ?? "" }]),
    ),
  );
  const [busy, setBusy] = useState<Record<string, BusyState>>(() =>
    Object.fromEntries(
      initial.map((e) => [e.id, { sending: false, regenerating: false, dismissing: false }]),
    ),
  );
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  function scheduleAutoSave(id: string, subject: string, body: string) {
    clearTimeout(saveTimers.current[id]);
    saveTimers.current[id] = setTimeout(async () => {
      if (!subject.trim() || !body.trim()) return;
      try {
        await updateEscalationDraft({ data: { escalationId: id, subject, body } });
      } catch (e) {
        console.error("[escalations] auto-save failed", e);
      }
    }, 1000);
  }

  function setEdit(id: string, field: "subject" | "body", value: string) {
    const next = { ...edits[id], [field]: value };
    setEdits((prev) => ({ ...prev, [id]: next }));
    scheduleAutoSave(id, next.subject, next.body);
  }

  async function handleSend(id: string) {
    setBusy((prev) => ({ ...prev, [id]: { ...prev[id], sending: true } }));
    try {
      await sendEscalationEmail({ data: { escalationId: id } });
      setItems((prev) => prev.map((e) => (e.id === id ? { ...e, status: "sent" as const } : e)));
      toast.success("Email sent");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setBusy((prev) => ({ ...prev, [id]: { ...prev[id], sending: false } }));
    }
  }

  async function handleRegenerate(id: string) {
    setBusy((prev) => ({ ...prev, [id]: { ...prev[id], regenerating: true } }));
    try {
      await regenerateEscalationDraft({ data: { escalationId: id } });
      const refreshed = await getEscalations();
      setItems(refreshed);
      const updated = refreshed.find((e) => e.id === id);
      if (updated) {
        setEdits((prev) => ({
          ...prev,
          [id]: { subject: updated.draftSubject ?? "", body: updated.draftBody ?? "" },
        }));
      }
      toast.success("Draft regenerated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to regenerate");
    } finally {
      setBusy((prev) => ({ ...prev, [id]: { ...prev[id], regenerating: false } }));
    }
  }

  async function handleDismiss(id: string) {
    setBusy((prev) => ({ ...prev, [id]: { ...prev[id], dismissing: true } }));
    try {
      await dismissEscalation({ data: { escalationId: id } });
      setItems((prev) => prev.filter((e) => e.id !== id));
      toast.success("Escalation dismissed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to dismiss");
    } finally {
      setBusy((prev) => ({ ...prev, [id]: { ...prev[id], dismissing: false } }));
    }
  }

  const pendingCount = items.filter((e) => e.status === "pending").length;

  return (
    <>
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-100 bg-white/80 px-6 py-4 backdrop-blur-md">
        <div>
          <h1 className="text-[15px] font-semibold tracking-tight text-zinc-900">Escalations</h1>
          <p className="text-xs text-zinc-400">High-value payments requiring manual action</p>
        </div>
        {pendingCount > 0 && (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            {pendingCount} pending
          </span>
        )}
      </div>

      <div className="mx-auto max-w-2xl space-y-3 p-6">
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-28 text-center"
          >
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-dunlo/[0.07]">
              <CheckCircle size={22} className="text-dunlo" />
            </div>
            <p className="text-sm font-semibold text-zinc-800">All clear</p>
            <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-zinc-400">
              Payments above your threshold will appear here. Adjust the threshold in{" "}
              <Link to="/settings" className="text-dunlo-dim underline underline-offset-2">
                Settings
              </Link>
              .
            </p>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {items.map((esc, i) => {
              const edit = edits[esc.id] ?? { subject: "", body: "" };
              const b = busy[esc.id] ?? { sending: false, regenerating: false, dismissing: false };
              const draftReady = Boolean(esc.draftSubject);
              const isSent = esc.status === "sent";

              return (
                <motion.div
                  key={esc.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: i * 0.04, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className={`overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-[0_1px_4px_0_rgba(0,0,0,0.04)] transition-opacity ${
                    isSent ? "opacity-60" : ""
                  }`}
                >
                  <div className={`h-[3px] w-full ${isSent ? "bg-dunlo/30" : "bg-amber-400"}`} />

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[15px] font-semibold text-zinc-900">
                          {esc.payment.customerName ?? esc.payment.customerEmail}
                        </p>
                        <p className="text-xs text-zinc-400">{esc.payment.customerEmail}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <span className="font-mono text-base font-bold text-zinc-900">
                          {formatAmount(esc.payment.amount, esc.payment.currency)}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                            {humanizeFailureCode(esc.payment.failureCode)}
                          </span>
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                              isSent ? "bg-dunlo/10 text-dunlo-deep" : "bg-amber-50 text-amber-600"
                            }`}
                          >
                            {isSent ? "sent" : "pending"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="mt-1.5 text-[11px] text-zinc-400">
                      {relativeTime(new Date(esc.createdAt))}
                    </p>

                    {!draftReady ? (
                      <div className="mt-4 space-y-2">
                        <div className="h-9 w-full animate-pulse rounded-xl bg-zinc-100" />
                        <div className="h-28 w-full animate-pulse rounded-xl bg-zinc-100" />
                        <p className="text-center text-[11px] text-zinc-400">
                          AI is drafting your recovery email…
                        </p>
                      </div>
                    ) : (
                      <div className="mt-4 space-y-2">
                        <input
                          type="text"
                          value={edit.subject}
                          onChange={(e) => setEdit(esc.id, "subject", e.target.value)}
                          disabled={isSent}
                          placeholder="Subject"
                          className="h-9 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 placeholder-zinc-300 transition-colors focus:border-dunlo/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-dunlo/20 disabled:opacity-50"
                        />
                        <textarea
                          value={edit.body}
                          onChange={(e) => setEdit(esc.id, "body", e.target.value)}
                          disabled={isSent}
                          rows={5}
                          placeholder="Email body"
                          className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm leading-relaxed text-zinc-900 placeholder-zinc-300 transition-colors focus:border-dunlo/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-dunlo/20 disabled:opacity-50"
                        />
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <button
                        onClick={() => handleDismiss(esc.id)}
                        disabled={b.dismissing}
                        className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 active:scale-[0.97] disabled:opacity-40"
                        aria-label="Dismiss"
                      >
                        <Trash2 size={14} />
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRegenerate(esc.id)}
                          disabled={b.regenerating || isSent}
                          className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition-all hover:bg-zinc-50 active:scale-[0.97] disabled:opacity-40"
                        >
                          <RefreshCw size={11} className={b.regenerating ? "animate-spin" : ""} />
                          Regenerate
                        </button>
                        <button
                          onClick={() => handleSend(esc.id)}
                          disabled={b.sending || !draftReady || isSent}
                          className="flex items-center gap-1.5 rounded-lg bg-dunlo px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-dunlo-hover active:scale-[0.97] disabled:opacity-40"
                        >
                          <Send size={11} />
                          {b.sending ? "Sending…" : "Send"}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </>
  );
}
