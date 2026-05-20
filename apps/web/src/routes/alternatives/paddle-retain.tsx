import { createFileRoute } from "@tanstack/react-router";
import {
  ALTERNATIVES,
  AlternativePage,
} from "@/components/alternatives/alternative-page";
import {
  SITE_URL,
  breadcrumbJsonLd,
  canonicalLink,
  keywordsMeta,
  ogMeta,
} from "@/lib/seo";

const page = ALTERNATIVES["paddle-retain"];

export const Route = createFileRoute("/alternatives/paddle-retain")({
  head: () => ({
    meta: [
      { title: page.metaTitle },
      { name: "description", content: page.metaDescription },
      keywordsMeta([
        "Paddle Retain alternative",
        "Dunlo vs Paddle Retain",
        "Stripe payment recovery for Paddle alternatives",
        "involuntary churn software comparison",
        "SaaS payment recovery comparison",
      ]),
      ...ogMeta({
        title: page.metaTitle,
        description: page.metaDescription,
        path: page.path,
      }),
    ],
    links: [canonicalLink(page.path)],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: page.metaTitle,
          description: page.metaDescription,
          url: `${SITE_URL}${page.path}`,
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: page.headline, path: page.path },
          ]),
        ),
      },
    ],
  }),
  component: () => <AlternativePage page={page} />,
});
