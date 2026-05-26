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
