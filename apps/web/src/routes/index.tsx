import { Link, createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  CreditCard,
  FileText,
  MailCheck,
  RefreshCcw,
} from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { BuiltByMathieu } from "@/components/landing/built-by-mathieu";
import { Escalation } from "@/components/landing/escalation";
import { Footer } from "@/components/landing/footer";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Nav } from "@/components/landing/nav";
import { RoiCalculator } from "@/components/landing/roi-calculator";
import { StatsBanner } from "@/components/landing/stats-banner";
import { LogoMark } from "@/components/logo";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  SITE_NAME,
  SITE_URL,
  canonicalLink,
  ogMeta,
} from "@/lib/seo";

const FEATURE_ITEMS = [
  {
    label: "Understand",
    title: "Shows why the payment failed",
    body: "Expired card, insufficient funds, bank decline, or do-not-honor are treated as different recovery paths.",
    icon: CreditCard,
  },
  {
    label: "Recover",
    title: "Sends the right follow-up",
    body: "Dunlo matches the Stripe reason to a clearer message, safer timing, and the right payment update path.",
    icon: MailCheck,
  },
  {
    label: "Escalate",
    title: "Keeps important accounts human",
    body: "High-value failures can pause automation and become a founder email draft before the customer goes quiet.",
    icon: FileText,
  },
] as const;

const PLANS = [
  {
    name: "Solo",
    mrr: "< $5k MRR",
    price: "$19",
    tagline: "For founders validating recovery.",
    aiEscalations: "5 AI escalations/mo",
    features: [
      "All failure-code sequences",
      "Unlimited sequence steps",
      "1 team member",
    ],
  },
  {
    name: "Starter",
    mrr: "$5k-$20k MRR",
    price: "$49",
    tagline: "For SaaS with steady failed-payment volume.",
    aiEscalations: "20 AI escalations/mo",
    features: [
      "Weekly recovery summary",
      "Priority scoring",
      "1 team member",
    ],
    featured: true,
  },
  {
    name: "Growth",
    mrr: "$20k-$80k MRR",
    price: "$149",
    tagline: "For teams protecting higher-value accounts.",
    aiEscalations: "Unlimited AI escalations",
    features: [
      "High-value alerts",
      "Recovery insights",
      "Unlimited team members",
    ],
  },
  {
    name: "Scale",
    mrr: "Unlimited MRR",
    price: "$399",
    tagline: "For larger SaaS needing more support.",
    aiEscalations: "Unlimited AI escalations",
    features: [
      "Custom integrations",
      "Priority SLA",
      "Unlimited team members",
    ],
  },
] as const;

const INCLUDED_IN_EVERY_PLAN = [
  "Stripe failure-code detection",
  "Recovery emails by failure type",
  "Secure payment update links",
  "No recovered-revenue percentage",
] as const;

const FAQS = [
  {
    question: "What is involuntary churn?",
    answer:
      "It is churn caused by payment failure rather than a customer choosing to cancel. A good customer can disappear because their card expired, their bank declined a charge, or they missed a payment update email.",
  },
  {
    question: "How is Dunlo different from Stripe Smart Retries?",
    answer:
      "Stripe Smart Retries can keep retrying the card. Dunlo handles the customer communication around the failure: why it happened, what message to send, when to follow up, and when a founder should step in.",
  },
  {
    question: "How is Dunlo different from Triggla or Churn Buster?",
    answer:
      "Dunlo is narrower: Stripe-first recovery, failure-code-specific emails, AI founder escalation, and simple beta pricing instead of a broad lifecycle suite or a recovered-revenue cut.",
  },
  {
    question: "What is the AI escalation feature exactly?",
    answer:
      "When a failed payment crosses your threshold, Dunlo pauses automation and drafts a short personal email from the founder with Stripe context and account value. You can review, regenerate, dismiss, or send it.",
  },
  {
    question: "Is my Stripe data safe?",
    answer:
      "Dunlo uses Stripe data to understand failed-payment context and recovery status. It does not need to move money, change charges, or store card details.",
  },
  {
    question: "How much setup is involved?",
    answer:
      "Connect Stripe, review the default sequences, and add your email provider. The baseline setup does not require an engineering team.",
  },
  {
    question: "What happens during beta?",
    answer:
      "The product is free during beta. Pricing is visible now so you know the direction before Dunlo starts billing.",
  },
] as const;

