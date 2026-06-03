import { createDunloOgImage, ogImageSize } from "@/lib/og";

const title = "Stripe Failed Payment Audit";
const description =
  "Estimate failed MRR, recovery potential, and the Stripe dunning checks that usually reveal hidden churn.";

export const alt = title;
export const size = ogImageSize;
export const contentType = "image/png";

export default function Image() {
  return createDunloOgImage({
    title,
    description,
    badge: "Free audit",
    metricLabel: "checks",
    metricValue: "6",
  });
}
