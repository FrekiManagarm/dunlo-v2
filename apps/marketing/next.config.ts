import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";

const appOrigin = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.dunlo.io";
const withMDX = createMDX();

const nextConfig: NextConfig = {
  transpilePackages: ["@dunlo-v2/ui"],
  async redirects() {
    return ["/login", "/signup", "/register", "/reset-password", "/onboarding"]
      .map((source) => ({
        source,
        destination: `${appOrigin}${source}`,
        permanent: false,
      }))
      .concat(
        {
          source: "/dashboard/:path*",
          destination: `${appOrigin}/dashboard/:path*`,
          permanent: false,
        },
        {
          source: "/alternatives/stripe-smart-retries",
          destination: "/stripe-smart-retries-alternative",
          permanent: true,
        },
        {
          source: "/blog/stripe-failure-codes-explained",
          destination: "/blog/stripe-failure-codes-the-complete-guide",
          permanent: true,
        },
        {
          source: "/blog/5-reasons-stripe-payments-fail",
          destination: "/blog/stripe-failure-codes-the-complete-guide",
          permanent: true,
        },
        {
          source: "/blog/complete-guide-involuntary-churn-saas",
          destination: "/blog/involuntary-churn-in-saas",
          permanent: true,
        },
        {
          source: "/blog/dunning-guide-for-saas",
          destination: "/stripe-dunning",
          permanent: true,
        },
        {
          source: "/blog/complete-guide-to-stripe-dunning",
          destination: "/stripe-dunning",
          permanent: true,
        },
        {
          source: "/blog/stripe-smart-retries-review",
          destination: "/stripe-smart-retries-alternative",
          permanent: true,
        },
        {
          source: "/vs/baremetrics",
          destination: "/alternatives/baremetrics",
          permanent: true,
        },
      );
  },
};

export default withMDX(nextConfig);
