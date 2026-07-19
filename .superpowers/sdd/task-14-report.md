# Task 14 — End-to-End Safety and Regression Verification

## Status

Partially verified. The automated diagnostic/recovery safety suite, focused test suites, static checks, type checks, and production build have fresh passing evidence. The design document remains `Approved design` rather than `Implemented` because browser verification could not run in this environment.

## Added regression coverage

`apps/web/src/lib/diagnostic/diagnostic-flow.integration.test.ts` exercises a fixture-driven flow with:

1. read-only diagnostic OAuth contract;
2. two-page Stripe invoice analysis;
3. activation qualification;
4. read-only monitoring contract;
5. second read-write activation contract and disabled default sequences;
6. email-configuration and explicit-confirmation guards; and
7. the real webhook route.

Before confirmation, a future failure is ignored with no failed-payment insert, recovery attempt, or alert. A failure timestamped before `recoveryActivatedAt` is also ignored. After confirmation-state guards are present, the first future failure creates a scheduled attempt for the selected sequence fixture only.

`apps/web/src/routes/-onboarding.test.ts` additionally protects the persisted read-only acknowledgement and only marks the activation summary active in `recovery_active`.

## Commands and evidence

- `bun run --filter web test -- src/lib/diagnostic src/trigger src/routes/-onboarding.test.ts src/routes/api/stripe` — pass: 20 files, 121 tests.
- `bunx vitest run apps/marketing/src/lib/product-truth-contract.test.ts apps/marketing/src/lib/involuntary-churn-seo.test.ts apps/marketing/src/components/landing/landing-style-contract.test.ts` — pass: 3 files, 16 tests.
- `AUTUMN_PROD_SECRET_KEY=test TRIGGER_PROJECT_ID=test TRIGGER_SECRET_KEY=test bun run --filter @dunlo-v2/db test` — pass: 2 files, 13 tests.
- `bun run check-types` — pass.
- `bun run build` — pass.
- `bunx prettier --check apps/web/src/lib/diagnostic/diagnostic-flow.integration.test.ts apps/web/src/routes/-onboarding.test.ts` and `git diff --check` — pass.
- Claim scan excluding test files found no `$19`, `recover 40-60%`, or `RECOVERABILITY_RATE` product claims. The unfiltered scan finds `$19` only in the existing `apps/web/src/lib/seo.test.ts` expectation.
- Callback scan finds `scope: "read_write"` and `seedDefaultSequences` only in the activation branch. Analytics/function payload scan finds the forbidden financial/customer words only in the analytics deny-list regex.

## Known limitations and unchanged failures

- The required DB command without injected test-only values fails before tests because `AUTUMN_PROD_SECRET_KEY`, `TRIGGER_PROJECT_ID`, and `TRIGGER_SECRET_KEY` are absent in this worktree. With inert values provided, all 13 DB tests pass.
- Full `bun run --filter web test` has the known four unrelated failures in `apps/web/src/lib/seo.test.ts`: one stale `https://dunlo.io` OG-image expectation and missing `public/llms.txt`, `public/pricing.md`, and `public/sitemap.xml` files. The suite otherwise passes 189 tests.
- The in-app browser runtime returned `No browser is available`. Consequently, the requested checks at 390, 768, 1024, 1280, and 1440 px, keyboard/focus/live-region behavior, reduced motion, and interactive OAuth/disconnect/export states were not executed. No browser success is claimed.
- `routeTree.gen.ts` was not changed: no route file changed, and the normal `bun run build` route generation did not produce a route-tree diff.

## Review follow-up — confirmation-only webhook boundary

The activation callback and activation retry route no longer call `reconcileWebhook`; they only establish `write_authorized` access and seed disabled local sequences. The final recovery confirmation now loads the authenticated `email_configured` read-write connection, reconciles the Stripe webhook, returns `503` when reconciliation cannot complete, and only then runs the existing guarded atomic confirmation CTE. This preserves retry behavior at the final-consent boundary and ensures no write-side Stripe operation occurs before that consent.

`diagnostic-flow.integration.test.ts` now executes the diagnostic and activation OAuth callbacks, a two-page read-only Stripe source fixture, qualification, monitoring state, the final confirmation route, and the future-failure webhook route. It asserts that recovery attempts, emails, escalations, portal sessions, and write-side Stripe calls remain empty before confirmation; confirmation is the only point that records the webhook operation. The fixture verifies that the selected sequence creates a scheduled attempt for a post-activation event.
It also verifies that a webhook reconciliation failure returns `503` without executing the atomic confirmation transition, so retry remains confined to the final-confirmation boundary.

Fresh follow-up evidence:

- `bun run --filter web test -- src/lib/diagnostic src/trigger src/routes/-onboarding.test.ts src/routes/api/stripe` — pass: 20 files, 121 tests.
- `AUTUMN_PROD_SECRET_KEY=test TRIGGER_PROJECT_ID=test TRIGGER_SECRET_KEY=test bun run --filter @dunlo-v2/db test` — pass: 2 files, 13 tests.
- `bunx vitest run apps/marketing/src/lib/product-truth-contract.test.ts apps/marketing/src/lib/involuntary-churn-seo.test.ts apps/marketing/src/components/landing/landing-style-contract.test.ts` — pass: 3 files, 16 tests.
- `bun run check-types` — pass.
- `bun run build` — pass; existing route-test discovery and chunk-size warnings remain non-failing.
- `bunx prettier --check apps/web/src/lib/diagnostic/diagnostic-flow.integration.test.ts apps/web/src/routes/api/stripe/callback.ts apps/web/src/routes/api/stripe/activate.ts apps/web/src/routes/api/stripe/recovery/confirm.ts apps/web/src/routes/stripe-oauth-routes.test.ts apps/web/src/routes/api/stripe/recovery/confirm.test.ts apps/web/src/routes/api/stripe/-activation.test.ts` — pass.

## Review follow-up — lifecycle proof hardening

The integration fixture now invokes the actual `enableMonitoring` server-function handler from `functions/diagnostic.ts`; the stateful database boundary records the handler's update, rather than the test assigning `monitoring` directly. Its Stripe, notification, escalation, recovery-attempt, and portal adapters record effects only when the corresponding imported implementation boundary is called.

Final confirmation renders the real atomic CTE through Drizzle's PostgreSQL dialect. The fixture accepts confirmation only when that rendered statement contains the `selected` CTE/count guard and names every selected fixture sequence. It then marks only those sequences active; the future webhook receives that active set and schedules only its selected step. After actual confirmation, the test first delivers an event from before `recoveryActivatedAt` and proves it leaves all recorded effects unchanged, then delivers a future event through the same webhook route and proves it creates the selected recovery attempt.

The approved design wording now matches the implementation: activation OAuth grants `read_write` and seeds disabled sequences; webhook reconciliation occurs at final explicit confirmation, remains retryable, and precedes recovery activation. The document status is unchanged because browser verification is still unavailable.

Fresh follow-up evidence:

- `bun run --filter web test -- src/lib/diagnostic src/trigger src/routes/-onboarding.test.ts src/routes/api/stripe` — pass: 20 files, 121 tests.
- `bunx prettier --check apps/web/src/lib/diagnostic/diagnostic-flow.integration.test.ts docs/superpowers/specs/2026-07-18-product-proposition-alignment-diagnostic-design.md` — pass.
- `git diff --check` — pass.
