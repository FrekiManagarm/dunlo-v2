type DiagnosticPollingState = {
  phase: string | null;
  progressStatus: "idle" | "running" | "completed" | "failed";
};

export function shouldPollDiagnosticProgress(
  state: DiagnosticPollingState,
): boolean {
  return (
    state.phase === "diagnosing" &&
    (state.progressStatus === "idle" || state.progressStatus === "running")
  );
}
