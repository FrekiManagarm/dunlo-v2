import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  CircleDollarSign,
  MailCheck,
  Route,
  ShieldCheck,
} from "lucide-react";
import { Footer } from "@/components/landing/footer";
import { Nav } from "@/components/landing/nav";
import { SubpageBackdrop } from "@/components/marketing/subpage-backdrop";
import { SIGNUP_URL } from "@/lib/app-url";
import {
  SITE_NAME,
  absoluteUrl,
  breadcrumbJsonLd,
  pageSeoMetadata,
} from "@/lib/seo";

const TITLE = "Stripe Failed Payment Recovery Software | Dunlo";
const DESCRIPTION =
  "Recover failed payments with failure-code emails, Stripe-hosted update links, founder escalation, and recovered revenue tracking for SaaS.";
const PATH = "/stripe-failed-payment-recovery-software";
const KEYWORDS = [
  "Stripe failed payment recovery software",
  "failed Stripe payment recovery",
  "recover failed payments",
  "Stripe payment recovery software",
  "SaaS payment recovery software",
  "Stripe dunning software",
] as const;

const WORKFLOW_STEPS = [
  {
    title: "Detect the failure",
    copy: "Dunlo monitors failed Stripe invoices and payment events as soon as the payment breaks.",
    icon: BellRing,
  },
  {
    title: "Match the failure reason",
    copy: "Expired cards, bank blocks, authentication issues, and temporary funds problems each get a different recovery path.",
    icon: Route,
  },
  {
    title: "Send the safest email",
    copy: "Customers get a clear, customer-friendly message with the right Stripe-hosted billing link.",
    icon: MailCheck,
  },
  {
    title: "Track recovered revenue",
    copy: "Founders can see which payments were recovered, which accounts need review, and which revenue is still at risk.",
    icon: CircleDollarSign,
  },
] as const;

const COMPARISON_ROWS = [
  {
    dimension: "Customer messaging",
    stripe: "Generic hosted invoice and retry notifications.",
    diy: "Whatever your team writes and maintains.",
    dunlo: "Failure-code-specific recovery emails built for SaaS customers.",
  },
  {
    dimension: "Retry logic",
    stripe: "Native retry timing inside Stripe Billing.",
    diy: "Custom cron jobs, webhook handlers, and edge cases.",
    dunlo: "Retry guidance tied to the decline reason and customer action.",
  },
  {
    dimension: "Founder escalation",
    stripe: "No customer-specific founder draft.",
    diy: "Manual spreadsheet review.",
    dunlo: "High-value failed accounts are flagged before they quietly churn.",
  },
  {
    dimension: "Recovery reporting",
    stripe: "Billing events and invoice status.",
    diy: "Custom dashboards or exports.",
    dunlo:
      "Recovered revenue, at-risk revenue, and recovery state in one workflow.",
  },
] as const;

const RELATED_LINKS = [
  {
    title: "Stripe failed payments guide",
    href: "/stripe-failed-payments",
    copy: "Understand why payments fail and which failures need customer action.",
  },
  {
    title: "Stripe dunning schedule calculator",
    href: "/stripe-dunning-schedule-calculator",
    copy: "Plan the first email, retry window, escalation, and final notice.",
  },
  {
    title: "Stripe dunning workflow",
    href: "/stripe-dunning",
    copy: "Build the recovery cadence around failed invoices and customer trust.",
  },
  {
    title: "Stripe decline codes",
    href: "/stripe-decline-codes",
    copy: "Map the Stripe failure reason to the safest customer email and retry path.",
  },
  {
    title: "Payment recovery alternatives",
    href: "/alternatives",
    copy: "Compare Dunlo with dunning tools, billing suites, and custom Stripe logic.",
  },
] as const;

const FAQS = [
  {
    question: "What is Stripe failed payment recovery software?",
    answer:
      "Stripe failed payment recovery software helps SaaS teams recover failed Stripe invoices by detecting failed payments, sending customer emails, timing retries, giving customers secure update links, and tracking recovered revenue.",
  },
  {
    question: "Why use software instead of Stripe retries alone?",
    answer:
      "Stripe retries can help with temporary failures, but many failed payments need customer action. Recovery software adds the customer-facing workflow around Stripe: reason-specific emails, update links, escalation, and reporting.",
  },
  {
    question: "Does Dunlo replace Stripe Billing?",
    answer:
      "No. Dunlo is Stripe-first and sits on top of your existing Stripe Billing setup. Payment method updates still happen through Stripe-hosted flows.",
  },
  {
    question: "Who should use Dunlo?",
    answer:
      "Dunlo is best for Stripe-first SaaS founders and small teams that want a focused payment recovery layer without moving billing platforms or maintaining custom webhook infrastructure.",
  },
] as const;

