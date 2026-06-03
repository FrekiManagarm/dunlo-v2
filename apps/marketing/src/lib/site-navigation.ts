export type SiteLink = {
  label: string;
  href: string;
};

export const HEADER_NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Benchmark", href: "/benchmark" },
  { label: "Blog", href: "/blog" },
] as const satisfies readonly SiteLink[];

export const ALTERNATIVE_LINKS = [
  { label: "Baremetrics vs Dunlo", href: "/vs/baremetrics" },
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
  {
    label: "Recurly Recover alternative",
    href: "/alternatives/recurly-recover",
  },
  { label: "Dunlo vs Slicker", href: "/alternatives/slicker" },
  {
    label: "Dunlo vs Stripe Smart Retries",
    href: "/alternatives/stripe-smart-retries",
  },
  { label: "Dunlo vs Triggla", href: "/alternatives/triggla" },
  { label: "Revaly/FlexPay alternative", href: "/alternatives/revaly-flexpay" },
  { label: "Gr4vy alternative", href: "/alternatives/gr4vy" },
] as const satisfies readonly SiteLink[];

const FOOTER_COMPARE_LINKS = [
  { label: "All alternatives", href: "/alternatives" },
  {
    label: "Stripe Smart Retries",
    href: "/alternatives/stripe-smart-retries",
  },
  {
    label: "Custom Stripe webhooks",
    href: "/alternatives/custom-stripe-webhooks",
  },
  { label: "FlyCode", href: "/alternatives/flycode" },
  { label: "Churn Buster", href: "/alternatives/churn-buster" },
] as const satisfies readonly SiteLink[];

export const FOOTER_SECTIONS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Benchmark", href: "/benchmark" },
      { label: "Stripe audit", href: "/stripe-failed-payment-audit" },
      {
        label: "State of Stripe Payments",
        href: "/state-of-stripe-payments-2026",
      },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Alternatives", href: "/alternatives" },
      { label: "Stripe failed payments", href: "/stripe-failed-payments" },
      { label: "Stripe dunning", href: "/stripe-dunning" },
      { label: "Stripe Smart Retries", href: "/alternatives/stripe-smart-retries" },
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
