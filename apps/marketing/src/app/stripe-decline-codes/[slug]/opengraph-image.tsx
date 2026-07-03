import { notFound } from "next/navigation";
import { createDunloOgImage, ogImageSize } from "@/lib/og";
import {
  STRIPE_DECLINE_CODE_GUIDES,
  STRIPE_DECLINE_CODE_GUIDES_BY_SLUG,
} from "@/lib/stripe-decline-codes";

type StripeDeclineCodeOgImageProps = {
  params: Promise<{ slug: string }>;
};

export const alt = "Stripe decline code recovery guide";
export const size = ogImageSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return STRIPE_DECLINE_CODE_GUIDES.map((guide) => ({ slug: guide.slug }));
}

export default async function Image({
  params,
}: StripeDeclineCodeOgImageProps) {
  const { slug } = await params;
  const guide = STRIPE_DECLINE_CODE_GUIDES_BY_SLUG[slug];
  if (!guide) notFound();

  return createDunloOgImage({
    title: guide.title,
    description: guide.metaDescription,
    badge: "Stripe decline code",
    metricLabel: "code",
    metricValue: guide.code,
  });
}
