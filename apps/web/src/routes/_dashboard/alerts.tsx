import { AnimatePresence, motion } from "framer-motion";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  Bell,
  CheckCircle,
  Mail,
  RotateCw,
  Save,
  Settings,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  updateNotificationSettings,
  type AlertEventType,
  type FeedEvent,
  type NotificationSettings,
} from "@/functions/alerts";
import {
  alertFeedQueryOptions,
  notificationSettingsQueryOptions,
} from "@/lib/queries";
import { formatAmount } from "@/lib/template";

export const Route = createFileRoute("/_dashboard/alerts")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Alerts — Dunlo" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(alertFeedQueryOptions()),
      context.queryClient.ensureQueryData(notificationSettingsQueryOptions()),
    ]),
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

const EVENT_META: Record<
  AlertEventType,
  {
    label: string;
    icon: React.ElementType;
    dot: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    amountColor: string;
  }
> = {
  failure: {
    label: "Failed",
    icon: AlertCircle,
    dot: "bg-red-400",
    border: "border-l-red-400",
    badgeBg: "bg-red-50",
    badgeText: "text-red-600",
    amountColor: "text-red-600",
  },
  recovery: {
    label: "Recovered",
    icon: CheckCircle,
    dot: "bg-dunlo",
    border: "border-l-dunlo",
    badgeBg: "bg-dunlo/8",
    badgeText: "text-dunlo-deep",
    amountColor: "text-dunlo-deep",
  },
  escalation: {
    label: "Escalated",
    icon: TrendingUp,
    dot: "bg-amber-400",
    border: "border-l-amber-400",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
    amountColor: "text-amber-700",
  },
  emailSent: {
    label: "Email sent",
    icon: Mail,
    dot: "bg-blue-400",
    border: "border-l-blue-400",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-600",
    amountColor: "text-zinc-800",
  },
};

type FilterKey = AlertEventType | "all";

const FILTER_TABS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "failure", label: "Failures" },
  { key: "recovery", label: "Recovered" },
  { key: "escalation", label: "Escalations" },
  { key: "emailSent", label: "Emails sent" },
];

type EmailToggleKey =
  | "emailOnFailure"
  | "emailOnRecovery"
  | "emailOnEscalation"
  | "emailOnEmailSent";
type SlackToggleKey =
  | "slackOnFailure"
  | "slackOnRecovery"
  | "slackOnEscalation"
  | "slackOnEmailSent";

const EMAIL_TOGGLES: { key: EmailToggleKey; label: string }[] = [
  { key: "emailOnFailure", label: "Failed payment" },
  { key: "emailOnRecovery", label: "Payment recovered" },
  { key: "emailOnEscalation", label: "Escalation triggered" },
  { key: "emailOnEmailSent", label: "Recovery email sent" },
];

