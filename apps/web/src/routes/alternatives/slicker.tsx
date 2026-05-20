import { createFileRoute } from "@tanstack/react-router";
import {
  ALTERNATIVES,
  AlternativePage,
} from "@/components/alternatives/alternative-page";
import { SITE_URL, canonicalLink, keywordsMeta, ogMeta } from "@/lib/seo";

const page = ALTERNATIVES.slicker;

export const Route = createFileRoute("/alternatives/slicker")({
  head: () => ({
    meta: [
      { title: page.metaTitle },
      { name: "description", content: page.metaDescription },
      keywordsMeta([
        "Slicker alternative",
        "Dunlo vs Slicker",
        "Slicker payment recovery alternative",
        "payment recovery for small SaaS",
        "AI retry engine alternative",
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
    ],
  }),
  component: () => <AlternativePage page={page} />,
});
