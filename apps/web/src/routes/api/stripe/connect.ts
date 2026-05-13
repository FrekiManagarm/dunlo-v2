import { auth } from "@dunlo-v2/auth";
import { env } from "@dunlo-v2/env/server";
import { createFileRoute } from "@tanstack/react-router";

const STATE_COOKIE = "stripe_oauth_state";
const STATE_TTL_SECONDS = 60 * 10;

function buildStateCookie(value: string): string {
  const parts = [
    `${STATE_COOKIE}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${STATE_TTL_SECONDS}`,
  ];
  if (env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
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

        const state = crypto.randomUUID();

        const params = new URLSearchParams({
          response_type: "code",
          client_id: env.STRIPE_CLIENT_ID,
          scope: "read_write",
          redirect_uri: `${env.APP_URL}/api/stripe/callback`,
          state,
        });

        const oauthUrl = `https://connect.stripe.com/oauth/authorize?${params.toString()}`;

        return new Response(null, {
          status: 302,
          headers: {
            Location: oauthUrl,
            "Set-Cookie": buildStateCookie(state),
          },
        });
      },
    },
  },
});
