import { createFileRoute, Link } from "@tanstack/react-router";
import { getAllPosts } from "@/lib/blog";
import { BlogNav } from "@/components/blog-nav";

export const Route = createFileRoute("/blog")({
  loader: async () => getAllPosts(),
  head: () => ({
    meta: [
      { title: "Blog — Dunlo" },
      {
        name: "description",
        content:
          "Guides et tutoriels pour récupérer vos paiements Stripe échoués et réduire le churn involontaire.",
      },
    ],
  }),
  component: BlogPage,
});

function BlogPage() {
  const posts = Route.useLoaderData();

  return (
    <>
      <BlogNav />
      <main className="max-w-5xl mx-auto px-6 pt-24 pb-16">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-3">Blog</h1>
        <p className="text-muted-foreground text-lg">
          Guides pratiques pour récupérer vos paiements Stripe échoués.
        </p>
      </div>

      {posts.length === 0 && (
        <p className="text-muted-foreground">Aucun article pour l'instant.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            to="/blog/$slug"
            params={{ slug: post.slug }}
            className="group block p-6 rounded-2xl border border-border bg-card hover:border-dunlo/40 transition-colors"
          >
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-0.5 rounded-full bg-dunlo/20 text-dunlo-deep font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="text-lg font-semibold mb-2 group-hover:text-dunlo-dim transition-colors leading-snug">
              {post.title}
            </h2>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {post.description}
            </p>
            <time className="text-xs text-muted-foreground">
              {new Date(post.date).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
          </Link>
        ))}
      </div>
    </main>
    </>
  );
}
