import { describe, expect, it, vi } from "vitest";

vi.mock("@dunlo-v2/db", () => ({ db: {} }));
vi.mock("../middleware/auth", () => ({ authMiddleware: {} }));

import {
  createDiagnosticView,
  getDiagnosticStateForUser,
  nextMonitoringAnalysisAt,
} from "./diagnostic";

describe("diagnostic server boundary", () => {
  const connection = {
    id: "conn_1",
    userId: "user_1",
    phase: "diagnostic_ready" as const,
    scope: "read_only",
    monitoringEnabled: false,
    liveMode: false,
    accessToken: "secret",
    webhookSecret: "secret",
  };

  it("requires the user to own the requested connection", () => {
    expect(() => getDiagnosticStateForUser(connection, "user_2")).toThrow(
      /not found/i,
    );
  });

  it("returns a safe state view without credentials", () => {
    expect(getDiagnosticStateForUser(connection, "user_1")).toEqual({
      connectionId: "conn_1",
      phase: "diagnostic_ready",
      scope: "read_only",
      monitoringEnabled: false,
      liveMode: false,
    });
  });

  it("omits raw customer identifiers from the report view", () => {
    const view = createDiagnosticView({
      connection,
      snapshot: {
        verdict: "activation_recommended" as const,
        stripeCustomerId: "cus_123",
        stripeInvoiceId: "in_123",
        monthlyAddressable: 45_000,
      },
    });

    expect(JSON.stringify(view)).not.toMatch(/cus_123|in_123|secret/);
  });

  it("schedules monitoring one calendar month ahead", () => {
    expect(
      nextMonitoringAnalysisAt(new Date("2026-01-31T12:00:00.000Z")),
    ).toEqual(new Date("2026-02-28T12:00:00.000Z"));
  });
});
