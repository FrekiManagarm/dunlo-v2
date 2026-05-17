export const SITE_URL = "https://dunlo.io";
export const SITE_NAME = "Dunlo";
export const DEFAULT_TITLE = "Dunlo - Stripe Payment Recovery for SaaS";
export const DEFAULT_DESCRIPTION =
  "Recover failed Stripe payments with failure-code precision, AI-drafted founder escalation, and revenue tracking built for Stripe-first SaaS teams.";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/brand/dunlo-logo.png`;

export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function canonicalLink(path = "/") {
  return { rel: "canonical", href: absoluteUrl(path) };
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
