import { createDunloOgImage, ogImageSize } from "@/lib/og";

const title = "Stripe Failed Payment Email Templates";
const description =
  "Copy-ready failed payment emails for expired cards, insufficient funds, bank declines, and authentication failures.";

export const alt = title;
export const size = ogImageSize;
export const contentType = "image/png";

export default function Image() {
  return createDunloOgImage({
    title,
    description,
    badge: "Dunning email templates",
    metricLabel: "failure",
    metricValue: "email",
  });
}
