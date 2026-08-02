"use client";

import Link from "next/link";
import { SIGNUP_URL } from "@/lib/app-url";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Gauge,
  MailCheck,
  Route as RouteIcon,
  ShieldCheck,
} from "lucide-react";
import {
  ALTERNATIVES,
  type AlternativePageData,
} from "@/components/alternatives/alternative-page";
import { BetaTestimonialsSection } from "@/components/landing/beta-testimonials";
import { Footer } from "@/components/landing/footer";
import { Nav } from "@/components/landing/nav";
import { SubpageBackdrop } from "@/components/marketing/subpage-backdrop";
import { ALTERNATIVE_LINKS } from "@/lib/site-navigation";

const orderedAlternatives = ALTERNATIVE_LINKS.map((link) =>
  Object.values(ALTERNATIVES).find((page) => page.path === link.href),
).filter((page): page is AlternativePageData => Boolean(page));

const spring = { type: "spring" as const, stiffness: 110, damping: 22 };

export function AlternativesIndex() {
  return (
    <div className="min-h-dvh overflow-hidden bg-dunlo-ground font-sans text-dunlo-ink">
      <Nav />
      <main className="mx-auto max-w-6xl px-4 pb-14 pt-28 md:px-6 md:pt-36">
        <section className="relative overflow-hidden rounded-2xl border border-dunlo-line bg-dunlo-ink text-white">
          <SubpageBackdrop />
          <div className="relative grid gap-8 px-5 py-8 md:px-8 md:py-10 lg:grid-cols-[1.04fr_0.96fr] lg:items-end lg:px-10 lg:py-12">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={spring}
            >
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/75">
                <RouteIcon size={15} className="text-dunlo" />
                Stripe recovery alternatives
              </div>
              <h1 className="max-w-3xl text-4xl font-bold leading-none tracking-tight md:text-6xl">
                Find the recovery tool that fits your Stripe leak.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/68 md:text-lg">
                Compare broad churn suites, retry engines, billing platforms,
                and focused failed-payment recovery tools without losing the
                practical question: what should happen after Stripe says a
                payment failed?
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/benchmark"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-dunlo px-6 text-sm font-bold text-dunlo-ink transition-all hover:bg-dunlo-hover active:scale-[0.98]"
                >
                  Estimate my payment leak
                  <ArrowRight size={15} />
                </Link>
                <Link
                  href={SIGNUP_URL}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 bg-white/8 px-6 text-sm font-bold text-white transition-all hover:border-white/30 hover:bg-white/12 active:scale-[0.98]"
                >
                  Start free
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.08 }}
              className="rounded-2xl border border-white/12 bg-white/6 p-5"
            >
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-dunlo">
                Decision shortcut
              </p>
              <div className="mt-5 space-y-4">
                {[
                  [
                    "Need retry timing only?",
                    "Start with Stripe Smart Retries.",
                  ],
                  [
                    "Need a broader churn suite?",
                    "Look at Churnkey or Recurflux.",
                  ],
                  [
                    "Need Stripe failed-payment recovery?",
                    "Dunlo is the focused path.",
                  ],
                ].map(([question, answer], index) => (
                  <div
                    key={question}
                    className="grid grid-cols-[auto_1fr] gap-3 border-t border-white/10 pt-4 first:border-t-0 first:pt-0"
                  >
                    <span className="flex size-8 items-center justify-center rounded-full bg-dunlo/15 font-mono text-xs font-bold text-dunlo">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">{question}</p>
                      <p className="mt-1 text-sm leading-6 text-white/55">
                        {answer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Gauge,
              label: "Stripe-first setup",
              body: "Built around failed charges instead of a general lifecycle suite.",
            },
            {
              icon: MailCheck,
              label: "Failure-code emails",
              body: "Expired cards, low funds, and bank blocks get different recovery paths.",
            },
            {
              icon: ShieldCheck,
              label: "Founder escalation",
              body: "High-value failures can pause before automation sends.",
            },
          ].map(({ icon: Icon, label, body }) => (
            <div
              key={label}
              className="group rounded-2xl border border-dunlo-line bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-dunlo/35"
            >
              <div className="flex items-start justify-between gap-4">
                <Icon size={20} className="text-dunlo-deep" />
                <BadgeCheck
                  size={17}
                  className="text-gray-300 transition-colors group-hover:text-dunlo-deep"
                />
              </div>
              <h2 className="mt-4 text-sm font-bold text-dunlo-ink">{label}</h2>
              <p className="mt-2 text-sm leading-6 text-dunlo-ink/56">{body}</p>
            </div>
          ))}
        </section>

        <section className="mt-6">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold text-dunlo-deep">
                Compare paths
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
                Start with the tool category, then pick the vendor.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-dunlo-ink/56">
              Each guide keeps the comparison practical: fit, setup, pricing,
              recovery workflow, and where Dunlo is intentionally narrower.
              Comparing two other tools instead?{" "}
              <Link
                href="/compare"
                className="font-semibold text-dunlo-deep underline underline-offset-4"
              >
                See head-to-head comparisons
              </Link>
              .
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {orderedAlternatives.map((page, index) => (
              <motion.article
                key={page.slug}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.08 + index * 0.04 }}
                className="group overflow-hidden rounded-2xl border border-dunlo-line bg-white transition-all hover:-translate-y-0.5 hover:border-dunlo/35"
              >
                <div className="border-b border-dunlo-line/60 p-5 md:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-dunlo-ink/46">
                        {page.eyebrow}
                      </p>
                      <h3 className="mt-3 text-2xl font-bold tracking-tight text-dunlo-ink">
                        {page.headline}
                      </h3>
                    </div>
                    <span className="shrink-0 rounded-full border border-dunlo/20 bg-dunlo/10 px-3 py-1 text-xs font-bold text-dunlo-deep">
                      Compare
                    </span>
                  </div>
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-dunlo-ink/68">
                    {page.intro}
                  </p>
                </div>

                <div className="grid gap-0 sm:grid-cols-2">
                  <div className="border-b border-dunlo-line/60 bg-dunlo-mist p-5 sm:border-b-0 sm:border-r">
                    <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-dunlo-ink/46">
                      {page.competitorName}
                    </p>
                    <p className="mt-3 line-clamp-4 text-sm leading-6 text-dunlo-ink/68">
                      {page.competitorSummary}
                    </p>
                  </div>
                  <div className="bg-dunlo/6 p-5">
                    <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-dunlo-deep">
                      Dunlo
                    </p>
                    <p className="mt-3 line-clamp-4 text-sm font-medium leading-6 text-dunlo-ink/76">
                      {page.dunloSummary}
                    </p>
                  </div>
                </div>
                <Link
                  href={page.path}
                  className="flex items-center justify-between px-5 py-4 text-sm font-bold text-dunlo-ink transition-colors hover:text-dunlo-deep md:px-6"
                >
                  <span>Read comparison</span>
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </motion.article>
            ))}
          </div>
        </section>

        <BetaTestimonialsSection compact />
      </main>
      <Footer />
    </div>
  );
}
