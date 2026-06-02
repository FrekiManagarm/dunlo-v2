import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  CalendarClock,
  Mail,
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

const TITLE = "Stripe Dunning for SaaS: Recover Failed Payments | Dunlo";
const DESCRIPTION =
  "Build a Stripe dunning workflow for SaaS with failure-specific emails, smarter retries, founder escalation, and recovered revenue tracking.";
const KEYWORDS = [
  "Stripe dunning",
  "dunning SaaS",
  "Stripe dunning emails",
  "subscription dunning",
  "Stripe Smart Retries alternative",
  "payment recovery workflow",
] as const;

const DUNNING_STEPS = [
  {
    title: "Detect the failed invoice",
    copy: "Listen to Stripe payment failures, invoice events, and failure codes as soon as they happen.",
  },
  {
    title: "Send the right message",
    copy: "Match the email to the reason: expired card, insufficient funds, authentication, bank block, or generic card decline.",
  },
  {
    title: "Retry with intent",
    copy: "Avoid blind retries. Time follow-ups around customer action, payment windows, and account value.",
  },
  {
    title: "Escalate valuable accounts",
    copy: "Bring the founder or success owner into the loop before high-value accounts disappear silently.",
  },
] as const;

const FAQS = [
  {
    question: "What is Stripe dunning?",
    answer:
      "Stripe dunning is the process of recovering failed subscription payments after a Stripe invoice or payment intent fails. It usually combines retries, customer emails, payment update links, and account follow-up.",
  },
  {
    question: "Is Stripe Smart Retries enough for dunning?",
    answer:
      "Stripe Smart Retries can help with retry timing, but it does not replace a complete dunning workflow with failure-specific messaging, escalation, and recovered revenue reporting.",
  },
  {
    question: "What should a SaaS dunning sequence include?",
    answer:
      "A SaaS dunning sequence should include immediate failure detection, customer-safe emails, payment update links, timed retries, founder escalation for valuable accounts, and tracking for recovered revenue.",
  },
] as const;

export const metadata: Metadata = pageSeoMetadata({
  title: TITLE,
  description: DESCRIPTION,
  keywords: KEYWORDS,
  path: "/stripe-dunning",
});

export default function StripeDunningPage() {
  return (
    <div className="min-h-dvh bg-stone-100 font-sans text-gray-950">
      <Nav />
      <main className="px-4 pb-12 pt-28 md:pt-32">
        <section className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
              Stripe dunning for SaaS
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-none tracking-tight text-gray-950 md:text-6xl">
              A dunning workflow that treats failed payments like customers,
              not errors.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-600">
              Dunlo helps SaaS teams recover failed Stripe payments with
              failure-code-specific emails, smarter retry timing, founder
              escalation, and recovered revenue visibility.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={SIGNUP_URL}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gray-950 px-6 text-sm font-bold text-white transition-all hover:bg-gray-800 active:scale-[0.98]"
              >
                Build your dunning flow
                <ArrowRight size={16} />
              </a>
              <Link
                href="/stripe-failed-payments"
                className="inline-flex h-12 items-center justify-center rounded-full border border-gray-300 px-6 text-sm font-semibold text-gray-800 transition-colors hover:border-gray-950"
              >
                Learn failed payment recovery
              </Link>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-gray-200 bg-white/80 p-5 shadow-[0_22px_56px_-36px_rgba(24,24,27,0.22)] backdrop-blur-md">
            <p className="text-sm font-semibold text-gray-500">
              A complete dunning system
            </p>
            <div className="mt-5 grid grid-cols-1 gap-3">
              {[
                { label: "Detect", icon: BellRing },
                { label: "Message", icon: Mail },
                { label: "Retry", icon: CalendarClock },
                { label: "Recover", icon: ShieldCheck },
              ].map(({ label, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
                >
                  <span className="font-semibold">{label}</span>
                  <Icon size={18} className="text-dunlo-deep" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto mt-12 max-w-6xl rounded-[1.5rem] border border-gray-200 bg-white/75 p-6 backdrop-blur-md md:p-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Stripe retries are only one part of dunning.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-gray-600">
              A SaaS dunning strategy needs customer communication, payment
              update paths, retry timing, and escalation. Otherwise, a normal
              card issue turns into preventable churn.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            {DUNNING_STEPS.map((step, index) => (
              <article
                key={step.title}
                className="rounded-2xl border border-gray-200 bg-gray-50 p-5"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-dunlo font-mono text-xs font-bold text-gray-950">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-lg font-bold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {step.copy}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-4 grid max-w-6xl grid-cols-1 gap-5 rounded-[1.5rem] border border-gray-200 bg-white/75 p-6 backdrop-blur-md lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
              Built for Stripe SaaS
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Recover revenue without migrating billing.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-gray-600">
              Dunlo connects to Stripe, imports failed payments, and layers a
              focused recovery workflow on top of the billing setup you already
              use.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              "No revenue cut",
              "Failure-code messaging",
              "Founder escalation",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-dunlo/20 bg-dunlo/[0.07] p-4 text-sm font-bold text-gray-950"
              >
                {item}
              </div>
            ))}
          </div>
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
      <h2 className="text-3xl font-bold tracking-tight">Stripe dunning FAQ</h2>
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
        Replace generic dunning
      </p>
      <div className="mt-3 grid grid-cols-1 gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Turn failed Stripe payments into a recovery workflow.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-300">
            Start with your existing Stripe account. Dunlo is free during beta
            and built for SaaS teams that want a focused recovery layer.
          </p>
        </div>
        <a
          href={SIGNUP_URL}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-dunlo px-6 text-sm font-bold text-gray-950 transition-all hover:bg-dunlo-hover active:scale-[0.98]"
        >
          Start recovery
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
            url: absoluteUrl("/stripe-dunning"),
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
              { name: "Stripe dunning", path: "/stripe-dunning" },
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
