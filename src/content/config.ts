import { z, defineCollection } from 'astro:content';

const hirekCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    summary: z.string().optional(),
    featuredImage: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const eredmenyekCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    location: z.string().optional(),
    type: z.enum(['saját', 'külső_link']),
    externalUrl: z.string().optional(),
    featuredImage: z.string().optional(),
  }),
});

const versenykiirasCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    season: z.string().optional(),
  }),
});

const dokumentumokCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    pdf: z.string().optional(),
  }),
});

const pagesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    logo: z.string().optional(),
    bgImage: z.string().optional(),
    bgVideo: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
});

export const collections = {
  'hirek': hirekCollection,
  'eredmenyek': eredmenyekCollection,
  'versenykiiras': versenykiirasCollection,
  'dokumentumok': dokumentumokCollection,
  'pages': pagesCollection,
};
