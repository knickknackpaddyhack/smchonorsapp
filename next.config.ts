import type {NextConfig} from 'next';

// Explicitly load environment variables from .env
require('dotenv').config({ path: './.env' });

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  devIndicators: {
    allowedDevOrigins: [
      'https://6000-firebase-studio-1751643442833.cluster-2xfkbshw5rfguuk5qupw267afs.cloudworkstations.dev',
    ],
  },
};

export default nextConfig;
