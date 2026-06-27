import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  MailCheck,
  ShieldCheck,
} from "lucide-react";
import { Footer } from "@/components/landing/footer";
import { Nav } from "@/components/landing/nav";
import { SIGNUP_URL } from "@/lib/app-url";
import {
  SITE_NAME,
  absoluteUrl,
  breadcrumbJsonLd,
  pageSeoMetadata,
} from "@/lib/seo";

const TITLE = "Stripe Failed Payment Email Templates for SaaS | Dunlo";
const DESCRIPTION =
  "Copy Stripe failed payment email templates for expired cards, insufficient funds, do_not_honor, authentication_required, and SaaS dunning follow-up.";
const KEYWORDS = [
  "Stripe failed payment email templates",
  "failed payment email template",
  "Stripe dunning email template",
  "SaaS dunning email examples",
  "card declined email template",
  "payment failed email copy",
  "Stripe decline code emails",
] as const;

const EMAIL_TEMPLATES = [
  {
    code: "card_expired",
    title: "Expired card email",
    intent: "Ask for a card update without implying churn.",
    timing: "Send within 1 hour of the failed invoice.",
    subject: "Can you update your card for {{product_name}}?",
    body: [
      "Hi {{first_name}},",
      "We tried to renew {{product_name}}, but Stripe says the card on file has expired.",
      "You can update the card here: {{stripe_update_link}}",
      "Once that is done, we will retry the payment automatically. Nothing else is needed from you.",
      "Thanks,",
      "{{sender_name}}",
    ],
    note: "Expired cards usually need customer action, so the update link should be the main call to action.",
  },
  {
    code: "insufficient_funds",
    title: "Insufficient funds email",
    intent: "Keep the tone calm and avoid blaming the customer.",
    timing: "Send after the first failure, then retry after a short delay.",
    subject: "We could not process your {{product_name}} renewal yet",
    body: [
      "Hi {{first_name}},",
      "We could not process your latest {{product_name}} payment. Stripe reported insufficient funds on the payment method.",
      "We will try again shortly. If you would rather use a different card, you can update it here: {{stripe_update_link}}",
      "Your account stays active while we work through the retry.",
      "Thanks,",
      "{{sender_name}}",
    ],
    note: "For temporary balance issues, timing matters more than pressure. Give the customer an easy alternative card path.",
  },
  {
    code: "do_not_honor",
    title: "Bank-declined payment email",
    intent: "Explain the vague bank block and give two practical next steps.",
    timing: "Send immediately after the failure, before repeated retries.",
    subject: "Your bank declined the latest {{product_name}} payment",
    body: [
      "Hi {{first_name}},",
      "Your latest {{product_name}} payment did not go through. Stripe returned a bank decline, which usually means the bank blocked the charge.",
      "The fastest fix is to approve the charge with your bank or add another card here: {{stripe_update_link}}",
      "We will retry after you update the payment method.",
      "Thanks,",
      "{{sender_name}}",
    ],
    note: "A generic retry can make this worse. Tell the customer why another attempt may fail unless the bank or card changes.",
  },
  {
    code: "authentication_required",
    title: "Authentication required email",
    intent: "Send the customer back into Stripe's hosted authentication flow.",
    timing: "Send as soon as Stripe requests authentication.",
    subject: "Please confirm your {{product_name}} payment",
    body: [
      "Hi {{first_name}},",
      "Your {{product_name}} payment needs a quick confirmation from your bank before it can complete.",
      "Please confirm the payment here: {{stripe_update_link}}",
      "After confirmation, Stripe can finish the payment and your subscription will continue normally.",
      "Thanks,",
      "{{sender_name}}",
    ],
    note: "This is not a persuasion problem. The email should reduce friction and point directly to authentication.",
  },
] as const;

const PLAYBOOK_STEPS = [
  {
    title: "Read the Stripe failure reason",
    copy: "Separate expired cards, insufficient funds, bank blocks, authentication failures, and customer action required events before writing the email.",
  },
  {
    title: "Choose the next best action",
    copy: "Some failures need a retry, some need a card update, and some need the customer to approve the payment with their bank.",
  },
  {
    title: "Keep the email specific",
    copy: "Tell the customer what happened, what to do next, and whether their account is still active during the recovery window.",
  },
  {
    title: "Escalate valuable accounts",
    copy: "For high-MRR customers, pause automation and let a founder or operator send a personal note before access is interrupted.",
  },
] as const;

