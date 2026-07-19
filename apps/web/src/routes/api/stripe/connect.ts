import { auth } from "@dunlo-v2/auth";
import { db } from "@dunlo-v2/db";
import {
  diagnosticSnapshot,
  stripeConnection,
} from "@dunlo-v2/db/schema/domain";
import { env } from "@dunlo-v2/env/server";
import { createFileRoute } from "@tanstack/react-router";
import { and, desc, eq, inArray } from "drizzle-orm";

import {
  buildStripeOAuthStateCookie,
  createStripeOAuthState,
  isInternalStripeOAuthReturnPath,
  type StripeOAuthIntent,
} from "@/lib/stripe-oauth-state";

type ActivationConnection = {
  stripeAccountId: string;
  planCode: string;
};

const DIAGNOSTIC_DOWNGRADE_PHASES = [
  "write_authorized",
  "email_configured",
  "recovery_active",
] as const;

function isSafeReturnPath(value: string | null, fallback: string): string {
  if (!value || !isInternalStripeOAuthReturnPath(value)) {
    return fallback;
  }
  return value;
}

async function hasDiagnosticDowngradeConnection(
  userId: string,
): Promise<boolean> {
  const [connection] = await db
    .select({ id: stripeConnection.id })
    .from(stripeConnection)
    .where(
      and(
        eq(stripeConnection.userId, userId),
        inArray(stripeConnection.phase, DIAGNOSTIC_DOWNGRADE_PHASES),
      ),
    )
    .limit(1);
  return Boolean(connection);
}

function redirectToOnboarding(error: string): Response {
  return new Response(null, {
    status: 302,
    headers: { Location: `/onboarding?error=${encodeURIComponent(error)}` },
  });
}

function emitOAuthEvent(
  event: "diagnostic_oauth_started" | "diagnostic_activation_started",
  intent: StripeOAuthIntent,
  planBand: string,
): void {
  console.info("[stripe/oauth]", { event, intent, planBand });
}

async function findActivationConnection(
  userId: string,
): Promise<ActivationConnection | null> {
  const [connection] = await db
    .select({
      stripeAccountId: stripeConnection.stripeAccountId,
      planCode: diagnosticSnapshot.planCode,
    })
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
        eq(stripeConnection.userId, userId),
        inArray(stripeConnection.phase, [
          "diagnostic_ready",
          "activation_requested",
        ]),
        eq(diagnosticSnapshot.verdict, "activation_recommended"),
      ),
    )
    .orderBy(desc(diagnosticSnapshot.createdAt))
    .limit(1);
  return connection ?? null;
}

export const Route = createFileRoute("/api/stripe/connect")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session?.user) {
          return new Response(null, {
            status: 302,
            headers: { Location: "/login" },
          });
        }

        const url = new URL(request.url);
        const requestedIntent = url.searchParams.get("intent") ?? "diagnostic";
        if (
          requestedIntent !== "diagnostic" &&
          requestedIntent !== "activation"
        ) {
          return redirectToOnboarding("invalid_oauth_intent");
        }
        const intent = requestedIntent as StripeOAuthIntent;
        if (
          intent === "diagnostic" &&
          (await hasDiagnosticDowngradeConnection(session.user.id))
        ) {
          return redirectToOnboarding("diagnostic_downgrade_not_allowed");
        }
        const activation =
          intent === "activation"
            ? await findActivationConnection(session.user.id)
            : null;
        if (intent === "activation" && !activation) {
          return redirectToOnboarding("activation_not_available");
        }

        const returnPath = isSafeReturnPath(
          url.searchParams.get("returnTo"),
          intent === "diagnostic" ? "/onboarding?step=2" : "/onboarding?step=3",
        );
        const state = createStripeOAuthState(
          {
            nonce: crypto.randomUUID(),
            userId: session.user.id,
            intent,
            ...(activation
              ? { targetStripeAccountId: activation.stripeAccountId }
              : {}),
            issuedAt: new Date(),
            returnPath,
          },
          env.BETTER_AUTH_SECRET,
        );
        const scope = intent === "diagnostic" ? "read_only" : "read_write";
        emitOAuthEvent(
          intent === "diagnostic"
            ? "diagnostic_oauth_started"
            : "diagnostic_activation_started",
          intent,
          activation?.planCode ?? "diagnostic_pending",
        );

        const params = new URLSearchParams({
          response_type: "code",
          client_id: env.STRIPE_CLIENT_ID,
          scope,
          redirect_uri: `${env.APP_URL}/api/stripe/callback`,
          state: state.nonce,
        });
        return new Response(null, {
          status: 302,
          headers: {
            Location: `https://connect.stripe.com/oauth/authorize?${params.toString()}`,
            "Set-Cookie": buildStripeOAuthStateCookie(
              state.sealed,
              env.NODE_ENV === "production",
            ),
          },
        });
      },
    },
  },
});
