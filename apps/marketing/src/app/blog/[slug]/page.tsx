import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BlogNav } from "@/components/blog-nav";
import { mdxComponents } from "@/components/mdx-components";
import {
  type BlogPostMeta,
  getAllPosts,
  getBlogSlugs,
  getPost,
} from "@/lib/blog";
import {
  SITE_NAME,
  absoluteUrl,
  breadcrumbJsonLd,
  pageSeoMetadata,
} from "@/lib/seo";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  return pageSeoMetadata({
    title: `${post.data.title} - Dunlo Blog`,
    description: post.data.description,
    keywords: post.data.keywords,
    path: `/blog/${post.slugs[0]}`,
    type: "article",
    publishedTime: post.data.date,
    authors: post.data.author ? [post.data.author] : undefined,
  });
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function TagPill({ tag }: { tag: string }) {
  return (
    <span className="rounded-full border border-dunlo/20 bg-dunlo/10 px-2.5 py-0.5 text-xs font-medium text-dunlo-deep">
      {tag}
    </span>
  );
}

function normalizeTerm(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function scoreRelatedPost({
  candidate,
  tags,
  keywords,
}: {
  candidate: BlogPostMeta;
  tags: Set<string>;
  keywords: Set<string>;
}) {
  const candidateTags = candidate.tags.map(normalizeTerm);
  const candidateKeywords = candidate.keywords.map(normalizeTerm);
  const tagScore = candidateTags.filter((tag) => tags.has(tag)).length * 4;
  const keywordScore =
    candidateKeywords.filter((keyword) => keywords.has(keyword)).length * 2;

  return tagScore + keywordScore;
}

const RECOVERY_RESOURCES = [
  {
    href: "/stripe-failed-payments",
    title: "Stripe failed payments",
    description: "Recover failed invoices before they become quiet churn.",
  },
  {
    href: "/stripe-dunning",
    title: "Stripe dunning workflow",
    description: "Plan the email cadence, retry timing, and escalation path.",
  },
  {
    href: "/benchmark",
    title: "Failed payment benchmark",
    description: "Estimate failed MRR and recovery potential before signup.",
  },
] as const;

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const currentSlug = post.slugs[0] ?? "";
  const currentTags = new Set(post.data.tags.map(normalizeTerm));
  const currentKeywords = new Set(post.data.keywords.map(normalizeTerm));
  const related = getAllPosts()
    .filter((item) => item.slug !== currentSlug)
    .map((item) => ({
      ...item,
      relatedScore: scoreRelatedPost({
        candidate: item,
        tags: currentTags,
        keywords: currentKeywords,
      }),
    }))
    .sort(
      (a, b) =>
        b.relatedScore - a.relatedScore ||
        new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
    .slice(0, 3);
  const MdxContent = post.data.body;

  return (
    <>
      <BlogNav />
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-28">
        <Link
          href="/blog"
          className="mb-10 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-dunlo-dim"
        >
          <ArrowLeft size={14} />
          Back to blog
        </Link>

        <article>
          <header className="mb-10 border-b border-border pb-8">
            <div className="mb-5 flex flex-wrap gap-1.5">
              {post.data.tags.map((tag) => (
                <TagPill key={tag} tag={tag} />
              ))}
            </div>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-foreground md:text-6xl">
              {post.data.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {post.data.description}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <time dateTime={post.data.date}>
                {formatDate(post.data.date)}
              </time>
              {post.data.readingTime && <span>{post.data.readingTime}</span>}
              {post.data.author && <span>{post.data.author}</span>}
            </div>
          </header>

          <div className="prose prose-zinc max-w-none">
            <MdxContent components={mdxComponents} />
          </div>
        </article>

        <section className="mt-14 rounded-2xl border border-dunlo/20 bg-dunlo/[0.06] p-6">
          <h2 className="text-xl font-semibold tracking-tight">
            Turn this into a recovery workflow
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {RECOVERY_RESOURCES.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-dunlo/20 bg-white/80 p-4 transition-colors hover:border-dunlo/40"
              >
                <p className="text-sm font-semibold leading-snug">
                  {item.title}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-16 border-t border-border pt-10">
            <h2 className="mb-5 text-xl font-semibold tracking-tight">
              Keep reading
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={`/blog/${item.slug}`}
                  className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-dunlo/40"
                >
                  <p className="text-sm font-semibold leading-snug">
                    {item.title}
                  </p>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            mainEntityOfPage: absoluteUrl(`/blog/${post.slugs[0]}`),
            headline: post.data.title,
            description: post.data.description,
            image: absoluteUrl(`/blog/${post.slugs[0]}/opengraph-image`),
            datePublished: post.data.date,
            dateModified: post.data.date,
            author: {
              "@type": post.data.author ? "Person" : "Organization",
              name: post.data.author ?? SITE_NAME,
            },
            publisher: {
              "@type": "Organization",
              name: SITE_NAME,
              url: absoluteUrl("/"),
            },
            keywords: post.data.keywords.join(", "),
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
              { name: post.data.title, path: `/blog/${post.slugs[0]}` },
            ]),
          ),
        }}
      />
    </>
  );
}
