# Task 12 report

## Delivered

- Kept write activation bound to the authenticated owner, the diagnostic-recommended target account, and a `read_write` connection. Webhook reconciliation is named explicitly and returns the stored endpoint without creating another one; the local-development endpoint is persisted too.
- Default recovery sequences now seed disabled and existing sequences are never implicitly re-enabled. The previous historical-payment sync control is removed from settings and its server action rejects requests.
- Saving or successfully testing an email provider advances only `write_authorized` connections to `email_configured`.
- Added an explicit activation review with selectable sequences, a future-only acknowledgement, and a visible workflow version. The confirmation endpoint requires the exact version, acknowledgement, read-write scope, persisted webhook, email provider, owned sequences, and `email_configured` phase before atomically activating selected sequences and moving to `recovery_active`.
- Webhook handlers acknowledge but ignore events until the connection is `read_write` and `recovery_active`, so failures received before final confirmation do not create recovery work, escalations, or attempts.

## TDD evidence

The initial focused contract run failed as expected because the activation and confirmation routes did not exist and default sequence seeding was active:

```sh
bun run --filter web test -- src/routes/api/stripe/-activation.test.ts
```

The final focused suite passes:

```sh
bun run --filter web test -- src/routes/api/stripe/-activation.test.ts src/routes/stripe-oauth-routes.test.ts src/routes/-onboarding.test.ts
# 3 files passed, 16 tests passed
```

## Verification

Passed:

```sh
bunx prettier --write <Task 12 files>
git diff --check
bunx vite build --emptyOutDir false
```

`bunx tsc --noEmit -p apps/web/tsconfig.json` still reports the established repository-wide errors in `autumn.config.ts`, diagnostic handler mocks, payments tests, legacy nullable Stripe decryptions, dashboard alerts, and reset password. After regenerating the route tree through Vite, it reports no Task 12 route, component, email, webhook, onboarding, settings, or route-tree errors.

## Review follow-up

- The OAuth callback now repeats the owner, `diagnostic_ready`, current-snapshot, and `activation_recommended` checks immediately before write setup.
- Webhook creation is serialized per Stripe account with a transaction-scoped PostgreSQL advisory lock. The activation timestamp is persisted and webhook events created before it are ignored.
- Sequence activation is rejected before `recovery_active`; reset preserves enabled defaults only after recovery is active. The retry endpoint is available from onboarding, and the confirmation UI now uses TanStack Form with Zod acknowledgement validation.
