"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  MailCheck,
  ShieldCheck,
} from "lucide-react";
import { SIGNUP_URL } from "@/lib/app-url";
import { captureMarketingEvent } from "@/lib/posthog";

type AccountType = "selfServe" | "highTouch" | "enterprise";
type FailureReason =
  | "expired_card"
  | "insufficient_funds"
  | "authentication_required"
  | "do_not_honor"
  | "generic_decline";

const accountOptions = [
  { value: "selfServe", label: "Self-serve SaaS" },
  { value: "highTouch", label: "High-touch SaaS" },
  { value: "enterprise", label: "Enterprise account" },
] as const satisfies readonly { value: AccountType; label: string }[];

const failureOptions = [
  { value: "expired_card", label: "expired_card" },
  { value: "insufficient_funds", label: "insufficient_funds" },
  { value: "authentication_required", label: "authentication_required" },
  { value: "do_not_honor", label: "do_not_honor" },
  { value: "generic_decline", label: "generic_decline" },
] as const satisfies readonly { value: FailureReason; label: string }[];

const reasonAdvice: Record<
  FailureReason,
  { headline: string; firstAction: string; retry: string; final: string }
> = {
  expired_card: {
    headline: "Ask for a card update immediately.",
    firstAction:
      "Send a calm update-card email with a Stripe-hosted billing link.",
    retry: "Retry only after the customer updates the card, or after a gentle reminder.",
    final: "Pause access only after the customer had a clear update path.",
  },
  insufficient_funds: {
    headline: "Give the payment time before pushing hard.",
    firstAction:
      "Explain that you will retry later and keep an optional update link available.",
    retry:
      "Wait 2-3 days before the next attempt so payroll, card limits, or balances can change.",
    final: "Escalate softly before the final retry if the account is valuable.",
  },
  authentication_required: {
    headline: "The customer needs to complete authentication.",
    firstAction:
      "Send a direct action email explaining that the bank needs approval.",
    retry: "Do not rely on blind retries until the customer completes the SCA step.",
    final: "Final notice should focus on completing bank approval, not replacing the card.",
  },
  do_not_honor: {
    headline: "Give context before another retry.",
    firstAction:
      "Tell the customer their bank did not approve the subscription charge.",
    retry:
      "Retry after they approve the merchant with the bank or add another card.",
    final: "Escalate high-value accounts manually because the bank reason is vague.",
  },
  generic_decline: {
    headline: "Keep the message conservative.",
    firstAction:
      "Tell the customer the payment did not go through and offer a secure billing link.",
    retry:
      "Use a spaced retry pattern and ask for a different card if the decline repeats.",
    final: "Avoid over-explaining a bank decision you cannot see.",
  },
};

