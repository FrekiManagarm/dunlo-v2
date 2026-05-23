import type { MetadataRoute } from "next";
import { ALTERNATIVES } from "@/components/alternatives/alternative-page";
import { getAllPosts } from "@/lib/blog";
import { absoluteUrl } from "@/lib/seo";

type SitemapEntry = {
  path: string;
  lastModified: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
};

const STATIC_ROUTES = [
  {
    path: "/",
    lastModified: "2026-05-23",
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    path: "/alternatives",
    lastModified: "2026-05-23",
    changeFrequency: "weekly",
    priority: 0.85,
  },
  {
    path: "/blog",
    lastModified: "2026-05-23",
    changeFrequency: "weekly",
    priority: 0.85,
  },
  {
    path: "/state-of-stripe-payments-2026",
    lastModified: "2026-05-23",
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    path: "/privacy",
    lastModified: "2026-05-23",
    changeFrequency: "monthly",
    priority: 0.45,
  },
  {
    path: "/terms",
    lastModified: "2026-05-23",
    changeFrequency: "monthly",
    priority: 0.45,
  },
  {
    path: "/llms.txt",
    lastModified: "2026-05-23",
    changeFrequency: "weekly",
    priority: 0.5,
  },
  {
    path: "/pricing.md",
    lastModified: "2026-05-23",
    changeFrequency: "weekly",
    priority: 0.6,
  },
] satisfies SitemapEntry[];

function toRoute(entry: SitemapEntry): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteUrl(entry.path),
    lastModified: entry.lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const alternativeRoutes = Object.values(ALTERNATIVES).map((page) =>
    toRoute({
      path: page.path,
      lastModified: "2026-05-23",
      changeFrequency: "monthly",
      priority: 0.75,
    }),
  );

  const blogRoutes = getAllPosts().map((post) =>
    toRoute({
      path: `/blog/${post.slug}`,
      lastModified: post.date,
      changeFrequency: "weekly",
      priority: 0.72,
    }),
  );

  return [
    ...STATIC_ROUTES.map(toRoute),
    ...alternativeRoutes,
    ...blogRoutes,
  ];
}
