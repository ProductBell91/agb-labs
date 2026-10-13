import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const work = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    tagline: z.string(),
    summary: z.string(),
    status: z.enum(['live', 'beta', 'internal']),
    order: z.number(),
    role: z.string(),
    timeframe: z.string(),
    stack: z.array(z.string()),
    links: z.array(z.object({ label: z.string(), href: z.string().url() })).default([]),
    shots: z.array(z.object({ src: z.string(), alt: z.string() })).default([]),
    metrics: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
    // Only flagships with a finished write-up get a page; the rest show as cards.
    published: z.boolean().default(false),
  }),
});

export const collections = { work };
