"use client";

import { TrackedLink } from "@/components/tracked-link";
import { SIGNUP_URL } from "@/lib/app-url";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Check,
  CreditCard,
  MailCheck,
  Radar,
  Route,
} from "lucide-react";
import { useState } from "react";

const steps = [
  {
    n: "01",
    label: "Connect Stripe",
    title: "Dunlo reads failed charges as they happen.",
    body: "Stripe OAuth brings in invoice, customer, payment intent, and decline reason context.",
    icon: CreditCard,
  },
  {
    n: "02",
    label: "Choose the path",
    title: "Each failure reason gets its own move.",
    body: "Expired cards, bank approvals, insufficient funds, and hard declines do not share one generic email.",
    icon: Route,
  },
  {
    n: "03",
    label: "Recover or review",
    title: "Simple cases run. Sensitive accounts pause.",
    body: "Dunlo either sends the recovery sequence or waits for a founder review when the account is worth it.",
    icon: MailCheck,
  },
] as const;

const rows = [
  ["invoice.payment_failed", "caught", "now"],
  ["authentication_required", "mapped", "SCA path"],
  ["founder_threshold", "paused", "founder rule"],
  ["payment_method_updated", "recovered", "update confirmed"],
] as const;

export function HowItWorks() {
  const [active, setActive] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const activeStep = steps[active]!;
  const ActiveIcon = activeStep.icon;

  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 overflow-hidden rounded-2xl border border-dunlo-line bg-white"
    >
      <div className="grid gap-0 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="border-b border-gray-200 p-6 md:p-9 lg:border-b-0 lg:border-r">
          <p className="text-sm font-semibold text-dunlo-deep">
            How it works
          </p>
          <h2 className="mt-4 max-w-md text-4xl font-semibold leading-none tracking-tight text-gray-950 md:text-6xl">
            One Stripe event becomes a recovery path.
          </h2>
          <p className="mt-5 max-w-[56ch] text-base leading-7 text-gray-600">
            Dunlo keeps the setup short, then makes every failed payment visible
            as it moves from signal to message to recovered revenue.
          </p>
          <TrackedLink
            href={SIGNUP_URL}
            eventProperties={{
              button_text: "Start free in beta",
              destination: SIGNUP_URL,
              location: "homepage_how_it_works",
            }}
            className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-dunlo px-5 text-sm font-semibold text-dunlo-ink transition-colors hover:bg-dunlo-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dunlo-deep focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Start free in beta
            <ArrowRight size={16} aria-hidden />
          </TrackedLink>
        </div>

        <div className="bg-stone-50 p-4 md:p-7">
          <div className="grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
            <div className="space-y-3">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = active === index;

                return (
                  <button
                    key={step.n}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActive(index)}
                    className={`min-h-11 w-full rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dunlo-deep ${
                      isActive
                        ? "border-dunlo-deep bg-dunlo/10"
                        : "border-dunlo-line bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex size-9 items-center justify-center rounded-full ${
                            isActive
                              ? "bg-dunlo text-dunlo-ink"
                              : "border border-gray-200 bg-gray-50 text-gray-500"
                          }`}
                        >
                          <Icon size={17} strokeWidth={2} aria-hidden />
                        </span>
                        <span className="font-mono text-xs font-semibold text-gray-500">
                          {step.n}
                        </span>
                      </div>
                      {isActive && (
                        <span className="h-px w-12 bg-dunlo/50" />
                      )}
                    </div>
                    <p className="mt-4 text-lg font-semibold tracking-tight text-gray-950">
                      {step.label}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      {step.body}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 md:p-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500">
                    Example product preview
                  </p>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.h3
                      key={activeStep.title}
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
                      transition={{
                        duration: shouldReduceMotion ? 0 : 0.28,
                      }}
                      className="mt-2 max-w-lg text-2xl font-semibold tracking-tight text-gray-950"
                    >
                      {activeStep.title}
                    </motion.h3>
                  </AnimatePresence>
                </div>
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-dunlo/12 text-dunlo-deep">
                  <ActiveIcon size={19} strokeWidth={2} aria-hidden />
                </span>
              </div>

              <div className="mt-5 rounded-xl bg-gray-950 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radar size={17} strokeWidth={2} className="text-dunlo" aria-hidden />
                    <span className="font-mono text-xs font-semibold text-white/75">
                      stripe_event_stream
                    </span>
                  </div>
                  <span className="rounded-full bg-dunlo/12 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-dunlo">
                    Example
                  </span>
                </div>

                <div className="mt-4 divide-y divide-white/10">
                  {rows.map(([event, status, detail], index) => {
                    const isDone = index <= active + 1;
                    return (
                      <div
                        key={event}
                        className="grid grid-cols-[1fr_auto_auto] items-center gap-3 py-3 first:pt-0 last:pb-0"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-mono text-xs font-semibold text-white/80">
                            {event}
                          </p>
                          <p className="mt-1 text-xs text-white/75">
                            {detail}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            isDone
                              ? "bg-dunlo/12 text-dunlo"
                              : "bg-white/10 text-white/75"
                          }`}
                        >
                          {status}
                        </span>
                        <span
                          className={`flex size-6 items-center justify-center rounded-full ${
                            isDone
                              ? "bg-dunlo text-dunlo-ink"
                              : "bg-white/10"
                          }`}
                        >
                          {isDone && <Check size={13} strokeWidth={2} aria-hidden />}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {["OAuth", "Sequences", "Revenue"].map((label) => (
                  <div key={label} className="rounded-2xl bg-gray-50 p-3">
                    <p className="font-mono text-sm font-semibold text-gray-950">
                      {label}
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-gray-500">
                      connected
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
