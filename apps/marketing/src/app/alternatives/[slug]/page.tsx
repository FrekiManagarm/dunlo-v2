import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ALTERNATIVES,
  ALTERNATIVE_ROUTE_PAGES,
  AlternativePage,
} from "@/components/alternatives/alternative-page";
import { SITE_URL, breadcrumbJsonLd, pageSeoMetadata } from "@/lib/seo";

type AlternativeRouteProps = {
  params: Promise<{ slug: string }>;
};

const KEYWORDS: Record<string, string[]> = {
  "stripe-smart-retries": [
    "Stripe Smart Retries alternative",
    "Dunlo vs Stripe Smart Retries",
    "Stripe failed payment recovery",
    "Stripe dunning software",
    "SaaS payment recovery workflow",
  ],
  "paddle-retain": [
    "Paddle Retain alternative",
    "Dunlo vs Paddle Retain",
    "Stripe payment recovery for Paddle alternatives",
    "involuntary churn software comparison",
    "SaaS payment recovery comparison",
  ],
  "churn-buster": [
    "Churn Buster alternative",
    "Dunlo vs Churn Buster",
    "Stripe payment recovery alternative",
    "SaaS dunning software comparison",
    "failed payment recovery for SaaS",
  ],
  slicker: [
    "Slicker alternative",
    "Dunlo vs Slicker",
    "Slicker payment recovery alternative",
    "payment recovery for small SaaS",
    "AI retry engine alternative",
  ],
  triggla: [
    "Triggla alternative",
    "Dunlo vs Triggla",
    "Stripe churn recovery comparison",
    "failed payment recovery comparison",
    "SaaS dunning tool alternative",
  ],
  recurflux: [
    "Recurflux alternative",
    "Dunlo vs Recurflux",
    "Recurflux pricing",
    "focused Stripe recovery alternative",
    "SaaS churn prevention alternative",
  ],
  churnkey: [
    "Churnkey alternative",
    "Dunlo vs Churnkey",
    "Churnkey pricing",
    "Churnkey too expensive",
    "payment recovery for bootstrapped SaaS",
  ],
  revenuecat: [
    "RevenueCat Stripe alternative",
    "Dunlo vs RevenueCat",
    "RevenueCat web SaaS",
    "RevenueCat failed payment recovery",
    "Stripe recovery for web SaaS",
  ],
  profitwell: [
    "ProfitWell alternative",
    "Dunlo vs ProfitWell",
    "ProfitWell Stripe recovery",
    "ProfitWell Metrics alternative",
    "Stripe payment recovery analytics",
  ],
  chargebee: [
    "Chargebee alternative Stripe",
    "Dunlo vs Chargebee",
    "Chargebee too expensive",
    "Chargebee vs Stripe dunning",
    "Stripe dunning without migration",
  ],
  flycode: [
    "FlyCode alternative",
    "Dunlo vs FlyCode",
    "FlyCode Stripe recovery",
    "failed payment recovery comparison",
    "Stripe payment recovery tool",
  ],
  "custom-stripe-webhooks": [
    "Stripe webhooks failed payment recovery",
    "invoice.payment_failed webhook",
    "Dunlo vs custom Stripe webhooks",
    "build Stripe dunning workflow",
    "Stripe dunning build vs buy",
  ],
  "loops-dunning": [
    "Loops dunning",
    "Loops Stripe failed payment emails",
    "Dunlo vs Loops",
    "Stripe dunning emails",
    "transactional email dunning",
  ],
  retryfix: [
    "RetryFix alternative",
    "Dunlo vs RetryFix",
    "RetryFix Stripe",
    "failed Stripe payment recovery",
    "payment recovery pricing",
  ],
  revive: [
    "Revive alternative",
    "Dunlo vs Revive",
    "Revive failed payment recovery",
    "Stripe payment recovery alternative",
    "failed payment recovery for SaaS",
  ],
  "recurly-recover": [
    "Recurly Recover alternative",
    "Dunlo vs Recurly Recover",
    "Recurly dunning alternative",
    "Stripe recovery without Recurly",
    "subscription dunning comparison",
  ],
  "revaly-flexpay": [
    "Revaly alternative",
    "FlexPay alternative",
    "Dunlo vs Revaly",
    "payment performance management alternative",
    "failed payment recovery comparison",
  ],
  gr4vy: [
    "Gr4vy alternative",
    "Dunlo vs Gr4vy",
    "payment orchestration alternative",
    "Stripe recovery without orchestration",
    "failed payment recovery for Stripe SaaS",
  ],
};

export function generateStaticParams() {
  return ALTERNATIVE_ROUTE_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: AlternativeRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const page = ALTERNATIVES[slug];
  if (!page || !page.path.startsWith("/alternatives/")) return {};

  return pageSeoMetadata({
    title: page.metaTitle,
    description: page.metaDescription,
    keywords: KEYWORDS[slug] ?? [],
    path: page.path,
  });
}

export default async function AlternativeDetailPage({
  params,
}: AlternativeRouteProps) {
  const { slug } = await params;
  const page = ALTERNATIVES[slug];
  if (!page || !page.path.startsWith("/alternatives/")) notFound();

  return (
    <>
      <AlternativePage page={page} />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: page.metaTitle,
            description: page.metaDescription,
            url: `${SITE_URL}${page.path}`,
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
              { name: page.headline, path: page.path },
            ]),
          ),
        }}
      />
    </>
  );
}
