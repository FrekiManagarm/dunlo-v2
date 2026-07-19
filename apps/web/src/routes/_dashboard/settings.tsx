import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@dunlo-v2/ui/components/alert-dialog";
import { Input } from "@dunlo-v2/ui/components/input";
import { Label } from "@dunlo-v2/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@dunlo-v2/ui/components/select";
import { useForm } from "@tanstack/react-form";
import { usePostHog } from "posthog-js/react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  FlaskConical,
  Loader2,
  LogOut,
  Mail,
  Save,
  Send,
  TrendingUp,
  Unplug,
  User as UserIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { useCustomer } from "autumn-js/react";
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
import {
  simulateFailedPayment,
  simulateEscalation,
  simulateRecovery,
} from "@/functions/testing";
import {
  emailProviderQueryOptions,
  escalationSettingsQueryOptions,
} from "@/lib/queries";

type Tab = "account" | "billing" | "email" | "escalation" | "testing";

const EMAIL_PROVIDER_OPTIONS = [
  { value: "postmark", label: "Postmark" },
  { value: "resend", label: "Resend" },
  { value: "mailgun", label: "Mailgun" },
  { value: "sendgrid", label: "SendGrid" },
] as const;

const IS_DEVELOPMENT = import.meta.env.MODE === "development";

const TABS = [
  { id: "account" as const, label: "Account", icon: UserIcon },
  { id: "billing" as const, label: "Billing", icon: CreditCard },
  { id: "email" as const, label: "Email provider", icon: Mail },
  { id: "escalation" as const, label: "Escalation", icon: AlertCircle },
  ...(IS_DEVELOPMENT
    ? [{ id: "testing" as const, label: "Testing", icon: FlaskConical }]
    : []),
];

export const Route = createFileRoute("/_dashboard/settings")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Settings — Dunlo" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(emailProviderQueryOptions()),
      context.queryClient.ensureQueryData(escalationSettingsQueryOptions()),
    ]),
  component: RouteComponent,
});

