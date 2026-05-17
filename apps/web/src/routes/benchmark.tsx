import { useMemo, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Calculator,
  Database,
  Gauge,
} from "lucide-react";

import { Footer } from "@/components/landing/footer";
import { Nav } from "@/components/landing/nav";
import {
  estimatePercentile,
  formatRate,
} from "@/lib/benchmark";
import { publicBenchmarkQueryOptions } from "@/lib/queries";
import { canonicalLink, ogMeta } from "@/lib/seo";

export const Route = createFileRoute("/benchmark")({
  head: () => ({
    meta: [
      { title: "Stripe Failed Payment Benchmarks — Dunlo" },
      {
        name: "description",
        content:
          "Compare your Stripe failed payment rate against SaaS benchmarks by failure code and estimate recoverable revenue.",
      },
      ...ogMeta({
        title: "Stripe Failed Payment Benchmarks — Dunlo",
        description:
          "A free benchmark and calculator for Stripe failed payment rates, decline codes, and recoverable revenue.",
      }),
    ],
    links: [canonicalLink("/benchmark")],
  }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(publicBenchmarkQueryOptions()),
  component: BenchmarkPage,
});

function BenchmarkPage() {
  const { data } = useSuspenseQuery(publicBenchmarkQueryOptions());
  const [inputRate, setInputRate] = useState(6.2);
  const [monthlyRevenue, setMonthlyRevenue] = useState(24_000);

  const calculator = useMemo(() => {
    const rateDelta = Math.max(0, inputRate - data.calculatorAverage);
    return {
      percentile: estimatePercentile(inputRate, data.calculatorAverage),
      recoverableMonthly: Math.round(monthlyRevenue * (rateDelta / 100) * 0.48),
    };
  }, [data.calculatorAverage, inputRate, monthlyRevenue]);

  return (
    <div className="min-h-dvh bg-[#e9eaeb] font-sans text-zinc-950">
      <Nav />
      <main className="mx-auto max-w-6xl px-4 pb-10 pt-32 md:px-6 md:pt-36">
        <section className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_0.85fr] md:items-end">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-sm font-semibold text-zinc-600 shadow-sm"
            >
              <Database size={14} className="text-dunlo-deep" />
              Updated monthly
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04, duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl text-4xl font-bold leading-none tracking-tight text-zinc-950 md:text-6xl"
            >
              Stripe failed payment benchmarks
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-600"
            >
              See the current SaaS baseline by decline code, then calculate how
              your own Stripe failed payment rate compares.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_24px_60px_-32px_rgba(24,24,27,0.25)]"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Global average failed payment rate
            </p>
            <div className="mt-5 flex items-end justify-between gap-4">
              <p className="font-mono text-6xl font-bold leading-none tracking-tight text-zinc-950">
                {formatRate(data.globalRate)}
              </p>
              <div className="pb-1 text-right">
                <p className="font-mono text-lg font-bold text-zinc-700">
                  {formatRate(data.globalMedian)}
                </p>
                <p className="text-xs text-zinc-400">median</p>
              </div>
            </div>
            <p className="mt-5 text-xs leading-relaxed text-zinc-500">
              {data.source}
            </p>
          </motion.div>
        </section>

        <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_0.72fr]">
          <div className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-[0_18px_45px_-30px_rgba(24,24,27,0.2)]">
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-bold text-zinc-950">
                  Benchmarks by failure code
                </h2>
                <p className="mt-1 text-xs text-zinc-400">
                  Based on {data.analyzedCharges.toLocaleString("en-US")} Stripe
                  charges analyzed
                </p>
              </div>
              <BarChart3 size={18} className="text-zinc-400" />
            </div>
            <div className="divide-y divide-zinc-100">
              {data.codeRows.map((row, index) => (
                <motion.div
                  key={row.code}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.08 + index * 0.05,
                    duration: 0.24,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">
                      {row.label}
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">
                      {row.recoverableRate}% recoverable with targeted follow-up
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xl font-bold text-zinc-950">
                      {formatRate(row.averageRate)}
                    </p>
                    <p className="text-xs text-zinc-400">avg</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-[0_18px_45px_-30px_rgba(24,24,27,0.2)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-zinc-950">
                  How does your rate compare?
                </h2>
                <p className="mt-1 text-xs text-zinc-400">
                  Quick calculator, no signup.
                </p>
              </div>
              <Calculator size={18} className="text-zinc-400" />
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-xs font-semibold text-zinc-600">
                  Your failed payment rate
                </span>
                <input
                  type="number"
                  min="0"
                  max="30"
                  step="0.1"
                  value={inputRate}
                  onChange={(event) => setInputRate(Number(event.target.value))}
                  className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 font-mono text-sm text-zinc-950 outline-none transition-colors focus:border-dunlo focus:ring-2 focus:ring-dunlo/20"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-zinc-600">
                  Monthly recurring revenue
                </span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={monthlyRevenue}
                  onChange={(event) =>
                    setMonthlyRevenue(Number(event.target.value))
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 font-mono text-sm text-zinc-950 outline-none transition-colors focus:border-dunlo focus:ring-2 focus:ring-dunlo/20"
                />
              </label>
            </div>

            <div className="mt-5 rounded-2xl border border-dunlo/20 bg-dunlo/[0.07] p-4">
              <div className="flex items-start gap-3">
                <Gauge size={18} className="mt-1 text-dunlo-deep" />
                <div>
                  <p className="text-sm font-bold text-zinc-950">
                    Top {calculator.percentile}% risk band
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-600">
                    Estimated recoverable revenue:{" "}
                    <span className="font-mono font-bold text-dunlo-deep">
                      ${calculator.recoverableMonthly.toLocaleString("en-US")}/mo
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <Link
              to="/login"
              className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 text-sm font-bold text-white transition-all hover:bg-zinc-800 active:scale-[0.98]"
            >
              See your full breakdown - connect Stripe free
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
