import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Calculator,
  CircleDollarSign,
  Gauge,
  MailCheck,
  ShieldCheck,
  TimerReset,
} from "lucide-react";

import { Footer } from "@/components/landing/footer";
import { Nav } from "@/components/landing/nav";
import { formatRate } from "@/lib/benchmark";
import { breadcrumbJsonLd, canonicalLink, ogMeta } from "@/lib/seo";

const GLOBAL_AVERAGE = 5;
const RECOVERY_MULTIPLIER = 0.48;

const failureBenchmarks = [
  {
    code: "card_expired",
    label: "Card expired",
    averageRate: 0.8,
    recoverableRate: 63,
    meaning: "The saved card is past its expiry date.",
    customer: "The customer probably has no idea anything broke.",
    emailAngle: "Friendly card-update note with a one-click billing link.",
    timing: "Send immediately on day 0.",
    avoid: "Do not make it sound urgent or accusatory.",
  },
  {
    code: "insufficient_funds",
    label: "Insufficient funds",
    averageRate: 1.9,
    recoverableRate: 31,
    meaning: "The bank declined because funds or credit were not available.",
    customer:
      "The customer may know cash is tight or may be waiting for a reset.",
    emailAngle:
      "Empathetic retry notice. Let them know you will try again later.",
    timing: "Wait at least 3 days before retrying.",
    avoid: "Do not demand a card update as the first response.",
  },
  {
    code: "do_not_honor",
    label: "Do not honor",
    averageRate: 0.7,
    recoverableRate: 44,
    meaning: "The issuing bank blocked the charge for a private reason.",
    customer: "The card can work elsewhere, which makes this feel confusing.",
    emailAngle:
      "Explain the bank block and offer two fixes: call the bank or use another card.",
    timing: "Send on day 0 before another retry.",
    avoid: "Do not retry repeatedly without customer action.",
  },
  {
    code: "card_declined",
    label: "Card declined",
    averageRate: 1.6,
    recoverableRate: 28,
    meaning:
      "Stripe returned a generic decline without a precise customer-safe reason.",
    customer: "The customer has little useful context and needs options.",
    emailAngle:
      "Conservative dual-option email: approve with bank or add another card.",
    timing: "Send on day 1 after one clean delayed retry window.",
    avoid: "Do not pretend you know the exact cause.",
  },
] as const;

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };

export const Route = createFileRoute("/benchmark")({
  head: () => ({
    meta: [
      { title: "Stripe Failed Payment Benchmark — Dunlo" },
      {
        name: "description",
        content:
          "See whether your Stripe failed payment rate is normal, compare it with SaaS benchmarks, and estimate recoverable revenue.",
      },
      {
        name: "keywords",
        content:
          "stripe failed payment rate average, stripe decline rate benchmark, is my stripe payment failure rate normal, stripe failed payment rate saas",
      },
      ...ogMeta({
        title: "Stripe Failed Payment Benchmark — Dunlo",
        description:
          "A free benchmark and calculator for Stripe failed payment rates, decline codes, and recoverable revenue.",
        path: "/benchmark",
      }),
    ],
    links: [canonicalLink("/benchmark")],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Stripe failed payment benchmarks", path: "/benchmark" },
          ]),
        ),
      },
    ],
  }),
  component: BenchmarkPage,
});

function getBiggestOpportunity(rate: number) {
  if (rate < GLOBAL_AVERAGE) return failureBenchmarks[0];
  if (rate < 7) return failureBenchmarks[1];
  if (rate < 10) return failureBenchmarks[2];
  return failureBenchmarks[3];
}

