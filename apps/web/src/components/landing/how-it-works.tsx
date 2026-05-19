import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronRight, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { FadeIn, SectionPill } from "./shared";

function MockupConnect() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/5 px-4 py-3">
        <div className="flex size-8 items-center justify-center rounded-lg bg-[#635bff]">
          <span className="text-sm font-bold text-white">S</span>
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-white">stripe.com</div>
          <div className="text-xs text-white/40">Awaiting authorization…</div>
        </div>
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          className="size-2 rounded-full bg-dunlo"
        />
      </div>
      <div className="space-y-2.5 rounded-xl border border-white/8 bg-white/5 p-4">
        <div className="mb-3 text-xs text-white/40">
          Requesting read-only access to
        </div>
        {["Payment Intents", "Customers", "Charges", "Subscriptions"].map(
          (item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: i * 0.15 + 0.3,
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex items-center gap-2"
            >
              <Check size={12} className="shrink-0 text-dunlo" />
              <span className="text-sm text-white/70">{item}</span>
            </motion.div>
          ),
        )}
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="w-full rounded-xl bg-dunlo py-2.5 text-sm font-semibold text-gray-900"
      >
        Authorize Dunlo
      </motion.button>
    </div>
  );
}

function MockupSequences() {
  const emails = [
    {
      delay: "Immediately",
      subject: "Quick note about your payment",
      tag: "High priority",
    },
    {
      delay: "After 3 days",
      subject: "Still want to continue?",
      tag: "Follow-up",
    },
    {
      delay: "After 7 days",
      subject: "Last chance — update your card",
      tag: "Final",
    },
  ];
  return (
    <div className="space-y-2">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs text-white/40">
          Card declined — recovery sequence
        </span>
        <span className="rounded-full bg-dunlo/15 px-2 py-0.5 text-xs text-dunlo">
          Active
        </span>
      </div>
      {emails.map((email, i) => (
        <motion.div
          key={email.delay}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: i * 0.18,
            duration: 0.45,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="flex gap-3"
        >
          <div className="flex flex-col items-center pt-1.5">
            <div className="size-2 shrink-0 rounded-full bg-dunlo" />
            {i < emails.length - 1 && (
              <div
                className="mt-1 w-px flex-1 bg-dunlo/20"
                style={{ minHeight: "2rem" }}
              />
            )}
          </div>
          <div className="mb-2 flex-1 rounded-xl border border-white/8 bg-white/5 p-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-dunlo/80">{email.delay}</span>
              <span className="text-xs text-white/25">{email.tag}</span>
            </div>
            <div className="text-sm text-white/80">{email.subject}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function MockupDashboard() {
  const rows = [
    { name: "acmecorp.io", amount: "€299", recovered: true },
    { name: "finstack.dev", amount: "€149", recovered: false },
    { name: "buildfast.io", amount: "€499", recovered: true },
    { name: "launchly.co", amount: "€89", recovered: true },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/8 bg-white/5 p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="font-mono text-2xl font-bold text-dunlo">
              €4,820
            </div>
            <div className="mt-0.5 text-xs text-white/40">
              Recovered this month
            </div>
          </motion.div>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/5 p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-1 font-mono text-2xl font-bold text-white">
              <TrendingUp size={18} className="text-dunlo" />
              23%
            </div>
            <div className="mt-0.5 text-xs text-white/40">Recovery rate</div>
          </motion.div>
        </div>
      </div>
      <div className="rounded-xl border border-white/8 bg-white/5">
        {rows.map((row, i) => (
          <motion.div
            key={row.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 + 0.35 }}
            className="flex items-center justify-between border-t border-white/5 px-4 py-2.5 first:border-t-0"
          >
            <span className="text-sm text-white/60">{row.name}</span>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-white/80">
                {row.amount}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  row.recovered
                    ? "bg-dunlo/15 text-dunlo"
                    : "bg-white/5 text-white/35"
                }`}
              >
                {row.recovered ? "recovered" : "pending"}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const HIW_STEPS = [
  {
    n: "01",
    title: "Connect Stripe",
    body: "Authorize Dunlo with Stripe OAuth so it can read payment failures, customers, charges, and subscriptions for recovery context.",
    Mockup: MockupConnect,
  },
  {
    n: "02",
    title: "Tune recovery sequences",
    body: "Start with defaults for common failure reasons, then adjust tone, timing, and follow-up windows to match your product.",
    Mockup: MockupSequences,
  },
  {
    n: "03",
    title: "Monitor recovered revenue",
    body: "Track which payments are pending, recovered, or escalated so recovery becomes visible instead of buried in Stripe events.",
    Mockup: MockupDashboard,
  },
] as const;

const STEP_DURATION = 4800;

export function HowItWorks() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setActive((a) => (a + 1) % HIW_STEPS.length),
      STEP_DURATION,
    );
    return () => clearInterval(t);
  }, []);

  const activeStep = HIW_STEPS[active];
  const { Mockup } = activeStep;

  return (
    <FadeIn>
      <section
        id="how-it-works"
        className="overflow-hidden rounded-3xl bg-gray-900 [overflow-anchor:none]"
      >
        <div className="grid grid-cols-1 gap-10 px-8 py-16 md:grid-cols-[5fr_7fr] md:gap-8 md:px-14 md:py-20">
          <div className="flex flex-col">
            <SectionPill dark>How it works</SectionPill>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Connect Stripe, tune the defaults, then let Dunlo watch the
              recovery loop.
            </h2>
            <p className="mt-3 text-sm text-white/45">
              No custom webhook build. No payment-ops spreadsheet. You can
              start with defaults and refine the sequences later.
            </p>

            <div className="mt-10 space-y-1">
              {HIW_STEPS.map((step, i) => {
                const isActive = active === i;
                return (
                  <button
                    key={step.n}
                    onClick={() => setActive(i)}
                    aria-pressed={isActive}
                    className={`group w-full rounded-xl px-4 py-3.5 text-left transition-colors duration-200 ${
                      isActive ? "bg-white/8" : "hover:bg-white/4"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-mono text-xs font-bold transition-colors ${
                          isActive ? "text-dunlo" : "text-white/25"
                        }`}
                      >
                        {step.n}
                      </span>
                      <span
                        className={`text-sm font-semibold transition-colors ${
                          isActive ? "text-white" : "text-white/40"
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex h-24 flex-col justify-between rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3.5 sm:h-[5.5rem]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={activeStep.n}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="text-xs leading-relaxed text-white/45"
                >
                  {activeStep.body}
                </motion.p>
              </AnimatePresence>
              <div className="pt-2.5">
                <div className="h-px w-full overflow-hidden rounded-full bg-white/10">
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
              </div>
            </div>

            <div className="mt-auto pt-10">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full bg-dunlo px-6 py-3 text-sm font-semibold text-gray-900 transition-all hover:bg-dunlo-hover active:scale-[0.97]"
              >
                Connect Stripe now
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          <div className="relative flex h-[360px] items-center overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-6 md:h-[420px] md:p-8">
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="size-64 rounded-full bg-dunlo/5 blur-3xl" />
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full"
              >
                <Mockup />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>
    </FadeIn>
  );
}
