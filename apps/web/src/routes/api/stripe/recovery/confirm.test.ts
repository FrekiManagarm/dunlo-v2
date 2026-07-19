import { describe, expect, it, vi } from "vitest";

const execute = vi.fn();

vi.mock("@dunlo-v2/db", () => ({ db: { execute } }));
vi.mock("@dunlo-v2/auth", () => ({ auth: { api: { getSession: vi.fn() } } }));
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: unknown) => ({ options }),
}));

describe("atomic recovery confirmation", () => {
  it("uses one CTE statement and only succeeds when its guarded row is returned", async () => {
    execute
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ user_id: "u1" }] });
    const { runAtomicRecoveryConfirmation } = await import("./confirm");

    await expect(
      runAtomicRecoveryConfirmation(execute, {
        connectionId: "c1",
        userId: "u1",
        selectedSequenceIds: ["s1", "s2"],
      }),
    ).resolves.toBe(false);
    await expect(
      runAtomicRecoveryConfirmation(execute, {
        connectionId: "c1",
        userId: "u1",
        selectedSequenceIds: ["s1", "s2"],
      }),
    ).resolves.toBe(true);
    expect(execute).toHaveBeenCalledTimes(2);
  });
});
