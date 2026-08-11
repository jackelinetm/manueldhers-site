import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// URL canónica del sitio. Cambiar solo si se usa otro dominio.
export default defineConfig({
  site: 'https://manueldhers.com',
  // WordPress usaba barra final en todas las URLs -> la conservamos para no romper enlaces.
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap()],
});
