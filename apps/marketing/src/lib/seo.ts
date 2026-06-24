import type { Metadata } from "next";

export const SITE_URL = "https://dunlo.io";
export const SITE_NAME = "Dunlo";
export const DEFAULT_TITLE =
  "Dunlo - Recover Failed Payments Before They Churn";
export const DEFAULT_DESCRIPTION =
  "Recover failed payments with failure-aware emails, Stripe-hosted update links, and founder review. Start free in beta before revenue quietly churns.";
export const DEFAULT_KEYWORDS = [
  "Dunlo",
  "dunlo",
  "dunlo.io",
  "Stripe payment recovery",
  "Stripe failed payments",
  "failed payment recovery",
  "customer-friendly dunning",
  "dunning software for SaaS",
  "recover failed payments",
  "involuntary churn",
  "Stripe dunning",
  "SaaS payment recovery",
] as const;
export const DEFAULT_OG_IMAGE = `${SITE_URL}/opengraph-image`;
export const DEFAULT_OG_IMAGE_ALT =
  "Dunlo social preview showing a Stripe failed-payment recovery desk";
export const DEFAULT_OG_IMAGE_TYPE = "image/png";
export const DEFAULT_OG_IMAGE_WIDTH = 1200;
export const DEFAULT_OG_IMAGE_HEIGHT = 630;

export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageOgImageUrl(path = "/") {
  const cleanPath = path === "/" ? "" : path.replace(/\/$/, "");
  return absoluteUrl(`${cleanPath}/opengraph-image`);
}

export function canonicalLink(path = "/") {
  return { rel: "canonical", href: absoluteUrl(path) };
}

export function keywordsMeta(keywords: readonly string[]) {
  return { name: "keywords", content: keywords.join(", ") };
}

export function pageSeoMetadata({
  title,
  description,
  path = "/",
  keywords = DEFAULT_KEYWORDS,
  type = "website",
  publishedTime,
  authors,
}: {
  title: string;
  description: string;
  path?: string;
  keywords?: readonly string[];
  type?: "website" | "article";
  publishedTime?: string;
  authors?: string[];
}): Metadata {
  const ogImage = pageOgImageUrl(path);

  return {
    title,
    description,
    keywords: [...keywords],
    alternates: {
      canonical: absoluteUrl(path),
    },
    openGraph: {
      type,
      siteName: SITE_NAME,
      locale: "en_US",
      title,
      description,
      url: absoluteUrl(path),
      images: [
        {
          url: ogImage,
          alt: DEFAULT_OG_IMAGE_ALT,
          type: DEFAULT_OG_IMAGE_TYPE,
          width: DEFAULT_OG_IMAGE_WIDTH,
          height: DEFAULT_OG_IMAGE_HEIGHT,
        },
      ],
      ...(type === "article" && publishedTime ? { publishedTime } : {}),
      ...(type === "article" && authors?.length ? { authors } : {}),
    },
    twitter: {
      card: "summary_large_image",
      creator: "@mathchambaud",
      title,
      description,
      images: [
        {
          url: ogImage,
          alt: DEFAULT_OG_IMAGE_ALT,
        },
      ],
    },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
