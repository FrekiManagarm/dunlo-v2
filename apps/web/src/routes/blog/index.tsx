import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { BlogNav } from "@/components/blog-nav";
import { getAllPosts } from "@/lib/blog";
import { canonicalLink, ogMeta } from "@/lib/seo";

const BLOG_TITLE = "Stripe Payment Recovery Blog - Dunlo";
const BLOG_DESCRIPTION =
  "Guides and tutorials for SaaS teams to recover failed Stripe payments, reduce involuntary churn, and improve dunning workflows.";

export const Route = createFileRoute("/blog/")({
  loader: async () => getAllPosts(),
  head: () => ({
    meta: [
      { title: BLOG_TITLE },
      { name: "description", content: BLOG_DESCRIPTION },
      ...ogMeta({
        title: BLOG_TITLE,
        description: BLOG_DESCRIPTION,
        path: "/blog",
      }),
    ],
    links: [canonicalLink("/blog")],
  }),
  component: BlogPage,
});

type Post = Awaited<ReturnType<typeof getAllPosts>>[number];

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function TagPill({ tag }: { tag: string }) {
  return (
    <span className="text-xs px-2.5 py-0.5 rounded-full bg-dunlo/10 text-dunlo-deep font-medium border border-dunlo/20">
      {tag}
    </span>
  );
}

function FeaturedCard({ post }: { post: Post }) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className="group relative block overflow-hidden rounded-2xl border border-border bg-card p-8 md:p-10 hover:border-dunlo/40 transition-all duration-300 hover:shadow-[0_12px_40px_-12px_rgba(0,232,123,0.18)]"
    >
      <div className="absolute left-0 top-8 bottom-8 w-[3px] bg-dunlo rounded-r-full opacity-50 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-5">
            <span className="font-mono text-xs text-muted-foreground tabular-nums select-none">
              01
            </span>
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <TagPill key={tag} tag={tag} />
              ))}
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-snug mb-3 group-hover:text-dunlo-dim transition-colors duration-200">
            {post.title}
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-[60ch]">
            {post.description}
          </p>
        </div>

        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-4 md:gap-3 shrink-0 md:pt-0.5">
          <time className="text-xs text-muted-foreground font-medium tabular-nums">
            {formatDate(post.date)}
          </time>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-dunlo-dim group-hover:gap-2.5 transition-all duration-200">
            Lire l'article
            <ArrowRight
              size={14}
              className="group-hover:translate-x-0.5 transition-transform duration-200"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}

function ArticleCard({
  post,
  postNumber,
}: {
  post: Post;
  postNumber: string;
}) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className="group flex flex-col h-full rounded-2xl border border-border bg-card p-6 hover:border-dunlo/40 transition-all duration-300 hover:shadow-[0_8px_28px_-8px_rgba(0,232,123,0.14)]"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-xs text-muted-foreground tabular-nums select-none">
          {postNumber}
        </span>
        <time className="text-xs text-muted-foreground tabular-nums">
          {formatDate(post.date)}
        </time>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {post.tags.map((tag) => (
          <TagPill key={tag} tag={tag} />
        ))}
      </div>

      <h2 className="text-lg font-semibold leading-snug mb-2 group-hover:text-dunlo-dim transition-colors duration-200">
        {post.title}
      </h2>

      <p className="text-sm text-muted-foreground line-clamp-2 mb-5 leading-relaxed">
        {post.description}
      </p>

      <div className="mt-auto">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-dunlo-dim group-hover:gap-2 transition-all duration-200">
          Lire l'article
          <ArrowRight
            size={12}
            className="group-hover:translate-x-0.5 transition-transform duration-200"
          />
        </span>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="w-10 h-10 rounded-full bg-dunlo/10 border border-dunlo/20 flex items-center justify-center mb-4">
        <div className="w-4 h-4 rounded-sm border-2 border-dunlo/50" />
      </div>
      <p className="font-semibold text-foreground mb-1">
        Aucun article pour l'instant
      </p>
      <p className="text-sm text-muted-foreground">
        Les guides arrivent bientôt.
      </p>
    </div>
  );
}

function BlogPage() {
  const posts = Route.useLoaderData();
  const [featured, ...rest] = posts;

  return (
    <>
      <BlogNav />
      <main className="max-w-5xl mx-auto px-6 pt-28 pb-24">
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="block w-6 h-[2px] bg-dunlo rounded-full" />
            <span className="text-xs font-semibold uppercase tracking-widest text-dunlo-dim">
              Ressources
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-none mb-4">
            Blog
          </h1>
          <p className="text-muted-foreground text-lg max-w-[48ch]">
            Guides pratiques pour récupérer vos paiements Stripe échoués.
          </p>
        </motion.div>

        {posts.length === 0 && <EmptyState />}

        {featured && (
          <motion.div
            className="mb-5"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.08 }}
          >
            <FeaturedCard post={featured} />
          </motion.div>
        )}

        {rest.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {rest.map((post, i) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.14 + i * 0.07 }}
              >
                <ArticleCard
                  post={post}
                  postNumber={String(i + 2).padStart(2, "0")}
                />
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
