import { createDunloOgImage, ogImageSize } from "@/lib/og";

const title = "Terms of Service";
const description =
  "The terms that apply when using Dunlo's Stripe payment recovery service.";

export const alt = "Dunlo Terms of Service";
export const size = ogImageSize;
export const contentType = "image/png";

export default function Image() {
  return createDunloOgImage({
    title,
    description,
    badge: "Dunlo legal",
  });
}
