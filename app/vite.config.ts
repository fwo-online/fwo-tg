import preact from '@preact/preset-vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { analyzer } from 'vite-bundle-analyzer';

export default defineConfig({
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
  plugins: [
    preact({ reactAliasesEnabled: true }),
    tsconfigPaths({ projects: ['./tsconfig.json'] }),
    analyzer({ openAnalyzer: true }),
  ],
  // publicDir: './assets',
  server: {
    host: true,
  },
});
