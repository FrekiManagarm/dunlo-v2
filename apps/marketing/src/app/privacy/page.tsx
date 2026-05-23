import type { Metadata } from "next";
import { PrivacyPolicyPage } from "@/components/privacy-page";
import { pageSeoMetadata } from "@/lib/seo";

const TITLE = "Privacy Policy - Dunlo";
const DESCRIPTION =
  "How Dunlo collects, uses, stores, and protects account, Stripe, payment recovery, and Google sign-in data.";

const KEYWORDS = [
    "Dunlo privacy policy",
    "Dunlo data security",
    "Stripe payment recovery privacy",
    "SaaS payment recovery data",
    "Dunlo Google sign-in data",
  ] as const;

export const metadata: Metadata = pageSeoMetadata({
  title: TITLE,
  description: DESCRIPTION,
  keywords: KEYWORDS,
  path: "/privacy",
});

export default function Page() {
  return <PrivacyPolicyPage />;
}
