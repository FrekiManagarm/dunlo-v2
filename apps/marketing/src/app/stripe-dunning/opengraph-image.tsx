import { createDunloOgImage, ogImageSize } from "@/lib/og";

const title = "Stripe Dunning for SaaS";
const description =
  "Build a Stripe dunning workflow with failure-specific emails, smarter retries, founder escalation, and recovered revenue tracking.";

export const alt = title;
export const size = ogImageSize;
export const contentType = "image/png";

export default function Image() {
  return createDunloOgImage({
    title,
    description,
    badge: "Dunning workflow",
  });
}
