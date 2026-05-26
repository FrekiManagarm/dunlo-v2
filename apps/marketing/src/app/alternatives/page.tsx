import type { Metadata } from "next";
import { AlternativesIndex } from "@/components/alternatives-index";
import {
  breadcrumbJsonLd,
  absoluteUrl,
  SITE_NAME,
  pageSeoMetadata,
} from "@/lib/seo";

const TITLE = "Stripe Payment Recovery Alternatives - Dunlo";
const DESCRIPTION =
  "Compare Dunlo with Baremetrics, Recurflux, Churnkey, RevenueCat, ProfitWell, Chargebee, and other recovery tools for Stripe failed payment recovery.";

const KEYWORDS = [
  "Stripe payment recovery alternatives",
  "dunning software alternatives",
  "Baremetrics alternative",
  "Recurflux alternative",
  "Churnkey alternative",
  "RevenueCat Stripe alternative",
  "ProfitWell alternative",
  "Chargebee alternative Stripe",
  "Churn Buster alternative",
  "Paddle Retain alternative",
  "Stripe Smart Retries alternative",
  "Triggla alternative",
] as const;

export const metadata: Metadata = pageSeoMetadata({
  title: TITLE,
  description: DESCRIPTION,
  keywords: KEYWORDS,
  path: "/alternatives",
});

export default function AlternativesPage() {
  return (
    <>
      <AlternativesIndex />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: TITLE,
            description: DESCRIPTION,
            url: absoluteUrl("/alternatives"),
            publisher: {
              "@type": "Organization",
              name: SITE_NAME,
            },
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
              { name: "Alternatives", path: "/alternatives" },
            ]),
          ),
        }}
      />
    </>
  );
}
