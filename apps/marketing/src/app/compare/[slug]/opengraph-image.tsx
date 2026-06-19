import { notFound } from "next/navigation";
import {
  COMPARE_PAGES,
  COMPARE_ROUTE_PAGES,
} from "@/components/compare/compare-page";
import { createDunloOgImage, ogImageSize } from "@/lib/og";

type CompareOgImageProps = {
  params: Promise<{ slug: string }>;
};

export const alt = "Dunlo competitor comparison";
export const size = ogImageSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return COMPARE_ROUTE_PAGES.map((page) => ({ slug: page.slug }));
}

export default async function Image({ params }: CompareOgImageProps) {
  const { slug } = await params;
  const page = COMPARE_PAGES[slug];
  if (!page) notFound();

  return createDunloOgImage({
    title: page.headline,
    description: page.metaDescription,
    badge: `${page.firstName} vs ${page.secondName}`,
    metricLabel: "compare",
    metricValue: "vs",
  });
}
