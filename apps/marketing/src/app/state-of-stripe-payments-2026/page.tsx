import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, FileText, ShieldCheck } from "lucide-react";
import { Footer } from "@/components/landing/footer";
import { Nav } from "@/components/landing/nav";
import { PublicProofLayer } from "@/components/public-proof-layer";
import { SIGNUP_URL } from "@/lib/app-url";
import { breadcrumbJsonLd, pageSeoMetadata } from "@/lib/seo";

const TITLE = "State of Stripe Failed Payments 2026 - Dunlo";
const DESCRIPTION =
  "Explore Stripe failed payment rates, decline codes, and recoverable revenue benchmarks for SaaS teams using Dunlo's public 2026 report.";

const KEYWORDS = [
  "Stripe failed payment report",
  "Stripe failed payment benchmark",
  "Stripe decline code benchmark",
  "SaaS payment failure report",
  "recoverable revenue benchmark",
  "payment recovery benchmarks",
] as const;

const BENCHMARK_RANGES = [
  {
    range: "< $5k MRR",
    failedRate: "4.2%",
    note: "Stripe defaults can hide the problem because volume is still low.",
  },
  {
    range: "$5k-$20k MRR",
    failedRate: "5.1%",
    note: "The first range where a dedicated recovery workflow usually pays back.",
  },
  {
    range: "$20k-$80k MRR",
    failedRate: "5.8%",
    note: "Failed payments become a visible retention problem, not just billing noise.",
  },
  {
    range: "$80k+ MRR",
    failedRate: "6.4%",
    note: "Recovery needs prioritization, account value, and human escalation.",
  },
] as const;

const FAILURE_CODES = [
  {
    code: "insufficient_funds",
    action: "Retry timing matters, but the customer email should stay calm.",
  },
  {
    code: "expired_card",
    action: "Stop retrying blindly and send a direct card-update path.",
  },
  {
    code: "authentication_required",
    action: "Explain the bank authentication step before another charge attempt.",
  },
  {
    code: "do_not_honor",
    action: "Escalate carefully when account value justifies a personal touch.",
  },
] as const;

const REPORT_SCOPE = [
  "Public benchmark model by MRR range",
  "Failure-code recovery playbook",
  "Beta data publication rules",
  "Approved screenshots and testimonials when available",
] as const;

export const metadata: Metadata = pageSeoMetadata({
  title: TITLE,
  description: DESCRIPTION,
  keywords: KEYWORDS,
  path: "/state-of-stripe-payments-2026",
});

export default function StateOfStripePaymentsPage() {
  return (
    <div className="min-h-dvh bg-stone-100 font-sans text-zinc-950">
      <Nav />
      <main className="mx-auto max-w-6xl px-4 pb-12 pt-32 md:px-6 md:pt-36">
        <section className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_0.82fr] md:items-end">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-sm font-semibold text-zinc-600 shadow-sm">
              <FileText size={14} className="text-dunlo-deep" />
              Public report
            </div>
            <h1 className="max-w-3xl text-4xl font-bold leading-none tracking-tight text-zinc-950 md:text-6xl">
              State of Stripe Failed Payments 2026
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-600">
              A living report for SaaS founders tracking failed payments,
              decline codes, and recovery opportunities across Stripe.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/stripe-failed-payment-audit"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-zinc-950 px-6 text-sm font-bold text-white transition-all hover:bg-zinc-800 active:scale-[0.98]"
              >
                Run the audit
                <ArrowRight size={15} />
              </Link>
              <Link
                href={SIGNUP_URL}
                className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-200 bg-white px-6 text-sm font-bold text-zinc-900 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
              >
                Connect Stripe
              </Link>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_24px_60px_-32px_rgba(24,24,27,0.22)]">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-dunlo/[0.08]">
                <ShieldCheck size={17} className="text-dunlo-deep" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-950">
                  Beta data is approval-gated.
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  Dunlo will publish beta metrics, screenshots, and testimonials
                  only after anonymization, sample-size checks, and customer
                  approval. Until then, this report separates public benchmark
                  assumptions from private beta evidence.
                </p>
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-8 overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-[0_18px_45px_-30px_rgba(24,24,27,0.2)]">
          <div className="grid grid-cols-1 divide-y divide-zinc-100 md:grid-cols-[0.85fr_1.15fr] md:divide-x md:divide-y-0">
            <div className="p-6 md:p-8">
              <div className="flex size-10 items-center justify-center rounded-full bg-dunlo/[0.08]">
                <BarChart3 size={17} className="text-dunlo-deep" />
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Public benchmark
              </p>
              <h2 className="mt-3 max-w-md text-3xl font-bold tracking-tight text-zinc-950">
                Failed-payment ranges by MRR.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-zinc-600">
                These ranges are the public model used by Dunlo's benchmark and
                audit pages. They are useful for estimation, not a substitute
                for connecting Stripe and reading your actual invoices.
              </p>
            </div>
            <div className="divide-y divide-zinc-100">
              {BENCHMARK_RANGES.map((range) => (
                <div
                  key={range.range}
                  className="grid grid-cols-[1fr_auto] items-start gap-4 px-5 py-4"
                >
                  <div>
                    <p className="font-semibold text-zinc-950">
                      {range.range}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-zinc-500">
                      {range.note}
                    </p>
                  </div>
                  <p className="font-mono text-2xl font-bold text-zinc-950">
                    {range.failedRate}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_0.72fr]">
          <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Failure-code playbook
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-zinc-950">
              The useful report is code-level, not just rate-level.
            </h2>
            <div className="mt-6 divide-y divide-zinc-100 border-y border-zinc-100">
              {FAILURE_CODES.map((item) => (
                <div
                  key={item.code}
                  className="grid gap-3 py-4 md:grid-cols-[0.42fr_1fr]"
                >
                  <p className="font-mono text-sm font-bold text-zinc-950">
                    {item.code}
                  </p>
                  <p className="text-sm leading-6 text-zinc-600">
                    {item.action}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Report scope
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-zinc-950">
              What this asset covers.
            </h2>
            <div className="mt-6 divide-y divide-zinc-100 border-y border-zinc-100">
              {REPORT_SCOPE.map((item, index) => (
                <div key={item} className="flex items-center gap-4 py-4">
                  <span className="font-mono text-xs font-bold text-zinc-300">
                    {(index + 1).toString().padStart(2, "0")}
                  </span>
                  <p className="text-sm font-semibold text-zinc-800">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-4">
          <PublicProofLayer compact />
        </div>
      </main>
      <Footer />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              {
                name: "State of Stripe Failed Payments 2026",
                path: "/state-of-stripe-payments-2026",
              },
            ]),
          ),
        }}
      />
    </div>
  );
}
