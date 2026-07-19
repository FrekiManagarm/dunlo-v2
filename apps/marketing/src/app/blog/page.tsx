import type { Metadata } from "next";
import { BlogIndex } from "@/components/blog-index";
import { Footer } from "@/components/landing/footer";
import { Nav } from "@/components/landing/nav";
import { getAllPosts } from "@/lib/blog";
import {
  SITE_NAME,
  absoluteUrl,
  breadcrumbJsonLd,
  pageSeoMetadata,
} from "@/lib/seo";

const BLOG_TITLE = "Stripe Payment Recovery Blog - Dunlo";
const BLOG_DESCRIPTION =
  "Practical guides for SaaS teams to recover failed payments, reduce involuntary churn, and improve dunning workflows.";

const BLOG_KEYWORDS = [
  "Stripe payment recovery blog",
  "SaaS dunning guide",
  "failed payment recovery articles",
  "involuntary churn guides",
  "Stripe failure codes",
  "dunning email strategy",
] as const;

export const metadata: Metadata = pageSeoMetadata({
  title: BLOG_TITLE,
  description: BLOG_DESCRIPTION,
  keywords: BLOG_KEYWORDS,
  path: "/blog",
});

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-dvh bg-dunlo-ground font-sans text-dunlo-ink selection:bg-dunlo selection:text-dunlo-ink">
      <Nav />
      <BlogIndex posts={posts} />
      <Footer />
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
    </div>
  );
}
