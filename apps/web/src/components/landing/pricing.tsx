import { Link } from "@tanstack/react-router";
import { useInView } from "framer-motion";
import { Check } from "lucide-react";
import { useEffect, useRef } from "react";
import { usePostHog } from "posthog-js/react";
import { FadeIn, SectionPill } from "./shared";

const PLANS = [
  {
    name: "Solo",
    price: 19,
    mrr: "< €5k MRR",
    features: [
      "1 email sequence",
      "Up to €5k MRR",
      "Basic dashboard",
      "Email support",
    ],
    featured: false,
  },
  {
    name: "Starter",
    price: 49,
    mrr: "€5k–€20k MRR",
    features: [
      "2 email sequences",
      "Up to €20k MRR",
      "Priority scoring",
      "All Solo features",
    ],
    featured: false,
  },
  {
    name: "Growth",
    price: 149,
    mrr: "€20k–€80k MRR",
    badge: "Most popular",
    features: [
      "Unlimited sequences",
      "Up to €80k MRR",
      "Founder escalation drafts",
      "High-value account alerts",
      "Recovery insights",
      "Unlimited team members",
    ],
    featured: true,
  },
  {
    name: "Scale",
    price: 399,
    mrr: "Unlimited MRR",
    features: [
      "All Growth features",
      "Unlimited MRR",
      "Custom integrations",
      "Priority SLA",
    ],
    featured: false,
  },
];

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
        className="overflow-hidden rounded-3xl border border-gray-200/60 bg-white p-8 md:p-12"
      >
        <div className="mb-10 text-center">
          <SectionPill>Pricing</SectionPill>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Simple pricing. No % of MRR.
          </h2>
          <p className="mt-3 text-base text-gray-500">
            All plans free during beta — no billing until launch.
          </p>
        </div>

        <div className="mx-auto mb-8 flex max-w-lg items-center justify-center gap-3 rounded-full border border-dunlo/25 bg-dunlo/8 px-6 py-3">
          <span className="size-2 animate-pulse rounded-full bg-dunlo" />
          <p className="text-sm font-medium text-[#006b38]">
            <strong>Beta:</strong> every plan is currently free — pick your tier
            for when we launch
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan, i) => (
            <FadeIn key={plan.name} i={i}>
              <div
                className={`relative flex h-full flex-col rounded-2xl p-6 transition-shadow hover:shadow-lg ${
                  plan.featured
                    ? "bg-gray-900 text-white shadow-xl ring-1 ring-gray-800"
                    : "border border-gray-100 bg-white shadow-sm"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-dunlo px-3 py-1 text-[11px] font-bold text-white shadow">
                      {plan.badge}
                    </span>
                  </div>
                )}
                <div className={plan.badge ? "mt-2" : ""}>
                  <p
                    className={`text-xs font-semibold uppercase tracking-widest ${plan.featured ? "text-white/50" : "text-gray-400"}`}
                  >
                    {plan.name}
                  </p>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span
                      className={`text-4xl font-bold ${plan.featured ? "text-white" : "text-gray-900"}`}
                    >
                      €{plan.price}
                    </span>
                    <span
                      className={`text-sm ${plan.featured ? "text-white/40" : "text-gray-400"}`}
                    >
                      /mo
                    </span>
                  </div>
                  <p
                    className={`mt-1 text-xs ${plan.featured ? "text-white/40" : "text-gray-400"}`}
                  >
                    {plan.mrr}
                  </p>
                </div>

                <ul className="mt-6 flex-1 space-y-2.5">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className={`flex items-start gap-2.5 text-sm ${plan.featured ? "text-white/80" : "text-gray-600"}`}
                    >
                      <Check size={15} className="mt-0.5 shrink-0 text-dunlo" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/login"
                  onClick={() => posthog.capture("cta_clicked", { location: "pricing" })}
                  className={`mt-8 flex items-center justify-center rounded-full py-2.5 text-sm font-semibold transition-all active:scale-[0.97] ${
                    plan.featured
                      ? "bg-dunlo text-white hover:bg-dunlo-hover"
                      : "border border-gray-200 text-gray-900 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Get started free
                </Link>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>
    </FadeIn>
  );
}
