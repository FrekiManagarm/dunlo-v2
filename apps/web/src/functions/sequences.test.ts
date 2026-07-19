import { beforeEach, describe, expect, it, vi } from "vitest";

type Condition =
  | { op: "and"; conditions: Condition[] }
  | { op: "eq"; column: string; value: unknown };

const mocks = vi.hoisted(() => {
  const connections: Array<{ userId: string; phase: string }> = [];
  const deleteWhere = vi.fn();
  const seedDefaultSequences = vi.fn();

  const select = vi.fn(() => {
    let condition: Condition | undefined;
    const query = {
      from: () => query,
      innerJoin: () => query,
      where: (nextCondition: Condition) => {
        condition = nextCondition;
        return query;
      },
      orderBy: () => query,
      limit: async (limit: number) =>
        connections
          .filter((connection) => matches(connection, condition))
          .slice(0, limit),
    };
    return query;
  });

  return { connections, deleteWhere, seedDefaultSequences, select };
});

vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => {
    const builder = {
      middleware: () => builder,
      inputValidator: () => builder,
      handler: (handler: unknown) => handler,
    };
    return builder;
  },
}));

vi.mock("@dunlo-v2/db", () => ({
  db: {
    select: mocks.select,
    delete: () => ({ where: mocks.deleteWhere }),
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@dunlo-v2/db/schema/domain", () => ({
  recoverySequence: { id: "sequence_id", userId: "sequence_user_id" },
  sequenceStep: { id: "step_id", sequenceId: "step_sequence_id" },
  stripeConnection: { phase: "connection_phase", userId: "connection_user_id" },
}));

vi.mock("drizzle-orm", () => ({
  and: (...conditions: Condition[]) => ({ op: "and", conditions }),
  asc: (column: string) => column,
  eq: (column: string, value: unknown) => ({ op: "eq", column, value }),
}));

vi.mock("@/functions/stripe", () => ({
  seedDefaultSequences: mocks.seedDefaultSequences,
}));
vi.mock("@/middleware/auth", () => ({ authMiddleware: {} }));

function matches(
  connection: { userId: string; phase: string },
  condition: Condition | undefined,
): boolean {
  if (!condition) return true;
  if (condition.op === "and") {
    return condition.conditions.every((child) => matches(connection, child));
  }
  if (condition.column === "connection_user_id") {
    return connection.userId === condition.value;
  }
  if (condition.column === "connection_phase") {
    return connection.phase === condition.value;
  }
  return false;
}

describe("resetSequencesToDefault", () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.connections.length = 0;
    mocks.deleteWhere.mockReset();
    mocks.seedDefaultSequences.mockReset();
  });

  it("rejects when any of the user's connections has active recovery", async () => {
    mocks.connections.push(
      { userId: "user_123", phase: "diagnostic_ready" },
      { userId: "user_123", phase: "recovery_active" },
    );
    const { resetSequencesToDefault } = await import("./sequences");
    const reset = resetSequencesToDefault as unknown as (input: {
      context: { session: { user: { id: string } } };
    }) => Promise<unknown>;

    await expect(
      reset({ context: { session: { user: { id: "user_123" } } } }),
    ).rejects.toThrow(
      "Resetting active recovery sequences requires a new confirmation",
    );
    expect(mocks.deleteWhere).not.toHaveBeenCalled();
    expect(mocks.seedDefaultSequences).not.toHaveBeenCalled();
  });
});
