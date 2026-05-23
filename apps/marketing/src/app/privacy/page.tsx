import type { Metadata } from "next";
import { PrivacyPolicyPage } from "@/components/privacy-page";

const TITLE = "Privacy Policy - Dunlo";
const DESCRIPTION =
  "How Dunlo collects, uses, stores, and protects account, Stripe, payment recovery, and Google sign-in data.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "Dunlo privacy policy",
    "Dunlo data security",
    "Stripe payment recovery privacy",
    "SaaS payment recovery data",
    "Dunlo Google sign-in data",
  ],
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/privacy",
  },
};

export default function Page() {
  return <PrivacyPolicyPage />;
}
