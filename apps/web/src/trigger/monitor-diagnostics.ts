import { db } from "@dunlo-v2/db";
import { stripeConnection } from "@dunlo-v2/db/schema/domain";
import { and, asc, eq, gt, lte } from "drizzle-orm";
import { schedules } from "@trigger.dev/sdk";

import { triggerDiagnostic } from "./run-diagnostic";

export async function queueDueDiagnosticMonitoring(now = new Date()) {
  const batchSize = 100;
  let cursor: string | undefined;
  let queued = 0;

  do {
    const filters = [
      eq(stripeConnection.scope, "read_only"),
      eq(stripeConnection.monitoringEnabled, true),
      eq(stripeConnection.phase, "monitoring"),
      lte(stripeConnection.nextAnalysisAt, now),
    ];
    if (cursor) filters.push(gt(stripeConnection.id, cursor));
    const connections = await db
      .select({ id: stripeConnection.id })
      .from(stripeConnection)
      .where(and(...filters))
      .orderBy(asc(stripeConnection.id))
      .limit(batchSize);

    await Promise.all(
      connections.map((connection) =>
        triggerDiagnostic({
          connectionId: connection.id,
          reason: "monitoring",
        }),
      ),
    );
    queued += connections.length;
    cursor = connections.at(-1)?.id;
    if (connections.length < batchSize) break;
  } while (cursor);

  return { queued };
}

export const monitorDiagnosticsTask = schedules.task({
  id: "monitor-read-only-diagnostics",
  cron: "0 8 * * *",
  run: () => queueDueDiagnosticMonitoring(),
});
