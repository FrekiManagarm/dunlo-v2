import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getPost } from "@/lib/blog";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    return {
      title: post.data.title,
      description: post.data.description,
      date: post.data.date,
      tags: post.data.tags,
      keywords: post.data.keywords,
    };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title} — Dunlo Blog` },
      { name: "description", content: loaderData?.description },
      { name: "keywords", content: loaderData?.keywords?.join(", ") },
    ],
  }),
  component: BlogPostPage,
});

function BlogPostPage() {
  const { slug } = Route.useParams();
  const { title, date, tags } = Route.useLoaderData();

  const post = getPost(slug)!;
  const MDX = post.data.body as React.ComponentType;

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <Link
        to="/blog"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-dunlo-dim transition-colors mb-10"
      >
        ← Retour au blog
      </Link>

      <header className="mb-10">
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2.5 py-0.5 rounded-full bg-dunlo/20 text-dunlo-deep font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4 leading-tight">
          {title}
        </h1>
        <time className="text-sm text-muted-foreground">
          {new Date(date).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </time>
      </header>

      <article className="prose prose-zinc max-w-none">
        <MDX />
      </article>
    </main>
  );
}
