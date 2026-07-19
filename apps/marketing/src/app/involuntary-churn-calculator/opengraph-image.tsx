import { createDunloOgImage, ogImageSize } from "@/lib/og";

const title = "Involuntary Churn Calculator";
const description =
  "Estimate failed-payment churn, MRR at risk, and recoverable SaaS revenue before customers disappear.";

export const alt = title;
export const size = ogImageSize;
export const contentType = "image/png";

export default function Image() {
  return createDunloOgImage({
    title,
    description,
    badge: "SaaS churn calculator",
  });
}
