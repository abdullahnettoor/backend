/** @type {import('next').NextConfig} */
import serverConfig from './server.config.js';

const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('ws');
    }
    return config;
  },
  env: {
    VERCEL_URL: process.env.VERCEL_URL,
  }
};

export default nextConfig;
