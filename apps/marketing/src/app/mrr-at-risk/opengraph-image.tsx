import { createDunloOgImage, ogImageSize } from "@/lib/og";

const title = "MRR at Risk";
const description =
  "Calculate failed SaaS revenue before Stripe payment failures become involuntary churn.";

export const alt = title;
export const size = ogImageSize;
export const contentType = "image/png";

export default function Image() {
  return createDunloOgImage({
    title,
    description,
    badge: "Payment recovery metric",
    metricLabel: "MRR",
    metricValue: "risk",
  });
}
