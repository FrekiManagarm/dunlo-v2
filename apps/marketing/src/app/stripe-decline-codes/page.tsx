import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Clock3,
  MailCheck,
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
import {
  STRIPE_DECLINE_CODE_GUIDES,
  declineCodePath,
} from "@/lib/stripe-decline-codes";

const TITLE = "Stripe Decline Codes: SaaS Recovery Guide | Dunlo";
const DESCRIPTION =
  "Decode common Stripe decline codes and choose the right failed-payment email, retry timing, and customer recovery path for SaaS subscriptions.";
const PATH = "/stripe-decline-codes";
const KEYWORDS = [
  "Stripe decline codes",
  "Stripe card decline codes",
  "Stripe failed payment codes",
  "Stripe dunning decline codes",
  "Stripe payment recovery",
  "SaaS failed payment recovery",
] as const;

const FAQS = [
  {
    question: "What are Stripe decline codes?",
    answer:
      "Stripe decline codes are reason signals that explain why a card issuer or payment provider declined a payment. SaaS teams can use them to decide whether the customer needs a new card, authentication, issuer approval, or a later retry.",
  },
  {
    question: "Should every Stripe decline code get the same dunning email?",
    answer:
      "No. An expired card needs a card-update message, insufficient funds needs timing-sensitive follow-up, and authentication_required needs a customer authentication path. The decline reason should shape the recovery copy.",
  },
  {
    question: "Can Stripe automatically retry every failed payment?",
    answer:
      "No. Some Stripe Billing failures are hard declines where collection needs customer action or a new payment method. Retry-only dunning can waste time when the actual fix is a card update or bank approval.",
  },
  {
    question: "How does Dunlo use Stripe decline codes?",
    answer:
      "Dunlo reads the failure context, sends failure-code-specific recovery emails, routes customers to Stripe-hosted payment update flows, and flags valuable accounts for founder review.",
  },
] as const;

export const metadata: Metadata = pageSeoMetadata({
  title: TITLE,
  description: DESCRIPTION,
  keywords: KEYWORDS,
  path: PATH,
});

