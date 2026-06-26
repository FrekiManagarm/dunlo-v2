import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calculator, CalendarClock, MailCheck } from "lucide-react";
import { Footer } from "@/components/landing/footer";
import { Nav } from "@/components/landing/nav";
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
    <div className="min-h-dvh overflow-hidden bg-stone-100 font-sans text-gray-950">
      <Nav />
      <main className="space-y-4 px-3 pb-4 pt-24 md:space-y-5 md:px-4 md:pb-6 md:pt-28">
        <section className="relative -mx-3 px-3 md:-mx-4 md:px-4">
          <OrganicBackdrop />
          <div className="relative mx-auto grid min-h-[calc(82dvh-6rem)] max-w-6xl gap-12 py-6 md:grid-cols-[0.92fr_1.08fr] md:items-center md:gap-14 md:py-8">
            <div className="max-w-xl">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
                Free Stripe dunning tool
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-dunlo/30 bg-dunlo/15 px-3 py-1.5 text-xs font-bold text-dunlo-deep">
                  <Calculator size={13} strokeWidth={2.2} />
                  Interactive calculator
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/80 px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm">
                  <CalendarClock size={13} strokeWidth={2.2} />
                  Retry timing
                </span>
              </div>
              <h1 className="mt-8 max-w-xl text-4xl font-semibold leading-[1.02] tracking-tight text-gray-950 sm:text-5xl sm:leading-[0.98] md:text-6xl">
                Stripe dunning schedule calculator for SaaS.
              </h1>
              <p className="mt-5 max-w-lg border-l-2 border-dunlo pl-4 text-base italic leading-7 text-gray-700">
                Build a practical failed-payment sequence from the Stripe
                failure reason, invoice value, account type, and recovery
                window.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#calculator"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gray-950 px-6 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-px hover:bg-gray-800 active:scale-[0.98]"
                >
                  Use the calculator
                  <ArrowRight size={16} strokeWidth={1.8} />
                </a>
                <Link
                  href="/stripe-dunning"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-gray-300 px-6 text-sm font-semibold text-gray-800 transition-all duration-300 hover:-translate-y-px hover:border-gray-950 active:scale-[0.98]"
                >
                  Read dunning guide
                </Link>
              </div>
            </div>

            <aside className="relative md:pl-10">
              <div className="rounded-4xl border border-gray-200 bg-white p-5 shadow-[0_24px_70px_-52px_rgba(17,24,39,0.45)]">
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
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
                      className="grid grid-cols-[76px_1fr] gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4"
                    >
                      <p className="font-mono text-sm font-bold text-gray-950">
                        {time}
                      </p>
                      <p className="text-sm font-semibold text-gray-700">
                        {action}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-xl border border-dunlo/25 bg-dunlo/[0.07] p-4">
                  <MailCheck size={18} className="text-dunlo-deep" />
                  <p className="mt-3 text-sm font-semibold leading-6 text-gray-900">
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
          <div className="rounded-[2rem] border border-gray-200 bg-white/80 p-6 backdrop-blur-md md:p-8">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
              How to use it
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Turn the calculator into a recovery workflow.
            </h2>
            <p className="mt-4 text-sm leading-6 text-gray-600">
              Use the output as a starting point for your Stripe dunning
              sequence, then adapt the language to your customers and support
              policy.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/stripe-failed-payment-recovery-software"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gray-950 px-6 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-px hover:bg-gray-800 active:scale-[0.98]"
              >
                See recovery software
                <ArrowRight size={16} strokeWidth={1.8} />
              </Link>
              <Link
                href="/blog/stripe-failure-codes-the-complete-guide"
                className="inline-flex h-12 items-center justify-center rounded-full border border-gray-300 px-6 text-sm font-semibold text-gray-800 transition-all duration-300 hover:-translate-y-px hover:border-gray-950 active:scale-[0.98]"
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
    <section className="rounded-[2rem] border border-gray-200 bg-white/80 p-6 backdrop-blur-md md:p-8">
      <h2 className="text-2xl font-bold tracking-tight">
        Dunning calculator FAQ
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