function RouteComponent() {
  const { session } = Route.useRouteContext();
  const { data: emailState } = useSuspenseQuery(emailProviderQueryOptions());
  const { data: escalationState } = useSuspenseQuery(
    escalationSettingsQueryOptions(),
  );
  const navigate = Route.useNavigate();
  const [tab, setTab] = useState<Tab>("account");

  const handleSignOut = () => {
    authClient.signOut({
      fetchOptions: { onSuccess: () => navigate({ to: "/" }) },
    });
  };

  return (
    <>
      <div className="sticky top-0 z-20 flex items-center border-b border-zinc-100 bg-white/80 px-6 py-4 backdrop-blur-md">
        <div>
          <h1 className="text-[15px] font-semibold tracking-tight text-zinc-900">
            Settings
          </h1>
          <p className="text-xs text-zinc-400">
            Account, email provider, escalation thresholds.
          </p>
        </div>
      </div>

      <div className="flex gap-0 p-6 pb-12">
        {/* Vertical section nav */}
        <nav className="w-43 shrink-0 pr-4">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
            Preferences
          </p>
          <div className="space-y-px">
            {TABS.map(({ id, label, icon: Icon }) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all ${
                    active
                      ? "bg-dunlo/[0.07] font-semibold text-dunlo-deep"
                      : "font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
                  }`}
                >
                  <Icon size={14} className={active ? "text-dunlo" : ""} />
                  {label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content panel */}
        <div className="flex-1 min-w-0 max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              {tab === "account" && (
                <AccountTab
                  name={session?.user.name ?? ""}
                  email={session?.user.email ?? ""}
                  onSignOut={handleSignOut}
                />
              )}
              {tab === "billing" && <BillingTab />}
              {tab === "email" && <EmailTab initial={emailState} />}
              {tab === "escalation" && (
                <EscalationTab initial={escalationState} />
              )}
              {IS_DEVELOPMENT && tab === "testing" && <TestingTab />}
            </motion.div>
          </AnimatePresence>
        </div>
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
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-5">
      {/* Profile card */}
      <div className="rounded-2xl border border-zinc-100 bg-white shadow-[0_1px_4px_0_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-5 px-6 py-5 border-b border-zinc-50">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-dunlo/[0.07] text-xl font-bold tracking-tight text-dunlo-deep">
            {initials || "U"}
          </div>
          <div>
            <p className="text-[15px] font-semibold tracking-tight text-zinc-900">
              {name || "—"}
            </p>
            <p className="text-sm text-zinc-400">{email}</p>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
            Profile details
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-zinc-500">Name</Label>
              <Input
                value={name}
                readOnly
                className="h-10 rounded-xl border-zinc-200 bg-zinc-50 text-sm text-zinc-700 cursor-default focus-visible:ring-0 focus-visible:border-zinc-200"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-zinc-500">
                Email address
              </Label>
              <Input
                value={email}
                readOnly
                className="h-10 rounded-xl border-zinc-200 bg-zinc-50 text-sm text-zinc-700 cursor-default focus-visible:ring-0 focus-visible:border-zinc-200"
              />
            </div>
          </div>
          <p className="text-[11px] text-zinc-400">
            Profile is managed through Better Auth. Changes must be made
            directly in your auth provider.
          </p>
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl border border-zinc-100 bg-white shadow-[0_1px_4px_0_rgba(0,0,0,0.04)]">
        <div className="px-6 py-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
            Session
          </p>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-800">Sign out</p>
              <p className="text-xs text-zinc-400 mt-0.5">
                End your current session on this device.
              </p>
            </div>
            <button
              onClick={onSignOut}
              className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50/50 px-4 py-2 text-xs font-semibold text-red-600 transition-all hover:bg-red-50 hover:border-red-200 active:scale-[0.97]"
            >
              <LogOut size={12} />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmailTab({
  initial,
}: {
  initial: Awaited<ReturnType<typeof getEmailProvider>>;
}) {
  const posthog = usePostHog();
  const saveProviderMutation = useMutation({
    mutationFn: (data: {
      provider: "resend" | "postmark" | "mailgun" | "sendgrid";
      apiKey: string;
      domain: string;
      fromEmail: string;
      fromName: string;
    }) => saveEmailProvider({ data }),
    onSuccess: () => {
      posthog.capture("settings_updated", { section: "email_provider" });
      toast.success("Email provider saved");
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Save failed");
    },
  });

  const testEmailMutation = useMutation({
    mutationFn: () => sendTestEmail(),
    onSuccess: () => {
      toast.success("Test email sent — check your inbox");
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Test send failed");
    },
  });
  const { mutateAsync: saveProvider } = saveProviderMutation;
  const { mutateAsync: testEmail } = testEmailMutation;

  const form = useForm({
    defaultValues: {
      provider: initial.provider,
      apiKey: "",
      domain: initial.domain,
      fromEmail: initial.fromEmail,
      fromName: initial.fromName,
    },
    onSubmit: async ({ value }) => {
      await saveProvider(value).catch(() => undefined);
    },
    validators: {
      onSubmit: z
        .object({
          provider: z.enum(["resend", "postmark", "mailgun", "sendgrid"]),
          apiKey: z.string().max(500),
          domain: z.string().max(200),
          fromEmail: z.email("Invalid email"),
          fromName: z.string().min(1, "Required").max(100),
        })
        .refine(
          (value) =>
            value.provider !== "mailgun" || Boolean(value.domain.trim()),
          {
            message: "Mailgun sending domain is required",
            path: ["domain"],
          },
        ),
    },
  });

  const onTest = async () => {
    await testEmail().catch(() => undefined);
  };

  return (
    <div className="rounded-2xl border border-zinc-100 bg-white shadow-[0_1px_4px_0_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-50">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
            Provider integration
          </p>
          <p className="mt-1 text-sm font-semibold tracking-tight text-zinc-900">
            Email provider
          </p>
        </div>
        {initial.configured ? (
          <div className="flex items-center gap-1.5 rounded-full border border-dunlo/20 bg-dunlo/[0.07] px-3 py-1.5">
            <CheckCircle2 size={11} className="text-dunlo" />
            <span className="text-[11px] font-semibold text-dunlo-deep">
              Configured
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5">
            <span className="size-1.5 rounded-full bg-zinc-400" />
            <span className="text-[11px] font-semibold text-zinc-500">
              Not configured
            </span>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="px-6 py-5 space-y-5"
      >
        <form.Field name="provider">
          {(field) => (
            <div className="space-y-1.5">
              <Label
                htmlFor={field.name}
                className="text-xs font-medium text-zinc-500"
              >
                Provider
              </Label>
              <Select
                value={field.state.value}
                onValueChange={(value) =>
                  field.handleChange(value as typeof field.state.value)
                }
              >
                <SelectTrigger
                  id={field.name}
                  className="h-10 w-full rounded-xl border-zinc-200 bg-zinc-50 text-sm text-zinc-900 focus:border-dunlo/40 focus:bg-white focus:ring-dunlo/10"
                  onBlur={field.handleBlur}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMAIL_PROVIDER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.state.meta.errors.map((err) => (
                <p key={err?.message} className="text-xs text-red-500">
                  {err?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        <form.Field name="apiKey">
          {(field) => (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-zinc-500">
                  API key
                </Label>
                {initial.apiKey && (
                  <span className="text-[10px] text-dunlo-dim font-medium">
                    Key saved
                  </span>
                )}
              </div>
              <Input
                type="password"
                autoComplete="off"
                placeholder={
                  initial.apiKey ? "••••••••••••••••" : "Paste provider API key"
                }
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="h-10 rounded-xl border-zinc-200 bg-zinc-50 font-mono text-sm placeholder:text-zinc-300 focus:border-dunlo/40 focus:bg-white focus:ring-dunlo/10"
              />
              <p className="text-[11px] text-zinc-400">
                {initial.apiKey
                  ? "Leave blank to keep the existing key."
                  : "Use a sending-capable API key from your selected provider."}
              </p>
              {field.state.meta.errors.map((err) => (
                <p key={err?.message} className="text-xs text-red-500">
                  {err?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        <form.Subscribe selector={(s) => s.values.provider}>
          {(provider) =>
            provider === "mailgun" ? (
              <form.Field name="domain">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-zinc-500">
                      Mailgun domain
                    </Label>
                    <Input
                      placeholder="mg.yourdomain.com"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="h-10 rounded-xl border-zinc-200 bg-zinc-50 text-sm placeholder:text-zinc-300 focus:border-dunlo/40 focus:bg-white focus:ring-dunlo/10"
                    />
                    {field.state.meta.errors.map((err) => (
                      <p key={err?.message} className="text-xs text-red-500">
                        {err?.message}
                      </p>
                    ))}
                  </div>
                )}
              </form.Field>
            ) : null
          }
        </form.Subscribe>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr]">
          <form.Field name="fromEmail">
            {(field) => (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-500">
                  From address
                </Label>
                <Input
                  type="email"
                  placeholder="noreply@yourdomain.com"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="h-10 rounded-xl border-zinc-200 bg-zinc-50 text-sm placeholder:text-zinc-300 focus:border-dunlo/40 focus:bg-white focus:ring-dunlo/10"
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
                <Label className="text-xs font-medium text-zinc-500">
                  From name
                </Label>
                <Input
                  placeholder="Your company"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="h-10 rounded-xl border-zinc-200 bg-zinc-50 text-sm placeholder:text-zinc-300 focus:border-dunlo/40 focus:bg-white focus:ring-dunlo/10"
                />
                {field.state.meta.errors.map((err) => (
                  <p key={err?.message} className="text-xs text-red-500">
                    {err?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-50 pt-5">
          <button
            type="button"
            onClick={onTest}
            disabled={!initial.configured || testEmailMutation.isPending}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-600 transition-all hover:bg-zinc-50 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {testEmailMutation.isPending ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Send size={12} />
            )}
            Send test
          </button>

          <form.Subscribe
            selector={(s) => ({
              canSubmit: s.canSubmit,
              isSubmitting: s.isSubmitting,
            })}
          >
            {({ canSubmit, isSubmitting }) => (
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="flex items-center gap-1.5 rounded-xl bg-dunlo px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-dunlo-hover active:scale-[0.97] disabled:opacity-50"
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
  const posthog = usePostHog();
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false);

  const saveEscalationSettingsMutation = useMutation({
    mutationFn: (data: {
      threshold: number;
      currency: "eur" | "usd" | "gbp";
    }) => updateEscalationSettings({ data }),
    onSuccess: () => {
      posthog.capture("settings_updated", { section: "escalation" });
      toast.success("Escalation settings saved");
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Save failed");
    },
  });

  const disconnectStripeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/stripe/disconnect", { method: "POST" });
      if (!res.ok) throw new Error(`Disconnect failed (${res.status})`);
    },
    onSuccess: () => {
      toast.success("Stripe disconnected");
      window.location.href = "/onboarding";
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Disconnect failed");
    },
  });
  const { mutateAsync: saveEscalationSettings } =
    saveEscalationSettingsMutation;
  const { mutateAsync: disconnectStripe } = disconnectStripeMutation;

  const form = useForm({
    defaultValues: {
      threshold: initial.thresholdMajor ?? 500,
      currency: initial.currency as "eur" | "usd" | "gbp",
    },
    onSubmit: async ({ value }) => {
      await saveEscalationSettings({
        threshold: value.threshold,
        currency: value.currency,
      }).catch(() => undefined);
    },
    validators: {
      onSubmit: z.object({
        threshold: z.number().int().min(0).max(1_000_000),
        currency: z.enum(["eur", "usd", "gbp"]),
      }),
    },
  });

  const onDisconnectConfirm = async () => {
    await disconnectStripe().catch(() => undefined);
  };

  return (
    <div className="space-y-5">
      {/* Threshold card */}
      <div className="rounded-2xl border border-zinc-100 bg-white shadow-[0_1px_4px_0_rgba(0,0,0,0.04)]">
        <div className="px-6 py-5 border-b border-zinc-50">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
            Threshold
          </p>
          <p className="mt-1 text-sm font-semibold tracking-tight text-zinc-900">
            Escalation threshold
          </p>
          <p className="mt-1 text-xs text-zinc-400 max-w-lg">
            Failed payments above this amount bypass the recovery sequence and
            surface here for a personal email.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="px-6 py-5 space-y-5"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_130px]">
            <form.Field name="threshold">
              {(field) => (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-zinc-500">
                    Amount{" "}
                    <span className="text-zinc-400 font-normal">
                      (major units)
                    </span>
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="500"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(Number(e.target.value) || 0)
                    }
                    className="h-10 rounded-xl border-zinc-200 bg-zinc-50 font-mono text-sm focus:border-dunlo/40 focus:bg-white focus:ring-dunlo/10"
                  />
                  <p className="text-[11px] text-zinc-400">
                    Stored in cents on save — e.g. 500 becomes 50,000 cents.
                  </p>
                </div>
              )}
            </form.Field>

            <form.Field name="currency">
              {(field) => (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-zinc-500">
                    Currency
                  </Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) =>
                      field.handleChange(value as "eur" | "usd" | "gbp")
                    }
                  >
                    <SelectTrigger
                      className="h-10 w-full rounded-xl border-zinc-200 bg-zinc-50 text-sm text-zinc-900 focus:border-dunlo/40 focus:bg-white focus:ring-dunlo/10"
                      onBlur={field.handleBlur}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eur">EUR</SelectItem>
                      <SelectItem value="usd">USD</SelectItem>
                      <SelectItem value="gbp">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
          </div>

          {!initial.hasConnection && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
              <AlertCircle size={13} className="text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700">
                Connect Stripe from the dashboard to enable escalation settings.
              </p>
            </div>
          )}

          <div className="flex justify-end border-t border-zinc-50 pt-5">
            <form.Subscribe
              selector={(s) => ({
                canSubmit: s.canSubmit,
                isSubmitting: s.isSubmitting,
              })}
            >
              {({ canSubmit, isSubmitting }) => (
                <button
                  type="submit"
                  disabled={
                    !canSubmit || isSubmitting || !initial.hasConnection
                  }
                  className="flex items-center gap-1.5 rounded-xl bg-dunlo px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-dunlo-hover active:scale-[0.97] disabled:opacity-50"
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

      {/* Stripe disconnect */}
      <div className="rounded-2xl border border-zinc-100 bg-white shadow-[0_1px_4px_0_rgba(0,0,0,0.04)]">
        <div className="px-6 py-5 border-b border-zinc-50">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
            Danger zone
          </p>
          <p className="mt-1 text-sm font-semibold tracking-tight text-zinc-900">
            Disconnect Stripe
          </p>
        </div>
        <div className="px-6 py-5">
          <div className="flex items-start justify-between gap-6">
            <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">
              Removes the OAuth connection and deregisters the webhook. Your
              recovery sequences and all historical payment data are preserved.
            </p>
            <button
              onClick={() => setDisconnectDialogOpen(true)}
              disabled={
                !initial.hasConnection || disconnectStripeMutation.isPending
              }
              className="shrink-0 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/50 px-4 py-2 text-xs font-semibold text-red-600 transition-all hover:bg-red-50 hover:border-red-300 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {disconnectStripeMutation.isPending ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Unplug size={12} />
              )}
              {initial.hasConnection ? "Disconnect" : "Not connected"}
            </button>
          </div>
        </div>
      </div>

      <AlertDialog
        open={disconnectDialogOpen}
        onOpenChange={setDisconnectDialogOpen}
      >
        <AlertDialogContent className="max-w-[calc(100%-2rem)] rounded-2xl border border-red-100 bg-white p-0 shadow-2xl shadow-red-950/10 ring-0 sm:max-w-md">
          <div className="px-6 pt-6">
            <AlertDialogHeader>
              <AlertDialogMedia className="mb-3 size-11 rounded-full bg-red-50 text-red-600">
                <Unplug size={20} />
              </AlertDialogMedia>
              <AlertDialogTitle className="text-base font-semibold tracking-tight text-zinc-950">
                Disconnect Stripe?
              </AlertDialogTitle>
              <AlertDialogDescription className="mt-1 max-w-sm text-sm leading-6 text-zinc-500">
                This removes the OAuth connection and deregisters the webhook.
                Your recovery sequences and historical payment data stay
                preserved and will be reused if you reconnect.
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>

          <AlertDialogFooter className="border-t border-zinc-100 px-6 py-4">
            <AlertDialogCancel
              disabled={disconnectStripeMutation.isPending}
              className="h-10 rounded-xl border-zinc-200 px-4 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
            >
              Keep connected
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onDisconnectConfirm}
              disabled={disconnectStripeMutation.isPending}
              variant="destructive"
              className="h-10 rounded-xl border border-red-200 bg-red-50 px-4 text-xs font-semibold text-red-600 hover:bg-red-100"
            >
              {disconnectStripeMutation.isPending ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Unplug size={13} />
              )}
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

type SimAction = "failure" | "escalation" | "recovery";

const SIM_BUTTONS: {
  action: SimAction;
  label: string;
  description: string;
  icon: React.ElementType;
  accent: string;
  badge: string;
}[] = [
  {
    action: "failure",
    label: "Failed payment",
    description:
      "Creates a real Stripe test failed PaymentIntent and schedules its recovery sequence.",
    icon: CreditCard,
    accent: "text-red-500",
    badge: "bg-red-50 border-red-100 text-red-600",
  },
  {
    action: "escalation",
    label: "Escalation",
    description:
      "Creates a Stripe test failed PaymentIntent above your escalation threshold and queues an AI email draft.",
    icon: TrendingUp,
    accent: "text-amber-500",
    badge: "bg-amber-50 border-amber-100 text-amber-600",
  },
  {
    action: "recovery",
    label: "Recovery",
    description:
      "Marks the most recent in-recovery payment as recovered and cancels pending emails.",
    icon: AlertTriangle,
    accent: "text-dunlo",
    badge: "bg-dunlo/[0.07] border-dunlo/20 text-dunlo-deep",
  },
];

function TestingTab() {
  const queryClient = useQueryClient();

  const invalidatePaymentViews = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      queryClient.invalidateQueries({ queryKey: ["payments"] }),
      queryClient.invalidateQueries({ queryKey: ["escalations"] }),
      queryClient.invalidateQueries({ queryKey: ["alerts", "feed"] }),
    ]);

  const failedPaymentMutation = useMutation({
    mutationFn: () => simulateFailedPayment(),
    onSuccess: async (result) => {
      await invalidatePaymentViews();
      toast.success(`Failed payment created for ${result.customerName}`);
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Simulation failed");
    },
  });

  const escalationMutation = useMutation({
    mutationFn: () => simulateEscalation(),
    onSuccess: async (result) => {
      await invalidatePaymentViews();
      toast.success(`Escalation created for ${result.customerName}`);
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Simulation failed");
    },
  });

  const recoveryMutation = useMutation({
    mutationFn: () => simulateRecovery(),
    onSuccess: async (result) => {
      await invalidatePaymentViews();
      toast.success(`${result.customerName ?? "Payment"} marked as recovered`);
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Simulation failed");
    },
  });

  const run = async (action: SimAction) => {
    if (action === "failure") {
      await failedPaymentMutation.mutateAsync().catch(() => undefined);
      return;
    }
    if (action === "escalation") {
      await escalationMutation.mutateAsync().catch(() => undefined);
      return;
    }
    await recoveryMutation.mutateAsync().catch(() => undefined);
  };

  const isActionPending = (action: SimAction) => {
    if (action === "failure") return failedPaymentMutation.isPending;
    if (action === "escalation") return escalationMutation.isPending;
    return recoveryMutation.isPending;
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-zinc-100 bg-white shadow-[0_1px_4px_0_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-zinc-50">
          <div className="flex size-8 items-center justify-center rounded-xl bg-zinc-50">
            <FlaskConical size={14} className="text-zinc-400" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-zinc-900">
              Event simulator
            </p>
            <p className="text-xs text-zinc-400">
              Trigger test events to preview the full recovery flow end-to-end.
            </p>
          </div>
        </div>

        <div className="divide-y divide-zinc-50">
          {SIM_BUTTONS.map(
            ({ action, label, description, icon: Icon, accent, badge }) => (
              <div
                key={action}
                className="flex items-center justify-between gap-4 px-6 py-4"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-zinc-50">
                    <Icon size={13} className={accent} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-800">{label}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-zinc-400">
                      {description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => run(action)}
                  disabled={isActionPending(action)}
                  className={`shrink-0 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 ${badge}`}
                >
                  {isActionPending(action) ? (
                    <Loader2 size={11} className="animate-spin" />
                  ) : (
                    <Icon size={11} />
                  )}
                  {isActionPending(action) ? "Running…" : "Simulate"}
                </button>
              </div>
            ),
          )}
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
        <AlertCircle size={13} className="mt-0.5 shrink-0 text-amber-500" />
        <p className="text-xs leading-relaxed text-amber-700">
          Test events create Stripe test PaymentIntents plus matching Dunlo
          records. They will appear in Payments, Escalations, and the activity
          feed.
        </p>
      </div>
    </div>
  );
}

/* ─── Billing tab ───────────────────────────────────────────────────────────── */

function BillingTab() {
  const { data: customer, isLoading, openCustomerPortal } = useCustomer();

  const activePlans: string[] =
    customer?.subscriptions
      ?.filter(
        (subscription) =>
          subscription.status === "active" &&
          !subscription.autoEnable &&
          (subscription.plan?.price?.amount ?? 0) > 0,
      )
      .map((subscription) => subscription.plan?.name ?? subscription.planId) ??
    [];

  const hasPaidPlan = activePlans.length > 0;

  const handleManageBilling = async () => {
    try {
      await openCustomerPortal({});
    } catch {
      toast.error("Could not open billing portal");
    }
  };

  return (
    <div className="space-y-5">
      {/* Current plan card */}
      <div className="rounded-2xl border border-zinc-100 bg-white shadow-[0_1px_4px_0_rgba(0,0,0,0.04)]">
        <div className="border-b border-zinc-50 px-6 py-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            Current plan
          </p>
          {isLoading ? (
            <div className="mt-3 h-6 w-32 animate-pulse rounded-lg bg-zinc-100" />
          ) : (
            <div className="mt-2 flex items-center gap-3">
              <span className="text-[18px] font-semibold tracking-tight text-zinc-900">
                {hasPaidPlan ? activePlans.join(", ") : "Beta"}
              </span>
              <span className="rounded-full bg-dunlo/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-dunlo-deep">
                {hasPaidPlan ? "Active" : "Free during beta"}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-3 px-6 py-5">
          {!hasPaidPlan && (
            <div className="flex items-start gap-3 rounded-xl border border-dunlo/15 bg-dunlo/4 p-4">
              <TrendingUp
                size={14}
                className="mt-0.5 shrink-0 text-dunlo-deep"
              />
              <p className="text-[12px] leading-relaxed text-zinc-600">
                Dunlo is{" "}
                <strong className="font-semibold text-zinc-800">
                  free during beta
                </strong>
                . Paid plans launch soon — you'll get a 2-week heads-up before
                any billing starts.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 pt-1">
            <p className="text-[12px] text-zinc-400">
              {hasPaidPlan
                ? "Manage your subscription, update your payment method, or view invoices."
                : "When paid plans launch, you can upgrade here."}
            </p>
            <button
              onClick={handleManageBilling}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-4 py-2 text-[12px] font-semibold text-zinc-700 transition-all hover:bg-zinc-50 active:scale-[0.97]"
            >
              <CreditCard size={12} />
              Manage billing
            </button>
          </div>
        </div>
      </div>

      {/* Plan features */}
      <div className="rounded-2xl border border-zinc-100 bg-white shadow-[0_1px_4px_0_rgba(0,0,0,0.04)]">
        <div className="px-6 py-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            What's included
          </p>
          <ul className="mt-4 space-y-3">
            {[
              "Unlimited recovery sequences",
              "All Stripe failure codes covered",
              "Custom email templates with variables",
              "Escalation rules & alerts",
              "Full payment recovery history",
            ].map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2.5 text-[13px] text-zinc-700"
              >
                <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-dunlo/10">
                  <CheckCircle2 size={10} className="text-dunlo-deep" />
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
