import Link from "next/link";
import { appUrl } from "@/lib/app-url";
import { Logo } from "@/components/logo";

type ComparisonRow = {
  label: string;
  competitor: string;
  dunlo: string;
};

type SourceLink = {
  label: string;
  href: string;
};

type FailureCodeProof = {
  title: string;
  intro: string;
  genericLabel: string;
  dunloLabel: string;
  genericCaption: string;
  dunloCaption: string;
  rows: {
    code: string;
    generic: string;
    dunlo: string;
  }[];
};

export type AlternativePageData = {
  slug: string;
  path: string;
  competitorName: string;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  headline: string;
  intro: string;
  verdict: string;
  competitorSummary: string;
  dunloSummary: string;
  comparisonRows: ComparisonRow[];
  failureCodeProof?: FailureCodeProof;
  competitorUseCases: string[];
  dunloUseCases: string[];
  sourceLinks: SourceLink[];
};

export const ALTERNATIVES: Record<string, AlternativePageData> = {
  slicker: {
    slug: "slicker",
    path: "/alternatives/slicker",
    competitorName: "Slicker",
    metaTitle: "Dunlo vs Slicker - Payment Recovery for Small SaaS",
    metaDescription:
      "Compare Dunlo and Slicker for failed payment recovery, AI retry engines, setup, pricing, and the right fit for enterprise teams vs solo founders.",
    eyebrow: "TL;DR",
    headline: "Dunlo vs Slicker",
    intro:
      "Slicker is enterprise payment recovery with AI-powered retry engines, white-glove setup, and pay-for-success pricing. Dunlo is self-serve failed payment recovery for solo founders and small SaaS teams, with failure-code precision and AI-drafted founder emails. Different tools, different stages.",
    verdict:
      "Try Dunlo free during beta: 5-minute setup, no sales call required. Choose Slicker if you process significant recurring revenue across multiple gateways and want a sales-led AI retry platform with success-based pricing. Choose Dunlo if you run a small Stripe SaaS and need failure-code-precise emails and founder-visible escalations.",
    competitorSummary:
      "Enterprise payment recovery with AI-powered retry optimization, multi-gateway routing, AABB testing, and performance-based pricing.",
    dunloSummary:
      "Self-serve failed payment recovery for Stripe-first founders who want precise customer emails and AI-drafted founder follow-up.",
    comparisonRows: [
      {
        label: "Best fit",
        competitor:
          "Enterprise and scaling subscription businesses with high failed-payment volume and more complex billing operations.",
        dunlo:
          "Solo founders and small SaaS teams on Stripe who want a practical recovery layer before buying an enterprise platform.",
      },
      {
        label: "Setup motion",
        competitor:
          "Sales-led and consultative, with custom analysis, integrations, and a success manager included in the plan.",
        dunlo:
          "Self-serve beta setup: connect Stripe, review the defaults, and start monitoring in roughly 5 minutes.",
      },
      {
        label: "Pricing model",
        competitor:
          "Performance-based pricing with no fixed public tiers; Slicker says customers pay only when it outperforms their current solution.",
        dunlo:
          "Free during beta. Planned tiers are flat by MRR, starting at $19/mo, with no percentage of recovered revenue.",
      },
      {
        label: "Retry engine",
        competitor:
          "AI-powered retry engine that can optimize timing, payment method, and gateway for each failed payment.",
        dunlo:
          "Uses Stripe-native retry infrastructure and focuses on customer messaging, visibility, and manual escalation workflows.",
      },
      {
        label: "Payment stack",
        competitor:
          "Supports multi-gateway and billing integrations, including Stripe, Adyen, Braintree, Worldpay, Chargebee, Recurly, and Zuora.",
        dunlo:
          "Stripe-only by design, which keeps the product simpler for founders who already use Stripe Billing.",
      },
      {
        label: "Failure-code emails",
        competitor:
          "Slicker includes smart dunning emails and says messages are tailored to failure reason and required action.",
        dunlo:
          "Per failure code, human-tone emails for Stripe declines such as card_expired, insufficient_funds, and do_not_honor.",
      },
      {
        label: "Evaluation",
        competitor:
          "Promotes clinical-grade AABB testing to prove recovery lift with statistical significance.",
        dunlo:
          "Focuses on lightweight benchmark visibility and practical recovered-revenue tracking for small teams.",
      },
      {
        label: "AI founder escalation",
        competitor:
          "Not positioned around founder-reviewed personal email drafts for high-value accounts.",
        dunlo:
          "Yes. Dunlo drafts a personal founder email for high-value failures so you can review and send in one click.",
      },
      {
        label: "Minimum stage",
        competitor:
          "Best suited once failed-payment volume is large enough to justify custom analysis and enterprise-style recovery operations.",
        dunlo:
          "No minimum during beta. Built for founders who want recovery discipline before failed payments become a large leak.",
      },
    ],
    competitorUseCases: [
      "You process substantial recurring revenue and failed payments are already a material finance metric.",
      "You use multiple gateways or enterprise billing platforms such as Chargebee, Recurly, or Zuora.",
      "You want a proven AI retry engine, success-based pricing, and a dedicated success motion.",
    ],
    dunloUseCases: [
      "You are a solo founder or small SaaS team running subscription billing on Stripe.",
      "You want failure-code-precise customer emails without enterprise pricing or a sales call.",
      "You want AI-drafted founder escalations for high-value failed payments before churn is final.",
    ],
    sourceLinks: [
      {
        label: "Slicker Smart Retries",
        href: "https://www.slickerhq.com/features/retries",
      },
      { label: "Slicker pricing", href: "https://www.slickerhq.com/pricing" },
      {
        label: "Slicker integrations",
        href: "https://docs.slickerhq.com/integrations/overview",
      },
      {
        label: "Slicker introduction",
        href: "https://docs.slickerhq.com/introduction",
      },
    ],
  },
  "churn-buster": {
    slug: "churn-buster",
    path: "/alternatives/churn-buster",
    competitorName: "Churn Buster",
    metaTitle: "Dunlo vs Churn Buster - Stripe Payment Recovery Alternative",
    metaDescription:
      "Compare Dunlo and Churn Buster for failed payment recovery, dunning emails, pricing, setup time, and the right fit for SaaS teams.",
    eyebrow: "Alternative guide",
    headline: "Dunlo vs Churn Buster",
    intro:
      "Churn Buster is a mature payment recovery product for subscription businesses. Dunlo is built for Stripe-first SaaS founders who want a lighter recovery layer during beta, with failure-aware messaging and founder-friendly escalation.",
    verdict:
      "Choose Churn Buster if you want an established dunning platform with broader recovery workflows. Choose Dunlo if you use Stripe and want fast setup, simple beta pricing, and recovery emails written for the exact failure moment.",
    competitorSummary:
      "A dedicated recovery product for failed payments, dunning campaigns, and subscription churn workflows.",
    dunloSummary:
      "A Stripe-first payment recovery tool focused on failed charge detection, tailored recovery sequences, and high-value customer escalation.",
    comparisonRows: [
      {
        label: "Pricing model",
        competitor: "Starts from $149/mo, with public pricing based on MRR.",
        dunlo:
          "Free during beta. Planned tiers are flat by MRR, with no percentage of recovered revenue.",
      },
      {
        label: "Recovery focus",
        competitor:
          "Failed payment recovery and dunning workflows for subscription businesses.",
        dunlo:
          "Stripe failed payment recovery by failure context, with practical customer-facing emails.",
      },
      {
        label: "Payment stack",
        competitor:
          "Built as a standalone recovery layer for subscription teams.",
        dunlo: "Built around Stripe data and Stripe-first SaaS operations.",
      },
      {
        label: "Setup time",
        competitor:
          "Best suited when you are ready to configure a dedicated recovery system.",
        dunlo:
          "Designed for a short beta setup: connect Stripe, review defaults, start monitoring.",
      },
      {
        label: "Percent of MRR",
        competitor:
          "Plans are publicly described as based on monthly recurring revenue.",
        dunlo: "No percentage of MRR or recovered revenue during beta.",
      },
      {
        label: "AI-drafted founder escalation",
        competitor:
          "No. Churn Buster focuses on automation-first recovery workflows.",
        dunlo:
          "Yes. Dunlo drafts a personal founder email for high-value failures so you can review and send in one click.",
      },
    ],
    competitorUseCases: [
      "You want a more established failed-payment recovery platform.",
      "Your team is ready to invest in a dedicated dunning system.",
      "You want recovery workflows beyond a lightweight Stripe-first beta tool.",
    ],
    dunloUseCases: [
      "You run a SaaS on Stripe and want to recover failed payments quickly.",
      "You prefer simple beta access before committing to a paid dunning stack.",
      "You want failure-aware messaging and a founder-led fallback for important accounts.",
    ],
    sourceLinks: [
      { label: "Churn Buster pricing", href: "https://churnbuster.io/pricing" },
      { label: "Churn Buster product", href: "https://churnbuster.io/" },
    ],
  },
  "stripe-smart-retries": {
    slug: "stripe-smart-retries",
    path: "/alternatives/stripe-smart-retries",
    competitorName: "Stripe Smart Retries",
    metaTitle: "Dunlo vs Stripe Smart Retries - Failed Payment Recovery",
    metaDescription:
      "Compare Dunlo and Stripe Smart Retries for retry timing, recovery emails, setup, pricing, and SaaS payment recovery workflows.",
    eyebrow: "Alternative guide",
    headline: "Dunlo vs Stripe Smart Retries",
    intro:
      "Stripe Smart Retries is the native retry engine inside Stripe Billing. Dunlo does not replace Stripe retries; it adds the customer communication and escalation layer founders often need after a charge fails.",
    verdict:
      "Use Stripe Smart Retries as your retry engine. Add Dunlo when failed payments need clearer customer emails, founder visibility, and recovery workflows that do more than retry the card.",
    competitorSummary:
      "Stripe's built-in retry timing system uses machine learning signals to schedule payment retries.",
    dunloSummary:
      "A recovery layer for Stripe teams that turns failed charges into understandable customer outreach and follow-up.",
    comparisonRows: [
      {
        label: "Pricing model",
        competitor:
          "Part of Stripe Billing and Revenue Recovery tooling, not a separate standalone dunning app.",
        dunlo:
          "Free during beta. Planned tiers are flat by MRR, with no percentage of recovered revenue.",
      },
      {
        label: "Recovery focus",
        competitor: "Optimizes when Stripe retries an invoice payment method.",
        dunlo:
          "Pairs Stripe failure context with recovery emails, customer follow-up, and founder escalation.",
      },
      {
        label: "Payment stack",
        competitor: "Native to Stripe Billing.",
        dunlo: "Built for SaaS teams already using Stripe.",
      },
      {
        label: "Setup time",
        competitor:
          "Configured in Stripe Dashboard through retry and revenue recovery settings.",
        dunlo:
          "Designed for a short beta setup: connect Stripe, review defaults, start monitoring.",
      },
      {
        label: "Percent of MRR",
        competitor:
          "No standalone percentage of MRR for Smart Retries; Stripe pricing depends on the products you use.",
        dunlo: "No percentage of MRR or recovered revenue during beta.",
      },
      {
        label: "AI-drafted founder escalation",
        competitor:
          "No. Stripe Smart Retries focuses on automated retry timing rather than founder-led customer recovery.",
        dunlo:
          "Yes. Dunlo drafts a personal founder email for high-value failures so you can review and send in one click.",
      },
    ],
    competitorUseCases: [
      "You only need Stripe to choose better retry timing.",
      "You want to stay fully inside Stripe Billing settings.",
      "You do not need a separate customer recovery workflow yet.",
    ],
    dunloUseCases: [
      "You want failed payment emails that explain the issue clearly.",
      "You need more visibility into which customers are at risk.",
      "You want to combine automatic retries with human, founder-level follow-up.",
    ],
    sourceLinks: [
      {
        label: "Stripe Smart Retries docs",
        href: "https://docs.stripe.com/billing/revenue-recovery/smart-retries",
      },
      {
        label: "Stripe revenue recovery docs",
        href: "https://docs.stripe.com/billing/revenue-recovery",
      },
      { label: "Stripe pricing", href: "https://stripe.com/pricing" },
    ],
  },
  "paddle-retain": {
    slug: "paddle-retain",
    path: "/alternatives/paddle-retain",
    competitorName: "Paddle Retain",
    metaTitle: "Dunlo vs Paddle Retain - Churn and Payment Recovery",
    metaDescription:
      "Compare Dunlo and Paddle Retain for Stripe teams, Paddle Billing users, involuntary churn, pricing, setup time, and recovery workflows.",
    eyebrow: "Alternative guide",
    headline: "Dunlo vs Paddle Retain",
    intro:
      "Paddle Retain is built for companies using the Paddle Billing platform. Dunlo is for SaaS teams that already run on Stripe and want failed-payment recovery without moving to a merchant-of-record stack.",
    verdict:
      "Choose Paddle Retain if Paddle Billing is already your payments platform. Choose Dunlo if Stripe is your source of truth and you want a focused recovery layer on top of it.",
    competitorSummary:
      "A churn intervention product inside Paddle Billing, covering active churn and involuntary churn workflows.",
    dunloSummary:
      "A Stripe-first failed payment recovery tool for SaaS teams that want quick setup and clear customer communication.",
    comparisonRows: [
      {
        label: "Pricing model",
        competitor:
          "Paddle's product page presents Retain as built into Paddle Billing at no extra cost; older Retain help pages reference performance-based and flat-fee plans.",
        dunlo:
          "Free during beta. Planned tiers are flat by MRR, with no percentage of recovered revenue.",
      },
      {
        label: "Recovery focus",
        competitor:
          "Active churn intervention plus involuntary churn tools such as card updates and delinquent emails.",
        dunlo:
          "Failed Stripe payment recovery, failure-aware email sequences, and founder escalation.",
      },
      {
        label: "Payment stack",
        competitor:
          "Designed for Paddle Billing and merchant-of-record workflows.",
        dunlo: "Designed for Stripe-first SaaS teams.",
      },
      {
        label: "Setup time",
        competitor:
          "Paddle says dunning sequences can be set up in roughly 20 minutes.",
        dunlo:
          "Designed for a short beta setup: connect Stripe, review defaults, start monitoring.",
      },
      {
        label: "Percent of MRR",
        competitor:
          "Depends on Paddle Billing and Retain plan context; not positioned as a Stripe add-on.",
        dunlo: "No percentage of MRR or recovered revenue during beta.",
      },
      {
        label: "AI-drafted founder escalation",
        competitor:
          "No. Paddle Retain is built around Paddle-managed retention and billing workflows.",
        dunlo:
          "Yes. Dunlo drafts a personal founder email for high-value failures so you can review and send in one click.",
      },
    ],
    competitorUseCases: [
      "You already use Paddle Billing as your payment platform.",
      "You want retention workflows tied to Paddle's merchant-of-record stack.",
      "You need active cancellation saves as well as involuntary churn recovery.",
    ],
    dunloUseCases: [
      "You use Stripe and do not want to migrate payment infrastructure.",
      "You mainly need failed-payment recovery rather than a full MoR platform.",
      "You want a lightweight beta tool with founder-visible recovery workflows.",
    ],
    sourceLinks: [
      {
        label: "Paddle Retain product",
        href: "https://www.paddle.com/retain/churn-intervention/",
      },
      {
        label: "Paddle Retain help",
        href: "https://www.paddle.com/help/start/intro-to-paddle/what-is-paddle-retain",
      },
      { label: "Paddle pricing", href: "https://www.paddle.com/pricing" },
    ],
  },
  triggla: {
    slug: "triggla",
    path: "/alternatives/triggla",
    competitorName: "Triggla",
    metaTitle: "Dunlo vs Triggla - Failed Payment Recovery Comparison",
    metaDescription:
      "Compare Dunlo and Triggla for Stripe failed payment recovery, failure-code messaging, trial rescue, churn recovery, pricing, and setup.",
    eyebrow: "Alternative guide",
    headline: "Dunlo vs Triggla",
    intro:
      "Triggla is a useful revenue recovery product for teams that want one tool across failed payments, trials, cancellations, refunds, and repeat purchase flows. Dunlo is narrower by design: it focuses on failed Stripe payments and writes the recovery path around the exact failure code.",
    verdict:
      "Choose Triggla if you want broad revenue lifecycle automation across several payment platforms. Choose Dunlo if failed Stripe payment recovery is the leak you want to fix first, and you care about emails that change by failure reason instead of sending the same message every time.",
    competitorSummary:
      "A multi-platform revenue recovery tool covering failed payments, trial rescue, churn recovery, repeat purchase, onboarding, and refund follow-up flows.",
    dunloSummary:
      "A Stripe-only failed payment recovery tool that segments by failure code, recovery timing, and founder-visible escalation.",
    failureCodeProof: {
      title:
        "Not all failed payments are the same. Dunlo knows the difference.",
      intro:
        "The practical difference is not the dashboard. It is the email your customer receives after Stripe says why the charge failed.",
      genericLabel: "Generic recovery email",
      dunloLabel: "Dunlo failure-code email",
      genericCaption:
        "Same email every time, regardless of why the payment failed.",
      dunloCaption:
        "The right message, for the right reason, at the right time.",
      rows: [
        {
          code: "expired_card",
          generic: "Your payment failed. Please update your card.",
          dunlo:
            "Looks like your card expired. Here is your one-click update link.",
        },
        {
          code: "insufficient_funds",
          generic: "Your payment failed. Please update your card.",
          dunlo: "We will retry in a few days. No action needed right now.",
        },
        {
          code: "do_not_honor",
          generic: "Your payment failed. Please update your card.",
          dunlo:
            "Your bank blocked the charge. Here is what usually fixes this in 2 minutes.",
        },
      ],
    },
    comparisonRows: [
      {
        label: "Failed payment recovery",
        competitor:
          "Yes, with editable transactional recovery emails. In our signup test, the failed-payment template was generic across failure reasons.",
        dunlo:
          "Yes, with sequences and copy adapted to the Stripe failure code.",
      },
      {
        label: "Trial rescue",
        competitor:
          "Yes. Triggla includes trial conversion flows for expiring trials.",
        dunlo: "Roadmap. Dunlo is focused on failed payments first.",
      },
      {
        label: "Churn recovery",
        competitor: "Yes. Triggla includes cancellation and win-back flows.",
        dunlo: "Roadmap. Dunlo currently prioritizes involuntary churn.",
      },
      {
        label: "Failure code segmentation",
        competitor: "Not visible in the tested failed-payment email flow.",
        dunlo:
          "Built around Stripe decline codes such as expired_card, insufficient_funds, and do_not_honor.",
      },
      {
        label: "AI-drafted founder escalation",
        competitor:
          "No. Triggla is broader lifecycle automation rather than AI-drafted founder review for high-value failures.",
        dunlo:
          "Yes. Dunlo drafts a personal founder email for high-value failures so you can review and send in one click.",
      },
      {
        label: "Pricing",
        competitor: "Starts at $12/mo, with tiers based on monthly events.",
        dunlo:
          "Starts at $19/mo after beta, with flat MRR-based tiers and no cut of recovered revenue.",
      },
      {
        label: "Stripe-native",
        competitor:
          "Partial. Triggla supports Stripe plus Shopify, Gumroad, Paddle, and LemonSqueezy.",
        dunlo: "Stripe-only by design.",
      },
      {
        label: "Setup time",
        competitor: "Positioned as a 60-second setup.",
        dunlo: "Designed for a 5-minute Stripe setup.",
      },
    ],
    competitorUseCases: [
      "You want one automation layer for the full post-payment lifecycle.",
      "You sell across Stripe, Shopify, Gumroad, Paddle, or LemonSqueezy.",
      "You care about trial rescue, churn recovery, refunds, and repeat purchases as much as failed payments.",
    ],
    dunloUseCases: [
      "You run a Stripe-first SaaS and failed payments are the specific leak.",
      "You want recovery emails tailored to each failure reason.",
      "You prefer a focused tool with simple flat tiers and no recovered-revenue cut.",
    ],
    sourceLinks: [
      { label: "Triggla product", href: "https://triggla.com/" },
      {
        label: "Triggla churn recovery",
        href: "https://triggla.com/stripe-churn-recovery",
      },
      {
        label: "Stripe decline codes",
        href: "https://docs.stripe.com/declines/codes",
      },
    ],
  },
};