function dayLabel(day: number) {
  if (day === 0) return "Day 0";
  return `Day ${day}`;
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function StripeDunningScheduleCalculator() {
  const [accountType, setAccountType] = useState<AccountType>("highTouch");
  const [invoiceAmount, setInvoiceAmount] = useState(129);
  const [failureReason, setFailureReason] =
    useState<FailureReason>("insufficient_funds");
  const [recoveryWindow, setRecoveryWindow] = useState(14);

  const plan = useMemo(() => {
    const advice = reasonAdvice[failureReason];
    const isHighValue =
      accountType === "enterprise" ||
      accountType === "highTouch" ||
      invoiceAmount >= 250;
    const midPoint = recoveryWindow >= 21 ? 7 : recoveryWindow >= 14 ? 5 : 3;
    const escalationDay = isHighValue ? Math.max(midPoint, 4) : recoveryWindow;
    const retryDay =
      failureReason === "insufficient_funds"
        ? Math.min(3, midPoint)
        : failureReason === "expired_card" ||
            failureReason === "authentication_required"
          ? Math.min(2, midPoint)
          : Math.min(4, midPoint);

    return {
      advice,
      isHighValue,
      recoverableLabel:
        invoiceAmount >= 500
          ? "High revenue risk"
          : invoiceAmount >= 100
            ? "Worth a careful sequence"
            : "Keep the flow light",
      timeline: [
        {
          day: 0,
          title: "First recovery email",
          copy: advice.firstAction,
          tag: "send now",
        },
        {
          day: retryDay,
          title:
            failureReason === "expired_card" ||
            failureReason === "authentication_required"
              ? "Action reminder"
              : "Timed retry",
          copy: advice.retry,
          tag: "retry window",
        },
        {
          day: escalationDay,
          title: isHighValue ? "Founder escalation" : "Second reminder",
          copy: isHighValue
            ? "Send a short personal note before the account becomes silent churn."
            : "Send a short reminder with the same secure billing path.",
          tag: isHighValue ? "manual review" : "reminder",
        },
        {
          day: recoveryWindow,
          title: "Final notice",
          copy: advice.final,
          tag: "final step",
        },
      ],
    };
  }, [accountType, failureReason, invoiceAmount, recoveryWindow]);

  function captureToolChange(fieldName: string, value: string | number) {
    captureMarketingEvent("tool_value_changed", {
      tool_name: "stripe_dunning_schedule_calculator",
      field_name: fieldName,
      value_bucket: String(value),
    });
  }

  return (
    <section className="mx-auto grid max-w-6xl grid-cols-1 gap-5 lg:grid-cols-[0.82fr_1.18fr]">
      <div className="rounded-[2rem] border border-gray-200 bg-white/80 p-6 backdrop-blur-md md:p-8">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
          Build your schedule
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight">
          Stripe dunning schedule calculator
        </h2>
        <p className="mt-4 text-sm leading-6 text-gray-600">
          Choose the account type, invoice amount, failure reason, and recovery
          window. The calculator turns that into a practical sequence for
          customer emails, retries, escalation, and final notice.
        </p>

        <div className="mt-7 space-y-5">
          <label className="block">
            <span className="text-sm font-bold text-gray-950">
              Account type
            </span>
            <select
              value={accountType}
              onChange={(event) => {
                setAccountType(event.target.value as AccountType);
                captureToolChange("account_type", event.target.value);
              }}
              className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-950 outline-none transition-colors focus:border-dunlo"
            >
              {accountOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-bold text-gray-950">
              Failed invoice amount
            </span>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="range"
                min={19}
                max={1200}
                step={10}
                value={invoiceAmount}
                onChange={(event) => setInvoiceAmount(Number(event.target.value))}
                onPointerUp={(event) => {
                  const value = Number(event.currentTarget.value);
                  captureToolChange(
                    "invoice_amount",
                    value < 100 ? "<$100" : value < 500 ? "$100-$500" : "$500+",
                  );
                }}
                onKeyUp={(event) => {
                  const value = Number(event.currentTarget.value);
                  captureToolChange(
                    "invoice_amount",
                    value < 100 ? "<$100" : value < 500 ? "$100-$500" : "$500+",
                  );
                }}
                className="h-2 flex-1 accent-dunlo"
              />
              <input
                type="number"
                min={1}
                value={invoiceAmount}
                onChange={(event) => {
                  const value = Math.max(1, Number(event.target.value) || 1);
                  setInvoiceAmount(value);
                  captureToolChange(
                    "invoice_amount",
                    value < 100 ? "<$100" : value < 500 ? "$100-$500" : "$500+",
                  );
                }}
                className="h-12 w-28 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-950 outline-none transition-colors focus:border-dunlo"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-bold text-gray-950">
              Stripe failure reason
            </span>
            <select
              value={failureReason}
              onChange={(event) => {
                setFailureReason(event.target.value as FailureReason);
                captureToolChange("failure_reason", event.target.value);
              }}
              className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-3 font-mono text-sm font-semibold text-gray-950 outline-none transition-colors focus:border-dunlo"
            >
              {failureOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-bold text-gray-950">
              Recovery window
            </span>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[7, 14, 21].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => {
                    setRecoveryWindow(days);
                    captureToolChange("recovery_window", `${days}_days`);
                  }}
                  className={`h-11 rounded-full border px-3 text-sm font-bold transition-all ${
                    recoveryWindow === days
                      ? "border-gray-950 bg-gray-950 text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:border-dunlo/40"
                  }`}
                >
                  {days} days
                </button>
              ))}
            </div>
          </label>
        </div>
      </div>

      <div className="rounded-[2rem] border border-gray-200 bg-white/80 p-6 backdrop-blur-md md:p-8">
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
              Recommended sequence
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              {plan.advice.headline}
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              {money(invoiceAmount)} failed invoice - {plan.recoverableLabel}
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-dunlo/25 bg-dunlo/10 px-3 py-1.5 text-xs font-bold text-dunlo-deep">
            <BadgeCheck size={14} strokeWidth={2.2} />
            {plan.isHighValue ? "escalate" : "automate"}
          </span>
        </div>

        <div className="mt-6 space-y-3">
          {plan.timeline.map((step) => (
            <article
              key={`${step.day}-${step.title}`}
              className="grid grid-cols-[84px_1fr] gap-4 rounded-[1.35rem] border border-gray-200 bg-white p-4"
            >
              <div>
                <p className="font-mono text-sm font-bold text-gray-950">
                  {dayLabel(step.day)}
                </p>
                <p className="mt-2 w-fit rounded-full border border-dunlo/20 bg-dunlo/[0.07] px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-dunlo-deep">
                  {step.tag}
                </p>
              </div>
              <div>
                <h3 className="font-bold tracking-tight text-gray-950">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {step.copy}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: "Email", icon: MailCheck },
            { label: "Retry", icon: CalendarClock },
            { label: "Secure link", icon: ShieldCheck },
          ].map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="rounded-xl border border-dunlo/20 bg-dunlo/[0.07] p-3"
            >
              <Icon size={17} className="text-dunlo-deep" />
              <p className="mt-2 text-sm font-bold text-gray-950">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <a
            href={SIGNUP_URL}
            onClick={() =>
              captureMarketingEvent("cta_clicked", {
                button_text: "Automate this in Dunlo",
                destination: SIGNUP_URL,
                location: "stripe_dunning_schedule_calculator",
              })
            }
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gray-950 px-6 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-px hover:bg-gray-800 active:scale-[0.98]"
          >
            Automate this in Dunlo
            <ArrowRight size={16} strokeWidth={1.8} />
          </a>
          <Link
            href="/stripe-failed-payment-recovery-software"
            className="inline-flex h-12 items-center justify-center rounded-full border border-gray-300 px-6 text-sm font-semibold text-gray-800 transition-all duration-300 hover:-translate-y-px hover:border-gray-950 active:scale-[0.98]"
          >
            See recovery software
          </Link>
        </div>
      </div>
    </section>
  );
}
