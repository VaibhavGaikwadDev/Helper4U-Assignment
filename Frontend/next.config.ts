import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

// next.config.js
module.exports = {
  allowedDevOrigins: ['192.168.0.100'],
}

export default nextConfig;
