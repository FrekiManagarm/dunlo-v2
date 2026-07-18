import { getTableName } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, expectTypeOf, it } from "vitest";
import * as domain from "./domain";
import type { ConnectionPhase } from "./domain";

const connectionPhases = [
  "diagnosing",
  "diagnostic_ready",
  "monitoring",
  "activation_requested",
  "write_authorized",
  "email_configured",
  "recovery_active",
  "disconnecting",
  "disconnect_failed",
] as const;

type ExpectedConnectionPhase = (typeof connectionPhases)[number];

function columnsFor(table: Parameters<typeof getTableConfig>[0]) {
  return Object.fromEntries(
    getTableConfig(table).columns.map((column) => [column.name, column]),
  );
}

function cascadeTargets(table: Parameters<typeof getTableConfig>[0]) {
  return getTableConfig(table).foreignKeys
    .filter((foreignKey) => foreignKey.onDelete === "cascade")
    .map((foreignKey) => getTableName(foreignKey.reference().foreignTable));
}

describe("diagnostic lifecycle schema", () => {
  it("exposes the exact connection lifecycle", () => {
    expect(domain).toHaveProperty("connectionPhaseEnum");
    expect(domain.connectionPhaseEnum.enumValues).toEqual(connectionPhases);
    expectTypeOf<ConnectionPhase>().toEqualTypeOf<ExpectedConnectionPhase>();
  });

  it("keeps read-only connections valid without a webhook secret", () => {
    const columns = columnsFor(domain.stripeConnection);

    expect(columns.webhook_secret?.notNull).toBe(false);
    expect(columns.scope?.notNull).toBe(true);
    expect(columns.scope?.default).toBe("read_only");
    expect(columns.phase?.notNull).toBe(true);
    expect(columns.phase?.default).toBe("diagnosing");
    expect(columns.monitoring_enabled?.default).toBe(false);
    expect(columns).toHaveProperty("last_analyzed_at");
    expect(columns).toHaveProperty("next_analysis_at");
    expect(columns).toHaveProperty("live_mode");

    const indexes = getTableConfig(domain.stripeConnection).indexes;
    expect(indexes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          config: expect.objectContaining({ name: "stripe_connection_phase_idx" }),
        }),
        expect.objectContaining({
          config: expect.objectContaining({
            name: "stripe_connection_next_analysis_at_idx",
          }),
        }),
      ]),
    );
  });

  it("allows only one current snapshot per connection", () => {
    expect(domain).toHaveProperty("diagnosticSnapshot");
    if (!("diagnosticSnapshot" in domain)) return;

    const table = domain.diagnosticSnapshot;
    const config = getTableConfig(table);
    const currentSnapshotIndex = config.indexes.find(
      (tableIndex) => tableIndex.config.name === "diagnostic_snapshot_current_connection_unique",
    );

    expect(getTableName(table)).toBe("diagnostic_snapshot");
    expect(currentSnapshotIndex?.config.unique).toBe(true);
    expect(currentSnapshotIndex?.config.where).toBeDefined();
    expect(
      currentSnapshotIndex?.config.columns.map((column) =>
        "name" in column ? column.name : undefined,
      ),
    ).toEqual(["connection_id"]);
  });

  it("cascades diagnostic data when its connection is deleted", () => {
    expect(domain).toHaveProperty("diagnosticSnapshot");
    expect(domain).toHaveProperty("diagnosticFinding");
    if (!("diagnosticSnapshot" in domain) || !("diagnosticFinding" in domain)) return;

    expect(cascadeTargets(domain.diagnosticSnapshot)).toEqual(
      expect.arrayContaining(["stripe_connection", "user"]),
    );
    expect(cascadeTargets(domain.diagnosticFinding)).toEqual(
      expect.arrayContaining(["diagnostic_snapshot", "stripe_connection"]),
    );
  });
});
