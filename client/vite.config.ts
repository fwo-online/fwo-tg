import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { analyzer } from 'vite-bundle-analyzer';
import solid from 'vite-plugin-solid';

export default defineConfig({
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
  plugins: [solid(), tailwindcss(), analyzer()],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    host: true,
  },
});
