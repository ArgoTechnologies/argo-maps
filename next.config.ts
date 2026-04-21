import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  // eslint block was causing warnings in Next 15, removing it
};

export default nextConfig;
