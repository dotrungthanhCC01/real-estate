import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Convenience aliases
      { source: "/mua-ban", destination: "/properties?type=buy", permanent: false },
      { source: "/cho-thue", destination: "/properties?type=rent", permanent: false },
    ];
  },
};

export default nextConfig;