export const metadata: Metadata = pageSeoMetadata({
  title: TITLE,
  description: DESCRIPTION,
  keywords: KEYWORDS,
  path: PATH,
});

export default function StripeFailedPaymentRecoverySoftwarePage() {
  return (
    <div className="min-h-dvh overflow-hidden bg-dunlo-ground font-sans text-dunlo-ink">
      <Nav />
      <main className="space-y-4 px-3 pb-4 pt-24 md:space-y-5 md:px-4 md:pb-6 md:pt-28">
        <section className="relative -mx-3 overflow-hidden bg-dunlo-ink px-3 text-white md:-mx-4 md:px-4">
          <SubpageBackdrop />
          <div className="relative mx-auto grid min-h-[calc(100dvh-8rem)] max-w-6xl gap-12 py-6 md:grid-cols-[0.9fr_1.1fr] md:items-center md:gap-14 md:py-8">
            <div className="max-w-xl">
              <p className="text-sm font-semibold text-dunlo">
                Stripe payment recovery software
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-dunlo/40 bg-dunlo/12 px-3 py-1.5 text-xs font-bold text-dunlo">
                  <MailCheck size={13} strokeWidth={2.2} />
                  Failure-code emails
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/18 bg-white/6 px-3 py-1.5 text-xs font-bold text-white/72">
                  <ShieldCheck size={13} strokeWidth={2.2} />
                  Stripe-hosted updates
                </span>
              </div>
              <h1 className="mt-8 max-w-xl text-4xl font-bold leading-[0.96] tracking-[-0.04em] text-white sm:text-5xl md:text-6xl">
                Stripe failed payment recovery software for SaaS teams.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-white/68">
                Dunlo turns failed Stripe payments into a complete recovery
                workflow: the right customer email, the right retry moment, a
                secure billing link, and a clear view of recovered revenue.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={SIGNUP_URL}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-dunlo px-6 text-sm font-bold text-dunlo-ink transition-transform duration-300 hover:-translate-y-px hover:bg-dunlo-hover active:scale-[0.98]"
                >
                  Start recovery
                  <ArrowRight size={16} strokeWidth={1.8} />
                </a>
                <Link
                  href="/stripe-dunning-schedule-calculator"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/24 px-6 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-px hover:border-white/60 hover:bg-white/6 active:scale-[0.98]"
                >
                  Plan a dunning schedule
                </Link>
              </div>
            </div>

            <aside className="relative text-dunlo-ink md:pl-10">
              <div className="overflow-hidden rounded-2xl border border-dunlo-line bg-white">
                <div className="border-b border-dunlo-line/60 bg-dunlo-mist px-5 py-4">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-dunlo-ink/46">
                    Recovery queue
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[
                      ["$7.8k", "at risk"],
                      ["41", "failures"],
                      ["12", "saved"],
                    ].map(([value, label]) => (
                      <div
                        key={label}
                        className="rounded-xl border border-dunlo-line bg-white px-3 py-2"
                      >
                        <p className="font-mono text-xl font-bold text-dunlo-ink">
                          {value}
                        </p>
                        <p className="text-[11px] font-medium text-dunlo-ink/46">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-5">
                  {[
                    ["expired_card", "Update-card email sent"],
                    ["authentication_required", "SCA action link ready"],
                    ["do_not_honor", "Founder review suggested"],
                  ].map(([code, action], index) => (
                    <div
                      key={code}
                      className="grid grid-cols-[24px_1fr] gap-3 border-t border-dunlo-line/60 py-4 first:border-t-0 first:pt-0 last:pb-0"
                    >
                      <span
                        className={`mt-1 size-2.5 rounded-full ${
                          index === 0 ? "bg-dunlo" : "bg-gray-300"
                        }`}
                      />
                      <div>
                        <p className="font-mono text-xs font-bold text-dunlo-ink">
                          {code}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-dunlo-ink/68">
                          {action}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl grid-cols-1 gap-5 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="lg:pt-10">
            <p className="text-sm font-semibold text-dunlo-deep">
              Why software
            </p>
            <h2 className="mt-3 max-w-sm text-3xl font-bold tracking-tight md:text-4xl">
              Failed payment recovery is more than retry timing.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-dunlo-ink/68">
              A retry can only attempt the charge again. A recovery workflow
              helps the customer understand what happened and how to fix it.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {WORKFLOW_STEPS.map(({ title, copy, icon: Icon }) => (
              <article
                key={title}
                className="rounded-2xl border border-dunlo-line bg-white p-6"
              >
                <div className="flex size-10 items-center justify-center rounded-xl border border-dunlo/20 bg-dunlo/[0.07]">
                  <Icon size={18} className="text-dunlo-deep" />
                </div>
                <h3 className="mt-5 text-lg font-bold tracking-tight">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-dunlo-ink/68">
                  {copy}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl rounded-2xl border border-dunlo-line bg-white p-6 md:p-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.38fr_0.62fr]">
            <div>
              <p className="text-sm font-semibold text-dunlo-deep">
                Compare approaches
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">
                Stripe retries, custom webhooks, or Dunlo.
              </h2>
              <p className="mt-4 text-sm leading-6 text-dunlo-ink/68">
                Stripe should stay the billing system. Dunlo adds the focused
                recovery layer around the failed payment moment.
              </p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-dunlo-line bg-white">
              <div className="grid grid-cols-[1fr_1fr_1fr_1fr] border-b border-dunlo-line bg-dunlo-mist text-xs font-bold text-dunlo-ink/56">
                <div className="p-3">Need</div>
                <div className="p-3">Stripe only</div>
                <div className="p-3">DIY</div>
                <div className="p-3 text-dunlo-deep">Dunlo</div>
              </div>
              {COMPARISON_ROWS.map((row) => (
                <div
                  key={row.dimension}
                  className="grid grid-cols-1 border-b border-dunlo-line/60 text-sm last:border-b-0 md:grid-cols-[1fr_1fr_1fr_1fr]"
                >
                  <div className="bg-dunlo-mist p-3 font-bold text-dunlo-ink">
                    {row.dimension}
                  </div>
                  <div className="p-3 leading-6 text-dunlo-ink/68">
                    {row.stripe}
                  </div>
                  <div className="p-3 leading-6 text-dunlo-ink/68">
                    {row.diy}
                  </div>
                  <div className="p-3 leading-6 font-semibold text-dunlo-ink">
                    {row.dunlo}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl grid-cols-1 gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-dunlo-line bg-dunlo-ink p-7 text-white md:p-9">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo">
              Best fit
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight">
              Built for Stripe-first SaaS founders.
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                "You use Stripe Billing for subscriptions.",
                "You want recovery without changing billing platforms.",
                "You need customer-friendly recovery emails.",
                "You want fixed pricing, not a recovered-revenue cut.",
              ].map((item) => (
                <div key={item} className="flex gap-3">
                  <BadgeCheck
                    size={17}
                    className="mt-0.5 shrink-0 text-dunlo"
                  />
                  <p className="text-sm leading-6 text-gray-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <FaqSection />
        </section>

        <RelatedLinksSection />

        <section className="mx-auto max-w-6xl rounded-2xl border border-dunlo-ink bg-dunlo-ink p-7 text-white md:p-9 lg:p-10">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo">
            Free during beta
          </p>
          <div className="mt-3 grid grid-cols-1 gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="max-w-2xl text-3xl font-bold tracking-tight">
                Add recovery software without rebuilding billing.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300">
                Connect Stripe, review the recovery emails, and start tracking
                recovered revenue from failed payments.
              </p>
            </div>
            <a
              href={SIGNUP_URL}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-dunlo px-6 text-sm font-bold text-dunlo-ink transition-all duration-300 hover:-translate-y-px hover:bg-dunlo-hover active:scale-[0.98]"
            >
              Connect Stripe
              <ArrowRight size={16} strokeWidth={1.8} />
            </a>
          </div>
        </section>
      </main>
      <Footer />
      <JsonLd />
    </div>
  );
}

function FaqSection() {
  return (
    <section className="rounded-2xl border border-dunlo-line bg-white p-6 md:p-8">
      <h2 className="text-2xl font-bold tracking-tight">
        Recovery software FAQ
      </h2>
      <div className="mt-6 divide-y divide-dunlo-line border-y border-dunlo-line">
        {FAQS.map((faq) => (
          <div key={faq.question} className="py-5">
            <h3 className="text-base font-bold tracking-tight">
              {faq.question}
            </h3>
            <p className="mt-2 text-sm leading-6 text-dunlo-ink/68">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RelatedLinksSection() {
  return (
    <section className="mx-auto max-w-6xl">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {RELATED_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group rounded-2xl border border-dunlo-line bg-white p-6 transition-all duration-300 hover:-translate-y-px hover:border-dunlo/40"
          >
            <p className="text-sm font-semibold text-dunlo-deep">Next</p>
            <h2 className="mt-4 text-xl font-bold tracking-tight text-dunlo-ink">
              {link.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-dunlo-ink/68">
              {link.copy}
            </p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-dunlo-ink transition-colors group-hover:text-dunlo-deep">
              Open page
              <ArrowRight size={15} strokeWidth={1.8} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function JsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Dunlo",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            description: DESCRIPTION,
            url: absoluteUrl(PATH),
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
              description: "Free during beta until July 31, 2026.",
            },
            publisher: {
              "@type": "Organization",
              name: SITE_NAME,
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Stripe failed payment recovery software", path: PATH },
            ]),
          ),
        }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }),
        }}
      />
    </>
  );
}
