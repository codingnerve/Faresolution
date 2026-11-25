import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  async redirects() {
    return [
      // The directory's sibling indexes live at the top level.
      { source: "/software/categories", destination: "/categories", permanent: true },
      { source: "/software/alternatives", destination: "/alternatives", permanent: true },
      // No page of its own: the product finder that starts a draft is on /reviews.
      // A real 307 here (a page-level redirect() would stream as a meta refresh under Cache Components).
      { source: "/reviews/write", destination: "/reviews#draft-title", permanent: false },
    ];
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
