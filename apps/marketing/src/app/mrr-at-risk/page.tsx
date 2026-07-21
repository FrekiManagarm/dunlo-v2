import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Calculator,
  CircleDollarSign,
  MailCheck,
  ShieldCheck,
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

const TITLE = "MRR at Risk: Formula for Failed SaaS Payments | Dunlo";
const DESCRIPTION =
  "Learn how to calculate MRR at risk from failed Stripe payments, separate recoverable revenue from churn, and prioritize payment recovery.";
const PATH = "/mrr-at-risk";
const KEYWORDS = [
  "MRR at risk",
  "MRR at risk formula",
  "failed payment MRR",
  "SaaS revenue at risk",
  "payment recovery metrics",
  "involuntary churn MRR",
] as const;

const FORMULA_STEPS = [
  {
    title: "Failed MRR",
    formula: "sum of unpaid subscription invoices",
    copy: "Start with subscription revenue Stripe attempted to collect but did not collect.",
  },
  {
    title: "Recoverable MRR",
    formula: "failed MRR x expected recovery rate",
    copy: "Estimate the portion that can still be recovered through retries, update links, emails, or manual escalation.",
  },
  {
    title: "Final churn exposure",
    formula: "failed MRR - recovered MRR",
    copy: "Only unresolved revenue should become involuntary churn once the recovery window ends.",
  },
] as const;

const EXAMPLES = [
  {
    label: "$10k MRR SaaS",
    failedRate: "5.1%",
    failedMrr: "$510",
    recoverable: "$316",
    takeaway: "Small leaks become meaningful once they repeat every month.",
  },
  {
    label: "$25k MRR SaaS",
    failedRate: "5.8%",
    failedMrr: "$1,450",
    recoverable: "$899",
    takeaway: "At this stage, payment recovery deserves weekly review.",
  },
  {
    label: "$80k MRR SaaS",
    failedRate: "6.4%",
    failedMrr: "$5,120",
    recoverable: "$3,174",
    takeaway: "High-value failures should trigger founder or operator review.",
  },
] as const;

const RECOVERY_METRICS = [
  "Failed MRR by Stripe decline code",
  "Recovered MRR by recovery step",
  "Open delinquent MRR still inside the dunning window",
  "Final involuntary churn after recovery ends",
  "High-value accounts awaiting founder escalation",
] as const;

const FAQS = [
  {
    question: "What is MRR at risk?",
    answer:
      "MRR at risk is recurring revenue attached to failed, unpaid, or unresolved subscription payments that may become churn if the payment is not recovered.",
  },
  {
    question: "How do you calculate MRR at risk from Stripe?",
    answer:
      "Add the monthly recurring value of failed Stripe invoices or failed subscription payments that remain unresolved. Then separate recovered revenue from final churn once the dunning window ends.",
  },
  {
    question: "Is MRR at risk the same as churned MRR?",
    answer:
      "No. MRR at risk is a temporary recovery state. Churned MRR is the unresolved amount that remains after retries, customer emails, update links, and escalation fail.",
  },
  {
    question: "Why track MRR at risk by decline code?",
    answer:
      "Decline codes show the right recovery path. Expired cards need update links, insufficient funds need timing, bank blocks need clear explanation, and high-value failures may need founder review.",
  },
] as const;

const RELATED_GUIDES = [
  {
    title: "Involuntary churn calculator",
    copy: "Estimate how much failed payment revenue may turn into churn.",
    href: "/involuntary-churn-calculator",
  },
  {
    title: "Stripe failed payment benchmark",
    copy: "Use the public benchmark to estimate failed MRR by SaaS stage.",
    href: "/benchmark",
  },
  {
    title: "Stripe failed payment emails",
    copy: "Copy customer-safe email templates for common Stripe failure reasons.",
    href: "/stripe-failed-payment-email-templates",
  },
] as const;

export const metadata: Metadata = pageSeoMetadata({
  title: TITLE,
  description: DESCRIPTION,
  keywords: KEYWORDS,
  path: PATH,
});

