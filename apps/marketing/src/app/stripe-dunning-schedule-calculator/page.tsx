import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calculator, CalendarClock, MailCheck } from "lucide-react";
import { Footer } from "@/components/landing/footer";
import { Nav } from "@/components/landing/nav";
import { SubpageBackdrop } from "@/components/marketing/subpage-backdrop";
import { StripeDunningScheduleCalculator } from "@/components/stripe-dunning-schedule-calculator";
import {
  SITE_NAME,
  absoluteUrl,
  breadcrumbJsonLd,
  pageSeoMetadata,
} from "@/lib/seo";

const TITLE = "Stripe Dunning Schedule Calculator | Dunlo";
const DESCRIPTION =
  "Use this free Stripe dunning schedule calculator to plan failed-payment emails, retry windows, escalation timing, and final notices for SaaS.";
const PATH = "/stripe-dunning-schedule-calculator";
const KEYWORDS = [
  "Stripe dunning schedule calculator",
  "dunning schedule calculator",
  "Stripe dunning sequence",
  "failed payment email schedule",
  "SaaS dunning calculator",
  "Stripe retry schedule",
] as const;

const FAQS = [
  {
    question: "What is a Stripe dunning schedule?",
    answer:
      "A Stripe dunning schedule is the sequence of customer emails, payment retries, payment update prompts, escalation steps, and final notices after a subscription payment fails.",
  },
  {
    question: "How many days should a SaaS dunning sequence run?",
    answer:
      "Many SaaS teams use a 7 to 21 day dunning window. Low-price self-serve products can keep the sequence short, while higher-value accounts often deserve more time and a human escalation step.",
  },
  {
    question: "Should every Stripe failure use the same schedule?",
    answer:
      "No. An expired card needs a fast update-card email, insufficient funds often benefits from a delayed retry, and authentication_required needs a direct customer action link.",
  },
  {
    question: "Can Dunlo automate the calculated schedule?",
    answer:
      "Dunlo automates the customer-facing payment recovery workflow around Stripe, including failure-specific emails, secure update links, founder review, and recovered revenue tracking.",
  },
] as const;

export const metadata: Metadata = pageSeoMetadata({
  title: TITLE,
  description: DESCRIPTION,
  keywords: KEYWORDS,
  path: PATH,
});

export default function StripeDunningScheduleCalculatorPage() {
  return (
    <div className="min-h-dvh overflow-hidden bg-dunlo-ground font-sans text-dunlo-ink">
      <Nav />
      <main className="space-y-4 px-3 pb-4 pt-24 md:space-y-5 md:px-4 md:pb-6 md:pt-28">
        <section className="relative -mx-3 overflow-hidden bg-dunlo-ink px-3 text-white md:-mx-4 md:px-4">
          <SubpageBackdrop />
          <div className="relative mx-auto grid min-h-[calc(82dvh-6rem)] max-w-6xl gap-12 py-6 md:grid-cols-[0.92fr_1.08fr] md:items-center md:gap-14 md:py-8">
            <div className="max-w-xl">
              <p className="text-sm font-semibold text-dunlo">
                Free Stripe dunning tool
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-dunlo/40 bg-dunlo/12 px-3 py-1.5 text-xs font-bold text-dunlo">
                  <Calculator size={13} strokeWidth={2.2} />
                  Interactive calculator
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/18 bg-white/6 px-3 py-1.5 text-xs font-bold text-white/72">
                  <CalendarClock size={13} strokeWidth={2.2} />
                  Retry timing
                </span>
              </div>
              <h1 className="mt-8 max-w-xl text-4xl font-bold leading-[0.96] tracking-[-0.04em] text-white sm:text-5xl md:text-6xl">
                Stripe dunning schedule calculator for SaaS.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-white/68">
                Build a practical failed-payment sequence from the Stripe
                failure reason, invoice value, account type, and recovery
                window.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#calculator"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-dunlo px-6 text-sm font-bold text-dunlo-ink transition-transform duration-300 hover:-translate-y-px hover:bg-dunlo-hover active:scale-[0.98]"
                >
                  Use the calculator
                  <ArrowRight size={16} strokeWidth={1.8} />
                </a>
                <Link
                  href="/stripe-dunning"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/24 px-6 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-px hover:border-white/60 hover:bg-white/6 active:scale-[0.98]"
                >
                  Read dunning guide
                </Link>
              </div>
            </div>

            <aside className="relative text-dunlo-ink md:pl-10">
              <div className="rounded-2xl border border-dunlo-line bg-white p-5">
                <p className="text-sm font-semibold text-dunlo-deep">
                  Example output
                </p>
                <div className="mt-5 space-y-3">
                  {[
                    ["Day 0", "Send failure-specific email"],
                    ["Day 3", "Retry or send action reminder"],
                    ["Day 5", "Escalate valuable accounts"],
                    ["Day 14", "Final notice before pause"],
                  ].map(([time, action]) => (
                    <div
                      key={time}
                      className="grid grid-cols-[76px_1fr] gap-4 rounded-xl border border-dunlo-line bg-dunlo-mist p-4"
                    >
                      <p className="font-mono text-sm font-bold text-dunlo-ink">
                        {time}
                      </p>
                      <p className="text-sm font-semibold text-dunlo-ink/76">
                        {action}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-xl border border-dunlo/25 bg-dunlo/[0.07] p-4">
                  <MailCheck size={18} className="text-dunlo-deep" />
                  <p className="mt-3 text-sm font-semibold leading-6 text-dunlo-ink">
                    The best schedule changes when the failure reason changes.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <div id="calculator" className="scroll-mt-24">
          <StripeDunningScheduleCalculator />
        </div>

        <section className="mx-auto grid max-w-6xl grid-cols-1 gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-dunlo-line bg-white p-6 md:p-8">
            <p className="text-sm font-semibold text-dunlo-deep">
              How to use it
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Turn the calculator into a recovery workflow.
            </h2>
            <p className="mt-4 text-sm leading-6 text-dunlo-ink/68">
              Use the output as a starting point for your Stripe dunning
              sequence, then adapt the language to your customers and support
              policy.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/stripe-failed-payment-recovery-software"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-dunlo px-6 text-sm font-bold text-dunlo-ink transition-transform duration-300 hover:-translate-y-px hover:bg-dunlo-hover active:scale-[0.98]"
              >
                See recovery software
                <ArrowRight size={16} strokeWidth={1.8} />
              </Link>
              <Link
                href="/blog/stripe-failure-codes-the-complete-guide"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/24 px-6 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-px hover:border-white/60 hover:bg-white/6 active:scale-[0.98]"
              >
                Decode failure codes
              </Link>
            </div>
          </div>
          <FaqSection />
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
      <h2 className="text-2xl font-bold tracking-tight">
        Dunning calculator FAQ
      </h2>
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

function JsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: TITLE,
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            description: DESCRIPTION,
            url: absoluteUrl(PATH),
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
              { name: "Stripe dunning schedule calculator", path: PATH },
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
