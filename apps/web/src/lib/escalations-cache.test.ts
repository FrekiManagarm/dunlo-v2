import { describe, expect, it } from "vitest";

import { applyEscalationDraftPatch } from "./escalations-cache";

describe("applyEscalationDraftPatch", () => {
  it("updates the regenerated draft on the matching escalation", () => {
    const original = [
      { id: "esc_1", draftSubject: "Old subject", draftBody: "Old body" },
      { id: "esc_2", draftSubject: "Keep subject", draftBody: "Keep body" },
    ];

    const next = applyEscalationDraftPatch(original, "esc_1", {
      draftSubject: "New subject",
      draftBody: "New body",
    });

    expect(next).toEqual([
      { id: "esc_1", draftSubject: "New subject", draftBody: "New body" },
      { id: "esc_2", draftSubject: "Keep subject", draftBody: "Keep body" },
    ]);
    expect(next?.[1]).toBe(original[1]);
  });

  it("keeps the same reference when the escalation is not in cache", () => {
    const original = [
      { id: "esc_1", draftSubject: "Old subject", draftBody: "Old body" },
    ];

    const next = applyEscalationDraftPatch(original, "missing", {
      draftSubject: "New subject",
      draftBody: "New body",
    });

    expect(next).toBe(original);
  });
});
