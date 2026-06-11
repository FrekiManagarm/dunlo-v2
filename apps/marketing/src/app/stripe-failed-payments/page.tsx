import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  MailCheck,
  TriangleAlert,
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

const TITLE = "Stripe Failed Payments: Recover SaaS Revenue | Dunlo";
const DESCRIPTION =
  "Recover failed Stripe payments with failure-code emails, smart retry timing, founder escalation, and revenue tracking built for SaaS teams.";
const KEYWORDS = [
  "Stripe failed payments",
  "failed Stripe payment recovery",
  "recover failed Stripe payments",
  "Stripe payment recovery",
  "failed payment recovery SaaS",
  "payment retry",
  "Stripe payment retry",
] as const;

const FAILURE_REASONS = [
  {
    code: "card_expired",
    title: "The customer is still willing to pay",
    copy: "Send a direct update-card path before a simple expiry becomes cancellation noise.",
    signal: "high intent",
  },
  {
    code: "insufficient_funds",
    title: "Timing matters more than pressure",
    copy: "Wait, explain the issue, and retry when the payment has a better chance to clear.",
    signal: "timing",
  },
  {
    code: "do_not_honor",
    title: "Vague bank blocks need context",
    copy: "Tell the customer what the bank blocked and what to do before another retry burns trust.",
    signal: "context",
  },
] as const;

const FAQS = [
  {
    question: "What is a Stripe failed payment?",
    answer:
      "A Stripe failed payment is a charge, invoice, or payment intent that Stripe could not complete because the card, bank, customer, or authentication step blocked the transaction.",
  },
  {
    question: "Can failed Stripe payments be recovered?",
    answer:
      "Yes. Many failed Stripe payments are recoverable when the customer is contacted quickly, the retry is timed around the failure reason, and the email explains the exact action needed.",
  },
  {
    question: "How is Dunlo different from basic retry logic?",
    answer:
      "Dunlo combines failure-code-specific recovery emails, smart timing, founder escalation, and recovered revenue tracking so SaaS teams can act on the reason each payment failed.",
  },
  {
    question: "Is payment retry enough to recover failed payments?",
    answer:
      "Payment retry helps when the failure is temporary, such as insufficient funds or a network issue. It is weaker when the customer needs to update a card, complete authentication, or understand why their bank blocked the charge.",
  },
] as const;

const RELATED_GUIDES = [
  {
    title: "Stripe dunning workflow",
    copy: "Build the email cadence, retry windows, and escalation path around each failed invoice.",
    href: "/stripe-dunning",
  },
  {
    title: "Failed payment rate benchmark",
    copy: "Compare your failed payment rate with SaaS benchmarks and estimate recoverable revenue.",
    href: "/benchmark",
  },
  {
    title: "Stripe Smart Retries alternative",
    copy: "Compare native retry timing with a full customer-facing recovery workflow.",
    href: "/stripe-smart-retries-alternative",
  },
] as const;

export const metadata: Metadata = pageSeoMetadata({
  title: TITLE,
  description: DESCRIPTION,
  keywords: KEYWORDS,
  path: "/stripe-failed-payments",
});

