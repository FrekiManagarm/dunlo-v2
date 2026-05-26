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
  baremetrics: {
    slug: "baremetrics",
    path: "/vs/baremetrics",
    competitorName: "Baremetrics",
    metaTitle: "Baremetrics vs Dunlo - Stripe Recovery for Early SaaS",
    metaDescription:
      "Compare Baremetrics and Dunlo for MRR analytics, Recover dunning, Stripe failed payment emails, setup, pricing, and founder escalation.",
    eyebrow: "Comparison guide",
    headline: "Baremetrics vs Dunlo: metrics suite or focused recovery layer?",
    intro:
      "Baremetrics is a respected subscription metrics platform with a separate Recover product for dunning. Dunlo is narrower: failed Stripe payment recovery, failure-code-specific emails, and AI-drafted founder escalation for bootstrapped SaaS teams that are not ready for a larger metrics stack.",
    verdict:
      "Use Baremetrics when you want a mature MRR analytics suite and a separate Recover workflow. Use Dunlo when you already live in Stripe and want a focused recovery layer with flat beta pricing, failure-code copy, and founder-visible follow-up.",
    competitorSummary:
      "Subscription metrics plus optional Recover dunning: MRR dashboards, churn reporting, customer insights, recovery emails, card update pages, and in-app prompts.",
    dunloSummary:
      "Stripe-first failed payment recovery for early SaaS founders who want a lighter tool focused on recovering at-risk invoices.",
    comparisonRows: [
      {
        label: "Primary job",
        competitor:
          "MRR analytics first, with Recover available as a dedicated dunning product.",
        dunlo:
          "Failed Stripe payment recovery first: monitoring, customer emails, and founder escalation.",
      },
      {
        label: "MRR tracking",
        competitor:
          "Yes. Metrics is Baremetrics' core product for MRR, churn, LTV, cohorts, and customer analytics.",
        dunlo:
          "No. Dunlo tracks recovery outcomes, not full subscription analytics.",
      },
      {
        label: "Failed payment recovery",
        competitor:
          "Yes. Baremetrics Recover sends recovery emails, hosts a card update page, and can prompt customers inside your app.",
        dunlo:
          "Yes. Dunlo focuses on Stripe failure context, recovery emails, and high-value customer escalation.",
      },
      {
        label: "Failure-code-specific emails",
        competitor:
          "Recover provides customizable drip campaigns; public docs do not position it around per-decline-code copy.",
        dunlo:
          "Built around Stripe failure codes such as expired_card, insufficient_funds, and do_not_honor.",
      },
      {
        label: "Founder escalation AI",
        competitor:
          "Not positioned around founder-reviewed personal email drafts for high-value failed payments.",
        dunlo:
          "Yes. Dunlo drafts a personal founder email when a valuable account needs more than automation.",
      },
      {
        label: "Pricing entry",
        competitor:
          "Metrics starts at $129/mo up to $10k MRR; Recover starts at $69/mo up to $10k MRR.",
        dunlo:
          "Free during beta. Planned tiers start at $19/mo with no percentage of recovered revenue.",
      },
      {
        label: "Best fit",
        competitor:
          "Founders who want a broader subscription metrics system and are ready to pay separately for analytics or Recover.",
        dunlo:
          "Stripe-first founders who want the payment leak fixed before buying a full metrics suite.",
      },
    ],
    competitorUseCases: [
      "You need trusted MRR dashboards, churn reporting, cohorts, and customer analytics.",
      "You want Baremetrics Recover's dunning emails, card update pages, and in-app recovery prompt.",
      "You are comfortable paying for a broader metrics and recovery suite as your MRR grows.",
    ],
    dunloUseCases: [
      "You already use Stripe as your source of truth and do not need a full analytics product.",
      "You want failure-code-specific recovery emails instead of generic dunning copy.",
      "You want high-value failed payments surfaced as founder-reviewed personal follow-up.",
    ],
    sourceLinks: [
      {
        label: "Baremetrics pricing",
        href: "https://help.baremetrics.com/en/articles/5390941-pricing",
      },
      {
        label: "Baremetrics Recover",
        href: "https://help.baremetrics.com/en/articles/5380360-what-is-recover",
      },
      {
        label: "Baremetrics Recover setup",
        href: "https://help.baremetrics.com/en/articles/5430343-recover-your-101-setup-guide",
      },
    ],
  },
  recurflux: {
    slug: "recurflux",
    path: "/alternatives/recurflux",
    competitorName: "Recurflux",
    metaTitle: "Dunlo vs Recurflux - Focused Stripe Recovery Alternative",
    metaDescription:
      "Compare Dunlo and Recurflux for failed payment recovery, churn prevention, RevenueCat recovery, pricing, setup, and founder escalation.",
    eyebrow: "Alternative guide",
    headline: "Dunlo vs Recurflux",
    intro:
      "Recurflux is a broader retention platform covering failed payments, smart retries, card health, cancellation flows, win-back, checkout recovery, and mobile recovery through RevenueCat. Dunlo is intentionally smaller: a Stripe-first tool for founders who want failed payment recovery without configuring a full retention suite.",
    verdict:
      "Choose Recurflux if you want one platform for payment recovery, cancellation prevention, win-back, and multiple processors. Choose Dunlo if you want a focused Stripe recovery layer with a simpler setup, lower planned entry price, and founder escalation built into the workflow.",
    competitorSummary:
      "Subscription recovery and churn prevention across Stripe, Paddle, Razorpay, and RevenueCat, with smart retries, dunning, card health, cancellation flows, and win-back.",
    dunloSummary:
      "A focused Stripe payment recovery tool for bootstrapped SaaS founders who want fewer knobs and faster recovery discipline.",
    comparisonRows: [
      {
        label: "Failed payment recovery",
        competitor:
          "Yes, with smart retry scheduling, recovery emails, hosted payment pages, and analytics.",
        dunlo:
          "Yes, with Stripe failure-code-specific emails and founder-visible escalation.",
      },
      {
        label: "Scope",
        competitor:
          "Broad retention suite: failed payments, card health, cancellation flow builder, subscription pause, checkout recovery, disputes, and win-back.",
        dunlo:
          "Narrow recovery layer: failed Stripe payments, email sequences, Morning Brief, and founder escalation.",
      },
      {
        label: "Payment stack",
        competitor:
          "Supports Stripe, Paddle, Razorpay, and RevenueCat, with RevenueCat recovery handled by email because app stores own the retry cycle.",
        dunlo: "Stripe-only by design.",
      },
      {
        label: "Founder escalation AI",
        competitor:
          "Not positioned around founder-reviewed personal email drafts for high-value accounts.",
        dunlo:
          "Yes. Dunlo drafts a personal email when automation should not be the only touch.",
      },
      {
        label: "Pricing model",
        competitor:
          "Flat monthly pricing: Rise at $59/mo up to $75k MRR, Surge at $159/mo up to $250k MRR.",
        dunlo:
          "Free during beta. Planned tiers start at $19/mo, with no recovered-revenue cut.",
      },
      {
        label: "Setup motion",
        competitor:
          "Connect processor credentials in under 60 seconds, then customize defaults if needed.",
        dunlo:
          "Connect Stripe, keep the product surface focused, and start monitoring without a retention-suite rollout.",
      },
    ],
    competitorUseCases: [
      "You want payment recovery plus cancellation prevention, win-back, checkout recovery, and card health.",
      "You run multiple processors or need RevenueCat recovery for mobile subscriptions.",
      "You are comfortable with a broader retention system because retention is already a multi-channel problem.",
    ],
    dunloUseCases: [
      "You are Stripe-first and failed payments are the leak you want to fix first.",
      "You prefer a focused tool over a retention platform with many flows.",
      "You want founder escalation for high-value failed payments, not only automated campaigns.",
    ],
    sourceLinks: [
      { label: "Recurflux product", href: "https://recurflux.com/" },
      {
        label: "Recurflux vs Churnkey",
        href: "https://recurflux.com/resources/guides/recurflux-vs-churnkey-2026",
      },
    ],
  },
  churnkey: {
    slug: "churnkey",
    path: "/alternatives/churnkey",
    competitorName: "Churnkey",
    metaTitle: "Dunlo vs Churnkey - Payment Recovery for Bootstrapped SaaS",
    metaDescription:
      "Compare Dunlo and Churnkey for payment recovery, cancel flows, pricing, retries, founder escalation, and the best fit by SaaS stage.",
    eyebrow: "Alternative guide",
    headline: "Dunlo vs Churnkey",
    intro:
      "Churnkey is a mature churn reduction suite with cancel flows, payment recovery, campaigns, precision retries, segmentation, and AI retention features. Dunlo is a focused Stripe recovery tool for founders who want failed payments handled before they need a full churn platform.",
    verdict:
      "Choose Churnkey when cancellation saves, A/B testing, segmentation, and omnichannel recovery are strategic retention infrastructure. Choose Dunlo when you are earlier, Stripe-first, and want failure-aware payment recovery without committing to a broader churn suite.",
    competitorSummary:
      "A full churn management platform combining cancel flows, payment recovery, precision retries, campaigns, customer timelines, and AI retention tools.",
    dunloSummary:
      "A Stripe-first failed payment recovery layer for bootstrapped teams that want focused recovery and founder follow-up.",
    comparisonRows: [
      {
        label: "Failed payment recovery",
        competitor:
          "Yes. Churnkey promotes payment recovery, precision retries, email/SMS/in-app campaigns, and payment walls.",
        dunlo:
          "Yes. Dunlo focuses on Stripe failure-code-specific emails and founder escalation.",
      },
      {
        label: "Cancellation flows",
        competitor:
          "Yes. Cancel flows, adaptive offers, segmentation, and testing are core Churnkey products.",
        dunlo: "No. Dunlo is focused on involuntary churn from payment failures.",
      },
      {
        label: "Failure-code-specific emails",
        competitor:
          "Churnkey positions around advanced retry logic and omnichannel campaigns; public pages do not present per-code email copy as the main primitive.",
        dunlo:
          "Built around Stripe failure reasons so expired cards, insufficient funds, and bank blocks get different messages.",
      },
      {
        label: "Founder escalation AI",
        competitor:
          "Churnkey has AI retention products, but not founder-reviewed personal recovery drafts as the core motion.",
        dunlo:
          "Yes. Dunlo creates founder-readable drafts for high-value failed payments.",
      },
      {
        label: "Pricing entry",
        competitor:
          "Starter is listed at $250/mo billed yearly, for teams with less than $5k/mo churn volume.",
        dunlo:
          "Free during beta. Planned tiers start at $19/mo and avoid recovered-revenue percentages.",
      },
      {
        label: "Best fit",
        competitor:
          "Teams ready for a retention platform across cancellation, recovery, segmentation, campaigns, and reporting.",
        dunlo:
          "Solo founders and small Stripe SaaS teams that want to solve failed payments before building a retention department.",
      },
    ],
    competitorUseCases: [
      "You need cancellation flows, payment recovery, segmentation, campaigns, and A/B testing in one product.",
      "Your churn volume justifies a full retention suite and annual platform spend.",
      "You want SMS, in-app, and payment-wall recovery tactics in addition to email.",
    ],
    dunloUseCases: [
      "You use Stripe and want the failed-payment leak handled first.",
      "You do not need cancel flow experiments or adaptive offers yet.",
      "You want flat, founder-friendly pricing and personal escalation for valuable accounts.",
    ],
    sourceLinks: [
      { label: "Churnkey product", href: "https://churnkey.co/" },
      { label: "Churnkey pricing", href: "https://churnkey.co/pricing" },
      {
        label: "Churnkey payment recovery docs",
        href: "https://docs.churnkey.co/failed-payment-recovery/payment-recovery",
      },
    ],
  },
  revenuecat: {
    slug: "revenuecat",
    path: "/alternatives/revenuecat",
    competitorName: "RevenueCat",
    metaTitle: "Dunlo vs RevenueCat - Stripe Web SaaS Recovery",
    metaDescription:
      "Compare Dunlo and RevenueCat for mobile subscriptions, web Stripe SaaS, failed payment recovery, pricing, analytics, and customer messaging.",
    eyebrow: "Alternative guide",
    headline: "Dunlo vs RevenueCat",
    intro:
      "RevenueCat is the standard subscription infrastructure for mobile apps, in-app purchases, paywalls, funnels, and cross-platform subscription analytics. Dunlo is for web SaaS founders running Stripe Billing who need failed payment recovery, not app-store purchase infrastructure.",
    verdict:
      "Use RevenueCat if your subscription revenue runs through iOS, Android, or app-store purchase infrastructure. Use Dunlo if your SaaS is web-first on Stripe and you need recovery emails, visibility, and founder escalation when invoices fail.",
    competitorSummary:
      "Subscription infrastructure for mobile and app businesses: SDKs, purchase backend, paywalls, funnels, analytics, and lifecycle tools.",
    dunloSummary:
      "Stripe web SaaS recovery for failed charges, failure-code-specific emails, and founder escalation.",
    comparisonRows: [
      {
        label: "Primary platform",
        competitor:
          "Mobile and app subscriptions, with SDKs and infrastructure for in-app purchases plus integrated web billing.",
        dunlo: "Web SaaS subscriptions running on Stripe.",
      },
      {
        label: "In-app purchases",
        competitor:
          "Yes. RevenueCat simplifies implementation and maintenance of in-app purchases across platforms.",
        dunlo: "No. Dunlo does not manage app-store purchases.",
      },
      {
        label: "Subscription analytics",
        competitor:
          "Yes. RevenueCat includes dashboards, reporting, events, cohorts, and lifecycle integrations.",
        dunlo:
          "Recovery analytics only: at-risk payments, recovered revenue, and escalation context.",
      },
      {
        label: "Failed payment recovery",
        competitor:
          "RevenueCat supports lifecycle and retention tools for app subscriptions, but app-store billing recovery is constrained by Apple and Google.",
        dunlo:
          "Built for Stripe failed invoices where Dunlo can send email sequences and surface founder follow-up.",
      },
      {
        label: "Failure-code-specific emails",
        competitor:
          "Not the core model. RevenueCat is subscription infrastructure rather than Stripe decline-code dunning.",
        dunlo:
          "Yes. Dunlo changes copy and timing based on the Stripe failure reason.",
      },
      {
        label: "Pricing entry",
        competitor:
          "Free up to $2,500 in monthly tracked revenue, then 1% of tracked revenue on Pro.",
        dunlo:
          "Free during beta. Planned tiers start at $19/mo for Stripe recovery.",
      },
    ],
    competitorUseCases: [
      "You sell subscriptions through iOS, Android, or app-store purchase flows.",
      "You need SDKs, paywalls, funnels, purchase validation, and subscription analytics.",
      "Your recovery problem is tied to mobile subscription lifecycle messaging.",
    ],
    dunloUseCases: [
      "You sell a web SaaS subscription through Stripe.",
      "You need direct customer emails after a Stripe invoice fails.",
      "You want founder escalation when an important Stripe customer is at risk.",
    ],
    sourceLinks: [
      {
        label: "RevenueCat pricing",
        href: "https://www.revenuecat.com/pricing/",
      },
      {
        label: "RevenueCat billing issues",
        href: "https://www.revenuecat.com/docs/subscription-guidance/how-grace-periods-work",
      },
    ],
  },
  profitwell: {
    slug: "profitwell",
    path: "/alternatives/profitwell",
    competitorName: "ProfitWell",
    metaTitle: "Dunlo vs ProfitWell - Metrics vs Stripe Recovery",
    metaDescription:
      "Compare Dunlo and ProfitWell Metrics for SaaS analytics, churn reporting, Stripe payment recovery, Paddle Retain, pricing, and setup.",
    eyebrow: "Alternative guide",
    headline: "Dunlo vs ProfitWell",
    intro:
      "ProfitWell Metrics, now part of Paddle, is a free subscription analytics product for reporting on revenue, churn, retention, and subscription performance. Dunlo is not an analytics dashboard. It is the action layer for Stripe failed payments.",
    verdict:
      "Use ProfitWell Metrics to understand your subscription numbers. Use Dunlo to reduce the failed-payment portion of churn in Stripe. For many founders, the honest answer is both: ProfitWell shows the leak, Dunlo works the recovery queue.",
    competitorSummary:
      "Free subscription analytics from Paddle for MRR, churn, retention, revenue reporting, cohorts, and subscription performance.",
    dunloSummary:
      "A Stripe payment recovery layer that turns failed invoices into targeted customer outreach and founder-reviewed follow-up.",
    comparisonRows: [
      {
        label: "Primary job",
        competitor:
          "Analytics and reporting: understand subscription revenue, churn, cohorts, and retention.",
        dunlo:
          "Recovery execution: email customers, track at-risk failed invoices, and escalate important accounts.",
      },
      {
        label: "MRR analytics",
        competitor:
          "Yes. ProfitWell Metrics is positioned as free subscription analytics for SaaS companies.",
        dunlo: "No. Dunlo is not a full subscription analytics suite.",
      },
      {
        label: "Failed payment recovery",
        competitor:
          "Not in ProfitWell Metrics itself. Paddle Retain handles failed payment recovery in the Paddle ecosystem.",
        dunlo:
          "Yes. Dunlo is built specifically for failed Stripe payment recovery.",
      },
      {
        label: "Stripe fit",
        competitor:
          "Useful as a read-side analytics layer for subscription metrics.",
        dunlo:
          "Action-side recovery layer for Stripe invoices, customer emails, and founder escalation.",
      },
      {
        label: "Pricing entry",
        competitor: "ProfitWell Metrics is free.",
        dunlo:
          "Free during beta. Planned tiers start at $19/mo because Dunlo executes recovery workflows.",
      },
      {
        label: "Best fit",
        competitor:
          "Founders who need clearer subscription metrics and reporting.",
        dunlo:
          "Founders who know failed payments are leaking revenue and want the recovery system built for them.",
      },
    ],
    competitorUseCases: [
      "You need a clean view of MRR, churn, retention, and subscription reporting.",
      "You want a free metrics product before paying for recovery tooling.",
      "You use Paddle products or want to evaluate Paddle Retain separately.",
    ],
    dunloUseCases: [
      "You already know failed Stripe payments are a problem and want to recover them.",
      "You want failure-code-specific emails rather than another dashboard.",
      "You want high-value failures surfaced for founder-level follow-up.",
    ],
    sourceLinks: [
      {
        label: "ProfitWell Metrics",
        href: "https://www.paddle.com/profitwell-metrics",
      },
      {
        label: "Paddle Retain payment recovery",
        href: "https://www.paddle.com/retain/failed-payment-recovery",
      },
      {
        label: "Paddle Retain developer docs",
        href: "https://developer.paddle.com/concepts/retain/payment-recovery-dunning",
      },
    ],
  },
  chargebee: {
    slug: "chargebee",
    path: "/alternatives/chargebee",
    competitorName: "Chargebee",
    metaTitle: "Dunlo vs Chargebee - Stripe Dunning Without Migration",
    metaDescription:
      "Compare Dunlo and Chargebee for billing infrastructure, Smart Dunning, Stripe migration, failed payment recovery, pricing, and setup.",
    eyebrow: "Alternative guide",
    headline: "Dunlo vs Chargebee",
    intro:
      "Chargebee is billing infrastructure for subscription, usage-based, hybrid, tax, invoicing, and revenue workflows. It includes dunning, but adopting Chargebee is a billing-platform decision. Dunlo is for founders who already use Stripe and want a recovery layer without migration.",
    verdict:
      "Choose Chargebee when you need billing automation beyond Stripe: invoicing, usage workflows, tax, CPQ, and dedicated billing operations. Choose Dunlo when your billing stack is already Stripe and the problem is failed payment recovery, not replacing billing infrastructure.",
    competitorSummary:
      "A complete billing automation platform with subscriptions, usage-based billing, hosted payments, taxes, invoices, revenue workflows, and Smart Dunning on higher plans.",
    dunloSummary:
      "A Stripe add-on for failed payment recovery, failure-code-specific emails, and founder escalation with no billing migration.",
    comparisonRows: [
      {
        label: "Primary job",
        competitor:
          "Billing infrastructure: subscriptions, usage-based billing, invoicing, taxes, revenue workflows, and payment operations.",
        dunlo:
          "Failed payment recovery on top of an existing Stripe setup.",
      },
      {
        label: "Dunning",
        competitor:
          "Yes. Chargebee automates dunning attempts and can send payment failure emails with retry-specific fields.",
        dunlo:
          "Yes. Dunlo focuses on Stripe failure-code-specific messaging and founder escalation.",
      },
      {
        label: "Stripe migration",
        competitor:
          "Adopting Chargebee is a billing-platform project, even when Stripe remains a gateway.",
        dunlo:
          "No migration. Dunlo is designed to sit beside Stripe and read failed payment context.",
      },
      {
        label: "Setup timeline",
        competitor:
          "Best treated as billing infrastructure rollout, especially if you need migrations, invoices, taxes, and revenue workflows.",
        dunlo:
          "Focused setup for failed payment recovery rather than a billing stack replacement.",
      },
      {
        label: "Pricing entry for Smart Dunning",
        competitor:
          "Smart Dunning is listed in the Performance plan at $7,188/yr for up to $100k billing/mo.",
        dunlo:
          "Free during beta. Planned tiers start at $19/mo for focused recovery.",
      },
      {
        label: "Best fit",
        competitor:
          "Teams with billing operations, hybrid revenue models, invoicing complexity, and migration budget.",
        dunlo:
          "Bootstrapped Stripe SaaS founders who want recovery without a billing-platform migration.",
      },
    ],
    competitorUseCases: [
      "You need a billing platform for subscriptions, usage, invoicing, tax, CPQ, or revenue workflows.",
      "You have billing operations complexity that Stripe alone no longer handles well.",
      "You want Smart Dunning as part of a broader billing automation rollout.",
    ],
    dunloUseCases: [
      "You are staying on Stripe and only need failed payment recovery.",
      "You want customer emails tailored to the Stripe failure reason.",
      "You want founder escalation for high-value failures without a billing migration.",
    ],
    sourceLinks: [
      { label: "Chargebee pricing", href: "https://www.chargebee.com/pricing/" },
      {
        label: "Chargebee dunning docs",
        href: "https://www.chargebee.com/docs/payments/2.0/dunning.html",
      },
      {
        label: "Chargebee dunning management",
        href: "https://www.chargebee.com/gb/recurring-payments/dunning-management/",
      },
    ],
  },
};

export const ALTERNATIVE_ROUTE_PAGES = Object.values(ALTERNATIVES).filter(
  (page) => page.path.startsWith("/alternatives/"),
);

export const VS_ROUTE_PAGES = Object.values(ALTERNATIVES).filter((page) =>
  page.path.startsWith("/vs/"),
);

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
