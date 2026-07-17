import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ignoreBuildErrors is needed because the repo includes examples/ and
  // mini-services/ with TS errors that are not part of the Next.js app.
  // Vercel runs tsc on the whole repo during build.
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  output: "standalone",
};

export default nextConfig;
