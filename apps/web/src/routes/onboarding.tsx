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
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  Check,
  ChevronRight,
  ExternalLink,
  Gauge,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Logo } from "@/components/logo";
import { saveEmailProvider } from "@/functions/email-provider";
import { getUser } from "@/functions/get-user";
import { formatRate } from "@/lib/benchmark";
import {
  onboardingStateQueryOptions,
  userBenchmarkQueryOptions,
} from "@/lib/queries";

const EMAIL_PROVIDER_OPTIONS = [
  { value: "postmark", label: "Postmark" },
  { value: "resend", label: "Resend" },
  { value: "mailgun", label: "Mailgun" },
  { value: "sendgrid", label: "SendGrid" },
] as const;

type EmailProviderValue = (typeof EMAIL_PROVIDER_OPTIONS)[number]["value"];

const searchSchema = z.object({
  step: z.coerce.number().int().min(1).max(4).catch(1),
  error: z.string().optional(),
  msg: z.string().optional(),
});

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Get started — Dunlo" },
    ],
  }),
  validateSearch: searchSchema,
  beforeLoad: async () => {
    const session = await getUser();
    if (!session?.user)
      throw redirect({ to: "/login", search: { mode: "signin" } });
    return { session };
  },
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(onboardingStateQueryOptions()),
  component: RouteComponent,
});

