import { auth } from "@dunlo-v2/auth";
import { db } from "@dunlo-v2/db";
import { encrypt } from "@dunlo-v2/db/encrypt";
import {
  diagnosticSnapshot,
  stripeConnection,
} from "@dunlo-v2/db/schema/domain";
import { env } from "@dunlo-v2/env/server";
import { createFileRoute } from "@tanstack/react-router";
import { and, eq, exists } from "drizzle-orm";

import { seedDefaultSequences } from "@/functions/stripe";
import {
  clearStripeOAuthStateCookie,
  verifyStripeOAuthState,
} from "@/lib/stripe-oauth-state";
import { reconcileWebhook } from "@/lib/stripe-webhooks";
import { triggerDiagnostic } from "@/trigger/run-diagnostic";

const STATE_COOKIE = "stripe_oauth_state";
const DIAGNOSTIC_DOWNGRADE_PHASES = new Set([
  "write_authorized",
  "email_configured",
  "recovery_active",
]);

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
                phase: stripeConnection.phase,
              })
              .from(stripeConnection)
              .where(eq(stripeConnection.stripeAccountId, token.stripe_user_id))
              .limit(1);
            if (accountOwner && accountOwner.userId !== session.user.id) {
              return redirectWithError("stripe_account_in_use");
            }
            if (
              accountOwner &&
              DIAGNOSTIC_DOWNGRADE_PHASES.has(accountOwner.phase)
            ) {
              return redirectWithError("diagnostic_downgrade_not_allowed");
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
            .innerJoin(
              diagnosticSnapshot,
              and(
                eq(diagnosticSnapshot.connectionId, stripeConnection.id),
                eq(diagnosticSnapshot.isCurrent, true),
              ),
            )
            .where(
              and(
                eq(stripeConnection.userId, session.user.id),
                eq(
                  stripeConnection.stripeAccountId,
                  oauthState.targetStripeAccountId,
                ),
                eq(stripeConnection.phase, "diagnostic_ready"),
                eq(diagnosticSnapshot.verdict, "activation_recommended"),
              ),
            )
            .limit(1);
          if (!connection) return redirectWithError("stripe_account_mismatch");

          const currentRecommendation = db
            .select({ id: diagnosticSnapshot.id })
            .from(diagnosticSnapshot)
            .where(
              and(
                eq(diagnosticSnapshot.connectionId, connection.id),
                eq(diagnosticSnapshot.isCurrent, true),
                eq(diagnosticSnapshot.verdict, "activation_recommended"),
              ),
            );
          const [authorized] = await db
            .update(stripeConnection)
            .set({
              accessToken: encrypt(token.access_token),
              publishableKey: token.stripe_publishable_key ?? null,
              scope: "read_write",
              phase: "write_authorized",
              liveMode: token.livemode ?? null,
            })
            .where(
              and(
                eq(stripeConnection.id, connection.id),
                eq(stripeConnection.userId, session.user.id),
                eq(stripeConnection.phase, "diagnostic_ready"),
                exists(currentRecommendation),
              ),
            )
            .returning({ id: stripeConnection.id });
          if (!authorized) return redirectWithError("activation_not_available");
          const webhook = await reconcileWebhook(
            token.stripe_user_id,
            token.access_token,
          );
          if (!webhook) {
            await db
              .update(stripeConnection)
              .set({ phase: "activation_requested" })
              .where(eq(stripeConnection.id, connection.id));
            return redirectWithError("activation_retryable");
          }
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
