import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce a self-contained Node.js server for Docker and VPS deployments.
  output: "standalone",
};

export default nextConfig;
