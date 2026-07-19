import { db } from "@dunlo-v2/db";
import { stripeConnection } from "@dunlo-v2/db/schema/domain";
import { and, eq, lte } from "drizzle-orm";
import { schedules } from "@trigger.dev/sdk";

import { triggerDiagnostic } from "./run-diagnostic";

export async function queueDueDiagnosticMonitoring(now = new Date()) {
  const connections = await db
    .select({ id: stripeConnection.id })
    .from(stripeConnection)
    .where(
      and(
        eq(stripeConnection.scope, "read_only"),
        eq(stripeConnection.monitoringEnabled, true),
        eq(stripeConnection.phase, "monitoring"),
        lte(stripeConnection.nextAnalysisAt, now),
      ),
    )
    .limit(100);

  await Promise.all(
    connections.map((connection) =>
      triggerDiagnostic({ connectionId: connection.id, reason: "monitoring" }),
    ),
  );

  return { queued: connections.length };
}

export const monitorDiagnosticsTask = schedules.task({
  id: "monitor-read-only-diagnostics",
  cron: "0 8 * * *",
  run: () => queueDueDiagnosticMonitoring(),
});
