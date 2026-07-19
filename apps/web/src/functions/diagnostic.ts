import { db } from "@dunlo-v2/db";
import {
  diagnosticRun,
  diagnosticSnapshot,
  stripeConnection,
  type ConnectionPhase,
} from "@dunlo-v2/db/schema/domain";
import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, exists } from "drizzle-orm";
import { z } from "zod";

import type { DiagnosticReportView } from "../lib/diagnostic/report";
import {
  diagnosticVerdictSchema,
  type DiagnosticCheckpoint,
} from "../lib/diagnostic/types";
import { authMiddleware } from "../middleware/auth";

type DiagnosticConnectionRecord = {
  id: string;
  userId: string;
  phase: ConnectionPhase;
  scope: string | null;
  monitoringEnabled: boolean;
  liveMode: boolean | null;
  accessToken?: string;
  webhookSecret?: string | null;
};

type DiagnosticSnapshotRecord = Partial<DiagnosticReportView> & {
  verdict: DiagnosticReportView["verdict"];
  stripeCustomerId?: string;
  stripeInvoiceId?: string;
};

export type DiagnosticStateView = {
  connectionId: string | null;
  phase: ConnectionPhase | null;
  scope: string | null;
  monitoringEnabled: boolean;
  liveMode: boolean | null;
  progress: {
    status: "idle" | "running" | "completed" | "failed";
    checkpoints: DiagnosticCheckpoint[];
    errorCategory: "source" | "persistence" | null;
  };
};

export function getDiagnosticStateForUser(
  connection: DiagnosticConnectionRecord,
  userId: string,
) {
  if (connection.userId !== userId)
    throw new Error("Diagnostic connection not found.");
  return {
    connectionId: connection.id,
    phase: connection.phase,
    scope: connection.scope,
    monitoringEnabled: connection.monitoringEnabled,
    liveMode: connection.liveMode,
  };
}

export function createDiagnosticView(input: {
  connection: DiagnosticConnectionRecord;
  snapshot: DiagnosticSnapshotRecord;
}) {
  const snapshot = input.snapshot;
  return {
    connectionId: input.connection.id,
    verdict: snapshot.verdict,
    planCode: snapshot.planCode ?? "unknown",
    planPriceUsd: snapshot.planPriceUsd ?? 0,
    breakEvenUsd: snapshot.breakEvenUsd ?? 0,
    dominantCurrency: snapshot.dominantCurrency ?? "usd",
    monthlyAddressable: snapshot.monthlyAddressable ?? 0,
    observedFailed: snapshot.observedFailed ?? 0,
    naturallyRecovered: snapshot.naturallyRecovered ?? 0,
    openAutomatable: snapshot.openAutomatable ?? 0,
    openHuman: snapshot.openHuman ?? 0,
    historicallyLostAutomatable: snapshot.historicallyLostAutomatable ?? 0,
    historicallyLostHuman: snapshot.historicallyLostHuman ?? 0,
    excludedAmount: snapshot.excludedAmount ?? 0,
    originalCurrencyTotals: snapshot.originalCurrencyTotals ?? {},
    analysisStartsAt: snapshot.analysisStartsAt ?? new Date(0).toISOString(),
    analysisEndsAt: snapshot.analysisEndsAt ?? new Date(0).toISOString(),
    decisionWindowComplete: snapshot.decisionWindowComplete ?? false,
    coverageComplete: snapshot.coverageComplete ?? false,
    pagesLoaded: snapshot.pagesLoaded ?? 0,
    recordsLoaded: snapshot.recordsLoaded ?? 0,
    fxSource: snapshot.fxSource ?? "Unavailable",
    fxRateDate: snapshot.fxRateDate ?? "Unavailable",
    liveMode: input.connection.liveMode,
  } satisfies DiagnosticReportView;
}

export function nextMonitoringAnalysisAt(now: Date): Date {
  const next = new Date(now);
  const day = next.getUTCDate();
  next.setUTCDate(1);
  next.setUTCMonth(next.getUTCMonth() + 1);
  const lastDay = new Date(
    Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + 1, 0),
  ).getUTCDate();
  next.setUTCDate(Math.min(day, lastDay));
  return next;
}

const connectionInput = z.object({
  connectionId: z.string().min(1).optional(),
});

