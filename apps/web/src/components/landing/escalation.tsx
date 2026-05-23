import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronRight,
  CreditCard,
  RefreshCw,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { FadeIn, SectionPill } from "./shared";

const ESCALATION_STEPS = [
  {
    label: "Stripe failed",
    detail: "Payment failed — €956 — Northstar Ledger",
    icon: CreditCard,
  },
  {
    label: "Dunlo flagged",
    detail: "High-value failure. Threshold €500 exceeded.",
    icon: Sparkles,
  },
  {
    label: "Draft AI",
    detail: "Personal founder email generated from Stripe context.",
    icon: RefreshCw,
  },
  {
    label: "Founder review",
    detail: "Mathieu reviews the note and sends it.",
    icon: Send,
  },
  {
    label: "Recovered",
    detail: "Email sent. Payment status recovered.",
    icon: Check,
  },
] as const;

const DRAFT =
  "Hi Lucas, I saw that the €956 payment for Northstar Ledger did not go through today. I wanted to reach out personally instead of sending the usual automated reminder. Here is the secure link if you want to update the payment method.";

function EscalationDraft() {
  const shouldReduceMotion = useReducedMotion();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion) {
      setActiveStep(ESCALATION_STEPS.length - 1);
      return;
    }

    const interval = window.setInterval(() => {
      setActiveStep((step) => (step + 1) % ESCALATION_STEPS.length);
    }, 1850);

    return () => window.clearInterval(interval);
  }, [shouldReduceMotion]);

  const currentStep = ESCALATION_STEPS[activeStep];
  const draftText =
    activeStep < 2
      ? ""
      : activeStep === 2
        ? `${DRAFT.slice(0, 124)}...`
        : DRAFT;
  const CurrentIcon = currentStep.icon;

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-gray-200/70 bg-white shadow-[0_24px_70px_-52px_rgba(17,24,39,0.45)]">
      <div className="border-b border-gray-100 bg-gray-50 px-4 py-3.5 md:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
              High-value failure
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
              <h3 className="text-base font-bold tracking-tight text-gray-900">
                Lucas Fontaine
              </h3>
              <span className="text-xs font-medium text-gray-400">
                Northstar Ledger
              </span>
            </div>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-full border border-dunlo/25 bg-dunlo/10 px-3 py-1.5">
            <motion.span
              animate={{ opacity: [0.35, 1, 0.35], scale: [1, 1.24, 1] }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="size-1.5 rounded-full bg-dunlo"
            />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-dunlo-deep">
              {activeStep === 4 ? "recovered" : currentStep.label}
            </span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-gray-200 bg-white px-3 py-2">
            <p className="font-mono text-xl font-bold text-dunlo">€956</p>
            <p className="text-[11px] font-medium text-gray-400">
              failed payment
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white px-3 py-2">
            <p className="font-mono text-xl font-bold text-gray-900">€500</p>
            <p className="text-[11px] font-medium text-gray-400">threshold</p>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-5">
        <div className="grid grid-cols-5 gap-1.5">
          {ESCALATION_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = activeStep === index;
            const isDone = activeStep > index || activeStep === 4;

            return (
              <motion.div
                key={step.label}
                layout
                className={`relative flex min-w-0 flex-col items-center gap-1.5 rounded-xl border px-1.5 py-2 text-center transition-colors ${
                  isActive
                    ? "border-dunlo/35 bg-dunlo/8"
                    : isDone
                      ? "border-gray-100 bg-white"
                      : "border-gray-100 bg-gray-50"
                }`}
              >
                <span
                  className={`flex size-8 items-center justify-center rounded-full ${
                    isDone
                      ? "bg-dunlo text-white"
                      : "border border-gray-200 bg-white text-gray-500"
                  }`}
                >
                  <Icon size={15} strokeWidth={1.8} />
                </span>
                <p className="w-full truncate text-[10px] font-bold tracking-tight text-gray-900">
                  {step.label}
                </p>
                {isActive && !shouldReduceMotion && (
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1.68, ease: "linear" }}
                    className="absolute inset-x-2 bottom-1 h-0.5 origin-left rounded-full bg-dunlo"
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={currentStep.detail}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-3 rounded-full border border-gray-100 bg-gray-50 px-3 py-2 text-center text-xs font-medium text-gray-500"
          >
            {currentStep.detail}
          </motion.p>
        </AnimatePresence>

        <motion.div
          layout
          className="mt-3 overflow-hidden rounded-[1.35rem] border border-gray-200 bg-white p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                AI-drafted founder email
              </p>
              <h3 className="mt-1.5 text-xl font-bold tracking-tight text-gray-900">
                {activeStep < 2
                  ? "Waiting for signal"
                  : activeStep === 4
                    ? "Recovered"
                    : "Ready to review"}
              </h3>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={currentStep.label}
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-dunlo/10 text-dunlo-deep"
              >
                <CurrentIcon size={17} strokeWidth={1.8} />
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="mt-4 space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Subject
            </p>
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-900">
              Quick note about your Northstar Ledger payment
            </div>
          </div>

          <div className="mt-3 min-h-28 rounded-[1.1rem] border border-gray-100 bg-gray-50 p-3 text-xs leading-6 text-gray-700">
            <AnimatePresence mode="wait" initial={false}>
              {draftText ? (
                <motion.p
                  key={draftText}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
                >
                  {draftText}
                  {activeStep === 2 && (
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="ml-0.5 inline-block h-4 w-1 translate-y-0.5 rounded-full bg-dunlo"
                    />
                  )}
                </motion.p>
              ) : (
                <motion.div
                  key="skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2 pt-1"
                >
                  <div className="h-2.5 w-4/5 rounded-full bg-gray-200" />
                  <div className="h-2.5 w-full rounded-full bg-gray-200" />
                  <div className="h-2.5 w-3/5 rounded-full bg-gray-200" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_1.15fr]">
          <button className="inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold text-gray-400 transition-all hover:bg-gray-50 hover:text-gray-600 active:scale-[0.98]">
            <X size={14} />
            Dismiss
          </button>
          <button className="inline-flex items-center justify-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 transition-all hover:bg-gray-50 active:scale-[0.98]">
            <RefreshCw size={14} />
            Regenerate
          </button>
          <button
            className={`inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all active:scale-[0.98] ${
              activeStep >= 3
                ? "bg-dunlo text-white hover:bg-dunlo-hover"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {activeStep === 4 ? <Check size={14} /> : <Send size={14} />}
            {activeStep === 4 ? "Sent" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Escalation() {
  return (
    <FadeIn>
      <section
        id="escalation"
        className="scroll-mt-24 overflow-hidden rounded-3xl border border-gray-200/60 bg-white"
      >
        <div className="grid gap-8 px-6 py-8 md:px-10 md:py-12 lg:grid-cols-[1fr_0.86fr] lg:items-center lg:gap-12">
          <div>
            <SectionPill>Escalate</SectionPill>
            <h2 className="mt-6 max-w-3xl text-4xl font-bold leading-[0.98] tracking-tight text-gray-900 md:text-6xl">
              Automate routine failures. Keep the founder touch for meaningful
              revenue.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-gray-500">
              Set a threshold for the accounts that deserve a human moment.
              When a failed payment crosses it, Dunlo pauses the sequence and
              drafts a founder email using the Stripe context, payment value,
              and customer record.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gray-900 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-gray-700 active:scale-[0.98]"
              >
                Review an escalation draft
                <ChevronRight size={14} />
              </Link>
              <a
                href="#pricing"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition-all hover:bg-gray-50 active:scale-[0.98]"
              >
                See beta pricing
                <ArrowRight size={14} />
              </a>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.56, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto w-full max-w-[480px] lg:justify-self-end"
          >
            <EscalationDraft />
          </motion.div>
        </div>
      </section>
    </FadeIn>
  );
}
