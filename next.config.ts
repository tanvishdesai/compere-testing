import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure proper handling of environment variables during build
  env: {
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
  },
};

export default nextConfig;
