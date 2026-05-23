import { loader } from "fumadocs-core/source";
import { toFumadocsSource } from "fumadocs-mdx/runtime/server";
import { blogPosts } from "collections/server";

const blogSource = loader({
  baseUrl: "/blog",
  source: toFumadocsSource(blogPosts, []),
});

export type BlogPostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  published: boolean;
  tags: string[];
  keywords: string[];
  author?: string;
  readingTime?: string;
};

function toPostMeta(page: ReturnType<typeof blogSource.getPages>[number]) {
  return {
    slug: page.slugs[0] ?? "",
    title: page.data.title,
    description: page.data.description,
    date: page.data.date,
    published: page.data.published,
    tags: page.data.tags,
    keywords: page.data.keywords,
    author: page.data.author,
    readingTime: page.data.readingTime,
  } satisfies BlogPostMeta;
}

export function getBlogSlugs() {
  return blogSource.getPages()
    .filter((page) => page.data.published)
    .map((page) => page.slugs[0] ?? "")
    .filter(Boolean);
}

export function getPost(slug: string) {
  const page = blogSource.getPage([slug]);
  if (!page || !page.data.published) return null;

  return page;
}

export function getAllPosts() {
  return blogSource
    .getPages()
    .filter((page) => page.data.published)
    .map(toPostMeta)
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
}