const SECTION_SURFACE =
  "mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-gray-200 bg-white/75 p-6 shadow-[0_30px_70px_-48px_rgba(28,25,23,0.5)] backdrop-blur-md md:p-8 lg:p-10";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: DEFAULT_TITLE },
      { name: "description", content: DEFAULT_DESCRIPTION },
      ...ogMeta({ title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION }),
    ],
    links: [canonicalLink("/")],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Dunlo",
          applicationCategory: "BusinessApplication",
          description:
            "Stripe payment recovery SaaS that reads failed-payment reasons, sends failure-code-specific recovery emails, and drafts founder escalation emails for high-value accounts.",
          operatingSystem: "Web",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "EUR",
            description: "Free during beta",
          },
          provider: {
            "@type": "Organization",
            name: SITE_NAME,
            url: SITE_URL,
          },
          url: SITE_URL,
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }),
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const posthog = usePostHog();

  const captureCta = (location: string) => {
    posthog.capture("cta_clicked", { location });
  };

  return (
    <div className="min-h-[100dvh] overflow-hidden bg-stone-100 font-sans text-gray-950">
      <Nav />
      <main className="space-y-4 px-3 pb-4 pt-24 md:space-y-5 md:px-4 md:pb-6 md:pt-28">
        <section className="relative -mx-3 px-3 md:-mx-4 md:px-4">
          <OrganicBackdrop />
          <div
            className="relative mx-auto grid min-h-[calc(100dvh-8rem)] max-w-6xl min-w-0 gap-12 py-6 md:grid-cols-[0.92fr_1.08fr] md:items-center md:gap-14 md:py-8"
          >
            <div className="min-w-0 max-w-xl">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-3 py-1.5 text-sm font-medium text-gray-600 shadow-sm backdrop-blur-md"
              >
                <span className="size-1.5 rounded-full bg-dunlo" />
                Free during beta
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.65,
                  delay: 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="mt-8 max-w-[11ch] text-4xl font-semibold leading-[1.02] tracking-tight text-gray-950 sm:max-w-xl sm:text-5xl sm:leading-[0.98] md:text-6xl"
              >
                Recover failed Stripe payments before good customers disappear.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.58,
                  delay: 0.16,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="mt-6 max-w-md text-base leading-7 text-gray-600"
              >
                Dunlo turns Stripe failure reasons into the right recovery
                email, the right retry timing, and a founder-written follow-up
                when the account matters.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.58,
                  delay: 0.2,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="mt-6 grid gap-2 sm:grid-cols-3"
              >
                {[
                  { label: "Stripe signal", value: "failure_code" },
                  { label: "Recovery move", value: "sequence + timing" },
                  { label: "Human layer", value: "founder draft" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-gray-200 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-md"
                  >
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                      {item.label}
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-gray-900">
                      {item.value}
                    </p>
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.58,
                  delay: 0.24,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="mt-8 flex flex-col gap-3 sm:flex-row"
              >
                <Link
                  to="/login"
                  onClick={() => captureCta("hero")}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800 active:scale-[0.98]"
                >
                  See your benchmark
                  <ArrowRight size={16} />
                </Link>
                <a
                  href="#payment-failures"
                  className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white/60 px-5 py-3 text-sm font-semibold text-gray-800 transition-all hover:border-gray-400 hover:bg-white active:scale-[0.98]"
                >
                  Why payments fail
                </a>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.72,
                delay: 0.18,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative min-w-0 md:pl-10"
            >
              <RecoveryConsole />
            </motion.div>
          </div>
        </section>

        <section id="payment-failures" className="scroll-mt-24">
          <div className={SECTION_SURFACE}>
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
                  Payment failures
                </p>
                <h2 className="mt-4 max-w-lg text-3xl font-semibold tracking-tight text-gray-950 md:text-5xl">
                  A failed payment is not one problem.
                </h2>
                <p className="mt-5 max-w-md text-base leading-7 text-gray-600">
                  A card can expire, a bank can decline a charge, or a customer
                  can be short on funds for a few days. Treating all of those
                  moments the same is how recoverable revenue turns into silent
                  churn.
                </p>
              </div>

              <div className="grid gap-3">
                {[
                  {
                    code: "expired_card",
                    plain: "The card needs an update.",
                    move: "Send a secure payment update link quickly.",
                  },
                  {
                    code: "insufficient_funds",
                    plain: "The customer may need a softer retry window.",
                    move: "Wait, retry, and phrase the email with less urgency.",
                  },
                  {
                    code: "do_not_honor",
                    plain: "The bank gave a generic refusal.",
                    move: "Give clear context and escalate if the account value is high.",
                  },
                ].map((item) => (
                  <article
                    key={item.code}
                    className="rounded-[1.25rem] border border-gray-100 bg-white px-4 py-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-mono text-xs font-semibold text-dunlo-deep">
                          {item.code}
                        </p>
                        <h3 className="mt-2 text-base font-semibold tracking-tight text-gray-950">
                          {item.plain}
                        </h3>
                      </div>
                      <p className="max-w-sm text-sm leading-6 text-gray-600">
                        {item.move}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="product" className="scroll-mt-24">
          <div className="mx-auto max-w-6xl">
            <StatsBanner />
          </div>
        </section>

        <section id="features" className="scroll-mt-24">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-gray-900 bg-gray-950 p-6 text-white shadow-[0_30px_70px_-48px_rgba(3,7,18,0.8)] md:p-8 lg:p-10">
            <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
              <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo">
                  Features
                </p>
                <h2 className="mt-4 max-w-xl text-4xl font-semibold leading-[0.95] tracking-tight md:text-5xl">
                  From Stripe signal to recovery action.
                </h2>
                <p className="mt-5 max-w-md text-base leading-7 text-white/60">
                  Dunlo keeps the simple version simple: why did the payment
                  fail, what should the customer hear, and when should a founder
                  step in?
                </p>
              </div>

              <div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                  <div className="rounded-full border border-white/10 bg-white/8 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                    <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-white/35">
                      Stripe reason
                    </p>
                    <p className="mt-1 font-mono text-sm font-semibold text-white">
                      insufficient_funds
                    </p>
                  </div>
                  <ArrowRight
                    size={18}
                    strokeWidth={1.8}
                    className="hidden text-dunlo sm:block"
                  />
                  <div className="rounded-full bg-dunlo px-4 py-3">
                    <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
                      Dunlo action
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      Timed recovery email
                    </p>
                  </div>
                </div>

                <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
                  {FEATURE_ITEMS.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <motion.div
                        key={feature.label}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-70px" }}
                        transition={{
                          duration: 0.38,
                          delay: index * 0.05,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="grid gap-4 py-5 sm:grid-cols-[132px_1fr]"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/8 text-white">
                            <Icon size={17} strokeWidth={1.8} />
                          </span>
                          <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-white/40">
                            {feature.label}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold tracking-tight text-white">
                            {feature.title}
                          </h4>
                          <p className="mt-1 max-w-lg text-sm leading-6 text-white/55">
                            {feature.body}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl">
          <Escalation />
        </div>

        <div className="mx-auto max-w-6xl">
          <BuiltByMathieu />
        </div>

        <div className="mx-auto max-w-6xl">
          <HowItWorks />
        </div>

        <div className="mx-auto max-w-6xl">
          <RoiCalculator />
        </div>

        <section id="pricing" className="scroll-mt-24">
          <div className={SECTION_SURFACE}>
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
                  Pricing
                </p>
                <h2 className="mt-4 max-w-md text-3xl font-semibold tracking-tight text-gray-950 md:text-5xl">
                  Free while the beta is open.
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-gray-600 lg:justify-self-end">
                Every tier gets failure-code sequences and AI-drafted
                escalations. The tier only follows your MRR when Dunlo starts
                billing.
              </p>
            </div>

            <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-gray-100 bg-white">
              <div className="hidden lg:grid lg:grid-cols-[1fr_repeat(4,minmax(0,1fr))]">
                <div className="border-b border-gray-100 px-5 py-4">
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                    Plan
                  </p>
                </div>
                {PLANS.map((plan) => (
                  <div
                    key={plan.name}
                    className={`border-b border-l border-gray-100 px-5 py-4 ${
                      plan.featured ? "bg-gray-950 text-white" : ""
                    }`}
                  >
                    <div className="flex min-h-6 items-center justify-between gap-3">
                      <p className="text-base font-semibold">{plan.name}</p>
                      {plan.featured && (
                        <span className="rounded-full bg-dunlo px-2.5 py-1 text-[11px] font-semibold text-white">
                          Common
                        </span>
                      )}
                    </div>
                    <p
                      className={`mt-2 text-xs leading-5 ${
                        plan.featured ? "text-white/55" : "text-gray-500"
                      }`}
                    >
                      {plan.tagline}
                    </p>
                  </div>
                ))}

                {[
                  {
                    label: "MRR fit",
                    values: PLANS.map((plan) => plan.mrr),
                  },
                  {
                    label: "After beta",
                    values: PLANS.map((plan) => `${plan.price}/mo`),
                    mono: true,
                  },
                  {
                    label: "AI escalation",
                    values: PLANS.map((plan) => plan.aiEscalations),
                    highlight: true,
                  },
                ].map((row) => (
                  <div key={row.label} className="contents">
                    <div
                      className="border-b border-gray-100 px-5 py-4 text-sm font-medium text-gray-500"
                    >
                      {row.label}
                    </div>
                    {row.values.map((value, index) => (
                      <div
                        key={`${row.label}-${PLANS[index].name}`}
                        className={`border-b border-l border-gray-100 px-5 py-4 text-sm ${
                          PLANS[index].featured
                            ? "bg-gray-950 text-white"
                            : "text-gray-700"
                        } ${row.mono ? "font-mono font-semibold" : ""} ${
                          row.highlight && PLANS[index].featured
                            ? "font-semibold text-dunlo"
                            : row.highlight
                              ? "font-semibold text-dunlo-deep"
                              : ""
                        }`}
                      >
                        {value}
                      </div>
                    ))}
                  </div>
                ))}

                <div className="px-5 py-4 text-sm font-medium text-gray-500">
                  Plan-specific
                </div>
                {PLANS.map((plan) => (
                  <div
                    key={`${plan.name}-features`}
                    className={`border-l border-gray-100 px-5 py-4 ${
                      plan.featured ? "bg-gray-950 text-white" : ""
                    }`}
                  >
                    <ul className="space-y-2">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className={`flex items-start gap-2 text-xs leading-5 ${
                            plan.featured ? "text-white/65" : "text-gray-600"
                          }`}
                        >
                          <Check
                            size={13}
                            strokeWidth={2}
                            className={
                              plan.featured
                                ? "mt-0.5 shrink-0 text-dunlo"
                                : "mt-0.5 shrink-0 text-dunlo-deep"
                            }
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="divide-y divide-gray-100 lg:hidden">
                {PLANS.map((plan) => (
                  <div
                    key={plan.name}
                    className={`p-4 ${
                      plan.featured ? "bg-gray-950 text-white" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold">{plan.name}</p>
                        <p
                          className={`mt-1 text-xs leading-5 ${
                            plan.featured ? "text-white/55" : "text-gray-500"
                          }`}
                        >
                          {plan.tagline}
                        </p>
                      </div>
                      <p className="font-mono text-sm font-semibold">
                        {plan.price}/mo
                      </p>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p
                          className={
                            plan.featured ? "text-white/40" : "text-gray-400"
                          }
                        >
                          MRR fit
                        </p>
                        <p className="mt-1 font-medium">{plan.mrr}</p>
                      </div>
                      <div>
                        <p
                          className={
                            plan.featured ? "text-white/40" : "text-gray-400"
                          }
                        >
                          AI escalation
                        </p>
                        <p
                          className={`mt-1 font-semibold ${
                            plan.featured ? "text-dunlo" : "text-dunlo-deep"
                          }`}
                        >
                          {plan.aiEscalations}
                        </p>
                      </div>
                    </div>
                    <ul className="mt-4 grid gap-2 sm:grid-cols-3">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className={`flex items-center gap-2 text-xs ${
                            plan.featured ? "text-white/65" : "text-gray-600"
                          }`}
                        >
                          <Check
                            size={13}
                            strokeWidth={2}
                            className={
                              plan.featured
                                ? "shrink-0 text-dunlo"
                                : "shrink-0 text-dunlo-deep"
                            }
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-3 rounded-[1.25rem] border border-gray-100 bg-white px-4 py-3 sm:grid-cols-2 lg:grid-cols-4">
              {INCLUDED_IN_EVERY_PLAN.map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-dunlo/12 text-dunlo-deep">
                    <Check size={13} strokeWidth={2} />
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-24">
          <div className={`${SECTION_SURFACE} grid gap-10 md:grid-cols-[0.7fr_1.3fr]`}>
            <h2 className="text-3xl font-semibold tracking-tight text-gray-950 md:text-5xl">
              A few clean answers.
            </h2>
            <div className="divide-y divide-gray-300/70 border-y border-gray-300/70">
              {FAQS.map((item) => (
                <article key={item.question} className="py-6">
                  <h3 className="text-lg font-semibold tracking-tight text-gray-950">
                    {item.question}
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
                    {item.answer}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto flex max-w-6xl flex-col gap-8 rounded-[2rem] border border-gray-900 bg-gray-950 p-6 text-white shadow-[0_30px_70px_-48px_rgba(3,7,18,0.8)] md:flex-row md:items-end md:justify-between md:p-8 lg:p-10">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo">
                Beta access
              </p>
              <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight md:text-5xl">
                Find the revenue hiding in failed payments.
              </h2>
            </div>
            <Link
              to="/login"
              onClick={() => captureCta("final_cta")}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-dunlo px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-dunlo-hover active:scale-[0.98]"
            >
              Start free
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function OrganicBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-x-0 top-0 h-px bg-gray-200" />
      <svg
        viewBox="0 0 960 640"
        className="absolute right-[-22rem] top-16 h-[520px] w-[780px] text-gray-300 md:right-[-10rem]"
        fill="none"
      >
        <path
          d="M46 398C188 261 280 478 424 340C552 217 611 140 790 195C876 222 900 136 924 86"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M14 472C180 284 314 552 476 390C600 266 640 224 810 264C894 284 914 214 946 160"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.65"
        />
        <path
          d="M98 548C222 430 326 584 468 500C642 398 626 310 782 352C884 380 906 314 950 270"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.45"
        />
      </svg>
      <div className="absolute left-4 top-40 h-[70vh] w-px bg-gray-200/70 md:left-[12vw]" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-stone-100 to-transparent" />
    </div>
  );
}

function RecoveryConsole() {
  return (
    <div className="relative mx-auto w-full max-w-[500px] overflow-hidden rounded-[2rem] border border-gray-200 bg-white/88 p-3 shadow-[0_35px_90px_-58px_rgba(28,25,23,0.75)] backdrop-blur-md">
      <div
        className="absolute inset-0 bg-[linear-gradient(rgba(17,24,39,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(17,24,39,0.04)_1px,transparent_1px)] [background-size:32px_32px]"
        aria-hidden
      />

      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative overflow-hidden rounded-[1.7rem] border border-gray-100 bg-white p-5 text-gray-950 shadow-[0_30px_70px_-52px_rgba(28,25,23,0.8)]"
      >
        <div
          className="absolute inset-x-0 top-0 h-px bg-white"
          aria-hidden
        />
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LogoMark size={30} />
            <div>
              <p className="text-sm font-semibold">Recovery preview</p>
              <p className="text-xs text-gray-400">Stripe failure handled</p>
            </div>
          </div>
          <span className="flex items-center gap-2 rounded-full bg-dunlo/10 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-dunlo-deep">
            <span className="size-1.5 animate-pulse rounded-full bg-dunlo" />
            Live
          </span>
        </div>

        <div className="mt-5 rounded-[1.5rem] border border-gray-100 bg-stone-50/80 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
              Stripe event
            </p>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-700">
              Failed
            </span>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <p className="truncate font-mono text-sm font-semibold text-gray-950">
                invoice.payment_failed
              </p>
              <p className="mt-1 truncate font-mono text-xs text-gray-400">
                insufficient_funds
              </p>
            </div>
            <p className="font-mono text-2xl font-semibold tracking-tight text-gray-950">
              $1,860
            </p>
          </div>

          <div className="my-4 h-px bg-gray-200/80" />

          <div className="rounded-[1.2rem] border border-gray-100 bg-white p-3 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-dunlo/12 text-dunlo-deep">
                <MailCheck size={16} strokeWidth={1.8} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold text-gray-950">
                    Email queued
                  </p>
                  <span className="shrink-0 rounded-full bg-gray-950 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                    36h
                  </span>
                </div>
                <p className="mt-1 text-sm leading-6 text-gray-500">
                  Uses the decline code to pick tone, timing, and retry window.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-[1.2rem] border border-dunlo/25 bg-dunlo/10 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-dunlo-deep">
                  <Check size={16} strokeWidth={2} />
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em]">
                    Protected
                  </p>
                </div>
                <p className="mt-3 font-mono text-3xl font-semibold tracking-tight text-gray-950">
                  $1,860
                </p>
              </div>
              <p className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-dunlo-deep shadow-sm">
                Payment safe
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {[
            { icon: CreditCard, label: "Read code" },
            { icon: RefreshCcw, label: "Time retry" },
            { icon: MailCheck, label: "Send email" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-500 shadow-sm"
            >
              <Icon
                size={14}
                strokeWidth={1.8}
                className="shrink-0 text-dunlo-deep"
              />
              <span className="truncate">{label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
