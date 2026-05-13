import { Input } from "@dunlo-v2/ui/components/input";
import { Label } from "@dunlo-v2/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  Loader2,
  LogOut,
  Mail,
  Save,
  Send,
  Unplug,
  User as UserIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

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

type Tab = "account" | "email" | "escalation";

export const Route = createFileRoute("/_dashboard/settings")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Settings — Dunlo" },
    ],
  }),
  loader: async () => {
    const [emailState, escalationState] = await Promise.all([
      getEmailProvider(),
      getEscalationSettings(),
    ]);
    return { emailState, escalationState };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { session } = Route.useRouteContext();
  const { emailState, escalationState } = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const [tab, setTab] = useState<Tab>("account");

  const handleSignOut = () => {
    authClient.signOut({ fetchOptions: { onSuccess: () => navigate({ to: "/" }) } });
  };

  return (
    <>
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-100 bg-white/80 px-6 py-4 backdrop-blur-md">
        <div>
          <h1 className="text-[15px] font-semibold tracking-tight text-zinc-900">Settings</h1>
          <p className="text-xs text-zinc-400">Account, email provider, and escalation.</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 p-6">
        <div className="inline-flex items-center gap-1 rounded-full border border-zinc-100 bg-white p-1 shadow-[0_1px_4px_0_rgba(0,0,0,0.04)]">
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
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-500 hover:text-zinc-900"
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
        {tab === "escalation" && <EscalationTab initial={escalationState} />}
      </div>
    </>
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
    <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-[0_1px_4px_0_rgba(0,0,0,0.04)]">
      <p className="text-sm font-semibold text-zinc-900">Account</p>
      <p className="mt-1 text-xs text-zinc-500">
        Your profile details. Email is managed via Better Auth and cannot be changed here.
      </p>

      <div className="mt-5 space-y-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-zinc-700">Name</Label>
          <Input
            value={name}
            readOnly
            className="h-11 rounded-xl border-zinc-200 bg-zinc-50 text-sm text-zinc-700"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-zinc-700">Email</Label>
          <Input
            value={email}
            readOnly
            className="h-11 rounded-xl border-zinc-200 bg-zinc-50 text-sm text-zinc-700"
          />
        </div>
      </div>

      <div className="mt-6 border-t border-zinc-100 pt-5">
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
    <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-[0_1px_4px_0_rgba(0,0,0,0.04)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-900">Email provider</p>
          <p className="mt-1 text-xs text-zinc-500">
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
              <Label className="text-sm font-medium text-zinc-700">Resend API key</Label>
              <Input
                type="password"
                autoComplete="off"
                placeholder={initial.apiKey ?? "re_..."}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="h-11 rounded-xl border-zinc-200 bg-white font-mono text-sm placeholder:text-zinc-400 focus:border-dunlo focus:ring-dunlo/20"
              />
              <p className="text-[11px] text-zinc-400">
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
              <Label className="text-sm font-medium text-zinc-700">From email</Label>
              <Input
                type="email"
                placeholder="noreply@yourdomain.com"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="h-11 rounded-xl border-zinc-200 bg-white text-sm placeholder:text-zinc-400 focus:border-dunlo focus:ring-dunlo/20"
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
              <Label className="text-sm font-medium text-zinc-700">From name</Label>
              <Input
                placeholder="Acme"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="h-11 rounded-xl border-zinc-200 bg-white text-sm placeholder:text-zinc-400 focus:border-dunlo focus:ring-dunlo/20"
              />
              {field.state.meta.errors.map((err) => (
                <p key={err?.message} className="text-xs text-red-500">
                  {err?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        <div className="flex items-center justify-between border-t border-zinc-100 pt-5">
          <button
            type="button"
            onClick={onTest}
            disabled={!initial.configured || testing}
            className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 transition-all hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
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
      window.location.href = "/onboarding";
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Disconnect failed");
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-[0_1px_4px_0_rgba(0,0,0,0.04)]">
        <p className="text-sm font-semibold text-zinc-900">Escalation threshold</p>
        <p className="mt-1 text-xs text-zinc-500">
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
                  <Label className="text-sm font-medium text-zinc-700">
                    Amount (in major units)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="500"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number(e.target.value) || 0)}
                    className="h-11 rounded-xl border-zinc-200 bg-white font-mono text-sm focus:border-dunlo focus:ring-dunlo/20"
                  />
                  <p className="text-[11px] text-zinc-400">
                    Stored in cents on save (e.g. 500 → 50000).
                  </p>
                </div>
              )}
            </form.Field>

            <form.Field name="currency">
              {(field) => (
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-zinc-700">Currency</Label>
                  <select
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(e.target.value as "eur" | "usd" | "gbp")
                    }
                    className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:border-dunlo focus:outline-none focus:ring-2 focus:ring-dunlo/20"
                  >
                    <option value="eur">EUR</option>
                    <option value="usd">USD</option>
                    <option value="gbp">GBP</option>
                  </select>
                </div>
              )}
            </form.Field>
          </div>

          <div className="flex justify-end border-t border-zinc-100 pt-5">
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
            <p className="text-xs text-zinc-400">
              Connect Stripe from the dashboard before adjusting escalation settings.
            </p>
          )}
        </form>
      </div>

      <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-[0_1px_4px_0_rgba(0,0,0,0.04)]">
        <p className="text-sm font-semibold text-zinc-900">Disconnect Stripe</p>
        <p className="mt-1 text-xs text-zinc-500">
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
