// @ts-check
import { defineConfig } from 'astro/config';
import remarkDocumentEmbed from './src/utils/remark-document-embed.js';

// https://astro.build/config
export default defineConfig({
  site: 'https://kolumbia17.vercel.app',
  markdown: {
    remarkPlugins: [
      [remarkDocumentEmbed, { site: 'https://kolumbia17.vercel.app' }],
    ],
  },
});