const SLACK_TOGGLES: { key: SlackToggleKey; label: string }[] = [
  { key: "slackOnFailure", label: "Failed payment" },
  { key: "slackOnRecovery", label: "Payment recovered" },
  { key: "slackOnEscalation", label: "Escalation triggered" },
  { key: "slackOnEmailSent", label: "Recovery email sent" },
];

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dunlo/30 ${
        checked ? "bg-dunlo" : "bg-zinc-200"
      }`}
    >
      <motion.span
        animate={{ x: checked ? 18 : 2 }}
        transition={{ type: "spring", stiffness: 600, damping: 35 }}
        className="absolute top-0.5 size-4 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.15)]"
      />
    </button>
  );
}

const feedVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.035 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};
const feedItemVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
  },
};

function RouteComponent() {
  const { data: feed } = useSuspenseQuery(alertFeedQueryOptions());
  const { data: initialSettings } = useSuspenseQuery(
    notificationSettingsQueryOptions(),
  );
  const [settings, setSettings] =
    useState<NotificationSettings>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const counts: Record<FilterKey, number> = {
    all: feed.length,
    failure: feed.filter((e: FeedEvent) => e.type === "failure").length,
    recovery: feed.filter((e: FeedEvent) => e.type === "recovery").length,
    escalation: feed.filter((e: FeedEvent) => e.type === "escalation").length,
    emailSent: feed.filter((e: FeedEvent) => e.type === "emailSent").length,
  };

  const filteredFeed =
    activeFilter === "all"
      ? feed
      : feed.filter((e: FeedEvent) => e.type === activeFilter);

  async function handleSave() {
    setSaving(true);
    try {
      await updateNotificationSettings({
        data: {
          emailOnFailure: settings.emailOnFailure,
          emailOnRecovery: settings.emailOnRecovery,
          emailOnEscalation: settings.emailOnEscalation,
          emailOnEmailSent: settings.emailOnEmailSent,
          slackOnFailure: settings.slackOnFailure,
          slackOnRecovery: settings.slackOnRecovery,
          slackOnEscalation: settings.slackOnEscalation,
          slackOnEmailSent: settings.slackOnEmailSent,
          slackWebhookUrl: settings.slackWebhookUrl ?? "",
        },
      });
      toast.success("Notification settings saved");
      setSettingsOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* ─── Header ───────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 border-b border-zinc-100 bg-white/90 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-[15px] font-semibold tracking-tight text-zinc-900">
              Alerts
            </h1>
            <p className="text-xs text-zinc-400">
              Activity feed and notification preferences
            </p>
          </div>
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition-all hover:border-zinc-300 hover:text-zinc-900 active:scale-[0.97]"
          >
            <Settings size={12} />
            Notifications
          </button>
        </div>

        {/* Stats row */}
        {feed.length > 0 && (
          <div className="flex items-center gap-5 border-t border-zinc-50 px-6 py-2.5">
            {(
              [
                { key: "failure", color: "bg-red-400", label: "failed" },
                { key: "recovery", color: "bg-dunlo", label: "recovered" },
                { key: "escalation", color: "bg-amber-400", label: "escalated" },
                { key: "emailSent", color: "bg-blue-400", label: "emails sent" },
              ] as const
            ).map(({ key, color, label }) => (
              <button
                key={key}
                onClick={() =>
                  setActiveFilter((f) => (f === key ? "all" : key))
                }
                className={`flex items-center gap-1.5 text-xs transition-opacity ${
                  activeFilter !== "all" && activeFilter !== key
                    ? "opacity-30"
                    : "opacity-100"
                }`}
              >
                <span className={`size-1.5 rounded-full ${color}`} />
                <span className="font-semibold tabular-nums text-zinc-800">
                  {counts[key]}
                </span>
                <span className="text-zinc-400">{label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex items-center gap-1 overflow-x-auto border-t border-zinc-50 px-5 pb-0 pt-1 scrollbar-hide">
          {FILTER_TABS.map(({ key, label }) => {
            const active = activeFilter === key;
            return (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                className={`relative flex shrink-0 items-center gap-1.5 rounded-t-lg px-3.5 py-2 text-xs font-medium transition-colors ${
                  active
                    ? "text-zinc-900"
                    : "text-zinc-400 hover:text-zinc-600"
                }`}
              >
                {label}
                {counts[key] > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] tabular-nums ${
                      active
                        ? "bg-zinc-100 text-zinc-700"
                        : "bg-zinc-50 text-zinc-400"
                    }`}
                  >
                    {counts[key]}
                  </span>
                )}
                {active && (
                  <motion.span
                    layoutId="filter-indicator"
                    className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-dunlo"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Feed ─────────────────────────────────────────────────────────── */}
      <div className="p-6">
        <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-[0_1px_4px_0_rgba(0,0,0,0.04)]">
          <AnimatePresence mode="wait">
            {filteredFeed.length === 0 ? (
              <motion.div
                key={`empty-${activeFilter}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <div className="mb-4 flex size-11 items-center justify-center rounded-2xl border border-zinc-100 bg-zinc-50">
                  <Bell size={18} className="text-zinc-300" />
                </div>
                <p className="text-sm font-semibold text-zinc-700">
                  {activeFilter === "all"
                    ? "No activity yet"
                    : `No ${EVENT_META[activeFilter as AlertEventType]?.label.toLowerCase()} events`}
                </p>
                <p className="mt-1.5 max-w-[26ch] text-xs leading-relaxed text-zinc-400">
                  {activeFilter === "all"
                    ? "Events appear here once Stripe is connected."
                    : "Try switching the filter above to see other events."}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={activeFilter}
                className="divide-y divide-zinc-50"
                variants={feedVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {filteredFeed.map((event: FeedEvent) => {
                  const meta = EVENT_META[event.type];
                  const Icon = meta.icon;
                  return (
                    <motion.div
                      key={event.id}
                      variants={feedItemVariants}
                      className={`flex items-center gap-4 border-l-2 px-5 py-3.5 transition-colors hover:bg-zinc-50/70 ${meta.border}`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 flex items-center gap-2">
                          <span
                            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${meta.badgeBg} ${meta.badgeText}`}
                          >
                            <Icon size={9} />
                            {meta.label}
                          </span>
                          <p className="truncate text-sm font-medium text-zinc-800">
                            {event.customerName ?? event.customerEmail}
                          </p>
                        </div>
                        <p className="truncate text-xs text-zinc-400">
                          {event.label}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p
                          className={`font-mono text-sm font-semibold ${meta.amountColor}`}
                        >
                          {formatAmount(event.amount, event.currency)}
                        </p>
                        <p className="text-[10px] tabular-nums text-zinc-300">
                          {relativeTime(new Date(event.timestamp))}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ─── Settings slide-over ──────────────────────────────────────────── */}
      <AnimatePresence>
        {settingsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSettingsOpen(false)}
              className="fixed inset-0 z-30 bg-black/10 backdrop-blur-[2px]"
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed right-0 top-0 z-40 flex h-dvh w-80 flex-col border-l border-zinc-100 bg-white shadow-xl"
            >
              {/* Slide-over header */}
              <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    Notification preferences
                  </p>
                  <p className="text-xs text-zinc-400">
                    Email and Slack alerts
                  </p>
                </div>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="flex size-7 items-center justify-center rounded-lg text-zinc-400 transition-all hover:bg-zinc-100 hover:text-zinc-700"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Slide-over body */}
              <div className="flex-1 overflow-y-auto">
                {/* Email */}
                <div className="px-5 py-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Mail size={13} className="text-zinc-400" />
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                      Email
                    </p>
                  </div>
                  <div className="divide-y divide-zinc-50">
                    {EMAIL_TOGGLES.map(({ key, label }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between py-3"
                      >
                        <span className="text-sm text-zinc-600">{label}</span>
                        <Toggle
                          checked={settings[key]}
                          onChange={(v) =>
                            setSettings((s) => ({ ...s, [key]: v }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-zinc-100" />

                {/* Slack */}
                <div className="px-5 py-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Zap size={13} className="text-zinc-400" />
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                      Slack
                    </p>
                  </div>
                  <label className="mb-1 block text-xs font-medium text-zinc-500">
                    Webhook URL
                  </label>
                  <input
                    type="url"
                    value={settings.slackWebhookUrl ?? ""}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        slackWebhookUrl: e.target.value || null,
                      }))
                    }
                    placeholder="https://hooks.slack.com/services/…"
                    className="mb-4 h-9 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-900 placeholder-zinc-300 transition-colors focus:border-dunlo/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-dunlo/20"
                  />
                  <div className="divide-y divide-zinc-50">
                    {SLACK_TOGGLES.map(({ key, label }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between py-3"
                      >
                        <span className="text-sm text-zinc-600">{label}</span>
                        <Toggle
                          checked={settings[key]}
                          onChange={(v) =>
                            setSettings((s) => ({ ...s, [key]: v }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Slide-over footer */}
              <div className="border-t border-zinc-100 p-5">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSave}
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {saving ? (
                      <motion.span
                        key="saving"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.8,
                            ease: "linear",
                          }}
                          className="inline-flex"
                        >
                          <RotateCw size={13} />
                        </motion.span>
                        Saving…
                      </motion.span>
                    ) : (
                      <motion.span
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Save size={13} />
                        Save preferences
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
