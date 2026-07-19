# Task 13 Report — Export and Connection-Scoped Disconnect Cleanup

## Delivered

- Added a versioned `dunlo-diagnostic/v1` JSON export that is built only from the authenticated connection's current diagnostic snapshot and aggregated findings.
- Export includes the diagnostic summary, calculation policy versions, coverage metadata, original-currency aggregate totals, and FX metadata. It excludes raw findings, customer identifiers, emails, access tokens, webhook secrets, and provider credentials.
- Added `GET /api/stripe/export`, returning an attachment named `dunlo-diagnostic-YYYY-MM-DD.json` with `Cache-Control: no-store`.
- Reworked `POST /api/stripe/disconnect` to select one owned connection, set it to `disconnecting`, disable monitoring, delete the Dunlo webhook, revoke Stripe OAuth access, and only then perform local deletion in a transaction.
- Local deletion is bounded to `failed_payment.stripe_account_id` for the selected Stripe account and the selected connection id/user pair. Cascades remove dependent recovery attempts, escalations, diagnostic snapshots, findings, and diagnostic runs. User account, email-provider configuration, and reusable recovery sequences are not deleted.
- Remote cleanup errors persist `disconnect_failed` and return the retry-safe `remote_cleanup_failed` code with a non-success response.
- Updated settings to surface export before delete, enumerate deleted versus retained data in the confirmation dialog, and publish accessible success/error status via a polite live region.
- Regenerated the TanStack route tree for the export endpoint.

## Tests and validation

- Red phase: `bun run --filter web test -- src/lib/diagnostic/export.test.ts src/routes/api/stripe/-disconnect.test.ts` failed before implementation because the export module was absent and the existing disconnect behavior did not satisfy cleanup expectations.
- Green phase: `bun run --filter web test -- src/lib/diagnostic/export.test.ts src/routes/api/stripe/-disconnect.test.ts` passes (5 tests).
- Regression check: `bun run --filter web test -- src/lib/stripe-webhooks.test.ts src/lib/diagnostic/export.test.ts src/routes/api/stripe/-disconnect.test.ts` passes (13 tests).
- Formatting and diff checks: Prettier check and `git diff --check` pass.
- Production build: `bun run --filter web build` passes. It retains existing warnings about route test filenames and large generated chunks.

## Commit

- `0b182cd feat(stripe): export and delete connection-scoped data`

## Review fixes

- Replaced the unsupported Neon HTTP `db.transaction` call with ordered awaited deletes: Stripe-derived failed payments scoped by Stripe account and owner are removed before the owned connection. A `200` response is only sent after both local deletes complete; a local failure persists `disconnect_failed` and returns retryable `local_cleanup_failed`.
- Disconnect and export now require an explicit `connectionId` supplied by Settings. Both routes query it together with the authenticated user id, rather than selecting the latest connection.
- Remote cleanup now treats Stripe 404 responses as already removed. The retry test covers webhook deletion succeeding, OAuth revocation failing, and the retry completing after the webhook returns 404. The local development webhook marker is skipped instead of being sent to Stripe.
- Export now handles Drizzle's string-mode `date` column without calling `toISOString`. The route-level test executes a realistic string date snapshot. The export finding input accepts additional source fields while serializing only the allowlisted export fields.
- The disconnect Stripe API version is typed as `Stripe.LatestApiVersion`.

### Verification

- `bun run --filter web test -- src/routes/api/stripe/-disconnect.test.ts src/routes/api/stripe/-export.test.ts src/lib/diagnostic/export.test.ts src/lib/stripe-webhooks.test.ts` — passed: 4 files, 18 tests.
- `node_modules/.bin/prettier --check apps/web/src/routes/api/stripe/disconnect.ts apps/web/src/routes/api/stripe/export.ts apps/web/src/lib/diagnostic/export.ts apps/web/src/routes/api/stripe/-disconnect.test.ts apps/web/src/routes/api/stripe/-export.test.ts apps/web/src/functions/escalations.ts apps/web/src/routes/_dashboard/settings.tsx` — passed.
- `git diff --check` — passed.
- `bunx tsc --noEmit --project apps/web/tsconfig.json` — remains non-zero only for pre-existing errors outside Task 13 (`autumn.config.ts`, diagnostic/payment test call signatures, Stripe helper nullability, alerts animation typing, and reset-password error callback). It reports no errors in the Task 13 files.
