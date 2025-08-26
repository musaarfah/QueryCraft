import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  eslint: {
    ignoreDuringBuilds: true, // 👈 disables ESLint errors from breaking build
  },
  typescript: {
    ignoreBuildErrors: true, // 👈 disables TS errors from breaking build
  },
};

export default nextConfig;
