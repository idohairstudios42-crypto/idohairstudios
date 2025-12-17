/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Disable ESLint during production builds on Vercel
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable type checking during production builds on Vercel
    ignoreBuildErrors: true,
  },
  images: {
    // Disable optimization for external images to prevent timeout errors
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    formats: ['image/webp'],
    minimumCacheTTL: 60 * 60 * 24, // Cache images for 24 hours
    deviceSizes: [640, 750, 828, 1080, 1200], // Optimize for common mobile sizes
  },
  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  compress: true,
  poweredByHeader: false,

  webpack: (config, { isServer }) => {
    // Add alias for @ to resolve to root directory
    config.resolve.alias['@'] = path.resolve(__dirname);

    return config;
  },
}

module.exports = nextConfig 