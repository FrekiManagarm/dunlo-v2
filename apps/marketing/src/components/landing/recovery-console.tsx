"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, CreditCard, MailCheck, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { LogoMark } from "@/components/logo";

const RECOVERY_STEPS = [
  {
    eyebrow: "Stripe event",
    title: "Payment failed",
    detail: "invoice.payment_failed",
    metric: "$1,860",
    badge: "insufficient_funds",
    icon: CreditCard,
  },
  {
    eyebrow: "Dunlo decision",
    title: "Softer recovery path",
    detail: "Wait 36h, then send a plain payment update email.",
    metric: "36h",
    badge: "timed",
    icon: RefreshCcw,
  },
  {
    eyebrow: "Outcome",
    title: "Customer recovered",
    detail: "Retry window stays open and the customer keeps access.",
    metric: "$1,860",
    badge: "protected",
    icon: Check,
  },
] as const;

const RECOVERY_PHASES = [
  {
    status: "Reading",
    emailBadge: "waiting",
    emailTone: "Reading the failure reason before writing.",
  },
  {
    status: "Choosing",
    emailBadge: "matched",
    emailTone: "Softer payment copy selected for this decline.",
  },
  {
    status: "Sending",
    emailBadge: "queued",
    emailTone: "Timed with a secure payment update link.",
  },
  {
    status: "Recovered",
    emailBadge: "protected",
    emailTone: "Payment updated. Access stays open.",
  },
] as const;

