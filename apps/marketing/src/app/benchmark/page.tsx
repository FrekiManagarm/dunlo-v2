import type { Metadata } from "next";
import { PublicBenchmark } from "@/components/public-benchmark";
import { Footer } from "@/components/landing/footer";
import { Nav } from "@/components/landing/nav";
import { breadcrumbJsonLd, pageSeoMetadata } from "@/lib/seo";

const TITLE = "Stripe Failed Payment Benchmark - Dunlo";
const DESCRIPTION =
  "Use Dunlo's Stripe failed payment benchmark to estimate failed payment rate, MRR at risk, and recovery potential before connecting your account.";
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
