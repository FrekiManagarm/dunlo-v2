import { createFileRoute } from "@tanstack/react-router";
import {
  ALTERNATIVES,
  AlternativePage,
} from "@/components/alternatives/alternative-page";
import { SITE_URL, canonicalLink, ogMeta } from "@/lib/seo";

const page = ALTERNATIVES.slicker;

export const Route = createFileRoute("/alternatives/slicker")({
  head: () => ({
    meta: [
      { title: page.metaTitle },
      { name: "description", content: page.metaDescription },
      {
        name: "keywords",
        content:
          "slicker alternative, slicker vs dunlo payment recovery, payment recovery for small saas",
      },
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
