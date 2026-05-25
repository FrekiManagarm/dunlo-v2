"use client";

import { motion } from "framer-motion";
import { CreditCard, FileText, MailCheck } from "lucide-react";

const FEATURE_ITEMS = [
  {
    label: "Understand",
    title: "Shows why the payment failed",
    body: "Expired card, insufficient funds, bank decline, or do-not-honor are treated as different recovery paths.",
    icon: CreditCard,
  },
  {
    label: "Recover",
    title: "Sends the right follow-up",
    body: "Dunlo matches the Stripe reason to a clearer message, safer timing, and the right payment update path.",
    icon: MailCheck,
  },
  {
    label: "Escalate",
    title: "Keeps important accounts human",
    body: "High-value failures can pause automation and become a founder email draft before the customer goes quiet.",
    icon: FileText,
  },
] as const;

export function AnimatedFeatureItems() {
  return (
    <div className="mt-3 divide-y divide-gray-100 border-y border-gray-100">
      {FEATURE_ITEMS.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <motion.article
            key={feature.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-70px" }}
            transition={{
              duration: 0.52,
              delay: index * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="grid gap-3 py-3 sm:grid-cols-[128px_1fr] sm:items-start"
          >
            <div className="flex items-center gap-2">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-950 text-white">
                <Icon size={15} strokeWidth={1.8} />
              </span>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                {feature.label}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-tight text-gray-950">
                {feature.title}
              </h4>
              <p className="mt-1 text-xs leading-5 text-gray-600">
                {feature.body}
              </p>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
