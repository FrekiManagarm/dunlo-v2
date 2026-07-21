import { createDunloOgImage, ogImageSize } from "@/lib/og";

const title = "Privacy Policy";
const description =
  "How Dunlo collects, uses, stores, and protects account, Stripe, payment recovery, and Google sign-in data.";

export const alt = "Dunlo Privacy Policy";
export const size = ogImageSize;
export const contentType = "image/png";

export default function Image() {
  return createDunloOgImage({
    title,
    description,
    badge: "Dunlo legal",
  });
}
