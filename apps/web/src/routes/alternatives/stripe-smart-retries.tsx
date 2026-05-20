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

const page = ALTERNATIVES["stripe-smart-retries"];

export const Route = createFileRoute("/alternatives/stripe-smart-retries")({
  head: () => ({
    meta: [
      { title: page.metaTitle },
      { name: "description", content: page.metaDescription },
      keywordsMeta([
        "Stripe Smart Retries alternative",
        "Dunlo vs Stripe Smart Retries",
        "Stripe failed payment recovery",
        "Stripe dunning software",
        "SaaS payment recovery workflow",
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
