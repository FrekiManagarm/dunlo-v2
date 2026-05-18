import { useState, useEffect, useRef } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowLeft, Clock, Copy, Check } from "lucide-react";
import { getBlogBody, getPostMeta } from "@/lib/blog";
import { mdxComponents } from "@/components/mdx-components";
import { BlogNav } from "@/components/blog-nav";
import {
  SITE_NAME,
  absoluteUrl,
  breadcrumbJsonLd,
  canonicalLink,
  ogMeta,
} from "@/lib/seo";

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
      ...ogMeta({
        title: `${loaderData?.title ?? "Dunlo Blog"} — Dunlo Blog`,
        description: loaderData?.description ?? "",
        path: `/blog/${loaderData?.slug ?? ""}`,
        type: "article",
      }),
      ...(loaderData?.date
        ? [{ property: "article:published_time", content: loaderData.date }]
        : []),
      ...(loaderData?.author
        ? [{ property: "article:author", content: loaderData.author }]
        : []),
    ],
    links: [canonicalLink(`/blog/${loaderData?.slug ?? ""}`)],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          mainEntityOfPage: absoluteUrl(`/blog/${loaderData?.slug ?? ""}`),
          headline: loaderData?.title,
          description: loaderData?.description,
          datePublished: loaderData?.date,
          author: {
            "@type": loaderData?.author ? "Person" : "Organization",
            name: loaderData?.author ?? SITE_NAME,
          },
          publisher: {
            "@type": "Organization",
            name: SITE_NAME,
            url: absoluteUrl("/"),
          },
          keywords: loaderData?.keywords?.join(", "),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            {
              name: loaderData?.title ?? "Article",
              path: `/blog/${loaderData?.slug ?? ""}`,
            },
          ]),
        ),
      },
    ],
  }),
  component: BlogPostPage,
});

// ─── Types ────────────────────────────────────────────────────────────────────

type TOCItem = { id: string; text: string; level: number };

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useTOC(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [items, setItems] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const headings = Array.from(container.querySelectorAll("h2, h3"));

    const toc: TOCItem[] = headings.map((el) => {
      const text = el.textContent ?? "";
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "-")
        .trim();
      el.id = id;
      return { id, text, level: parseInt(el.tagName[1]!) };
    });

    setItems(toc);
    if (toc[0]) setActiveId(toc[0].id);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px" },
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [containerRef]);

  return { items, activeId };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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

function TableOfContents({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { items, activeId } = useTOC(containerRef);

  if (items.length < 2) return null;

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
          On this page
        </p>
        <nav className="space-y-0.5">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById(item.id)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={[
                "block text-sm py-1 transition-colors duration-150 leading-snug",
                item.level === 3 ? "pl-3" : "",
                activeId === item.id
                  ? "text-dunlo-dim font-medium"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {item.text}
            </a>
          ))}
        </nav>

        <div className="mt-6 pt-6 border-t border-border">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-dunlo-dim transition-colors duration-200 group"
          >
            <ArrowLeft
              size={12}
              className="group-hover:-translate-x-0.5 transition-transform duration-200"
            />
            Back to blog
          </Link>
        </div>
      </div>
    </aside>
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
      {copied ? "Copied!" : "Copy link"}
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

function estimateReadingTime(description: string, readingTime?: string) {
  if (readingTime) return readingTime;
  const mins = Math.max(3, Math.ceil((description.split(" ").length * 15) / 200));
  return `${mins} min`;
}

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };

// ─── Page ─────────────────────────────────────────────────────────────────────

function BlogPostPage() {
  const { slug } = Route.useParams();
  const { title, date, tags, description, readingTime } =
    Route.useLoaderData();
  const articleRef = useRef<HTMLDivElement>(null);

  const MDX = getBlogBody(slug);
  if (!MDX) return null;

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <ReadingProgress />
      <BlogNav />

      <main className="max-w-5xl mx-auto px-6 pt-28 pb-24">
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
            Back to blog
          </Link>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <TagPill key={tag} tag={tag} />
            ))}
          </div>
        </motion.div>

        {/* Article header */}
        <motion.header
          className="mb-8 max-w-3xl"
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
              {estimateReadingTime(description, readingTime)} read
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

        {/* Content + TOC grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-12 items-start">
          {/* Article body */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.18 }}
          >
            <div ref={articleRef}>
              <article className="prose prose-zinc prose-lg max-w-none">
                <MDX components={mdxComponents} />
              </article>
            </div>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-border">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <TagPill key={tag} tag={tag} />
                  ))}
                </div>
                <CopyLinkButton />
              </div>
            </div>

            <div className="mt-10 lg:hidden">
              <Link
                to="/blog"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-dunlo-dim transition-colors duration-200 group"
              >
                <ArrowLeft
                  size={14}
                  className="group-hover:-translate-x-0.5 transition-transform duration-200"
                />
                Back to blog
              </Link>
            </div>
          </motion.div>

          {/* TOC sidebar */}
          <TableOfContents containerRef={articleRef} />
        </div>
      </main>
    </>
  );
}
