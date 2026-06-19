import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  COMPARE_PAGES,
  COMPARE_ROUTE_PAGES,
  ComparePage,
} from "@/components/compare/compare-page";
import { SITE_URL, breadcrumbJsonLd, pageSeoMetadata } from "@/lib/seo";

type CompareRouteProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return COMPARE_ROUTE_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: CompareRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const page = COMPARE_PAGES[slug];
  if (!page) return {};

  return pageSeoMetadata({
    title: page.metaTitle,
    description: page.metaDescription,
    keywords: page.keywords,
    path: page.path,
  });
}

export default async function CompareDetailPage({ params }: CompareRouteProps) {
  const { slug } = await params;
  const page = COMPARE_PAGES[slug];
  if (!page) notFound();

  return (
    <>
      <ComparePage page={page} />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: page.metaTitle,
            description: page.metaDescription,
            url: `${SITE_URL}${page.path}`,
            about: [page.firstName, page.secondName, "SaaS payment recovery"],
          }),
        }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: page.headline, path: page.path },
            ]),
          ),
        }}
      />
    </>
  );
}
