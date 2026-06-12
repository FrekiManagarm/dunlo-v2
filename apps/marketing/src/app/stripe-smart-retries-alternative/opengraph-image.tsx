import { createDunloOgImage, ogImageSize } from "@/lib/og";

const title = "Stripe Smart Retries Alternative for SaaS";
const description =
  "Compare native retry timing with failed-payment emails, founder escalation, and recovery tracking around Stripe.";

export const alt = title;
export const size = ogImageSize;
export const contentType = "image/png";

export default function Image() {
  return createDunloOgImage({
    title,
    description,
    badge: "Smart Retries alternative",
    metricLabel: "recovery",
    metricValue: "layer",
  });
}
