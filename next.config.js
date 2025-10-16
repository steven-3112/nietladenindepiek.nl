/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'img.logo.dev',
      },
    ],
  },
  
  // Development optimizations
  ...(process.env.NODE_ENV === 'development' && {
    // Disable static optimization in development for better HMR
    experimental: {
      // Improve HMR reliability
      esmExternals: false,
    },
    // Better file watching
    webpack: (config, { dev, isServer }) => {
      if (dev && !isServer) {
        // Improve HMR performance
        config.watchOptions = {
          poll: 1000,
          aggregateTimeout: 300,
        };
      }
      return config;
    },
  }),
};

module.exports = nextConfig;

