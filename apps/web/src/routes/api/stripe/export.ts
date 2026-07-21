import { auth } from "@dunlo-v2/auth";
import { db } from "@dunlo-v2/db";
import {
  diagnosticFinding,
  diagnosticSnapshot,
  stripeConnection,
} from "@dunlo-v2/db/schema/domain";
import { createFileRoute } from "@tanstack/react-router";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { buildDiagnosticExport } from "@/lib/diagnostic/export";

const searchSchema = z.object({ connectionId: z.string().min(1) });

export const Route = createFileRoute("/api/stripe/export")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session?.user) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const parsed = searchSchema.safeParse(
          Object.fromEntries(new URL(request.url).searchParams),
        );
        if (!parsed.success) {
          return Response.json(
            { error: "Invalid export request" },
            {
              status: 400,
            },
          );
        }

        const [connection] = await db
          .select({ id: stripeConnection.id })
          .from(stripeConnection)
          .where(
            and(
              eq(stripeConnection.id, parsed.data.connectionId),
              eq(stripeConnection.userId, session.user.id),
            ),
          )
          .limit(1);
        if (!connection) {
          return Response.json(
            { error: "Diagnostic not found" },
            { status: 404 },
          );
        }

        const [snapshot] = await db
          .select()
          .from(diagnosticSnapshot)
          .where(
            and(
              eq(diagnosticSnapshot.connectionId, connection.id),
              eq(diagnosticSnapshot.userId, session.user.id),
              eq(diagnosticSnapshot.isCurrent, true),
            ),
          )
          .limit(1);
        if (!snapshot) {
          return Response.json(
            { error: "Diagnostic not found" },
            { status: 404 },
          );
        }

        const findings = await db
          .select({
            amount: diagnosticFinding.amount,
            currency: diagnosticFinding.currency,
            category: diagnosticFinding.category,
          })
          .from(diagnosticFinding)
          .where(
            and(
              eq(diagnosticFinding.connectionId, connection.id),
              eq(diagnosticFinding.snapshotId, snapshot.id),
            ),
          );
        const payload = buildDiagnosticExport({
          exportedAt: new Date(),
          snapshot: {
            ...snapshot,
            fxRateDate: String(snapshot.fxRateDate),
            fxRateToUsd: String(snapshot.fxRateToUsd),
          },
          findings,
        });
        const date = new Date().toISOString().slice(0, 10);
        return new Response(JSON.stringify(payload, null, 2), {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Content-Disposition": `attachment; filename="dunlo-diagnostic-${date}.json"`,
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
