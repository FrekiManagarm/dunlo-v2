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

const page = ALTERNATIVES["churn-buster"];

export const Route = createFileRoute("/alternatives/churn-buster")({
  head: () => ({
    meta: [
      { title: page.metaTitle },
      { name: "description", content: page.metaDescription },
      keywordsMeta([
        "Churn Buster alternative",
        "Dunlo vs Churn Buster",
        "Stripe payment recovery alternative",
        "SaaS dunning software comparison",
        "failed payment recovery for SaaS",
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
