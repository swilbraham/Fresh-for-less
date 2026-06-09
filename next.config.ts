import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/3for75", destination: "/3for79", permanent: true },
      { source: "/3for75/:path*", destination: "/3for79", permanent: true },
    ];
  },
};

export default nextConfig;
