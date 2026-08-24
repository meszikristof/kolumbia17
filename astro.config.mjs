// @ts-check
import { defineConfig } from 'astro/config';
import rehypeDocumentEmbed from './src/utils/rehype-document-embed.js';

// https://astro.build/config
export default defineConfig({
  site: 'https://kolumbia17.vercel.app',
  markdown: {
    rehypePlugins: [
      [rehypeDocumentEmbed, { site: 'https://kolumbia17.vercel.app' }],
    ],
  },
});

