import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 以下のenvブロックを追記します
  env: {
    WORDPRESS_GRAPHQL_ENDPOINT: process.env.WORDPRESS_GRAPHQL_ENDPOINT,
  },
};

export default nextConfig;
