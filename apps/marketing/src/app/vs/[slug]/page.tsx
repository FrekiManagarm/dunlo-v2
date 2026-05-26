import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ALTERNATIVES,
  AlternativePage,
  VS_ROUTE_PAGES,
} from "@/components/alternatives/alternative-page";
import { SITE_URL, breadcrumbJsonLd, pageSeoMetadata } from "@/lib/seo";

type VsRouteProps = {
  params: Promise<{ slug: string }>;
};

const KEYWORDS: Record<string, string[]> = {
  baremetrics: [
    "baremetrics alternative",
    "baremetrics vs",
    "baremetrics pricing alternative",
    "Baremetrics Recover alternative",
    "Stripe dunning for bootstrapped SaaS",
  ],
};

export function generateStaticParams() {
  return VS_ROUTE_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: VsRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const page = ALTERNATIVES[slug];
  if (!page || !page.path.startsWith("/vs/")) return {};

  return pageSeoMetadata({
    title: page.metaTitle,
    description: page.metaDescription,
    keywords: KEYWORDS[slug] ?? [],
    path: page.path,
  });
}

export default async function VsDetailPage({ params }: VsRouteProps) {
  const { slug } = await params;
  const page = ALTERNATIVES[slug];
  if (!page || !page.path.startsWith("/vs/")) notFound();

  return (
    <>
      <AlternativePage page={page} />
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
