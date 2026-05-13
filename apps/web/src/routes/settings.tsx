import { Input } from "@dunlo-v2/ui/components/input";
import { Label } from "@dunlo-v2/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  AlertCircle,
  Bell,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  Save,
  Send,
  Settings as SettingsIcon,
  Unplug,
  User as UserIcon,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Logo } from "@/components/logo";
import { authClient } from "@/lib/auth-client";
import {
  getEmailProvider,
  saveEmailProvider,
  sendTestEmail,
} from "@/functions/email-provider";
import {
  getEscalationSettings,
  updateEscalationSettings,
} from "@/functions/escalations";
import { getUser } from "@/functions/get-user";

type Tab = "account" | "email" | "escalation";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Settings — Dunlo" },
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
    const [emailState, escalationState] = await Promise.all([
      getEmailProvider(),
      getEscalationSettings(),
    ]);
    return { emailState, escalationState };
  },
});

function RouteComponent() {
  const { session } = Route.useRouteContext();
  const { emailState, escalationState } = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const [tab, setTab] = useState<Tab>("account");

  const handleSignOut = () => {
    authClient.signOut({
      fetchOptions: { onSuccess: () => navigate({ to: "/" }) },
    });
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
            { icon: Zap, label: "Recovery sequences", to: "/sequences", active: false },
            { icon: AlertCircle, label: "Escalations", to: "/dashboard", active: false },
            { icon: Bell, label: "Alerts", to: "/dashboard", active: false },
            { icon: SettingsIcon, label: "Settings", to: "/settings", active: true },
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
            <h1 className="text-base font-bold text-gray-900">Settings</h1>
            <p className="text-xs text-gray-400">Account, email provider, and escalation.</p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl space-y-6 p-6">
          <div className="inline-flex items-center gap-1 rounded-full border border-gray-100 bg-white p-1 shadow-sm">
            {(
              [
                { id: "account", label: "Account", icon: UserIcon },
                { id: "email", label: "Email provider", icon: Mail },
                { id: "escalation", label: "Escalation", icon: AlertCircle },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  tab === t.id
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <t.icon size={12} />
                {t.label}
              </button>
            ))}
          </div>

          {tab === "account" && (
            <AccountTab
              name={session?.user.name ?? ""}
              email={session?.user.email ?? ""}
              onSignOut={handleSignOut}
            />
          )}
          {tab === "email" && <EmailTab initial={emailState} />}
          {tab === "escalation" && (
            <EscalationTab initial={escalationState} />
          )}
        </div>
      </main>
    </div>
  );
}

function AccountTab({
  name,
  email,
  onSignOut,
}: {
  name: string;
  email: string;
  onSignOut: () => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-gray-900">Account</p>
      <p className="mt-1 text-xs text-gray-500">
        Your profile details. Email is managed via Better Auth and cannot be changed here.
      </p>

      <div className="mt-5 space-y-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Name</Label>
          <Input
            value={name}
            readOnly
            className="h-11 rounded-xl border-gray-200 bg-gray-50 text-sm text-gray-700"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Email</Label>
          <Input
            value={email}
            readOnly
            className="h-11 rounded-xl border-gray-200 bg-gray-50 text-sm text-gray-700"
          />
        </div>
      </div>

      <div className="mt-6 border-t border-gray-100 pt-5">
        <button
          onClick={onSignOut}
          className="flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut size={12} />
          Sign out
        </button>
      </div>
    </div>
  );
}

