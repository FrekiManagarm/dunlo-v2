import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BellRing,
  Check,
  ChevronRight,
  MailCheck,
  Sparkles,
  SquareActivity,
  TimerReset,
} from "lucide-react";
import { SIGNUP_URL } from "@/lib/app-url";
import { BuiltByMathieu } from "@/components/landing/built-by-mathieu";
import { Escalation } from "@/components/landing/escalation";
import { Footer } from "@/components/landing/footer";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Nav } from "@/components/landing/nav";
import { RoiCalculator } from "@/components/landing/roi-calculator";

const recoveredEvents = [
  {
    company: "Northstar Labs",
    reason: "insufficient_funds",
    amount: "$348",
    status: "Retry in 4h",
  },
  {
    company: "Hearthline",
    reason: "expired_card",
    amount: "$87",
    status: "Email sent",
  },
  {
    company: "RivetDesk",
    reason: "authentication_required",
    amount: "$129",
    status: "Founder draft",
  },
] as const;

const signalCards = [
  {
    title: "Stripe tells you why",
    body: "Dunlo reads decline codes, account value, retry history, and customer age before a message goes out.",
    icon: SquareActivity,
  },
  {
    title: "Customers hear the right thing",
    body: "Expired card, bank decline, SCA, soft decline, and lost payment method each get their own recovery path.",
    icon: MailCheck,
  },
  {
    title: "You step in only when it matters",
    body: "High-value accounts and repeated failures get paused with a founder-ready note instead of more automation.",
    icon: BellRing,
  },
] as const;

const recoveryPaths = [
  {
    code: "expired_card",
    line: "Customer gets a calm card-update email with Stripe-hosted checkout.",
    timing: "2 messages over 5 days",
  },
  {
    code: "insufficient_funds",
    line: "Retry waits for a better window before Dunlo nudges the customer.",
    timing: "retry + email cadence",
  },
  {
    code: "authentication_required",
    line: "Message explains the bank approval step without sounding like a generic dunning blast.",
    timing: "SCA-specific copy",
  },
  {
    code: "do_not_honor",
    line: "Dunlo routes the account to a founder review before the customer relationship gets noisy.",
    timing: "manual escalation",
  },
] as const;

const proofRows = [
  ["$18.4k", "failed MRR watched"],
  ["47.2%", "accounts need custom timing"],
  ["8 min", "median setup path"],
  ["0%", "recovered-revenue fee"],
] as const;

const resourceLinks = [
  {
    href: "/stripe-failed-payments",
    title: "Stripe failed payments guide",
    body: "Learn why payments fail and which decline reasons deserve a different recovery path.",
  },
  {
    href: "/stripe-dunning",
    title: "Stripe dunning strategy",
    body: "Compare retry timing, customer emails, and founder escalation for SaaS dunning.",
  },
  {
    href: "/benchmark",
    title: "Failed-payment benchmark",
    body: "Estimate how much recoverable revenue is sitting in your Stripe account.",
  },
  {
    href: "/alternatives/stripe-smart-retries",
    title: "Stripe Smart Retries alternative",
    body: "See where Smart Retries ends and customer-facing payment recovery starts.",
  },
] as const;

const faqItems = [
  {
    question: "Is this just Stripe Smart Retries with nicer emails?",
    answer:
      "No. Stripe can retry cards. Dunlo handles the customer-facing recovery layer around Stripe: message, timing, founder escalation, and recovered-revenue reporting.",
  },
  {
    question: "Will customers know an automation sent the email?",
    answer:
      "The copy is plain, specific, and tied to the payment reason. High-value or sensitive accounts can be paused for a founder note before anything goes out.",
  },
  {
    question: "Do I pay during beta?",
    answer:
      "No. Dunlo is free during beta. The public pricing direction exists so founders know what happens after the beta period.",
  },
  {
    question: "Does Dunlo store card numbers?",
    answer:
      "No. Card updates happen through Stripe-hosted flows. Dunlo uses payment and subscription context, not full card numbers or CVC data.",
  },
] as const;

