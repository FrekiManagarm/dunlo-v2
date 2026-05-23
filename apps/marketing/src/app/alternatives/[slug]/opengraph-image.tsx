import { notFound } from "next/navigation";
import { ALTERNATIVES } from "@/components/alternatives/alternative-page";
import { createDunloOgImage, ogImageSize } from "@/lib/og";

type AlternativeOgImageProps = {
  params: Promise<{ slug: string }>;
};

export const alt = "Dunlo alternative comparison";
export const size = ogImageSize;
export const contentType = "image/png";

export default async function Image({ params }: AlternativeOgImageProps) {
  const { slug } = await params;
  const page = ALTERNATIVES[slug];
  if (!page) notFound();

  return createDunloOgImage({
    title: page.headline,
    description: page.metaDescription,
    badge: `${page.competitorName} alternative`,
    metricLabel: "compare",
    metricValue: "vs",
  });
}
