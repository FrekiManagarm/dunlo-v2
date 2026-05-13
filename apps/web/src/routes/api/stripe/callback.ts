import { auth } from "@dunlo-v2/auth";
import { db } from "@dunlo-v2/db";
import { encrypt } from "@dunlo-v2/db/encrypt";
import { stripeConnection } from "@dunlo-v2/db/schema/domain";
import { env } from "@dunlo-v2/env/server";
import { createFileRoute } from "@tanstack/react-router";

import { seedDefaultSequences } from "@/functions/stripe";
import { getConnectedStripe } from "@/lib/stripe";

const STATE_COOKIE = "stripe_oauth_state";

const WEBHOOK_EVENTS: string[] = [
  "payment_intent.payment_failed",
  "payment_intent.succeeded",
  "invoice.payment_failed",
  "invoice.payment_succeeded",
];

function clearStateCookie(): string {
  const parts = [
    `${STATE_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
  ];
  if (env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key) out[key] = decodeURIComponent(value);
  }
  return out;
}

function redirectWithError(message: string): Response {
  const params = new URLSearchParams({
    error: "stripe_failed",
    msg: message,
  });
  return new Response(null, {
    status: 302,
    headers: {
      Location: `/onboarding?${params.toString()}`,
      "Set-Cookie": clearStateCookie(),
    },
  });
}

type StripeOAuthTokenResponse = {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  stripe_publishable_key?: string;
  stripe_user_id: string;
  scope?: string;
  livemode?: boolean;
};

export const Route = createFileRoute("/api/stripe/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const code = url.searchParams.get("code");
          const state = url.searchParams.get("state");
          const errorParam = url.searchParams.get("error");

          if (errorParam) {
            return redirectWithError(errorParam);
          }

          if (!code || !state) {
            return redirectWithError("missing_code_or_state");
          }

          const cookies = parseCookies(request.headers.get("cookie"));
          const cookieState = cookies[STATE_COOKIE];
          if (!cookieState || cookieState !== state) {
            return redirectWithError("invalid_state");
          }

          const session = await auth.api.getSession({
            headers: request.headers,
          });
          if (!session?.user) {
            return new Response(null, {
              status: 302,
              headers: { Location: "/login" },
            });
          }

          const tokenRes = await fetch(
            "https://connect.stripe.com/oauth/token",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                grant_type: "authorization_code",
                code,
                client_secret: env.STRIPE_SECRET_KEY,
              }).toString(),
            },
          );

          if (!tokenRes.ok) {
            const errBody = await tokenRes.text();
            console.error("[stripe/callback] token exchange failed", errBody);
            return redirectWithError("token_exchange_failed");
          }

          const token = (await tokenRes.json()) as StripeOAuthTokenResponse;

          const connectedStripe = getConnectedStripe(token.access_token);
          const webhook = await connectedStripe.webhookEndpoints.create({
            url: `${env.APP_URL}/api/stripe/webhook`,
            enabled_events: WEBHOOK_EVENTS as never,
          });

          if (!webhook.secret) {
            return redirectWithError("webhook_secret_missing");
          }

          await db.insert(stripeConnection).values({
            id: crypto.randomUUID(),
            userId: session.user.id,
            stripeAccountId: token.stripe_user_id,
            accessToken: encrypt(token.access_token),
            publishableKey: token.stripe_publishable_key ?? null,
            webhookEndpointId: webhook.id,
            webhookSecret: encrypt(webhook.secret),
            scope: token.scope ?? "read_write",
            escalationThreshold: 50000,
            escalationCurrency: "eur",
          });

          await seedDefaultSequences(session.user.id);

          return new Response(null, {
            status: 302,
            headers: {
              Location: "/dashboard?stripe=connected",
              "Set-Cookie": clearStateCookie(),
            },
          });
        } catch (err) {
          console.error("[stripe/callback] error", err);
          const message =
            err instanceof Error ? err.message.slice(0, 200) : "unknown";
          return redirectWithError(message);
        }
      },
    },
  },
});