function BenchmarkPage() {
  const [inputRate, setInputRate] = useState(6);
  const [monthlyRevenue, setMonthlyRevenue] = useState(24_000);

  const calculator = useMemo(() => {
    const delta = inputRate - GLOBAL_AVERAGE;
    const recoverableMonthly = Math.max(
      0,
      Math.round(
        monthlyRevenue * (Math.max(delta, 0) / 100) * RECOVERY_MULTIPLIER,
      ),
    );
    const opportunity = getBiggestOpportunity(inputRate);

    return {
      delta,
      recoverableMonthly,
      opportunity,
      headline:
        delta >= 0
          ? `You're above the ~${GLOBAL_AVERAGE}% industry average`
          : `You're below the ~${GLOBAL_AVERAGE}% industry average`,
    };
  }, [inputRate, monthlyRevenue]);

  return (
    <div className="min-h-dvh bg-zinc-100 font-sans text-zinc-950">
      <Nav />
      <main className="mx-auto max-w-7xl px-4 pb-14 pt-28 md:px-6 md:pt-36">
        <section className="grid grid-cols-1 gap-7 lg:grid-cols-[1.12fr_0.88fr] lg:items-end">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={spring}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-sm font-semibold text-zinc-600 shadow-[0_14px_35px_-26px_rgba(24,24,27,0.3)]"
            >
              <Gauge size={15} className="text-dunlo-deep" />
              Free, no account required
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.04 }}
              className="text-4xl font-bold leading-none tracking-tight text-zinc-950 md:text-6xl"
            >
              Stripe Failed Payment Benchmark
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.08 }}
              className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-600 md:text-lg"
            >
              See how your recovery rate compares to similar SaaS. Enter your
              failed payment rate and monthly revenue to estimate the recovery
              opportunity hiding in Stripe declines.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.12 }}
            className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-[0_24px_60px_-34px_rgba(24,24,27,0.3)] md:p-6"
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                  Public SaaS baseline
                </p>
                <p className="mt-4 font-mono text-6xl font-bold leading-none tracking-tight text-zinc-950">
                  ~{formatRate(GLOBAL_AVERAGE)}
                </p>
              </div>
              <BarChart3 size={21} className="text-zinc-400" />
            </div>
            <p className="mt-5 text-sm leading-relaxed text-zinc-500">
              Based on public Stripe and ProfitWell baselines while Dunlo builds
              an anonymized benchmark from beta users.
            </p>
          </motion.div>
        </section>

        <section className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.16 }}
            className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-[0_22px_56px_-34px_rgba(24,24,27,0.26)] md:p-6"
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-zinc-950">
                  Is my failed payment rate normal?
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Mini calculator for Stripe SaaS subscriptions.
                </p>
              </div>
              <Calculator size={20} className="text-zinc-400" />
            </div>

            <div className="space-y-5">
              <label className="block">
                <span className="text-sm font-semibold text-zinc-700">
                  What's your current failed payment rate?
                </span>
                <div className="mt-3 grid grid-cols-[1fr_88px] items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="18"
                    step="0.1"
                    value={inputRate}
                    onChange={(event) =>
                      setInputRate(Number(event.target.value))
                    }
                    className="w-full accent-dunlo"
                  />
                  <input
                    type="number"
                    min="0"
                    max="30"
                    step="0.1"
                    value={inputRate}
                    onChange={(event) =>
                      setInputRate(Number(event.target.value))
                    }
                    className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-right font-mono text-sm text-zinc-950 outline-none transition-colors focus:border-dunlo focus:ring-2 focus:ring-dunlo/20"
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-zinc-700">
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

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl border border-dunlo/20 bg-dunlo/[0.07] p-4">
                <p className="text-sm font-bold text-zinc-950">
                  {calculator.headline}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                  At your MRR level, that's approximately{" "}
                  <span className="font-mono font-bold text-dunlo-deep">
                    ${calculator.recoverableMonthly.toLocaleString("en-US")}/mo
                  </span>{" "}
                  in recoverable revenue.
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                  Biggest opportunity
                </p>
                <p className="mt-2 text-sm font-bold text-zinc-950">
                  {calculator.opportunity.code} typically averages{" "}
                  {formatRate(calculator.opportunity.averageRate)}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                  {calculator.opportunity.emailAngle}
                </p>
              </div>
            </div>

            <Link
              to="/login"
              className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 text-sm font-bold text-white transition-all hover:bg-zinc-800 active:scale-[0.98]"
            >
              See your full breakdown - connect Stripe free
              <ArrowRight size={15} />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.2 }}
            className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-[0_22px_56px_-34px_rgba(24,24,27,0.24)]"
          >
            <div className="flex flex-col gap-2 border-b border-zinc-100 px-5 py-5 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-zinc-950">
                  Benchmarks by failure code
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Hardcoded Phase 1 public baselines.
                </p>
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Stripe SaaS average
              </p>
            </div>
            <div className="divide-y divide-zinc-100">
              {failureBenchmarks.map((row, index) => (
                <motion.div
                  key={row.code}
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...spring, delay: 0.24 + index * 0.05 }}
                  className="grid grid-cols-1 gap-3 px-5 py-4 md:grid-cols-[1fr_auto_auto] md:items-center md:gap-8"
                >
                  <div>
                    <p className="font-mono text-sm font-bold text-zinc-950">
                      {row.code}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">{row.meaning}</p>
                  </div>
                  <div className="flex items-center justify-between gap-6 md:block md:text-right">
                    <p className="text-xs text-zinc-400 md:hidden">Average</p>
                    <p className="font-mono text-xl font-bold text-zinc-950">
                      ~{formatRate(row.averageRate)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-6 md:block md:text-right">
                    <p className="text-xs text-zinc-400 md:hidden">
                      Recoverable
                    </p>
                    <p className="font-mono text-xl font-bold text-dunlo-deep">
                      {row.recoverableRate}%
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="mt-12">
          <div className="mb-6 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-dunlo-dim">
              Recovery playbook
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-950 md:text-4xl">
              What each code means for your recovery
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {failureBenchmarks.map((row, index) => (
              <motion.article
                key={row.code}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ ...spring, delay: index * 0.04 }}
                className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-[0_18px_48px_-34px_rgba(24,24,27,0.22)] md:p-6"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-sm font-bold text-zinc-950">
                      {row.code}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">{row.label}</p>
                  </div>
                  <span className="rounded-full border border-dunlo/20 bg-dunlo/10 px-3 py-1 font-mono text-xs font-bold text-dunlo-deep">
                    {row.recoverableRate}% recovery avg
                  </span>
                </div>

                <div className="space-y-4 text-sm leading-relaxed text-zinc-600">
                  <div className="flex gap-3">
                    <ShieldCheck
                      size={18}
                      className="mt-0.5 shrink-0 text-zinc-400"
                    />
                    <p>
                      <span className="font-semibold text-zinc-950">
                        Meaning:
                      </span>{" "}
                      {row.meaning} {row.customer}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <MailCheck
                      size={18}
                      className="mt-0.5 shrink-0 text-zinc-400"
                    />
                    <p>
                      <span className="font-semibold text-zinc-950">
                        Email:
                      </span>{" "}
                      {row.emailAngle}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <TimerReset
                      size={18}
                      className="mt-0.5 shrink-0 text-zinc-400"
                    />
                    <p>
                      <span className="font-semibold text-zinc-950">
                        Timing:
                      </span>{" "}
                      {row.timing} {row.avoid}
                    </p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="mt-12 overflow-hidden rounded-[2rem] border border-zinc-200 bg-zinc-950 p-6 text-white shadow-[0_28px_70px_-36px_rgba(24,24,27,0.45)] md:p-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-dunlo">
                Phase 2
              </p>
              <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
                Your personal benchmark will be built from your Stripe data.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-300">
                Connect Stripe to see your real failure-code mix, recoverable
                revenue, and best next email sequence. Dunlo is free during
                beta.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-dunlo px-5 text-sm font-bold text-zinc-950 transition-all hover:bg-dunlo-hover active:scale-[0.98]"
            >
              Connect Stripe to see your personal benchmark
              <CircleDollarSign size={16} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
