import Link from "next/link";
import { ArrowRight, BadgeCheck, GitCompareArrows } from "lucide-react";
import { SIGNUP_URL } from "@/lib/app-url";
import { Footer } from "@/components/landing/footer";
import { Nav } from "@/components/landing/nav";

type ComparisonRow = {
  label: string;
  first: string;
  second: string;
  takeaway: string;
};

type UseCase = {
  title: string;
  items: string[];
};

type AlternativeLink = {
  label: string;
  href: string;
  body: string;
};

type SourceLink = {
  label: string;
  href: string;
};

export type ComparePageData = {
  slug: string;
  path: string;
  firstName: string;
  secondName: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  headline: string;
  intro: string;
  verdict: string;
  firstSummary: string;
  secondSummary: string;
  rows: ComparisonRow[];
  useCases: UseCase[];
  dunloAngle: string;
  alternativeLinks: AlternativeLink[];
  sourceLinks: SourceLink[];
};

export const COMPARE_PAGES: Record<string, ComparePageData> = {
  "churn-buster-vs-churnkey": {
    slug: "churn-buster-vs-churnkey",
    path: "/compare/churn-buster-vs-churnkey",
    firstName: "Churn Buster",
    secondName: "Churnkey",
    metaTitle: "Churn Buster vs Churnkey - Payment Recovery Comparison",
    metaDescription:
      "Compare Churn Buster and Churnkey for payment recovery, dunning, cancel flows, retries, pricing posture, and the right fit by SaaS stage.",
    keywords: [
      "Churn Buster vs Churnkey",
      "Churnkey vs Churn Buster",
      "Churn Buster Churnkey comparison",
      "payment recovery comparison",
      "dunning software comparison",
    ],
    headline: "Churn Buster vs Churnkey",
    intro:
      "Churn Buster vs Churnkey is a comparison between a dedicated failed-payment recovery product and a broader churn reduction suite. The right choice depends on whether you only need payment recovery or a full retention platform.",
    verdict:
      "Choose Churn Buster when failed-payment recovery is the job and you want a mature dunning workflow. Choose Churnkey when cancellation saves, payment recovery, campaigns, segmentation, and retention testing belong in one platform.",
    firstSummary:
      "Dedicated failed-payment recovery and dunning for subscription businesses, with recovery emails, payment update flows, and reporting.",
    secondSummary:
      "A churn management platform combining cancel flows, payment recovery, precision retries, campaigns, customer timelines, and retention tooling.",
    rows: [
      {
        label: "Core product",
        first:
          "Focused on failed-payment recovery and dunning campaigns for subscription businesses.",
        second:
          "Broader retention platform covering cancellations, payment recovery, campaigns, and reporting.",
        takeaway:
          "Churn Buster is narrower; Churnkey covers more of the churn lifecycle.",
      },
      {
        label: "Payment recovery",
        first:
          "Payment recovery is the main product category and the reason most teams evaluate it.",
        second:
          "Payment recovery is one module inside a wider churn management platform.",
        takeaway:
          "If payment failure is the only problem, the narrower product may be easier to evaluate.",
      },
      {
        label: "Cancellation saves",
        first:
          "Not positioned around adaptive cancel flows as the central workflow.",
        second:
          "Cancel flows, offers, segmentation, and testing are a core part of the platform.",
        takeaway:
          "Choose Churnkey if voluntary cancellation workflows matter as much as payment recovery.",
      },
      {
        label: "Team stage",
        first:
          "Fits teams ready to run a dedicated dunning system.",
        second:
          "Fits teams ready to invest in broader retention infrastructure.",
        takeaway:
          "The decision is less about features and more about how mature your retention motion is.",
      },
      {
        label: "Operational weight",
        first:
          "More focused setup because the recovery surface is narrower.",
        second:
          "More strategic setup because the product touches several churn and retention workflows.",
        takeaway:
          "Broader platforms create more leverage, but also more implementation decisions.",
      },
    ],
    useCases: [
      {
        title: "Choose Churn Buster when",
        items: [
          "Failed-payment recovery is the main problem.",
          "You want a dedicated dunning product rather than a retention suite.",
          "Your team is ready to configure recovery campaigns and payment update flows.",
        ],
      },
      {
        title: "Choose Churnkey when",
        items: [
          "You need cancel flows and payment recovery together.",
          "Retention testing, segmentation, and campaigns are strategic priorities.",
          "You want one platform for both voluntary and involuntary churn motion.",
        ],
      },
    ],
    dunloAngle:
      "If you use Stripe and your immediate problem is failed-payment recovery, Dunlo is the simpler third option: failure-code emails, recovery tracking, and founder escalation without buying a full churn suite.",
    alternativeLinks: [
      {
        label: "Churn Buster alternative",
        href: "/alternatives/churn-buster",
        body: "If you are evaluating Churn Buster against Dunlo specifically, use the alternative page.",
      },
      {
        label: "Churnkey alternative",
        href: "/alternatives/churnkey",
        body: "If you are looking for a lighter Churnkey alternative for Stripe recovery, use this page.",
      },
    ],
    sourceLinks: [
      { label: "Churn Buster", href: "https://churnbuster.io/" },
      { label: "Churnkey", href: "https://churnkey.co/" },
      {
        label: "Churnkey payment recovery docs",
        href: "https://docs.churnkey.co/failed-payment-recovery/payment-recovery",
      },
    ],
  },
  "churn-buster-vs-chargebee": {
    slug: "churn-buster-vs-chargebee",
    path: "/compare/churn-buster-vs-chargebee",
    firstName: "Churn Buster",
    secondName: "Chargebee",
    metaTitle: "Churn Buster vs Chargebee - Dunning and Billing Comparison",
    metaDescription:
      "Compare Churn Buster and Chargebee for dunning, failed payment recovery, billing infrastructure, migration scope, and SaaS payment operations.",
    keywords: [
      "Churn Buster vs Chargebee",
      "Chargebee vs Churn Buster",
      "Chargebee dunning comparison",
      "Churn Buster dunning comparison",
      "billing platform vs dunning software",
    ],
    headline: "Churn Buster vs Chargebee",
    intro:
      "Churn Buster vs Chargebee is really a category decision: a dedicated failed-payment recovery product versus a billing automation platform that includes dunning as part of a larger billing stack.",
    verdict:
      "Choose Churn Buster when you want payment recovery without changing billing infrastructure. Choose Chargebee when you need a full subscription billing platform and dunning is one part of that rollout.",
    firstSummary:
      "A dedicated recovery product for failed payments, dunning campaigns, payment update flows, and subscription recovery reporting.",
    secondSummary:
      "A billing automation platform for subscriptions, usage-based billing, invoicing, tax, revenue workflows, and Smart Dunning.",
    rows: [
      {
        label: "Core product",
        first:
          "Failed-payment recovery and dunning are the center of the product.",
        second:
          "Billing infrastructure is the center; dunning is one capability inside the platform.",
        takeaway:
          "Use the product category that matches the project you are actually taking on.",
      },
      {
        label: "Billing migration",
        first:
          "Generally evaluated as an add-on recovery layer.",
        second:
          "Usually evaluated as a billing platform rollout or migration.",
        takeaway:
          "Chargebee can solve more billing problems, but it is a bigger operational decision.",
      },
      {
        label: "Dunning workflow",
        first:
          "Built around recovery campaigns and failed-payment follow-up.",
        second:
          "Smart Dunning is part of a broader billing and payment operations system.",
        takeaway:
          "Dedicated recovery tooling is simpler when dunning is the only gap.",
      },
      {
        label: "Best fit",
        first:
          "Subscription teams that already have billing in place and want stronger payment recovery.",
        second:
          "Teams that need billing automation, invoicing, tax, revenue workflows, and dunning together.",
        takeaway:
          "This is a scope question before it is a feature question.",
      },
      {
        label: "Implementation",
        first:
          "Recovery-focused configuration around failed payments.",
        second:
          "Billing-platform implementation that can touch products, invoices, taxes, and revenue workflows.",
        takeaway:
          "The bigger platform can be worth it, but only if you need the broader billing stack.",
      },
    ],
    useCases: [
      {
        title: "Choose Churn Buster when",
        items: [
          "Your billing system is already good enough.",
          "The immediate leak is failed-payment recovery.",
          "You want a dedicated dunning product instead of a billing migration.",
        ],
      },
      {
        title: "Choose Chargebee when",
        items: [
          "You need more than dunning: subscriptions, invoicing, tax, or revenue workflows.",
          "Your billing operations have outgrown a simpler Stripe setup.",
          "Dunning should live inside a broader billing platform.",
        ],
      },
    ],
    dunloAngle:
      "If you are already on Stripe and do not want either a mature dunning suite or a billing-platform migration, Dunlo is the focused path for failed-payment recovery.",
    alternativeLinks: [
      {
        label: "Churn Buster alternative",
        href: "/alternatives/churn-buster",
        body: "Use this when the search intent is specifically replacing Churn Buster.",
      },
      {
        label: "Chargebee alternative",
        href: "/alternatives/chargebee",
        body: "Use this when the decision is Chargebee versus staying on Stripe with a recovery add-on.",
      },
    ],
    sourceLinks: [
      { label: "Churn Buster", href: "https://churnbuster.io/" },
      { label: "Chargebee pricing", href: "https://www.chargebee.com/pricing/" },
      {
        label: "Chargebee dunning docs",
        href: "https://www.chargebee.com/docs/payments/2.0/dunning.html",
      },
    ],
  },
  "chargebee-vs-stripe": {
    slug: "chargebee-vs-stripe",
    path: "/compare/chargebee-vs-stripe",
    firstName: "Chargebee",
    secondName: "Stripe",
    metaTitle: "Chargebee vs Stripe - Billing and Dunning Comparison",
    metaDescription:
      "Compare Chargebee and Stripe for subscription billing, revenue recovery, dunning, migration scope, and when a Stripe recovery layer is enough.",
    keywords: [
      "Chargebee vs Stripe",
      "Stripe vs Chargebee",
      "Chargebee Stripe comparison",
      "Stripe Billing vs Chargebee",
      "Chargebee dunning vs Stripe",
    ],
    headline: "Chargebee vs Stripe",
    intro:
      "Chargebee vs Stripe is a billing-stack comparison. Stripe is the payment and billing foundation many SaaS teams start with; Chargebee adds a broader subscription billing operations layer for teams that need more workflow depth.",
    verdict:
      "Choose Stripe when you want to keep billing close to the payment processor and your subscription model is still manageable. Choose Chargebee when billing operations, invoicing, tax, usage workflows, and revenue processes need a dedicated platform.",
    firstSummary:
      "A subscription billing automation platform with hosted payments, usage-based billing, invoicing, taxes, revenue workflows, and Smart Dunning.",
    secondSummary:
      "A payments and billing platform with Stripe Billing, Smart Retries, hosted payment updates, customer emails, and revenue recovery controls.",
    rows: [
      {
        label: "Core product",
        first:
          "Subscription billing operations platform for teams with complex revenue workflows.",
        second:
          "Payments and billing infrastructure with native recovery settings.",
        takeaway:
          "Stripe is the foundation; Chargebee is a broader billing operations layer.",
      },
      {
        label: "Revenue recovery",
        first:
          "Smart Dunning is part of the broader billing product set.",
        second:
          "Stripe includes Smart Retries, customer emails, hosted payment updates, and recovery analytics.",
        takeaway:
          "Both can support recovery, but neither is only a founder-facing recovery workflow.",
      },
      {
        label: "Migration scope",
        first:
          "Adopting Chargebee is a platform decision that can affect billing operations.",
        second:
          "Staying on Stripe avoids a billing-platform migration.",
        takeaway:
          "Do not migrate billing just to solve a small failed-payment leak.",
      },
      {
        label: "Best fit",
        first:
          "Teams with subscription complexity, billing operations, tax, invoicing, and revenue workflow needs.",
        second:
          "Teams that want a direct Stripe-native billing stack and lighter operations.",
        takeaway:
          "The right answer changes as billing complexity grows.",
      },
      {
        label: "Dunning depth",
        first:
          "Dunning sits inside a broader billing automation environment.",
        second:
          "Revenue recovery settings sit inside Stripe Billing.",
        takeaway:
          "If you need recovery emails, tracking, and human escalation around Stripe, add a recovery layer rather than replacing billing.",
      },
    ],
    useCases: [
      {
        title: "Choose Chargebee when",
        items: [
          "Billing operations are becoming a dedicated function.",
          "You need workflows around invoices, usage billing, tax, or revenue processes.",
          "Your team is ready for a billing-platform rollout.",
        ],
      },
      {
        title: "Choose Stripe when",
        items: [
          "Your subscription billing model is still simple enough.",
          "You want to keep billing close to payment processing.",
          "Native Smart Retries and customer emails are enough for now.",
        ],
      },
    ],
    dunloAngle:
      "For Stripe-first SaaS teams, Dunlo sits between these choices: keep Stripe as the billing source of truth, then add a focused failed-payment recovery workflow around it.",
    alternativeLinks: [
      {
        label: "Chargebee alternative for Stripe teams",
        href: "/alternatives/chargebee",
        body: "Use this when the intent is avoiding a Chargebee migration for Stripe failed-payment recovery.",
      },
      {
        label: "Stripe Smart Retries alternative",
        href: "/stripe-smart-retries-alternative",
        body: "Use this when the question is not Chargebee, but what Stripe Smart Retries does not cover.",
      },
    ],
    sourceLinks: [
      { label: "Chargebee pricing", href: "https://www.chargebee.com/pricing/" },
      {
        label: "Chargebee dunning docs",
        href: "https://www.chargebee.com/docs/payments/2.0/dunning.html",
      },
      {
        label: "Stripe revenue recovery",
        href: "https://docs.stripe.com/billing/revenue-recovery",
      },
      {
        label: "Stripe Smart Retries",
        href: "https://docs.stripe.com/billing/revenue-recovery/smart-retries",
      },
    ],
  },
};

