import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const hirekCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/hirek" }),
  schema: ({ image }) => z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string().optional(),
    featuredImage: image().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const eredmenyekCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/eredmenyek" }),
  schema: ({ image }) => z.object({
    title: z.string(),
    date: z.coerce.date(),
    location: z.string().optional(),
    type: z.enum(['saját', 'külső_link']),
    externalUrl: z.string().optional(),
    featuredImage: image().optional(),
  }),
});

const versenykiirasCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/versenykiiras" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    season: z.string().optional(),
  }),
});

const dokumentumokCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/dokumentumok" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    pdf: z.string().optional(),
  }),
});

const pagesCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: ({ image }) => z.object({
    title: z.string(),
    logo: image().optional(),
    bgImage: image().optional(),
    bgVideo: z.string().optional(),
    hideHeroTitle: z.boolean().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    orgName: z.string().optional(),
    taxNumber: z.string().optional(),
    officials: z.array(
      z.object({
        groupName: z.string(),
        members: z.array(
          z.object({
            role: z.string(),
            name: z.string(),
            phone: z.string().optional(),
            email: z.string().optional(),
          })
        ),
      })
    ).optional(),
  }),
});

export const collections = {
  'hirek': hirekCollection,
  'eredmenyek': eredmenyekCollection,
  'versenykiiras': versenykiirasCollection,
  'dokumentumok': dokumentumokCollection,
  'pages': pagesCollection,
};
