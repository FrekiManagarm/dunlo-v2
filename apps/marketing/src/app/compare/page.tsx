import type { Metadata } from "next";
import { CompareIndex } from "@/components/compare-index";
import { COMPARE_ROUTE_PAGES } from "@/components/compare/compare-page";
import {
  SITE_NAME,
  absoluteUrl,
  breadcrumbJsonLd,
  pageSeoMetadata,
} from "@/lib/seo";

const TITLE = "Payment Recovery Tool Comparisons - Dunlo";
const DESCRIPTION =
  "Neutral head-to-head comparisons between payment recovery, dunning, and billing tools — Churn Buster, Churnkey, Chargebee, Stripe, and more.";
const PATH = "/compare";

const KEYWORDS = [
  "Churn Buster vs Churnkey",
  "Churn Buster vs Chargebee",
  "Chargebee vs Stripe",
  "payment recovery comparison",
  "dunning software comparison",
] as const;

export const metadata: Metadata = pageSeoMetadata({
  title: TITLE,
  description: DESCRIPTION,
  keywords: KEYWORDS,
  path: PATH,
});

export default function ComparePage() {
  return (
    <>
      <CompareIndex />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: TITLE,
            description: DESCRIPTION,
            url: absoluteUrl(PATH),
            publisher: {
              "@type": "Organization",
              name: SITE_NAME,
            },
            mainEntity: {
              "@type": "ItemList",
              itemListElement: COMPARE_ROUTE_PAGES.map((page, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: page.headline,
                url: absoluteUrl(page.path),
              })),
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
              { name: "Compare", path: PATH },
            ]),
          ),
        }}
      />
    </>
  );
}
