/** @type {import('next').NextConfig} */
import serverConfig from './server.config.js';

const nextConfig = {
  ...serverConfig,
  env: {
    VERCEL_URL: process.env.VERCEL_URL,
  }
};

export default nextConfig;
