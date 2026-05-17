import { Link, createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BellRing,
  Check,
  CreditCard,
  FileText,
  Gauge,
  MailCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { Footer } from "@/components/landing/footer";
import { Nav } from "@/components/landing/nav";
import { LogoMark } from "@/components/logo";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  SITE_NAME,
  SITE_URL,
  canonicalLink,
  ogMeta,
} from "@/lib/seo";

const RECOVERY_STEPS = [
  {
    label: "Read the code",
    title: "Dunlo starts with the Stripe failure reason.",
    body: "Expired card, insufficient funds, bank decline, and do-not-honor should not receive the same message.",
    icon: CreditCard,
  },
  {
    label: "Send the right nudge",
    title: "Each customer gets a short recovery email.",
    body: "The message matches the failure, links to payment update, and lands while the intent is still warm.",
    icon: MailCheck,
  },
  {
    label: "Escalate carefully",
    title: "High-value accounts get a founder draft.",
    body: "When the payment matters, automation pauses and Dunlo drafts the personal follow-up for you.",
    icon: BellRing,
  },
] as const;

const FEATURE_ITEMS = [
  {
    label: "Failure routing",
    word: "Route",
    title: "Map the Stripe code before writing.",
    body: "Expired cards, bank declines, insufficient funds, and do-not-honor events stop sharing the same generic path.",
    signal: "expired_card -> update link",
    icon: MailCheck,
  },
  {
    label: "Recovery sequences",
    word: "Nudge",
    title: "Send the right message at the right moment.",
    body: "Each failure type gets its own timing, copy, and CTA, so the customer gets a clear next step.",
    signal: "3-step sequence",
    icon: Gauge,
  },
  {
    label: "Founder escalation",
    word: "Pause",
    title: "Stop automation when the account matters.",
    body: "For high-value failures, Dunlo prepares a personal draft and lets you decide what goes out.",
    signal: "draft ready",
    icon: FileText,
  },
  {
    label: "Ownership",
    word: "Own",
    title: "Keep the relationship and the economics clean.",
    body: "Send from your provider, keep Stripe as the source of truth, and avoid recovered-revenue fees.",
    signal: "your domain",
    icon: ShieldCheck,
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
    question: "How much setup is involved?",
    answer:
      "Connect Stripe, review the default sequences, and add your email provider. Most teams can see their recovery benchmark in a few minutes.",
  },
  {
    question: "What happens during beta?",
    answer:
      "The product is free during beta. Pricing is visible so you know the direction before Dunlo starts billing.",
  },
  {
    question: "Does Dunlo replace Stripe Smart Retries?",
    answer:
      "No. Stripe can keep retrying cards. Dunlo handles the customer communication and founder escalation around those failures.",
  },
] as const;

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
            "Stripe payment recovery SaaS that reads the failure code first, sends precise recovery emails, and drafts founder escalation emails for high-value failures.",
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
      <main>
        <section className="relative min-h-[100dvh] px-4 pt-28 pb-10 md:px-6 md:pt-32">
          <OrganicBackdrop />
          <div className="relative mx-auto grid max-w-6xl gap-14 md:grid-cols-[0.92fr_1.08fr] md:items-center">
            <div className="max-w-xl">
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
                className="mt-8 text-5xl font-semibold leading-[0.98] tracking-tight text-gray-950 md:text-6xl"
              >
                Recover failed Stripe payments with a lighter touch.
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
                Dunlo reads the failure code, sends the right recovery email,
                and saves founder attention for the payments that actually need
                it.
              </motion.p>

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
                  href="#product"
                  className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white/60 px-5 py-3 text-sm font-semibold text-gray-800 transition-all hover:border-gray-400 hover:bg-white active:scale-[0.98]"
                >
                  View the recovery path
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
              className="relative md:pl-10"
            >
              <RecoveryConsole />
            </motion.div>
          </div>
        </section>

        <section id="product" className="px-4 py-10 md:px-6 md:py-16">
          <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
                Recovery path
              </p>
              <h2 className="mt-4 max-w-sm text-3xl font-semibold tracking-tight text-gray-950 md:text-5xl">
                One calm system for the messy part of SaaS billing.
              </h2>
            </div>

            <div className="space-y-5">
              {RECOVERY_STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.article
                    key={step.label}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.08,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="grid gap-5 border-t border-gray-300/70 py-6 md:grid-cols-[120px_1fr]"
                  >
                    <div className="flex items-center gap-3 md:block">
                      <span className="flex size-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-950 shadow-sm">
                        <Icon size={18} strokeWidth={1.8} />
                      </span>
                      <p className="mt-0 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-gray-400 md:mt-4">
                        0{index + 1}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-dunlo-deep">
                        {step.label}
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
                        {step.title}
                      </h3>
                      <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600">
                        {step.body}
                      </p>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="features" className="px-4 py-10 md:px-6 md:py-16">
          <div className="mx-auto max-w-6xl">
            <div className="border-y border-gray-300/70 py-10 md:py-14">
              <div className="grid gap-10 md:grid-cols-[0.72fr_1.28fr]">
                <div>
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
                    Features
                  </p>
                  <h2 className="mt-4 max-w-sm text-3xl font-semibold tracking-tight text-gray-950 md:text-5xl">
                    Four useful controls. Nothing ornamental.
                  </h2>
                  <p className="mt-5 max-w-sm text-sm leading-6 text-gray-600">
                    Dunlo stays narrow on purpose: understand the failure, move
                    the customer, surface the account, keep ownership clear.
                  </p>
                </div>

                <div className="divide-y divide-gray-300/70">
                  {FEATURE_ITEMS.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <motion.article
                        key={feature.label}
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-70px" }}
                        transition={{
                          duration: 0.42,
                          delay: index * 0.04,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="grid gap-5 py-7 md:grid-cols-[0.38fr_1fr]"
                      >
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="flex size-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-950">
                              <Icon size={16} strokeWidth={1.8} />
                            </span>
                            <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                              {feature.label}
                            </p>
                          </div>
                          <p className="mt-5 text-3xl font-semibold tracking-tight text-gray-950 md:text-4xl">
                            {feature.word}
                          </p>
                        </div>

                        <div className="md:pt-1">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <h3 className="max-w-md text-xl font-semibold tracking-tight text-gray-950">
                              {feature.title}
                            </h3>
                            <span className="w-fit rounded-full border border-dunlo/20 bg-dunlo/8 px-3 py-1 font-mono text-[11px] font-semibold text-dunlo-deep">
                              {feature.signal}
                            </span>
                          </div>
                          <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600">
                            {feature.body}
                          </p>
                        </div>
                      </motion.article>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="px-4 py-10 md:px-6 md:py-16">
          <div className="mx-auto max-w-6xl rounded-[2rem] border border-gray-200 bg-white/75 p-5 shadow-[0_30px_70px_-45px_rgba(28,25,23,0.45)] backdrop-blur-md md:p-8">
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

        <section id="faq" className="px-4 py-10 md:px-6 md:py-16">
          <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.7fr_1.3fr]">
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

        <section className="px-4 pt-10 pb-16 md:px-6 md:pt-16">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 rounded-[2rem] bg-gray-950 p-6 text-white md:flex-row md:items-end md:justify-between md:p-10">
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
    <div className="relative overflow-hidden rounded-[2rem] border border-gray-200 bg-white/80 p-4 shadow-[0_35px_90px_-50px_rgba(28,25,23,0.75)] backdrop-blur-md md:p-5">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <LogoMark size={26} />
          <div>
            <p className="text-sm font-semibold text-gray-950">Recovery room</p>
            <p className="text-xs text-gray-400">Stripe events flowing in</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-dunlo/10 px-3 py-1 text-xs font-semibold text-dunlo-deep">
          <span className="size-1.5 animate-pulse rounded-full bg-dunlo" />
          Live
        </div>
      </div>

      <div className="grid gap-4 pt-4 md:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3">
          <PaymentEvent
            company="Luma Desk"
            code="expired_card"
            amount="$890"
            status="Update link sent"
            active
          />
          <PaymentEvent
            company="Northstar CRM"
            code="insufficient_funds"
            amount="$1,420"
            status="Retry window set"
          />
          <PaymentEvent
            company="Orbit Ledger"
            code="do_not_honor"
            amount="$3,280"
            status="Founder draft"
          />
        </div>

        <div className="rounded-[1.4rem] border border-gray-100 bg-stone-50 p-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
              This month
            </p>
            <Sparkles size={16} className="text-dunlo-deep" strokeWidth={1.8} />
          </div>
          <p className="mt-5 font-mono text-4xl font-semibold tracking-tight text-gray-950">
            $12,480
          </p>
          <p className="mt-2 text-sm text-gray-500">Recovered revenue</p>
          <div className="mt-8 space-y-3">
            {[
              ["Recovered", "41"],
              ["In recovery", "17"],
              ["Escalated", "6"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{label}</span>
                <span className="font-mono text-sm font-semibold text-gray-950">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentEvent({
  company,
  code,
  amount,
  status,
  active,
}: {
  company: string;
  code: string;
  amount: string;
  status: string;
  active?: boolean;
}) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_96px] items-center gap-3 rounded-[1.25rem] border border-gray-100 bg-white px-4 py-3 shadow-sm">
      <span
        className={`flex size-9 items-center justify-center rounded-full ${
          active ? "bg-dunlo/15 text-dunlo-deep" : "bg-gray-100 text-gray-500"
        }`}
      >
        <Check size={16} strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-gray-950">
          {company}
        </p>
        <p className="truncate font-mono text-xs text-gray-400">{code}</p>
      </div>
      <div className="text-right">
        <p className="font-mono text-sm font-semibold text-gray-950">{amount}</p>
        <p className="truncate text-xs text-gray-400">{status}</p>
      </div>
    </div>
  );
}
