import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Gauge,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import { Logo } from "@/components/logo";
import { getUser } from "@/functions/get-user";
import { formatRate } from "@/lib/benchmark";
import { userBenchmarkQueryOptions } from "@/lib/queries";

export const Route = createFileRoute("/dashboard/benchmark")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Your Stripe benchmark — Dunlo" },
    ],
  }),
  beforeLoad: async () => {
    const session = await getUser();
    if (!session?.user)
      throw redirect({ to: "/login", search: { mode: "signin" } });
    return { session };
  },
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(userBenchmarkQueryOptions()),
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = useSuspenseQuery(userBenchmarkQueryOptions());
  const isAboveAverage = data.userRate > data.averageRate;

  return (
    <main className="min-h-dvh bg-[#f7f8fa] font-sans text-zinc-950">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 md:px-6">
        <Logo size={28} />
        <Link
          to="/dashboard"
          className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-600 transition-all hover:border-zinc-300 hover:text-zinc-950 active:scale-[0.98]"
        >
          Skip to dashboard
        </Link>
      </header>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 pb-10 pt-6 md:grid-cols-[1.05fr_0.95fr] md:px-6 md:pb-16 md:pt-12">
        <div className="flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-dunlo/25 bg-dunlo/[0.07] px-3 py-1.5 text-xs font-semibold text-dunlo-deep"
          >
            <span className="size-1.5 animate-pulse rounded-full bg-dunlo" />
            Stripe connected. Benchmark ready.
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.04,
              duration: 0.28,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="max-w-2xl text-4xl font-bold leading-none tracking-tight text-zinc-950 md:text-6xl"
          >
            Your failed payment rate is{" "}
            <span
              className={isAboveAverage ? "text-red-600" : "text-dunlo-deep"}
            >
              {formatRate(data.userRate)}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.08,
              duration: 0.28,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="mt-5 max-w-xl text-base leading-relaxed text-zinc-500 md:text-lg"
          >
            Similar SaaS companies average {formatRate(data.averageRate)}.{" "}
            {isAboveAverage
              ? `You're losing an estimated ${data.estimatedMonthlyLeakFormatted}/mo more than you should.`
              : "You're currently tracking better than the baseline."}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.12,
              duration: 0.28,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              to="/sequences"
              search={{ seq: undefined, step: undefined }}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-dunlo px-6 text-sm font-bold text-white transition-all hover:bg-dunlo-hover active:scale-[0.98]"
            >
              Fix your biggest leak first
              <ArrowRight size={15} />
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-700 transition-all hover:border-zinc-300 hover:text-zinc-950 active:scale-[0.98]"
            >
              Open dashboard
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden rounded-[2rem] border border-zinc-200/70 bg-white shadow-[0_24px_60px_-30px_rgba(24,24,27,0.22)]"
        >
          <div className="border-b border-zinc-100 px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                  Failure code breakdown
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  90-day Stripe sample
                </p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-full bg-zinc-950 text-white">
                <BarChart3 size={17} />
              </div>
            </div>
          </div>

          <div className="divide-y divide-zinc-100">
            {data.breakdown.slice(0, 4).map((item, index) => (
              <motion.div
                key={item.code}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.18 + index * 0.05,
                  duration: 0.24,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="px-5 py-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">
                      {item.label}
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">
                      Avg {formatRate(item.averageRate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-lg font-bold text-zinc-950">
                      {formatRate(item.rate)}
                    </p>
                    <p
                      className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                        item.status === "above"
                          ? "border-red-100 bg-red-50 text-red-600"
                          : "border-dunlo/20 bg-dunlo/[0.07] text-dunlo-deep"
                      }`}
                    >
                      {item.status === "above" ? "Above average" : "Normal"}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 divide-y divide-zinc-100 bg-zinc-50/70 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {[
              {
                icon: Gauge,
                label: "Percentile",
                value: `Top ${data.percentile}%`,
              },
              {
                icon: RefreshCw,
                label: "Recovered",
                value: String(data.recoveredFailureCount),
              },
              { icon: ShieldCheck, label: "Data", value: "Anonymized" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="px-5 py-4">
                <Icon size={15} className="mb-3 text-zinc-400" />
                <p className="font-mono text-lg font-bold text-zinc-950">
                  {value}
                </p>
                <p className="text-xs text-zinc-400">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 md:px-6">
        <div className="grid grid-cols-1 gap-3 rounded-[1.5rem] border border-zinc-200 bg-white p-4 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-dunlo/8">
              <CheckCircle2 size={16} className="text-dunlo-deep" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-950">
                Benchmark data is aggregated without customer details.
              </p>
              <p className="mt-1 max-w-3xl text-xs leading-relaxed text-zinc-500">
                Dunlo stores only rates, counts, recovery rate, and MRR range
                for anonymized benchmarking. Customer names, emails, exact
                revenue, and business-identifying details stay out of the
                benchmark set.
              </p>
            </div>
          </div>
          <Link
            to="/onboarding"
            search={{ step: 2, error: undefined, msg: undefined }}
            className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-200 px-4 text-xs font-bold text-zinc-700 transition-all hover:border-zinc-300 hover:text-zinc-950 active:scale-[0.98]"
          >
            Continue setup
          </Link>
        </div>
      </section>
    </main>
  );
}
