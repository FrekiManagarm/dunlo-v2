import { auth } from "@dunlo-v2/auth";
import { db } from "@dunlo-v2/db";
import { decrypt } from "@dunlo-v2/db/encrypt";
import { stripeConnection } from "@dunlo-v2/db/schema/domain";
import { env } from "@dunlo-v2/env/server";
import { createFileRoute } from "@tanstack/react-router";
import { and, eq, sql } from "drizzle-orm";
import Stripe from "stripe";
import { z } from "zod";

import { deleteWebhooks } from "@/lib/stripe-webhooks";

const inputSchema = z.object({ connectionId: z.string().min(1) });

function isAlreadyRemoved(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  return (
    ("statusCode" in error && error.statusCode === 404) ||
    ("status" in error && error.status === 404)
  );
}

async function runAtomicConnectionCleanup(
  database: Pick<typeof db, "execute">,
  input: { connectionId: string; stripeAccountId: string; userId: string },
): Promise<boolean> {
  const result = await database.execute(sql`
    WITH deleted_payments AS (
      DELETE FROM failed_payment
      WHERE stripe_account_id = ${input.stripeAccountId}
        AND user_id = ${input.userId}
      RETURNING id
    ), deleted_connection AS (
      DELETE FROM stripe_connection
      WHERE id = ${input.connectionId} AND user_id = ${input.userId}
      RETURNING id
    )
    SELECT id FROM deleted_connection
  `);
  return result.rows.length > 0;
}

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
        const parsed = inputSchema.safeParse(await request.json());
        if (!parsed.success) {
          return Response.json(
            { error: "Invalid disconnect request" },
            {
              status: 400,
            },
          );
        }

        const [connection] = await db
          .select()
          .from(stripeConnection)
          .where(
            and(
              eq(stripeConnection.id, parsed.data.connectionId),
              eq(stripeConnection.userId, userId),
            ),
          )
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
          if (
            connection.webhookEndpointId &&
            connection.webhookEndpointId !== "local_dev_webhook"
          ) {
            try {
              await deleteWebhooks(
                connection.webhookEndpointId,
                decrypt(connection.accessToken),
                connection.stripeAccountId,
              );
            } catch (error) {
              if (!isAlreadyRemoved(error)) throw error;
            }
          }
          const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
            apiVersion: "2024-12-18.acacia" as Stripe.LatestApiVersion,
          });
          try {
            await stripe.oauth.deauthorize({
              client_id: env.STRIPE_CLIENT_ID,
              stripe_user_id: connection.stripeAccountId,
            });
          } catch (error) {
            if (!isAlreadyRemoved(error)) throw error;
          }
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

        try {
          if (
            !(await runAtomicConnectionCleanup(db, {
              connectionId: connection.id,
              stripeAccountId: connection.stripeAccountId,
              userId,
            }))
          ) {
            throw new Error("Connection was not deleted");
          }
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
            { error: "local_cleanup_failed", retryable: true },
            { status: 502 },
          );
        }

        return new Response(JSON.stringify({ disconnected: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
