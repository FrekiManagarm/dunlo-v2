import type { ComponentType, HTMLAttributes } from 'react';
import { createFileRoute, notFound, Link } from '@tanstack/react-router';
import { BlogNav } from '@/components/blog-nav';
import { blogSource } from '@/lib/source';
import { mdxComponents } from '@/components/mdx-components';

export const Route = createFileRoute('/blog/$slug')({
  loader: ({ params }) => {
    const page = blogSource.getPage([params.slug]);
    if (!page) throw notFound();
    return {
      title: page.data.title as string,
      description: (page.data.description as string) ?? '',
      date: page.data.date as string,
      author: page.data.author as string,
      tags: (page.data.tags as string[]) ?? [],
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    return {
      meta: [
        { title: `${loaderData.title} | Dunlo Blog` },
        { name: 'description', content: loaderData.description },
        { name: 'keywords', content: loaderData.tags.join(', ') },
        { property: 'og:title', content: loaderData.title },
        { property: 'og:description', content: loaderData.description },
        { property: 'og:type', content: 'article' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: loaderData.title },
        { name: 'twitter:description', content: loaderData.description },
      ],
    };
  },
  component: PostPage,
});

function PostPage() {
  const { slug } = Route.useParams();
  const meta = Route.useLoaderData();
  const page = blogSource.getPage([slug]);

  if (!page) return null;

  const Body = page.data.body as ComponentType<{
    components?: Record<string, ComponentType<HTMLAttributes<HTMLElement>>>;
  }>;

  return (
    <>
      <BlogNav />
      <main className="mx-auto max-w-2xl px-4 pt-32 pb-24">
        <Link
          to="/blog"
          className="text-sm text-dunlo-dim hover:text-dunlo transition-colors"
        >
          ← Back to blog
        </Link>

        <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900">
          {meta.title}
        </h1>

        <div className="mt-3 flex items-center gap-3 text-sm text-gray-400">
          <span>{meta.date}</span>
          <span>·</span>
          <span>{meta.author}</span>
        </div>

        {meta.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {meta.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-dunlo/10 px-3 py-0.5 text-xs font-medium text-dunlo-deep"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="prose prose-gray mt-10 max-w-none">
          <Body components={mdxComponents} />
        </div>
      </main>
    </>
  );
}
