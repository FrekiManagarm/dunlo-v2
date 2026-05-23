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
  { label: "Dunlo vs Churn Buster", href: "/alternatives/churn-buster" },
  { label: "Dunlo vs Paddle Retain", href: "/alternatives/paddle-retain" },
  { label: "Dunlo vs Slicker", href: "/alternatives/slicker" },
  {
    label: "Dunlo vs Stripe Smart Retries",
    href: "/alternatives/stripe-smart-retries",
  },
  { label: "Dunlo vs Triggla", href: "/alternatives/triggla" },
] as const satisfies readonly SiteLink[];

export const FOOTER_SECTIONS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Benchmark", href: "/benchmark" },
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
      { label: "Stripe Smart Retries", href: "/alternatives/stripe-smart-retries" },
    ],
  },
  {
    title: "Compare",
    links: ALTERNATIVE_LINKS,
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
