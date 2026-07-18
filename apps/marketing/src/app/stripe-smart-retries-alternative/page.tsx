import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  MailCheck,
  ShieldCheck,
  TimerReset,
} from "lucide-react";
import { Footer } from "@/components/landing/footer";
import { Nav } from "@/components/landing/nav";
import { SIGNUP_URL } from "@/lib/app-url";
import {
  SITE_NAME,
  absoluteUrl,
  breadcrumbJsonLd,
  pageSeoMetadata,
} from "@/lib/seo";

const TITLE = "Stripe Smart Retries: Limits & Alternatives | Dunlo";
const DESCRIPTION =
  "Learn how Stripe Smart Retries works, which payment failures need customer action, and when SaaS teams need a broader failed-payment recovery workflow.";
const PATH = "/stripe-smart-retries-alternative";
const PUBLISHED_TIME = "2026-06-11T00:00:00.000Z";
const MODIFIED_TIME = "2026-07-13T00:00:00.000Z";
const KEYWORDS = [
  "Stripe Smart Retries alternative",
  "Stripe Smart Retries",
  "Stripe failed payment recovery",
  "Stripe dunning software",
  "Stripe revenue recovery",
  "SaaS payment recovery",
  "failed payment recovery software",
  "dunning emails for Stripe",
] as const;

const QUICK_COMPARISON = [
  {
    label: "Primary job",
    stripe: "Choose retry timing inside Stripe Billing.",
    dunlo: "Recover the payment with emails, tracking, and escalation.",
  },
  {
    label: "Customer messaging",
    stripe: "Native reminders and hosted update flows.",
    dunlo: "Failure-reason-specific emails written for SaaS customers.",
  },
  {
    label: "Best fit",
    stripe:
      "Teams that want Stripe-native retries and broader Revenue Recovery controls.",
    dunlo:
      "Stripe SaaS teams that want failure-specific copy and founder-reviewed escalation.",
  },
  {
    label: "Human fallback",
    stripe: "Stripe supports recovery automations and internal notifications.",
    dunlo: "Pause risky accounts and draft a founder note.",
  },
] as const;

const DUNLO_FEATURES = [
  {
    title: "Reads the real Stripe failure",
    copy: "Expired card, insufficient funds, authentication required, and vague bank declines should not all get the same follow-up.",
    icon: BadgeCheck,
  },
  {
    title: "Sends reason-aware recovery emails",
    copy: "Customers get a clear next step instead of generic billing language or repeated silent retries.",
    icon: MailCheck,
  },
  {
    title: "Pauses risky accounts",
    copy: "High-value or sensitive accounts can wait for a founder-approved message before automation continues.",
    icon: BellRing,
  },
  {
    title: "Shows what is still at risk",
    copy: "Track open, recovered, and paused failed-payment revenue without rebuilding the funnel in a spreadsheet.",
    icon: TimerReset,
  },
] as const;

const RELATED_GUIDES = [
  {
    href: "/stripe-dunning",
    title: "Stripe dunning",
    copy: "Build the workflow around retries, customer action, and escalation.",
  },
  {
    href: "/stripe-failed-payment-recovery-software",
    title: "Recovery software",
    copy: "See the customer-facing recovery layer around Stripe Billing.",
  },
  {
    href: "/benchmark",
    title: "Failed-payment benchmark",
    copy: "Estimate failed MRR and recoverable revenue before signup.",
  },
] as const;

