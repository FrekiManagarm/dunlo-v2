import { describe, expect, it } from "vitest";

import { shouldPollDiagnosticProgress } from "./polling";

describe("diagnostic progress polling", () => {
  it("keeps polling while OAuth has queued the diagnostic but no worker run exists yet", () => {
    expect(
      shouldPollDiagnosticProgress({
        phase: "diagnosing",
        progressStatus: "idle",
      }),
    ).toBe(true);
  });

  it.each([
    ["completed", "diagnosing"],
    ["failed", "diagnosing"],
    ["idle", "diagnostic_ready"],
  ] as const)("stops after %s while phase is %s", (progressStatus, phase) => {
    expect(shouldPollDiagnosticProgress({ phase, progressStatus })).toBe(false);
  });
});
