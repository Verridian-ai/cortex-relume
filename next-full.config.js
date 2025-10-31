/** @type {import('next').NextConfig} */
const webpack = require('webpack');

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['sharp'],
    optimizeCss: true,
    optimizeServerReact: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.openai.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_APP_NAME: 'Cortex Relume',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },
  webpack: (config, { isServer }) => {
    // Handle environment variables that need to be available in the client
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.NEXT_PUBLIC_GPT5_ENABLED': JSON.stringify(
          process.env.NEXT_PUBLIC_ENABLE_AI_FEATURES === 'true'
        ),
        'process.env.NEXT_PUBLIC_COMPONENT_LIBRARY_ENABLED': JSON.stringify(
          process.env.NEXT_PUBLIC_ENABLE_COMPONENT_LIBRARY === 'true'
        ),
      })
    );

    // Optimize for production builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    return config;
  },
  // Enable React strict mode
  reactStrictMode: true,
  
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
  
  // Redirect rules
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;