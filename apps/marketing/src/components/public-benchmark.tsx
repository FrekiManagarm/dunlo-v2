"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Gauge, Mail, TrendingUp } from "lucide-react";
import { SIGNUP_URL } from "@/lib/app-url";
import { captureMarketingEvent } from "@/lib/posthog";
import { TrackedLink } from "@/components/tracked-link";

const MIN_MRR = 1_000;
const MAX_MRR = 100_000;
const STEP = 1_000;
const BASE_RECOVERY_RATE = 0.62;

const BENCHMARK_RANGES = [
  {
    min: 0,
    max: 5_000,
    label: "< $5k MRR",
    failedRate: 4.2,
    note: "Usually early enough that Stripe defaults hide the leak.",
  },
  {
    min: 5_000,
    max: 20_000,
    label: "$5k-$20k MRR",
    failedRate: 5.1,
    note: "The first range where a dedicated recovery workflow usually pays back.",
  },
  {
    min: 20_000,
    max: 80_000,
    label: "$20k-$80k MRR",
    failedRate: 5.8,
    note: "Failed payments become a visible retention problem, not just billing noise.",
  },
  {
    min: 80_000,
    max: Number.POSITIVE_INFINITY,
    label: "$80k+ MRR",
    failedRate: 6.4,
    note: "At this stage, recovery needs prioritization and human escalation.",
  },
] as const;

const DEFAULT_RANGE = BENCHMARK_RANGES[BENCHMARK_RANGES.length - 1]!;
const METHODOLOGY_ASSUMPTIONS = [
  "The public calculator is a directional estimate, not a guarantee of recovery.",
  "MRR ranges use simple failed-payment rate assumptions so founders can benchmark before connecting Stripe.",
  "The recovery potential applies a conservative recoverability rate to failed MRR; real results depend on decline-code mix, card age, geography, billing interval, retry settings, and email quality.",
  "The connected-product benchmark should replace this estimate once Stripe data is available.",
] as const;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompact(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 0,
  }).format(value);
}

function getRange(mrr: number) {
  return (
    BENCHMARK_RANGES.find((range) => mrr >= range.min && mrr < range.max) ??
    DEFAULT_RANGE
  );
}

function moneyBucket(value: number) {
  if (value < 1_000) return "<$1k";
  if (value < 5_000) return "$1k-$5k";
  if (value < 20_000) return "$5k-$20k";
  if (value < 80_000) return "$20k-$80k";
  return "$80k+";
}

type PublicBenchmarkProps = {
  variant?: "benchmark" | "audit";
};

