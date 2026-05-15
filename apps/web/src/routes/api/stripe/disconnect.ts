import { auth } from "@dunlo-v2/auth";
import { db } from "@dunlo-v2/db";
import { decrypt } from "@dunlo-v2/db/encrypt";
import { stripeConnection } from "@dunlo-v2/db/schema/domain";
import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";

import { deleteWebhooks } from "@/lib/stripe-webhooks";

export const Route = createFileRoute("/api/stripe/disconnect")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session?.user) {
          return new Response(
            JSON.stringify({ error: "Unauthorized" }),
            { status: 401, headers: { "Content-Type": "application/json" } },
          );
        }

        const userId = session.user.id;

        const [connection] = await db
          .select()
          .from(stripeConnection)
          .where(eq(stripeConnection.userId, userId))
          .limit(1);

        if (!connection) {
          return new Response(
            JSON.stringify({ disconnected: true, alreadyDisconnected: true }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }

        if (connection.webhookEndpointId) {
          const accessToken = decrypt(connection.accessToken);
          await deleteWebhooks(
            connection.webhookEndpointId,
            accessToken,
            connection.stripeAccountId,
          );
        }

        await db
          .delete(stripeConnection)
          .where(eq(stripeConnection.userId, userId));

        return new Response(
          JSON.stringify({ disconnected: true }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});
