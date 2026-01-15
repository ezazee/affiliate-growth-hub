/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'blsfkizrchqzahqa.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ca5yf9xs9e2wju3x.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year cache for static images
  },

  // Performance optimizations
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react', '@radix-ui/react-icons'],
    optimizeCss: true,
    scrollRestoration: true,
    largePageDataBytes: 128 * 1000, // 128KB
  },

  // Compression
  compress: true,

  // Cache headers for API routes
  async headers() {
    return [
      {
        source: '/api/public/:path*',
        headers: [
          { 
            key: 'Cache-Control', 
            value: 'public, s-maxage=3600, stale-while-revalidate=86400' 
          }
        ]
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          { 
            key: 'Cache-Control', 
            value: 'public, max-age=31536000, immutable' 
          }
        ]
      },
      {
        source: '/images/(.*)',
        headers: [
          { 
            key: 'Cache-Control', 
            value: 'public, max-age=31536000, immutable' 
          }
        ]
      }
    ]
  },

  // Turbopack configuration (replaces webpack for Next.js 16)
  turbopack: {
    // Enable Turbopack optimizations
  },

  // Bundle optimization (only if webpack is used)
  webpack: (config, { dev, isServer }) => {
    // Tree shaking for framer-motion
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'framer-motion': 'framer-motion/dist/framer-motion.min.js',
      }
    }

    return config
  },

  // Enable standalone output for better performance
  output: 'standalone',
};

export default nextConfig;