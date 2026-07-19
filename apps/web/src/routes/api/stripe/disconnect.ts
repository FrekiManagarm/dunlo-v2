import { auth } from "@dunlo-v2/auth";
import { db } from "@dunlo-v2/db";
import { decrypt } from "@dunlo-v2/db/encrypt";
import { failedPayment, stripeConnection } from "@dunlo-v2/db/schema/domain";
import { env } from "@dunlo-v2/env/server";
import { createFileRoute } from "@tanstack/react-router";
import { and, desc, eq } from "drizzle-orm";
import Stripe from "stripe";

import { deleteWebhooks } from "@/lib/stripe-webhooks";

export const Route = createFileRoute("/api/stripe/disconnect")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session?.user) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        const userId = session.user.id;

        const [connection] = await db
          .select()
          .from(stripeConnection)
          .where(eq(stripeConnection.userId, userId))
          .orderBy(desc(stripeConnection.updatedAt))
          .limit(1);

        if (!connection) {
          return new Response(
            JSON.stringify({ disconnected: true, alreadyDisconnected: true }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }

        await db
          .update(stripeConnection)
          .set({
            phase: "disconnecting",
            monitoringEnabled: false,
            nextAnalysisAt: null,
          })
          .where(
            and(
              eq(stripeConnection.id, connection.id),
              eq(stripeConnection.userId, userId),
            ),
          );

        try {
          if (connection.webhookEndpointId) {
            await deleteWebhooks(
              connection.webhookEndpointId,
              decrypt(connection.accessToken),
              connection.stripeAccountId,
            );
          }
          const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
            apiVersion: "2024-12-18.acacia",
          });
          await stripe.oauth.deauthorize({
            client_id: env.STRIPE_CLIENT_ID,
            stripe_user_id: connection.stripeAccountId,
          });
        } catch {
          await db
            .update(stripeConnection)
            .set({ phase: "disconnect_failed" })
            .where(
              and(
                eq(stripeConnection.id, connection.id),
                eq(stripeConnection.userId, userId),
              ),
            );
          return Response.json(
            { error: "remote_cleanup_failed", retryable: true },
            { status: 502 },
          );
        }

        await db.transaction(async (transaction) => {
          await transaction
            .delete(failedPayment)
            .where(
              eq(failedPayment.stripeAccountId, connection.stripeAccountId),
            );
          await transaction
            .delete(stripeConnection)
            .where(
              and(
                eq(stripeConnection.id, connection.id),
                eq(stripeConnection.userId, userId),
              ),
            );
        });

        return new Response(JSON.stringify({ disconnected: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