async function ownedConnection(userId: string, connectionId?: string) {
  const query = db
    .select()
    .from(stripeConnection)
    .where(
      connectionId
        ? and(
            eq(stripeConnection.id, connectionId),
            eq(stripeConnection.userId, userId),
          )
        : eq(stripeConnection.userId, userId),
    )
    .orderBy(desc(stripeConnection.updatedAt))
    .limit(1);
  const [connection] = await query;
  if (!connection) throw new Error("Diagnostic connection not found.");
  return connection;
}

async function currentConnection(userId: string, connectionId?: string) {
  try {
    return await ownedConnection(userId, connectionId);
  } catch (error) {
    if (
      !connectionId &&
      error instanceof Error &&
      error.message === "Diagnostic connection not found."
    ) {
      return null;
    }
    throw error;
  }
}

export const getDiagnosticState = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(connectionInput)
  .handler(async ({ context, data }) => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const connection = await currentConnection(
      context.session.user.id,
      data.connectionId,
    );
    if (!connection) {
      return {
        connectionId: null,
        phase: null,
        scope: null,
        monitoringEnabled: false,
        liveMode: null,
        progress: {
          status: "idle" as const,
          checkpoints: [] as DiagnosticCheckpoint[],
          errorCategory: null,
        },
      } satisfies DiagnosticStateView;
    }
    const [run] = await db
      .select({
        status: diagnosticRun.status,
        checkpoints: diagnosticRun.checkpoints,
        errorCategory: diagnosticRun.errorCategory,
      })
      .from(diagnosticRun)
      .where(eq(diagnosticRun.connectionId, connection.id))
      .orderBy(desc(diagnosticRun.updatedAt))
      .limit(1);
    return {
      ...getDiagnosticStateForUser(connection, context.session.user.id),
      progress: {
        status:
          run?.status === "running" ||
          run?.status === "failed" ||
          run?.status === "completed"
            ? run.status
            : "idle",
        checkpoints: (run?.checkpoints ?? []) as DiagnosticCheckpoint[],
        errorCategory:
          run?.errorCategory === "source" ||
          run?.errorCategory === "persistence"
            ? run.errorCategory
            : null,
      },
    } satisfies DiagnosticStateView;
  });

export const getDiagnosticReport = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator(z.object({ connectionId: z.string().min(1) }))
  .handler(async ({ context, data }) => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const connection = await ownedConnection(
      context.session.user.id,
      data.connectionId,
    );
    const [snapshot] = await db
      .select()
      .from(diagnosticSnapshot)
      .where(
        and(
          eq(diagnosticSnapshot.connectionId, connection.id),
          eq(diagnosticSnapshot.userId, context.session.user.id),
          eq(diagnosticSnapshot.isCurrent, true),
        ),
      )
      .limit(1);
    if (!snapshot) throw new Error("Diagnostic report not found.");
    return createDiagnosticView({
      connection,
      snapshot: {
        ...snapshot,
        verdict: diagnosticVerdictSchema.parse(snapshot.verdict),
        analysisStartsAt: snapshot.analysisStartsAt.toISOString(),
        analysisEndsAt: snapshot.analysisEndsAt.toISOString(),
      },
    });
  });

export const enableMonitoring = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(z.object({ connectionId: z.string().min(1) }))
  .handler(async ({ context, data }) => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const connection = await ownedConnection(
      context.session.user.id,
      data.connectionId,
    );
    const readySnapshot = db
      .select({ id: diagnosticSnapshot.id })
      .from(diagnosticSnapshot)
      .where(
        and(
          eq(diagnosticSnapshot.connectionId, connection.id),
          eq(diagnosticSnapshot.userId, context.session.user.id),
          eq(diagnosticSnapshot.isCurrent, true),
        ),
      );
    const [updated] = await db
      .update(stripeConnection)
      .set({
        scope: "read_only",
        monitoringEnabled: true,
        phase: "monitoring",
        nextAnalysisAt: nextMonitoringAnalysisAt(new Date()),
      })
      .where(
        and(
          eq(stripeConnection.id, connection.id),
          eq(stripeConnection.userId, context.session.user.id),
          eq(stripeConnection.scope, "read_only"),
          eq(stripeConnection.phase, "diagnostic_ready"),
          exists(readySnapshot),
        ),
      )
      .returning({ id: stripeConnection.id });
    if (!updated) {
      throw new Error("Monitoring requires a ready read-only diagnostic.");
    }
    return { ok: true as const };
  });
