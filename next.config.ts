import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ESLint runs as its own required verification command; avoid Next 15's flat-config false warning.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
