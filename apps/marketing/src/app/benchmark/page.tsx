import type { Metadata } from "next";
import { PublicBenchmark } from "@/components/public-benchmark";
import { Footer } from "@/components/landing/footer";
import { Nav } from "@/components/landing/nav";
import { breadcrumbJsonLd, pageSeoMetadata } from "@/lib/seo";

const TITLE = "Stripe Failed Payment Benchmark Calculator | Dunlo";
const DESCRIPTION =
  "Use Dunlo's Stripe failed payment benchmark calculator to estimate failed payment rate, MRR at risk, and recovery potential before connecting your account.";
const KEYWORDS = [
  "Stripe failed payment benchmark",
  "failed payment rate calculator",
  "SaaS failed payment rate",
  "MRR at risk calculator",
  "Stripe payment recovery benchmark",
] as const;

export const metadata: Metadata = pageSeoMetadata({
  title: TITLE,
  description: DESCRIPTION,
  keywords: KEYWORDS,
  path: "/benchmark",
});

export default function BenchmarkPage() {
  return (
    <>
      <Nav />
      <PublicBenchmark />
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
                name: "What is a normal Stripe failed payment rate for SaaS?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Early SaaS teams often see failed payment rates around the low-to-mid single digits. The exact rate depends on customer mix, billing interval, geography, card age, and how Stripe retries are configured.",
                },
              },
              {
                "@type": "Question",
                name: "What should I do after estimating failed MRR?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Review the Stripe decline reasons behind failed invoices, separate recoverable failures from hard declines, check whether customer emails are sent at the right time, and track recovered revenue by failure type.",
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
              { name: "Stripe Failed Payment Benchmark", path: "/benchmark" },
            ]),
          ),
        }}
      />
    </>
  );
}