function EmailTab({
  initial,
}: {
  initial: Awaited<ReturnType<typeof getEmailProvider>>;
}) {
  const [testing, setTesting] = useState(false);

  const form = useForm({
    defaultValues: {
      apiKey: "",
      fromEmail: initial.fromEmail,
      fromName: initial.fromName,
    },
    onSubmit: async ({ value }) => {
      try {
        await saveEmailProvider({ data: value });
        toast.success("Email provider saved");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Save failed");
      }
    },
    validators: {
      onSubmit: z.object({
        apiKey: z.string().max(200),
        fromEmail: z.email("Invalid email"),
        fromName: z.string().min(1, "Required").max(100),
      }),
    },
  });

  const onTest = async () => {
    setTesting(true);
    try {
      await sendTestEmail();
      toast.success("Test email sent — check your inbox");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Test send failed");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">Email provider</p>
          <p className="mt-1 text-xs text-gray-500">
            Resend API key + the address recovery emails will be sent from.
          </p>
        </div>
        {initial.configured && (
          <span className="rounded-full border border-dunlo/25 bg-dunlo/10 px-2.5 py-1 text-[11px] font-semibold text-dunlo-deep">
            Configured
          </span>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="mt-5 space-y-4"
      >
        <form.Field name="apiKey">
          {(field) => (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Resend API key
              </Label>
              <Input
                type="password"
                autoComplete="off"
                placeholder={initial.apiKey ?? "re_..."}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="h-11 rounded-xl border-gray-200 bg-white font-mono text-sm placeholder:text-gray-400 focus:border-dunlo focus:ring-dunlo/20"
              />
              <p className="text-[11px] text-gray-400">
                {initial.apiKey
                  ? "Leave blank to keep the existing key."
                  : "Create a key at resend.com/api-keys."}
              </p>
              {field.state.meta.errors.map((err) => (
                <p key={err?.message} className="text-xs text-red-500">
                  {err?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        <form.Field name="fromEmail">
          {(field) => (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">From email</Label>
              <Input
                type="email"
                placeholder="noreply@yourdomain.com"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="h-11 rounded-xl border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:border-dunlo focus:ring-dunlo/20"
              />
              {field.state.meta.errors.map((err) => (
                <p key={err?.message} className="text-xs text-red-500">
                  {err?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        <form.Field name="fromName">
          {(field) => (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">From name</Label>
              <Input
                placeholder="Acme"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="h-11 rounded-xl border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:border-dunlo focus:ring-dunlo/20"
              />
              {field.state.meta.errors.map((err) => (
                <p key={err?.message} className="text-xs text-red-500">
                  {err?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        <div className="flex items-center justify-between border-t border-gray-100 pt-5">
          <button
            type="button"
            onClick={onTest}
            disabled={!initial.configured || testing}
            className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {testing ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
            Send test email
          </button>

          <form.Subscribe
            selector={(s) => ({ canSubmit: s.canSubmit, isSubmitting: s.isSubmitting })}
          >
            {({ canSubmit, isSubmitting }) => (
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="flex items-center gap-1.5 rounded-full bg-dunlo px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-dunlo-hover active:scale-[0.97] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Save size={12} />
                )}
                Save
              </button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </div>
  );
}

function EscalationTab({
  initial,
}: {
  initial: Awaited<ReturnType<typeof getEscalationSettings>>;
}) {
  const [disconnecting, setDisconnecting] = useState(false);

  const form = useForm({
    defaultValues: {
      threshold: initial.thresholdMajor ?? 500,
      currency: initial.currency as "eur" | "usd" | "gbp",
    },
    onSubmit: async ({ value }) => {
      try {
        await updateEscalationSettings({
          data: { threshold: value.threshold, currency: value.currency },
        });
        toast.success("Escalation settings saved");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Save failed");
      }
    },
    validators: {
      onSubmit: z.object({
        threshold: z.coerce.number().int().min(0).max(1_000_000),
        currency: z.enum(["eur", "usd", "gbp"]),
      }),
    },
  });

  const onDisconnect = async () => {
    if (
      !window.confirm(
        "Disconnect Stripe? Recovery sequences are preserved and will be reused if you reconnect.",
      )
    ) {
      return;
    }
    setDisconnecting(true);
    try {
      const res = await fetch("/api/stripe/disconnect", { method: "POST" });
      if (!res.ok) throw new Error(`Disconnect failed (${res.status})`);
      toast.success("Stripe disconnected");
      window.location.reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Disconnect failed");
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-gray-900">Escalation threshold</p>
        <p className="mt-1 text-xs text-gray-500">
          Failed payments above this amount skip the recovery sequence and are surfaced to you for a
          personal email.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="mt-5 space-y-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_140px]">
            <form.Field name="threshold">
              {(field) => (
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">
                    Amount (in major units)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="500"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number(e.target.value) || 0)}
                    className="h-11 rounded-xl border-gray-200 bg-white font-mono text-sm focus:border-dunlo focus:ring-dunlo/20"
                  />
                  <p className="text-[11px] text-gray-400">
                    Stored in cents on save (e.g. 500 → 50000).
                  </p>
                </div>
              )}
            </form.Field>

            <form.Field name="currency">
              {(field) => (
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Currency</Label>
                  <select
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(e.target.value as "eur" | "usd" | "gbp")
                    }
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-dunlo focus:outline-none focus:ring-2 focus:ring-dunlo/20"
                  >
                    <option value="eur">EUR</option>
                    <option value="usd">USD</option>
                    <option value="gbp">GBP</option>
                  </select>
                </div>
              )}
            </form.Field>
          </div>

          <div className="flex justify-end border-t border-gray-100 pt-5">
            <form.Subscribe
              selector={(s) => ({ canSubmit: s.canSubmit, isSubmitting: s.isSubmitting })}
            >
              {({ canSubmit, isSubmitting }) => (
                <button
                  type="submit"
                  disabled={!canSubmit || isSubmitting || !initial.hasConnection}
                  className="flex items-center gap-1.5 rounded-full bg-dunlo px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-dunlo-hover active:scale-[0.97] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Save size={12} />
                  )}
                  Save
                </button>
              )}
            </form.Subscribe>
          </div>
          {!initial.hasConnection && (
            <p className="text-xs text-gray-400">
              Connect Stripe from the dashboard before adjusting escalation settings.
            </p>
          )}
        </form>
      </div>

      <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-gray-900">Disconnect Stripe</p>
        <p className="mt-1 text-xs text-gray-500">
          Removes the OAuth connection and deregisters the webhook on Stripe's side. Your recovery
          sequences and historical data are kept.
        </p>
        <button
          onClick={onDisconnect}
          disabled={!initial.hasConnection || disconnecting}
          className="mt-4 flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {disconnecting ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Unplug size={12} />
          )}
          {initial.hasConnection ? "Disconnect Stripe" : "Not connected"}
        </button>
      </div>
    </div>
  );
}
