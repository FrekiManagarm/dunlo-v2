import { notFound } from "next/navigation";
import {
  ALTERNATIVES,
  VS_ROUTE_PAGES,
} from "@/components/alternatives/alternative-page";
import { createDunloOgImage, ogImageSize } from "@/lib/og";

type VsOgImageProps = {
  params: Promise<{ slug: string }>;
};

export const alt = "Dunlo comparison";
export const size = ogImageSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return VS_ROUTE_PAGES.map((page) => ({ slug: page.slug }));
}

export default async function Image({ params }: VsOgImageProps) {
  const { slug } = await params;
  const page = ALTERNATIVES[slug];
  if (!page || !page.path.startsWith("/vs/")) notFound();

  return createDunloOgImage({
    title: page.headline,
    description: page.metaDescription,
    badge: `${page.competitorName} comparison`,
  });
}
