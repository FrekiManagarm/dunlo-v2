import { auth } from "@dunlo-v2/auth";
import { db } from "@dunlo-v2/db";
import {
  emailProvider,
  recoverySequence,
  stripeConnection,
} from "@dunlo-v2/db/schema/domain";
import { createFileRoute } from "@tanstack/react-router";
import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { z } from "zod";

const WORKFLOW_VERSION = "recovery-v1";
const inputSchema = z.object({
  connectionId: z.string().min(1),
  accepted: z.literal(true),
  workflowVersion: z.literal(WORKFLOW_VERSION),
  selectedSequenceIds: z.array(z.string().min(1)).min(1),
});

export const Route = createFileRoute("/api/stripe/recovery/confirm")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session?.user)
          return new Response("Unauthorized", { status: 401 });
        const parsed = inputSchema.safeParse(await request.json());
        if (!parsed.success)
          return new Response("Invalid recovery confirmation", { status: 400 });

        try {
          const [connection] = await db
            .select({ id: stripeConnection.id })
            .from(stripeConnection)
            .where(
              and(
                eq(stripeConnection.id, parsed.data.connectionId),
                eq(stripeConnection.userId, session.user.id),
                eq(stripeConnection.scope, "read_write"),
                eq(stripeConnection.phase, "email_configured"),
                isNotNull(stripeConnection.webhookEndpointId),
              ),
            )
            .limit(1);
          if (!connection)
            throw new Error("Recovery prerequisites are incomplete");

          const [provider] = await db
            .select({ id: emailProvider.id })
            .from(emailProvider)
            .where(eq(emailProvider.userId, session.user.id))
            .limit(1);
          if (!provider)
            throw new Error("Recovery prerequisites are incomplete");

          const sequences = await db
            .select({ id: recoverySequence.id })
            .from(recoverySequence)
            .where(
              and(
                eq(recoverySequence.userId, session.user.id),
                inArray(recoverySequence.id, parsed.data.selectedSequenceIds),
              ),
            );
          if (
            sequences.length !== new Set(parsed.data.selectedSequenceIds).size
          ) {
            throw new Error("Invalid recovery sequences");
          }

          const [activated] = await db
            .update(stripeConnection)
            .set({ phase: "recovery_active", recoveryActivatedAt: new Date() })
            .where(
              and(
                eq(stripeConnection.id, connection.id),
                eq(stripeConnection.userId, session.user.id),
                eq(stripeConnection.phase, "email_configured"),
              ),
            )
            .returning({ id: stripeConnection.id });
          if (!activated)
            throw new Error("Recovery activation changed; review again");

          await db
            .update(recoverySequence)
            .set({ isActive: false })
            .where(eq(recoverySequence.userId, session.user.id));
          await db
            .update(recoverySequence)
            .set({ isActive: true })
            .where(
              and(
                eq(recoverySequence.userId, session.user.id),
                inArray(recoverySequence.id, parsed.data.selectedSequenceIds),
              ),
            );
        } catch (error) {
          return new Response(
            error instanceof Error
              ? error.message
              : "Recovery confirmation failed",
            { status: 409 },
          );
        }

        console.info("[recovery]", {
          event: "recovery_activated",
          workflowVersion: WORKFLOW_VERSION,
        });
        return Response.json({ ok: true });
      },
    },
  },
});
