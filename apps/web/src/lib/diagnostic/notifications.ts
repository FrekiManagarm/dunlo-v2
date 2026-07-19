import type { DiagnosticVerdict } from "./types";

export type MonitoringNotificationSnapshot = {
  verdict: DiagnosticVerdict;
  monthlyAddressable: number;
  planPriceUsd: number;
};

export type MonitoringNotificationReason =
  | "verdict_upgrade"
  | "addressable_increase";

export function monitoringNotificationReason(
  previous: MonitoringNotificationSnapshot,
  current: MonitoringNotificationSnapshot,
): MonitoringNotificationReason | null {
  if (
    previous.verdict !== "activation_recommended" &&
    current.verdict === "activation_recommended"
  ) {
    return "verdict_upgrade";
  }

  const increase = current.monthlyAddressable - previous.monthlyAddressable;
  const increasedByQuarter =
    current.monthlyAddressable >= previous.monthlyAddressable * 1.25;
  if (
    increasedByQuarter &&
    increase >= current.planPriceUsd &&
    current.planPriceUsd > 0
  ) {
    return "addressable_increase";
  }

  return null;
}

export function monitoringNotificationHtml(input: {
  verdict: DiagnosticVerdict;
  diagnosticUrl: string;
}): string {
  const verdict =
    input.verdict === "activation_recommended"
      ? "activation recommended"
      : input.verdict === "monitoring_recommended"
        ? "monitoring recommended"
        : "insufficient data";
  return `<p>Your Dunlo diagnostic verdict is now ${verdict}.</p><p><a href="${input.diagnosticUrl}">View diagnostic</a></p>`;
}

export async function completeMonitoringRefresh(input: {
  connectionId: string;
  now: Date;
}): Promise<{ notified: boolean }> {
  const [
    { db },
    { diagnosticSnapshot, stripeConnection },
    { user },
    { and, desc, eq },
    { env },
    { sendAuthEmail },
  ] = await Promise.all([
    import("@dunlo-v2/db"),
    import("@dunlo-v2/db/schema/domain"),
    import("@dunlo-v2/db/schema/auth"),
    import("drizzle-orm"),
    import("@dunlo-v2/env/server"),
    import("@dunlo-v2/auth/email"),
  ]);

  const snapshots = await db
    .select({
      isCurrent: diagnosticSnapshot.isCurrent,
      verdict: diagnosticSnapshot.verdict,
      monthlyAddressable: diagnosticSnapshot.monthlyAddressable,
      planPriceUsd: diagnosticSnapshot.planPriceUsd,
    })
    .from(diagnosticSnapshot)
    .where(eq(diagnosticSnapshot.connectionId, input.connectionId))
    .orderBy(desc(diagnosticSnapshot.createdAt))
    .limit(2);
  const current = snapshots.find((snapshot) => snapshot.isCurrent);
  const previous = snapshots.find((snapshot) => !snapshot.isCurrent);

  const [connection] = await db
    .update(stripeConnection)
    .set({ nextAnalysisAt: nextCalendarMonth(input.now) })
    .where(
      and(
        eq(stripeConnection.id, input.connectionId),
        eq(stripeConnection.scope, "read_only"),
        eq(stripeConnection.monitoringEnabled, true),
        eq(stripeConnection.phase, "monitoring"),
      ),
    )
    .returning({ userId: stripeConnection.userId });

  if (!connection || !current || !previous) return { notified: false };
  const reason = monitoringNotificationReason(
    previous as MonitoringNotificationSnapshot,
    current as MonitoringNotificationSnapshot,
  );
  if (!reason) return { notified: false };

  const [owner] = await db
    .select({ email: user.email })
    .from(user)
    .where(eq(user.id, connection.userId))
    .limit(1);
  if (!owner?.email) return { notified: false };

  const diagnosticUrl = new URL("/diagnostic", env.APP_URL);
  diagnosticUrl.searchParams.set("connectionId", input.connectionId);
  try {
    await sendAuthEmail({
      to: owner.email,
      subject: "Your Dunlo diagnostic changed",
      html: monitoringNotificationHtml({
        verdict: current.verdict as DiagnosticVerdict,
        diagnosticUrl: diagnosticUrl.toString(),
      }),
    });
  } catch {
    console.error("[diagnostic-monitoring] notification delivery failed");
    return { notified: false };
  }

  return { notified: true };
}

function nextCalendarMonth(now: Date): Date {
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
