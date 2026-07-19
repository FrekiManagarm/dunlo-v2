import { notFound } from "next/navigation";
import {
  ALTERNATIVES,
  ALTERNATIVE_ROUTE_PAGES,
} from "@/components/alternatives/alternative-page";
import { createDunloOgImage, ogImageSize } from "@/lib/og";

type AlternativeOgImageProps = {
  params: Promise<{ slug: string }>;
};

export const alt = "Dunlo alternative comparison";
export const size = ogImageSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return ALTERNATIVE_ROUTE_PAGES.map((page) => ({ slug: page.slug }));
}

export default async function Image({ params }: AlternativeOgImageProps) {
  const { slug } = await params;
  const page = ALTERNATIVES[slug];
  if (!page || !page.path.startsWith("/alternatives/")) notFound();

  return createDunloOgImage({
    title: page.headline,
    description: page.metaDescription,
    badge: `${page.competitorName} alternative`,
  });
}
