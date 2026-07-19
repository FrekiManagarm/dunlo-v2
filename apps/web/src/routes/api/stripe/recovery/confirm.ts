import { auth } from "@dunlo-v2/auth";
import { db } from "@dunlo-v2/db";
import { stripeConnection } from "@dunlo-v2/db/schema/domain";
import { createFileRoute } from "@tanstack/react-router";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { getStripeConnectionById } from "@/functions/stripe";
import { reconcileWebhook } from "@/lib/stripe-webhooks";

const WORKFLOW_VERSION = "recovery-v1";
const inputSchema = z.object({
  connectionId: z.string().min(1),
  accepted: z.literal(true),
  workflowVersion: z.literal(WORKFLOW_VERSION),
  selectedSequenceIds: z.array(z.string().min(1)).min(1),
});

class RecoveryConfirmationError extends Error {
  constructor(
    message: string,
    readonly status: number = 409,
  ) {
    super(message);
  }
}

async function rollbackRecoveryConfirmation(input: {
  connectionId: string;
  userId: string;
}): Promise<void> {
  await db
    .update(stripeConnection)
    .set({ phase: "email_configured" })
    .where(
      and(
        eq(stripeConnection.id, input.connectionId),
        eq(stripeConnection.userId, input.userId),
        eq(stripeConnection.phase, "recovery_confirming"),
      ),
    );
}

export async function runAtomicRecoveryConfirmation(
  execute: typeof db.execute,
  input: {
    connectionId: string;
    userId: string;
    selectedSequenceIds: string[];
  },
): Promise<boolean> {
  const sequenceIds = [...new Set(input.selectedSequenceIds)];
  const selectedIds = sql.join(
    sequenceIds.map((id) => sql`${id}`),
    sql`, `,
  );
  const result = await execute(sql`
    WITH selected AS (
      SELECT id FROM recovery_sequence
      WHERE user_id = ${input.userId} AND id IN (${selectedIds})
    ), eligible AS (
      UPDATE stripe_connection SET phase = 'recovery_active', recovery_activated_at = NOW()
      WHERE id = ${input.connectionId} AND user_id = ${input.userId}
        AND scope = 'read_write' AND phase = 'recovery_confirming'
        AND webhook_endpoint_id IS NOT NULL
        AND EXISTS (SELECT 1 FROM email_provider WHERE user_id = ${input.userId})
        AND (SELECT count(*) FROM selected) = ${sequenceIds.length}
      RETURNING user_id
    ), sequences AS (
      UPDATE recovery_sequence SET is_active = id IN (${selectedIds})
      WHERE user_id IN (SELECT user_id FROM eligible)
    ) SELECT user_id FROM eligible
  `);
  return result.rows.length > 0;
}

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

        let claimed = false;
        try {
          const connection = await getStripeConnectionById(
            parsed.data.connectionId,
          );
          if (
            !connection ||
            connection.userId !== session.user.id ||
            connection.scope !== "read_write" ||
            connection.phase !== "email_configured"
          )
            throw new Error("Recovery prerequisites are incomplete");
          const [claimedConnection] = await db
            .update(stripeConnection)
            .set({ phase: "recovery_confirming" })
            .where(
              and(
                eq(stripeConnection.id, connection.id),
                eq(stripeConnection.userId, session.user.id),
                eq(stripeConnection.phase, "email_configured"),
              ),
            )
            .returning({ id: stripeConnection.id });
          if (!claimedConnection)
            return new Response(
              "Recovery confirmation is already in progress. Please retry.",
              { status: 409 },
            );
          claimed = true;
          if (
            !(await reconcileWebhook(
              connection.stripeAccountId,
              connection.accessToken,
              { connectionId: connection.id, phase: "recovery_confirming" },
            ))
          ) {
            throw new RecoveryConfirmationError(
              "Webhook verification is temporarily unavailable. Please retry.",
              503,
            );
          }
          if (
            !(await runAtomicRecoveryConfirmation(db.execute, {
              connectionId: parsed.data.connectionId,
              userId: session.user.id,
              selectedSequenceIds: parsed.data.selectedSequenceIds,
            }))
          )
            throw new Error("Recovery prerequisites are incomplete");
        } catch (error) {
          if (claimed) {
            try {
              await rollbackRecoveryConfirmation({
                connectionId: parsed.data.connectionId,
                userId: session.user.id,
              });
            } catch (rollbackError) {
              console.error(
                "[recovery] confirmation rollback failed",
                rollbackError,
              );
            }
          }
          return new Response(
            error instanceof Error
              ? error.message
              : "Recovery confirmation failed",
            {
              status:
                error instanceof RecoveryConfirmationError ? error.status : 409,
            },
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
