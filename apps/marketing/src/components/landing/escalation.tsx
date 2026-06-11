"use client";

import Link from "next/link";
import { SIGNUP_URL } from "@/lib/app-url";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronRight,
  CreditCard,
  Mail,
  PenLine,
  Send,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";

const steps = [
  {
    label: "Stripe failed",
    detail: "authentication_required",
    icon: CreditCard,
  },
  {
    label: "Dunlo paused",
    detail: "$956 above founder threshold",
    icon: Sparkles,
  },
  {
    label: "Draft written",
    detail: "context pulled from Stripe",
    icon: PenLine,
  },
  {
    label: "Founder sends",
    detail: "personal note, secure link",
    icon: Send,
  },
] as const;

const draftLines = [
  "Hi Lucas, I saw the Northstar Ledger payment needs bank approval.",
  "I paused the automated reminders so this does not feel noisy.",
  "Here is the secure Stripe link when you are ready to approve it.",
] as const;

export function Escalation() {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduceMotion) {
      setActive(steps.length - 1);
      return;
    }

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % steps.length);
    }, 1900);

    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  const activeStep = steps[active]!;
  const ActiveIcon = activeStep.icon;

  return (
    <section
      id="escalation"
      className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-[0_30px_90px_-68px_rgba(15,23,42,0.5)]"
    >
      <div className="grid gap-0 lg:grid-cols-[0.86fr_1.14fr]">
        <div className="border-b border-gray-200 p-6 md:p-9 lg:border-b-0 lg:border-r">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
            Escalation
          </p>
          <h2 className="mt-4 max-w-xl text-4xl font-semibold leading-none tracking-tight text-gray-950 md:text-6xl">
            Keep automation away from revenue that needs a human.
          </h2>
          <p className="mt-5 max-w-[58ch] text-base leading-7 text-gray-600">
            Dunlo handles routine failed payments automatically, then pauses
            sensitive accounts and drafts a founder note with Stripe context
            already attached.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3">
            {[
              ["$956", "payment value"],
              ["$500", "founder threshold"],
              ["4", "steps before send"],
              ["0", "generic reminders"],
            ].map(([value, label]) => (
              <div key={label} className="border-t border-gray-200 pt-3">
                <p className="font-mono text-2xl font-semibold tracking-tight text-gray-950">
                  {value}
                </p>
                <p className="mt-1 text-xs font-medium text-gray-500">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={SIGNUP_URL}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800 active:scale-[0.98]"
            >
              Review an escalation
              <ChevronRight size={15} strokeWidth={2} />
            </Link>
            <a
              href="#pricing"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 transition-all hover:border-gray-400 active:scale-[0.98]"
            >
              See beta pricing
              <ArrowRight size={15} strokeWidth={2} />
            </a>
          </div>
        </div>

        <div className="relative bg-stone-50 p-4 md:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:52px_52px]" />
          <div className="relative mx-auto max-w-2xl">
            <div className="rounded-[1.7rem] border border-gray-200 bg-white shadow-[0_24px_80px_-62px_rgba(15,23,42,0.55)]">
              <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/80 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-gray-300" />
                  <span className="size-2.5 rounded-full bg-gray-300" />
                  <span className="size-2.5 rounded-full bg-dunlo" />
                  <span className="ml-2 font-mono text-xs font-semibold text-gray-500">
                    founder-review
                  </span>
                </div>
                <span className="rounded-full border border-dunlo/30 bg-dunlo/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-dunlo-deep">
                  paused
                </span>
              </div>

              <div className="p-4 md:p-5">
                <div className="grid gap-3 md:grid-cols-[0.74fr_1.26fr]">
                  <div className="rounded-[1.25rem] border border-gray-100 bg-gray-50 p-4">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                      Account
                    </p>
                    <h3 className="mt-3 text-xl font-semibold tracking-tight text-gray-950">
                      Lucas Fontaine
                    </h3>
                    <p className="mt-1 text-sm font-medium text-gray-500">
                      Northstar Ledger
                    </p>
                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <div className="rounded-2xl bg-white p-3">
                        <p className="font-mono text-lg font-semibold">
                          $956
                        </p>
                        <p className="text-[11px] font-medium text-gray-500">
                          failed
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white p-3">
                        <p className="font-mono text-lg font-semibold">
                          3y
                        </p>
                        <p className="text-[11px] font-medium text-gray-500">
                          customer
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.25rem] bg-gray-950 p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-dunlo">
                          Active step
                        </p>
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.h3
                            key={activeStep.label}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.28 }}
                            className="mt-2 text-2xl font-semibold tracking-tight"
                          >
                            {activeStep.label}
                          </motion.h3>
                        </AnimatePresence>
                        <p className="mt-1 font-mono text-xs text-white/45">
                          {activeStep.detail}
                        </p>
                      </div>
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-dunlo/12 text-dunlo">
                        <ActiveIcon size={18} strokeWidth={2} />
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-4 gap-2">
                      {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = index === active;
                        const isDone = index < active || active === steps.length - 1;

                        return (
                          <div
                            key={step.label}
                            className={`rounded-2xl border p-2 transition-colors ${
                              isActive
                                ? "border-dunlo/40 bg-dunlo/12"
                                : isDone
                                  ? "border-white/10 bg-white/10"
                                  : "border-white/10 bg-white/5"
                            }`}
                          >
                            <Icon
                              className={
                                isActive || isDone
                                  ? "text-dunlo"
                                  : "text-white/35"
                              }
                              size={15}
                              strokeWidth={2}
                            />
                            <p className="mt-2 truncate text-[10px] font-semibold text-white/70">
                              {step.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-3 rounded-[1.25rem] border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                      Founder draft
                    </p>
                    <Mail size={17} strokeWidth={2} className="text-dunlo-deep" />
                  </div>
                  <div className="mt-4 space-y-2">
                    {draftLines.map((line, index) => (
                      <motion.p
                        key={line}
                        initial={false}
                        animate={{
                          opacity: active >= 2 ? 1 : index === 0 ? 0.55 : 0.25,
                          y: active >= 2 ? 0 : 2,
                        }}
                        className="rounded-2xl bg-white px-3 py-2 text-sm leading-6 text-gray-600"
                      >
                        {line}
                      </motion.p>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {["Review", "Regenerate", "Send"].map((label) => (
                      <button
                        key={label}
                        className={`rounded-full px-4 py-2 text-xs font-semibold transition-all active:scale-[0.98] ${
                          label === "Send"
                            ? "bg-dunlo text-white hover:bg-dunlo-hover"
                            : "border border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                        }`}
                        type="button"
                      >
                        {label === "Send" && active === steps.length - 1 ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Check size={13} strokeWidth={2} />
                            Sent
                          </span>
                        ) : (
                          label
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
