import type { Metadata } from "next";
import { BlogIndex } from "@/components/blog-index";
import { getAllPosts } from "@/lib/blog";
import {
  SITE_NAME,
  absoluteUrl,
  breadcrumbJsonLd,
} from "@/lib/seo";

const BLOG_TITLE = "Stripe Payment Recovery Blog - Dunlo";
const BLOG_DESCRIPTION =
  "Practical guides for SaaS teams to recover failed Stripe payments, reduce involuntary churn, and improve dunning workflows.";

export const metadata: Metadata = {
  title: BLOG_TITLE,
  description: BLOG_DESCRIPTION,
  keywords: [
    "Stripe payment recovery blog",
    "SaaS dunning guide",
    "failed payment recovery articles",
    "involuntary churn guides",
    "Stripe failure codes",
    "dunning email strategy",
  ],
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    url: "/blog",
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <>
      <BlogIndex posts={posts} />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: BLOG_TITLE,
            description: BLOG_DESCRIPTION,
            url: absoluteUrl("/blog"),
            publisher: {
              "@type": "Organization",
              name: SITE_NAME,
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Blog", path: "/blog" },
            ]),
          ),
        }}
      />
    </>
  );
}
