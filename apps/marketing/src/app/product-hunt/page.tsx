import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BanknoteArrowUp,
  BellRing,
  Check,
  Clock3,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  SquareActivity,
} from "lucide-react";
import { Footer } from "@/components/landing/footer";
import { Nav } from "@/components/landing/nav";
import { SIGNUP_URL } from "@/lib/app-url";
import { SITE_NAME, SITE_URL, pageSeoMetadata } from "@/lib/seo";

const TITLE = "Dunlo on Product Hunt - Recover Failed Stripe Payments";
const DESCRIPTION =
  "Dunlo helps Stripe-first SaaS founders recover failed payments with failure-aware emails, smarter retry timing, founder review, and recovered revenue tracking.";
const KEYWORDS = [
  "Dunlo Product Hunt",
  "Product Hunt Stripe payments",
  "Stripe payment recovery",
  "failed Stripe payment recovery",
  "SaaS payment recovery",
  "involuntary churn",
  "Stripe dunning",
] as const;

const PRODUCT_HUNT_SIGNUP_URL = `${SIGNUP_URL}&utm_source=producthunt&utm_medium=launch&utm_campaign=product_hunt`;

const reasons = [
  {
    title: "Stripe retries are not the whole recovery motion",
    body: "Retries help when timing is the problem. Customers still need clear messages when cards expire, banks block charges, or SCA needs action.",
    icon: Clock3,
  },
  {
    title: "Failed payments are churn hiding in plain sight",
    body: "Dunlo shows the failed revenue, the customer state, and the recovery action before a billing issue turns into a lost account.",
    icon: BanknoteArrowUp,
  },
  {
    title: "Founder trust matters in early SaaS",
    body: "Sensitive accounts can pause for a founder note, so recovery stays helpful instead of noisy when the relationship matters.",
    icon: ShieldCheck,
  },
] as const;

const workflow = [
  {
    label: "Detect",
    title: "Read the Stripe failure reason",
    body: "Dunlo watches failed charges and invoices, then maps the reason to the recovery path that fits the customer problem.",
  },
  {
    label: "Recover",
    title: "Send the right customer message",
    body: "Expired card, insufficient funds, authentication required, and vague bank declines each get specific copy and timing.",
  },
  {
    label: "Escalate",
    title: "Pause risky accounts for review",
    body: "High-value or sensitive accounts can stop before automation sends, giving the founder room to handle it personally.",
  },
] as const;

const betaPerks = [
  "Free during beta",
  "Built for Stripe-first SaaS teams",
  "No card data stored by Dunlo",
  "Founder-led onboarding and feedback loop",
] as const;

const faqs = [
  {
    question: "Is Dunlo replacing Stripe Smart Retries?",
    answer:
      "No. Dunlo sits around Stripe's retry layer. It handles the customer-facing recovery workflow: failure-aware emails, update links, founder review, and recovered revenue tracking.",
  },
  {
    question: "Who should try Dunlo from Product Hunt?",
    answer:
      "SaaS founders and operators using Stripe who already see failed invoices, involuntary churn, expired cards, or manual recovery work in their billing flow.",
  },
  {
    question: "What do you want from Product Hunt users?",
    answer:
      "Feedback, comments, and beta users. The launch goal is to learn where payment recovery breaks for real SaaS teams, then make Dunlo sharper.",
  },
  {
    question: "Is Dunlo paid?",
    answer:
      "Dunlo is free during beta. The product is still being shaped with early users before the paid plan is finalized.",
  },
] as const;

export const metadata: Metadata = pageSeoMetadata({
  title: TITLE,
  description: DESCRIPTION,
  keywords: KEYWORDS,
  path: "/product-hunt",
});

