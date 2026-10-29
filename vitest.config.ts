import { defineConfig } from 'vitest/config';
import path from 'path';
import { fumadocsMdx } from 'fumadocs-mdx/vite';

export default defineConfig({
  plugins: [fumadocsMdx()],
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/unit/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    server: {
      deps: {
        inline: ['next-intl'],
      },
    },
  },
  resolve: {
    alias: [
      { find: '@/.source', replacement: path.resolve(import.meta.dirname, './.source/server.ts') },
      { find: '@', replacement: path.resolve(import.meta.dirname, './src') },
      { find: /^next\/navigation$/, replacement: 'next/navigation.js' },
    ],
  },
});
