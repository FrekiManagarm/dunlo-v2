import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Download, FileText, LockKeyhole } from "lucide-react";
import { Footer } from "@/components/landing/footer";
import { Nav } from "@/components/landing/nav";
import { breadcrumbJsonLd, pageSeoMetadata } from "@/lib/seo";

const TITLE = "State of Stripe Failed Payments 2026 - Dunlo";
const DESCRIPTION =
  "Dunlo's public report on Stripe failed payment rates, decline codes, and recoverable revenue benchmarks for SaaS teams.";

const REPORT_ITEMS = [
  "Average failed payment rate by MRR range",
  "Most frequent Stripe failure codes",
  "Recovery rate by failure code",
  "Before and after Dunlo recovery sequences",
  "Benchmarks by SaaS type when the sample is large enough",
] as const;

const KEYWORDS = [
    "Stripe failed payment report",
    "Stripe failed payment benchmark",
    "Stripe decline code benchmark",
    "SaaS payment failure report",
    "recoverable revenue benchmark",
    "payment recovery benchmarks",
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
              A living benchmark for SaaS founders tracking failed payments,
              decline codes, and recovery opportunities across Stripe.
            </p>
          </div>

          <form className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_24px_60px_-32px_rgba(24,24,27,0.25)]">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-dunlo/[0.08]">
                <LockKeyhole size={17} className="text-dunlo-deep" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-950">
                  PDF download opens after the live data threshold.
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Email capture is ready for the Q3 report launch.
                </p>
              </div>
            </div>
            <label className="mt-5 block">
              <span className="text-xs font-semibold text-zinc-600">
                Work email
              </span>
              <input
                type="email"
                placeholder="founder@company.com"
                className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition-colors placeholder:text-zinc-400 focus:border-dunlo focus:ring-2 focus:ring-dunlo/20"
              />
            </label>
            <button
              type="button"
              disabled
              className="mt-4 inline-flex h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-zinc-300 px-5 text-sm font-bold text-white"
            >
              <Download size={14} />
              Notify me at launch
            </button>
          </form>
        </section>

        <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-[0.85fr_1fr]">
          <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_18px_45px_-30px_rgba(24,24,27,0.2)]">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Headline metric
            </p>
            <h2 className="sr-only">
              Average Stripe failed payment rate benchmark
            </h2>
            <p className="mt-5 font-mono text-6xl font-bold leading-none tracking-tight text-zinc-950">
              3.2%
            </p>
            <p className="mt-4 text-sm leading-relaxed text-zinc-600">
              Early baseline for attempted SaaS subscription payments. The live
              benchmark stays inside the Dunlo app until the anonymized sample is
              large enough for public reporting.
            </p>
            <Link
              href="/benchmark"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-dunlo-deep transition-all hover:gap-3"
            >
              Open the live benchmark
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-[0_18px_45px_-30px_rgba(24,24,27,0.2)]">
            <div className="border-b border-zinc-100 px-5 py-4">
              <h2 className="text-sm font-bold text-zinc-950">
                Report outline
              </h2>
              <p className="mt-1 text-xs text-zinc-400">
                Built for citation, outreach, and SEO.
              </p>
            </div>
            <div className="divide-y divide-zinc-100">
              {REPORT_ITEMS.map((item, index) => (
                <div key={item} className="flex items-center gap-4 px-5 py-4">
                  <span className="font-mono text-xs font-bold text-zinc-300">
                    {(index + 1).toString().padStart(2, "0")}
                  </span>
                  <p className="text-sm font-semibold text-zinc-800">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
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
