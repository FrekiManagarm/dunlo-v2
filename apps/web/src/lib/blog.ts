import { createServerFn } from "@tanstack/react-start";
import type { MDXContent } from "mdx/types";

const mdxModules = import.meta.glob<{ default: MDXContent }>(
  "../../content/blog/*.mdx",
  { eager: true },
);

export function getBlogBody(slug: string): MDXContent | null {
  return mdxModules[`../../../content/blog/${slug}.mdx`]?.default ?? null;
}

export const getAllPosts = createServerFn({ method: "GET" }).handler(
  async () => {
    const { blog } = await import("collections/server");
    const { loader } = await import("fumadocs-core/source");
    const { toFumadocsSource } = await import("fumadocs-mdx/runtime/server");

    const source = loader({
      baseUrl: "/blog",
      source: toFumadocsSource(blog, []),
    });

    return source
      .getPages()
      .filter((p) => p.data.published)
      .sort(
        (a, b) =>
          new Date(b.data.date).getTime() - new Date(a.data.date).getTime(),
      )
      .map((p) => ({
        slug: p.slugs[0]!,
        title: p.data.title,
        description: p.data.description,
        date: p.data.date,
        tags: p.data.tags,
      }));
  },
);

export const getPostMeta = createServerFn({ method: "GET" })
  .inputValidator((raw: unknown) => raw as string)
  .handler(async ({ data: slug }) => {
    const { blog } = await import("collections/server");
    const { loader } = await import("fumadocs-core/source");
    const { toFumadocsSource } = await import("fumadocs-mdx/runtime/server");

    const source = loader({
      baseUrl: "/blog",
      source: toFumadocsSource(blog, []),
    });

    const post = source.getPage([slug]);
    if (!post) return null;

    return {
      title: post.data.title,
      description: post.data.description,
      date: post.data.date,
      tags: post.data.tags,
      keywords: post.data.keywords,
    };
  });
