"use client";

import Link from "next/link";
import { SIGNUP_URL } from "@/lib/app-url";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Calculator, Gauge, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { captureMarketingEvent } from "@/lib/posthog";

const MIN_MRR = 1000;
const MAX_MRR = 20_000;
const STEP = 500;
const FAILED_PAYMENT_RATE = 0.05;
const RECOVERABLE_RATE = 0.63;
const STARTER_PRICE = 49;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function AnimatedCurrency({ value }: { value: number }) {
  const raw = useMotionValue(value);
  const spring = useSpring(raw, { stiffness: 120, damping: 22 });
  const display = useTransform(spring, (latest) => formatCurrency(latest));

  useEffect(() => {
    raw.set(value);
  }, [raw, value]);

  return <motion.span>{display}</motion.span>;
}

export function RoiCalculator() {
  const [mrr, setMrr] = useState(6000);

  const monthlyFailed = useMemo(
    () => Math.round(mrr * FAILED_PAYMENT_RATE),
    [mrr],
  );
  const recovered = useMemo(
    () => Math.round(monthlyFailed * RECOVERABLE_RATE),
    [monthlyFailed],
  );
  const annualRecoverable = recovered * 12;
  const roi = recovered / STARTER_PRICE;
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
    <section
      id="roi-calculator"
      className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white"
    >
      <div className="grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="border-b border-gray-200 p-6 md:p-9 lg:border-b-0 lg:border-r">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
            ROI calculator
          </p>
          <h2 className="mt-4 max-w-xl text-4xl font-semibold leading-none tracking-tight text-gray-950 md:text-6xl">
            Estimate the revenue hiding in Stripe failures.
          </h2>
          <p className="mt-5 max-w-[58ch] text-base leading-7 text-gray-600">
            Move the slider to model failed MRR, recoverable revenue, and the
            payback window. The assumptions stay visible so the number feels
            useful, not magical.
          </p>

          <div className="mt-9">
            <div className="flex items-end justify-between gap-4">
              <div>
                <label
                  htmlFor="mrr-slider"
                  className="text-sm font-semibold text-gray-950"
                >
                  Monthly recurring revenue
                </label>
                <p className="mt-1 text-sm text-gray-500">
                  Adjust from {formatCurrency(MIN_MRR)} to{" "}
                  {formatCurrency(MAX_MRR)}
                </p>
              </div>
              <p className="rounded-2xl border border-gray-200 bg-stone-50 px-4 py-2 font-mono text-2xl font-semibold tracking-tight">
                {formatCurrency(mrr)}
              </p>
            </div>

            <div className="relative mt-7 py-4">
              <div className="h-2 rounded-full bg-gray-100">
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
                onPointerUp={(event) =>
                  captureMrrChange(Number(event.currentTarget.value))
                }
                onKeyUp={(event) =>
                  captureMrrChange(Number(event.currentTarget.value))
                }
                className="peer absolute inset-x-0 top-1/2 h-8 w-full -translate-y-1/2 cursor-pointer opacity-0"
                aria-describedby="roi-calculator-result"
              />
              <div
                className="pointer-events-none absolute top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-dunlo shadow-[0_14px_30px_-16px_rgba(15,23,42,0.45)] peer-focus-visible:ring-4 peer-focus-visible:ring-dunlo/20"
                style={{ left: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="relative bg-stone-50 p-4 md:p-7">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:52px_52px]" />
          <div className="relative rounded-[1.7rem] border border-gray-200 bg-white p-4 shadow-[0_24px_80px_-62px_rgba(15,23,42,0.48)] md:p-5">
            <div className="rounded-[1.35rem] bg-gray-950 p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-dunlo">
                    30-day estimate
                  </p>
                  <p
                    id="roi-calculator-result"
                    className="mt-4 text-4xl font-semibold leading-none tracking-tight md:text-5xl"
                    aria-live="polite"
                  >
                    <AnimatedCurrency value={recovered} />
                    <span className="block pt-2 text-base font-medium leading-6 text-white/48">
                      likely recoverable this month
                    </span>
                  </p>
                </div>
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-dunlo/12 text-dunlo">
                  <Calculator size={20} strokeWidth={2} />
                </span>
              </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {[
                {
                  label: "Failed MRR at risk",
                  value: formatCurrency(monthlyFailed),
                  icon: Gauge,
                },
                {
                  label: "Yearly upside",
                  value: formatCurrency(annualRecoverable),
                  icon: TrendingUp,
                },
                {
                  label: "30-day ROI",
                  value: `${roi.toFixed(1)}x`,
                  icon: ArrowRight,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-[1.2rem] border border-gray-100 bg-stone-50 p-4"
                  >
                    <Icon className="text-dunlo-deep" size={18} strokeWidth={2} />
                    <p className="mt-4 font-mono text-xl font-semibold tracking-tight text-gray-950">
                      {item.value}
                    </p>
                    <p className="mt-1 text-xs font-medium leading-4 text-gray-500">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 rounded-[1.2rem] border border-gray-100 bg-white p-4">
              <p className="text-sm leading-6 text-gray-600">
                Based on a 5% failed-payment rate and 63% recoverability.
                Actual recovery depends on decline reason mix, customer segment,
                retry timing, and message quality.
              </p>
              <Link
                href={SIGNUP_URL}
                onClick={() =>
                  captureMarketingEvent("cta_clicked", {
                    button_text: "See my benchmark",
                    destination: SIGNUP_URL,
                    location: "homepage_roi_calculator",
                  })
                }
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-dunlo px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-dunlo-hover active:scale-[0.98]"
              >
                See my benchmark
                <ArrowRight size={16} strokeWidth={2} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
