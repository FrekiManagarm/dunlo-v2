import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  AlertCircle,
  Bell,
  CheckCircle,
  LayoutDashboard,
  LogOut,
  Receipt,
  RefreshCw,
  Send,
  Settings,
  Trash2,
  Zap,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/logo";
import { authClient } from "@/lib/auth-client";
import { getUser } from "@/functions/get-user";
import {
  dismissEscalation,
  getEscalations,
  regenerateEscalationDraft,
  sendEscalationEmail,
  updateEscalationDraft,
  type EscalationRow,
} from "@/functions/escalations";
import { formatAmount, humanizeFailureCode } from "@/lib/template";

export const Route = createFileRoute("/escalations")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Escalations — Dunlo" },
    ],
  }),
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await getUser();
    return { session };
  },
  loader: async ({ context }) => {
    if (!context.session) throw redirect({ to: "/login" });
    const escalations = await getEscalations();
    return { escalations };
  },
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

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Overview", to: "/dashboard" as const, active: false },
  { icon: Receipt, label: "Payments", to: "/payments" as const, active: false },
  { icon: Zap, label: "Recovery sequences", to: "/sequences" as const, active: false },
  { icon: AlertCircle, label: "Escalations", to: "/escalations" as const, active: true },
  { icon: Bell, label: "Alerts", to: null as null, active: false },
  { icon: Settings, label: "Settings", to: "/settings" as const, active: false },
];

function RouteComponent() {
  const { session } = Route.useRouteContext();
  const { escalations: initial } = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const [items, setItems] = useState<EscalationRow[]>(initial);
  const [edits, setEdits] = useState<Record<string, CardEdit>>(() =>
    Object.fromEntries(
      initial.map((e) => [
        e.id,
        { subject: e.draftSubject ?? "", body: e.draftBody ?? "" },
      ]),
    ),
  );
  const [busy, setBusy] = useState<Record<string, BusyState>>(() =>
    Object.fromEntries(
      initial.map((e) => [
        e.id,
        { sending: false, regenerating: false, dismissing: false },
      ]),
    ),
  );
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const handleSignOut = () => {
    authClient.signOut({
      fetchOptions: { onSuccess: () => navigate({ to: "/" }) },
    });
  };

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
      setItems((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: "sent" as const } : e)),
      );
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
          [id]: {
            subject: updated.draftSubject ?? "",
            body: updated.draftBody ?? "",
          },
        }));
      }
      toast.success("Draft regenerated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to regenerate");
    } finally {
      setBusy((prev) => ({
        ...prev,
        [id]: { ...prev[id], regenerating: false },
      }));
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
      setBusy((prev) => ({
        ...prev,
        [id]: { ...prev[id], dismissing: false },
      }));
    }
  }

  const pendingCount = items.filter((e) => e.status === "pending").length;

  return (
    <div className="flex h-dvh bg-[#f7f8fa] font-sans">
      <aside className="hidden h-dvh w-60 shrink-0 sticky top-0 flex-col border-r border-gray-100 bg-white lg:flex">
        <div className="flex items-center border-b border-gray-100 px-5 py-4">
          <Logo size={26} />
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ icon: Icon, label, to, active }) => {
            const className = `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
              active
                ? "bg-gray-100 text-gray-900"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            }`;
            if (to) {
              return (
                <Link key={label} to={to} className={className}>
                  <Icon size={15} />
                  {label}
                </Link>
              );
            }
            return (
              <button key={label} className={className}>
                <Icon size={15} />
                {label}
              </button>
            );
          })}
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
            <h1 className="text-base font-bold text-gray-900">Escalations</h1>
            <p className="text-xs text-gray-400">
              {pendingCount > 0
                ? `${pendingCount} pending manual action`
                : "All clear"}
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl space-y-4 p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <CheckCircle size={40} className="mb-3 text-gray-200" />
              <p className="text-sm font-medium text-gray-500">No escalations</p>
              <p className="mt-1 text-xs text-gray-400">
                Payments above your threshold will appear here. Adjust the
                threshold in{" "}
                <Link to="/settings" className="text-dunlo-dim underline">
                  Settings
                </Link>
                .
              </p>
            </div>
          ) : (
            items.map((esc) => {
              const edit = edits[esc.id] ?? { subject: "", body: "" };
              const b = busy[esc.id] ?? {
                sending: false,
                regenerating: false,
                dismissing: false,
              };
              const draftReady = Boolean(esc.draftSubject);
              const isSent = esc.status === "sent";

              return (
                <div
                  key={esc.id}
                  className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {esc.payment.customerName ?? esc.payment.customerEmail}
                      </p>
                      <p className="text-xs text-gray-400">
                        {esc.payment.customerEmail}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                      <span className="text-xs font-semibold text-gray-900">
                        {formatAmount(
                          esc.payment.amount,
                          esc.payment.currency,
                        )}
                      </span>
                      <span className="rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize text-gray-600">
                        {humanizeFailureCode(esc.payment.failureCode)}
                      </span>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                          isSent
                            ? "border-dunlo/25 bg-dunlo/8 text-dunlo-deep"
                            : "border-amber-200 bg-amber-50 text-amber-700"
                        }`}
                      >
                        {isSent ? "sent" : "pending"}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    {relativeTime(new Date(esc.createdAt))}
                  </p>

                  {!draftReady ? (
                    <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-gray-50 py-6 text-center">
                      <RefreshCw
                        size={14}
                        className="mb-1.5 animate-spin text-gray-400"
                      />
                      <p className="text-xs text-gray-400">
                        AI is drafting your email…
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-2">
                      <input
                        type="text"
                        value={edit.subject}
                        onChange={(e) =>
                          setEdit(esc.id, "subject", e.target.value)
                        }
                        disabled={isSent}
                        placeholder="Subject"
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-dunlo/30 disabled:opacity-50"
                      />
                      <textarea
                        value={edit.body}
                        onChange={(e) =>
                          setEdit(esc.id, "body", e.target.value)
                        }
                        disabled={isSent}
                        rows={4}
                        placeholder="Email body"
                        className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-dunlo/30 disabled:opacity-50"
                      />
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleDismiss(esc.id)}
                      disabled={b.dismissing}
                      className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-1.5 text-xs text-gray-500 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                      <Trash2 size={12} />
                      Dismiss
                    </button>
                    <button
                      onClick={() => handleRegenerate(esc.id)}
                      disabled={b.regenerating || isSent}
                      className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-1.5 text-xs text-gray-500 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                      <RefreshCw
                        size={12}
                        className={b.regenerating ? "animate-spin" : ""}
                      />
                      Regenerate
                    </button>
                    <button
                      onClick={() => handleSend(esc.id)}
                      disabled={b.sending || !draftReady || isSent}
                      className="flex items-center gap-1.5 rounded-xl bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-gray-700 disabled:opacity-50"
                    >
                      <Send size={12} />
                      {b.sending ? "Sending…" : "Send"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
