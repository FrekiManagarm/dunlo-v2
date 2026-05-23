export const SITE_URL = "https://dunlo.io";
export const SITE_NAME = "Dunlo";
export const DEFAULT_TITLE = "Dunlo - Stripe Payment Recovery for SaaS";
export const DEFAULT_DESCRIPTION =
  "Dunlo helps SaaS founders recover failed Stripe payments with failure-code emails, smart timing, founder escalation, and revenue tracking.";
export const DEFAULT_KEYWORDS = [
  "Dunlo",
  "Stripe payment recovery",
  "failed payment recovery",
  "dunning software for SaaS",
  "recover failed Stripe payments",
  "involuntary churn",
  "Stripe dunning",
  "SaaS payment recovery",
] as const;
export const DEFAULT_OG_IMAGE = `${SITE_URL}/brand/dunlo-og-v2.png`;
export const DEFAULT_OG_IMAGE_ALT =
  "Dunlo social preview showing failure-reason-specific Stripe payment recovery";

export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function canonicalLink(path = "/") {
  return { rel: "canonical", href: absoluteUrl(path) };
}

export function keywordsMeta(keywords: readonly string[]) {
  return { name: "keywords", content: keywords.join(", ") };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
) {
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

  return [
    { property: "og:type", content: type },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: DEFAULT_OG_IMAGE },
    { property: "og:image:alt", content: DEFAULT_OG_IMAGE_ALT },
    { property: "og:image:type", content: "image/png" },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:url", content: url },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: DEFAULT_OG_IMAGE },
    { name: "twitter:image:alt", content: DEFAULT_OG_IMAGE_ALT },
  ];
}
