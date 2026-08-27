import type { NextConfig } from "next";

const apiAdresi = (process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api")
  .replace(/\/$/, "");

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${apiAdresi}/:path*` }];
  },
};

export default nextConfig;
