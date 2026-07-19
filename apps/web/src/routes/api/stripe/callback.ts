import { auth } from "@dunlo-v2/auth";
import { db } from "@dunlo-v2/db";
import { encrypt } from "@dunlo-v2/db/encrypt";
import { stripeConnection } from "@dunlo-v2/db/schema/domain";
import { env } from "@dunlo-v2/env/server";
import { createFileRoute } from "@tanstack/react-router";
import { and, eq } from "drizzle-orm";

import { seedDefaultSequences } from "@/functions/stripe";
import {
  clearStripeOAuthStateCookie,
  verifyStripeOAuthState,
} from "@/lib/stripe-oauth-state";
import { setupWebhooks } from "@/lib/stripe-webhooks";
import { triggerDiagnostic } from "@/trigger/run-diagnostic";

const STATE_COOKIE = "stripe_oauth_state";

type StripeOAuthTokenResponse = {
  access_token: string;
  stripe_publishable_key?: string;
  stripe_user_id: string;
  scope?: string;
  livemode?: boolean;
};

function clearStateCookie(): string {
  return clearStripeOAuthStateCookie(env.NODE_ENV === "production");
}

function parseCookies(header: string | null): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;
  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator === -1) continue;
    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (key) cookies[key] = value;
  }
  return cookies;
}

function redirect(location: string): Response {
  return new Response(null, {
    status: 302,
    headers: { Location: location, "Set-Cookie": clearStateCookie() },
  });
}

function redirectWithError(error: string): Response {
  return redirect(`/onboarding?error=${encodeURIComponent(error)}`);
}

async function exchangeCode(
  code: string,
): Promise<StripeOAuthTokenResponse | null> {
  const response = await fetch("https://connect.stripe.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_secret: env.STRIPE_SECRET_KEY,
    }).toString(),
  });
  if (!response.ok) return null;
  return (await response.json()) as StripeOAuthTokenResponse;
}

export const Route = createFileRoute("/api/stripe/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const stateNonce = url.searchParams.get("state");
          const code = url.searchParams.get("code");
          if (url.searchParams.has("error"))
            return redirectWithError("oauth_denied");
          if (!stateNonce || !code)
            return redirectWithError("missing_code_or_state");

          const session = await auth.api.getSession({
            headers: request.headers,
          });
          if (!session?.user) return redirect("/login");

          const sealed = parseCookies(request.headers.get("cookie"))[
            STATE_COOKIE
          ];
          if (!sealed) return redirectWithError("invalid_oauth_state");
          const oauthState = verifyStripeOAuthState(sealed, {
            nonce: stateNonce,
            userId: session.user.id,
            now: new Date(),
            secret: env.BETTER_AUTH_SECRET,
          });

          const token = await exchangeCode(code);
          if (!token) {
            console.error("[stripe/callback]", {
              errorCategory: "token_exchange_failed",
            });
            return redirectWithError("token_exchange_failed");
          }

          if (oauthState.intent === "diagnostic") {
            if (token.scope !== "read_only") {
              return redirectWithError("unexpected_oauth_scope");
            }
            const [accountOwner] = await db
              .select({
                id: stripeConnection.id,
                userId: stripeConnection.userId,
              })
              .from(stripeConnection)
              .where(eq(stripeConnection.stripeAccountId, token.stripe_user_id))
              .limit(1);
            if (accountOwner && accountOwner.userId !== session.user.id) {
              return redirectWithError("stripe_account_in_use");
            }

            const connectionValues = {
              accessToken: encrypt(token.access_token),
              publishableKey: token.stripe_publishable_key ?? null,
              webhookEndpointId: null,
              webhookSecret: null,
              scope: "read_only",
              phase: "diagnosing" as const,
              monitoringEnabled: false,
              liveMode: token.livemode ?? null,
            };
            let connectionId: string;
            if (accountOwner) {
              connectionId = accountOwner.id;
              await db
                .update(stripeConnection)
                .set(connectionValues)
                .where(eq(stripeConnection.id, accountOwner.id));
            } else {
              connectionId = crypto.randomUUID();
              await db.insert(stripeConnection).values({
                id: connectionId,
                userId: session.user.id,
                stripeAccountId: token.stripe_user_id,
                ...connectionValues,
                escalationThreshold: 50000,
                escalationCurrency: "eur",
              });
            }

            await triggerDiagnostic({ connectionId, reason: "initial" });
            return redirect(oauthState.returnPath);
          }

          if (
            token.scope !== "read_write" ||
            token.stripe_user_id !== oauthState.targetStripeAccountId
          ) {
            return redirectWithError("stripe_account_mismatch");
          }
          const [connection] = await db
            .select({ id: stripeConnection.id })
            .from(stripeConnection)
            .where(
              and(
                eq(stripeConnection.userId, session.user.id),
                eq(
                  stripeConnection.stripeAccountId,
                  oauthState.targetStripeAccountId,
                ),
              ),
            )
            .limit(1);
          if (!connection) return redirectWithError("stripe_account_mismatch");

          await db
            .update(stripeConnection)
            .set({
              accessToken: encrypt(token.access_token),
              publishableKey: token.stripe_publishable_key ?? null,
              scope: "read_write",
              phase: "write_authorized",
              liveMode: token.livemode ?? null,
            })
            .where(eq(stripeConnection.id, connection.id));
          await setupWebhooks(token.stripe_user_id, token.access_token);
          await seedDefaultSequences(session.user.id, { isActive: false });
          return redirect(oauthState.returnPath);
        } catch {
          console.error("[stripe/callback]", {
            errorCategory: "oauth_callback",
          });
          return redirectWithError("stripe_failed");
        }
      },
    },
  },
});
