import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tmfajcgyjdncocqpskbn.supabase.co',
        port: '',
        pathname: '/storage/v1/object/sign/**',
      },
    ],
  },
  // Add server external packages for better compatibility
  serverExternalPackages: [],
  // Ensure proper output
  output: 'standalone',
  // Handle trailing slashes
  trailingSlash: false,
  // Enable strict mode
  reactStrictMode: true,
};

export default nextConfig;
