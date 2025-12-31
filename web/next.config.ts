import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  // Turbo pack configuration
  // turbopack: {}, 
};

const isDev = process.env.NODE_ENV === 'development';

// Apply both plugins: next-intl first, then PWA in production
export default isDev ? withNextIntl(nextConfig) : withPWA(withNextIntl(nextConfig));
