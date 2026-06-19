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
    meta: "00:01 after failure",
  },
  {
    title: "Send the right message",
    copy: "Match the email to the reason: expired card, insufficient funds, authentication, bank block, or generic card decline.",
    meta: "reason matched",
  },
  {
    title: "Retry with intent",
    copy: "Avoid blind retries. Time follow-ups around customer action, payment windows, and account value.",
    meta: "timed sequence",
  },
  {
    title: "Escalate valuable accounts",
    copy: "Bring the founder or success owner into the loop before high-value accounts disappear silently.",
    meta: "founder draft",
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

const RELATED_LINKS = [
  {
    title: "Stripe dunning schedule calculator",
    copy: "Turn account value and failure reason into a practical recovery cadence.",
    href: "/stripe-dunning-schedule-calculator",
  },
  {
    title: "Stripe recovery software",
    copy: "See how Dunlo turns Stripe failures into emails, retries, escalation, and reporting.",
    href: "/stripe-failed-payment-recovery-software",
  },
  {
    title: "Stripe failure codes guide",
    copy: "Decode the failure reason before choosing the message or retry timing.",
    href: "/blog/stripe-failure-codes-the-complete-guide",
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
    <div className="min-h-dvh overflow-hidden bg-stone-100 font-sans text-gray-950">
      <Nav />
      <main className="space-y-4 px-3 pb-4 pt-24 md:space-y-5 md:px-4 md:pb-6 md:pt-28">
        <section className="relative -mx-3 px-3 md:-mx-4 md:px-4">
          <OrganicBackdrop />
          <div className="relative mx-auto grid min-h-[calc(100dvh-8rem)] max-w-6xl min-w-0 gap-12 py-6 md:grid-cols-[0.92fr_1.08fr] md:items-center md:gap-14 md:py-8">
          <div className="min-w-0 max-w-xl">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
              Stripe dunning for SaaS
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-dunlo/30 bg-dunlo/15 px-3 py-1.5 text-xs font-bold text-dunlo-deep">
                <BellRing size={13} strokeWidth={2.2} />
                Event-driven dunning
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/80 px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm">
                <CalendarClock size={13} strokeWidth={2.2} />
                Timed recovery sequence
              </span>
            </div>
            <h1 className="mt-8 max-w-xl text-4xl font-semibold leading-[1.02] tracking-tight text-gray-950 sm:text-5xl sm:leading-[0.98] md:text-6xl">
              A dunning workflow that treats failed payments like customers, not
              errors.
            </h1>
            <p className="mt-5 max-w-lg border-l-2 border-dunlo pl-4 text-base italic leading-7 text-gray-700">
              Dunlo gives every failed Stripe invoice a recovery path: a clear
              customer email, a timed retry, a payment update link, and founder
              escalation before a valuable account quietly disappears.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={SIGNUP_URL}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gray-950 px-6 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-[1px] hover:bg-gray-800 active:scale-[0.98]"
              >
                Build your dunning flow
                <ArrowRight size={16} strokeWidth={1.8} />
              </a>
              <Link
                href="/stripe-dunning-schedule-calculator"
                className="inline-flex h-12 items-center justify-center rounded-full border border-gray-300 px-6 text-sm font-semibold text-gray-800 transition-all duration-300 hover:-translate-y-[1px] hover:border-gray-950 active:scale-[0.98]"
              >
                Calculate your schedule
              </Link>
            </div>
          </div>

          <aside className="relative min-w-0 md:pl-10">
            <div className="overflow-hidden rounded-[1.75rem] border border-gray-200/70 bg-white shadow-[0_24px_70px_-52px_rgba(17,24,39,0.45)]">
              <div className="border-b border-gray-100 bg-gray-50 px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                      Dunning sequence
                    </p>
                    <h2 className="mt-1 text-base font-bold tracking-tight text-gray-900">
                      Past-due invoice
                    </h2>
                  </div>
                  <span className="rounded-full border border-dunlo/25 bg-dunlo/10 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-dunlo-deep">
                    active
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-gray-200 bg-white px-3 py-2">
                    <p className="font-mono text-xl font-bold text-dunlo">
                      4
                    </p>
                    <p className="text-[11px] font-medium text-gray-400">
                      recovery steps
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white px-3 py-2">
                    <p className="font-mono text-xl font-bold text-gray-900">
                      2m
                    </p>
                    <p className="text-[11px] font-medium text-gray-400">
                      first email
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                  Sequence status
                </p>
                <div className="mt-4 space-y-1">
                  {[
                    ["invoice failed", "detected"],
                    ["email one", "sent"],
                    ["retry window", "waiting"],
                    ["founder note", "ready"],
                  ].map(([label, state], index) => (
                    <div
                      key={label}
                      className="grid grid-cols-[24px_1fr_auto] items-center gap-3 py-3"
                    >
                      <span
                        className={`size-2.5 rounded-full ${
                          index === 2 ? "animate-pulse bg-dunlo" : "bg-gray-300"
                        }`}
                      />
                      <span className="text-sm font-semibold text-gray-950">
                        {label}
                      </span>
                      <span className="font-mono text-xs text-gray-500">
                        {state}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { label: "Detect", icon: BellRing },
                { label: "Message", icon: Mail },
                { label: "Retry", icon: CalendarClock },
                { label: "Recover", icon: ShieldCheck },
              ].map(({ label, icon: Icon }) => (
                <div
                  key={label}
                  className="rounded-xl border border-dunlo/20 bg-dunlo/[0.07] p-3"
                >
                  <Icon size={17} className="text-dunlo-deep" />
                  <p className="mt-2 text-sm font-bold text-gray-950">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </aside>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl grid-cols-1 gap-5 lg:grid-cols-[1.22fr_0.78fr]">
          <div className="rounded-[2rem] border border-gray-200 bg-white/80 p-6 backdrop-blur-md md:p-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-[0.72fr_1.28fr]">
              <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
                  Dunning architecture
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                  Recovery needs a sequence, not a panic email.
                </h2>
                <p className="mt-4 text-sm leading-6 text-gray-600">
                  The strongest dunning flows are specific, paced, and aware of
                  account value.
                </p>
              </div>
              <div className="divide-y divide-gray-200 border-y border-gray-200">
                {DUNNING_STEPS.map((step, index) => (
                  <article
                    key={step.title}
                    className="grid grid-cols-1 gap-4 py-5 md:grid-cols-[86px_1fr_auto]"
                  >
                    <p className="font-mono text-sm font-bold text-gray-400">
                      {(index + 1).toString().padStart(2, "0")}
                    </p>
                    <div>
                      <h3 className="text-lg font-bold tracking-tight">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-gray-600">
                        {step.copy}
                      </p>
                    </div>
                    <p className="w-fit rounded-full border border-gray-200 px-3 py-1 font-mono text-[11px] font-semibold text-gray-500 md:justify-self-end">
                      {step.meta}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-gray-200 bg-gray-950 p-6 text-white shadow-[0_24px_60px_-38px_rgba(24,24,27,0.48)]">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo">
              Why it matters
            </p>
            <p className="mt-5 text-3xl font-bold tracking-tight">
              Stripe Smart Retries can retry. It cannot explain.
            </p>
            <p className="mt-4 text-sm leading-6 text-gray-300">
              The customer-facing layer is where many recoverable payments are
              won or lost. Dunlo keeps that layer specific to the failure.
            </p>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl grid-cols-1 gap-5 lg:grid-cols-[0.84fr_1.16fr]">
          <FaqSection />
          <CtaSection />
        </section>

        <RelatedLinksSection />
      </main>
      <Footer />
      <JsonLd />
    </div>
  );
}

function RelatedLinksSection() {
  return (
    <section className="mx-auto max-w-6xl">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {RELATED_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group rounded-[2rem] border border-gray-200 bg-white/80 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-px hover:border-dunlo/40"
          >
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
              Related
            </p>
            <h2 className="mt-4 text-xl font-bold tracking-tight text-gray-950">
              {link.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">{link.copy}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-gray-950 transition-colors group-hover:text-dunlo-deep">
              Open page
              <ArrowRight size={15} strokeWidth={1.8} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="rounded-[2rem] border border-gray-200 bg-white/80 p-6 backdrop-blur-md md:p-8">
      <h2 className="text-2xl font-bold tracking-tight">
        Stripe dunning FAQ
      </h2>
      <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
        {FAQS.map((faq) => (
          <div key={faq.question} className="py-5">
            <h3 className="text-base font-bold tracking-tight">
              {faq.question}
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">
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
    <section className="rounded-[2rem] bg-gray-950 p-7 text-white shadow-[0_28px_70px_-42px_rgba(24,24,27,0.5)] md:p-9">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo">
        Replace generic dunning
      </p>
      <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight">
        Turn failed Stripe payments into a recovery workflow.
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300">
        Start with your existing Stripe account. Dunlo is free during beta and
        built for SaaS teams that want a focused recovery layer.
      </p>
      <a
        href={SIGNUP_URL}
        className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-dunlo px-6 text-sm font-bold text-gray-950 transition-all duration-300 hover:-translate-y-[1px] hover:bg-dunlo-hover active:scale-[0.98]"
      >
        Start recovery
        <ArrowRight size={16} strokeWidth={1.8} />
      </a>
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