export default function StripeFailedPaymentsPage() {
  return (
    <div className="min-h-dvh overflow-hidden bg-stone-100 font-sans text-gray-950">
      <Nav />
      <main className="space-y-4 px-3 pb-4 pt-24 md:space-y-5 md:px-4 md:pb-6 md:pt-28">
        <section className="relative -mx-3 px-3 md:-mx-4 md:px-4">
          <OrganicBackdrop />
          <div className="relative mx-auto grid min-h-[calc(100dvh-8rem)] max-w-6xl min-w-0 gap-12 py-6 md:grid-cols-[0.92fr_1.08fr] md:items-center md:gap-14 md:py-8">
            <div className="min-w-0 max-w-xl">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
                Stripe failed payment recovery
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-dunlo/30 bg-dunlo/15 px-3 py-1.5 text-xs font-bold text-dunlo-deep">
                  <MailCheck size={13} strokeWidth={2.2} />
                  Failure-code emails
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/80 px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm">
                  <Clock3 size={13} strokeWidth={2.2} />
                  Smarter Stripe retry timing
                </span>
              </div>
              <h1 className="mt-8 max-w-xl text-4xl font-semibold leading-[1.02] tracking-tight text-gray-950 sm:text-5xl sm:leading-[0.98] md:text-6xl">
                Recover failed Stripe payments before they turn into quiet
                churn.
              </h1>
              <p className="mt-5 max-w-lg border-l-2 border-dunlo pl-4 text-base italic leading-7 text-gray-700">
                Dunlo turns raw Stripe decline events into a recovery workflow:
                the right customer email, the right retry moment, and founder
                escalation when an account is worth saving personally.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={SIGNUP_URL}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gray-950 px-6 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-px hover:bg-gray-800 active:scale-[0.98]"
                >
                  Recover failed payments
                  <ArrowRight size={16} strokeWidth={1.8} />
                </a>
                <Link
                  href="/benchmark"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-gray-300 px-6 text-sm font-semibold text-gray-800 transition-all duration-300 hover:-translate-y-px hover:border-gray-950 active:scale-[0.98]"
                >
                  Check your failure rate
                </Link>
              </div>
            </div>

            <aside className="relative min-w-0 md:pl-10">
              <div className="overflow-hidden rounded-4xl border border-gray-200/70 bg-white shadow-[0_24px_70px_-52px_rgba(17,24,39,0.45)]">
                <div className="border-b border-gray-100 bg-gray-50 px-5 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                        Failed payment
                      </p>
                      <h2 className="mt-1 text-base font-bold tracking-tight text-gray-900">
                        Northstar Ledger
                      </h2>
                    </div>
                    <span className="rounded-full border border-dunlo/25 bg-dunlo/10 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-dunlo-deep">
                      recovered
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2">
                      <p className="font-mono text-xl font-bold text-dunlo">
                        $842
                      </p>
                      <p className="text-[11px] font-medium text-gray-400">
                        failed payment
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2">
                      <p className="font-mono text-xl font-bold text-gray-900">
                        18h
                      </p>
                      <p className="text-[11px] font-medium text-gray-400">
                        to recover
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
                    Stripe reason
                  </p>
                  <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-xs font-bold text-gray-900">
                    card_expired
                  </div>
                  <div className="my-4 flex justify-center text-dunlo-deep">
                    <ArrowRight size={16} strokeWidth={1.8} />
                  </div>
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
                    Dunlo action
                  </p>
                  <div className="mt-3 rounded-xl border border-dunlo/25 bg-dunlo/8 px-3 py-2 text-sm font-semibold text-gray-900">
                    Send update-card email, then retry after customer action.
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-[1.35rem] border border-gray-200 bg-gray-950 p-5 text-white">
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo">
                  Recovery state
                </p>
                <div className="mt-5 space-y-3">
                  {[
                    ["failed", "$842", "card_expired"],
                    ["messaged", "$842", "update link sent"],
                    ["recovered", "$842", "paid after 18h"],
                  ].map(([state, amount, detail], index) => (
                    <div
                      key={state}
                      className="flex items-center justify-between gap-4 border-t border-white/10 pt-4 first:border-t-0 first:pt-0"
                      style={{ animationDelay: `${index * 110}ms` }}
                    >
                      <div>
                        <p className="font-mono text-xs uppercase tracking-[0.16em] text-gray-400">
                          {state}
                        </p>
                        <p className="mt-1 text-sm text-gray-300">{detail}</p>
                      </div>
                      <p className="font-mono text-xl font-bold">{amount}</p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl grid-cols-1 gap-5 lg:grid-cols-[0.72fr_1.28fr]">
          <div className="lg:pt-10">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
              Failure-code logic
            </p>
            <h2 className="mt-3 max-w-sm text-3xl font-bold tracking-tight md:text-4xl">
              The reason changes the recovery play.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-gray-600">
              Generic payment failed emails flatten every problem into the same
              message. Dunlo keeps the response tied to the Stripe failure code.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.25fr_0.75fr]">
            <div className="rounded-[2rem] border border-gray-200 bg-white/80 p-6 backdrop-blur-md">
              <div className="divide-y divide-gray-200">
                {FAILURE_REASONS.map((reason) => (
                  <article
                    key={reason.code}
                    className="grid grid-cols-1 gap-4 py-5 first:pt-0 last:pb-0 md:grid-cols-[170px_1fr]"
                  >
                    <div>
                      <p className="font-mono text-sm font-bold text-gray-950">
                        {reason.code}
                      </p>
                      <p className="mt-2 w-fit rounded-full border border-dunlo/20 bg-dunlo/[0.07] px-2.5 py-1 font-mono text-[11px] font-semibold text-dunlo-deep">
                        {reason.signal}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold tracking-tight">
                        {reason.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-gray-600">
                        {reason.copy}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-gray-200 bg-white/80 p-6 backdrop-blur-md">
              <TriangleAlert size={20} className="text-dunlo-deep" />
              <h3 className="mt-5 text-xl font-bold tracking-tight">
                Blind retries are not a recovery strategy.
              </h3>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                If the card expired or the bank blocked the charge, another
                retry without context can train customers to ignore the problem.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl grid-cols-1 gap-5 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-[2rem] border border-gray-200 bg-white/80 p-6 backdrop-blur-md md:p-8">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
              Recovery operating system
            </p>
            <div className="mt-7 grid grid-cols-1 gap-6 md:grid-cols-[0.8fr_1.2fr]">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  From event to paid invoice.
                </h2>
                <p className="mt-4 text-sm leading-6 text-gray-600">
                  Dunlo gives failed payments a clear owner, a customer-safe
                  message, and a visible recovery state.
                </p>
              </div>
              <div className="space-y-4">
                {[
                  {
                    icon: MailCheck,
                    title: "Failure-code emails",
                    copy: "Messaging changes with the decline reason.",
                  },
                  {
                    icon: Clock3,
                    title: "Payment retry timing",
                    copy: "Retries are paced around failure type and customer action.",
                  },
                  {
                    icon: BadgeCheck,
                    title: "Revenue tracking",
                    copy: "Recovered MRR is visible without spreadsheet work.",
                  },
                ].map(({ icon: Icon, title, copy }) => (
                  <div key={title} className="flex gap-4">
                    <div className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-xl border border-dunlo/20 bg-dunlo/[0.07]">
                      <Icon size={17} className="text-dunlo-deep" />
                    </div>
                    <div>
                      <h3 className="font-bold tracking-tight">{title}</h3>
                      <p className="mt-1 text-sm leading-6 text-gray-600">
                        {copy}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <FaqSection />
        </section>

        <RelatedGuidesSection />

        <CtaSection />
      </main>
      <Footer />
      <JsonLd />
    </div>
  );
}

function FaqSection() {
  return (
    <section className="rounded-[2rem] border border-gray-200 bg-white/80 p-6 backdrop-blur-md md:p-8">
      <h2 className="text-2xl font-bold tracking-tight">
        Stripe failed payments FAQ
      </h2>
      <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
        {FAQS.map((faq) => (
          <div key={faq.question} className="py-5">
            <h3 className="text-base font-bold tracking-tight">
              {faq.question}
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="mx-auto max-w-6xl rounded-[2rem] border border-gray-900 bg-gray-950 p-7 text-white md:p-9 lg:p-10">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo">
        Free during beta
      </p>
      <div className="mt-3 grid grid-cols-1 gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight">
            Find the failed payments Stripe is not recovering.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300">
            Connect Stripe, import existing failures, and start recovering
            revenue with customer-safe emails in minutes.
          </p>
        </div>
        <a
          href={SIGNUP_URL}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-dunlo px-6 text-sm font-bold text-gray-950 transition-all duration-300 hover:-translate-y-px hover:bg-dunlo-hover active:scale-[0.98]"
        >
          Connect Stripe
          <ArrowRight size={16} strokeWidth={1.8} />
        </a>
      </div>
    </section>
  );
}

function RelatedGuidesSection() {
  return (
    <section className="mx-auto max-w-6xl">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {RELATED_GUIDES.map((guide) => (
          <Link
            key={guide.href}
            href={guide.href}
            className="group rounded-[2rem] border border-gray-200 bg-white/80 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-px hover:border-dunlo/40"
          >
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
              Guide
            </p>
            <h2 className="mt-4 text-xl font-bold tracking-tight text-gray-950">
              {guide.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">{guide.copy}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-gray-950 transition-colors group-hover:text-dunlo-deep">
              Read guide
              <ArrowRight size={15} strokeWidth={1.8} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function OrganicBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gray-200" />
      <svg
        viewBox="0 0 960 640"
        className="absolute -right-88 top-16 h-130 w-195 text-gray-300 md:-right-40"
        fill="none"
      >
        <path
          d="M46 398C188 261 280 478 424 340C552 217 611 140 790 195C876 222 900 136 924 86"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1"
        />
        <path
          d="M14 472C180 284 314 552 476 390C600 266 640 224 810 264C894 284 914 214 946 160"
          opacity="0.65"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1"
        />
        <path
          d="M98 548C222 430 326 584 468 500C642 398 626 310 782 352C884 380 906 314 950 270"
          opacity="0.45"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1"
        />
      </svg>
      <div className="absolute left-4 top-40 h-[70vh] w-px bg-gray-200/70 md:left-[12vw]" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-stone-100 to-transparent" />
    </div>
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
            url: absoluteUrl("/stripe-failed-payments"),
            publisher: {
              "@type": "Organization",
              name: SITE_NAME,
            },
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
              {
                name: "Stripe failed payments",
                path: "/stripe-failed-payments",
              },
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
