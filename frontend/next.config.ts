// next.config.js
import { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: undefined, // remove output/export entirely
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;