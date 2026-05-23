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
  "Compare Dunlo with Churn Buster, Paddle Retain, Slicker, Stripe Smart Retries, and Triggla for Stripe failed payment recovery.";

const KEYWORDS = [
    "Stripe payment recovery alternatives",
    "dunning software alternatives",
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
