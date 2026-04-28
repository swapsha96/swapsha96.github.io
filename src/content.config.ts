import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const links = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/links' }),
  schema: z.object({
    title: z.string(),
    url: z.string(),
    icon: z.enum([
      'instagram',
      'twitter',
      'linkedin',
      'goodreads',
      'playstation',
      'email',
      'github',
    ]),
    order: z.number().default(99),
  }),
});

const sections = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/sections' }),
  // We don't need a schema for the body, as we'll use the raw content or rendered HTML
  schema: z.object({
    // No frontmatter required for sections unless we want metadata
  }),
});

export const collections = { links, sections };
