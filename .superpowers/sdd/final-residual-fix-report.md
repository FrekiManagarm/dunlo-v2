# Final Residual Fix Report

## Historical decision completeness

- Diagnostic pagination completeness is no longer treated as proof of a complete 90-day decision history.
- A historical decision window now requires a complete source coverage result, an account created on or before the decision-window start, and no known subscription created after that start.
- When history is incomplete, historical failures cannot be normalized into a monthly qualification amount. The already-approved current-open qualification path remains available through `addressableNow` only.
- Regressions cover new accounts and new subscriptions with historical failures; both persist `decisionWindowComplete: false` and `insufficient_data`.

## Confirmation lifecycle recovery

- Once `email_configured -> recovery_confirming` is claimed, reconciliation false/throw and atomic confirmation false/throw all attempt a user- and phase-fenced rollback to `email_configured`.
- Route-level tests verify reconciliation failure, failed atomic confirmation, thrown confirmation work, and a successful retry after rollback.
- Sequence reset and toggle reject while `recovery_confirming` owns the lifecycle, preventing mutable sequence state during final confirmation.

## Verification

- Red phase: `bun run --filter web test -- src/lib/diagnostic/service.test.ts src/functions/sequences.test.ts src/routes/api/stripe/recovery/confirm.test.ts` failed on incomplete history, reset during confirmation, atomic false rollback, and thrown confirmation rollback before implementation.
- `bun run --filter web test -- src/lib/diagnostic src/trigger src/routes/-onboarding.test.ts src/routes/api/stripe src/functions/sequences.test.ts` passed: 21 files, 135 tests.
- `bun run --filter @dunlo-v2/db test -- src/schema/diagnostic.test.ts` passed: 1 file, 8 tests.
- Changed-surface TypeScript filter reported no errors.
- Prettier check and `git diff --check` passed.
