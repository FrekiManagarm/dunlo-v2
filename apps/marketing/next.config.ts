import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";

const appOrigin = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.dunlo.io";
const withMDX = createMDX();

const nextConfig: NextConfig = {
  transpilePackages: ["@dunlo-v2/ui"],
  async redirects() {
    return [
      "/login",
      "/signup",
      "/register",
      "/reset-password",
      "/onboarding",
      "/benchmark",
    ].map((source) => ({
      source,
      destination: `${appOrigin}${source}`,
      permanent: false,
    })).concat({
      source: "/dashboard/:path*",
      destination: `${appOrigin}/dashboard/:path*`,
      permanent: false,
    });
  },
};

export default withMDX(nextConfig);
