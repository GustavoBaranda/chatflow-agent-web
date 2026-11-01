import createNextIntlPlugin from 'next-intl/plugin';
import { createMDX } from 'fumadocs-mdx/next';

const withNextIntl = createNextIntlPlugin();
const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  agentRules: false,
  experimental: {
    cpus: 2,
  },
  webpack: (config) => {
    // Disable Webpack filesystem cache to prevent Windows EPERM mkdir file-lock races in sandbox
    config.cache = false;
    return config;
  },
};

export default withNextIntl(withMDX(nextConfig));
