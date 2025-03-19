import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
  build: {
    target: 'esnext',
  },
  plugins: [react(), tsconfigPaths({ projects: ['./tsconfig.json'] }), tailwindcss()],
  server: {
    host: true,
  },
});
