import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowLeft, Clock, Copy, Check } from "lucide-react";
import { getBlogBody, getPostMeta } from "@/lib/blog";
import { mdxComponents } from "@/components/mdx-components";
import { BlogNav } from "@/components/blog-nav";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const meta = await getPostMeta({ data: params.slug });
    if (!meta) throw notFound();
    return meta;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title} — Dunlo Blog` },
      { name: "description", content: loaderData?.description },
      { name: "keywords", content: loaderData?.keywords?.join(", ") },
      { property: "og:type", content: "article" },
      { property: "og:title", content: loaderData?.title ?? "" },
      { property: "og:description", content: loaderData?.description ?? "" },
      { property: "og:site_name", content: "Dunlo Blog" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: loaderData?.title ?? "" },
      { name: "twitter:description", content: loaderData?.description ?? "" },
      ...(loaderData?.date
        ? [{ property: "article:published_time", content: loaderData.date }]
        : []),
    ],
  }),
  component: BlogPostPage,
});

function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] bg-dunlo origin-left"
      style={{ scaleX, zIndex: 60 }}
    />
  );
}

function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:border-dunlo/40 hover:text-dunlo-dim active:scale-[0.97]"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? "Copié !" : "Copier le lien"}
    </button>
  );
}

function TagPill({ tag }: { tag: string }) {
  return (
    <span className="text-xs px-2.5 py-0.5 rounded-full bg-dunlo/10 text-dunlo-deep font-medium border border-dunlo/20">
      {tag}
    </span>
  );
}

function estimateReadingTime(description: string) {
  const mins = Math.max(3, Math.ceil((description.split(" ").length * 15) / 200));
  return `${mins} min`;
}

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };

function BlogPostPage() {
  const { slug } = Route.useParams();
  const { title, date, tags, description, keywords } = Route.useLoaderData();

  const MDX = getBlogBody(slug);
  if (!MDX) return null;

  const formattedDate = new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished: date,
    keywords: keywords?.join(", "),
    publisher: {
      "@type": "Organization",
      name: "Dunlo",
      url: "https://dunlo.io",
    },
  });

  return (
    <>
      <ReadingProgress />
      <BlogNav />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />

      <main className="max-w-3xl mx-auto px-6 pt-28 pb-24">
        {/* Top nav row */}
        <motion.div
          className="flex items-center justify-between mb-12"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
        >
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-dunlo-dim transition-colors duration-200 group"
          >
            <ArrowLeft
              size={14}
              className="group-hover:-translate-x-0.5 transition-transform duration-200"
            />
            Retour au blog
          </Link>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <TagPill key={tag} tag={tag} />
            ))}
          </div>
        </motion.div>

        {/* Article header */}
        <motion.header
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.06 }}
        >
          <h1 className="text-3xl md:text-[2.6rem] font-bold tracking-tight leading-tight mb-6">
            {title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <time dateTime={date}>{formattedDate}</time>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="inline-flex items-center gap-1.5">
              <Clock size={13} />
              {estimateReadingTime(description)} de lecture
            </span>
          </div>
        </motion.header>

        {/* Animated separator */}
        <motion.div
          className="h-px bg-border mb-10"
          initial={{ scaleX: 0, originX: "0%" }}
          animate={{ scaleX: 1 }}
          transition={{ type: "spring", stiffness: 60, damping: 20, delay: 0.14 }}
        />

        {/* Article body */}
        <motion.article
          className="prose prose-zinc prose-lg max-w-none"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.18 }}
        >
          <MDX components={mdxComponents} />
        </motion.article>

        {/* Footer */}
        <motion.div
          className="mt-16 pt-8 border-t border-border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <TagPill key={tag} tag={tag} />
              ))}
            </div>
            <CopyLinkButton />
          </div>
        </motion.div>

        {/* Back link */}
        <motion.div
          className="mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-dunlo-dim transition-colors duration-200 group"
          >
            <ArrowLeft
              size={14}
              className="group-hover:-translate-x-0.5 transition-transform duration-200"
            />
            Retour au blog
          </Link>
        </motion.div>
      </main>
    </>
  );
}