export default function MrrAtRiskPage() {
  return (
    <div className="min-h-dvh overflow-hidden bg-dunlo-ground font-sans text-dunlo-ink">
      <Nav />
      <main className="space-y-5 px-3 pb-5 pt-24 md:px-4 md:pb-6 md:pt-28">
        <section className="mx-auto grid max-w-6xl gap-8 overflow-hidden rounded-2xl bg-dunlo-ink px-5 py-8 text-white md:px-8 md:py-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:px-10 lg:py-12">
          <div>
            <p className="text-sm font-semibold text-dunlo">
              Payment recovery metric
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-[0.96] tracking-[-0.04em] md:text-6xl">
              MRR at risk is failed revenue before it becomes churn.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/68 md:text-lg">
              For SaaS teams, a failed Stripe payment should not move straight
              into churn reporting. Track it as MRR at risk first, then recover
              it with the right email, retry, update link, or founder review.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/benchmark"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-dunlo px-6 text-sm font-bold text-dunlo-ink transition-transform hover:-translate-y-px hover:bg-dunlo-hover active:scale-[0.98]"
              >
                Estimate MRR at risk
                <ArrowRight size={16} strokeWidth={1.8} />
              </Link>
              <a
                href={SIGNUP_URL}
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/24 px-6 text-sm font-semibold text-white transition-colors hover:border-white/60 hover:bg-white/6 active:scale-[0.98]"
              >
                Connect Stripe
              </a>
            </div>
          </div>

          <aside className="rounded-2xl bg-white p-5 text-dunlo-ink md:p-6">
            <div className="flex items-center gap-3">
              <Calculator size={20} className="text-dunlo-deep" />
              <p className="text-sm font-semibold text-dunlo-deep">
                Core formula
              </p>
            </div>
            <div className="mt-5 rounded-2xl border border-dunlo-line bg-white p-5">
              <p className="text-sm font-semibold text-dunlo-ink/56">
                MRR at risk
              </p>
              <p className="mt-3 font-mono text-2xl font-bold leading-tight text-dunlo-ink">
                failed MRR - recovered MRR still unresolved
              </p>
            </div>
            <p className="mt-4 text-sm leading-6 text-dunlo-ink/68">
              The useful metric is not just the failed amount. It is the amount
              still unresolved after recovery actions have had time to work.
            </p>
          </aside>
        </section>

        <section className="mx-auto max-w-6xl rounded-2xl border border-dunlo-line bg-white p-5 md:p-8">
          <p className="text-sm font-semibold text-dunlo-deep">Formula</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight md:text-4xl">
            How to calculate MRR at risk from failed payments
          </h2>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {FORMULA_STEPS.map((step, index) => (
              <article
                key={step.title}
                className="rounded-2xl border border-dunlo-line bg-dunlo-mist p-5"
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-dunlo-ink font-mono text-sm font-bold text-white">
                  {index + 1}
                </span>
                <h3 className="mt-5 text-lg font-bold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 font-mono text-sm font-bold text-dunlo-deep">
                  {step.formula}
                </p>
                <p className="mt-3 text-sm leading-6 text-dunlo-ink/68">
                  {step.copy}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl rounded-2xl border border-dunlo-line bg-white p-5 md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold text-dunlo-deep">Examples</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">
                MRR at risk examples by SaaS stage
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-dunlo-ink/56">
              These examples use public benchmark assumptions and are
              directional, not a guarantee. Your real number depends on failure
              mix, billing interval, card age, customer geography, and retry
              setup.
            </p>
          </div>
          <div className="mt-7 overflow-hidden rounded-2xl border border-dunlo-line">
            <div className="grid grid-cols-[1fr_0.7fr_0.8fr_0.8fr_1.2fr] border-b border-dunlo-line bg-dunlo-mist px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-dunlo-ink/56 max-md:hidden">
              <div>Stage</div>
              <div>Rate</div>
              <div>Failed MRR</div>
              <div>Recoverable</div>
              <div>Takeaway</div>
            </div>
            {EXAMPLES.map((example) => (
              <article
                key={example.label}
                className="grid gap-3 border-b border-dunlo-line/60 p-4 last:border-b-0 md:grid-cols-[1fr_0.7fr_0.8fr_0.8fr_1.2fr]"
              >
                <p className="font-bold text-dunlo-ink">{example.label}</p>
                <p className="font-mono text-sm font-bold text-dunlo-ink/76">
                  {example.failedRate}
                </p>
                <p className="font-mono text-sm font-bold text-dunlo-ink/76">
                  {example.failedMrr}
                </p>
                <p className="font-mono text-sm font-bold text-dunlo-deep">
                  {example.recoverable}
                </p>
                <p className="text-sm leading-6 text-dunlo-ink/68">
                  {example.takeaway}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="rounded-2xl border border-dunlo-ink bg-dunlo-ink p-7 text-white md:p-9">
            <CircleDollarSign size={22} className="text-dunlo" />
            <h2 className="mt-5 text-3xl font-bold tracking-tight">
              Track the state, not just the failure.
            </h2>
            <p className="mt-4 text-sm leading-7 text-gray-300 md:text-base">
              A failed invoice can be recovered, unresolved, escalated, or lost.
              Reporting all four states keeps payment failure from polluting
              product churn analysis.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {RECOVERY_METRICS.map((metric) => (
              <article
                key={metric}
                className="flex gap-3 rounded-2xl border border-dunlo-line bg-white p-5"
              >
                <BadgeCheck
                  size={18}
                  className="mt-0.5 shrink-0 text-dunlo-deep"
                />
                <p className="text-sm font-semibold leading-6 text-dunlo-ink/76">
                  {metric}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-2xl border border-dunlo-line bg-white p-7 md:p-9">
            <div className="flex items-center gap-3">
              <MailCheck size={20} className="text-dunlo-deep" />
              <p className="text-sm font-semibold text-dunlo-deep">
                Recovery action
              </p>
            </div>
            <h2 className="mt-5 text-3xl font-bold tracking-tight">
              Reduce MRR at risk by matching action to failure reason.
            </h2>
            <p className="mt-4 text-sm leading-7 text-dunlo-ink/68 md:text-base">
              Expired cards need update links. Insufficient funds need timing.
              Bank blocks need clear context. Authentication failures need a
              confirmation path. Dunlo turns those states into recovery
              workflows around Stripe.
            </p>
            <Link
              href="/stripe-failed-payment-email-templates"
              className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-dunlo-ink px-6 text-sm font-bold text-white transition-all hover:bg-dunlo-ink/90"
            >
              View email templates
              <ArrowRight size={15} />
            </Link>
          </div>
          <FaqSection />
        </section>

        <RelatedGuidesSection />

        <section className="mx-auto max-w-6xl rounded-2xl border border-dunlo-ink bg-dunlo-ink p-7 text-white md:p-9">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo">
                Free during beta
              </p>
              <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight">
                See which failed Stripe payments are still recoverable.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300">
                Connect Stripe, group failures by reason, and track recovered
                revenue before at-risk MRR becomes final churn.
              </p>
            </div>
            <a
              href={SIGNUP_URL}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-dunlo px-6 text-sm font-bold text-dunlo-ink transition-all hover:bg-dunlo-hover active:scale-[0.98]"
            >
              Start free
              <ArrowRight size={15} />
            </a>
          </div>
        </section>
      </main>
      <Footer />
      <JsonLd />
    </div>
  );
}

function FaqSection() {
  return (
    <section className="rounded-2xl border border-dunlo-line bg-white p-6 md:p-8">
      <div className="flex items-center gap-3">
        <ShieldCheck size={20} className="text-dunlo-deep" />
        <h2 className="text-2xl font-bold tracking-tight">MRR at risk FAQ</h2>
      </div>
      <div className="mt-6 divide-y divide-dunlo-line border-y border-dunlo-line">
        {FAQS.map((faq) => (
          <div key={faq.question} className="py-5">
            <h3 className="text-base font-bold tracking-tight">
              {faq.question}
            </h3>
            <p className="mt-2 text-sm leading-6 text-dunlo-ink/68">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RelatedGuidesSection() {
  return (
    <section className="mx-auto max-w-6xl">
      <div className="grid gap-5 md:grid-cols-3">
        {RELATED_GUIDES.map((guide) => (
          <Link
            key={guide.href}
            href={guide.href}
            className="group rounded-2xl border border-dunlo-line bg-white p-6 transition-all hover:-translate-y-px hover:border-dunlo/40"
          >
            <BadgeCheck size={19} className="text-dunlo-deep" />
            <h2 className="mt-4 text-xl font-bold tracking-tight text-dunlo-ink">
              {guide.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-dunlo-ink/68">
              {guide.copy}
            </p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-dunlo-ink transition-colors group-hover:text-dunlo-deep">
              Open guide
              <ArrowRight size={15} strokeWidth={1.8} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function JsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: TITLE,
            description: DESCRIPTION,
            url: absoluteUrl(PATH),
            publisher: {
              "@type": "Organization",
              name: SITE_NAME,
            },
            about: ["MRR at risk", "failed payments", "involuntary churn"],
          }),
        }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "MRR at risk", path: PATH },
            ]),
          ),
        }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: "How to calculate MRR at risk",
            description:
              "A three-step process for calculating failed revenue at risk before it becomes SaaS churn.",
            step: FORMULA_STEPS.map((step, index) => ({
              "@type": "HowToStep",
              position: index + 1,
              name: step.title,
              text: `${step.formula}: ${step.copy}`,
            })),
          }),
        }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }),
        }}
      />
    </>
  );
}
