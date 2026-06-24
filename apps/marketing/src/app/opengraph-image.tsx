import { createDunloOgImage, ogImageSize } from "@/lib/og";
import { DEFAULT_DESCRIPTION } from "@/lib/seo";

export const alt = "Dunlo - Stripe payment recovery for SaaS";
export const size = ogImageSize;
export const contentType = "image/png";

export default function Image() {
  return createDunloOgImage({
    title: "Recover failed payments before they quietly churn",
    description: DEFAULT_DESCRIPTION,
    badge: "Free in beta",
    metricLabel: "at risk today",
    metricValue: "$2.8k",
  });
}
