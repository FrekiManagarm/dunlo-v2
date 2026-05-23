import { Link } from "@tanstack/react-router";
import { useInView } from "framer-motion";
import { Check, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { usePostHog } from "posthog-js/react";
import { FadeIn, SectionPill } from "./shared";

const PLANS = [
  {
    name: "Solo",
    price: 19,
    mrr: "< $5k MRR",
    tagline: "Full Dunlo, for early-stage SaaS.",
    description:
      "Every failure code covered. AI escalation included. Built for founders who want it to just work.",
    aiEscalations: "5/mo",
    badge: undefined,
    weeklySummary: false,
    priorityScoring: false,
    highValueAlerts: false,
    recoveryInsights: false,
    teamMembers: "1",
    customIntegrations: false,
    prioritySla: false,
    featured: false,
  },
  {
    name: "Starter",
    price: 49,
    mrr: "$5k-$20k MRR",
    badge: "Most popular",
    tagline: "More coverage, more control.",
    description:
      "20 AI-drafted escalations, weekly recovery reports, and priority scoring for SaaS that has found its footing.",
    aiEscalations: "20/mo",
    weeklySummary: true,
    priorityScoring: true,
    highValueAlerts: false,
    recoveryInsights: false,
    teamMembers: "1",
    customIntegrations: false,
    prioritySla: false,
    featured: true,
  },
  {
    name: "Growth",
    price: 149,
    mrr: "$20k-$80k MRR",
    tagline: "Protect every dollar, at scale.",
    description:
      "Unlimited escalations, high-value alerts, and team access because important accounts need a human fallback.",
    aiEscalations: "Unlimited",
    badge: undefined,
    weeklySummary: true,
    priorityScoring: true,
    highValueAlerts: true,
    recoveryInsights: true,
    teamMembers: "Unlimited",
    customIntegrations: false,
    prioritySla: false,
    featured: false,
  },
  {
    name: "Scale",
    price: 399,
    mrr: "Unlimited MRR",
    tagline: "Enterprise-grade recovery.",
    description:
      "Custom integrations, priority SLA, and unlimited everything for SaaS at serious scale.",
    aiEscalations: "Unlimited",
    badge: undefined,
    weeklySummary: true,
    priorityScoring: true,
    highValueAlerts: true,
    recoveryInsights: true,
    teamMembers: "Unlimited",
    customIntegrations: true,
    prioritySla: true,
    featured: false,
  },
] as const;

const USAGE_ROWS = [
  {
    label: "Failure code sequences",
    values: ["All", "All", "All", "All"],
    included: true,
  },
  {
    label: "Steps per sequence",
    values: ["Unlimited", "Unlimited", "Unlimited", "Unlimited"],
    included: true,
  },
  {
    label: "AI-drafted escalations",
    values: PLANS.map((plan) => plan.aiEscalations),
    included: true,
  },
  {
    label: "Weekly summary",
    values: PLANS.map((plan) => plan.weeklySummary),
  },
  {
    label: "Priority scoring",
    values: PLANS.map((plan) => plan.priorityScoring),
  },
  {
    label: "High-value alerts",
    values: PLANS.map((plan) => plan.highValueAlerts),
  },
  {
    label: "Recovery insights",
    values: PLANS.map((plan) => plan.recoveryInsights),
  },
  {
    label: "Team members",
    values: PLANS.map((plan) => plan.teamMembers),
    included: true,
  },
  {
    label: "Custom integrations",
    values: PLANS.map((plan) => plan.customIntegrations),
  },
  {
    label: "Priority SLA",
    values: PLANS.map((plan) => plan.prioritySla),
  },
] as const;

function UsageValue({ value }: { value: string | boolean }) {
  if (typeof value === "string") {
    return (
      <span className="font-mono text-xs font-semibold text-gray-800">
        {value}
      </span>
    );
  }

  if (value) {
    return (
      <span className="inline-flex size-7 items-center justify-center rounded-full bg-dunlo/12 text-dunlo-deep">
        <Check size={14} />
      </span>
    );
  }

  return (
    <span className="inline-flex size-7 items-center justify-center rounded-full bg-gray-100 text-gray-300">
      <X size={14} />
    </span>
  );
}

export function Pricing() {
  const posthog = usePostHog();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true });

  useEffect(() => {
    if (isInView) {
      posthog.capture("pricing_viewed");
    }
  }, [isInView, posthog]);

  return (
    <FadeIn>
      <section
        ref={sectionRef}
        id="pricing"
        className="overflow-hidden rounded-3xl border border-gray-200/60 bg-white"
      >
        <div className="p-8 md:p-12">
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
            <div>
              <SectionPill>Pricing</SectionPill>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
                Same product for every plan. Usage sets the tier.
              </h2>
            </div>
            <div className="lg:justify-self-end">
              <p className="max-w-2xl text-base leading-7 text-gray-500">
                Every plan includes failure-code precision and AI-drafted
                escalation. Because every customer matters, regardless of your
                MRR.
              </p>
              <div className="mt-4 flex w-fit items-center gap-3 rounded-full border border-dunlo/25 bg-dunlo/8 px-5 py-2.5">
                <span className="size-2 animate-pulse rounded-full bg-dunlo" />
                <p className="text-sm font-medium text-dunlo-deep">
                  Beta: every plan is free until launch.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((plan, i) => (
              <FadeIn key={plan.name} i={i}>
                <div
                  className={`relative flex h-full flex-col rounded-2xl p-5 transition-all hover:-translate-y-0.5 ${
                    plan.featured
                      ? "bg-gray-900 text-white shadow-[0_24px_70px_-38px_rgba(17,24,39,0.65)] ring-1 ring-gray-800"
                      : "border border-gray-100 bg-white shadow-sm hover:shadow-md"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-5">
                      <span className="rounded-full bg-dunlo px-3 py-1 text-[11px] font-bold text-white shadow">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className={plan.badge ? "pt-3" : ""}>
                    <p
                      className={`font-mono text-[11px] font-semibold uppercase tracking-[0.16em] ${
                        plan.featured ? "text-white/50" : "text-gray-400"
                      }`}
                    >
                      {plan.name}
                    </p>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span
                        className={`text-4xl font-bold ${
                          plan.featured ? "text-white" : "text-gray-900"
                        }`}
                      >
                        ${plan.price}
                      </span>
                      <span
                        className={`text-sm ${
                          plan.featured ? "text-white/40" : "text-gray-400"
                        }`}
                      >
                        /mo
                      </span>
                    </div>
                    <p
                      className={`mt-1 text-xs ${
                        plan.featured ? "text-white/40" : "text-gray-400"
                      }`}
                    >
                      {plan.mrr}
                    </p>
                  </div>

                  <div className="mt-5 flex-1">
                    <h3
                      className={`text-base font-bold leading-snug tracking-tight ${
                        plan.featured ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {plan.tagline}
                    </h3>
                    <p
                      className={`mt-2 text-sm leading-6 ${
                        plan.featured ? "text-white/60" : "text-gray-500"
                      }`}
                    >
                      {plan.description}
                    </p>
                  </div>

                  <div
                    className={`mt-6 rounded-2xl border px-4 py-3 ${
                      plan.featured
                        ? "border-white/10 bg-white/5"
                        : "border-gray-100 bg-gray-50"
                    }`}
                  >
                    <p
                      className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
                        plan.featured ? "text-white/40" : "text-gray-400"
                      }`}
                    >
                      AI escalation
                    </p>
                    <p
                      className={`mt-1 font-mono text-lg font-bold ${
                        plan.featured ? "text-dunlo" : "text-gray-900"
                      }`}
                    >
                      {plan.aiEscalations}
                    </p>
                  </div>

                  <Link
                    to="/signup"
                    onClick={() =>
                      posthog.capture("cta_clicked", { location: "pricing" })
                    }
                    className={`mt-5 flex items-center justify-center rounded-full py-2.5 text-sm font-semibold transition-all active:scale-[0.97] ${
                      plan.featured
                        ? "bg-dunlo text-white hover:bg-dunlo-hover"
                        : "border border-gray-200 text-gray-900 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    See your benchmark free
                  </Link>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 bg-gray-50/65 px-4 py-6 md:px-8 md:py-8">
          <div className="overflow-hidden rounded-[1.5rem] border border-gray-200 bg-white">
            <div className="grid grid-cols-[1.3fr_repeat(4,minmax(92px,1fr))] border-b border-gray-100 bg-white">
              <div className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                Usage
              </div>
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className="px-3 py-4 text-center text-xs font-bold text-gray-900"
                >
                  {plan.name}
                </div>
              ))}
            </div>

            <div className="divide-y divide-gray-100 overflow-x-auto">
              {USAGE_ROWS.map((row) => (
                <div
                  key={row.label}
                  className="grid min-w-[660px] grid-cols-[1.3fr_repeat(4,minmax(92px,1fr))] items-center"
                >
                  <div className="px-4 py-3 text-sm font-medium text-gray-700">
                    {row.label}
                  </div>
                  {row.values.map((value, index) => (
                    <div
                      key={`${row.label}-${index}`}
                      className="flex items-center justify-center px-3 py-3"
                    >
                      <UsageValue value={value} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <p className="mt-4 text-center text-sm leading-6 text-gray-500">
            No percentage of recovered revenue. No hidden failure-code limits.
            During beta, choose the tier that matches where your SaaS is headed.
          </p>
        </div>
      </section>
    </FadeIn>
  );
}
