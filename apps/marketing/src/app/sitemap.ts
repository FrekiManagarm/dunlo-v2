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
    lastModified: "2026-06-11",
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
    path: "/product-hunt",
    lastModified: "2026-06-15",
    changeFrequency: "weekly",
    priority: 0.88,
  },
  {
    path: "/benchmark",
    lastModified: "2026-05-27",
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    path: "/stripe-failed-payment-audit",
    lastModified: "2026-06-03",
    changeFrequency: "weekly",
    priority: 0.92,
  },
  {
    path: "/stripe-failed-payments",
    lastModified: "2026-06-02",
    changeFrequency: "weekly",
    priority: 0.92,
  },
  {
    path: "/stripe-dunning",
    lastModified: "2026-06-02",
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    path: "/stripe-smart-retries-alternative",
    lastModified: "2026-06-11",
    changeFrequency: "weekly",
    priority: 0.94,
  },
  {
    path: "/state-of-stripe-payments-2026",
    lastModified: "2026-06-03",
    changeFrequency: "monthly",
    priority: 0.86,
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
] satisfies SitemapEntry[];

const MACHINE_READABLE_ROUTES = [
  {
    path: "/llms.txt",
    lastModified: "2026-06-15",
    changeFrequency: "weekly",
    priority: 0.7,
  },
  {
    path: "/pricing.md",
    lastModified: "2026-06-15",
    changeFrequency: "weekly",
    priority: 0.7,
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
  const alternativeRoutes = Object.values(ALTERNATIVES)
    .filter((page) => page.slug !== "stripe-smart-retries")
    .map((page) =>
      toRoute({
        path: page.path,
        lastModified: "2026-06-03",
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
    ...MACHINE_READABLE_ROUTES.map(toRoute),
    ...alternativeRoutes,
    ...blogRoutes,
  ];
}
