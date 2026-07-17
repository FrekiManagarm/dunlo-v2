"use client";

import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { captureMarketingEvent } from "@/lib/posthog";
import { SIGNUP_URL } from "@/lib/app-url";
import {
  RECOVERABILITY_RATE,
  RECOVERABILITY_PERCENT,
  RECOVERY_MODEL_UPDATED,
} from "@/lib/recovery-assumptions";

const MIN_MRR = 1000;
const MAX_MRR = 20_000;
const STEP = 500;
const FAILED_PAYMENT_RATE = 0.05;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function AnimatedCurrency({ value }: { value: number }) {
  const shouldReduceMotion = useReducedMotion();
  const raw = useMotionValue(value);
  const spring = useSpring(raw, { stiffness: 120, damping: 22 });
  const display = useTransform(spring, (latest) => formatCurrency(latest));

  useEffect(() => {
    raw.set(value);
  }, [raw, value]);

  if (shouldReduceMotion) return <span>{formatCurrency(value)}</span>;

  return <motion.span>{display}</motion.span>;
}

export function RoiCalculator() {
  const [mrr, setMrr] = useState(6000);
  const monthlyFailed = useMemo(
    () => Math.round(mrr * FAILED_PAYMENT_RATE),
    [mrr],
  );
  const recovered = useMemo(
    () => Math.round(monthlyFailed * RECOVERABILITY_RATE),
    [monthlyFailed],
  );
  const annualRecoverable = recovered * 12;
  const progress = ((mrr - MIN_MRR) / (MAX_MRR - MIN_MRR)) * 100;

  function captureMrrChange(value: number) {
    captureMarketingEvent("tool_value_changed", {
      tool_name: "homepage_roi_calculator",
      field_name: "mrr",
      value_bucket:
        value < 5_000 ? "<$5k" : value < 20_000 ? "$5k-$20k" : "$20k+",
    });
  }

  return (
    <section id="roi-calculator" className="bg-dunlo-ground px-4 py-24 md:px-6 md:py-36">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold text-dunlo-deep">Recovery estimate</p>
            <h2 className="mt-5 max-w-2xl text-balance text-4xl font-bold leading-[0.94] tracking-[-0.04em] md:text-6xl">
              Find the revenue already hiding in Stripe.
            </h2>
          </div>
          <p className="max-w-[58ch] text-pretty text-base leading-7 text-gray-700 md:text-lg md:leading-8 lg:justify-self-end">
            Move your MRR. Dunlo exposes every assumption behind the estimate,
            because recovery should feel measurable—not magical.
          </p>
        </div>

        <div className="mt-16 grid border-y-2 border-dunlo-ink lg:grid-cols-[0.9fr_1.1fr]">
          <div className="border-b border-dunlo-line py-9 lg:border-b-0 lg:border-r lg:pr-12">
            <div className="flex items-end justify-between gap-5">
              <div>
                <label htmlFor="mrr-slider" className="text-sm font-bold text-dunlo-ink">
                  Monthly recurring revenue
                </label>
                <p className="mt-2 text-sm text-gray-600">
                  {formatCurrency(MIN_MRR)}–{formatCurrency(MAX_MRR)}
                </p>
              </div>
              <output htmlFor="mrr-slider" className="text-3xl font-bold tracking-[-0.03em] md:text-4xl">
                {formatCurrency(mrr)}
              </output>
            </div>

            <div className="relative mt-12 py-5">
              <div className="h-1 bg-dunlo-line">
                <div className="h-full bg-dunlo-ink" style={{ width: `${progress}%` }} />
              </div>
              <input
                id="mrr-slider"
                type="range"
                min={MIN_MRR}
                max={MAX_MRR}
                step={STEP}
                value={mrr}
                onChange={(event) => setMrr(Number(event.target.value))}
                onPointerUp={(event) => captureMrrChange(Number(event.currentTarget.value))}
                onKeyUp={(event) => captureMrrChange(Number(event.currentTarget.value))}
                className="peer absolute inset-x-0 top-1/2 h-11 w-full -translate-y-1/2 cursor-pointer opacity-0"
                aria-describedby="roi-calculator-result"
              />
              <div
                className="pointer-events-none absolute top-1/2 size-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-dunlo-ground bg-dunlo peer-focus-visible:ring-4 peer-focus-visible:ring-dunlo-deep peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white"
                style={{ left: `${progress}%` }}
              />
            </div>

            <div className="mt-8 grid grid-cols-2 gap-6 border-t border-dunlo-line pt-7">
              <div>
                <p className="text-xs text-gray-500">Failed MRR at risk</p>
                <p className="mt-2 text-xl font-bold">{formatCurrency(monthlyFailed)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Annualized estimate</p>
                <p className="mt-2 text-xl font-bold">{formatCurrency(annualRecoverable)}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between bg-dunlo-ink px-6 py-9 text-white md:px-10 lg:px-12">
            <div>
              <p className="text-sm font-semibold text-dunlo">Estimated recoverable this month</p>
              <p
                id="roi-calculator-result"
                className="mt-6 text-[clamp(4rem,9vw,7rem)] font-bold leading-none tracking-[-0.04em]"
                aria-live="polite"
              >
                <AnimatedCurrency value={recovered} />
              </p>
            </div>
            <div className="mt-12 border-t border-white/14 pt-6">
              <p className="max-w-[62ch] text-sm leading-6 text-white/62">
                Illustrative estimate using an assumed 5% failed-payment rate
                and {RECOVERABILITY_PERCENT} recoverability. It is not a
                benchmark result or a guarantee. Model updated {RECOVERY_MODEL_UPDATED}.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={SIGNUP_URL}
                  onClick={() =>
                    captureMarketingEvent("cta_clicked", {
                      button_text: "Start measuring failed payments",
                      destination: SIGNUP_URL,
                      location: "homepage_roi_calculator",
                    })
                  }
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-dunlo px-6 text-sm font-bold text-dunlo-ink transition-transform hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  Start measuring failed payments
                </Link>
                <Link
                  href="/benchmark"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 px-6 text-sm font-semibold text-white transition-colors hover:border-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  Explore the public benchmark
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
