import type { MetadataRoute } from "next";
import { SITE_URL, absoluteUrl } from "@/lib/seo";

const PRODUCT_PATHS = [
  "/api/",
  "/alerts",
  "/dashboard",
  "/dashboard/",
  "/escalations",
  "/login",
  "/onboarding",
  "/payments",
  "/register",
  "/reset-password",
  "/sequences",
  "/settings",
  "/signup",
] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [...PRODUCT_PATHS],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: new URL(SITE_URL).host,
  };
}
