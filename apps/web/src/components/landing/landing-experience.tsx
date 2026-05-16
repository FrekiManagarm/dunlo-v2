"use client";

import { Link } from "@tanstack/react-router";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  FileText,
  LockKeyhole,
  Radar,
  ReceiptText,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Logo, LogoMark } from "@/components/logo";
import { RecoveryOrbScene } from "./recovery-orb-scene";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };

const navItems = [
  { label: "Signal", href: "#signal" },
  { label: "Recovery", href: "#recovery" },
  { label: "How", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Product", href: "#lab" },
  { label: "FAQ", href: "#faq" },
];

const recoveryEvents = [
  {
    time: "00:04",
    title: "Stripe failure captured",
    detail: "invoice.payment_failed, expired_card, 1 740 EUR MRR exposed",
    state: "Detected",
  },
  {
    time: "00:18",
    title: "Message route selected",
    detail: "Card-update copy, hosted payment link, retry paused",
    state: "Matched",
  },
  {
    time: "03:42",
    title: "Customer opens email",
    detail: "Founder-visible account, Slack note prepared",
    state: "Watching",
  },
  {
    time: "08:16",
    title: "Revenue recovered",
    detail: "Payment method updated, invoice paid, workflow closed",
    state: "Recovered",
  },
];

const marketStats = [
  {
    value: "~5%",
    label: "of recurring payments fail every month",
    source: "Stripe signal",
  },
  {
    value: "40%",
    label: "of churn can come from involuntary payment issues",
    source: "Revenue leak",
  },
  {
    value: "63%",
    label: "of failed payments are recoverable with the right follow-up",
    source: "Recovery window",
  },
];

const howSteps = [
  {
    step: "01",
    title: "Connect Stripe",
    body: "OAuth, read-only data, failure codes mapped in minutes.",
    detail: "Payment Intents, Customers, Charges, Subscriptions",
  },
  {
    step: "02",
    title: "Tune the recovery routes",
    body: "Expired cards, bank declines and low-funds cases get different copy.",
    detail: "Email timing, retry pause, founder escalation",
  },
  {
    step: "03",
    title: "Watch revenue return",
    body: "Dunlo tracks opens, payment updates and recovered invoices.",
    detail: "Recovered MRR, exposed accounts, next best action",
  },
];

const pricingPlans = [
  {
    name: "Solo",
    price: "19 EUR",
    mrr: "under 5k EUR MRR",
    note: "For founders validating recovery.",
    features: ["1 recovery sequence", "Basic dashboard", "Email support"],
  },
  {
    name: "Starter",
    price: "49 EUR",
    mrr: "5k-20k EUR MRR",
    note: "For early teams with recurring failures.",
    features: ["2 recovery sequences", "Priority scoring", "Failure-code routing"],
  },
  {
    name: "Growth",
    price: "149 EUR",
    mrr: "20k-80k EUR MRR",
    note: "For teams where every failed invoice hurts.",
    featured: true,
    features: [
      "Unlimited sequences",
      "Founder escalation drafts",
      "High-value account alerts",
      "Recovery insights",
    ],
  },
  {
    name: "Scale",
    price: "399 EUR",
    mrr: "unlimited MRR",
    note: "For larger Stripe workspaces.",
    features: ["Custom integrations", "Priority SLA", "Unlimited team seats"],
  },
];

const faqItems = [
  {
    q: "Does Dunlo work with Stripe Connect?",
    a: "Yes. Dunlo connects to standard Stripe accounts and Stripe Connect platforms, then reads failed payment context to trigger the right recovery path.",
  },
  {
    q: "What happens after the beta?",
    a: "Every plan is free during beta. Before billing starts, you get a heads-up and choose the tier that matches your MRR.",
  },
  {
    q: "Will emails go to spam?",
    a: "Dunlo sends through your own email provider and domain. You keep control of sender identity, deliverability and copy.",
  },
  {
    q: "How long does setup take?",
    a: "Most teams can connect Stripe, review default sequences and activate monitoring in about 5 minutes.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. During beta there is nothing to cancel. After launch, you can pause, downgrade or leave from the dashboard.",
  },
];

function MagneticLink({
  children,
  location,
  tone = "dark",
}: {
  children: React.ReactNode;
  location: string;
  tone?: "dark" | "light";
}) {
  const posthog = usePostHog();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 22 });
  const springY = useSpring(y, { stiffness: 260, damping: 22 });

  const handleMove = (event: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((event.clientX - (rect.left + rect.width / 2)) * 0.18);
    y.set((event.clientY - (rect.top + rect.height / 2)) * 0.18);
  };

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMove}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      className="inline-flex"
    >
      <Link
        to="/login"
        onClick={() => posthog.capture("cta_clicked", { location })}
        className={
          tone === "dark"
            ? "group inline-flex items-center gap-3 rounded-full bg-zinc-950 px-2 py-2 text-sm font-semibold text-white shadow-[0_16px_40px_-24px_rgba(24,24,27,0.82)] transition-transform active:scale-[0.98]"
            : "group inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-2 py-2 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-xl transition-transform active:scale-[0.98]"
        }
      >
        <span className="pl-4">{children}</span>
        <span className="flex size-9 items-center justify-center rounded-full bg-dunlo text-zinc-950 transition-transform group-hover:translate-x-0.5">
          <ArrowRight size={17} strokeWidth={2} />
        </span>
      </Link>
    </motion.div>
  );
}

