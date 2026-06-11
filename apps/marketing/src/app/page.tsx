import type { Metadata } from "next";
import { LandingPage } from "@/components/landing-page";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_TITLE,
  SITE_NAME,
  SITE_URL,
  pageSeoMetadata,
} from "@/lib/seo";

const FAQ_JSON_LD = [
  {
    question: "Is this just Stripe Smart Retries with nicer emails?",
    answer:
      "No. Stripe can retry cards. Dunlo handles the customer-facing recovery layer around Stripe: message, timing, founder escalation, and recovered-revenue reporting.",
  },
  {
    question: "Will customers know an automation sent the email?",
    answer:
      "The copy is plain, specific, and tied to the payment reason. High-value or sensitive accounts can be paused for a founder note before anything goes out.",
  },
  {
    question: "Do I pay during beta?",
    answer:
      "No. Dunlo is free during beta. The public pricing direction exists so founders know what happens after the beta period.",
  },
  {
    question: "Does Dunlo store card numbers?",
    answer:
      "No. Card updates happen through Stripe-hosted flows. Dunlo uses payment and subscription context, not full card numbers or CVC data.",
  },
] as const;

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
            applicationSubCategory: "Stripe payment recovery",
            description: DEFAULT_DESCRIPTION,
            featureList: [
              "Stripe failure-code detection",
              "Failure-aware recovery emails",
              "Stripe-hosted payment update links",
              "Founder review for risky accounts",
              "Recovered revenue tracking",
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
            mainEntity: FAQ_JSON_LD.map((item) => ({
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
