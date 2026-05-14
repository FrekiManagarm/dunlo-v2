import { blog } from "collections/server";
import { loader } from "fumadocs-core/source";
import { toFumadocsSource } from "fumadocs-mdx/runtime/server";

const blogSource = loader({
  baseUrl: "/blog",
  source: toFumadocsSource(blog, []),
});

export function getAllPosts() {
  return blogSource
    .getPages()
    .filter((p) => p.data.published)
    .sort(
      (a, b) =>
        new Date(b.data.date).getTime() - new Date(a.data.date).getTime(),
    );
}

export function getPost(slug: string) {
  return blogSource.getPage([slug]);
}