function FloatingNav() {
  return (
    <header className="fixed inset-x-0 top-4 z-30 px-4">
      <div className="mx-auto grid max-w-[1180px] grid-cols-[1fr_auto] items-center gap-3 rounded-full border border-white/10 bg-zinc-950/72 px-3 py-2 text-white shadow-[0_18px_50px_-35px_rgba(0,0,0,0.85)] backdrop-blur-2xl md:grid-cols-[1fr_auto_1fr]">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full px-2 py-1 transition-transform active:scale-[0.98]"
          aria-label="Dunlo home"
        >
          <LogoMark size={24} />
          <span className="text-sm font-semibold tracking-tight">dunlo</span>
        </Link>
        <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-1.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="justify-self-end">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition-transform active:scale-[0.98]"
          >
            Enter beta
            <ArrowRight size={15} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </header>
  );
}

function HeroShowcase() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...spring, delay: 0.16 }}
      className="relative -mt-10 min-h-[390px] overflow-visible sm:mt-0 sm:min-h-[500px] lg:min-h-[620px]"
    >
      <div className="absolute inset-y-[-6%] left-[-4%] right-[-10%] overflow-visible lg:inset-y-[-4%] lg:left-[-2%] lg:right-[-14%]">
        <RecoveryOrbScene />
      </div>
    </motion.div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-zinc-950 px-4 pb-14 pt-24 text-white md:pt-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_74%_42%,rgba(255,255,255,0.12),transparent_30%),linear-gradient(180deg,rgba(39,39,42,0.92),rgba(9,9,11,1)_58%)]" />
      <div className="pointer-events-none absolute inset-x-[-10%] bottom-0 h-56 rotate-[-7deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)] blur-2xl" />
      <div className="relative mx-auto grid min-h-[calc(100dvh-7rem)] max-w-[1220px] grid-cols-1 items-center gap-6 lg:grid-cols-[minmax(0,0.76fr)_minmax(0,1.24fr)] lg:gap-10">
        <div className="relative z-[1] max-w-[620px] py-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring}
            className="inline-flex items-center gap-2 rounded-full border border-dunlo/30 bg-white/[0.04] px-3 py-1.5 text-sm font-semibold text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl"
          >
            <span className="size-2 rounded-full bg-dunlo" />
            Free beta for teams billing with Stripe
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.08 }}
            className="mt-9 max-w-[590px] text-5xl font-semibold leading-[0.94] tracking-tight text-white md:text-6xl xl:text-[4.9rem]"
          >
            Payment recovery for Stripe.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.16 }}
            className="mt-7 max-w-[560px] text-lg leading-8 text-zinc-400"
          >
            Dunlo catches failed invoices, explains what happened and sends the
            right follow-up from your domain before churn quietly compounds.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.24 }}
            className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center"
          >
            <MagneticLink location="hero" tone="light">
              Start recovering now
            </MagneticLink>
            <a
              href="#recovery"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-zinc-300 transition-transform hover:bg-white/10 hover:text-white active:scale-[0.98]"
            >
              See the workflow
              <ArrowRight size={16} strokeWidth={2} />
            </a>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 24, rotate: 1.2 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ ...spring, delay: 0.12 }}
          className="lg:pr-[2vw]"
        >
          <HeroShowcase />
        </motion.div>
      </div>
    </section>
  );
}

