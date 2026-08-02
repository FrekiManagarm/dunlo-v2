import { createDunloOgImage, ogImageSize } from "@/lib/og";

const title = "Payment Recovery Tool Comparisons";
const description =
  "Neutral head-to-head comparisons between payment recovery, dunning, and billing tools.";

export const alt = title;
export const size = ogImageSize;
export const contentType = "image/png";

export default function Image() {
  return createDunloOgImage({
    title,
    description,
    badge: "Comparison guide",
  });
}
