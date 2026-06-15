import { createDunloOgImage, ogImageSize } from "@/lib/og";

export const alt =
  "Dunlo Product Hunt launch preview for failed Stripe payment recovery";
export const size = ogImageSize;
export const contentType = "image/png";

export default function Image() {
  return createDunloOgImage({
    title: "Dunlo recovers failed Stripe payments before they become churn",
    description:
      "Failure-aware emails, smarter retry timing, founder review, and recovered revenue tracking for Stripe-first SaaS teams.",
    badge: "Launching on Product Hunt",
    metricLabel: "at risk today",
    metricValue: "$2.8k",
  });
}
