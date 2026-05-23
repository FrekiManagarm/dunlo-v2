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
    question: "What is involuntary churn?",
    answer:
      "It is churn caused by payment failure rather than a customer choosing to cancel. A good customer can disappear because their card expired, their bank declined a charge, or they missed a payment update email.",
  },
  {
    question: "How is Dunlo different from Stripe Smart Retries?",
    answer:
      "Stripe Smart Retries can keep retrying the card. Dunlo handles the customer communication around the failure: why it happened, what message to send, when to follow up, and when a founder should step in.",
  },
  {
    question: "How is Dunlo different from Triggla or Churn Buster?",
    answer:
      "Dunlo does one thing well: Stripe payment recovery. No lifecycle suite, no recovered-revenue cut, no enterprise pricing. If you're a founder with $5k-$80k MRR who loses customers to silent payment failures, Dunlo is built for exactly that.",
  },
  {
    question: "What is the AI escalation feature exactly?",
    answer:
      "When a failed payment crosses your threshold, Dunlo pauses automation and drafts a short personal email from the founder with Stripe context and account value. You can review, regenerate, dismiss, or send it.",
  },
  {
    question: "Is my Stripe data safe?",
    answer:
      "Dunlo uses Stripe data to understand failed-payment context and recovery status. It does not store full card numbers or CVCs, and payment updates happen through Stripe-hosted flows.",
  },
  {
    question: "How much setup is involved?",
    answer:
      "Connect Stripe, review the default sequences, and add your email provider. The baseline setup does not require an engineering team.",
  },
  {
    question: "What happens during beta?",
    answer:
      "The product is free during beta. Pricing is visible now so you know the direction before Dunlo starts billing.",
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
            description:
              "Stripe payment recovery SaaS that reads failed-payment reasons, sends failure-code-specific recovery emails, and drafts founder escalation emails for high-value accounts.",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "EUR",
              description: "Free during beta",
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
