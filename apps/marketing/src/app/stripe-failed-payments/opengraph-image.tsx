import { createDunloOgImage, ogImageSize } from "@/lib/og";

const title = "Stripe Failed Payments: Recover SaaS Revenue";
const description =
  "Recover failed payments with failure-code emails, smart retry timing, founder escalation, and revenue tracking.";

export const alt = title;
export const size = ogImageSize;
export const contentType = "image/png";

export default function Image() {
  return createDunloOgImage({
    title,
    description,
    badge: "Stripe payment recovery",
    metricLabel: "failure",
    metricValue: "code",
  });
}
