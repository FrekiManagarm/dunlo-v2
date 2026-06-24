import { createDunloOgImage, ogImageSize } from "@/lib/og";

const title = "Stripe Failed Payment Recovery Software";
const description =
  "Recover failed payments with failure-code emails, secure update links, founder escalation, and recovered revenue tracking.";

export const alt = title;
export const size = ogImageSize;
export const contentType = "image/png";

export default function Image() {
  return createDunloOgImage({
    title,
    description,
    badge: "Recovery software",
    metricLabel: "Stripe",
    metricValue: "SaaS",
  });
}
