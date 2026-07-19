import { auth } from "@dunlo-v2/auth";
import { db } from "@dunlo-v2/db";
import { createFileRoute } from "@tanstack/react-router";
import { sql } from "drizzle-orm";
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
          const sequenceIds = [...new Set(parsed.data.selectedSequenceIds)];
          const selectedIds = sql.join(
            sequenceIds.map((id) => sql`${id}`),
            sql`, `,
          );
          const result = await db.execute(sql`
            WITH selected AS (
              SELECT id FROM recovery_sequence
              WHERE user_id = ${session.user.id} AND id IN (${selectedIds})
            ), eligible AS (
              UPDATE stripe_connection
              SET phase = 'recovery_active', recovery_activated_at = NOW()
              WHERE id = ${parsed.data.connectionId}
                AND user_id = ${session.user.id}
                AND scope = 'read_write'
                AND phase = 'email_configured'
                AND webhook_endpoint_id IS NOT NULL
                AND EXISTS (SELECT 1 FROM email_provider WHERE user_id = ${session.user.id})
                AND (SELECT count(*) FROM selected) = ${sequenceIds.length}
              RETURNING user_id
            ), disabled AS (
              UPDATE recovery_sequence SET is_active = false
              WHERE user_id IN (SELECT user_id FROM eligible)
            ), enabled AS (
              UPDATE recovery_sequence SET is_active = true
              WHERE user_id IN (SELECT user_id FROM eligible)
                AND id IN (${selectedIds})
            )
            SELECT user_id FROM eligible
          `);
          if (!result.rows.length)
            throw new Error("Recovery prerequisites are incomplete");
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