export const COMPARE_ROUTE_PAGES = Object.values(COMPARE_PAGES);

export function ComparePage({ page }: { page: ComparePageData }) {
  return (
    <div className="min-h-dvh overflow-hidden bg-stone-100 font-sans text-gray-950">
      <Nav />
      <main className="mx-auto max-w-6xl px-4 pb-14 pt-28 md:px-6 md:pt-36">
        <section className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[1.06fr_0.94fr]">
            <div className="px-6 py-10 md:px-10 md:py-14 lg:px-14">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-sm font-semibold text-gray-600">
                <GitCompareArrows size={15} className="text-dunlo-deep" />
                Competitor comparison
              </div>
              <h1 className="max-w-3xl text-4xl font-bold leading-[1.04] tracking-tight md:text-6xl">
                {page.headline}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-gray-600 md:text-lg">
                {page.intro}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#comparison"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-gray-950 px-6 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
                >
                  Compare details
                </a>
                <Link
                  href={SIGNUP_URL}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-gray-200 px-6 text-sm font-semibold text-gray-900 transition-colors hover:border-gray-300 hover:bg-gray-50"
                >
                  Start with Dunlo
                </Link>
              </div>
            </div>

            <aside className="border-t border-gray-200 bg-gray-50 px-6 py-8 md:px-10 lg:border-l lg:border-t-0 lg:px-12 lg:py-14">
              <div className="space-y-7">
                <SummaryBlock label={page.firstName} text={page.firstSummary} />
                <SummaryBlock
                  label={page.secondName}
                  text={page.secondSummary}
                />
              </div>
            </aside>
          </div>
        </section>

        <section className="mt-4 rounded-[2rem] border border-gray-200 bg-gray-950 px-6 py-8 text-white md:px-10">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-dunlo">
            TL;DR
          </p>
          <p className="mt-4 max-w-4xl text-xl font-semibold leading-8 md:text-2xl md:leading-9">
            {page.verdict}
          </p>
        </section>

        <section
          id="comparison"
          className="mt-4 rounded-[2rem] border border-gray-200 bg-white px-4 py-6 md:px-8 md:py-8"
        >
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                Side-by-side
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
                What changes in practice
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-gray-500">
              This page targets the neutral {page.firstName} vs {page.secondName}{" "}
              search intent. Dunlo appears as a third option only where the
              Stripe recovery use case is narrower.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="w-[18%] py-4 pr-5 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                    Criteria
                  </th>
                  <th className="w-[28%] px-5 py-4 text-sm font-semibold text-gray-950">
                    {page.firstName}
                  </th>
                  <th className="w-[28%] px-5 py-4 text-sm font-semibold text-gray-950">
                    {page.secondName}
                  </th>
                  <th className="w-[26%] px-5 py-4 text-sm font-semibold text-gray-950">
                    Bottom line
                  </th>
                </tr>
              </thead>
              <tbody>
                {page.rows.map((row) => (
                  <tr key={row.label} className="border-b border-gray-100">
                    <th className="py-5 pr-5 align-top text-sm font-semibold text-gray-950">
                      {row.label}
                    </th>
                    <td className="px-5 py-5 align-top text-sm leading-6 text-gray-600">
                      {row.first}
                    </td>
                    <td className="px-5 py-5 align-top text-sm leading-6 text-gray-600">
                      {row.second}
                    </td>
                    <td className="px-5 py-5 align-top text-sm font-medium leading-6 text-gray-800">
                      {row.takeaway}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-4 grid gap-4 md:grid-cols-2">
          {page.useCases.map((section) => (
            <article
              key={section.title}
              className="rounded-[2rem] border border-gray-200 bg-white px-6 py-7 md:px-8"
            >
              <h2 className="text-xl font-bold tracking-tight">
                {section.title}
              </h2>
              <ul className="mt-6 space-y-4">
                {section.items.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-sm leading-6 text-gray-600"
                  >
                    <BadgeCheck
                      size={17}
                      className="mt-0.5 shrink-0 text-dunlo-deep"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="mt-4 rounded-[2rem] border border-dunlo/20 bg-dunlo/10 px-6 py-8 md:px-10">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-dunlo-deep">
            Third option
          </p>
          <h2 className="mt-3 max-w-3xl text-2xl font-bold tracking-tight md:text-3xl">
            Where Dunlo fits
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-700 md:text-base">
            {page.dunloAngle}
          </p>
          <Link
            href={SIGNUP_URL}
            className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gray-950 px-6 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
          >
            Start free
            <ArrowRight size={15} />
          </Link>
        </section>

        <section className="mt-4 rounded-[2rem] border border-gray-200 bg-white px-6 py-7 md:px-8">
          <h2 className="text-xl font-bold tracking-tight">
            Looking for an alternative instead?
          </h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {page.alternativeLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group rounded-2xl border border-gray-200 bg-gray-50 p-5 transition-colors hover:border-dunlo/30 hover:bg-white"
              >
                <p className="text-sm font-bold text-gray-950">{link.label}</p>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {link.body}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-dunlo-deep transition-all group-hover:gap-3">
                  Read alternative
                  <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-4 rounded-[2rem] border border-gray-200 bg-white px-6 py-6 md:px-8">
          <h2 className="text-base font-semibold text-gray-950">Sources</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {page.sourceLinks.map((source) => (
              <a
                key={source.href}
                href={source.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
              >
                {source.label}
              </a>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function SummaryBlock({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
        {label}
      </p>
      <p className="mt-3 text-lg font-semibold leading-7 text-gray-950">
        {text}
      </p>
    </div>
  );
}
