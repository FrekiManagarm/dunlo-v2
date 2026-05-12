'use client';
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useInView } from "framer-motion";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronRight,
  Globe,
  Mail,
  Shield,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useRef, useState } from "react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

/* ─── Variants ─────────────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
};

function FadeIn({
  children,
  i = 0,
  className = "",
}: {
  children: React.ReactNode;
  i?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      custom={i}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────────── */
function LandingPage() {
  return (
    <div className="min-h-[100dvh] bg-[#f7f8fa] font-sans">
      <Nav />
      <Hero />
      <LogoMarquee />
      <Features />
      <HowItWorks />
      <Pricing />
      <Faq />
      <CtaBanner />
      <Footer />
    </div>
  );
}

/* ─── Nav ───────────────────────────────────────────────────────────────────── */
function Nav() {
  return (
    <div className="fixed inset-x-0 top-4 z-50 px-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between rounded-full border border-gray-200 bg-white/90 px-4 py-2.5 shadow-sm backdrop-blur-md">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-dunlo text-[11px] font-bold text-white">
            D
          </span>
          <span className="text-sm font-semibold text-gray-900">dunlo</span>
        </Link>

        {/* Center links */}
        <nav className="hidden items-center gap-1 md:flex">
          {["Features", "Pricing", "FAQ"].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              className="rounded-full px-3.5 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="rounded-full px-3.5 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
          >
            Sign in
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-1.5 rounded-full bg-gray-900 px-4 py-1.5 text-sm font-semibold text-white transition-all hover:bg-gray-700 active:scale-[0.97]"
          >
            Sign up
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Hero ──────────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="flex flex-col items-center px-4 pb-0 pt-36 text-center">
      {/* Badge */}
      <div className="anim-1 mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm shadow-sm">
        <span className="font-medium text-gray-700">Beta — free to start</span>
        <span className="h-3.5 w-px bg-gray-200" />
        <a
          href="#pricing"
          className="flex items-center gap-1 font-semibold text-dunlo-dim hover:underline"
        >
          See plans
          <ArrowUpRight size={13} />
        </a>
      </div>

      {/* Headline */}
      <h1 className="anim-2 max-w-2xl text-5xl font-bold leading-[1.08] tracking-tight text-gray-900 md:text-6xl lg:text-[68px]">
        Stop losing revenue
        <br />
        to failed payments.
      </h1>

      {/* Description */}
      <p className="anim-3 mt-5 max-w-xl text-lg leading-relaxed text-gray-500">
        Dunlo connects to Stripe, detects every failed payment by type, and sends
        the right recovery email — automatically. Setup in 5 minutes.
      </p>

      {/* CTA */}
      <div className="anim-4 mt-8">
        <Link
          to="/login"
          className="inline-flex items-center gap-0 rounded-full border border-gray-200 bg-white px-2 py-2 shadow-sm transition-shadow hover:shadow-md active:scale-[0.98]"
        >
          <span className="px-4 text-sm font-semibold text-gray-900">
            Get started now
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-dunlo px-4 py-2 text-sm font-semibold text-white">
            for free
            <ChevronRight size={14} />
          </span>
        </Link>
      </div>

      <p className="anim-5 mt-4 text-xs text-gray-400">
        No credit card required · Cancel anytime · 5 min setup
      </p>

      {/* Dashboard mockup */}
      <div className="anim-6 mt-14 w-full max-w-5xl">
        <DashboardMockup />
      </div>
    </section>
  );
}

function DashboardMockup() {
  const payments = [
    { name: "Meridian Analytics", email: "billing@meridian.io", amount: "€890", status: "recovered", type: "Card expired" },
    { name: "Volta Cloud", email: "ops@voltacloud.eu", amount: "€2,340", status: "escalated", type: "Bank declined" },
    { name: "Praxis Labs", email: "cfo@praxislabs.com", amount: "€415", status: "recovering", type: "Insufficient funds" },
    { name: "Helix Software", email: "admin@helix.dev", amount: "€1,200", status: "recovered", type: "Card expired" },
    { name: "Orbis Finance", email: "finance@orbis.io", amount: "€3,500", status: "escalated", type: "Bank declined" },
  ];

  const statusStyle: Record<string, string> = {
    recovered: "bg-dunlo/8 text-dunlo-deep border-dunlo/25",
    recovering: "bg-amber-50 text-amber-700 border-amber-200",
    escalated: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_20px_60px_-10px_rgba(0,0,0,0.1)]">
      {/* Fake browser bar */}
      <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-5 py-3">
        <span className="size-3 rounded-full bg-red-400/60" />
        <span className="size-3 rounded-full bg-amber-400/60" />
        <span className="size-3 rounded-full bg-dunlo/70" />
        <div className="mx-3 flex h-6 flex-1 max-w-xs items-center rounded-full bg-white border border-gray-200 px-3">
          <span className="text-[11px] text-gray-400">app.dunlo.io/dashboard</span>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="hidden w-52 shrink-0 border-r border-gray-100 bg-gray-50/50 p-4 md:block">
          <div className="mb-6 flex items-center gap-2 px-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-dunlo text-[10px] font-bold text-white">D</span>
            <span className="text-sm font-semibold text-gray-900">dunlo</span>
          </div>
          {["Overview", "Recovery", "Escalations", "Sequences", "Settings"].map((item, i) => (
            <div
              key={item}
              className={`mb-1 rounded-xl px-3 py-2 text-xs font-medium ${
                i === 0
                  ? "bg-white text-gray-900 shadow-sm border border-gray-100"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {item}
            </div>
          ))}
          <div className="mt-6 rounded-xl border border-dunlo/25 bg-dunlo/8 p-3">
            <p className="text-[11px] font-semibold text-[#006b38]">€12,480 recovered</p>
            <p className="mt-0.5 text-[10px] text-dunlo-dim">this month · +18%</p>
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 p-5">
          {/* Stats row */}
          <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: "Recovered", value: "€12,480", delta: "+18%", ok: true },
              { label: "In recovery", value: "34", delta: "active", ok: null },
              { label: "Success rate", value: "72.3%", delta: "+4.1%", ok: true },
              { label: "MRR at risk", value: "€3,240", delta: "13 accounts", ok: false },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <p className="text-[11px] font-medium text-gray-400">{s.label}</p>
                <p className="mt-1.5 text-xl font-bold text-gray-900">{s.value}</p>
                <p
                  className={`mt-0.5 text-[11px] font-semibold ${
                    s.ok === true
                      ? "text-dunlo-dim"
                      : s.ok === false
                        ? "text-red-500"
                        : "text-gray-400"
                  }`}
                >
                  {s.delta}
                </p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-4 py-3">
              <p className="text-xs font-semibold text-gray-700">Recent payments in recovery</p>
            </div>
            <div className="divide-y divide-gray-50">
              {payments.map((p) => (
                <div key={p.email} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-900">{p.name}</p>
                    <p className="text-[11px] text-gray-400">{p.type}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-gray-900">{p.amount}</span>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold capitalize ${
                        statusStyle[p.status]
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Logo Marquee ──────────────────────────────────────────────────────────── */
const LOGOS = [
  "Stripe", "Notion", "Linear", "Vercel", "Figma",
  "Loom", "Intercom", "Segment", "Mixpanel", "Heap",
];

function LogoMarquee() {
  return (
    <section className="mt-20 overflow-hidden py-10">
      <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-gray-400">
        Trusted by fast-growing SaaS teams
      </p>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#f7f8fa] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#f7f8fa] to-transparent" />
        <div className="flex animate-marquee gap-12" style={{ width: "max-content" }}>
          {[...LOGOS, ...LOGOS].map((name, i) => (
            <span
              key={i}
              className="whitespace-nowrap text-base font-semibold tracking-tight text-gray-300"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Features (zig-zag) ────────────────────────────────────────────────────── */
const FEATURES = [
  {
    tag: "Detect",
    headline: "Every failure type has a different fix.",
    body: "Card expired, insufficient funds, bank declined — each tells a different story. Dunlo reads the Stripe failure code and sends the exact right email at the exact right moment. Generic retries are gone.",
    icon: Zap,
    visual: (
      <div className="space-y-2.5 p-6">
        {[
          { code: "card_declined", label: "Bank declined", action: "Send bank update template", color: "bg-red-50 border-red-200 text-red-700" },
          { code: "expired_card", label: "Card expired", action: "Send secure update link", color: "bg-amber-50 border-amber-200 text-amber-700" },
          { code: "insufficient_funds", label: "Insufficient funds", action: "Schedule timed retry", color: "bg-blue-50 border-blue-200 text-blue-700" },
          { code: "do_not_honor", label: "Generic decline", action: "Escalate if > €500", color: "bg-purple-50 border-purple-200 text-purple-700" },
        ].map((item) => (
          <div key={item.code} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
            <div>
              <p className="text-xs font-semibold text-gray-900">{item.label}</p>
              <p className="font-mono text-[10px] text-gray-400">{item.code}</p>
            </div>
            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${item.color}`}>
              {item.action}
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    tag: "Recover",
    headline: "Automated sequences that feel human.",
    body: "Pre-built email flows tailored to each failure type. Your customers receive a clear, personal message with the right CTA — not a cold automated blast. Average recovery starts within 3 minutes of failure.",
    icon: Mail,
    visual: (
      <div className="p-6 space-y-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="size-8 rounded-full bg-dunlo/15 flex items-center justify-center text-[10px] font-bold text-dunlo-deep">JR</div>
            <div>
              <p className="text-xs font-semibold text-gray-900">dunlo recovery</p>
              <p className="text-[10px] text-gray-400">to: james.r@meridian.io</p>
            </div>
            <span className="ml-auto rounded-full bg-dunlo/8 border border-dunlo/25 px-2 py-0.5 text-[10px] font-semibold text-dunlo-deep">Sent · 3 min ago</span>
          </div>
          <p className="text-xs font-semibold text-gray-900 mb-1">Your payment didn't go through</p>
          <p className="text-[11px] text-gray-500 leading-relaxed">Hi James, your card ending in 4242 was declined. Tap below to update your payment details and keep your subscription active.</p>
          <div className="mt-3 inline-flex rounded-full bg-dunlo px-4 py-1.5 text-[11px] font-semibold text-white">
            Update payment →
          </div>
        </div>
        <div className="flex items-center gap-2 px-2">
          <div className="h-px flex-1 bg-gray-100" />
          <p className="text-[10px] text-gray-400">Opened · 4.2 min after send</p>
          <div className="h-px flex-1 bg-gray-100" />
        </div>
        <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-900">Payment recovered <span className="text-dunlo-dim">€890</span></p>
          <p className="text-[10px] text-gray-400 mt-0.5">Card updated · 8 min after email</p>
        </div>
      </div>
    ),
  },
  {
    tag: "Escalate",
    headline: "High-value accounts get your personal touch.",
    body: "Set a threshold (e.g. €500+/mo) and Dunlo drafts a founder-ready email for each high-risk account. You review and send in one click — high-touch when MRR is on the line.",
    icon: Shield,
    visual: (
      <div className="p-6 space-y-3">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="rounded-full bg-red-100 border border-red-200 px-2.5 py-0.5 text-[10px] font-bold text-red-700">ESCALATION</span>
              <p className="mt-2 text-sm font-bold text-gray-900">Orbis Finance · €3,500/mo</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Bank declined · 12 min ago</p>
            </div>
            <TrendingUp size={18} className="text-red-500 mt-1" />
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-gray-500 mb-2">Draft ready — review & send</p>
          <p className="text-xs text-gray-800 leading-relaxed">"Hey Marcus, I saw your card didn't go through today. Given what you're building at Orbis, I wanted to reach out personally..."</p>
          <div className="mt-3 flex gap-2">
            <button className="flex-1 rounded-full bg-dunlo py-2 text-[11px] font-semibold text-white">
              Send now
            </button>
            <button className="rounded-full border border-gray-200 px-3 py-2 text-[11px] font-semibold text-gray-600">
              Edit
            </button>
          </div>
        </div>
      </div>
    ),
  },
];

function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-24">
      <FadeIn className="mb-16 text-center">
        <span className="mb-4 inline-block rounded-full bg-dunlo/8 border border-dunlo/25 px-4 py-1.5 text-xs font-semibold text-dunlo-deep">
          Features
        </span>
        <h2 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
          Built for real churn scenarios.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-gray-500">
          Not a generic retry tool. Every feature maps to a real failure mode.
        </p>
      </FadeIn>

      <div className="space-y-8">
        {FEATURES.map((feature, idx) => {
          const isEven = idx % 2 === 0;
          const Icon = feature.icon;
          return (
            <FadeIn key={feature.tag} i={idx} className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
              <div className={`flex flex-col gap-0 md:flex-row ${isEven ? "" : "md:flex-row-reverse"}`}>
                {/* Text */}
                <div className="flex flex-1 flex-col justify-center p-10 lg:p-14">
                  <div className="mb-5 inline-flex size-10 items-center justify-center rounded-2xl bg-dunlo/8 border border-dunlo/25">
                    <Icon size={18} className="text-dunlo-dim" />
                  </div>
                  <span className="mb-2 text-xs font-bold uppercase tracking-widest text-dunlo-dim">
                    {feature.tag}
                  </span>
                  <h3 className="text-2xl font-bold leading-snug tracking-tight text-gray-900 md:text-3xl">
                    {feature.headline}
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-gray-500">{feature.body}</p>
                </div>
                {/* Visual */}
                <div className="flex-1 border-t border-gray-100 bg-gray-50/50 md:border-l md:border-t-0">
                  {feature.visual}
                </div>
              </div>
            </FadeIn>
          );
        })}
      </div>
    </section>
  );
}

/* ─── How it works ──────────────────────────────────────────────────────────── */
function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-gray-900 px-4 py-24">
      <div className="mx-auto max-w-4xl text-center">
        <FadeIn>
          <span className="mb-4 inline-block rounded-full border border-white/10 px-4 py-1.5 text-xs font-semibold text-white/50">
            How it works
          </span>
          <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            Up and running in 5 minutes.
          </h2>
          <p className="mt-4 text-lg text-white/50">No code. No webhooks. No engineering team.</p>
        </FadeIn>

        <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Connect Stripe",
              body: "OAuth in 30 seconds. We read payment intents and customer data — read-only, no write access.",
            },
            {
              step: "02",
              title: "Review sequences",
              body: "Pre-built email flows ship for each failure type. Edit tone and timing or use the defaults.",
            },
            {
              step: "03",
              title: "Watch revenue return",
              body: "Dunlo sends recovery emails, tracks opens and payments, and alerts you on high-value accounts.",
            },
          ].map((s, i) => (
            <FadeIn key={s.step} i={i} className="rounded-3xl border border-white/8 bg-white/5 p-8 text-left backdrop-blur-sm">
              <span className="font-mono text-4xl font-bold text-white/10">{s.step}</span>
              <h3 className="mt-4 text-lg font-bold text-white">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/50">{s.body}</p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing ───────────────────────────────────────────────────────────────── */
const PLANS = [
  {
    name: "Solo",
    price: 19,
    mrr: "< €5k MRR",
    features: ["1 email sequence", "Up to €5k MRR", "Basic dashboard", "Email support"],
    featured: false,
  },
  {
    name: "Starter",
    price: 49,
    mrr: "€5k–€20k MRR",
    features: ["2 email sequences", "Up to €20k MRR", "Priority scoring", "All Solo features"],
    featured: false,
  },
  {
    name: "Growth",
    price: 149,
    mrr: "€20k–€80k MRR",
    badge: "Most popular",
    features: [
      "Unlimited sequences",
      "Up to €80k MRR",
      "Founder escalation drafts",
      "High-value account alerts",
      "Recovery insights",
      "Unlimited team members",
    ],
    featured: true,
  },
  {
    name: "Scale",
    price: 399,
    mrr: "Unlimited MRR",
    features: ["All Growth features", "Unlimited MRR", "Custom integrations", "Priority SLA"],
    featured: false,
  },
];

function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-4 py-24">
      <FadeIn className="mb-4 text-center">
        <span className="mb-4 inline-block rounded-full bg-dunlo/8 border border-dunlo/25 px-4 py-1.5 text-xs font-semibold text-dunlo-deep">
          Pricing
        </span>
        <h2 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
          Simple pricing. No % of MRR.
        </h2>
        <p className="mt-4 text-gray-500">All plans free during beta — no billing until launch.</p>
      </FadeIn>

      {/* Beta banner */}
      <FadeIn i={1} className="mx-auto mb-10 mt-8 flex max-w-xl items-center justify-center gap-3 rounded-full border border-dunlo/25 bg-dunlo/8 px-6 py-3">
        <span className="size-2 animate-pulse rounded-full bg-dunlo" />
        <p className="text-sm font-medium text-[#006b38]">
          <strong>Beta:</strong> every plan is currently free — pick your tier for when we launch
        </p>
      </FadeIn>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan, i) => (
          <FadeIn key={plan.name} i={i}>
            <div
              className={`relative flex h-full flex-col rounded-3xl p-6 transition-shadow hover:shadow-lg ${
                plan.featured
                  ? "bg-gray-900 text-white shadow-xl ring-1 ring-gray-800"
                  : "border border-gray-100 bg-white shadow-sm"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-dunlo px-3 py-1 text-[11px] font-bold text-white shadow">
                    {plan.badge}
                  </span>
                </div>
              )}
              <div className={plan.badge ? "mt-2" : ""}>
                <p className={`text-xs font-semibold uppercase tracking-widest ${plan.featured ? "text-white/50" : "text-gray-400"}`}>
                  {plan.name}
                </p>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className={`text-4xl font-bold ${plan.featured ? "text-white" : "text-gray-900"}`}>
                    €{plan.price}
                  </span>
                  <span className={`text-sm ${plan.featured ? "text-white/40" : "text-gray-400"}`}>/mo</span>
                </div>
                <p className={`mt-1 text-xs ${plan.featured ? "text-white/40" : "text-gray-400"}`}>{plan.mrr}</p>
              </div>

              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className={`flex items-start gap-2.5 text-sm ${plan.featured ? "text-white/80" : "text-gray-600"}`}>
                    <Check
                      size={15}
                      className={`mt-0.5 shrink-0 ${plan.featured ? "text-dunlo" : "text-dunlo"}`}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to="/login"
                className={`mt-8 flex items-center justify-center rounded-full py-2.5 text-sm font-semibold transition-all active:scale-[0.97] ${
                  plan.featured
                    ? "bg-dunlo text-white hover:bg-dunlo-hover"
                    : "border border-gray-200 text-gray-900 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                Get started free
              </Link>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

/* ─── FAQ ───────────────────────────────────────────────────────────────────── */
const FAQ_ITEMS = [
  { q: "Does Dunlo work with Stripe Connect?", a: "Yes. Dunlo connects to both standard Stripe accounts and Stripe Connect platforms. We read your payment intents and customer data to detect failed payments and trigger recovery flows." },
  { q: "What happens after the beta?", a: "During beta, every plan is free. When we launch, you'll pick the tier that fits. We'll give you a 2-week heads-up before any billing starts." },
  { q: "Will my recovery emails go to spam?", a: "Dunlo sends from your domain via your own email provider. You control deliverability. We avoid spam-trigger patterns and our templates are written for high inbox placement." },
  { q: "How long does setup take?", a: "About 5 minutes: connect Stripe, add your email provider, review the default sequences. No code, no engineering team needed." },
  { q: "Can I cancel anytime?", a: "Yes. No lock-in. During beta there's nothing to cancel. After launch, you can downgrade or pause at any time from your dashboard." },
];

function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" className="mx-auto max-w-2xl px-4 py-24">
      <FadeIn className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
          Common questions
        </h2>
      </FadeIn>
      <div className="divide-y divide-gray-100">
        {FAQ_ITEMS.map((item, i) => (
          <FadeIn key={i} i={i}>
            <div>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between py-5 text-left"
                aria-expanded={open === i}
              >
                <span className="pr-4 text-sm font-semibold text-gray-900">{item.q}</span>
                <ChevronDown
                  size={16}
                  className={`shrink-0 text-gray-400 transition-transform duration-300 ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {open === i && (
                <p className="pb-5 text-sm leading-relaxed text-gray-500">{item.a}</p>
              )}
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

/* ─── CTA Banner ────────────────────────────────────────────────────────────── */
function CtaBanner() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-24">
      <FadeIn>
        <div className="relative overflow-hidden rounded-3xl bg-gray-900 px-8 py-16 text-center">
          {/* Subtle green glow */}
          <div
            className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ width: 400, height: 400, background: "radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)" }}
            aria-hidden
          />
          <p className="relative mb-2 text-xs font-semibold uppercase tracking-widest text-white/40">
            Start for free
          </p>
          <h2 className="relative text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
            Your next payment failure
            <br />
            doesn't have to be lost revenue.
          </h2>
          <p className="relative mt-4 text-lg text-white/50">
            Join the beta. Free until launch. 5-minute setup.
          </p>
          <div className="relative mt-8">
            <Link
              to="/login"
              className="inline-flex items-center gap-0 rounded-full border border-white/10 bg-white/5 px-2 py-2 backdrop-blur-sm transition-all hover:bg-white/10 active:scale-[0.97]"
            >
              <span className="px-4 text-sm font-semibold text-white">Get started now</span>
              <span className="flex items-center gap-1.5 rounded-full bg-dunlo px-4 py-2 text-sm font-semibold text-white">
                for free <ChevronRight size={14} />
              </span>
            </Link>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

/* ─── Footer ────────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white px-4 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-dunlo text-[10px] font-bold text-white">
            D
          </span>
          <span className="text-sm font-semibold text-gray-900">dunlo</span>
          <span className="ml-2 text-xs text-gray-400">Stop losing revenue to failed payments.</span>
        </div>
        <div className="flex items-center gap-6 text-xs text-gray-400">
          {["Privacy", "Terms", "Contact"].map((l) => (
            <a key={l} href="#" className="transition-colors hover:text-gray-700">
              {l}
            </a>
          ))}
          <span>© {new Date().getFullYear()} Dunlo</span>
        </div>
      </div>
    </footer>
  );
}
