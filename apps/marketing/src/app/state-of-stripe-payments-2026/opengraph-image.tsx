import { createDunloOgImage, ogImageSize } from "@/lib/og";

const title = "State of Stripe Failed Payments 2026";
const description =
  "A living benchmark for SaaS founders tracking failed payments, decline codes, and recovery opportunities across Stripe.";

export const alt = title;
export const size = ogImageSize;
export const contentType = "image/png";

export default function Image() {
  return createDunloOgImage({
    title,
    description,
    badge: "Public report",
  });
}
