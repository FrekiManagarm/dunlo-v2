import { createDunloOgImage, ogImageSize } from "@/lib/og";

const title = "Stripe Payment Recovery Blog";
const description =
  "Practical guides for SaaS teams to recover failed payments, reduce involuntary churn, and improve dunning workflows.";

export const alt = title;
export const size = ogImageSize;
export const contentType = "image/png";

export default function Image() {
  return createDunloOgImage({
    title,
    description,
    badge: "Dunlo blog",
  });
}
