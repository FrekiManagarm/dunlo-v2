import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

const postSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.string(),
  published: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  author: z.string().optional(),
  readingTime: z.string().optional(),
});

export type BlogPostMeta = z.infer<typeof postSchema> & {
  slug: string;
};

export type BlogPost = BlogPostMeta & {
  content: string;
};

export function getBlogSlugs() {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

export function getPost(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const source = fs.readFileSync(filePath, "utf8");
  const parsed = matter(source);
  const meta = postSchema.parse(parsed.data);

  if (!meta.published) return null;

  return {
    ...meta,
    slug,
    content: parsed.content,
  };
}

export function getAllPosts() {
  return getBlogSlugs()
    .map((slug) => getPost(slug))
    .filter((post): post is BlogPost => Boolean(post))
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
}