const BENCHMARK_COPY = {
  benchmark: {
    badge: "Public Stripe benchmark",
    headline: "Estimate the failed-payment MRR hiding in Stripe.",
    intro:
      "Move one slider. See your estimated failed payment rate, MRR at risk, and monthly recovery potential before you connect anything.",
    resultLabel: "Your estimated range",
    inputTitle: "Enter your estimated MRR",
    resultTitle: "Result shown immediately",
    formTitle: "Get my full benchmark report",
    formBody:
      "We will send the detailed breakdown after you have seen the result here.",
    submit: "Get my full benchmark report",
    success: "Report requested",
    cta: "Connect Stripe to see your real numbers",
    methodologyEyebrow: "Benchmark methodology",
    methodologyTitle:
      "Use the estimate as a first pass, then inspect Stripe by failure reason.",
    methodologyBody:
      "The calculator starts with MRR because it is the number most founders know before they export Stripe data. Dunlo then applies a failed-payment rate by SaaS stage and a conservative recoverability assumption. Your real number will move with billing interval, plan price, customer geography, card age, and whether Stripe Smart Retries, failed-payment emails, and payment update links are already configured.",
    checklistTitle: "What to check after the benchmark",
    checklist: [
      "Export failed invoices and group them by Stripe decline code, not just total failed amount.",
      "Separate soft declines like insufficient funds from hard declines that need a new payment method.",
      "Compare failed MRR, recovered MRR, and churned MRR so recovery is measured as revenue, not email activity.",
    ],
    nextLinks: [
      {
        label: "Stripe failed payments",
        href: "/stripe-failed-payments",
        body: "Turn the benchmark into a recovery workflow for failed invoices.",
      },
      {
        label: "Stripe dunning",
        href: "/stripe-dunning",
        body: "Build the email and retry sequence around the failure context.",
      },
      {
        label: "Stripe Smart Retries alternative",
        href: "/stripe-smart-retries-alternative",
        body: "See where native retries stop and customer communication starts.",
      },
    ],
  },
  audit: {
    badge: "Stripe Failed Payment Audit",
    headline: "Find the failed-payment leak hiding in Stripe.",
    intro:
      "Estimate what failed payments may be costing you, then request the audit checklist Dunlo uses to review Stripe recovery setups.",
    resultLabel: "Your audit baseline",
    inputTitle: "Start with your estimated MRR",
    resultTitle: "Audit baseline shown immediately",
    formTitle: "Send my Stripe audit checklist",
    formBody:
      "We will send the checklist and the benchmark breakdown so you can review your Stripe setup line by line.",
    submit: "Send my audit checklist",
    success: "Audit checklist requested",
    cta: "Connect Stripe for the real audit",
    methodologyEyebrow: "Audit checklist",
    methodologyTitle:
      "A good Stripe failed payment audit follows the money and the customer path.",
    methodologyBody:
      "Start with the failed invoices in Stripe, then trace what happened next: which decline code appeared, when the next retry was scheduled, whether the customer received a useful email, whether the update link was clear, and whether high-value accounts were escalated before churn became final. The goal is to find recoverable payment failures that are currently treated like generic billing noise.",
    checklistTitle: "What the audit should review",
    checklist: [
      "Confirm Stripe retries, customer emails, and hosted payment update links are enabled for the right billing flows.",
      "Review failure-code-specific messaging for expired cards, insufficient funds, bank blocks, and authentication failures.",
      "Set an escalation threshold so valuable accounts get founder review before an automated sequence gives up.",
    ],
    nextLinks: [
      {
        label: "Stripe dunning workflow",
        href: "/stripe-dunning",
        body: "Map each audit finding to a safer payment recovery sequence.",
      },
      {
        label: "Failed payment recovery",
        href: "/stripe-failed-payments",
        body: "See how Dunlo turns failure codes into recovery actions.",
      },
      {
        label: "Failed payment benchmark",
        href: "/benchmark",
        body: "Estimate the MRR at risk before connecting your Stripe account.",
      },
    ],
  },
} as const;

