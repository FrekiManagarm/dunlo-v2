import Link from "next/link";
import { appUrl } from "@/lib/app-url";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { FadeIn, SectionPill } from "./shared";

const MIN_MRR = 1000;
const MAX_MRR = 20_000;
const STEP = 500;
const FAILED_PAYMENT_RATE = 0.05;
const RECOVERABLE_RATE = 0.63;
const DUNLO_PRICE = 19;
const GROWTH_PLAN_PRICE = 149;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompact(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 0,
  }).format(value);
}

function AnimatedCurrency({ value }: { value: number }) {
  const raw = useMotionValue(value);
  const spring = useSpring(raw, { stiffness: 100, damping: 20 });
  const display = useTransform(spring, (latest) => formatCurrency(latest));

  useEffect(() => {
    raw.set(value);
  }, [raw, value]);

  return <motion.span>{display}</motion.span>;
}

export function RoiCalculator() {
  const [mrr, setMrr] = useState(6000);

  const recovered = useMemo(
    () => Math.round(mrr * FAILED_PAYMENT_RATE * RECOVERABLE_RATE),
    [mrr],
  );
  const annualRecoverable = recovered * 12;
  const roi = recovered / DUNLO_PRICE;
  const progress = ((mrr - MIN_MRR) / (MAX_MRR - MIN_MRR)) * 100;
  const monthlyFailed = Math.round(mrr * FAILED_PAYMENT_RATE);

  return (
    <FadeIn>
      <section
        id="roi-calculator"
        className="overflow-hidden rounded-3xl border border-gray-200/60 bg-white"
      >
        <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="border-b border-gray-100 p-8 md:p-12 lg:border-r lg:border-b-0 lg:p-14">
            <SectionPill>ROI calculator</SectionPill>
            <h2 className="mt-4 max-w-xl text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Estimate the revenue hiding in failed payments.
            </h2>
            <p className="mt-3 max-w-md text-base leading-relaxed text-gray-500">
              Move the slider to match your MRR. Dunlo estimates failed
              revenue, then applies a recoverable-rate assumption so the number
              stays understandable instead of magical.
            </p>

            <div className="mt-10 space-y-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <label
                    htmlFor="mrr-slider"
                    className="block text-sm font-semibold text-gray-900"
                  >
                    Estimated MRR
                  </label>
                  <p className="mt-1 text-sm text-gray-500">
                    From {formatCurrency(MIN_MRR)} to{" "}
                    {formatCurrency(MAX_MRR)}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-2 text-right">
                  <p className="font-mono text-2xl font-bold tracking-tighter text-gray-900">
                    {formatCurrency(mrr)}
                  </p>
                </div>
              </div>

              <div className="relative py-4">
                <div className="h-3 rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-dunlo"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <input
                  id="mrr-slider"
                  type="range"
                  min={MIN_MRR}
                  max={MAX_MRR}
                  step={STEP}
                  value={mrr}
                  onChange={(event) => setMrr(Number(event.target.value))}
                  className="peer absolute inset-x-0 top-1/2 h-8 w-full -translate-y-1/2 cursor-pointer opacity-0"
                  aria-describedby="roi-calculator-result"
                />
                <div
                  className="pointer-events-none absolute top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-dunlo shadow-[0_10px_25px_-12px_rgba(15,23,42,0.35)] transition-shadow peer-focus-visible:ring-4 peer-focus-visible:ring-dunlo/20"
                  style={{ left: `${progress}%` }}
                />
              </div>

              <div className="flex justify-between font-mono text-xs font-semibold text-gray-400">
                <span>{formatCompact(MIN_MRR)}</span>
                <span>{formatCompact(MAX_MRR)}</span>
              </div>
            </div>
          </div>

          <div className="relative bg-gray-900 p-8 text-white md:p-12 lg:p-14">
            <div className="absolute inset-x-8 top-0 h-px bg-white/10 md:inset-x-12 lg:inset-x-14" />
            <div className="flex h-full min-h-95 flex-col justify-between gap-10">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <span className="size-2 animate-pulse rounded-full bg-dunlo" />
                  30-day estimate
                </div>
                <p
                  id="roi-calculator-result"
                  className="max-w-md text-3xl font-bold leading-tight tracking-tight md:text-4xl"
                  aria-live="polite"
                >
                  You may have ~
                  <span className="text-dunlo">
                    <AnimatedCurrency value={recovered} />
                  </span>
                  /mo in recoverable failed-payment revenue.
                </p>
                <p className="max-w-sm text-sm font-semibold leading-6 text-white/70">
                  That's{" "}
                  <span className="font-mono text-white">
                    <AnimatedCurrency value={annualRecoverable} />
                  </span>{" "}
                  per year leaving your Stripe account quietly. Dunlo's Growth
                  plan is {formatCurrency(GROWTH_PLAN_PRICE)}/mo.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <p className="text-xs font-medium text-white/40">
                    Failed MRR at risk
                  </p>
                  <p className="mt-2 font-mono text-2xl font-bold tracking-tighter text-white">
                    {formatCurrency(monthlyFailed)}
                  </p>
                </div>
                <div className="rounded-2xl border border-dunlo/25 bg-dunlo/10 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <p className="text-xs font-medium text-dunlo/80">
                    ROI in 30 days
                  </p>
                  <p className="mt-2 font-mono text-2xl font-bold tracking-tighter text-dunlo">
                    {roi.toFixed(1)}x
                  </p>
                </div>
              </div>

              <div className="space-y-5 border-t border-white/10 pt-6">
                <p className="text-sm leading-relaxed text-white/45">
                  Estimate based on {formatCurrency(monthlyFailed)} failed MRR
                  at risk, a 5% failed-payment rate, and 63% recoverability.
                  Actual recovery depends on your customer mix, card network
                  response, timing, and message quality.
                </p>
                <Link
                  href={appUrl("/signup")}
                  className="inline-flex rounded-full bg-dunlo px-6 py-3 text-sm font-semibold text-gray-900 transition-all hover:bg-dunlo-hover active:scale-[0.97]"
                >
                  See my benchmark
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </FadeIn>
  );
}
