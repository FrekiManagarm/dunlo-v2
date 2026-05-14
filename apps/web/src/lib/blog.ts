import { blog } from "collections/server";
import { loader } from "fumadocs-core/source";

const blogSource = loader({
  baseUrl: "/blog",
  source: blog.toFumadocsSource(),
});

export function getAllPosts() {
  return blogSource
    .getPages()
    .filter((p) => p.data.published)
    .sort(
      (a, b) =>
        new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
    );
}

export function getPost(slug: string) {
  return blogSource.getPage([slug]);
}
