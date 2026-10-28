import nextConfig from 'eslint-config-next';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '*.config.mjs',
      '*.config.ts',
    ],
  },
  ...nextConfig,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
];