export default function ProductHuntPage() {
  return (
    <div className="min-h-dvh overflow-hidden bg-stone-50 font-sans text-gray-950">
      <Nav />
      <main>
        <section className="relative flex min-h-dvh items-center overflow-hidden px-4 pb-14 pt-28 md:px-6 md:pb-18 md:pt-32">
          <ProductHuntBackdrop />
          <div className="relative mx-auto grid w-full max-w-7xl min-w-0 gap-10 lg:grid-cols-[0.96fr_1.04fr] lg:items-center">
            <div className="min-w-0 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-dunlo/30 bg-white/85 px-3 py-1.5 text-sm font-semibold text-gray-800 shadow-sm backdrop-blur-md">
                <Sparkles size={15} className="text-dunlo-deep" />
                Launching on Product Hunt, free during beta
              </div>
              <h1 className="mt-7 max-w-3xl text-4xl font-semibold leading-none tracking-tight text-gray-950 sm:text-5xl md:text-6xl lg:text-7xl">
                Dunlo recovers failed Stripe payments before they become churn.
              </h1>
              <p className="mt-6 max-w-[60ch] border-l-2 border-dunlo pl-4 text-base leading-7 text-gray-700 md:text-lg">
                We turn Stripe decline reasons into the right recovery email,
                retry timing, founder escalation, and revenue tracking, so
                good customers do not disappear over a failed card.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={PRODUCT_HUNT_SIGNUP_URL}
                  className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gray-950 px-6 text-sm font-bold text-white transition-all hover:-translate-y-px hover:bg-gray-800 active:scale-[0.98]"
                >
                  Join the beta
                  <ArrowRight
                    size={16}
                    strokeWidth={2}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </a>
                <a
                  href="#feedback"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white/70 px-6 text-sm font-semibold text-gray-800 transition-all hover:-translate-y-px hover:border-gray-950 hover:bg-white active:scale-[0.98]"
                >
                  Leave feedback
                  <MessageCircle size={16} strokeWidth={2} />
                </a>
              </div>
              <div className="mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ["Stripe", "native"],
                  ["Beta", "free"],
                  ["Emails", "aware"],
                  ["Cards", "hosted"],
                ].map(([value, label]) => (
                  <div
                    key={value}
                    className="rounded-2xl border border-gray-200 bg-white/75 px-4 py-3 shadow-sm backdrop-blur"
                  >
                    <p className="font-mono text-lg font-bold text-gray-950">
                      {value}
                    </p>
                    <p className="text-xs font-semibold text-gray-500">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <LaunchPanel />
          </div>
        </section>

        <section className="px-4 py-10 md:px-6 md:py-16">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
                Why this launch exists
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-gray-950 md:text-5xl">
                Failed payments are a product problem, not just a billing
                retry.
              </h2>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {reasons.map((reason) => (
                <article
                  key={reason.title}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_24px_60px_-46px_rgba(17,24,39,0.45)]"
                >
                  <div className="flex size-11 items-center justify-center rounded-full bg-dunlo/15 text-dunlo-deep">
                    <reason.icon size={20} strokeWidth={2.1} />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold tracking-tight text-gray-950">
                    {reason.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    {reason.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-10 md:px-6 md:py-16">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
                How Dunlo works
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-gray-950 md:text-5xl">
                A recovery path for every decline reason.
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-gray-600">
                The early beta is focused on Stripe teams that want a calmer,
                more specific way to save good customers after a payment fails.
              </p>
            </div>

            <div className="grid gap-3">
              {workflow.map((step, index) => (
                <article
                  key={step.label}
                  className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:grid-cols-[8.5rem_1fr]"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gray-950 font-mono text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-dunlo-deep">
                        {step.label}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-gray-950">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      {step.body}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="feedback"
          className="px-4 py-10 md:px-6 md:py-16"
        >
          <div className="mx-auto grid max-w-7xl overflow-hidden rounded-2xl border border-gray-200 bg-gray-950 text-white lg:grid-cols-[1.05fr_0.95fr]">
            <div className="p-6 md:p-10">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo">
                Product Hunt beta offer
              </p>
              <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight md:text-5xl">
                Try Dunlo free during beta and help shape payment recovery for
                SaaS.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-gray-300">
                We are looking for founders who can share real failed-payment
                workflows, awkward customer moments, and the Stripe recovery
                gaps they still handle by hand.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={PRODUCT_HUNT_SIGNUP_URL}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-dunlo px-6 text-sm font-bold text-gray-950 transition-all hover:-translate-y-px hover:bg-dunlo-hover active:scale-[0.98]"
                >
                  Start free in beta
                  <ArrowRight size={16} strokeWidth={2} />
                </a>
                <Link
                  href="/stripe-failed-payments"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 px-6 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:border-white/45 active:scale-[0.98]"
                >
                  Read the recovery guide
                </Link>
              </div>
            </div>
            <div className="border-t border-white/10 p-6 md:p-10 lg:border-l lg:border-t-0">
              <div className="grid gap-3">
                {betaPerks.map((perk) => (
                  <div
                    key={perk}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <Check
                      size={18}
                      strokeWidth={2.4}
                      className="shrink-0 text-dunlo"
                    />
                    <p className="text-sm font-semibold text-gray-100">
                      {perk}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-10 md:px-6 md:py-16">
          <div className="mx-auto max-w-5xl">
            <div className="max-w-2xl">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
                Launch FAQ
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-gray-950 md:text-5xl">
                Quick answers before you try it.
              </h2>
            </div>
            <div className="mt-8 divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white">
              {faqs.map((faq) => (
                <article key={faq.question} className="p-6 md:p-7">
                  <h3 className="text-lg font-semibold tracking-tight text-gray-950">
                    {faq.question}
                  </h3>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
                    {faq.answer}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-12 pt-6 md:px-6 md:pb-18">
          <div className="mx-auto max-w-7xl rounded-2xl border border-dunlo/25 bg-dunlo/12 p-6 text-center md:p-10">
            <BadgeCheck className="mx-auto text-dunlo-deep" size={32} />
            <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-gray-950 md:text-5xl">
              Help us build the recovery layer Stripe-first SaaS teams deserve.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-700">
              Join the beta, try it against your failed-payment workflow, and
              tell us what would make Dunlo more useful for your team.
            </p>
            <a
              href={PRODUCT_HUNT_SIGNUP_URL}
              className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gray-950 px-6 text-sm font-bold text-white transition-all hover:-translate-y-px hover:bg-gray-800 active:scale-[0.98]"
            >
              Join the Product Hunt beta
              <ArrowRight size={16} strokeWidth={2} />
            </a>
          </div>
        </section>
      </main>
      <Footer />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: SITE_NAME,
            applicationCategory: "BusinessApplication",
            applicationSubCategory: "Stripe payment recovery",
            description: DESCRIPTION,
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
            url: `${SITE_URL}/product-hunt`,
          }),
        }}
      />
    </div>
  );
}

function LaunchPanel() {
  const rows = [
    {
      company: "Northstar Labs",
      reason: "insufficient_funds",
      action: "retry in 4h",
      amount: "$348",
    },
    {
      company: "Hearthline",
      reason: "expired_card",
      action: "update link sent",
      amount: "$87",
    },
    {
      company: "RivetDesk",
      reason: "authentication_required",
      action: "SCA email",
      amount: "$129",
    },
  ] as const;

  return (
    <aside className="min-w-0">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_30px_90px_-58px_rgba(17,24,39,0.55)]">
        <div className="border-b border-gray-100 bg-gray-50 px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                Dunlo recovery desk
              </p>
              <h2 className="mt-1 text-lg font-bold tracking-tight text-gray-950">
                Launch day preview
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-dunlo/25 bg-dunlo/12 px-3 py-1.5 text-xs font-bold text-dunlo-deep">
              <SquareActivity size={13} strokeWidth={2.2} />
              live
            </span>
          </div>
        </div>

        <div className="grid gap-3 p-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-gray-200 bg-gray-950 p-4 text-white">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-dunlo">
                at risk
              </p>
              <p className="mt-3 font-mono text-4xl font-bold tracking-tight">
                $2.8k
              </p>
              <p className="mt-1 text-xs font-medium text-gray-400">
                failed MRR in review
              </p>
            </div>
            <div className="rounded-2xl border border-dunlo/25 bg-dunlo/12 p-4">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-dunlo-deep">
                saved
              </p>
              <p className="mt-3 font-mono text-4xl font-bold tracking-tight text-gray-950">
                12
              </p>
              <p className="mt-1 text-xs font-semibold text-gray-500">
                accounts this month
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200">
            {rows.map((row) => (
              <div
                key={row.company}
                className="grid grid-cols-[1fr_auto] gap-3 border-t border-gray-100 px-4 py-3 first:border-t-0"
              >
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="truncate text-sm font-bold text-gray-950">
                      {row.company}
                    </p>
                    <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-gray-500">
                      {row.reason}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-dunlo-deep">
                    {row.action}
                  </p>
                </div>
                <p className="font-mono text-sm font-bold text-gray-950">
                  {row.amount}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-2 text-dunlo-deep">
              <BellRing size={17} strokeWidth={2.2} />
              <p className="font-mono text-xs font-bold uppercase tracking-[0.16em]">
                founder review
              </p>
            </div>
            <p className="mt-3 text-sm leading-6 text-gray-700">
              Pause high-value accounts before automation sends, then recover
              with a personal note when the relationship needs care.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function ProductHuntBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(17,24,39,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(17,24,39,0.055)_1px,transparent_1px)] bg-[size:42px_42px]" />
      <div className="absolute left-1/2 top-24 h-52 w-[34rem] -translate-x-1/2 rounded-full bg-dunlo/20 blur-3xl" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-stone-50 to-transparent" />
    </div>
  );
}
