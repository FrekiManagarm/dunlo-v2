import { createDunloOgImage, ogImageSize } from "@/lib/og";

const title = "Stripe Payment Recovery Alternatives";
const description =
  "Compare Dunlo with Churn Buster, Paddle Retain, Slicker, Stripe Smart Retries, and Triggla for Stripe failed payment recovery.";

export const alt = title;
export const size = ogImageSize;
export const contentType = "image/png";

export default function Image() {
  return createDunloOgImage({
    title,
    description,
    badge: "Comparison guide",
    metricLabel: "tools",
    metricValue: "5",
  });
}
