import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getPostMeta, getBlogBody } from "@/lib/blog";
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
    ],
  }),
  component: BlogPostPage,
});

function BlogPostPage() {
  const { slug } = Route.useParams();
  const { title, date, tags } = Route.useLoaderData();

  const MDX = getBlogBody(slug)!;

  return (
    <>
      <BlogNav />
      <main className="max-w-3xl mx-auto px-6 pt-24 pb-16">
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
        <MDX components={mdxComponents} />
      </article>
    </main>
    </>
  );
}
