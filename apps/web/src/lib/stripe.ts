import { env } from "@dunlo-v2/env/server";
import Stripe from "stripe";

const STRIPE_API_VERSION = "2024-12-18.acacia" as Stripe.LatestApiVersion;

export function getPlatformStripe(): Stripe {
  return new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: STRIPE_API_VERSION,
    typescript: true,
    appInfo: {
      name: "Dunlo",
      url: env.APP_URL,
    },
  });
}

export function getConnectedStripe(accessToken: string): Stripe {
  return new Stripe(accessToken, {
    apiVersion: STRIPE_API_VERSION,
    typescript: true,
    appInfo: {
      name: "Dunlo",
      url: env.APP_URL,
    },
  });
}
