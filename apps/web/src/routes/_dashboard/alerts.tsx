import { motion } from "framer-motion";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  Bell,
  CheckCircle,
  Mail,
  Save,
  TrendingUp,
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
  { icon: React.ElementType; dot: string; text: string }
> = {
  failure: { icon: AlertCircle, dot: "bg-red-500", text: "text-red-500" },
  recovery: { icon: CheckCircle, dot: "bg-dunlo", text: "text-dunlo" },
  escalation: { icon: TrendingUp, dot: "bg-amber-500", text: "text-amber-500" },
  emailSent: { icon: Mail, dot: "bg-blue-500", text: "text-blue-500" },
};

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
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
        checked ? "bg-dunlo" : "bg-zinc-200"
      }`}
    >
      <span
        className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function RouteComponent() {
  const { data: feed } = useSuspenseQuery(alertFeedQueryOptions());
  const { data: initialSettings } = useSuspenseQuery(
    notificationSettingsQueryOptions(),
  );
  const [settings, setSettings] =
    useState<NotificationSettings>(initialSettings);
  const [saving, setSaving] = useState(false);

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
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="sticky top-0 z-20 flex items-center border-b border-zinc-100 bg-white/80 px-6 py-4 backdrop-blur-md">
        <div>
          <h1 className="text-[15px] font-semibold tracking-tight text-zinc-900">
            Alerts
          </h1>
          <p className="text-xs text-zinc-400">
            Activity feed and notification preferences
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 p-6 lg:grid-cols-[1fr_300px]">
        <section>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
            Activity
          </p>
          <div className="rounded-2xl border border-zinc-100 bg-white shadow-[0_1px_4px_0_rgba(0,0,0,0.04)]">
            {feed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-zinc-50">
                  <Bell size={20} className="text-zinc-300" />
                </div>
                <p className="text-sm font-semibold text-zinc-700">
                  No activity yet
                </p>
                <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-zinc-400">
                  Events appear here once Stripe is connected and payments start
                  flowing.
                </p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-9.5 top-5 bottom-5 w-px bg-zinc-100" />
                {feed.map((event: FeedEvent, i: number) => {
                  const { icon: Icon, dot, text } = EVENT_META[event.type];
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: i * 0.03,
                        duration: 0.2,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="flex items-center gap-4 px-5 py-3.5"
                    >
                      <div className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border border-white bg-white shadow-[0_0_0_3px_#f4f4f5]">
                        <div className={`size-2.5 rounded-full ${dot}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-2 text-sm font-medium text-zinc-900">
                          <Icon size={13} className={`shrink-0 ${text}`} />
                          {event.label}
                        </p>
                        <p className="truncate text-xs text-zinc-400">
                          {event.customerName ?? event.customerEmail}
                          {" · "}
                          <span className="font-mono">
                            {formatAmount(event.amount, event.currency)}
                          </span>
                        </p>
                      </div>
                      <p className="shrink-0 text-[11px] tabular-nums text-zinc-300">
                        {relativeTime(new Date(event.timestamp))}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
            Notifications
          </p>

          <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-[0_1px_4px_0_rgba(0,0,0,0.04)]">
            <div className="mb-4 flex items-center gap-2">
              <Mail size={14} className="text-zinc-400" />
              <p className="text-sm font-semibold text-zinc-900">Email</p>
            </div>
            <div className="divide-y divide-zinc-50">
              {EMAIL_TOGGLES.map(({ key, label }) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-2.5"
                >
                  <span className="text-sm text-zinc-600">{label}</span>
                  <Toggle
                    checked={settings[key]}
                    onChange={(v) => setSettings((s) => ({ ...s, [key]: v }))}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-[0_1px_4px_0_rgba(0,0,0,0.04)]">
            <div className="mb-4 flex items-center gap-2">
              <Zap size={14} className="text-zinc-400" />
              <p className="text-sm font-semibold text-zinc-900">Slack</p>
            </div>
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
                  className="flex items-center justify-between py-2.5"
                >
                  <span className="text-sm text-zinc-600">{label}</span>
                  <Toggle
                    checked={settings[key]}
                    onChange={(v) => setSettings((s) => ({ ...s, [key]: v }))}
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-zinc-700 active:scale-[0.98] disabled:opacity-50"
          >
            <Save size={13} />
            {saving ? "Saving…" : "Save preferences"}
          </button>
        </section>
      </div>
    </>
  );
}