const FAQS = [
  {
    question: "What is the best Stripe Smart Retries alternative?",
    answer:
      "The best Stripe Smart Retries alternative depends on what you need beyond retry timing. Stripe Billing already offers native recovery emails, hosted update flows, analytics, customer recovery views, and automations. Dunlo is built for teams that also want failure-specific customer copy, founder-approved outreach, and a focused recovery queue.",
  },
  {
    question: "Should I turn off Stripe Smart Retries if I use Dunlo?",
    answer:
      "Usually no. Stripe Smart Retries can stay on as the native retry engine. Dunlo adds the customer-facing recovery workflow around the failed payment so the customer understands what happened and what to do next.",
  },
  {
    question: "Where does Stripe Smart Retries fall short?",
    answer:
      "Smart Retries itself focuses on retry timing. Stripe Billing's broader Revenue Recovery suite adds native emails, hosted update flows, analytics, customer recovery views, and automations. Dunlo adds failure-specific customer copy, founder-reviewed outreach, and a focused workflow for accounts that warrant a human touch.",
  },
  {
    question: "Is Dunlo a dunning tool or a retry tool?",
    answer:
      "Dunlo is a Stripe failed-payment recovery and dunning layer. It works around Stripe events, recovery emails, secure update links, reporting, and founder escalation rather than replacing Stripe's payment processor.",
  },
] as const;

export const metadata: Metadata = pageSeoMetadata({
  title: TITLE,
  description: DESCRIPTION,
  keywords: KEYWORDS,
  path: PATH,
  type: "article",
  publishedTime: PUBLISHED_TIME,
  authors: ["Mathieu Chambaud"],
});

