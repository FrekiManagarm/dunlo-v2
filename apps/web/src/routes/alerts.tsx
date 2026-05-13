import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  AlertCircle,
  Bell,
  CheckCircle,
  LayoutDashboard,
  LogOut,
  Mail,
  Receipt,
  Save,
  Settings,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/logo";
import { authClient } from "@/lib/auth-client";
import { getUser } from "@/functions/get-user";
import {
  getAlertFeed,
  getNotificationSettings,
  updateNotificationSettings,
  type AlertEventType,
  type FeedEvent,
  type NotificationSettings,
} from "@/functions/alerts";
import { formatAmount } from "@/lib/template";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Alerts — Dunlo" },
    ],
  }),
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await getUser();
    return { session };
  },
  loader: async ({ context }) => {
    if (!context.session) throw redirect({ to: "/login" });
    const [feed, settings] = await Promise.all([
      getAlertFeed(),
      getNotificationSettings(),
    ]);
    return { feed, settings };
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

const EVENT_ICON: Record<AlertEventType, React.ElementType> = {
  failure: AlertCircle,
  recovery: CheckCircle,
  escalation: TrendingUp,
  emailSent: Mail,
};

const EVENT_COLOR: Record<AlertEventType, string> = {
  failure: "text-red-500",
  recovery: "text-dunlo",
  escalation: "text-amber-500",
  emailSent: "text-blue-500",
};

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Overview", to: "/dashboard" as const },
  { icon: Receipt, label: "Payments", to: "/payments" as const },
  { icon: Zap, label: "Recovery sequences", to: "/sequences" as const },
  { icon: AlertCircle, label: "Escalations", to: "/escalations" as const },
  { icon: Bell, label: "Alerts", to: "/alerts" as const, active: true },
  { icon: Settings, label: "Settings", to: "/settings" as const },
] as const;

type EmailToggleKey = "emailOnFailure" | "emailOnRecovery" | "emailOnEscalation" | "emailOnEmailSent";
type SlackToggleKey = "slackOnFailure" | "slackOnRecovery" | "slackOnEscalation" | "slackOnEmailSent";

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

function RouteComponent() {
  const { session } = Route.useRouteContext();
  const { feed, settings: initialSettings } = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const [settings, setSettings] = useState<NotificationSettings>(initialSettings);
  const [saving, setSaving] = useState(false);

  const handleSignOut = () => {
    authClient.signOut({
      fetchOptions: { onSuccess: () => navigate({ to: "/" }) },
    });
  };

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
    <div className="flex h-dvh bg-[#f7f8fa] font-sans">
      <aside className="hidden h-dvh w-60 shrink-0 sticky top-0 flex-col border-r border-gray-100 bg-white lg:flex">
        <div className="flex items-center border-b border-gray-100 px-5 py-4">
          <Logo size={26} />
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ icon: Icon, label, to, ...rest }) => (
            <Link
              key={label}
              to={to}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${"active" in rest && rest.active
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
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
        <div className="sticky top-0 z-20 flex items-center border-b border-gray-100 bg-white/80 px-6 py-4 backdrop-blur-md">
          <div>
            <h1 className="text-base font-bold text-gray-900">Alerts</h1>
            <p className="text-xs text-gray-400">
              Activity feed and notification settings
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl space-y-6 p-6">
          {/* Activity Feed */}
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Activity
            </h2>
            <div className="divide-y divide-gray-50 rounded-2xl border border-gray-100 bg-white shadow-sm">
              {feed.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Bell size={32} className="mb-3 text-gray-200" />
                  <p className="text-sm font-medium text-gray-500">
                    No activity yet
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Events will appear here once Stripe is connected and
                    payments start flowing.
                  </p>
                </div>
              ) : (
                feed.map((event: FeedEvent) => {
                  const Icon = EVENT_ICON[event.type];
                  return (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 px-5 py-3"
                    >
                      <Icon
                        size={15}
                        className={`shrink-0 ${EVENT_COLOR[event.type]}`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {event.label}
                        </p>
                        <p className="truncate text-xs text-gray-400">
                          {event.customerName ?? event.customerEmail} —{" "}
                          {formatAmount(event.amount, event.currency)}
                        </p>
                      </div>
                      <p className="shrink-0 text-xs text-gray-300">
                        {relativeTime(new Date(event.timestamp))}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Notification Settings */}
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Notification settings
            </h2>
            <div className="space-y-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              {/* Email */}
              <div>
                <p className="mb-3 text-sm font-semibold text-gray-900">
                  Email notifications
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {EMAIL_TOGGLES.map(({ key, label }) => (
                    <label
                      key={key}
                      className="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
                    >
                      <input
                        type="checkbox"
                        checked={settings[key]}
                        onChange={(e) =>
                          setSettings((s) => ({ ...s, [key]: e.target.checked }))
                        }
                        className="rounded border-gray-300 text-dunlo focus:ring-dunlo/30"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Slack */}
              <div>
                <p className="mb-3 text-sm font-semibold text-gray-900">
                  Slack notifications
                </p>
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
                  className="mb-3 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-dunlo/30"
                />
                <div className="grid grid-cols-2 gap-2">
                  {SLACK_TOGGLES.map(({ key, label }) => (
                    <label
                      key={key}
                      className="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
                    >
                      <input
                        type="checkbox"
                        checked={settings[key]}
                        onChange={(e) =>
                          setSettings((s) => ({ ...s, [key]: e.target.checked }))
                        }
                        className="rounded border-gray-300 text-dunlo focus:ring-dunlo/30"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 disabled:opacity-50"
              >
                <Save size={14} />
                {saving ? "Saving…" : "Save settings"}
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