function StepDot({
  n,
  active,
  done,
}: {
  n: number;
  active: boolean;
  done: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex size-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
          done
            ? "bg-dunlo text-white"
            : active
              ? "bg-dunlo text-white"
              : "bg-gray-100 text-gray-400"
        }`}
      >
        {done ? <Check size={13} /> : n}
      </div>
    </div>
  );
}

function StepConnector({ done }: { done: boolean }) {
  return (
    <div
      className={`h-px w-8 transition-colors ${done ? "bg-dunlo" : "bg-gray-200"}`}
    />
  );
}

function BenchmarkStep({ onContinue }: { onContinue: () => void }) {
  const { data: benchmark } = useSuspenseQuery(userBenchmarkQueryOptions());
  const biggestBreakdown = benchmark.breakdown.slice(0, 3);
  const isAboveAverage = benchmark.userRate > benchmark.averageRate;

  return (
    <div>
      <div className="inline-flex items-center gap-2 rounded-full border border-dunlo/25 bg-dunlo/8 px-3 py-1 text-xs font-semibold text-dunlo-deep">
        <BarChart3 size={13} />
        Benchmark ready
      </div>

      <h1 className="mt-4 text-2xl font-bold text-gray-900">
        Your Stripe benchmark is ready
      </h1>
      <p className="mt-2 text-sm leading-6 text-gray-500">
        Similar SaaS companies average {formatRate(benchmark.averageRate)}.
        Your Stripe data shows a failed payment rate of{" "}
        <span
          className={
            isAboveAverage
              ? "font-semibold text-red-600"
              : "font-semibold text-dunlo-deep"
          }
        >
          {formatRate(benchmark.userRate)}
        </span>
        .
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <Gauge size={15} className="mb-3 text-gray-400" />
          <p className="font-mono text-lg font-bold text-gray-900">
            Top {benchmark.percentile}%
          </p>
          <p className="text-xs text-gray-400">Percentile</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <TrendingUp size={15} className="mb-3 text-gray-400" />
          <p className="font-mono text-lg font-bold text-gray-900">
            {benchmark.estimatedMonthlyLeakFormatted}
          </p>
          <p className="text-xs text-gray-400">Monthly leak</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <Check size={15} className="mb-3 text-gray-400" />
          <p className="font-mono text-lg font-bold text-gray-900">
            {benchmark.recoveredFailureCount}
          </p>
          <p className="text-xs text-gray-400">Recovered</p>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-gray-100">
        {biggestBreakdown.map((item) => (
          <div
            key={item.code}
            className="flex items-center justify-between gap-4 border-b border-gray-100 px-4 py-3 last:border-b-0"
          >
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {item.label}
              </p>
              <p className="text-xs text-gray-400">
                Avg {formatRate(item.averageRate)}
              </p>
            </div>
            <p
              className={`rounded-full border px-2 py-1 font-mono text-xs font-bold ${
                item.status === "above"
                  ? "border-red-100 bg-red-50 text-red-600"
                  : "border-dunlo/20 bg-dunlo/8 text-dunlo-deep"
              }`}
            >
              {formatRate(item.rate)}
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={onContinue}
        className="mt-8 flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-dunlo text-sm font-semibold text-white transition-all hover:bg-dunlo-hover active:scale-[0.98]"
      >
        Continue setup
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

function RouteComponent() {
  const {
    data: { stripeConnected, emailConfigured },
  } = useSuspenseQuery(onboardingStateQueryOptions());
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/onboarding" });

  const step = search.step;

  useEffect(() => {
    if (search.error === "stripe_failed") {
      toast.error(search.msg || "Stripe connection failed. Please try again.");
    }
  }, [search.error, search.msg]);

  const form = useForm({
    defaultValues: {
      provider: "postmark" as EmailProviderValue,
      apiKey: "",
      domain: "",
      fromEmail: "",
      fromName: "",
    },
    onSubmit: async ({ value }) => {
      try {
        await saveEmailProvider({ data: value });
        toast.success("Email provider configured");
        navigate({ to: "/onboarding", search: { step: 4 } });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to save");
      }
    },
    validators: {
      onSubmit: z
        .object({
          provider: z.enum(["resend", "postmark", "mailgun", "sendgrid"]),
          apiKey: z.string().min(1, "Required"),
          domain: z.string().max(200),
          fromEmail: z.email("Invalid email"),
          fromName: z.string().min(1, "Required"),
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

  return (
    <div className="flex min-h-dvh flex-col bg-[#f7f8fa] font-sans">
      <header className="flex items-center justify-between px-8 py-6">
        <Logo size={26} />
        <p className="text-xs text-gray-400">Step {step} of 4</p>
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 pb-16">
        <div className="mb-8 flex items-center">
          <StepDot
            n={1}
            active={step === 1}
            done={step > 1 || stripeConnected}
          />
          <StepConnector done={step > 1 || stripeConnected} />
          <StepDot
            n={2}
            active={step === 2}
            done={step > 2}
          />
          <StepConnector done={step > 2} />
          <StepDot
            n={3}
            active={step === 3}
            done={step > 3 || emailConfigured}
          />
          <StepConnector done={step > 3} />
          <StepDot n={4} active={step === 4} done={false} />
        </div>

        <div className="w-full rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          {step === 1 && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Connect your Stripe account
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                We'll monitor failed payments and trigger recovery emails on
                your behalf. Read-only access until you configure sequences.
              </p>

              {stripeConnected ? (
                <div className="mt-6 flex items-center gap-2 rounded-xl border border-dunlo/25 bg-dunlo/8 px-4 py-3">
                  <Check size={15} className="text-dunlo-deep" />
                  <p className="text-sm font-semibold text-dunlo-deep">
                    Stripe already connected
                  </p>
                </div>
              ) : null}

              <div className="mt-8 flex items-center gap-3">
                <a
                  href="/api/stripe/connect"
                  className="flex h-11 items-center gap-1.5 rounded-full bg-dunlo px-5 text-sm font-semibold text-white transition-all hover:bg-dunlo-hover active:scale-[0.98]"
                >
                  {stripeConnected ? "Reconnect Stripe" : "Connect Stripe"}
                  <ExternalLink size={13} />
                </a>
                {stripeConnected ? (
                  <button
                    onClick={() =>
                      navigate({ to: "/onboarding", search: { step: 2 } })
                    }
                    className="flex h-11 items-center gap-1 rounded-full border border-gray-200 px-5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Continue
                    <ChevronRight size={14} />
                  </button>
                ) : null}
              </div>
            </div>
          )}

          {step === 2 && (
            stripeConnected ? (
              <BenchmarkStep
                onContinue={() =>
                  navigate({ to: "/onboarding", search: { step: 3 } })
                }
              />
            ) : (
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Connect Stripe first
                </h1>
                <p className="mt-2 text-sm text-gray-500">
                  The benchmark unlocks after Dunlo can read your recent Stripe
                  payment activity.
                </p>
                <button
                  onClick={() =>
                    navigate({ to: "/onboarding", search: { step: 1 } })
                  }
                  className="mt-8 flex h-11 items-center gap-1 rounded-full bg-dunlo px-5 text-sm font-semibold text-white transition-all hover:bg-dunlo-hover active:scale-[0.98]"
                >
                  Back to Stripe
                  <ChevronRight size={14} />
                </button>
              </div>
            )
          )}

          {step === 3 && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Configure email sending
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Recovery emails are sent from your own email provider so you
                control the sending domain and deliverability.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit();
                }}
                className="mt-8 space-y-5"
              >
                <form.Field name="provider">
                  {(field) => (
                    <div className="space-y-1.5">
                      <Label
                        htmlFor={field.name}
                        className="text-sm font-medium text-gray-700"
                      >
                        Provider
                      </Label>
                      <Select
                        value={field.state.value}
                        onValueChange={(value) =>
                          field.handleChange(
                            value as typeof field.state.value,
                          )
                        }
                      >
                        <SelectTrigger
                          id={field.name}
                          className="h-11 w-full rounded-xl border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-dunlo focus:ring-2 focus:ring-dunlo/20"
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
                      <Label
                        htmlFor={field.name}
                        className="text-sm font-medium text-gray-700"
                      >
                        API key
                      </Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        autoComplete="off"
                        placeholder="Paste provider API key"
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

                <form.Subscribe selector={(s) => s.values.provider}>
                  {(provider) =>
                    provider === "mailgun" ? (
                      <form.Field name="domain">
                        {(field) => (
                          <div className="space-y-1.5">
                            <Label
                              htmlFor={field.name}
                              className="text-sm font-medium text-gray-700"
                            >
                              Mailgun domain
                            </Label>
                            <Input
                              id={field.name}
                              name={field.name}
                              placeholder="mg.yourdomain.com"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              className="h-11 rounded-xl border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:border-dunlo focus:ring-dunlo/20"
                            />
                            {field.state.meta.errors.map((err) => (
                              <p
                                key={err?.message}
                                className="text-xs text-red-500"
                              >
                                {err?.message}
                              </p>
                            ))}
                          </div>
                        )}
                      </form.Field>
                    ) : null
                  }
                </form.Subscribe>

                <form.Field name="fromEmail">
                  {(field) => (
                    <div className="space-y-1.5">
                      <Label
                        htmlFor={field.name}
                        className="text-sm font-medium text-gray-700"
                      >
                        From email
                      </Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="email"
                        autoComplete="off"
                        placeholder="billing@yourdomain.com"
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
                      <Label
                        htmlFor={field.name}
                        className="text-sm font-medium text-gray-700"
                      >
                        From name
                      </Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        autoComplete="off"
                        placeholder="Acme Billing"
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

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      navigate({ to: "/onboarding", search: { step: 4 } })
                    }
                    className="text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    I'll do this later
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
                        className="flex h-11 items-center gap-1.5 rounded-full bg-dunlo px-5 text-sm font-semibold text-white transition-all hover:bg-dunlo-hover active:scale-[0.98] disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            Saving…
                          </>
                        ) : (
                          <>
                            Save and continue
                            <ChevronRight size={14} />
                          </>
                        )}
                      </button>
                    )}
                  </form.Subscribe>
                </div>
              </form>
            </div>
          )}

          {step === 4 && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                You're all set
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Dunlo is now watching for failed payments. Recovery emails will
                fire automatically.
              </p>

              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4">
                  <span
                    className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${
                      stripeConnected
                        ? "bg-dunlo/20 text-dunlo-deep"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {stripeConnected ? "✓" : "!"}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Stripe {stripeConnected ? "connected" : "not connected"}
                    </p>
                    {!stripeConnected && (
                      <p className="text-xs text-gray-400">
                        Connect later from Settings.
                      </p>
                    )}
                  </div>
                </li>
                <li className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4">
                  <span
                    className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${
                      emailConfigured
                        ? "bg-dunlo/20 text-dunlo-deep"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {emailConfigured ? "✓" : "!"}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Email{" "}
                      {emailConfigured
                        ? "provider configured"
                        : "provider skipped"}
                    </p>
                    {!emailConfigured && (
                      <p className="text-xs text-gray-400">
                        Configure later in Settings → Email provider.
                      </p>
                    )}
                  </div>
                </li>
              </ul>

              <button
                onClick={() => navigate({ to: "/dashboard" })}
                className="mt-8 flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-dunlo text-sm font-semibold text-white transition-all hover:bg-dunlo-hover active:scale-[0.98]"
              >
                Go to dashboard
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