export default function StripeSmartRetriesAlternativePage() {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Stripe Smart Retries: what it covers and when SaaS needs more",
    description: DESCRIPTION,
    image: absoluteUrl(`${PATH}/opengraph-image`),
    author: {
      "@type": "Person",
      name: "Mathieu Chambaud",
      url: "https://x.com/mathchambaud",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: absoluteUrl("/"),
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/brand/dunlo-mark.svg"),
      },
    },
    datePublished: PUBLISHED_TIME,
    dateModified: MODIFIED_TIME,
    mainEntityOfPage: absoluteUrl(PATH),
    about: [
      "Stripe Smart Retries",
      "Stripe failed payment recovery",
      "SaaS dunning software",
    ],
  };

  const faqJsonLd = {
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
  };

  return (
    <div className="min-h-dvh overflow-hidden bg-dunlo-ground font-sans text-dunlo-ink">
      <Nav />
      <main className="mx-auto w-full max-w-6xl space-y-4 px-3 pb-6 pt-24 md:px-4 md:pt-28">
        <section className="overflow-hidden rounded-2xl bg-dunlo-ink text-white">
          <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="px-6 py-10 md:px-10 md:py-14 lg:px-14">
              <p className="text-sm font-semibold text-dunlo">
                Stripe Smart Retries alternative
              </p>
              <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-[0.96] tracking-[-0.04em] md:text-6xl">
                Stripe Smart Retries: what it covers and when SaaS needs more
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/68 md:text-lg">
                Stripe Smart Retries chooses when to retry eligible failed
                payments. SaaS teams still need a plan for failures that require
                customer action, clear communication, account escalation, and
                recovery visibility.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="#comparison"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-dunlo px-6 text-sm font-bold text-dunlo-ink transition-transform hover:-translate-y-px hover:bg-dunlo-hover active:scale-[0.98]"
                >
                  See what Smart Retries covers
                  <ArrowRight size={16} strokeWidth={2} />
                </Link>
                <Link
                  href="/benchmark"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/24 px-6 text-sm font-semibold text-white transition-colors hover:border-white/60 hover:bg-white/6 active:scale-[0.98]"
                >
                  Estimate failed MRR
                </Link>
              </div>
            </div>

            <aside className="border-t border-dunlo-ink/16 bg-dunlo px-6 py-8 text-dunlo-ink md:px-10 lg:border-l lg:border-t-0 lg:px-12 lg:py-14">
              <div className="rounded-2xl border border-dunlo-line bg-white p-5">
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-dunlo-ink/46">
                  The handoff
                </p>
                <div className="mt-5 space-y-3">
                  {[
                    ["invoice.payment_failed", "Stripe event"],
                    ["authentication_required", "reason detected"],
                    ["SCA approval email", "customer action"],
                    ["founder review", "high-value fallback"],
                  ].map(([label, meta], index) => (
                    <div
                      key={label}
                      className="grid grid-cols-[auto_1fr] gap-3 rounded-2xl border border-dunlo-line/60 bg-dunlo-ground p-3"
                    >
                      <span className="flex size-8 items-center justify-center rounded-full bg-dunlo/12 font-mono text-[11px] font-semibold text-dunlo-deep">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-mono text-xs font-semibold text-dunlo-ink">
                          {label}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-dunlo-ink/56">
                          {meta}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          <article className="border-t border-dunlo-line bg-white px-1 py-5">
            <h2 className="text-base font-bold tracking-tight text-dunlo-ink">
              Use Smart Retries for timing
            </h2>
            <p className="mt-3 text-sm leading-6 text-dunlo-ink/68">
              Stripe is still the right place to retry a payment method and keep
              invoice state inside Billing.
            </p>
          </article>
          <article className="border-t border-dunlo-line bg-white px-1 py-5">
            <h2 className="text-base font-bold tracking-tight text-dunlo-ink">
              Add Dunlo for hands-on recovery
            </h2>
            <p className="mt-3 text-sm leading-6 text-dunlo-ink/68">
              Stripe Billing can provide native customer emails and hosted
              update flows. Dunlo adds failure-specific copy, founder review,
              owner visibility, and a focused escalation queue.
            </p>
          </article>
          <article className="border-t border-dunlo-line bg-white px-1 py-5">
            <h2 className="text-base font-bold tracking-tight text-dunlo-ink">
              Keep Stripe as source of truth
            </h2>
            <p className="mt-3 text-sm leading-6 text-dunlo-ink/68">
              No billing migration. Dunlo layers on top of Stripe events rather
              than replacing your payment processor.
            </p>
          </article>
        </section>

        <section
          id="comparison"
          className="rounded-2xl border border-dunlo-line bg-white px-5 py-7 md:px-8 md:py-9"
        >
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className="text-sm font-semibold text-dunlo-deep">
                Short version
              </p>
              <h2 className="mt-3 max-w-sm text-3xl font-semibold leading-none tracking-tight md:text-5xl">
                Smart Retries optimizes timing. Dunlo adds the human layer.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-6 text-dunlo-ink/68">
                The practical question is not whether Stripe Smart Retries is
                good. It is. The question is what happens when the customer must
                understand, update, approve, or respond before the invoice can
                be paid.
              </p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-dunlo-line">
              <div className="grid grid-cols-[0.74fr_1fr_1fr] border-b border-dunlo-line bg-dunlo-mist text-xs font-semibold uppercase tracking-[0.14em] text-dunlo-ink/56">
                <div className="p-4">Criteria</div>
                <div className="p-4">Stripe Smart Retries</div>
                <div className="p-4">Dunlo</div>
              </div>
              {QUICK_COMPARISON.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-1 border-b border-dunlo-line/60 last:border-b-0 md:grid-cols-[0.74fr_1fr_1fr]"
                >
                  <div className="bg-dunlo-mist/60 p-4 text-sm font-semibold text-dunlo-ink">
                    {row.label}
                  </div>
                  <div className="p-4 text-sm leading-6 text-dunlo-ink/68">
                    {row.stripe}
                  </div>
                  <div className="p-4 text-sm leading-6 text-dunlo-ink/88">
                    {row.dunlo}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-dunlo-line bg-white px-5 py-7 md:px-8 md:py-9">
          <div className="grid gap-7 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold text-dunlo-deep">
                Where Smart Retries stops
              </p>
              <h2 className="mt-3 max-w-md text-3xl font-semibold leading-none tracking-tight md:text-5xl">
                Retry timing is only one part of dunning.
              </h2>
            </div>
            <div className="space-y-5 text-sm leading-7 text-dunlo-ink/68">
              <p>
                Stripe Smart Retries predicts better retry times for failed
                subscription invoices. That helps when the failure is temporary,
                such as insufficient funds or a network issue. It is less useful
                when the customer needs to update a card, complete bank
                authentication, or understand why their bank blocked the charge.
              </p>
              <p>
                Stripe Billing's broader Revenue Recovery suite already provides
                native emails, hosted update pages, analytics, customer recovery
                views, and automations. Dunlo adds failure-specific customer
                copy, founder-reviewed outreach, and a focused queue for teams
                that want a more hands-on recovery layer.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "expired_card needs an update path",
                  "authentication_required needs SCA context",
                  "do_not_honor may need human review",
                  "insufficient_funds needs better timing",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-dunlo-line bg-dunlo-ground p-4 text-sm font-semibold text-dunlo-ink/88"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-dunlo-line bg-white px-5 py-7 md:px-8 md:py-9">
          <div className="grid gap-7 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold text-dunlo-deep">
                How to compare
              </p>
              <h2 className="mt-3 max-w-md text-3xl font-semibold leading-none tracking-tight md:text-5xl">
                Judge alternatives by the revenue moment.
              </h2>
            </div>
            <div className="space-y-5 text-sm leading-7 text-dunlo-ink/68">
              <p>
                If retry timing is the only need, Smart Retries may be enough.
                If you also want native emails, hosted update flows, analytics,
                customer recovery views, and automations, Stripe Billing's
                Revenue Recovery suite covers those controls. Evaluate an added
                recovery layer when you need failure-specific customer copy,
                founder-reviewed outreach, or a focused queue for hands-on
                follow-up.
              </p>
              <p>
                For SaaS teams, the most important comparison points are
                failure-code handling, email quality, stop rules, owner
                visibility, setup time, and reporting. A good recovery layer
                should keep Stripe as the billing source of truth while making
                the customer-facing work visible and measurable.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Failure code", "Does the workflow change by reason?"],
                  ["Customer action", "Does the email explain what to do?"],
                  [
                    "Stop rule",
                    "Does it stop once Stripe recovers the invoice?",
                  ],
                  [
                    "Founder review",
                    "Can important accounts pause before send?",
                  ],
                ].map(([label, copy]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-dunlo-line bg-dunlo-ground p-4"
                  >
                    <h3 className="text-sm font-semibold text-dunlo-ink">
                      {label}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-dunlo-ink/68">
                      {copy}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-dunlo-line bg-white px-5 py-7 md:px-8 md:py-9">
          <div className="grid gap-7 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold text-dunlo-deep">
                Minimum workflow
              </p>
              <h2 className="mt-3 max-w-md text-3xl font-semibold leading-none tracking-tight md:text-5xl">
                What a complete Stripe recovery flow includes.
              </h2>
            </div>
            <div className="divide-y divide-dunlo-line/60 border-y border-dunlo-line/60">
              {[
                {
                  title: "1. Detect invoice.payment_failed",
                  copy: "The workflow should start from the real Stripe event and carry invoice, customer, subscription, amount, and decline reason into the recovery queue.",
                },
                {
                  title: "2. Classify the failure reason",
                  copy: "An expired card, a bank authentication step, insufficient funds, and a do_not_honor response each need a different customer message and retry policy.",
                },
                {
                  title: "3. Send a customer-safe email",
                  copy: "The message should explain the issue in plain language, link to a secure Stripe-hosted update or approval path, and avoid blaming the customer.",
                },
                {
                  title: "4. Track recovery and escalation",
                  copy: "Founders should know which invoices recovered, which accounts are still at risk, and which customers should get a personal note before cancellation.",
                },
              ].map((step) => (
                <article key={step.title} className="py-5">
                  <h3 className="text-base font-semibold tracking-tight text-dunlo-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-dunlo-ink/68">
                    {step.copy}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-dunlo-line bg-white px-5 py-7 md:px-8 md:py-9">
          <div className="mb-7 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold text-dunlo-deep">
                What Dunlo adds
              </p>
              <h2 className="mt-3 max-w-xl text-3xl font-semibold leading-none tracking-tight md:text-5xl">
                A recovery layer around Stripe.
              </h2>
            </div>
            <Link
              href="/stripe-failed-payments"
              className="inline-flex items-center gap-2 text-sm font-semibold text-dunlo-deep transition-all hover:gap-3"
            >
              Read the failed payment guide
              <ArrowRight size={14} strokeWidth={2} />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {DUNLO_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-dunlo-line bg-dunlo-ground p-5"
                >
                  <span className="flex size-10 items-center justify-center rounded-full bg-dunlo/12 text-dunlo-deep">
                    <Icon size={19} strokeWidth={2} />
                  </span>
                  <h3 className="mt-5 text-xl font-semibold tracking-tight text-dunlo-ink">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-dunlo-ink/68">
                    {feature.copy}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-dunlo-line bg-white px-5 py-7 md:px-8 md:py-9">
          <div className="grid gap-7 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold text-dunlo-deep">
                Dunlo vs Stripe Smart Retries
              </p>
              <h2 className="mt-3 max-w-md text-3xl font-semibold leading-none tracking-tight md:text-5xl">
                The cleanest setup is usually both.
              </h2>
            </div>
            <div className="space-y-5 text-sm leading-7 text-dunlo-ink/68">
              <p>
                Dunlo is not positioned as a payment processor or a replacement
                for Stripe Billing. Stripe should keep owning invoices,
                subscriptions, retry attempts, payment methods, and hosted
                update flows. That is the stable foundation most SaaS founders
                already trust.
              </p>
              <p>
                Dunlo is the layer founders usually build after the first few
                painful failed-payment weeks: a small queue of accounts at risk,
                clear emails by decline reason, a view of recovered revenue, and
                a way to step in personally when a customer is too important for
                generic automation.
              </p>
              <p>
                That distinction matters for SEO and for buyers. Someone
                searching for a Stripe Smart Retries alternative is rarely
                asking for a new payments stack. They are asking what to add
                when retry timing alone does not recover enough revenue.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  [
                    "Setup",
                    "Connect Stripe, review defaults, monitor failures.",
                  ],
                  ["Pricing", "Free during beta; no recovered-revenue cut."],
                  [
                    "Reporting",
                    "Open, recovered, and paused revenue by reason.",
                  ],
                ].map(([label, copy]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-dunlo-line bg-dunlo-ground p-4"
                  >
                    <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-dunlo-ink/46">
                      {label}
                    </h3>
                    <p className="mt-3 text-sm font-semibold leading-6 text-dunlo-ink/88">
                      {copy}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-dunlo-line bg-white px-6 py-7 md:px-8">
            <h2 className="text-2xl font-semibold tracking-tight text-dunlo-ink">
              Choose Stripe's native recovery stack when
            </h2>
            <ul className="mt-6 space-y-4">
              {[
                "You want Smart Retries plus native emails, hosted update flows, analytics, and automations.",
                "Stripe's customer recovery views are enough for your team.",
                "You do not need failure-specific customer copy or founder review.",
              ].map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm leading-6 text-dunlo-ink/68"
                >
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-dunlo" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-2xl border border-dunlo-line bg-dunlo-ink px-6 py-7 text-white md:px-8">
            <h2 className="text-2xl font-semibold tracking-tight">
              Choose Dunlo when
            </h2>
            <ul className="mt-6 space-y-4">
              {[
                "You want failure-specific customer copy.",
                "You want a focused view of open, recovered, and paused revenue by failure reason.",
                "Important accounts should pause for founder review.",
              ].map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm leading-6 text-white/70"
                >
                  <ShieldCheck
                    className="mt-0.5 shrink-0 text-dunlo"
                    size={17}
                    strokeWidth={2}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="rounded-2xl border border-dunlo-line bg-white px-5 py-7 md:px-8 md:py-9">
          <div className="grid gap-7 lg:grid-cols-[0.82fr_1.18fr]">
            <div>
              <p className="text-sm font-semibold text-dunlo-deep">FAQ</p>
              <h2 className="mt-3 max-w-md text-3xl font-semibold leading-none tracking-tight md:text-5xl">
                Stripe Smart Retries alternative FAQ.
              </h2>
            </div>
            <div className="divide-y divide-dunlo-line/60 border-y border-dunlo-line/60">
              {FAQS.map((item) => (
                <div key={item.question} className="py-5">
                  <h3 className="text-base font-semibold tracking-tight text-dunlo-ink">
                    {item.question}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-dunlo-ink/68">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-dunlo-line bg-white px-5 py-7 md:px-8">
          <h2 className="text-xl font-semibold tracking-tight text-dunlo-ink">
            Related Stripe recovery guides
          </h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {RELATED_GUIDES.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-dunlo-line bg-dunlo-ground p-4 transition-all hover:-translate-y-0.5 hover:border-dunlo/40 active:scale-[0.99]"
              >
                <h3 className="text-sm font-semibold text-dunlo-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-dunlo-ink/68">
                  {item.copy}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-dunlo-line bg-dunlo-ink px-6 py-8 text-white md:px-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-dunlo">
                Free beta
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
                Add the recovery layer Stripe Smart Retries does not cover.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300">
                Connect Stripe, monitor failed payments, send clearer recovery
                emails, and review founder-level escalations before churn
                becomes permanent.
              </p>
            </div>
            <a
              href={SIGNUP_URL}
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-dunlo px-6 text-sm font-semibold text-dunlo-ink transition-transform active:scale-[0.98]"
            >
              Start with Dunlo
              <ArrowRight size={16} strokeWidth={2} />
            </a>
          </div>
        </section>

        <section className="rounded-2xl border border-dunlo-line bg-white px-6 py-6 md:px-8">
          <div className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
            <div>
              <h2 className="text-base font-semibold text-dunlo-ink">
                Sources and comparison notes
              </h2>
              <p className="mt-3 text-sm leading-6 text-dunlo-ink/68">
                This guide separates Stripe's native retry engine from the
                customer recovery workflow around it. Public Stripe docs explain
                the retry and revenue recovery controls; Dunlo's comparison is
                about the layer SaaS teams add when payment recovery also needs
                customer communication, owner visibility, and escalation. The
                recommendation is intentionally narrow: keep Stripe for billing
                mechanics, add Dunlo when failed payments require a
                customer-safe response and a founder-readable recovery queue.
                That makes the page relevant for buyers comparing alternatives
                without pretending a recovery layer should replace Stripe
                itself. Clear positioning beats vague recovery claims for
                founders now.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                {
                  label: "Stripe Smart Retries docs",
                  href: "https://docs.stripe.com/billing/revenue-recovery/smart-retries",
                },
                {
                  label: "Stripe revenue recovery docs",
                  href: "https://docs.stripe.com/billing/revenue-recovery",
                },
                {
                  label: "Stripe invoice.payment_failed event",
                  href: "https://docs.stripe.com/api/events/types#event_types-invoice.payment_failed",
                },
                {
                  label: "Stripe recovery analytics",
                  href: "https://docs.stripe.com/billing/revenue-recovery/recovery-analytics",
                },
                {
                  label: "Stripe Billing automations",
                  href: "https://docs.stripe.com/billing/automations",
                },
              ].map((source) => (
                <a
                  key={source.href}
                  href={source.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-dunlo-line px-4 py-2 text-sm font-medium text-dunlo-ink/76 transition-colors hover:border-dunlo-line hover:bg-dunlo-mist"
                >
                  {source.label}
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Stripe Smart Retries alternative", path: PATH },
            ]),
          ),
        }}
      />
    </div>
  );
}
