import { createFileRoute, Link } from '@tanstack/react-router';
import { BlogNav } from '@/components/blog-nav';
import { blogSource } from '@/lib/source';

export const Route = createFileRoute('/blog/')({
  loader: () => {
    const pages = blogSource.getPages();
    return pages
      .map((page) => ({
        slug: page.slugs.join('/'),
        url: page.url,
        title: page.data.title as string,
        description: (page.data.description as string) ?? '',
        date: page.data.date as string,
        author: page.data.author as string,
        tags: (page.data.tags as string[]) ?? [],
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
  head: () => ({
    meta: [
      { title: 'Dunlo Blog' },
      {
        name: 'description',
        content: 'Insights on payment recovery, SaaS revenue, and building Dunlo.',
      },
      { property: 'og:title', content: 'Dunlo Blog' },
      {
        property: 'og:description',
        content: 'Insights on payment recovery, SaaS revenue, and building Dunlo.',
      },
      { property: 'og:url', content: 'https://dunlo.io/blog' },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const posts = Route.useLoaderData();
  const [featured, ...rest] = posts;

  return (
    <>
      <BlogNav />
      <main className="mx-auto max-w-5xl px-4 pt-32 pb-24">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Blog</h1>
        <p className="mt-2 text-gray-500">
          Insights on payment recovery, SaaS revenue, and building Dunlo.
        </p>

        {featured && (
          <Link
            to="/blog/$slug"
            params={{ slug: featured.slug }}
            className="mt-10 block overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="inline-block rounded-full bg-dunlo/10 px-3 py-1 text-xs font-semibold text-dunlo-deep">
              Latest
            </span>
            <h2 className="mt-3 text-2xl font-bold text-gray-900">{featured.title}</h2>
            <p className="mt-2 text-gray-500">{featured.description}</p>
            <div className="mt-4 flex items-center gap-3 text-sm text-gray-400">
              <span>{featured.date}</span>
              <span>·</span>
              <span>{featured.author}</span>
            </div>
            <span className="mt-4 inline-block text-sm font-medium text-dunlo-dim hover:text-dunlo transition-colors">
              Read more →
            </span>
          </Link>
        )}

        {rest.length > 0 && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <Link
                key={post.slug}
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className="block overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <h3 className="font-semibold text-gray-900">{post.title}</h3>
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{post.description}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                  <span>{post.date}</span>
                  <span>·</span>
                  <span>{post.author}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {posts.length === 0 && (
          <p className="mt-12 text-center text-gray-400">No posts yet.</p>
        )}
      </main>
    </>
  );
}