export function RecoveryConsole() {
  const shouldReduceMotion = useReducedMotion();
  const [activePhase, setActivePhase] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion) {
      setActivePhase(3);
      return;
    }

    const interval = window.setInterval(() => {
      setActivePhase((phase) => (phase + 1) % RECOVERY_PHASES.length);
    }, 2350);

    return () => window.clearInterval(interval);
  }, [shouldReduceMotion]);

  const activeStep = activePhase < 2 ? activePhase : activePhase === 3 ? 2 : -1;
  const currentPhase = RECOVERY_PHASES[activePhase]!;

  return (
    <div className="relative mx-auto w-full max-w-125 overflow-hidden rounded-[2rem] border border-gray-200 bg-white/86 p-3 shadow-[0_35px_90px_-58px_rgba(28,25,23,0.72)] backdrop-blur-md">
      <div
        className="absolute inset-0 bg-[linear-gradient(rgba(17,24,39,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(17,24,39,0.035)_1px,transparent_1px)] bg-size-[34px_34px]"
        aria-hidden
      />
      <div className="absolute inset-0 bg-dunlo/[0.04]" aria-hidden />

      <motion.div className="relative overflow-hidden rounded-[1.7rem] border border-gray-100 bg-white p-5 text-gray-950 shadow-[0_30px_70px_-52px_rgba(28,25,23,0.78)]">
        <div className="absolute inset-x-0 top-0 h-px bg-white" aria-hidden />
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LogoMark size={30} />
            <div>
              <p className="text-sm font-semibold">Recovery map</p>
              <p className="text-xs text-gray-400">
                One failed payment, one clear path
              </p>
            </div>
          </div>
          <span className="flex min-w-26 items-center gap-2 rounded-full bg-dunlo/10 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-dunlo-deep">
            <span className="relative size-1.5 rounded-full bg-dunlo">
              <AnimatePresence>
                {!shouldReduceMotion && (
                  <motion.span
                    key={activePhase}
                    initial={{ opacity: 0.45, scale: 1 }}
                    animate={{ opacity: 0, scale: 3.2 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.12, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 rounded-full bg-dunlo"
                  />
                )}
              </AnimatePresence>
            </span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={currentPhase.status}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                {currentPhase.status}
              </motion.span>
            </AnimatePresence>
          </span>
        </div>

        <div className="mt-5 grid gap-3">
          {RECOVERY_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isFinal = index === RECOVERY_STEPS.length - 1;
            const isActive = activeStep === index;
            const isComplete =
              index === 0
                ? activePhase > 0
                : index === 1
                  ? activePhase > 1
                  : activePhase === 3;

            return (
              <div key={step.title} className="relative">
                {!isFinal && (
                  <span
                    className="absolute left-8 top-full hidden h-3 w-px overflow-hidden bg-gray-200 sm:block"
                    aria-hidden
                  >
                    <motion.span
                      initial={false}
                      animate={{ scaleY: activePhase > index ? 1 : 0 }}
                      transition={{ duration: 0.54, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-0 origin-top bg-dunlo"
                      aria-hidden
                    />
                  </span>
                )}
                <motion.div
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.56,
                    delay: 0.2 + index * 0.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={`relative grid gap-3 overflow-hidden rounded-[1.35rem] border p-3 transition-colors duration-300 sm:grid-cols-[auto_1fr_auto] sm:items-center ${
                    isActive
                      ? "border-dunlo/35 bg-dunlo/8"
                      : isComplete
                        ? "border-gray-100 bg-white"
                        : "border-gray-100 bg-stone-50/80"
                  }`}
                >
                  <AnimatePresence>
                    {isActive && !shouldReduceMotion && (
                      <motion.span
                        key={`active-sheen-${index}-${activePhase}`}
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.12, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute inset-y-0 w-full bg-linear-to-r from-transparent from-35% via-white/75 via-50% to-transparent to-65%"
                        aria-hidden
                      />
                    )}
                  </AnimatePresence>
                  <motion.span
                    animate={{ scale: isActive ? 1.04 : 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className={`relative flex size-10 items-center justify-center rounded-full ${
                      isComplete
                        ? "bg-dunlo text-white"
                        : "border border-gray-200 bg-white text-gray-700"
                    }`}
                  >
                    {isActive && !shouldReduceMotion && (
                      <motion.span
                        layoutId="active-step-ring"
                        className="absolute -inset-2 rounded-full border border-dunlo/35"
                        transition={{ type: "spring", stiffness: 220, damping: 24 }}
                        aria-hidden
                      />
                    )}
                    <Icon size={17} strokeWidth={1.8} />
                  </motion.span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                        {step.eyebrow}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] ${
                          isFinal && isComplete
                            ? "bg-dunlo/10 text-dunlo-deep"
                            : "bg-white text-gray-500"
                        }`}
                      >
                        {step.badge}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-semibold tracking-tight text-gray-950">
                      {step.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-5 text-gray-500">
                      {step.detail}
                    </p>
                  </div>
                  <p
                    className={`font-mono text-xl font-semibold tracking-tight ${
                      isComplete && isFinal ? "text-dunlo-deep" : "text-gray-950"
                    }`}
                  >
                    {isComplete && isFinal ? (
                      <motion.span
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
                      >
                        {step.metric}
                      </motion.span>
                    ) : (
                      step.metric
                    )}
                  </p>
                </motion.div>
              </div>
            );
          })}
        </div>

        <motion.div
          animate={{ scale: activePhase === 2 ? 1.015 : 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
          className={`mt-4 rounded-[1.35rem] border bg-gray-950 p-4 text-white transition-colors duration-300 ${
            activePhase === 2 ? "border-dunlo/40" : "border-gray-100"
          }`}
        >
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <MailCheck size={15} strokeWidth={1.8} className="shrink-0 text-dunlo" />
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
                  Recovery email
                </p>
              </div>
              <p className="mt-3 text-sm font-semibold leading-5">
                Your payment did not go through
              </p>
              <p className="mt-1 max-w-sm text-xs leading-5 text-white/55">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={currentPhase.emailTone}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {currentPhase.emailTone}
                  </motion.span>
                </AnimatePresence>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <span className="inline-flex min-w-22 items-center gap-1.5 rounded-full bg-dunlo/15 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-dunlo">
                <span className="size-1.5 rounded-full bg-dunlo" />
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={currentPhase.emailBadge}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {currentPhase.emailBadge}
                  </motion.span>
                </AnimatePresence>
              </span>
              <motion.span
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center rounded-full bg-dunlo px-3 py-1.5 text-xs font-semibold text-white"
              >
                Update payment
              </motion.span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