export default function StripeDeclineCodesPage() {
  return (
    <div className="min-h-dvh overflow-hidden bg-dunlo-ground font-sans text-dunlo-ink">
      <Nav />
      <main className="space-y-4 px-3 pb-4 pt-24 md:space-y-5 md:px-4 md:pb-6 md:pt-28">
        <section className="relative -mx-3 overflow-hidden bg-dunlo-ink px-3 text-white md:-mx-4 md:px-4">
          <SubpageBackdrop />
          <div className="relative mx-auto grid min-h-[calc(100dvh-8rem)] max-w-6xl gap-12 py-6 md:grid-cols-[0.95fr_1.05fr] md:items-center md:gap-14 md:py-8">
            <div className="max-w-xl">
              <p className="text-sm font-semibold text-dunlo">
                Stripe decline codes
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-dunlo/40 bg-dunlo/12 px-3 py-1.5 text-xs font-bold text-dunlo">
                  <MailCheck size={13} strokeWidth={2.2} />
                  Failure-aware emails
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/18 bg-white/6 px-3 py-1.5 text-xs font-bold text-white/72">
                  <Clock3 size={13} strokeWidth={2.2} />
                  Retry timing by reason
                </span>
              </div>
              <h1 className="mt-8 max-w-xl text-4xl font-bold leading-[0.96] tracking-[-0.04em] text-white sm:text-5xl md:text-6xl">
                Turn Stripe decline codes into the right recovery action.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-white/68">
                A failed payment is not one problem. Each decline code tells you
                whether to ask for a new card, wait for a better retry window,
                send an authentication link, or escalate a valuable customer.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={SIGNUP_URL}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-dunlo px-6 text-sm font-bold text-dunlo-ink transition-transform duration-300 hover:-translate-y-px hover:bg-dunlo-hover active:scale-[0.98]"
                >
                  Recover failed payments
                  <ArrowRight size={16} strokeWidth={1.8} />
                </a>
                <Link
                  href="/stripe-dunning-schedule-calculator"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/24 px-6 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-px hover:border-white/60 hover:bg-white/6 active:scale-[0.98]"
                >
                  Calculate a schedule
                </Link>
              </div>
            </div>

            <aside className="rounded-2xl border border-dunlo-line bg-white p-5 text-dunlo-ink md:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-dunlo-ink/46">
                    Recovery map
                  </p>
                  <h2 className="mt-1 text-lg font-bold tracking-tight">
                    Common Stripe declines
                  </h2>
                </div>
                <span className="rounded-full border border-dunlo/25 bg-dunlo/10 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-dunlo-deep">
                  {STRIPE_DECLINE_CODE_GUIDES.length} guides
                </span>
              </div>
              <div className="mt-5 space-y-2">
                {STRIPE_DECLINE_CODE_GUIDES.slice(0, 5).map((guide) => (
                  <Link
                    key={guide.slug}
                    href={declineCodePath(guide.slug)}
                    className="group grid grid-cols-[1fr_auto] gap-4 rounded-xl border border-dunlo-line bg-dunlo-mist px-4 py-3 transition-all duration-300 hover:-translate-y-px hover:border-dunlo/40 hover:bg-dunlo/[0.06]"
                  >
                    <span>
                      <span className="block font-mono text-xs font-bold text-dunlo-ink">
                        {guide.code}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-dunlo-ink/56">
                        {guide.shortDescription}
                      </span>
                    </span>
                    <ArrowRight
                      size={16}
                      className="mt-1 text-gray-300 transition-colors group-hover:text-dunlo-deep"
                    />
                  </Link>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section className="mx-auto max-w-6xl rounded-2xl border border-dunlo-line bg-white p-6 md:p-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-dunlo-deep">
              Code-by-code guides
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Match each failure reason to a customer-safe recovery path.
            </h2>
          </div>
          <div className="mt-7 grid gap-3 md:grid-cols-2">
            {STRIPE_DECLINE_CODE_GUIDES.map((guide) => (
              <Link
                key={guide.slug}
                href={declineCodePath(guide.slug)}
                className="group rounded-2xl border border-dunlo-line bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-dunlo/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-xs font-bold text-dunlo-deep">
                      {guide.code}
                    </p>
                    <h3 className="mt-2 text-lg font-bold tracking-tight text-dunlo-ink">
                      {guide.title}
                    </h3>
                  </div>
                  <ArrowRight
                    size={18}
                    className="text-gray-300 transition-colors group-hover:text-dunlo-deep"
                  />
                </div>
                <p className="mt-3 text-sm leading-6 text-dunlo-ink/68">
                  {guide.shortDescription}
                </p>
                <p className="mt-4 border-t border-dunlo-line pt-4 text-sm leading-6 text-dunlo-ink/76">
                  {guide.firstMove}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
          {[
            {
              icon: BookOpen,
              title: "Read the Stripe reason",
              copy: "Use the decline code as the first clue before deciding whether the payment needs a retry, a new method, or authentication.",
            },
            {
              icon: MailCheck,
              title: "Send the precise email",
              copy: "Tell the customer the useful part: what happened, what action fixes it, and where to update payment safely.",
            },
            {
              icon: ShieldCheck,
              title: "Escalate valuable accounts",
              copy: "High-MRR failures deserve human review before automation makes the relationship feel disposable.",
            },
          ].map(({ icon: Icon, title, copy }) => (
            <div
              key={title}
              className="rounded-2xl border border-dunlo-line bg-white p-5"
            >
              <Icon size={20} className="text-dunlo-deep" />
              <h2 className="mt-4 text-lg font-bold tracking-tight">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-dunlo-ink/68">{copy}</p>
            </div>
          ))}
        </section>

        <section className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="rounded-2xl border border-dunlo-line bg-dunlo-ink p-6 text-white md:p-8">
            <BadgeCheck size={22} className="text-dunlo" />
            <h2 className="mt-5 text-2xl font-semibold tracking-tight">
              Built from Stripe failure context.
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-300">
              Stripe documents decline codes for why a card payment failed and
              also notes that some Billing retries need customer action or a new
              payment method. Dunlo turns that signal into the recovery email,
              retry window, and escalation path.
            </p>
            <a
              href="https://docs.stripe.com/declines/codes"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-dunlo"
            >
              Stripe decline code docs
              <ArrowRight size={15} />
            </a>
          </div>

          <div className="rounded-2xl border border-dunlo-line bg-white p-6 md:p-8">
            <h2 className="text-2xl font-semibold tracking-tight">
              Stripe decline code FAQ
            </h2>
            <div className="mt-5 divide-y divide-dunlo-line">
              {FAQS.map((faq) => (
                <div key={faq.question} className="py-4 first:pt-0 last:pb-0">
                  <h3 className="text-base font-bold text-dunlo-ink">
                    {faq.question}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-dunlo-ink/68">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: TITLE,
            description: DESCRIPTION,
            url: absoluteUrl(PATH),
            publisher: {
              "@type": "Organization",
              name: SITE_NAME,
              url: absoluteUrl("/"),
            },
            mainEntity: {
              "@type": "ItemList",
              itemListElement: STRIPE_DECLINE_CODE_GUIDES.map(
                (guide, index) => ({
                  "@type": "ListItem",
                  position: index + 1,
                  name: guide.code,
                  url: absoluteUrl(declineCodePath(guide.slug)),
                }),
              ),
            },
          }),
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
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Stripe decline codes", path: PATH },
            ]),
          ),
        }}
      />
    </div>
  );
}
