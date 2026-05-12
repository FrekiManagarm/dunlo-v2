import { defineDocs, frontmatterSchema } from 'fumadocs-mdx/config';
import { z } from 'zod';

export const blog = defineDocs({
  dir: 'content/blog',
  docs: {
    schema: frontmatterSchema.extend({
      date: z.coerce.string(),
      author: z.string(),
      tags: z.array(z.string()).default([]),
    }),
  },
});