export function LandingPage() {
  return (
    <div className="min-h-dvh overflow-hidden bg-stone-50 font-sans text-gray-950">
      <Nav />
      <main>
        <HeroSection />
        {/*<ProofStrip />*/}
        <RestoredSection>
          <Escalation />
        </RestoredSection>
        <ResourceLinksSection />
        <SignalSection />
        <RecoveryPathsSection />
        <RestoredSection>
          <HowItWorks />
        </RestoredSection>
        <RestoredSection>
          <RoiCalculator />
        </RestoredSection>
        {/*<RestoredSection>
          <PublicProofLayer compact />
        </RestoredSection>
        <RestoredSection>
          <BetaTestimonialsSection compact showEmptyState />
        </RestoredSection>*/}
        <PricingSection />
        <FaqSection />
        <section className="px-4 py-6 md:px-6 md:py-8">
          <BuiltByMathieu />
        </section>
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative flex min-h-dvh items-center overflow-hidden px-4 py-28 md:px-6 md:py-32">
      <GridBackdrop />
      <div className="relative mx-auto grid w-full max-w-7xl min-w-0 gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="min-w-0 max-w-3xl">
          <div className="anim-1 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-3 py-1.5 text-sm font-semibold text-gray-700 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.4)] backdrop-blur-md">
            <span className="flex size-2.5 rounded-full bg-dunlo" />
            Stripe payment recovery, free in beta
          </div>
          <h1 className="anim-2 mt-7 max-w-2xl text-4xl font-semibold leading-none tracking-tight text-gray-950 sm:text-5xl md:text-6xl lg:text-7xl">
            Recover the payments that quietly churn.
          </h1>
          <p className="anim-3 mt-6 max-w-[58ch] text-base leading-7 text-gray-600 md:text-lg">
            Dunlo recovers failed Stripe payments by explaining what happened,
            sending the right recovery message, and pausing risky accounts for
            founder review.
          </p>
          <div className="anim-4 mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={SIGNUP_URL}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800 active:scale-[0.98] sm:w-auto"
            >
              Start free in beta
              <ArrowRight
                size={16}
                strokeWidth={2}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            <a
              href="#recovery-paths"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white/75 px-5 py-3 text-sm font-semibold text-gray-800 transition-all hover:border-gray-400 hover:bg-white active:scale-[0.98] sm:w-auto"
            >
              See recovery paths
              <ChevronRight size={16} strokeWidth={2} />
            </a>
          </div>
          {/*<div className="anim-5 mt-10 grid max-w-xl grid-cols-3 divide-x divide-gray-200 border-y border-gray-200 py-4">
            {proofRows.slice(0, 3).map(([value, label]) => (
              <div key={label} className="px-4 first:pl-0 last:pr-0">
                <p className="font-mono text-lg font-semibold tracking-tight text-gray-950 md:text-2xl">
                  {value}
                </p>
                <p className="mt-1 text-xs font-medium leading-4 text-gray-500">
                  {label}
                </p>
              </div>
            ))}
          </div>*/}
        </div>

        <div className="anim-3 min-w-0">
          <RecoveryDesk />
        </div>
      </div>
    </section>
  );
}

