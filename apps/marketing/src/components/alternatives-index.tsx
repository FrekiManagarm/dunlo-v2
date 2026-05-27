"use client";

import Link from "next/link";
import { SIGNUP_URL } from "@/lib/app-url";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Gauge,
  MailCheck,
  Route as RouteIcon,
  Sparkles,
} from "lucide-react";
import {
  ALTERNATIVES,
  type AlternativePageData,
} from "@/components/alternatives/alternative-page";
import { Footer } from "@/components/landing/footer";
import { Nav } from "@/components/landing/nav";
import { ALTERNATIVE_LINKS } from "@/lib/site-navigation";

const orderedAlternatives = ALTERNATIVE_LINKS.map((link) =>
  Object.values(ALTERNATIVES).find((page) => page.path === link.href),
).filter((page): page is AlternativePageData => Boolean(page));

const spring = { type: "spring" as const, stiffness: 110, damping: 22 };

export function AlternativesIndex() {
  return (
    <div className="min-h-dvh bg-stone-100 font-sans text-gray-950">
      <Nav />
      <main className="mx-auto max-w-6xl px-4 pb-14 pt-28 md:px-6 md:pt-36">
        <section className="grid gap-8 lg:grid-cols-[1fr_0.82fr] lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-semibold text-gray-600 shadow-sm">
              <RouteIcon size={15} className="text-dunlo-deep" />
              Alternative guides
            </div>
            <h1 className="max-w-3xl text-4xl font-bold leading-none tracking-tight text-gray-950 md:text-6xl">
              Pick the recovery layer that fits your Stripe stage.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg">
              Dunlo is intentionally narrower than broad churn suites: Stripe
              failure-code emails, practical recovery timing, and founder
              escalation for accounts worth saving.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.08 }}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-dunlo/10 text-dunlo-deep">
                <Sparkles size={18} />
              </span>
              <div>
                <p className="text-sm font-bold text-gray-950">
                  Use Dunlo when failed payments are the leak.
                </p>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Use broader platforms when you need cancellation saves,
                  multi-gateway orchestration, or enterprise billing ops.
                </p>
              </div>
            </div>
            <Link
              href={SIGNUP_URL}
              className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gray-950 px-5 text-sm font-bold text-white transition-all hover:bg-gray-800 active:scale-[0.98]"
            >
              Start free
              <ArrowRight size={15} />
            </Link>
          </motion.div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Gauge,
              label: "Stripe-first setup",
              body: "Built around Stripe failed charges instead of a general lifecycle suite.",
            },
            {
              icon: MailCheck,
              label: "Failure-code emails",
              body: "Different message for expired cards, insufficient funds, and bank blocks.",
            },
            {
              icon: Sparkles,
              label: "Founder escalation",
              body: "High-value failures can become a personal founder email draft.",
            },
          ].map(({ icon: Icon, label, body }) => (
            <div
              key={label}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <Icon size={19} className="text-dunlo-deep" />
              <h2 className="mt-4 text-sm font-bold text-gray-950">{label}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">{body}</p>
            </div>
          ))}
        </section>

        <section className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {orderedAlternatives.map((page, index) => (
              <motion.article
                key={page.slug}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.08 + index * 0.04 }}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-dunlo/30 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                      {page.eyebrow}
                    </p>
                    <h2 className="mt-3 text-2xl font-bold tracking-tight text-gray-950">
                      {page.headline}
                    </h2>
                  </div>
                  <span className="rounded-full bg-dunlo/10 px-3 py-1 text-xs font-bold text-dunlo-deep">
                    Compare
                  </span>
                </div>
                <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-600">
                  {page.intro}
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <p className="text-xs font-bold text-gray-950">
                      {page.competitorName}
                    </p>
                    <p className="mt-1 line-clamp-3 text-xs leading-5 text-gray-500">
                      {page.competitorSummary}
                    </p>
                  </div>
                  <div className="rounded-xl border border-dunlo/20 bg-dunlo/10 p-3">
                    <p className="text-xs font-bold text-dunlo-deep">Dunlo</p>
                    <p className="mt-1 line-clamp-3 text-xs leading-5 text-gray-600">
                      {page.dunloSummary}
                    </p>
                  </div>
                </div>
                <Link
                  href={page.path}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-dunlo-deep transition-all hover:gap-3"
                >
                  Read comparison
                  <ArrowRight size={14} />
                </Link>
              </motion.article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
