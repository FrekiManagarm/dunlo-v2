import { pageSchema } from "fumadocs-core/source/schema";
import { defineCollections } from "fumadocs-mdx/config";
import { z } from "zod";

export const blogPosts = defineCollections({
  type: "doc",
  dir: "content/blog",
  schema: pageSchema.extend({
    description: z.string(),
    date: z.string(),
    seoTitle: z.string().optional(),
    updated: z.string().optional(),
    published: z.boolean().default(true),
    tags: z.array(z.string()).default([]),
    keywords: z.array(z.string()).default([]),
    author: z.string().optional(),
    readingTime: z.string().optional(),
  }),
});
