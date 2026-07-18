import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  MailCheck,
  ShieldAlert,
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
import {
  STRIPE_DECLINE_CODE_GUIDES,
  STRIPE_DECLINE_CODE_GUIDES_BY_SLUG,
  declineCodePath,
  getRelatedDeclineCodeGuides,
} from "@/lib/stripe-decline-codes";

type StripeDeclineCodeRouteProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return STRIPE_DECLINE_CODE_GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: StripeDeclineCodeRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = STRIPE_DECLINE_CODE_GUIDES_BY_SLUG[slug];
  if (!guide) return {};

  return pageSeoMetadata({
    title: guide.metaTitle,
    description: guide.metaDescription,
    keywords: guide.keywords,
    path: declineCodePath(guide.slug),
  });
}

export default async function StripeDeclineCodeDetailPage({
  params,
}: StripeDeclineCodeRouteProps) {
  const { slug } = await params;
  const guide = STRIPE_DECLINE_CODE_GUIDES_BY_SLUG[slug];
  if (!guide) notFound();

  const relatedGuides = getRelatedDeclineCodeGuides(guide);
  const path = declineCodePath(guide.slug);

  return (
    <div className="min-h-dvh overflow-hidden bg-dunlo-ground font-sans text-dunlo-ink">
      <Nav />
      <main className="space-y-4 px-3 pb-4 pt-24 md:space-y-5 md:px-4 md:pb-6 md:pt-28">
        <section className="relative -mx-3 overflow-hidden bg-dunlo-ink px-3 text-white md:-mx-4 md:px-4">
          <SubpageBackdrop />
          <div className="relative mx-auto grid min-h-[calc(100dvh-8rem)] max-w-6xl gap-12 py-6 md:grid-cols-[0.96fr_1.04fr] md:items-center md:gap-14 md:py-8">
            <div className="max-w-xl">
              <Link
                href="/stripe-decline-codes"
                className="inline-flex items-center gap-2 text-sm font-semibold text-dunlo"
              >
                Stripe decline codes
                <ArrowRight size={13} />
              </Link>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-dunlo/40 bg-dunlo/12 px-3 py-1.5 text-xs font-bold text-dunlo">
                  <MailCheck size={13} strokeWidth={2.2} />
                  Recovery email angle
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/18 bg-white/6 px-3 py-1.5 text-xs font-bold text-white/72">
                  <Clock3 size={13} strokeWidth={2.2} />
                  Retry guidance
                </span>
              </div>
              <h1 className="mt-8 max-w-xl text-4xl font-bold leading-[0.96] tracking-[-0.04em] text-white sm:text-5xl md:text-6xl">
                {guide.title}
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-white/68">
                {guide.openingAnswer ??
                  `${guide.shortDescription} For SaaS subscriptions, the useful question is not just why it failed, but what customer action will recover the invoice.`}
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
                  Plan the retry window
                </Link>
              </div>
            </div>

            <aside className="rounded-2xl border border-dunlo-line bg-white p-5 text-dunlo-ink md:p-6">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-dunlo-ink/46">
                Stripe code
              </p>
              <div className="mt-3 rounded-2xl border border-dunlo-line bg-dunlo-mist p-5">
                <p className="break-all font-mono text-2xl font-bold text-dunlo-ink">
                  {guide.code}
                </p>
                <p className="mt-3 text-sm leading-6 text-dunlo-ink/68">
                  {guide.searchIntent}
                </p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-dunlo/25 bg-dunlo/[0.07] p-4">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-dunlo-deep">
                    First move
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-6">
                    Customer action
                  </p>
                </div>
                <div className="rounded-xl border border-dunlo-line bg-dunlo-mist p-4">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-dunlo-ink/46">
                    Dunlo
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-6">
                    Email + retry path
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[1.12fr_0.88fr]">
          <article className="rounded-2xl border border-dunlo-line bg-white p-6 md:p-8">
            <p className="text-sm font-semibold text-dunlo-deep">
              Recovery guidance
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              What to do when Stripe returns {guide.code}
            </h2>

            <div className="mt-7 grid gap-4">
              {[
                ["What it means for the customer", guide.customerMeaning],
                ["First recovery move", guide.firstMove],
                ["Retry timing", guide.retryTiming],
                ["Email angle", guide.emailAngle],
                ["What to avoid", guide.avoid],
              ].map(([title, copy]) => (
                <section
                  key={title}
                  className="rounded-2xl border border-dunlo-line bg-white p-5"
                >
                  <h3 className="text-base font-bold tracking-tight">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-dunlo-ink/68">
                    {copy}
                  </p>
                </section>
              ))}
            </div>
          </article>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-dunlo-line bg-dunlo-ink p-6 text-white md:p-7">
              <BadgeCheck size={22} className="text-dunlo" />
              <h2 className="mt-5 text-2xl font-semibold tracking-tight">
                Dunlo workflow
              </h2>
              <ol className="mt-5 space-y-3">
                {guide.dunloWorkflow.map((step, index) => (
                  <li
                    key={step}
                    className="grid grid-cols-[28px_1fr] gap-3 text-sm leading-6 text-gray-200"
                  >
                    <span className="flex size-7 items-center justify-center rounded-full bg-dunlo text-xs font-bold text-dunlo-ink">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl border border-dunlo-line bg-white p-6 md:p-7">
              <ShieldAlert size={22} className="text-dunlo-deep" />
              <h2 className="mt-5 text-2xl font-semibold tracking-tight">
                Why the code matters
              </h2>
              <p className="mt-3 text-sm leading-6 text-dunlo-ink/68">
                Stripe decline codes are more specific than a generic failed
                payment event. They help you separate timing problems from
                customer-action problems, which is where SaaS dunning workflows
                either recover revenue or quietly lose the account.
              </p>
              <a
                href="https://docs.stripe.com/declines/codes"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-dunlo-deep"
              >
                Stripe decline code docs
                <ArrowRight size={15} />
              </a>
            </div>
          </aside>
        </section>

        <section className="mx-auto max-w-6xl rounded-2xl border border-dunlo-line bg-white p-6 md:p-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-dunlo-deep">
              Related decline codes
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Compare nearby failure reasons before choosing a sequence.
            </h2>
          </div>
          <div className="mt-7 grid gap-3 md:grid-cols-3">
            {relatedGuides.map((related) => (
              <Link
                key={related.slug}
                href={declineCodePath(related.slug)}
                className="group rounded-2xl border border-dunlo-line bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-dunlo/40"
              >
                <p className="font-mono text-xs font-bold text-dunlo-deep">
                  {related.code}
                </p>
                <h3 className="mt-2 text-base font-bold tracking-tight">
                  {related.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-dunlo-ink/68">
                  {related.shortDescription}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-dunlo-ink">
                  Read guide
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
          {[
            {
              title: "Stripe failed payments",
              copy: "Understand the recovery workflow around failed Stripe invoices.",
              href: "/stripe-failed-payments",
            },
            {
              title: "Stripe dunning",
              copy: "Build the cadence for emails, retries, and escalation.",
              href: "/stripe-dunning",
            },
            {
              title: "Recovery software",
              copy: "See how Dunlo turns failure context into recovered revenue.",
              href: "/stripe-failed-payment-recovery-software",
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-dunlo-line bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-dunlo/40"
            >
              <h2 className="text-lg font-bold tracking-tight">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-dunlo-ink/68">
                {item.copy}
              </p>
            </Link>
          ))}
        </section>
      </main>
      <Footer />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: guide.metaTitle,
            description: guide.metaDescription,
            url: absoluteUrl(path),
            datePublished: "2026-07-03",
            dateModified: guide.dateModified ?? "2026-07-03",
            author: {
              "@type": "Person",
              name: "Mathieu Chambaud",
              url: "https://x.com/mathchambaud",
            },
            publisher: {
              "@type": "Organization",
              name: SITE_NAME,
              url: absoluteUrl("/"),
            },
            about: [
              guide.code,
              "Stripe decline codes",
              "failed payment recovery",
            ],
            mainEntityOfPage: absoluteUrl(path),
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
              { name: "Stripe decline codes", path: "/stripe-decline-codes" },
              { name: guide.code, path },
            ]),
          ),
        }}
      />
    </div>
  );
}
