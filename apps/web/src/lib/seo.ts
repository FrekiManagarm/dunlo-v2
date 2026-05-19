export const SITE_URL = "https://dunlo.io";
export const SITE_NAME = "Dunlo";
export const DEFAULT_TITLE =
  "Dunlo - Recover Failed Stripe Payments Before Customers Disappear";
export const DEFAULT_DESCRIPTION =
  "Dunlo helps SaaS founders recover failed Stripe payments with failure-code-specific emails, founder escalation for high-value accounts, and clear recovered-revenue tracking.";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/brand/dunlo-logo.png`;

export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function canonicalLink(path = "/") {
  return { rel: "canonical", href: absoluteUrl(path) };
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
    { property: "og:image:alt", content: "Dunlo logo" },
    { property: "og:url", content: url },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: DEFAULT_OG_IMAGE },
  ];
}