export function PublicBenchmark({
  variant = "benchmark",
}: PublicBenchmarkProps) {
  const copy = BENCHMARK_COPY[variant];
  const [mrr, setMrr] = useState(24_000);
  const [email, setEmail] = useState("");
  const [captureState, setCaptureState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  const result = useMemo(() => {
    const range = getRange(mrr);
    const failedMrr = Math.round(mrr * (range.failedRate / 100));
    const recoverableMrr = Math.round(failedMrr * BASE_RECOVERY_RATE);
    const annualRecoverable = recoverableMrr * 12;

    return {
      range,
      failedMrr,
      recoverableMrr,
      annualRecoverable,
    };
  }, [mrr]);

  useEffect(() => {
    captureBenchmarkResult(mrr);
  }, []);

  function captureBenchmarkResult(value: number) {
    const range = getRange(value);
    const failedMrr = Math.round(value * (range.failedRate / 100));
    const recoverableMrr = Math.round(failedMrr * BASE_RECOVERY_RATE);

    captureMarketingEvent("tool_result_viewed", {
      tool_name: "stripe_failed_payment_benchmark",
      variant,
      mrr_range: range.label,
      failed_payment_rate: range.failedRate,
      failed_mrr_bucket: moneyBucket(failedMrr),
      recoverable_mrr_bucket: moneyBucket(recoverableMrr),
    });
  }

  function captureMrrChange(value: number) {
    captureMarketingEvent("tool_value_changed", {
      tool_name: "stripe_failed_payment_benchmark",
      field_name: "mrr",
      value_bucket: moneyBucket(value),
      variant,
    });
    captureBenchmarkResult(value);
  }

  async function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCaptureState("submitting");
    const eventProperties = {
      form_type: `${variant}_report`,
      source: variant,
      mrr_range: result.range.label,
      failed_payment_rate: result.range.failedRate,
      failed_mrr_bucket: moneyBucket(result.failedMrr),
      recoverable_mrr_bucket: moneyBucket(result.recoverableMrr),
    };

    captureMarketingEvent("lead_form_submitted", eventProperties);

    try {
      const response = await fetch("/api/benchmark-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          mrr,
          mrrRange: result.range.label,
          failedPaymentRate: result.range.failedRate,
          failedMrr: result.failedMrr,
          recoverableMrr: result.recoverableMrr,
          source: variant,
        }),
      });

      if (!response.ok) throw new Error("Lead capture failed");
      setCaptureState("success");
      captureMarketingEvent("lead_form_succeeded", eventProperties);
    } catch {
      setCaptureState("error");
      captureMarketingEvent("lead_form_failed", {
        form_type: `${variant}_report`,
        source: variant,
      });
    }
  }

  return (
    <div className="min-h-dvh bg-stone-100 font-sans text-zinc-950">
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-32 md:px-6 md:pt-36">
        <section className="grid grid-cols-1 gap-7 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-sm font-semibold text-zinc-600 shadow-sm">
              <Gauge size={15} className="text-dunlo-deep" />
              {copy.badge}
            </div>
            <h1 className="max-w-3xl text-4xl font-bold leading-none tracking-tight text-zinc-950 md:text-6xl">
              {copy.headline}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-600 md:text-lg">
              {copy.intro}
            </p>
          </div>

          <div className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-[0_24px_60px_-34px_rgba(24,24,27,0.3)] md:p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              {copy.resultLabel}
            </p>
            <p className="mt-4 font-mono text-5xl font-bold leading-none tracking-tight text-zinc-950 md:text-6xl">
              {result.range.failedRate.toFixed(1)}%
            </p>
            <p className="mt-4 text-sm leading-relaxed text-zinc-500">
              Average failed payment rate for {result.range.label}.{" "}
              {result.range.note}
            </p>
          </div>
        </section>

        <section className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-[0_22px_56px_-34px_rgba(24,24,27,0.26)] md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-zinc-950">
                  {copy.inputTitle}
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  No email required to see the result.
                </p>
              </div>
              <TrendingUp size={20} className="text-zinc-400" />
            </div>

            <div className="mt-7">
              <div className="flex items-end justify-between gap-4">
                <label
                  htmlFor="mrr"
                  className="text-sm font-semibold text-zinc-700"
                >
                  Monthly recurring revenue
                </label>
                <span className="font-mono text-2xl font-bold text-zinc-950">
                  {formatCurrency(mrr)}
                </span>
              </div>
              <input
                id="mrr"
                type="range"
                min={MIN_MRR}
                max={MAX_MRR}
                step={STEP}
                value={mrr}
                onChange={(event) => setMrr(Number(event.target.value))}
                onPointerUp={(event) =>
                  captureMrrChange(Number(event.currentTarget.value))
                }
                onKeyUp={(event) =>
                  captureMrrChange(Number(event.currentTarget.value))
                }
                className="mt-5 w-full accent-dunlo"
              />
              <div className="mt-2 flex justify-between font-mono text-xs text-zinc-400">
                <span>{formatCompact(MIN_MRR)}</span>
                <span>{formatCompact(MAX_MRR)}</span>
              </div>
            </div>

            <div className="mt-7 rounded-3xl border border-dunlo/20 bg-dunlo/[0.07] p-5">
              <p className="text-sm font-bold text-zinc-950">
                {copy.resultTitle}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                At {result.range.label}, the benchmark estimates{" "}
                <span className="font-mono font-bold text-dunlo-deep">
                  {formatCurrency(result.failedMrr)}
                </span>{" "}
                in failed MRR each month.
              </p>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-[0_22px_56px_-34px_rgba(24,24,27,0.24)]">
              <div className="grid grid-cols-1 divide-y divide-zinc-100 md:grid-cols-3 md:divide-x md:divide-y-0">
                {[
                  {
                    label: "Estimated failed MRR",
                    value: formatCurrency(result.failedMrr),
                    detail: "Revenue already attempted but not collected.",
                  },
                  {
                    label: "Recovery potential",
                    value: formatCurrency(result.recoverableMrr),
                    detail: "Monthly upside with targeted recovery.",
                  },
                  {
                    label: "Annualized upside",
                    value: formatCurrency(result.annualRecoverable),
                    detail: "If the leak repeats for 12 months.",
                  },
                ].map((item) => (
                  <div key={item.label} className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                      {item.label}
                    </p>
                    <p className="mt-3 font-mono text-3xl font-bold tracking-tight text-zinc-950">
                      {item.value}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                      {item.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <form
              onSubmit={submitEmail}
              className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-[0_20px_52px_-34px_rgba(24,24,27,0.24)] md:p-6"
            >
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-dunlo/10 text-dunlo-deep">
                  <Mail size={17} />
                </span>
                <div>
                  <h2 className="text-base font-bold tracking-tight text-zinc-950">
                    {copy.formTitle}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-500">
                    {copy.formBody}
                  </p>
                </div>
              </div>

              <label className="mt-5 block">
                <span className="text-sm font-semibold text-zinc-700">
                  Work email
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="founder@company.com"
                  className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition-colors placeholder:text-zinc-400 focus:border-dunlo focus:ring-2 focus:ring-dunlo/20"
                />
              </label>

              <button
                type="submit"
                disabled={
                  captureState === "submitting" || captureState === "success"
                }
                className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 text-sm font-bold text-white transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-zinc-300"
              >
                {captureState === "success" ? (
                  <>
                    <Check size={15} />
                    {copy.success}
                  </>
                ) : captureState === "submitting" ? (
                  "Sending report request..."
                ) : (
                  copy.submit
                )}
              </button>
              {captureState === "error" && (
                <p className="mt-3 text-sm font-medium text-red-600">
                  Something went wrong. Please try again.
                </p>
              )}
            </form>

            <TrackedLink
              href={SIGNUP_URL}
              eventProperties={{
                button_text: copy.cta,
                destination: SIGNUP_URL,
                location: `${variant}_tool_cta`,
              }}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-dunlo px-5 py-3 text-sm font-bold text-zinc-950 transition-all hover:bg-dunlo-hover active:scale-[0.98]"
            >
              {copy.cta}
              <ArrowRight size={15} />
            </TrackedLink>
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-[0_18px_48px_-34px_rgba(24,24,27,0.22)]">
          <div className="grid grid-cols-1 divide-y divide-zinc-100 md:grid-cols-[0.9fr_1.1fr] md:divide-x md:divide-y-0">
            <div className="p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-dunlo-dim">
                Benchmarks by MRR range
              </p>
              <h2 className="mt-4 max-w-md text-3xl font-bold tracking-tight text-zinc-950">
                Failed payment rates usually rise as card volume grows.
              </h2>
            </div>
            <div className="divide-y divide-zinc-100">
              {BENCHMARK_RANGES.map((range) => (
                <div
                  key={range.label}
                  className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-4"
                >
                  <div>
                    <p className="font-semibold text-zinc-950">{range.label}</p>
                    <p className="mt-1 text-sm text-zinc-500">{range.note}</p>
                  </div>
                  <p className="font-mono text-2xl font-bold text-zinc-950">
                    {range.failedRate.toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_18px_48px_-34px_rgba(24,24,27,0.2)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-dunlo-dim">
              {copy.methodologyEyebrow}
            </p>
            <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight text-zinc-950">
              {copy.methodologyTitle}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-600 md:text-base">
              {copy.methodologyBody}
            </p>
            <ul className="mt-5 space-y-3 border-t border-zinc-100 pt-5">
              {METHODOLOGY_ASSUMPTIONS.map((assumption) => (
                <li
                  key={assumption}
                  className="flex gap-3 text-sm leading-6 text-zinc-600"
                >
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-dunlo" />
                  <span>{assumption}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_18px_48px_-34px_rgba(24,24,27,0.2)] md:p-8">
            <h2 className="text-xl font-bold tracking-tight text-zinc-950">
              {copy.checklistTitle}
            </h2>
            <ul className="mt-5 space-y-4">
              {copy.checklist.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm leading-6 text-zinc-600"
                >
                  <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-dunlo/15 text-dunlo-deep">
                    <Check size={13} />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_18px_48px_-34px_rgba(24,24,27,0.2)] md:p-8">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-950">
            Keep building your Stripe recovery workflow.
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {copy.nextLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-3xl border border-zinc-200 p-5 transition-colors hover:border-dunlo/40"
              >
                <p className="font-semibold text-zinc-950">{item.label}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  {item.body}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
