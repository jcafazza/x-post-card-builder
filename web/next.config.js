const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use web/ as tracing root so server vendor chunks resolve correctly (repo has root + web package.json).
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
      },
      {
        protocol: 'https',
        hostname: '**.twimg.com',
      },
    ],
  },
  // Stricter React checks in development.
  reactStrictMode: true,
}

module.exports = nextConfig
