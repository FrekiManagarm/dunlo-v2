import type { Metadata } from "next";
import { Footer } from "@/components/landing/footer";
import { Nav } from "@/components/landing/nav";
import { PublicBenchmark } from "@/components/public-benchmark";
import {
  SITE_NAME,
  absoluteUrl,
  breadcrumbJsonLd,
  pageSeoMetadata,
} from "@/lib/seo";

const TITLE = "Involuntary Churn Calculator for SaaS | Dunlo";
const DESCRIPTION =
  "Estimate involuntary churn from failed payments, MRR at risk, and recoverable revenue before Stripe payment failures become lost SaaS customers.";
const PATH = "/involuntary-churn-calculator";
const KEYWORDS = [
  "involuntary churn calculator",
  "SaaS involuntary churn calculator",
  "involuntary churn rate calculator",
  "failed payment churn calculator",
  "MRR at risk calculator",
  "Stripe involuntary churn",
] as const;

const FAQS = [
  {
    question: "How do you calculate involuntary churn from failed payments?",
    answer:
      "Estimate the MRR attached to failed invoices, subtract the portion recovered during the dunning window, and treat only the unresolved amount as involuntary churn once access or the subscription is finally cancelled.",
  },
  {
    question: "Is every failed payment involuntary churn?",
    answer:
      "No. A failed payment is revenue at risk first. It becomes involuntary churn only when the recovery window ends and the customer loses access or the subscription is cancelled because payment was not collected.",
  },
  {
    question: "What should SaaS teams do after estimating involuntary churn?",
    answer:
      "Separate failed MRR, recovered MRR, unresolved delinquency, and final churn in reporting. Then improve recovery emails, retry timing, Stripe-hosted update links, and escalation for high-value accounts.",
  },
] as const;

export const metadata: Metadata = pageSeoMetadata({
  title: TITLE,
  description: DESCRIPTION,
  keywords: KEYWORDS,
  path: PATH,
});

export default function InvoluntaryChurnCalculatorPage() {
  return (
    <>
      <Nav />
      <PublicBenchmark variant="involuntary-churn" />
      <Footer />
      <JsonLd />
    </>
  );
}

function JsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: TITLE,
            description: DESCRIPTION,
            url: absoluteUrl(PATH),
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            publisher: {
              "@type": "Organization",
              name: SITE_NAME,
            },
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
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
              { name: "Involuntary churn calculator", path: PATH },
            ]),
          ),
        }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }),
        }}
      />
    </>
  );
}
