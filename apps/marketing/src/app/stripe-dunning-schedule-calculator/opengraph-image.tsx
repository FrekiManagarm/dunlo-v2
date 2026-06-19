import { createDunloOgImage, ogImageSize } from "@/lib/og";

const title = "Stripe Dunning Schedule Calculator";
const description =
  "Plan failed-payment emails, retry windows, founder escalation, and final notices from the Stripe failure reason.";

export const alt = title;
export const size = ogImageSize;
export const contentType = "image/png";

export default function Image() {
  return createDunloOgImage({
    title,
    description,
    badge: "Free calculator",
    metricLabel: "Schedule",
    metricValue: "14d",
  });
}