const FAQS = [
  {
    question: "What should a Stripe failed payment email include?",
    answer:
      "A Stripe failed payment email should include the payment issue in plain language, a Stripe-hosted update or authentication link, what happens next, and a calm account-status note.",
  },
  {
    question: "Should every failed payment get the same email?",
    answer:
      "No. Expired cards, insufficient funds, bank declines, and authentication failures need different instructions. Matching the email to the failure reason usually makes the recovery path clearer.",
  },
  {
    question: "How fast should SaaS teams email after a failed payment?",
    answer:
      "Send quickly when the customer needs to update a card or authenticate a payment. For insufficient funds, combine a clear first email with retry timing that gives the payment a better chance to clear.",
  },
  {
    question: "How is Dunlo different from copying these templates manually?",
    answer:
      "Dunlo reads the Stripe failure context, chooses the right recovery message, routes customers to Stripe-hosted update flows, tracks recovered revenue, and flags high-value accounts for founder review.",
  },
] as const;

const RELATED_GUIDES = [
  {
    title: "Stripe failed payments",
    copy: "Understand why payments fail and how to turn the raw Stripe event into a recovery workflow.",
    href: "/stripe-failed-payments",
  },
  {
    title: "Dunning schedule calculator",
    copy: "Plan when each recovery email, retry, and escalation should happen after a failed invoice.",
    href: "/stripe-dunning-schedule-calculator",
  },
  {
    title: "Stripe Smart Retries alternative",
    copy: "See where retries help and where customer-facing recovery emails need a separate workflow.",
    href: "/stripe-smart-retries-alternative",
  },
] as const;

export const metadata: Metadata = pageSeoMetadata({
  title: TITLE,
  description: DESCRIPTION,
  keywords: KEYWORDS,
  path: "/stripe-failed-payment-email-templates",
});

