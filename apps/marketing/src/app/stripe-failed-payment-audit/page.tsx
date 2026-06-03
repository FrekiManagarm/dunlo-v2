import type { Metadata } from "next";
import { PublicBenchmark } from "@/components/public-benchmark";
import { Footer } from "@/components/landing/footer";
import { Nav } from "@/components/landing/nav";
import { breadcrumbJsonLd, pageSeoMetadata } from "@/lib/seo";

const TITLE = "Stripe Failed Payment Audit - Dunlo";
const DESCRIPTION =
  "Run a lightweight Stripe failed payment audit for SaaS: estimate failed MRR, recovery potential, and the checks to review before failed payments become churn.";

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
