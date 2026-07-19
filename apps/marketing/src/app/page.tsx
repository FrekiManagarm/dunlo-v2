import type { Metadata } from "next";
import { LandingPage } from "@/components/landing-page";
import { FAQ_ITEMS } from "@/components/landing/landing-content";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_TITLE,
  SITE_NAME,
  SITE_URL,
  pageSeoMetadata,
} from "@/lib/seo";

export const metadata: Metadata = pageSeoMetadata({
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  path: "/",
});

export default function Page() {
  return (
    <>
      <LandingPage />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Dunlo",
            applicationCategory: "BusinessApplication",
            applicationSubCategory:
              "Stripe failed-payment diagnostic and recovery",
            description: DEFAULT_DESCRIPTION,
            featureList: [
              "Read-only Stripe payment diagnostic",
              "Recurring MRR-at-risk analysis with coverage and exclusions",
              "Explicit read-only monitoring",
              "Optional recovery after separate consent and confirmation",
              "Founder review for sensitive accounts",
            ],
            audience: {
              "@type": "Audience",
              audienceType: "Stripe-first SaaS founders",
            },
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "EUR",
              description: "Free until beta ends on July 31, 2026",
            },
            provider: {
              "@type": "Organization",
              name: SITE_NAME,
              url: SITE_URL,
            },
            url: SITE_URL,
          }),
        }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ_ITEMS.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
              },
            })),
          }),
        }}
      />
    </>
  );
}
