import type { Metadata } from "next";

export const SITE_URL = "https://dunlo.io";
export const SITE_NAME = "Dunlo";
export const DEFAULT_TITLE = "Dunlo - Stripe Payment Recovery for SaaS";
export const DEFAULT_DESCRIPTION =
  "Dunlo helps SaaS founders recover failed Stripe payments with failure-code emails, smart timing, founder escalation, and revenue tracking.";
export const DEFAULT_KEYWORDS = [
  "Dunlo",
  "dunlo",
  "dunlo.io",
  "Stripe payment recovery",
  "failed payment recovery",
  "dunning software for SaaS",
  "recover failed Stripe payments",
  "involuntary churn",
  "Stripe dunning",
  "SaaS payment recovery",
] as const;
export const DEFAULT_OG_IMAGE = `${SITE_URL}/opengraph-image`;
export const DEFAULT_OG_IMAGE_ALT =
  "Dunlo social preview showing failure-reason-specific Stripe payment recovery";
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
      canonical: path,
    },
    openGraph: {
      type,
      siteName: SITE_NAME,
      locale: "en_US",
      title,
      description,
      url: path,
      images: [
        {
          url: ogImage,
          alt: DEFAULT_OG_IMAGE_ALT,
          type: DEFAULT_OG_IMAGE_TYPE,
          width: DEFAULT_OG_IMAGE_WIDTH,
          height: DEFAULT_OG_IMAGE_HEIGHT,
        },
      ],
      ...(type === "article" && publishedTime
        ? { publishedTime }
        : {}),
      ...(type === "article" && authors?.length
        ? { authors }
        : {}),
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

export function ogMeta({
  title,
  description,
  path = "/",
  type = "website",
}: {
  title: string;
  description: string;
  path?: string;
  type?: "website" | "article";
}) {
  const url = absoluteUrl(path);
  const image = pageOgImageUrl(path);

  return [
    { property: "og:type", content: type },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: image },
    { property: "og:image:alt", content: DEFAULT_OG_IMAGE_ALT },
    { property: "og:image:type", content: "image/png" },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:url", content: url },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
    { name: "twitter:image:alt", content: DEFAULT_OG_IMAGE_ALT },
  ];
}
