import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      // The old /admin marketing mock is gone; the real admin app lives
      // elsewhere. Send anyone landing here to their account instead.
      { source: "/admin", destination: "/dashboard", permanent: false },
      { source: "/admin/:path*", destination: "/dashboard", permanent: false },
    ];
  },
};

export default nextConfig;
