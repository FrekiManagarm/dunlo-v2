import { createDunloOgImage, ogImageSize } from "@/lib/og";

const title = "Stripe Decline Codes";
const description =
  "Decode Stripe decline codes and choose the right failed-payment email, retry timing, and customer recovery path.";

export const alt = title;
export const size = ogImageSize;
export const contentType = "image/png";

export default function Image() {
  return createDunloOgImage({
    title,
    description,
    badge: "Recovery guide",
    metricLabel: "codes",
    metricValue: "8",
  });
}