function SignalStrip() {
  const signals = [
    "expired_card",
    "insufficient_funds",
    "do_not_honor",
    "authentication_required",
    "lost_card",
    "issuer_not_available",
  ];

  return (
    <section id="signal" className="overflow-hidden border-y border-zinc-200 bg-white">
      <div className="flex whitespace-nowrap py-5">
        <motion.div
          className="flex min-w-max items-center gap-10 pr-10"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 26,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        >
          {[...signals, ...signals, ...signals, ...signals].map((signal, index) => (
            <span
              key={`${signal}-${index}`}
              className="inline-flex items-center gap-3 font-mono text-sm text-zinc-500"
            >
              <span className="size-1.5 rounded-full bg-dunlo" />
              {signal}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function ProofSection() {
  return (
    <section className="px-4 py-10 lg:py-12">
      <div className="mx-auto max-w-[1320px]">
        <div className="grid overflow-hidden rounded-[1.75rem] border border-zinc-200 bg-white shadow-[0_22px_48px_-42px_rgba(24,24,27,0.72)] md:grid-cols-3">
          {marketStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              whileHover={{ y: -3 }}
              transition={spring}
              className="border-b border-zinc-200 p-6 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 lg:p-8"
            >
              <p className="text-xs font-semibold uppercase text-zinc-400">
                {stat.source}
              </p>
              <p className="mt-4 font-mono text-4xl font-semibold text-dunlo-deep">
                {stat.value}
              </p>
              <p className="mt-3 max-w-[25ch] text-sm leading-6 text-zinc-500">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
        <div className="mt-5 overflow-hidden rounded-full border border-zinc-200 bg-white py-3">
          <motion.div
            className="flex min-w-max items-center gap-10 px-5"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              duration: 28,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          >
            {[
              "Stripe",
              "Postmark",
              "Resend",
              "Mailgun",
              "SendGrid",
              "Neon",
              "Stripe",
              "Postmark",
              "Resend",
              "Mailgun",
              "SendGrid",
              "Neon",
            ].map((name, index) => (
              <span
                key={`${name}-${index}`}
                className="whitespace-nowrap text-sm font-semibold text-zinc-400"
              >
                {name}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function RecoveryTimeline() {
  return (
    <section
      id="recovery"
      className="relative mx-auto grid max-w-[1320px] grid-cols-1 gap-8 px-4 py-14 lg:grid-cols-[0.74fr_1.26fr] lg:py-18"
    >
      <div className="lg:sticky lg:top-32 lg:self-start">
        <p className="text-sm font-semibold text-dunlo-deep">
          Recovery workflow
        </p>
        <h2 className="mt-4 max-w-[560px] text-4xl font-semibold leading-none text-zinc-950 md:text-6xl">
          A clear next step for every failed invoice.
        </h2>
        <p className="mt-5 max-w-[520px] text-base leading-8 text-zinc-600">
          Dunlo groups failures by reason, chooses the right message and keeps
          sensitive accounts visible for a founder or finance lead.
        </p>
      </div>
      <div className="relative">
        <div className="absolute left-4 top-7 h-[calc(100%-3.5rem)] w-px bg-zinc-200 md:left-7" />
        <motion.div
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-4 top-7 h-[calc(100%-3.5rem)] w-px origin-top bg-dunlo md:left-7"
        />
        <div className="space-y-5">
          {recoveryEvents.map((event, index) => (
            <motion.article
              key={event.title}
              whileHover={{ y: -3 }}
              transition={{ ...spring, delay: index * 0.07 }}
              className="relative grid gap-4 rounded-[1.5rem] border border-zinc-200 bg-white p-5 shadow-[0_20px_45px_-34px_rgba(24,24,27,0.72)] md:grid-cols-[120px_1fr_auto] md:p-7"
            >
              <span className="absolute left-[11px] top-8 size-3 rounded-full border-2 border-white bg-dunlo md:left-[23px]" />
              <div className="pl-7 md:pl-8">
                <p className="font-mono text-sm font-semibold text-zinc-950">
                  {event.time}
                </p>
                <p className="mt-1 text-xs text-zinc-400">after failure</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-zinc-950">
                  {event.title}
                </h3>
                <p className="mt-2 max-w-[620px] text-sm leading-6 text-zinc-500">
                  {event.detail}
                </p>
              </div>
              <span className="h-fit rounded-full border border-dunlo/30 bg-dunlo/10 px-3 py-1 text-xs font-semibold text-dunlo-deep">
                {event.state}
              </span>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const [active, setActive] = useState(0);
  const activeStep = howSteps[active];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActive((current) => (current + 1) % howSteps.length);
    }, 3600);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section
      id="how-it-works"
      className="px-4 py-14 lg:py-18"
    >
      <div className="mx-auto grid max-w-[1320px] overflow-hidden rounded-[2rem] bg-zinc-950 text-white shadow-[0_28px_80px_-58px_rgba(24,24,27,0.88)] lg:grid-cols-[0.88fr_1.12fr]">
        <div className="p-7 md:p-10 lg:p-12">
          <p className="text-sm font-semibold text-dunlo">How it works</p>
          <h2 className="mt-4 max-w-[560px] text-4xl font-semibold leading-none md:text-5xl">
            Connect, tune, recover.
          </h2>
          <p className="mt-5 max-w-[520px] text-sm leading-7 text-white/55">
            No code to write. Dunlo connects to Stripe, reads failures and
            launches the right actions without forcing you to rebuild billing.
          </p>
          <div className="mt-8 space-y-2">
            {howSteps.map((item, index) => {
              const isActive = active === index;
              return (
                <button
                  key={item.step}
                  onClick={() => setActive(index)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
                    isActive
                      ? "border-white/12 bg-white/10"
                      : "border-transparent hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-mono text-xs font-semibold ${
                        isActive ? "text-dunlo" : "text-white/30"
                      }`}
                    >
                      {item.step}
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        isActive ? "text-white" : "text-white/42"
                      }`}
                    >
                      {item.title}
                    </span>
                  </div>
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden pl-9 pt-2 text-xs leading-6 text-white/50"
                      >
                        {item.body}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>
        </div>
        <div className="border-t border-white/10 p-5 lg:border-l lg:border-t-0 lg:p-8">
          <div className="relative min-h-[360px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:34px_34px]" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white/60">
                  {activeStep.step}
                </span>
                <span className="rounded-full bg-dunlo px-3 py-1 font-mono text-xs font-semibold text-zinc-950">
                  preview
                </span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep.step}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={spring}
                  className="mt-10"
                >
                  <p className="text-3xl font-semibold leading-none">
                    {activeStep.title}
                  </p>
                  <p className="mt-4 max-w-[520px] text-sm leading-7 text-white/56">
                    {activeStep.detail}
                  </p>
                  <div className="mt-8 grid gap-3">
                    {[0, 1, 2, 3].map((item) => (
                      <motion.div
                        key={`${activeStep.step}-${item}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ ...spring, delay: item * 0.06 }}
                        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-zinc-950/45 p-3"
                      >
                        <span className="flex size-8 items-center justify-center rounded-full bg-dunlo/15">
                          <Check size={15} strokeWidth={2} className="text-dunlo" />
                        </span>
                        <span className="text-sm text-white/70">
                          {[
                            "Read-only Stripe scope",
                            "Failure reason classified",
                            "Recovery route selected",
                            "MRR impact measured",
                          ][item]}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const queueItems = [
  { id: "orven", name: "Orven Cloud", value: "2 410 EUR", risk: "bank declined" },
  { id: "mira", name: "MiraDesk", value: "860 EUR", risk: "expired card" },
  { id: "cobalt", name: "Cobalt Forms", value: "1 280 EUR", risk: "auth required" },
  { id: "northline", name: "Northline API", value: "520 EUR", risk: "funds low" },
];

const IntelligentQueue = memo(function IntelligentQueue() {
  const [items, setItems] = useState(queueItems);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setItems((current) => {
        const next = [...current];
        const first = next.shift();
        return first ? [...next, first] : current;
      });
    }, 2600);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <motion.div
          layout
          key={item.id}
          transition={spring}
          className="rounded-2xl border border-zinc-200 bg-white p-3"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-zinc-950">{item.name}</p>
              <p className="mt-1 font-mono text-xs text-zinc-400">{item.risk}</p>
            </div>
            <p className="font-mono text-sm font-semibold text-zinc-950">
              {item.value}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
});

const CommandLoop = memo(function CommandLoop() {
  const prompts = useMemo(
    () => [
      "Draft recovery email for expired corporate cards",
      "Pause retry until payroll window opens",
      "Flag invoices above 1 500 EUR for founder review",
    ],
    [],
  );
  const [promptIndex, setPromptIndex] = useState(0);
  const [visibleChars, setVisibleChars] = useState(0);
  const activePrompt = prompts[promptIndex];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setVisibleChars((current) => {
        if (current < activePrompt.length) return current + 1;
        window.setTimeout(() => {
          setPromptIndex((index) => (index + 1) % prompts.length);
          setVisibleChars(0);
        }, 900);
        return current;
      });
    }, 42);
    return () => window.clearInterval(interval);
  }, [activePrompt, prompts.length]);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-950 p-4 text-white">
      <div className="mb-4 flex items-center gap-2 text-white/50">
        <Radar size={15} strokeWidth={2} />
        <span className="font-mono text-xs">route command</span>
      </div>
      <p className="min-h-[56px] text-base font-medium leading-7">
        {activePrompt.slice(0, visibleChars)}
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
          className="ml-0.5 inline-block h-5 w-px translate-y-1 bg-dunlo"
        />
      </p>
      <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-dunlo"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY }}
        />
      </div>
    </div>
  );
});

const LiveStatus = memo(function LiveStatus() {
  const [showBadge, setShowBadge] = useState(true);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setShowBadge((current) => !current);
    }, 3200);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="relative rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-950">Provider status</p>
          <p className="mt-1 text-xs text-zinc-500">Postmark route healthy</p>
        </div>
        <motion.span
          animate={{ scale: [1, 1.18, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.7, repeat: Number.POSITIVE_INFINITY }}
          className="size-3 rounded-full bg-dunlo"
        />
      </div>
      <AnimatePresence>
        {showBadge && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 340, damping: 19 }}
            className="mt-5 rounded-2xl border border-dunlo/25 bg-dunlo/10 p-3"
          >
            <p className="text-xs font-semibold text-dunlo-deep">
              DNS verified, sending window opened
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

const DataCarousel = memo(function DataCarousel() {
  const cards = [
    ["Recovered", "430 EUR", "Briq Ledger"],
    ["Escalated", "2 410 EUR", "Orven Cloud"],
    ["Waiting", "690 EUR", "Paloma CRM"],
    ["Recovered", "1 180 EUR", "Kivo Metrics"],
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4">
      <motion.div
        className="flex w-max gap-3"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          duration: 14,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      >
        {[...cards, ...cards].map(([state, amount, name], index) => (
          <div
            key={`${name}-${index}`}
            className="w-[180px] rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
          >
            <p className="text-xs font-semibold text-zinc-500">{state}</p>
            <p className="mt-3 font-mono text-xl font-semibold text-zinc-950">
              {amount}
            </p>
            <p className="mt-2 text-xs text-zinc-500">{name}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
});

const FocusDocument = memo(function FocusDocument() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="mb-4 flex items-center gap-2">
        <FileText size={16} strokeWidth={2} className="text-zinc-500" />
        <span className="text-sm font-semibold text-zinc-950">
          Founder note
        </span>
      </div>
      <div className="space-y-2">
        {[72, 96, 84, 58].map((width, index) => (
          <motion.div
            key={width}
            className="h-3 rounded-full bg-zinc-100"
            style={{ width: `${width}%` }}
            animate={{
              backgroundColor:
                index === 2
                  ? ["#f4f4f5", "rgba(0,232,123,0.2)", "#f4f4f5"]
                  : "#f4f4f5",
            }}
            transition={{
              duration: 2.4,
              repeat: Number.POSITIVE_INFINITY,
              delay: index * 0.22,
            }}
          />
        ))}
      </div>
      <motion.div
        animate={{ y: [4, -2, 4] }}
        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
        className="mt-5 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 shadow-[0_16px_36px_-28px_rgba(24,24,27,0.7)]"
      >
        <ShieldCheck size={15} strokeWidth={2} className="text-dunlo-deep" />
        <span className="text-xs font-semibold text-zinc-800">Ready to send</span>
      </motion.div>
    </div>
  );
});

function StatePreview() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <div className="rounded-2xl border border-zinc-200 bg-white p-4">
        <p className="text-xs font-semibold text-zinc-500">Loading</p>
        <div className="mt-4 space-y-2">
          <div className="h-3 w-2/3 animate-pulse rounded-full bg-zinc-100" />
          <div className="h-3 w-full animate-pulse rounded-full bg-zinc-100" />
          <div className="h-3 w-1/2 animate-pulse rounded-full bg-zinc-100" />
        </div>
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-4">
        <p className="text-xs font-semibold text-zinc-500">Empty</p>
        <div className="mt-4 flex items-center gap-3">
          <BadgeCheck size={22} strokeWidth={2} className="text-dunlo-deep" />
          <p className="text-sm font-semibold text-zinc-950">No accounts waiting</p>
        </div>
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-4">
        <p className="text-xs font-semibold text-zinc-500">Error</p>
        <p className="mt-4 text-sm font-semibold text-zinc-950">
          Email provider paused
        </p>
        <p className="mt-1 text-xs text-zinc-500">Reconnect before next batch.</p>
      </div>
    </div>
  );
}

function MotionLab() {
  return (
    <section id="lab" className="bg-zinc-50 px-4 py-14 lg:py-18">
      <div className="mx-auto max-w-[1320px]">
        <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold text-dunlo-deep">
              Product details
            </p>
            <h2 className="mt-4 max-w-[660px] text-4xl font-semibold leading-none text-zinc-950 md:text-6xl">
              Small states that make recovery feel calm.
            </h2>
          </div>
          <p className="max-w-[620px] text-base leading-8 text-zinc-600 lg:justify-self-end">
            The app shows priority, routing, provider health and message drafts
            without turning finance work into a control room.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-6">
          <motion.div
            whileHover={{ y: -4 }}
            transition={spring}
            className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-[0_24px_55px_-42px_rgba(24,24,27,0.8)] lg:col-span-2"
          >
            <div className="mb-5 flex items-center gap-2">
              <CircleDollarSign size={18} strokeWidth={2} className="text-dunlo-deep" />
              <h3 className="font-semibold text-zinc-950">Priority queue</h3>
            </div>
            <IntelligentQueue />
          </motion.div>
          <motion.div
            whileHover={{ y: -4 }}
            transition={spring}
            className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-[0_24px_55px_-42px_rgba(24,24,27,0.8)] lg:col-span-4"
          >
            <CommandLoop />
            <div className="mt-4 grid gap-4 md:grid-cols-[0.85fr_1.15fr]">
              <LiveStatus />
              <DataCarousel />
            </div>
          </motion.div>
          <motion.div
            whileHover={{ y: -4 }}
            transition={spring}
            className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-[0_24px_55px_-42px_rgba(24,24,27,0.8)] lg:col-span-3"
          >
            <FocusDocument />
          </motion.div>
          <motion.div
            whileHover={{ y: -4 }}
            transition={spring}
            className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-[0_24px_55px_-42px_rgba(24,24,27,0.8)] lg:col-span-3"
          >
            <div className="mb-5 flex items-center gap-2">
              <ReceiptText size={18} strokeWidth={2} className="text-dunlo-deep" />
              <h3 className="font-semibold text-zinc-950">Product states</h3>
            </div>
            <StatePreview />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="px-4 py-14 lg:py-18">
      <div className="mx-auto max-w-[1320px]">
        <div className="grid gap-6 lg:grid-cols-[0.74fr_1.26fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold text-dunlo-deep">Pricing</p>
            <h2 className="mt-4 max-w-[620px] text-4xl font-semibold leading-none text-zinc-950 md:text-6xl">
              Free during beta. Clear after launch.
            </h2>
          </div>
          <div className="rounded-[1.5rem] border border-dunlo/25 bg-dunlo/10 p-5 lg:justify-self-end">
            <div className="flex items-start gap-3">
              <span className="mt-1 size-2 rounded-full bg-dunlo" />
              <p className="max-w-[560px] text-sm leading-7 text-dunlo-deep">
                Choose your tier now to test the right scope. No payment is
                charged during beta.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {pricingPlans.map((plan, index) => (
            <motion.article
              key={plan.name}
              whileHover={{ y: -4 }}
              transition={{ ...spring, delay: index * 0.05 }}
              className={`relative flex min-h-[390px] flex-col rounded-[1.75rem] border p-5 shadow-[0_24px_55px_-42px_rgba(24,24,27,0.8)] ${
                plan.featured
                  ? "border-zinc-900 bg-zinc-950 text-white"
                  : "border-zinc-200 bg-white text-zinc-950"
              }`}
            >
              {plan.featured && (
                <span className="absolute right-5 top-5 rounded-full bg-dunlo px-3 py-1 text-xs font-semibold text-zinc-950">
                  Most picked
                </span>
              )}
              <div>
                <p
                  className={`text-sm font-semibold ${
                    plan.featured ? "text-white" : "text-zinc-950"
                  }`}
                >
                  {plan.name}
                </p>
                <p
                  className={`mt-1 text-xs ${
                    plan.featured ? "text-white/42" : "text-zinc-500"
                  }`}
                >
                  {plan.mrr}
                </p>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="font-mono text-4xl font-semibold">
                    {plan.price}
                  </span>
                  <span
                    className={`text-sm ${
                      plan.featured ? "text-white/42" : "text-zinc-400"
                    }`}
                  >
                    /mo
                  </span>
                </div>
                <p
                  className={`mt-4 min-h-[48px] text-sm leading-6 ${
                    plan.featured ? "text-white/58" : "text-zinc-500"
                  }`}
                >
                  {plan.note}
                </p>
              </div>
              <ul className="mt-7 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className={`flex items-start gap-3 text-sm ${
                      plan.featured ? "text-white/72" : "text-zinc-600"
                    }`}
                  >
                    <Check
                      size={16}
                      strokeWidth={2}
                      className="mt-0.5 shrink-0 text-dunlo"
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/login"
                className={`mt-7 inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition-transform active:scale-[0.98] ${
                  plan.featured
                    ? "bg-dunlo text-zinc-950"
                    : "border border-zinc-200 bg-white text-zinc-950 hover:border-zinc-300"
                }`}
              >
                Start free
                <ArrowRight size={15} strokeWidth={2} />
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="px-4 py-14 lg:py-18">
      <div className="mx-auto grid max-w-[1320px] gap-8 rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_24px_55px_-44px_rgba(24,24,27,0.72)] md:p-8 lg:grid-cols-[0.7fr_1.3fr] lg:p-10">
        <div>
          <p className="text-sm font-semibold text-dunlo-deep">FAQ</p>
          <h2 className="mt-4 max-w-[440px] text-4xl font-semibold leading-none text-zinc-950 md:text-5xl">
            The questions before connecting Stripe.
          </h2>
          <p className="mt-5 max-w-[430px] text-sm leading-7 text-zinc-500">
            Short answers, because the landing should convince without asking
            for a meeting.
          </p>
        </div>
        <div className="divide-y divide-zinc-200">
          {faqItems.map((item, index) => {
            const isOpen = open === index;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between gap-5 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-semibold text-zinc-950">
                    {item.q}
                  </span>
                  <ChevronDown
                    size={18}
                    strokeWidth={2}
                    className={`shrink-0 text-zinc-400 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 text-sm leading-7 text-zinc-500">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function BetaCta() {
  return (
    <section id="beta" className="px-4 py-14 lg:py-18">
      <div className="mx-auto grid max-w-[1320px] overflow-hidden rounded-[2rem] bg-zinc-950 text-white shadow-[0_34px_95px_-60px_rgba(24,24,27,0.86)] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="p-8 md:p-12 lg:p-16">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-xl">
            <LockKeyhole size={15} strokeWidth={2} />
            Beta access
          </p>
          <h2 className="mt-7 max-w-[720px] text-4xl font-semibold leading-none md:text-6xl">
            Connect Stripe and let Dunlo watch the revenue leaks.
          </h2>
          <p className="mt-6 max-w-[610px] text-base leading-8 text-white/58">
            Free during beta. Test recovery routes, measure recovered MRR and
            keep control of sensitive accounts.
          </p>
          <div className="mt-9">
            <MagneticLink location="beta" tone="light">
              Join the beta
            </MagneticLink>
          </div>
        </div>
        <div className="grid border-t border-white/10 lg:border-l lg:border-t-0">
          {[
            [Zap, "Set up in minutes"],
            [Clock3, "Timing matched to the failure reason"],
            [ShieldCheck, "Emails sent from your domain"],
          ].map(([Icon, label]) => (
            <div
              key={label as string}
              className="flex items-center gap-4 border-b border-white/10 p-6 last:border-b-0 md:p-8"
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-dunlo text-zinc-950">
                <Icon size={20} strokeWidth={2} />
              </span>
              <span className="font-semibold text-white">{label as string}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white px-4 py-8">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-4 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between">
        <Logo size={26} />
        <div className="flex flex-wrap gap-4">
          <Link to="/blog" className="transition-colors hover:text-zinc-950">
            Blog
          </Link>
          <Link to="/login" className="transition-colors hover:text-zinc-950">
            Sign in
          </Link>
          <span>Dunlo beta</span>
        </div>
      </div>
    </footer>
  );
}

export function LandingExperience() {
  return (
    <main className="min-h-dvh bg-zinc-50 font-sans text-zinc-950">
      <FloatingNav />
      <Hero />
      <SignalStrip />
      <ProofSection />
      <RecoveryTimeline />
      <HowItWorksSection />
      <MotionLab />
      <PricingSection />
      <FaqSection />
      <BetaCta />
      <LandingFooter />
    </main>
  );
}
