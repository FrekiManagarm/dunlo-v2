"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { appUrl } from "@/lib/app-url";
import { RecoveryConsole } from "./recovery-console";

export function HeroContent() {
  return (
    <div className="relative mx-auto grid min-h-[calc(100dvh-8rem)] max-w-6xl min-w-0 gap-12 py-6 md:grid-cols-[0.92fr_1.08fr] md:items-center md:gap-14 md:py-8">
      <div className="min-w-0 max-w-xl">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.68, ease: [0.16, 1, 0.3, 1] }}
          className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep"
        >
          Stripe Payment Recovery for SaaS
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.78, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 max-w-xl text-4xl font-semibold leading-[1.02] tracking-tight text-gray-950 sm:text-5xl sm:leading-[0.98] md:text-6xl"
        >
          Your best customers don't cancel. They just disappear.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.68, delay: 0.17, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5 max-w-lg border-l-2 border-dunlo pl-4 text-base italic leading-7 text-gray-700"
        >
          I lost my first SaaS users to silent churn. I didn't understand why
          until too late.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 max-w-lg text-base leading-7 text-gray-600"
        >
          Some of your best customers are about to disappear — not because they
          chose to leave, but because their payment failed and nobody followed
          up. Dunlo catches that before it becomes silent churn.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.34, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 flex flex-col gap-3 sm:flex-row"
        >
          <Link
            href={appUrl("/benchmark")}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800 active:scale-[0.98]"
          >
            See your benchmark
            <ArrowRight size={16} />
          </Link>
          <a
            href="#payment-failures"
            className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white/60 px-5 py-3 text-sm font-semibold text-gray-800 transition-all hover:border-gray-400 hover:bg-white active:scale-[0.98]"
          >
            Why payments fail
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.86, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="relative min-w-0 md:pl-10"
      >
        <RecoveryConsole />
      </motion.div>
    </div>
  );
}
