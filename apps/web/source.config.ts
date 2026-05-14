import { defineCollections } from "fumadocs-mdx/config";
import { z } from "zod";

export const blog = defineCollections({
  type: "doc",
  dir: "./content/blog",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    published: z.boolean().default(true),
    tags: z.array(z.string()).default([]),
    keywords: z.array(z.string()).default([]),
  }),
});
