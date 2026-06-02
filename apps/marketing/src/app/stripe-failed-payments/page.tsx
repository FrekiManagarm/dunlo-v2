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
] as const;

const FAILURE_REASONS = [
  {
    code: "card_expired",
    title: "Expired cards need a direct update path",
    copy: "A customer did not choose to churn. They need a calm email with the exact card update link before the subscription lapses.",
  },
  {
    code: "insufficient_funds",
    title: "Insufficient funds need better timing",
    copy: "Retrying immediately often burns the same decline. Dunlo waits, explains the issue, and follows up when the payment is more likely to clear.",
  },
  {
    code: "do_not_honor",
    title: "Bank blocks need human context",
    copy: "A vague bank decline can make customers think your product broke. The recovery message should explain the fix before another retry.",
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
] as const;

export const metadata: Metadata = pageSeoMetadata({
  title: TITLE,
  description: DESCRIPTION,
  keywords: KEYWORDS,
  path: "/stripe-failed-payments",
});

export default function StripeFailedPaymentsPage() {
  return (
    <div className="min-h-dvh bg-stone-100 font-sans text-gray-950">
      <Nav />
      <main className="px-4 pb-12 pt-28 md:pt-32">
        <section className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
              Stripe failed payment recovery
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-none tracking-tight text-gray-950 md:text-6xl">
              Recover failed Stripe payments before they become silent churn.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-600">
              Dunlo watches failed Stripe payments, sends the right recovery
              email for each failure reason, times retries more carefully, and
              shows the revenue you win back.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={SIGNUP_URL}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gray-950 px-6 text-sm font-bold text-white transition-all hover:bg-gray-800 active:scale-[0.98]"
              >
                Recover failed payments
                <ArrowRight size={16} />
              </a>
              <Link
                href="/benchmark"
                className="inline-flex h-12 items-center justify-center rounded-full border border-gray-300 px-6 text-sm font-semibold text-gray-800 transition-colors hover:border-gray-950"
              >
                Check your failure rate
              </Link>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-gray-200 bg-white/80 p-5 shadow-[0_22px_56px_-36px_rgba(24,24,27,0.22)] backdrop-blur-md">
            <p className="text-sm font-semibold text-gray-500">
              Recovery workflow
            </p>
            <div className="mt-5 space-y-3">
              {[
                "Detect a failed charge or invoice in Stripe",
                "Classify the failure reason and urgency",
                "Send a customer-safe recovery email",
                "Escalate high-value accounts to the founder",
              ].map((step, index) => (
                <div
                  key={step}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                >
                  <span className="flex size-7 items-center justify-center rounded-full bg-dunlo font-mono text-xs font-bold text-gray-950">
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-700">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto mt-12 max-w-6xl rounded-[1.5rem] border border-gray-200 bg-white/75 p-6 backdrop-blur-md md:p-8">
          <div className="max-w-3xl">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
              Why Stripe payments fail
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              A failed payment is not one problem. It is a signal.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-gray-600">
              Treating every decline the same leaves revenue on the table. Card
              expiry, bank blocks, insufficient funds, and authentication
              failures each need different timing and customer language.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {FAILURE_REASONS.map((reason) => (
              <article
                key={reason.code}
                className="rounded-2xl border border-gray-200 bg-gray-50 p-5"
              >
                <TriangleAlert size={18} className="text-dunlo-deep" />
                <p className="mt-4 font-mono text-sm font-bold text-gray-950">
                  {reason.code}
                </p>
                <h3 className="mt-3 text-lg font-bold tracking-tight">
                  {reason.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {reason.copy}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-4 grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              icon: MailCheck,
              title: "Failure-code emails",
              copy: "Send messages that match the actual Stripe decline instead of a generic payment failed note.",
            },
            {
              icon: Clock3,
              title: "Smarter timing",
              copy: "Avoid wasting retries when the failure reason needs a customer action or a better payment window.",
            },
            {
              icon: BadgeCheck,
              title: "Revenue tracking",
              copy: "See recovered MRR, pending failures, and which recovery steps are doing the work.",
            },
          ].map(({ icon: Icon, title, copy }) => (
            <div
              key={title}
              className="rounded-[1.5rem] border border-gray-200 bg-white/75 p-5 backdrop-blur-md"
            >
              <Icon size={20} className="text-dunlo-deep" />
              <h3 className="mt-4 text-lg font-bold tracking-tight">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {copy}
              </p>
            </div>
          ))}
        </section>

        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
      <JsonLd />
    </div>
  );
}

function FaqSection() {
  return (
    <section className="mx-auto mt-4 max-w-4xl rounded-[1.5rem] border border-gray-200 bg-white/75 p-6 backdrop-blur-md md:p-8">
      <h2 className="text-3xl font-bold tracking-tight">
        Stripe failed payments FAQ
      </h2>
      <div className="mt-7 divide-y divide-gray-200 border-y border-gray-200">
        {FAQS.map((faq) => (
          <div key={faq.question} className="py-5">
            <h3 className="text-lg font-bold tracking-tight">
              {faq.question}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="mx-auto mt-4 max-w-6xl rounded-[1.5rem] bg-gray-950 p-7 text-white md:p-9">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo">
        Free during beta
      </p>
      <div className="mt-3 grid grid-cols-1 gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Find the failed payments Stripe is not recovering.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-300">
            Connect Stripe, import existing failures, and start recovering
            revenue with customer-safe emails in minutes.
          </p>
        </div>
        <a
          href={SIGNUP_URL}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-dunlo px-6 text-sm font-bold text-gray-950 transition-all hover:bg-dunlo-hover active:scale-[0.98]"
        >
          Connect Stripe
          <ArrowRight size={16} />
        </a>
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
