import type { Metadata } from "next";
import { TermsPage } from "@/components/terms-page";

const TITLE = "Terms of Service - Dunlo";
const DESCRIPTION =
  "The terms that apply when using Dunlo's Stripe payment recovery service.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "Dunlo terms of service",
    "Dunlo service terms",
    "Stripe payment recovery terms",
    "SaaS payment recovery terms",
    "Dunlo beta terms",
  ],
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/terms",
  },
};

export default function Page() {
  return <TermsPage />;
}