function RestoredSection({ children }: { children: ReactNode }) {
  return (
    <section className="px-4 py-8 md:px-6 md:py-14">
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

function RecoveryDesk() {
  return (
    <div className="relative mx-auto w-full min-w-0 max-w-2xl overflow-hidden rounded-[2rem]">
      <div className="relative overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-[0_40px_100px_-55px_rgba(15,23,42,0.58)]">
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/70 px-4 py-3 md:px-5">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-gray-300" />
              <span className="size-2.5 rounded-full bg-gray-300" />
              <span className="size-2.5 rounded-full bg-dunlo" />
            </div>
            <span className="ml-2 font-mono text-xs font-semibold text-gray-500">
              recovery-desk
            </span>
          </div>
          <span className="rounded-full border border-dunlo/30 bg-dunlo/10 px-3 py-1 text-xs font-semibold text-dunlo-deep">
            monitoring
          </span>
        </div>
        <div className="grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="border-b border-gray-200 p-4 md:p-5 lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                  Failed payments
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">
                  Needs action today
                </h2>
              </div>
              <TimerReset className="text-dunlo-deep" size={21} />
            </div>
            <div className="mt-5 space-y-3">
              {recoveredEvents.map((event, index) => (
                <div
                  key={event.company}
                  className="landing-float rounded-2xl border border-gray-100 bg-gray-50 p-3"
                  style={{ animationDelay: `${index * 160}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-950">
                        {event.company}
                      </p>
                      <p className="mt-1 font-mono text-[11px] font-medium text-gray-500">
                        {event.reason}
                      </p>
                    </div>
                    <p className="font-mono text-sm font-semibold text-gray-950">
                      {event.amount}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-600">
                      {event.status}
                    </span>
                    <span className="h-px w-12 bg-dunlo/50" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 md:p-5">
            <div className="rounded-[1.5rem] border border-gray-100 bg-gray-950 p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] md:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-dunlo">
                    Founder escalation
                  </p>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight">
                    Draft ready for RivetDesk
                  </h3>
                </div>
                <Sparkles size={20} className="text-dunlo" />
              </div>
              <div className="mt-5 space-y-2.5 rounded-2xl bg-white/10 p-4 text-sm leading-6 text-white/72">
                <p>Subject: RivetDesk payment approval</p>
                <p>The note explains the bank step and links back to Stripe.</p>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {["Review", "Regenerate", "Send"].map((action) => (
                  <button
                    key={action}
                    className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-white/80 transition-all hover:bg-white/15 active:scale-[0.98]"
                    type="button"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 p-3">
              <div className="landing-marquee flex w-max gap-3">
                {[...proofRows, ...proofRows].map(([value, label], index) => (
                  <div
                    key={`${label}-${index}`}
                    className="flex min-w-40 items-center gap-3 rounded-full bg-white px-3 py-2"
                  >
                    <span className="font-mono text-sm font-semibold">
                      {value}
                    </span>
                    <span className="text-xs font-medium text-gray-500">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProofStrip() {
  return (
    <section className="px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto grid max-w-7xl gap-4 border-y border-gray-200 py-5 md:grid-cols-[1.2fr_0.8fr] md:items-center">
        <p className="max-w-3xl text-xl font-semibold tracking-tight text-gray-950 md:text-3xl">
          Built for founders who know failed payments are not cancellations.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4">
          {proofRows.map(([value, label]) => (
            <div key={label} className="rounded-2xl bg-white/70 p-4">
              <p className="font-mono text-lg font-semibold">{value}</p>
              <p className="mt-1 text-xs font-medium leading-4 text-gray-500">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ResourceLinksSection() {
  return (
    <section className="px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto grid max-w-7xl gap-5 rounded-[2rem] border border-gray-200 bg-white/75 p-5 md:grid-cols-[0.72fr_1.28fr] md:p-6">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
            Learn
          </p>
          <h2 className="mt-3 max-w-sm text-3xl font-semibold leading-none tracking-tight md:text-4xl">
            Stripe payment recovery, from diagnosis to action.
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {resourceLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-3xl border border-gray-100 bg-stone-50 p-4 transition-all hover:-translate-y-0.5 hover:border-dunlo/40 hover:bg-white active:scale-[0.99]"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-gray-950">
                {item.title}
                <ChevronRight
                  className="text-dunlo-deep transition-transform group-hover:translate-x-0.5"
                  size={15}
                  strokeWidth={2}
                />
              </span>
              <span className="mt-2 block text-sm leading-6 text-gray-600">
                {item.body}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function SignalSection() {
  return (
    <section id="features" className="px-4 py-12 md:px-6 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-[0.74fr_1.26fr] md:items-end">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
              Signal to message
            </p>
            <h2 className="mt-4 max-w-lg text-4xl font-semibold leading-none tracking-tight md:text-6xl">
              The recovery path changes with the failure.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-gray-600 md:justify-self-end">
            The workflow stays visible from the first failed charge: payment
            context in, customer-safe recovery action out.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-gray-200 bg-white p-5 shadow-[0_30px_80px_-55px_rgba(15,23,42,0.45)] md:p-7">
            <div className="grid gap-3 md:grid-cols-3">
              {signalCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className="landing-rise rounded-[1.5rem] border border-gray-100 bg-gray-50 p-4"
                    style={{ animationDelay: `${index * 120}ms` }}
                  >
                    <Icon className="text-dunlo-deep" size={22} />
                    <h3 className="mt-5 text-lg font-semibold tracking-tight">
                      {card.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-gray-600">
                      {card.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-[2rem] border border-gray-200 bg-gray-950 p-5 text-white md:p-7">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo">
              Today
            </p>
            <div className="mt-8 space-y-5">
              <div>
                <p className="font-mono text-5xl font-semibold tracking-tight">
                  $2,784
                </p>
                <p className="mt-2 text-sm font-medium text-white/55">
                  open failed-payment revenue
                </p>
              </div>
              <div className="h-px bg-white/10" />
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["6", "safe to automate"],
                  ["3", "needs founder review"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl bg-white/10 p-4">
                    <p className="font-mono text-3xl font-semibold">{value}</p>
                    <p className="mt-1 text-xs font-medium text-white/50">
                      {label}
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

function RecoveryPathsSection() {
  return (
    <section
      id="recovery-paths"
      className="scroll-mt-24 px-4 py-12 md:px-6 md:py-20"
    >
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
            Recovery paths
          </p>
          <h2 className="mt-4 max-w-xl text-4xl font-semibold leading-none tracking-tight md:text-6xl">
            Same product, different reason, different move.
          </h2>
          <p className="mt-5 max-w-[58ch] text-base leading-7 text-gray-600">
            These are the decisions Dunlo makes around Stripe before your
            customer ever sees an email.
          </p>
        </div>
        <div className="space-y-3">
          {recoveryPaths.map((path, index) => (
            <div
              key={path.code}
              className="group grid gap-5 rounded-[1.5rem] border border-gray-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-dunlo/40 md:grid-cols-[0.42fr_1fr_auto] md:items-center md:p-6"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-dunlo/12 font-mono text-sm font-semibold text-dunlo-deep">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="font-mono text-sm font-semibold text-gray-950">
                  {path.code}
                </p>
              </div>
              <p className="text-sm leading-6 text-gray-600">{path.line}</p>
              <span className="w-fit rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 group-hover:border-dunlo/40 group-hover:text-dunlo-deep">
                {path.timing}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="scroll-mt-24 px-4 py-12 md:px-6 md:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
            Beta pricing
          </p>
          <h2 className="mt-4 max-w-xl text-4xl font-semibold leading-none tracking-tight md:text-6xl">
            Free while Dunlo is in beta.
          </h2>
          <p className="mt-5 max-w-[58ch] text-base leading-7 text-gray-600">
            No recovered-revenue cut. No long migration. Dunlo is priced like a
            focused Stripe recovery tool, not a finance suite.
          </p>
        </div>
        <div className="rounded-[2rem] border border-gray-200 bg-white p-5 shadow-[0_30px_90px_-62px_rgba(15,23,42,0.55)] md:p-7">
          <div className="grid gap-4 md:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-[1.5rem] bg-gray-950 p-5 text-white">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo">
                Beta
              </p>
              <p className="mt-7 font-mono text-5xl font-semibold">$0</p>
              <p className="mt-2 text-sm font-medium text-white/55">
                until beta ends
              </p>
              <Link
                href={SIGNUP_URL}
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-dunlo px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-dunlo-hover active:scale-[0.98]"
              >
                Start free
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid gap-2">
              {[
                "Stripe failure-code detection",
                "Recovery emails by failure type",
                "Secure Stripe update links",
                "Founder escalation drafts",
                "Recovered-revenue tracking",
              ].map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-dunlo/12 text-dunlo-deep">
                    <Check size={15} strokeWidth={2} />
                  </span>
                  <span className="text-sm font-semibold text-gray-700">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-24 px-4 py-12 md:px-6 md:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[0.7fr_1.3fr]">
        <h2 className="max-w-md text-4xl font-semibold leading-none tracking-tight md:text-6xl">
          Straight answers for cautious founders.
        </h2>
        <div className="border-y border-gray-300">
          {faqItems.map((item, index) => (
            <details
              key={item.question}
              className="group border-b border-gray-300 py-3 last:border-b-0"
              open={index === 0}
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-3 text-lg font-semibold tracking-tight marker:hidden [&::-webkit-details-marker]:hidden">
                {item.question}
                <ChevronRight
                  aria-hidden
                  className="mt-1 shrink-0 text-gray-500 transition-transform group-open:rotate-90"
                  size={18}
                />
              </summary>
              <p className="max-w-3xl pb-3 text-sm leading-6 text-gray-600">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="px-4 py-6 md:px-6 md:py-10">
      <div className="mx-auto grid max-w-7xl gap-8 rounded-[2rem] bg-gray-950 p-6 text-white md:p-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo">
            Recover before churn
          </p>
          <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-none tracking-tight md:text-6xl">
            Your failed payments already have a reason. Give each one a better
            next step.
          </h2>
        </div>
        <Link
          href={SIGNUP_URL}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-dunlo px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-dunlo-hover active:scale-[0.98]"
        >
          Start free in beta
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}

function GridBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.045)_1px,transparent_1px)] bg-size[72px_72px]" />
      <div className="absolute left-[5vw] top-0 h-full w-px bg-gray-200" />
      <div className="absolute right-[7vw] top-0 h-full w-px bg-gray-200" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-stone-50 to-transparent" />
    </div>
  );
}
