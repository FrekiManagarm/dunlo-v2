import { auth } from "@dunlo-v2/auth";
import { db } from "@dunlo-v2/db";
import {
  diagnosticSnapshot,
  stripeConnection,
} from "@dunlo-v2/db/schema/domain";
import { createFileRoute } from "@tanstack/react-router";
import { and, eq, exists } from "drizzle-orm";
import { z } from "zod";

import {
  getStripeConnectionById,
  seedDefaultSequences,
} from "@/functions/stripe";
import { reconcileWebhook } from "@/lib/stripe-webhooks";

const inputSchema = z.object({ connectionId: z.string().min(1) });

export const Route = createFileRoute("/api/stripe/activate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session?.user)
          return new Response("Unauthorized", { status: 401 });

        const parsed = inputSchema.safeParse(await request.json());
        if (!parsed.success)
          return new Response("Invalid activation request", { status: 400 });

        const [eligible] = await db
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
              eq(stripeConnection.id, parsed.data.connectionId),
              eq(stripeConnection.userId, session.user.id),
              eq(stripeConnection.phase, "activation_requested"),
              eq(stripeConnection.scope, "read_write"),
              eq(diagnosticSnapshot.verdict, "activation_recommended"),
            ),
          )
          .limit(1);
        if (!eligible)
          return new Response("Activation is not available", { status: 409 });

        const connection = await getStripeConnectionById(eligible.id);
        if (!connection || connection.userId !== session.user.id) {
          return new Response("Activation is not available", { status: 409 });
        }
        const webhook = await reconcileWebhook(
          connection.stripeAccountId,
          connection.accessToken,
        );
        if (!webhook)
          return new Response("Webhook reconciliation failed", { status: 502 });

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
        const [advanced] = await db
          .update(stripeConnection)
          .set({ phase: "write_authorized" })
          .where(
            and(
              eq(stripeConnection.id, connection.id),
              eq(stripeConnection.userId, session.user.id),
              eq(stripeConnection.phase, "activation_requested"),
              exists(currentRecommendation),
            ),
          )
          .returning({ id: stripeConnection.id });
        if (!advanced)
          return new Response("Activation is not available", { status: 409 });
        await seedDefaultSequences(session.user.id, { isActive: false });
        return Response.json({ ok: true });
      },
    },
  },
});
