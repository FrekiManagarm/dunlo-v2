"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { BlogPostMeta } from "@/lib/blog";

type Post = BlogPostMeta;

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function TagPill({ tag }: { tag: string }) {
  return (
    <span className="rounded-full border border-dunlo-ink/18 px-3 py-1 text-xs font-semibold text-dunlo-ink/68">
      {tag}
    </span>
  );
}

function FeaturedCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-2xl bg-dunlo p-7 text-dunlo-ink transition-transform duration-300 ease-out hover:-translate-y-1 md:p-10"
    >
      <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-start">
        <div className="min-w-0">
          <div className="mb-7 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <TagPill key={tag} tag={tag} />
            ))}
          </div>

          <h2 className="mb-4 max-w-4xl text-3xl font-bold leading-[1.02] tracking-[-0.035em] md:text-5xl">
            {post.title}
          </h2>
          <p className="max-w-[62ch] text-base leading-7 text-dunlo-ink/68 md:text-lg md:leading-8">
            {post.description}
          </p>
        </div>

        <div className="flex items-center justify-between gap-5 md:flex-col md:items-end">
          <time className="font-mono text-xs font-semibold tabular-nums text-dunlo-ink/54">
            {formatDate(post.date)}
          </time>
          <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-dunlo-ink px-5 text-sm font-bold text-white">
            Read article
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-1"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}

function ArticleCard({ post, postNumber }: { post: Post; postNumber: string }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col border-t border-dunlo-line py-7 transition-colors duration-300 hover:border-dunlo/55 md:py-8"
    >
      <div className="mb-5 flex items-center justify-between">
        <span className="font-mono text-xs tabular-nums text-dunlo-ink/46 select-none">
          {postNumber}
        </span>
        <time className="text-xs tabular-nums text-dunlo-ink/46">
          {formatDate(post.date)}
        </time>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <TagPill key={tag} tag={tag} />
        ))}
      </div>

      <h2 className="mb-3 text-2xl font-bold leading-tight tracking-[-0.025em] transition-colors duration-200 group-hover:text-dunlo-deep">
        {post.title}
      </h2>

      <p className="mb-6 line-clamp-3 text-sm leading-6 text-dunlo-ink/62">
        {post.description}
      </p>

      <div className="mt-auto">
        <span className="inline-flex items-center gap-2 text-sm font-bold text-dunlo-deep">
          Read article
          <ArrowRight
            size={14}
            className="transition-transform group-hover:translate-x-1"
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
      <p className="font-semibold text-foreground mb-1">No articles yet</p>
      <p className="text-sm text-muted-foreground">Guides coming soon.</p>
    </div>
  );
}

export function BlogIndex({ posts }: { posts: Post[] }) {
  const [featured, ...rest] = posts;

  return (
    <main className="bg-dunlo-ground pb-24">
      <section className="relative overflow-hidden bg-dunlo-ink px-4 pb-20 pt-36 text-white md:px-6 md:pb-28 md:pt-44">
        <div className="landing-orbit" aria-hidden="true" />
        <motion.div
          className="relative mx-auto max-w-[1400px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
        >
          <div className="mb-7 flex items-center gap-3 text-sm font-semibold text-white/68">
            <span className="size-2 rounded-full bg-dunlo" />
            Recovery field notes
          </div>
          <h1 className="max-w-5xl text-balance text-[clamp(3rem,6vw,5.5rem)] font-bold leading-[0.92] tracking-[-0.04em]">
            Practical thinking for failed-payment recovery.
          </h1>
          <p className="mt-7 max-w-[58ch] text-pretty text-base leading-7 text-white/68 md:text-lg md:leading-8">
            Practical guides for recovering failed Stripe payments and reducing
            involuntary churn.
          </p>
        </motion.div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 pt-12 md:px-6 md:pt-16">
        {posts.length === 0 && <EmptyState />}

        {featured && (
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.08 }}
          >
            <FeaturedCard post={featured} />
          </motion.div>
        )}

        {rest.length > 0 && (
          <div className="grid grid-cols-1 gap-x-12 md:grid-cols-2">
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
      </section>
    </main>
  );
}
