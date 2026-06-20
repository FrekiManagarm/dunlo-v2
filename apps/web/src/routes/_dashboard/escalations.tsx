import { AnimatePresence, motion } from "framer-motion";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  Inbox,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import {
  dismissEscalation,
  regenerateEscalationDraft,
  sendEscalationEmail,
  updateEscalationDraft,
} from "@/functions/escalations";
import { applyEscalationDraftPatch } from "@/lib/escalations-cache";
import { escalationsQueryOptions } from "@/lib/queries";
import { formatAmount, humanizeFailureCode } from "@/lib/template";

type FilterValue = "pending" | "sent" | "all";

const searchSchema = z.object({
  id: z.string().optional(),
  filter: z.enum(["pending", "sent", "all"]).optional(),
});

export const Route = createFileRoute("/_dashboard/escalations")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Escalations — Dunlo" },
    ],
  }),
  validateSearch: searchSchema,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(escalationsQueryOptions()),
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

type EditState = { subject: string; body: string };
type BusyState = {
  sending?: boolean;
  regenerating?: boolean;
  dismissing?: boolean;
};

function RouteComponent() {
  const queryClient = useQueryClient();
  const { data: items } = useSuspenseQuery(escalationsQueryOptions());
  const navigate = Route.useNavigate();
  const search = Route.useSearch();
  const filter: FilterValue = search.filter ?? "pending";

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((e) => e.status === filter);
  }, [items, filter]);

  const pendingCount = useMemo(
    () => items.filter((e) => e.status === "pending").length,
    [items],
  );
  const sentCount = useMemo(
    () => items.filter((e) => e.status === "sent").length,
    [items],
  );

  const selectedId = useMemo(() => {
    if (search.id && filtered.some((e) => e.id === search.id)) return search.id;
    return filtered[0]?.id ?? null;
  }, [filtered, search.id]);

  const selected = useMemo(
    () => filtered.find((e) => e.id === selectedId) ?? null,
    [filtered, selectedId],
  );

  const [edits, setEdits] = useState<Record<string, EditState>>({});
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const handleSelect = useCallback(
    (id: string | null) => {
      void navigate({
        to: "/escalations",
        search: { id: id ?? undefined, filter: search.filter },
      });
    },
    [navigate, search.filter],
  );

  const handleSetFilter = (next: FilterValue) => {
    void navigate({
      to: "/escalations",
      search: { filter: next === "pending" ? undefined : next, id: undefined },
    });
  };

  const advanceFrom = useCallback(
    (id: string) => {
      const idx = filtered.findIndex((e) => e.id === id);
      if (idx === -1) return;
      const next = filtered[idx + 1] ?? filtered[idx - 1] ?? null;
      handleSelect(next?.id ?? null);
    },
    [filtered, handleSelect],
  );

  const invalidateEscalationSideEffects = useCallback(
    () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["escalations"] }),
        queryClient.invalidateQueries({ queryKey: ["payments"] }),
        queryClient.invalidateQueries({ queryKey: ["alerts", "feed"] }),
      ]),
    [queryClient],
  );

  const updateDraftMutation = useMutation({
    mutationFn: (data: {
      escalationId: string;
      subject: string;
      body: string;
    }) => updateEscalationDraft({ data }),
    onError: (e) => {
      console.error("[escalations] auto-save failed", e);
      toast.error("Failed to save draft");
    },
  });

  const sendMutation = useMutation({
    mutationFn: (id: string) =>
      sendEscalationEmail({ data: { escalationId: id } }),
    onSuccess: async (_result, id) => {
      await invalidateEscalationSideEffects();
      toast.success("Email sent");
      advanceFrom(id);
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Failed to send");
    },
  });

  const regenerateMutation = useMutation({
    mutationFn: (id: string) =>
      regenerateEscalationDraft({ data: { escalationId: id } }),
    onMutate: (id) => {
      clearTimeout(saveTimers.current[id]);
    },
    onSuccess: (draft, id) => {
      queryClient.setQueryData(
        escalationsQueryOptions().queryKey,
        (current: typeof items | undefined) =>
          applyEscalationDraftPatch(current, id, draft),
      );
      setEdits((prev) => ({
        ...prev,
        [id]: {
          subject: draft.draftSubject ?? "",
          body: draft.draftBody ?? "",
        },
      }));
      toast.success("Draft regenerated");
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Failed to regenerate");
    },
  });

  const dismissMutation = useMutation({
    mutationFn: (id: string) =>
      dismissEscalation({ data: { escalationId: id } }),
    onSuccess: async (_result, id) => {
      await invalidateEscalationSideEffects();
      toast.success("Escalation dismissed");
      advanceFrom(id);
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Failed to dismiss");
    },
  });
  const { mutateAsync: saveDraft } = updateDraftMutation;
  const { mutateAsync: sendEscalation } = sendMutation;
  const { mutateAsync: regenerateDraft } = regenerateMutation;
  const { mutateAsync: dismissCurrentEscalation } = dismissMutation;

  const getEdit = (esc: (typeof items)[number]): EditState =>
    edits[esc.id] ?? {
      subject: esc.draftSubject ?? "",
      body: esc.draftBody ?? "",
    };

  const setEditFor = (id: string, patch: Partial<EditState>) => {
    setEdits((prev) => {
      const item = items.find((e) => e.id === id);
      const current = prev[id] ?? {
        subject: item?.draftSubject ?? "",
        body: item?.draftBody ?? "",
      };
      const next = { ...current, ...patch };
      clearTimeout(saveTimers.current[id]);
      saveTimers.current[id] = setTimeout(() => {
        if (!next.subject.trim() || !next.body.trim()) return;
        void saveDraft({
          escalationId: id,
          subject: next.subject,
          body: next.body,
        }).catch(() => undefined);
      }, 1000);
      return { ...prev, [id]: next };
    });
  };

  const handleSend = useCallback(
    async (id: string) => {
      await sendEscalation(id).catch(() => undefined);
    },
    [sendEscalation],
  );

  const handleRegenerate = useCallback(
    async (id: string) => {
      await regenerateDraft(id).catch(() => undefined);
    },
    [regenerateDraft],
  );

  const handleDismiss = useCallback(
    async (id: string) => {
      await dismissCurrentEscalation(id).catch(() => undefined);
    },
    [dismissCurrentEscalation],
  );

  const selectedBusy: BusyState | undefined = selected
    ? {
        sending:
          sendMutation.isPending && sendMutation.variables === selected.id,
        regenerating:
          regenerateMutation.isPending &&
          regenerateMutation.variables === selected.id,
        dismissing:
          dismissMutation.isPending &&
          dismissMutation.variables === selected.id,
      }
    : undefined;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (
        (e.metaKey || e.ctrlKey) &&
        e.key === "Enter" &&
        selected &&
        selected.status === "pending" &&
        selected.draftSubject
      ) {
        e.preventDefault();
        void handleSend(selected.id);
        return;
      }

      if (typing) return;

      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        const idx = filtered.findIndex((x) => x.id === selectedId);
        const next = filtered[Math.min(filtered.length - 1, idx + 1)];
        if (next) handleSelect(next.id);
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        const idx = filtered.findIndex((x) => x.id === selectedId);
        const next = filtered[Math.max(0, idx - 1)];
        if (next) handleSelect(next.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtered, selectedId, selected, handleSend, handleSelect]);

  return (
    <div className="flex h-full flex-col bg-[#f7f8fa]">
      <header className="flex items-center justify-between border-b border-zinc-100 bg-white/80 px-6 py-4 backdrop-blur-md">
        <div>
          <h1 className="text-[15px] font-semibold tracking-tight text-zinc-900">
            Escalations
          </h1>
          <p className="text-xs text-zinc-400">
            High-value payments requiring manual action
          </p>
        </div>
        <div className="hidden items-center gap-2 text-[11px] text-zinc-400 md:flex">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd>
          <span>navigate</span>
          <span className="text-zinc-200">·</span>
          <Kbd>⌘</Kbd>
          <Kbd>↩</Kbd>
          <span>send</span>
        </div>
      </header>

      <div className="grid flex-1 grid-cols-1 overflow-hidden md:grid-cols-[360px_1fr]">
        <aside className="flex flex-col overflow-hidden border-r border-zinc-100 bg-white">
          <div className="flex items-center gap-1 border-b border-zinc-100 px-3 py-2.5">
            <FilterChip
              active={filter === "pending"}
              onClick={() => handleSetFilter("pending")}
              label="Pending"
              count={pendingCount}
              dot
            />
            <FilterChip
              active={filter === "sent"}
              onClick={() => handleSetFilter("sent")}
              label="Sent"
              count={sentCount}
            />
            <FilterChip
              active={filter === "all"}
              onClick={() => handleSetFilter("all")}
              label="All"
              count={items.length}
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <EmptyList filter={filter} />
            ) : (
              <ul>
                <AnimatePresence initial={false}>
                  {filtered.map((esc, i) => (
                    <ListRow
                      key={esc.id}
                      esc={esc}
                      active={esc.id === selectedId}
                      index={i}
                      onSelect={() => handleSelect(esc.id)}
                    />
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>
        </aside>

        <section className="flex flex-col overflow-hidden bg-white">
          <AnimatePresence mode="wait">
            {selected ? (
              <DetailPane
                key={selected.id}
                esc={selected}
                edit={getEdit(selected)}
                busy={selectedBusy}
                onEdit={(patch) => setEditFor(selected.id, patch)}
                onSend={() => handleSend(selected.id)}
                onRegenerate={() => handleRegenerate(selected.id)}
                onDismiss={() => handleDismiss(selected.id)}
              />
            ) : (
              <EmptyDetail key="empty" />
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded-md border border-zinc-200 bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-zinc-600 shadow-[inset_0_-1px_0_rgba(0,0,0,0.04)]">
      {children}
    </kbd>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  count,
  dot,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  dot?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
        active
          ? "text-white"
          : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
      }`}
    >
      {active && (
        <motion.span
          layoutId="filter-pill"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="absolute inset-0 rounded-full bg-zinc-900"
        />
      )}
      <span className="relative flex items-center gap-1.5">
        {dot && (
          <span className="relative flex size-1.5">
            <span
              className={`absolute inline-flex size-full rounded-full opacity-60 ${
                active ? "bg-amber-300 animate-ping" : "bg-amber-400"
              }`}
            />
            <span
              className={`relative inline-flex size-1.5 rounded-full ${
                active ? "bg-amber-300" : "bg-amber-400"
              }`}
            />
          </span>
        )}
        {label}
        <span
          className={`tabular-nums ${
            active ? "text-white/60" : "text-zinc-300"
          }`}
        >
          {count}
        </span>
      </span>
    </button>
  );
}

function StatusGlyph({ status }: { status: string }) {
  if (status === "sent")
    return <CheckCircle2 size={12} className="shrink-0 text-dunlo" />;
  if (status === "dismissed")
    return <span className="size-1.5 shrink-0 rounded-full bg-zinc-300" />;
  return (
    <span className="relative flex shrink-0">
      <span className="absolute inline-flex size-2 animate-ping rounded-full bg-amber-400/70" />
      <span className="relative inline-flex size-2 rounded-full bg-amber-400" />
    </span>
  );
}

function ListRow({
  esc,
  active,
  index,
  onSelect,
}: {
  esc: {
    id: string;
    status: string;
    createdAt: string | Date;
    payment: {
      customerName?: string | null;
      customerEmail: string;
      amount: number;
      currency: string;
      failureCode: string;
    };
  };
  active: boolean;
  index: number;
  onSelect: () => void;
}) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.18, delay: index * 0.015 }}
      className="relative border-b border-zinc-50"
    >
      {active && (
        <motion.span
          layoutId="row-marker"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
          className="absolute inset-y-1 left-0 w-0.75 rounded-r-full bg-dunlo"
        />
      )}
      <button
        onClick={onSelect}
        className={`flex w-full flex-col gap-1 px-4 py-3.5 text-left transition-colors ${
          active ? "bg-dunlo/4" : "hover:bg-zinc-50/60"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <StatusGlyph status={esc.status} />
            <span className="truncate text-sm font-semibold text-zinc-900">
              {esc.payment.customerName ?? esc.payment.customerEmail}
            </span>
          </div>
          <span className="shrink-0 font-mono text-[13px] font-bold text-zinc-900">
            {formatAmount(esc.payment.amount, esc.payment.currency)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 pl-4.5">
          <span className="truncate text-[11px] text-zinc-400">
            {humanizeFailureCode(esc.payment.failureCode)}
          </span>
          <span className="shrink-0 text-[10px] uppercase tracking-wider text-zinc-400">
            {relativeTime(new Date(esc.createdAt))}
          </span>
        </div>
      </button>
    </motion.li>
  );
}

function EmptyList({ filter }: { filter: FilterValue }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-16 text-center">
      <Inbox size={20} className="text-zinc-300" />
      <p className="mt-3 text-xs font-medium text-zinc-500">
        No {filter === "all" ? "" : `${filter} `}escalations
      </p>
    </div>
  );
}

function DetailPane({
  esc,
  edit,
  busy,
  onEdit,
  onSend,
  onRegenerate,
  onDismiss,
}: {
  esc: {
    id: string;
    status: string;
    createdAt: string | Date;
    draftSubject?: string | null;
    draftBody?: string | null;
    payment: {
      customerName?: string | null;
      customerEmail: string;
      amount: number;
      currency: string;
      failureCode: string;
    };
  };
  edit: EditState;
  busy: BusyState | undefined;
  onEdit: (patch: Partial<EditState>) => void;
  onSend: () => void;
  onRegenerate: () => void;
  onDismiss: () => void;
}) {
  const isSent = esc.status === "sent";
  const draftReady = Boolean(esc.draftSubject);
  const sending = busy?.sending ?? false;
  const regenerating = busy?.regenerating ?? false;
  const dismissing = busy?.dismissing ?? false;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="flex h-full flex-col"
    >
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl space-y-8 px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-start justify-between gap-6"
          >
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                Customer
              </p>
              <h2 className="mt-1 truncate text-xl font-semibold tracking-tight text-zinc-900">
                {esc.payment.customerName ?? esc.payment.customerEmail}
              </h2>
              <p className="truncate text-[13px] text-zinc-500">
                {esc.payment.customerEmail}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-mono text-2xl font-bold tracking-tight text-zinc-900">
                {formatAmount(esc.payment.amount, esc.payment.currency)}
              </p>
              <p className="mt-1 text-[11px] text-zinc-400">
                {relativeTime(new Date(esc.createdAt))}
              </p>
            </div>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.05,
              duration: 0.25,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="grid grid-cols-3 divide-x divide-zinc-100 border-y border-zinc-100"
          >
            <Stat
              label="Failure"
              value={humanizeFailureCode(esc.payment.failureCode)}
            />
            <Stat
              label="Detected"
              value={new Intl.DateTimeFormat("en-GB", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(esc.createdAt))}
            />
            <Stat
              label="Status"
              value={isSent ? "Sent" : "Pending"}
              accent={isSent ? "dunlo" : "amber"}
            />
          </motion.dl>

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <Sparkles size={13} className="text-dunlo" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                AI recovery email
              </span>
              {!isSent && draftReady && (
                <span className="ml-auto text-[10px] text-zinc-400">
                  Saves automatically
                </span>
              )}
            </div>

            {!draftReady ? (
              <div className="space-y-3 py-4">
                <div className="h-9 w-full animate-pulse rounded-xl bg-zinc-100" />
                <div className="h-40 w-full animate-pulse rounded-2xl bg-zinc-100" />
                <p className="text-center text-[12px] text-zinc-400">
                  AI is drafting the recovery email…
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={edit.subject}
                    onChange={(e) => onEdit({ subject: e.target.value })}
                    disabled={isSent}
                    className="w-full border-b border-zinc-200 bg-transparent pb-2 text-[15px] font-semibold text-zinc-900 outline-none transition-colors focus:border-dunlo disabled:opacity-50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                    Body
                  </label>
                  <textarea
                    value={edit.body}
                    onChange={(e) => onEdit({ body: e.target.value })}
                    disabled={isSent}
                    rows={10}
                    className="w-full resize-none rounded-2xl border border-zinc-100 bg-zinc-50/40 px-4 py-3 text-[14px] leading-[1.7] text-zinc-800 outline-none transition-all focus:border-dunlo/40 focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,232,123,0.08)] disabled:opacity-50"
                  />
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-zinc-100 bg-white/80 px-8 py-3.5 backdrop-blur-md">
        <button
          onClick={onDismiss}
          disabled={dismissing}
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-medium text-zinc-400 transition-all hover:bg-red-50 hover:text-red-500 active:scale-[0.97] disabled:opacity-40"
        >
          <Trash2 size={12} />
          {dismissing ? "Dismissing…" : "Dismiss"}
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={onRegenerate}
            disabled={regenerating || isSent}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-[12px] font-medium text-zinc-700 transition-all hover:bg-zinc-50 active:scale-[0.97] disabled:opacity-40"
          >
            <RefreshCw
              size={12}
              className={regenerating ? "animate-spin" : ""}
            />
            Regenerate
          </button>
          <motion.button
            onClick={onSend}
            disabled={sending || !draftReady || isSent}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="flex items-center gap-2 rounded-xl bg-dunlo px-4 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-dunlo-hover disabled:opacity-40 disabled:hover:bg-dunlo shadow-[0_1px_0_rgba(0,153,80,0.4),0_4px_14px_-2px_rgba(0,232,123,0.45)]"
          >
            <Send size={12} />
            {sending ? "Sending…" : "Send"}
            {!sending && !isSent && draftReady && (
              <span className="hidden font-mono text-[9px] text-white/60 md:inline">
                ⌘↩
              </span>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "dunlo" | "amber";
}) {
  return (
    <div className="px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
        {label}
      </p>
      <p
        className={`mt-1 text-sm font-semibold ${
          accent === "dunlo"
            ? "text-dunlo-deep"
            : accent === "amber"
              ? "text-amber-600"
              : "text-zinc-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function EmptyDetail() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="flex h-full flex-col items-center justify-center px-6 text-center"
    >
      <div className="flex size-12 items-center justify-center rounded-2xl bg-dunlo/[0.07]">
        <CheckCircle2 size={20} className="text-dunlo" />
      </div>
      <p className="mt-4 text-sm font-semibold text-zinc-800">All clear</p>
      <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-zinc-400">
        Payments above your threshold will appear here. Adjust it in{" "}
        <Link
          to="/settings"
          className="text-dunlo-dim underline underline-offset-2"
        >
          Settings
        </Link>
        .
      </p>
    </motion.div>
  );
}
