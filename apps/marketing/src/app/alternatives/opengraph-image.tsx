import { createDunloOgImage, ogImageSize } from "@/lib/og";

const title = "Stripe Payment Recovery Alternatives";
const description =
  "Compare Dunlo with Stripe Smart Retries, custom Stripe webhooks, FlyCode, RetryFix, Revive, Recurly Recover, and other payment recovery tools.";

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
