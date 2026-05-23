import type { Metadata } from "next";
import { TermsPage } from "@/components/terms-page";
import { pageSeoMetadata } from "@/lib/seo";

const TITLE = "Terms of Service - Dunlo";
const DESCRIPTION =
  "The terms that apply when using Dunlo's Stripe payment recovery service.";

const KEYWORDS = [
    "Dunlo terms of service",
    "Dunlo service terms",
    "Stripe payment recovery terms",
    "SaaS payment recovery terms",
    "Dunlo beta terms",
  ] as const;

export const metadata: Metadata = pageSeoMetadata({
  title: TITLE,
  description: DESCRIPTION,
  keywords: KEYWORDS,
  path: "/terms",
});

export default function Page() {
  return <TermsPage />;
}
