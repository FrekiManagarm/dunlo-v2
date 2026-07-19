import { logger, schemaTask } from "@trigger.dev/sdk";
import { z } from "zod";

import { createDiagnosticService } from "../lib/diagnostic/service";

export const diagnosticTaskPayloadSchema = z.object({
  connectionId: z.string().trim().min(1),
  reason: z.enum(["initial", "refresh", "scheduled"]),
});

export const runDiagnosticTask = schemaTask({
  id: "run-stripe-diagnostic",
  schema: diagnosticTaskPayloadSchema,
  run: async (payload) => {
    try {
      const result = await createDiagnosticService().run({
        ...payload,
        now: new Date(),
      });
      logger.info("Stripe diagnostic completed", {
        pagesLoaded: result.snapshot.pagesLoaded,
        recordsLoaded: result.snapshot.recordsLoaded,
        findingsCount: result.snapshot.findingsCount,
        phase: result.phase,
        reused: result.reused,
      });
      return result;
    } catch (error) {
      logger.error("Stripe diagnostic failed", {
        errorCategory:
          error instanceof Error ? "diagnostic_error" : "unknown_error",
      });
      throw error;
    }
  },
});

export async function triggerDiagnostic(
  input: z.input<typeof diagnosticTaskPayloadSchema>,
): Promise<unknown> {
  const payload = diagnosticTaskPayloadSchema.parse(input);
  const scheduledWindow = new Date().toISOString().slice(0, 10);
  return runDiagnosticTask.trigger(payload, {
    idempotencyKey: `stripe-diagnostic:${payload.connectionId}:${payload.reason}:${scheduledWindow}`,
  });
}
