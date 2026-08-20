import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite ships a WASM binary and must not be bundled by the server compiler.
  serverExternalPackages: ["@electric-sql/pglite"],
  async redirects() {
    return [
      { source: "/3for75", destination: "/3for79", permanent: true },
      { source: "/3for75/:path*", destination: "/3for79", permanent: true },
    ];
  },
};

export default nextConfig;
