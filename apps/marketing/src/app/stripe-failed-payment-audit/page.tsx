import type { Metadata } from "next";
import { PublicBenchmark } from "@/components/public-benchmark";
import { Footer } from "@/components/landing/footer";
import { Nav } from "@/components/landing/nav";
import { breadcrumbJsonLd, pageSeoMetadata } from "@/lib/seo";

const TITLE = "Stripe Failed Payment Audit Checklist | Dunlo";
const DESCRIPTION =
  "Run a Stripe failed payment audit for SaaS: estimate failed MRR, review dunning emails, check retry timing, and find recovery gaps before payments become churn.";

const KEYWORDS = [
  "Stripe failed payment audit",
  "Stripe dunning audit",
  "failed payment recovery audit",
  "Stripe payment recovery checklist",
  "SaaS failed payment audit",
] as const;

export const metadata: Metadata = pageSeoMetadata({
  title: TITLE,
  description: DESCRIPTION,
  keywords: KEYWORDS,
  path: "/stripe-failed-payment-audit",
});

export default function StripeFailedPaymentAuditPage() {
  return (
    <>
      <Nav />
      <PublicBenchmark variant="audit" />
      <Footer />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What should a Stripe failed payment audit include?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "A Stripe failed payment audit should review failed invoice volume, decline codes, retry timing, failed payment emails, payment update links, escalation rules for high-value accounts, and recovered revenue tracking.",
                },
              },
              {
                "@type": "Question",
                name: "How often should SaaS teams audit failed payments?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Small SaaS teams should review failed payments monthly. Teams with meaningful failed MRR should review recovery performance weekly and update messages or escalation rules when decline patterns change.",
                },
              },
            ],
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
              {
                name: "Stripe Failed Payment Audit",
                path: "/stripe-failed-payment-audit",
              },
            ]),
          ),
        }}
      />
    </>
  );
}
