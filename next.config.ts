import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite ships a WASM binary and must not be bundled by the server compiler.
  serverExternalPackages: ["@electric-sql/pglite"],
  async redirects() {
    return [
      // Retired offers. 301 rather than 404 so old ad links, printed material
      // and anything Google still has indexed lands on live pricing.
      { source: "/3for75", destination: "/book", permanent: true },
      { source: "/3for75/:path*", destination: "/book", permanent: true },
      { source: "/3for79", destination: "/book", permanent: true },
      { source: "/3for79/:path*", destination: "/book", permanent: true },
      { source: "/3for49", destination: "/book", permanent: true },
      { source: "/3for49/:path*", destination: "/book", permanent: true },
    ];
  },
};

export default nextConfig;
