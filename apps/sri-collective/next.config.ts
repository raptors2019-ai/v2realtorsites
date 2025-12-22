import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // Transpile workspace packages
  transpilePackages: ['@repo/ui', '@repo/chatbot', '@repo/analytics'],
}

export default nextConfig
