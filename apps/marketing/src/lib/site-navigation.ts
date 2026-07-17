export type SiteLink = {
  label: string;
  href: string;
};

export const HEADER_NAV_LINKS = [
  { label: "Product", href: "/#how-it-works" },
  { label: "Trust", href: "/#trust" },
  { label: "Pricing", href: "/#pricing" },
] as const satisfies readonly SiteLink[];

export const ALTERNATIVE_LINKS = [
  { label: "Baremetrics vs Dunlo", href: "/vs/baremetrics" },
  {
    label: "Stripe customer emails",
    href: "/alternatives/stripe-customer-emails",
  },
  { label: "Dunlo vs Recurflux", href: "/alternatives/recurflux" },
  { label: "Dunlo vs Churnkey", href: "/alternatives/churnkey" },
  { label: "Dunlo vs Churn Buster", href: "/alternatives/churn-buster" },
  { label: "Dunlo vs Paddle Retain", href: "/alternatives/paddle-retain" },
  { label: "Dunlo vs ProfitWell", href: "/alternatives/profitwell" },
  { label: "Dunlo vs RevenueCat", href: "/alternatives/revenuecat" },
  { label: "Dunlo vs Chargebee", href: "/alternatives/chargebee" },
  { label: "Dunlo vs FlyCode", href: "/alternatives/flycode" },
  {
    label: "Dunlo vs custom Stripe webhooks",
    href: "/alternatives/custom-stripe-webhooks",
  },
  { label: "Loops for dunning", href: "/alternatives/loops-dunning" },
  { label: "RetryFix alternative", href: "/alternatives/retryfix" },
  { label: "Revive alternative", href: "/alternatives/revive" },
  { label: "Stunning alternative", href: "/alternatives/stunning" },
  { label: "RecoverIQ alternative", href: "/alternatives/recoveriq" },
  {
    label: "Recurly Recover alternative",
    href: "/alternatives/recurly-recover",
  },
  { label: "Dunlo vs Slicker", href: "/alternatives/slicker" },
  {
    label: "Dunlo vs Stripe Smart Retries",
    href: "/stripe-smart-retries-alternative",
  },
  { label: "Dunlo vs Triggla", href: "/alternatives/triggla" },
  { label: "Revaly/FlexPay alternative", href: "/alternatives/revaly-flexpay" },
  { label: "Gr4vy alternative", href: "/alternatives/gr4vy" },
] as const satisfies readonly SiteLink[];

const FOOTER_COMPARE_LINKS = [
  { label: "All alternatives", href: "/alternatives" },
  {
    label: "Stripe Smart Retries",
    href: "/stripe-smart-retries-alternative",
  },
  {
    label: "Churn Buster vs Churnkey",
    href: "/compare/churn-buster-vs-churnkey",
  },
  {
    label: "Churn Buster vs Chargebee",
    href: "/compare/churn-buster-vs-chargebee",
  },
  {
    label: "Chargebee vs Stripe",
    href: "/compare/chargebee-vs-stripe",
  },
] as const satisfies readonly SiteLink[];

export const FOOTER_SECTIONS = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Pricing", href: "/#pricing" },
      {
        label: "Recovery software",
        href: "/stripe-failed-payment-recovery-software",
      },
      { label: "Benchmark", href: "/benchmark" },
      { label: "MRR at risk", href: "/mrr-at-risk" },
      { label: "Stripe audit", href: "/stripe-failed-payment-audit" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Alternatives", href: "/alternatives" },
      { label: "Stripe failed payments", href: "/stripe-failed-payments" },
      { label: "Stripe decline codes", href: "/stripe-decline-codes" },
      {
        label: "Failed payment emails",
        href: "/stripe-failed-payment-email-templates",
      },
      {
        label: "Involuntary churn calculator",
        href: "/involuntary-churn-calculator",
      },
      { label: "Stripe dunning", href: "/stripe-dunning" },
      {
        label: "Dunning calculator",
        href: "/stripe-dunning-schedule-calculator",
      },
    ],
  },
  {
    title: "Compare",
    links: FOOTER_COMPARE_LINKS,
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
] as const satisfies readonly {
  title: string;
  links: readonly SiteLink[];
}[];
