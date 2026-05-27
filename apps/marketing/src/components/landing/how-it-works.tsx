"use client";

import Link from "next/link";
import { SIGNUP_URL } from "@/lib/app-url";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Check,
  ChevronRight,
  CreditCard,
  MailCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { FadeIn, SectionPill } from "./shared";

const HIW_STEPS = [
  {
    n: "01",
    title: "Connect Stripe",
    kicker: "Data intake",
    body: "Authorize Dunlo with Stripe OAuth so it can monitor payment failures and set up the recovery plumbing around them.",
    Icon: CreditCard,
  },
  {
    n: "02",
    title: "Tune recovery sequences",
    kicker: "Messaging",
    body: "Start with defaults for common failure reasons, then adjust tone, timing, and follow-up windows to match your product.",
    Icon: MailCheck,
  },
  {
    n: "03",
    title: "Monitor recovered revenue",
    kicker: "Visibility",
    body: "Track which payments are pending, recovered, or escalated so recovery becomes visible instead of buried in Stripe events.",
    Icon: BarChart3,
  },
] as const;

const PREVIEW_ROWS = [
  {
    label: "Failed payment",
    value: "€418",
    detail: "card_declined",
  },
  {
    label: "Recovery email",
    value: "2 min",
    detail: "queued",
  },
  {
    label: "Recovered",
    value: "€418",
    detail: "confirmed",
  },
] as const;

const STEP_DURATION = 5900;
const PANEL_TRANSITION = {
  duration: 0.52,
  ease: [0.16, 1, 0.3, 1],
} as const;

export function HowItWorks() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setActive((a) => (a + 1) % HIW_STEPS.length),
      STEP_DURATION,
    );
    return () => clearInterval(t);
  }, []);

  const activeStep = HIW_STEPS[active]!;
  const ActiveIcon = activeStep.Icon;

  return (
    <FadeIn>
      <section
        id="how-it-works"
        className="overflow-hidden rounded-[2rem] bg-gray-950 [overflow-anchor:none] md:rounded-[2.25rem]"
      >
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.045),transparent_44%)]" />
          <div className="relative grid grid-cols-1 gap-10 px-5 py-8 sm:px-8 sm:py-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14 lg:px-14 lg:py-16 xl:px-16">
            <div className="flex flex-col">
              <SectionPill dark>How it works</SectionPill>
              <h2 className="mt-5 max-w-xl text-3xl font-bold leading-tight tracking-tight text-white md:text-5xl md:leading-[0.98]">
                Set up recovery once. Watch every payment move.
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-6 text-white/50 md:text-base">
                Dunlo connects the failed charge, the customer email, and the
                recovered revenue in one simple loop.
              </p>

              <div className="mt-9 space-y-2">
                {HIW_STEPS.map((step, i) => {
                  const isActive = active === i;
                  const StepIcon = step.Icon;
                  return (
                    <button
                      key={step.n}
                      onClick={() => setActive(i)}
                      aria-pressed={isActive}
                      className={`group grid w-full grid-cols-[2.25rem_1fr] gap-4 rounded-2xl border px-4 py-4 text-left transition-all duration-300 active:scale-[0.99] ${
                        isActive
                          ? "border-white/12 bg-white/[0.06]"
                          : "border-transparent hover:bg-white/[0.03]"
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex size-9 items-center justify-center rounded-full border transition-colors ${
                          isActive
                            ? "border-dunlo/30 bg-dunlo/10 text-dunlo"
                            : "border-white/8 bg-white/[0.03] text-white/28"
                        }`}
                      >
                        <StepIcon size={16} strokeWidth={2} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`font-mono text-[11px] font-bold transition-colors ${
                              isActive ? "text-dunlo" : "text-white/25"
                            }`}
                          >
                            {step.n}
                          </span>
                          <span
                            className={`text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors ${
                              isActive ? "text-white/45" : "text-white/24"
                            }`}
                          >
                            {step.kicker}
                          </span>
                        </div>
                        <span
                          className={`mt-1 block text-base font-semibold tracking-tight transition-colors ${
                            isActive ? "text-white" : "text-white/52"
                          }`}
                        >
                          {step.title}
                        </span>
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={PANEL_TRANSITION}
                          >
                            <p className="mt-2 max-w-md text-sm leading-6 text-white/46">
                              {step.body}
                            </p>
                            <div className="mt-4 h-px max-w-sm overflow-hidden rounded-full bg-white/10">
                              <motion.div
                                key={active}
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{
                                  duration: STEP_DURATION / 1000,
                                  ease: "linear",
                                }}
                                style={{ originX: 0 }}
                                className="h-full bg-dunlo"
                              />
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-8 lg:mt-auto lg:pt-10">
                <Link
                  href={SIGNUP_URL}
                  className="inline-flex items-center gap-2 rounded-full bg-dunlo px-6 py-3 text-sm font-semibold text-gray-950 transition-all hover:bg-dunlo-hover active:translate-y-px active:scale-[0.98]"
                >
                  Connect Stripe now
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>

            <div className="relative flex items-center">
              <div className="w-full rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-6 lg:p-8">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">
                      Recovery loop
                    </div>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                      Payment status
                    </h3>
                  </div>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={activeStep.n}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={PANEL_TRANSITION}
                      className="flex size-10 items-center justify-center rounded-full bg-dunlo/12 text-dunlo"
                    >
                      <ActiveIcon size={18} />
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="mt-8 divide-y divide-white/8">
                  {PREVIEW_ROWS.map((row, i) => {
                    const isPast = i <= active;
                    return (
                      <div
                        key={row.label}
                        className="grid grid-cols-[1fr_auto] items-center gap-4 py-4 first:pt-0 last:pb-0"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex size-7 items-center justify-center rounded-full border ${
                              isPast
                                ? "border-dunlo/30 bg-dunlo/12 text-dunlo"
                                : "border-white/10 text-white/28"
                            }`}
                          >
                            {isPast ? (
                              <Check size={13} strokeWidth={2} />
                            ) : (
                              <span className="size-1.5 rounded-full bg-white/24" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white/80">
                              {row.label}
                            </div>
                            <div className="mt-0.5 font-mono text-xs text-white/32">
                              {row.detail}
                            </div>
                          </div>
                        </div>
                        <div
                          className={`font-mono text-sm font-semibold ${
                            isPast ? "text-white" : "text-white/35"
                          }`}
                        >
                          {row.value}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3 border-t border-white/8 pt-5">
                  <div>
                    <div className="font-mono text-2xl font-bold text-dunlo">
                      €4,817
                    </div>
                    <div className="mt-1 text-xs text-white/38">Recovered</div>
                  </div>
                  <div>
                    <div className="font-mono text-2xl font-bold text-white">
                      27.4%
                    </div>
                    <div className="mt-1 text-xs text-white/38">
                      Recovery rate
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </FadeIn>
  );
}
