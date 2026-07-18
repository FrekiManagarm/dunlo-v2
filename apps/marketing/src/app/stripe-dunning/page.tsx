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
import { SubpageBackdrop } from "@/components/marketing/subpage-backdrop";
import { SIGNUP_URL } from "@/lib/app-url";
import {
  SITE_NAME,
  absoluteUrl,
  breadcrumbJsonLd,
  pageSeoMetadata,
} from "@/lib/seo";

const TITLE = "Stripe Dunning for SaaS: Recovery Guide | Dunlo";
const DESCRIPTION =
  "Learn how Stripe dunning combines retries, customer emails, payment update paths, and recovery measurement to prevent failed-payment churn in SaaS teams.";
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
      "Stripe Smart Retries optimizes retry timing, and Stripe also provides native recovery emails, hosted update flows, analytics, customer recovery views, and automations. A broader workflow becomes useful when the team needs failure-specific customer copy and founder-reviewed personal outreach for accounts that warrant a human touch.",
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
    title: "Stripe decline codes guide",
    copy: "Decode the failure reason before choosing the message or retry timing.",
    href: "/stripe-decline-codes",
  },
] as const;

const SOURCES = [
  {
    label: "Stripe revenue recovery",
    href: "https://docs.stripe.com/billing/revenue-recovery",
  },
  {
    label: "Stripe Smart Retries",
    href: "https://docs.stripe.com/billing/revenue-recovery/smart-retries",
  },
  {
    label: "Stripe decline codes",
    href: "https://docs.stripe.com/declines/codes",
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
    <div className="min-h-dvh overflow-hidden bg-dunlo-ground font-sans text-dunlo-ink">
      <Nav />
      <main className="space-y-4 px-3 pb-4 pt-24 md:space-y-5 md:px-4 md:pb-6 md:pt-28">
        <section className="relative -mx-3 overflow-hidden bg-dunlo-ink px-3 text-white md:-mx-4 md:px-4">
          <SubpageBackdrop />
          <div className="relative mx-auto grid min-h-[calc(100dvh-8rem)] max-w-6xl min-w-0 gap-12 py-6 md:grid-cols-[0.92fr_1.08fr] md:items-center md:gap-14 md:py-8">
            <div className="min-w-0 max-w-xl">
              <p className="text-sm font-semibold text-dunlo">
                Stripe dunning for SaaS
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-dunlo/40 bg-dunlo/12 px-3 py-1.5 text-xs font-bold text-dunlo">
                  <BellRing size={13} strokeWidth={2.2} />
                  Event-driven dunning
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/18 bg-white/6 px-3 py-1.5 text-xs font-bold text-white/72">
                  <CalendarClock size={13} strokeWidth={2.2} />
                  Timed recovery sequence
                </span>
              </div>
              <h1 className="mt-8 max-w-xl text-4xl font-bold leading-[0.96] tracking-[-0.04em] text-white sm:text-5xl md:text-6xl">
                Stripe dunning for SaaS failed-payment recovery
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-white/68">
                {
                  "Stripe dunning is the workflow for recovering a failed subscription payment through retries, customer emails, payment update paths, account handling, and recovery measurement."
                }
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/stripe-dunning-schedule-calculator"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-dunlo px-6 text-sm font-bold text-dunlo-ink transition-transform duration-300 hover:-translate-y-px hover:bg-dunlo-hover active:scale-[0.98]"
                >
                  Plan your dunning schedule
                  <ArrowRight size={16} strokeWidth={1.8} />
                </Link>
                <Link
                  href="#workflow"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/24 px-6 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-px hover:border-white/60 hover:bg-white/6 active:scale-[0.98]"
                >
                  See the recovery workflow
                </Link>
              </div>
            </div>

            <aside className="relative text-dunlo-ink min-w-0 md:pl-10">
              <div className="overflow-hidden rounded-2xl border border-dunlo-line/70 bg-white">
                <div className="border-b border-dunlo-line/60 bg-dunlo-mist px-5 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-dunlo-ink/46">
                        Dunning sequence
                      </p>
                      <h2 className="mt-1 text-base font-bold tracking-tight text-dunlo-ink">
                        Past-due invoice
                      </h2>
                    </div>
                    <span className="rounded-full border border-dunlo/25 bg-dunlo/10 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-dunlo-deep">
                      active
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-dunlo-line bg-white px-3 py-2">
                      <p className="font-mono text-xl font-bold text-dunlo">
                        4
                      </p>
                      <p className="text-[11px] font-medium text-dunlo-ink/46">
                        recovery steps
                      </p>
                    </div>
                    <div className="rounded-xl border border-dunlo-line bg-white px-3 py-2">
                      <p className="font-mono text-xl font-bold text-dunlo-ink">
                        2m
                      </p>
                      <p className="text-[11px] font-medium text-dunlo-ink/46">
                        first email
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-ink/46">
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
                            index === 2
                              ? "animate-pulse bg-dunlo"
                              : "bg-gray-300"
                          }`}
                        />
                        <span className="text-sm font-semibold text-dunlo-ink">
                          {label}
                        </span>
                        <span className="font-mono text-xs text-dunlo-ink/56">
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
                    <p className="mt-2 text-sm font-bold text-dunlo-ink">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section
          id="workflow"
          className="mx-auto grid max-w-6xl scroll-mt-24 grid-cols-1 gap-5 lg:grid-cols-[1.22fr_0.78fr]"
        >
          <div className="rounded-2xl border border-dunlo-line bg-white p-6 md:p-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-[0.72fr_1.28fr]">
              <div>
                <p className="text-sm font-semibold text-dunlo-deep">
                  Dunning architecture
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                  Recovery needs a sequence, not a panic email.
                </h2>
                <p className="mt-4 text-sm leading-6 text-dunlo-ink/68">
                  The strongest dunning flows are specific, paced, and aware of
                  account value.
                </p>
              </div>
              <div className="divide-y divide-dunlo-line border-y border-dunlo-line">
                {DUNNING_STEPS.map((step, index) => (
                  <article
                    key={step.title}
                    className="grid grid-cols-1 gap-4 py-5 md:grid-cols-[86px_1fr_auto]"
                  >
                    <p className="font-mono text-sm font-bold text-dunlo-ink/46">
                      {(index + 1).toString().padStart(2, "0")}
                    </p>
                    <div>
                      <h3 className="text-lg font-bold tracking-tight">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-dunlo-ink/68">
                        {step.copy}
                      </p>
                    </div>
                    <p className="w-fit rounded-full border border-dunlo-line px-3 py-1 font-mono text-[11px] font-semibold text-dunlo-ink/56 md:justify-self-end">
                      {step.meta}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-dunlo-line bg-dunlo-ink p-6 text-white">
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
          <section className="rounded-2xl border border-dunlo-line bg-white p-6 md:p-8">
            <h2 className="text-2xl font-bold tracking-tight">
              Stripe dunning sources
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-dunlo-ink/68">
              These Stripe references document the native recovery controls,
              retry behavior, and decline signals used in this guide.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {SOURCES.map((source) => (
                <a
                  key={source.href}
                  href={source.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-dunlo-line px-4 py-2 text-sm font-semibold text-dunlo-ink/76 transition-colors hover:border-dunlo-line hover:bg-dunlo-mist"
                >
                  {source.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ))}
            </div>
          </section>
          <div className="lg:col-span-2">
            <CtaSection />
          </div>
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
            className="group rounded-2xl border border-dunlo-line bg-white p-6 transition-all duration-300 hover:-translate-y-px hover:border-dunlo/40"
          >
            <p className="text-sm font-semibold text-dunlo-deep">Related</p>
            <h2 className="mt-4 text-xl font-bold tracking-tight text-dunlo-ink">
              {link.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-dunlo-ink/68">
              {link.copy}
            </p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-dunlo-ink transition-colors group-hover:text-dunlo-deep">
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
    <section className="rounded-2xl border border-dunlo-line bg-white p-6 md:p-8">
      <h2 className="text-2xl font-bold tracking-tight">Stripe dunning FAQ</h2>
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

function CtaSection() {
  return (
    <section className="rounded-2xl bg-dunlo-ink p-7 text-white md:p-9">
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
        className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-dunlo px-6 text-sm font-bold text-dunlo-ink transition-all duration-300 hover:-translate-y-px hover:bg-dunlo-hover active:scale-[0.98]"
      >
        Start recovery
        <ArrowRight size={16} strokeWidth={1.8} />
      </a>
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
