import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Download, FileText, LockKeyhole } from "lucide-react";

import { Footer } from "@/components/landing/footer";
import { Nav } from "@/components/landing/nav";
import { formatRate } from "@/lib/benchmark";
import { publicBenchmarkQueryOptions } from "@/lib/queries";
import { canonicalLink, ogMeta } from "@/lib/seo";

export const Route = createFileRoute("/state-of-stripe-payments-2026")({
  head: () => ({
    meta: [
      { title: "State of Stripe Failed Payments 2026 — Dunlo" },
      {
        name: "description",
        content:
          "Dunlo's public report on Stripe failed payment rates, decline codes, and recoverable revenue benchmarks for SaaS teams.",
      },
      ...ogMeta({
        title: "State of Stripe Failed Payments 2026 — Dunlo",
        description:
          "Public Stripe failed payment benchmarks and recovery patterns from Dunlo.",
      }),
    ],
    links: [canonicalLink("/state-of-stripe-payments-2026")],
  }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(publicBenchmarkQueryOptions()),
  component: ReportPage,
});

function ReportPage() {
  const { data } = useSuspenseQuery(publicBenchmarkQueryOptions());

  return (
    <div className="min-h-dvh bg-[#e9eaeb] font-sans text-zinc-950">
      <Nav />
      <main className="mx-auto max-w-6xl px-4 pb-12 pt-32 md:px-6 md:pt-36">
        <section className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_0.82fr] md:items-end">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-sm font-semibold text-zinc-600 shadow-sm"
            >
              <FileText size={14} className="text-dunlo-deep" />
              Public report
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04, duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl text-4xl font-bold leading-none tracking-tight text-zinc-950 md:text-6xl"
            >
              State of Stripe Failed Payments 2026
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-600"
            >
              A living benchmark for SaaS founders tracking failed payments,
              decline codes, and recovery opportunities across Stripe.
            </motion.p>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_24px_60px_-32px_rgba(24,24,27,0.25)]"
          >
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
              disabled={!data.reportReady}
              className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 text-sm font-bold text-white transition-all hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300 active:scale-[0.98]"
            >
              <Download size={14} />
              {data.reportReady ? "Download report" : "Notify me at launch"}
            </button>
          </motion.form>
        </section>

        <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-[0.85fr_1fr]">
          <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_18px_45px_-30px_rgba(24,24,27,0.2)]">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Headline metric
            </p>
            <p className="mt-5 font-mono text-6xl font-bold leading-none tracking-tight text-zinc-950">
              {formatRate(data.globalRate)}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-zinc-600">
              Average Stripe failed payment rate across the current benchmark
              sample. Dynamic anonymized data activates at {data.minDynamicUsers}+
              connected accounts.
            </p>
            <Link
              to="/benchmark"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-dunlo-deep transition-all hover:gap-3"
            >
              Open the live benchmark
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-[0_18px_45px_-30px_rgba(24,24,27,0.2)]">
            <div className="border-b border-zinc-100 px-5 py-4">
              <p className="text-sm font-bold text-zinc-950">
                Report outline
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                Built for citation, outreach, and SEO.
              </p>
            </div>
            <div className="divide-y divide-zinc-100">
              {[
                "Average failed payment rate by MRR range",
                "Most frequent Stripe failure codes",
                "Recovery rate by failure code",
                "Before and after Dunlo recovery sequences",
                "Benchmarks by SaaS type when the sample is large enough",
              ].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.08 + index * 0.05,
                    duration: 0.24,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="flex items-center gap-4 px-5 py-4"
                >
                  <span className="font-mono text-xs font-bold text-zinc-300">
                    {(index + 1).toString().padStart(2, "0")}
                  </span>
                  <p className="text-sm font-semibold text-zinc-800">{item}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