export default function StripeFailedPaymentEmailTemplatesPage() {
  return (
    <div className="min-h-dvh overflow-hidden bg-stone-100 font-sans text-gray-950">
      <Nav />
      <main className="space-y-5 px-3 pb-5 pt-24 md:px-4 md:pb-6 md:pt-28">
        <section className="mx-auto grid max-w-6xl gap-8 rounded-[2rem] border border-gray-200 bg-white px-5 py-8 shadow-sm md:px-8 md:py-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-10 lg:py-12">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
              Stripe dunning email templates
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-[1.02] tracking-tight md:text-6xl">
              Copy-ready failed payment emails for each Stripe failure reason.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-gray-600 md:text-lg">
              Most failed payment emails say the same thing. These templates
              keep the message tied to the actual Stripe decline context, so
              customers know whether to update a card, approve a charge, or wait
              for a retry.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={SIGNUP_URL}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gray-950 px-6 text-sm font-bold text-white transition-all hover:-translate-y-px hover:bg-gray-800 active:scale-[0.98]"
              >
                Automate these emails
                <ArrowRight size={16} strokeWidth={1.8} />
              </a>
              <Link
                href="/stripe-dunning-schedule-calculator"
                className="inline-flex h-12 items-center justify-center rounded-full border border-gray-300 px-6 text-sm font-semibold text-gray-800 transition-all hover:-translate-y-px hover:border-gray-950 active:scale-[0.98]"
              >
                Plan the schedule
              </Link>
            </div>
          </div>

          <aside className="rounded-[1.5rem] border border-gray-200 bg-gray-50 p-5 md:p-6">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
              Template logic
            </p>
            <div className="mt-5 divide-y divide-gray-200 border-y border-gray-200">
              {[
                ["card_expired", "send update-card link"],
                ["insufficient_funds", "retry with calm context"],
                ["do_not_honor", "explain bank decline"],
                ["authentication_required", "send confirmation path"],
              ].map(([code, action]) => (
                <div
                  key={code}
                  className="grid grid-cols-1 gap-2 py-4 sm:grid-cols-[1fr_auto] sm:gap-4"
                >
                  <span className="font-mono text-sm font-bold text-gray-950">
                    {code}
                  </span>
                  <span className="text-sm font-semibold text-gray-600 sm:text-right">
                    {action}
                  </span>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="mx-auto max-w-6xl rounded-[2rem] border border-gray-200 bg-white p-5 shadow-sm md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
                Templates
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                Failed payment email examples by Stripe code
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-gray-500">
              Replace the variables with your product name, Stripe-hosted update
              link, and sender name. Keep the message short enough that the
              action is obvious.
            </p>
          </div>

          <div className="mt-8 grid gap-5">
            {EMAIL_TEMPLATES.map((template) => (
              <article
                key={template.code}
                className="overflow-hidden rounded-[1.5rem] border border-gray-200 bg-gray-50"
              >
                <div className="grid gap-0 lg:grid-cols-[0.42fr_0.58fr]">
                  <div className="border-b border-gray-200 bg-white p-5 md:p-6 lg:border-b-0 lg:border-r">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-dunlo/25 bg-dunlo/10 px-3 py-1 font-mono text-xs font-bold text-dunlo-deep">
                        {template.code}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600">
                        <Clock3 size={13} />
                        {template.timing}
                      </span>
                    </div>
                    <h3 className="mt-5 text-2xl font-bold tracking-tight">
                      {template.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-gray-600">
                      {template.intent}
                    </p>
                    <div className="mt-5 rounded-2xl border border-dunlo/20 bg-dunlo/[0.07] p-4">
                      <p className="text-sm font-semibold text-gray-950">
                        Why this works
                      </p>
                      <p className="mt-2 text-sm leading-6 text-gray-600">
                        {template.note}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 md:p-6">
                    <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                      Subject
                    </p>
                    <p className="mt-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-950">
                      {template.subject}
                    </p>
                    <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                      <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                        Email body
                      </p>
                      <div className="mt-4 space-y-3 text-sm leading-6 text-gray-700">
                        {template.body.map((line) => (
                          <p key={line}>{line}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[0.72fr_1.28fr]">
          <div className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <MailCheck size={22} className="text-dunlo-deep" />
            <h2 className="mt-5 text-3xl font-bold tracking-tight">
              How to adapt a failed payment email
            </h2>
            <p className="mt-4 text-sm leading-6 text-gray-600">
              The best dunning email is not the most persuasive one. It is the
              clearest email for the exact payment failure in front of the
              customer.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {PLAYBOOK_STEPS.map((step, index) => (
              <article
                key={step.title}
                className="rounded-[1.5rem] border border-gray-200 bg-white p-5 shadow-sm"
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-gray-950 font-mono text-sm font-bold text-white">
                  {index + 1}
                </span>
                <h3 className="mt-5 text-lg font-bold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {step.copy}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-[2rem] border border-gray-900 bg-gray-950 p-7 text-white shadow-sm md:p-9">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo">
              Free during beta
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
              Dunlo sends the right failed payment email automatically.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-300 md:text-base">
              Connect Stripe, review the recovery defaults, and let Dunlo route
              each failure to the right message, update link, retry window, or
              founder escalation.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href={SIGNUP_URL}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-dunlo px-6 text-sm font-bold text-gray-950 transition-all hover:bg-dunlo-hover active:scale-[0.98]"
              >
                Start free
                <ArrowRight size={15} />
              </a>
              <Link
                href="/stripe-failed-payment-recovery-software"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 px-6 text-sm font-bold text-white transition-colors hover:border-white/35"
              >
                See recovery software
              </Link>
            </div>
          </div>

          <FaqSection />
        </section>

        <RelatedGuidesSection />
      </main>
      <Footer />
      <JsonLd />
    </div>
  );
}

function FaqSection() {
  return (
    <section className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm md:p-8">
      <div className="flex items-center gap-3">
        <ShieldCheck size={20} className="text-dunlo-deep" />
        <h2 className="text-2xl font-bold tracking-tight">
          Failed payment email FAQ
        </h2>
      </div>
      <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
        {FAQS.map((faq) => (
          <div key={faq.question} className="py-5">
            <h3 className="text-base font-bold tracking-tight">
              {faq.question}
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RelatedGuidesSection() {
  return (
    <section className="mx-auto max-w-6xl">
      <div className="grid gap-5 md:grid-cols-3">
        {RELATED_GUIDES.map((guide) => (
          <Link
            key={guide.href}
            href={guide.href}
            className="group rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-px hover:border-dunlo/40"
          >
            <BadgeCheck size={19} className="text-dunlo-deep" />
            <h2 className="mt-4 text-xl font-bold tracking-tight text-gray-950">
              {guide.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">{guide.copy}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-gray-950 transition-colors group-hover:text-dunlo-deep">
              Read guide
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
            "@type": "WebPage",
            name: TITLE,
            description: DESCRIPTION,
            url: absoluteUrl("/stripe-failed-payment-email-templates"),
            publisher: {
              "@type": "Organization",
              name: SITE_NAME,
            },
            about: [
              "Stripe failed payment emails",
              "SaaS dunning",
              "Payment recovery",
            ],
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
              {
                name: "Stripe failed payment email templates",
                path: "/stripe-failed-payment-email-templates",
              },
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
            "@type": "HowTo",
            name: "How to adapt a Stripe failed payment email",
            description:
              "A four-step process for matching failed payment emails to the Stripe failure reason.",
            step: PLAYBOOK_STEPS.map((step, index) => ({
              "@type": "HowToStep",
              position: index + 1,
              name: step.title,
              text: step.copy,
            })),
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
    </>
  );
}