export function AlternativePage({ page }: { page: AlternativePageData }) {
  return (
    <div className="min-h-dvh bg-gray-100 font-sans text-gray-950">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6 md:py-6">
        <Link href="/" aria-label="Dunlo home">
          <Logo />
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium text-gray-600">
          <Link href="/" className="transition-colors hover:text-gray-950">
            Home
          </Link>
          <Link
            href={appUrl("/login")}
            className="rounded-full bg-gray-950 px-4 py-2 text-white transition-transform active:scale-[0.98]"
          >
            Join beta
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl space-y-4 px-3 pb-8 md:px-4">
        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
          <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="px-6 py-10 md:px-10 md:py-14 lg:px-14">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
                {page.eyebrow}
              </p>
              <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-[1.04] tracking-tight text-gray-950 md:text-6xl">
                {page.headline}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-gray-600 md:text-lg">
                {page.intro}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={appUrl("/login")}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-dunlo px-6 text-sm font-semibold text-gray-950 transition-transform active:scale-[0.98]"
                >
                  Join the free beta
                </Link>
                <a
                  href="#comparison"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-gray-200 px-6 text-sm font-semibold text-gray-900 transition-colors hover:border-gray-300 hover:bg-gray-50"
                >
                  Compare details
                </a>
              </div>
            </div>

            <aside className="border-t border-gray-200 bg-gray-50 px-6 py-8 md:px-10 lg:border-l lg:border-t-0 lg:px-12 lg:py-14">
              <div className="space-y-8">
                <SummaryBlock
                  label={page.competitorName}
                  text={page.competitorSummary}
                />
                <SummaryBlock label="Dunlo" text={page.dunloSummary} />
              </div>
            </aside>
          </div>
        </section>

        {page.failureCodeProof && (
          <FailureCodeProofSection proof={page.failureCodeProof} />
        )}

        <section
          id="comparison"
          className="rounded-3xl border border-gray-200 bg-white px-4 py-6 md:px-8 md:py-8"
        >
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                Comparison
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-950 md:text-3xl">
                What changes in practice
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-gray-500">
              This comparison is based on public product pages and
              documentation. Dunlo details reflect the current beta offer.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="w-[22%] py-4 pr-6 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                    Criteria
                  </th>
                  <th className="w-[39%] px-6 py-4 text-sm font-semibold text-gray-950">
                    {page.competitorName}
                  </th>
                  <th className="w-[39%] px-6 py-4 text-sm font-semibold text-gray-950">
                    Dunlo
                  </th>
                </tr>
              </thead>
              <tbody>
                {page.comparisonRows.map((row) => (
                  <tr key={row.label} className="border-b border-gray-100">
                    <th className="py-5 pr-6 align-top text-sm font-semibold text-gray-950">
                      {row.label}
                    </th>
                    <td className="px-6 py-5 align-top text-sm leading-6 text-gray-600">
                      {row.competitor}
                    </td>
                    <td className="px-6 py-5 align-top text-sm leading-6 text-gray-700">
                      {row.dunlo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <UseCasePanel
            title={`Who should use ${page.competitorName}`}
            items={page.competitorUseCases}
          />
          <UseCasePanel
            title="Who should use Dunlo"
            items={page.dunloUseCases}
          />
        </section>

        <section className="rounded-3xl border border-gray-200 bg-gray-950 px-6 py-8 text-white md:px-10 md:py-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-dunlo">
                Free beta
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
                Recover failed Stripe payments before they become churn.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300">
                {page.verdict}
              </p>
            </div>
            <Link
              href={appUrl("/login")}
              className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-dunlo px-6 text-sm font-semibold text-gray-950 transition-transform active:scale-[0.98]"
            >
              Start with Dunlo
            </Link>
          </div>
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white px-6 py-6 md:px-8">
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

function UseCasePanel({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="rounded-3xl border border-gray-200 bg-white px-6 py-7 md:px-8">
      <h2 className="text-xl font-bold tracking-tight text-gray-950">
        {title}
      </h2>
      <ul className="mt-6 space-y-4">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-6 text-gray-600">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-dunlo" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function FailureCodeProofSection({ proof }: { proof: FailureCodeProof }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-gray-200 bg-gray-950 text-white">
      <div className="grid gap-0 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="border-b border-white/10 px-6 py-8 md:px-10 lg:border-b-0 lg:border-r lg:px-12 lg:py-12">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-dunlo">
            Failure code intelligence
          </p>
          <h2 className="mt-4 max-w-xl text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            {proof.title}
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-7 text-gray-300 md:text-base">
            {proof.intro}
          </p>
        </div>

        <div className="grid gap-0 md:grid-cols-2">
          <FailureCodeColumn
            caption={proof.genericCaption}
            label={proof.genericLabel}
            tone="generic"
            rows={proof.rows.map((row) => ({
              code: row.code,
              message: row.generic,
            }))}
          />
          <FailureCodeColumn
            caption={proof.dunloCaption}
            label={proof.dunloLabel}
            tone="dunlo"
            rows={proof.rows.map((row) => ({
              code: row.code,
              message: row.dunlo,
            }))}
          />
        </div>
      </div>
    </section>
  );
}

function FailureCodeColumn({
  label,
  caption,
  rows,
  tone,
}: {
  label: string;
  caption: string;
  rows: { code: string; message: string }[];
  tone: "generic" | "dunlo";
}) {
  const isDunlo = tone === "dunlo";

  return (
    <div
      className={`px-5 py-6 md:px-6 md:py-8 ${
        isDunlo
          ? "bg-dunlo/10"
          : "border-b border-white/10 bg-white/[0.03] md:border-b-0 md:border-r"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-white">{label}</p>
        <span
          className={`rounded-full border px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] ${
            isDunlo
              ? "border-dunlo/30 bg-dunlo/15 text-dunlo"
              : "border-white/10 bg-white/5 text-gray-400"
          }`}
        >
          {isDunlo ? "Tailored" : "Generic"}
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {rows.map((row) => (
          <div
            key={row.code}
            className={`rounded-2xl border p-4 ${
              isDunlo
                ? "border-dunlo/20 bg-gray-950/70"
                : "border-white/10 bg-gray-900/80"
            }`}
          >
            <p className="font-mono text-[11px] font-semibold text-gray-400">
              {row.code}
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-100">
              "{row.message}"
            </p>
          </div>
        ))}
      </div>

      <p
        className={`mt-5 text-sm leading-6 ${
          isDunlo ? "text-dunlo" : "text-gray-400"
        }`}
      >
        {caption}
      </p>
    </div>
  );
}
