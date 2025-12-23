import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'trreb-image.ampre.ca',
      },
      {
        protocol: 'https',
        hostname: '*.ampre.ca',
      },
      {
        protocol: 'https',
        hostname: 'media.ampre.ca',
      },
      {
        protocol: 'http',
        hostname: 'trreb-image.ampre.ca',
      },
    ],
  },
  // Transpile workspace packages
  transpilePackages: ['@repo/ui', '@repo/chatbot', '@repo/analytics'],
}

export default nextConfig
