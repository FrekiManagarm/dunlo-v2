# Read-Only Stripe Diagnostic Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Ship an authenticated, honest Stripe diagnostic that uses read-only access, qualifies ROI from recurring invoice evidence, supports quiet monitoring, and requires a second explicit write authorization plus final confirmation before recovery can run.

**Architecture:** Keep Stripe retrieval, recurring-revenue normalization, addressability classification, FX conversion, ROI qualification, orchestration, and UI as separate boundaries. Persist immutable diagnostic snapshots and invoice-level findings against an explicit connection lifecycle. The initial OAuth callback may only store a read-only credential and enqueue analysis; write-side setup is isolated behind an activation OAuth intent and a final activation command.

**Tech Stack:** Bun workspaces, TanStack Start and Router, React Query, Stripe Connect OAuth, Stripe Node SDK, Drizzle ORM with Neon PostgreSQL, Trigger.dev, Vitest, Zod, PostHog, Tailwind CSS v4, shadcn/ui.

## Global Constraints

- Treat docs/superpowers/specs/2026-07-18-product-proposition-alignment-diagnostic-design.md as the source of truth.
- Preserve the public unauthenticated Benchmark. Rename only the authenticated real-account analysis to Diagnostic.
- Never import a modeled marketing recovery assumption into product qualification.
- Never add financial amounts, customer identifiers, invoice identifiers, decline codes, or email addresses to PostHog.
- Never create a webhook, sequence, recovery attempt, escalation, portal session, retry, or email from the diagnostic OAuth flow.
- Never enqueue historical findings into recovery. Project 1 handles future failures only after activation.
- Use Dunlo color tokens from packages/ui/src/styles/globals.css; do not hardcode brand hex values.
- Keep existing unrelated worktree changes untouched.
- Run focused tests after each task. Run the full verification matrix only after all tasks pass.
- Each task ends in a narrow commit. Do not combine tasks merely because they touch adjacent files.

## Target File Map

### Database

- Modify packages/db/src/schema/domain.ts.
- Add packages/db/src/schema/diagnostic.test.ts.
- Generate packages/db/src/migrations files with the repository db:generate command; commit the SQL and migration metadata together with the schema change.

### Product policies and data source

- Add apps/web/src/lib/diagnostic/types.ts.
- Add apps/web/src/lib/diagnostic/recurring-revenue.ts and recurring-revenue.test.ts.
- Add apps/web/src/lib/diagnostic/addressability.ts and addressability.test.ts.
- Add apps/web/src/lib/diagnostic/fx.ts and fx.test.ts.
- Add apps/web/src/lib/diagnostic/qualification.ts and qualification.test.ts.
- Add apps/web/src/lib/diagnostic/stripe-source.ts and stripe-source.test.ts.
- Add apps/web/src/lib/diagnostic/service.ts and service.test.ts.
- Add apps/web/src/lib/diagnostic/notifications.ts and notifications.test.ts.
- Add apps/web/src/lib/diagnostic/export.ts and export.test.ts.
- Add apps/web/src/lib/diagnostic/analytics.ts and analytics.test.ts.

### Server, OAuth, and background work

- Add apps/web/src/lib/stripe-oauth-state.ts and stripe-oauth-state.test.ts.
- Modify apps/web/src/routes/api/stripe/connect.ts.
- Modify apps/web/src/routes/api/stripe/callback.ts.
- Add apps/web/src/functions/diagnostic.ts.
- Add apps/web/src/functions/diagnostic.test.ts.
- Modify apps/web/src/functions/stripe.ts.
- Modify apps/web/src/functions/email-provider.ts.
- Add apps/web/src/trigger/run-diagnostic.ts and run-diagnostic.test.ts.
- Add apps/web/src/trigger/monitor-diagnostics.ts and monitor-diagnostics.test.ts.
- Add apps/web/src/routes/api/stripe/activate.ts.
- Add apps/web/src/routes/api/stripe/recovery/confirm.ts.
- Add apps/web/src/routes/api/stripe/export.ts.
- Modify apps/web/src/routes/api/stripe/disconnect.ts.
- Modify apps/web/src/lib/stripe-webhooks.ts.

### Product UI

- Modify apps/web/src/routes/onboarding.tsx.
- Replace apps/web/src/routes/-onboarding.test.ts with behavioral source-contract coverage for the new phases.
- Add apps/web/src/components/diagnostic/permission-step.tsx.
- Add apps/web/src/components/diagnostic/progress-step.tsx.
- Add apps/web/src/components/diagnostic/diagnostic-report.tsx.
- Add apps/web/src/components/diagnostic/monitoring-consent.tsx.
- Add apps/web/src/components/diagnostic/activation-summary.tsx.
- Add apps/web/src/components/diagnostic/diagnostic-report.test.tsx.
- Add apps/web/src/routes/_dashboard/diagnostic.tsx.
- Modify apps/web/src/routes/dashboard.benchmark.tsx to redirect.
- Modify apps/web/src/routes/_dashboard.tsx.
- Modify apps/web/src/lib/queries.ts.
- Regenerate apps/web/src/routeTree.gen.ts through the TanStack route generator.

### Truth guardrail

- Modify apps/web/src/components/welcome-guide.tsx.
- Modify apps/marketing/public/pricing.md.
- Modify apps/marketing/src/components/alternatives/alternative-page.tsx.
- Modify apps/marketing/src/lib/recovery-assumptions.ts and every current importer so the value is explicitly a modeled calculator assumption.
- Modify apps/marketing/content/blog/involuntary-churn-in-saas.mdx.
- Modify affected existing marketing tests.
- Add apps/marketing/src/lib/product-truth-contract.test.ts.

---

## Task 1: Lock the Immediate Product-Truth Guardrail

**Files:**

- Create: apps/marketing/src/lib/product-truth-contract.test.ts
- Modify: apps/web/src/components/welcome-guide.tsx
- Modify: apps/marketing/public/pricing.md
- Modify: apps/marketing/src/components/alternatives/alternative-page.tsx
- Modify: apps/marketing/src/lib/recovery-assumptions.ts
- Modify: apps/marketing/src/components/public-proof-layer.tsx
- Modify: apps/marketing/src/components/public-benchmark.tsx
- Modify: apps/marketing/src/components/landing/roi-calculator.tsx
- Modify: apps/marketing/content/blog/involuntary-churn-in-saas.mdx
- Modify: apps/marketing/src/lib/involuntary-churn-seo.test.ts
- Modify: apps/marketing/src/components/landing/landing-style-contract.test.ts

- [ ] **Step 1: Add a failing source-contract test**

The test should scan the public pricing file, alternative data, and web welcome guide and reject the obsolete commercial claims:

    expect(allPublicCopy).not.toMatch(/\$19(?:\/mo|\/month)?/i);
    expect(allPublicCopy).not.toMatch(/recover 40[–-]60%/i);
    expect(pricing).not.toMatch(/^## (Solo|Starter|Growth|Scale)$/m);
    expect(pricing).toContain("Free during beta");
    expect(pricing).toContain("before billing starts");

It should also assert that calculator constants are named as assumptions:

    expect(assumptions).toContain("MODELED_RECOVERY_ASSUMPTION_RATE");
    expect(assumptions).not.toContain("RECOVERABILITY_RATE");

- [ ] **Step 2: Run the focused tests and confirm failure**

Run:

    bunx vitest run apps/marketing/src/lib/product-truth-contract.test.ts

Expected: FAIL on $19 pricing, the 40–60% welcome claim, and the old constant name.

- [ ] **Step 3: Correct the copy without advertising unshipped diagnostic behavior**

Replace pricing.md with a beta-only statement: Dunlo is free during beta; future pricing will be communicated before billing begins; no customer will be charged without notice and consent. Replace Dunlo’s $19 alternative-page copy with the same factual beta status. Do not replace it with the future $49/$99/$199 tiers in this task.

Change the welcome guide sentence to observed functionality only:

    "See failed payments, recovery activity, and customer actions in one place."

Rename the calculator constant:

    export const MODELED_RECOVERY_ASSUMPTION_RATE = 0.62;
    export const MODELED_RECOVERY_ASSUMPTION_PERCENT =
      Math.round(MODELED_RECOVERY_ASSUMPTION_RATE * 100) + "%";

Every presentation of this number must call it an illustrative modeled assumption, never an average Dunlo recovery rate or proven outcome.

- [ ] **Step 4: Update affected tests and run both apps' focused suites**

Run:

    bunx vitest run apps/marketing/src/lib/product-truth-contract.test.ts apps/marketing/src/lib/involuntary-churn-seo.test.ts apps/marketing/src/components/landing/landing-style-contract.test.ts
    bun run --filter web test -- src/routes/-onboarding.test.ts

Expected: PASS. The second command may still expose the old onboarding contract; only update assertions directly affected by the welcome-guide correction here.

- [ ] **Step 5: Commit**

    git add apps/marketing/public/pricing.md apps/marketing/src/lib/product-truth-contract.test.ts apps/marketing/src/lib/recovery-assumptions.ts apps/marketing/src/lib/involuntary-churn-seo.test.ts apps/marketing/src/components/alternatives/alternative-page.tsx apps/marketing/src/components/public-proof-layer.tsx apps/marketing/src/components/public-benchmark.tsx apps/marketing/src/components/landing/roi-calculator.tsx apps/marketing/src/components/landing/landing-style-contract.test.ts apps/marketing/content/blog/involuntary-churn-in-saas.mdx apps/web/src/components/welcome-guide.tsx
    git commit -m "fix(product): remove unsupported recovery and pricing claims"

---

## Task 2: Add the Diagnostic Lifecycle and Persistence Schema

**Files:**

- Modify: packages/db/src/schema/domain.ts
- Create: packages/db/src/schema/diagnostic.test.ts
- Create: generated Drizzle migration files

- [ ] **Step 1: Add a failing schema contract**

Assert the exact lifecycle enum, nullable webhook secret, one-current-snapshot constraint, and connection-scoped cascade relationships. The public types should support:

    type ConnectionPhase =
      | "diagnosing"
      | "diagnostic_ready"
      | "monitoring"
      | "activation_requested"
      | "write_authorized"
      | "email_configured"
      | "recovery_active"
      | "disconnecting"
      | "disconnect_failed";

- [ ] **Step 2: Run the database test and confirm failure**

Run:

    bun run --filter @dunlo-v2/db test -- src/schema/diagnostic.test.ts

Expected: FAIL because the enum and tables do not exist.

- [ ] **Step 3: Extend stripe_connection**

Add:

    phase: connectionPhaseEnum("phase").default("diagnosing").notNull()
    monitoringEnabled: boolean("monitoring_enabled").default(false).notNull()
    lastAnalyzedAt: timestamp("last_analyzed_at")
    nextAnalysisAt: timestamp("next_analysis_at")
    liveMode: boolean("live_mode")

Make webhookSecret nullable so read-only connections no longer need a fake encrypted value. Keep scope non-null and change its default to read_only in this task; the existing callback still supplies its current explicit scope until Task 9 rewrites it.

- [ ] **Step 4: Add diagnostic_snapshot and diagnostic_finding**

Use integer minor units for all money. Store original-currency totals and USD plan-comparison values separately. Required snapshot fields include:

    connectionId, userId, isCurrent, status, verdict,
    analysisStartsAt, analysisEndsAt,
    decisionStartsAt, decisionEndsAt, decisionWindowComplete,
    pagesLoaded, recordsLoaded, coverageComplete, staleAt,
    fixedMrr, variableMrr, limitedConfidenceMrr, excludedMrr,
    dominantCurrency, dominantCurrencyShareBps,
    observedFailed, naturallyRecovered, openAutomatable, openHuman,
    historicallyLostAutomatable, historicallyLostHuman, excludedAmount,
    monthlyAddressable, addressableNow,
    planCode, planPriceUsd, breakEvenUsd,
    classifierVersion, qualificationVersion,
    fxSource, fxSeriesKeys, fxRateDate, fxFetchedAt, fxRateToUsd,
    failureCategory, createdAt, updatedAt

Required finding fields include:

    snapshotId, connectionId, stripeInvoiceId, stripeCustomerId,
    stripeSubscriptionId, amount, currency,
    failedAt, resolvedAt, invoiceStatus, subscriptionStatus,
    adviceCode, declineCode, category, reason, classifierVersion

Use a unique partial index on connectionId where isCurrent is true. Add indexes for userId, connectionId, snapshotId, createdAt, phase, and nextAnalysisAt. Findings reference snapshots and connections with onDelete cascade.

- [ ] **Step 5: Generate and inspect the migration**

Run:

    bun run db:generate

Expected: a migration that creates the new enums/tables/indexes, alters stripe_connection, and does not drop existing recovery or benchmark data.

Do not run db:push against a shared database. Apply the generated migration only to the normal development/test database workflow.

- [ ] **Step 6: Run database tests and type check**

Run:

    bun run --filter @dunlo-v2/db test
    bunx tsc --noEmit -p packages/db/tsconfig.json

Expected: PASS.

- [ ] **Step 7: Commit**

    git add packages/db/src/schema/domain.ts packages/db/src/schema/diagnostic.test.ts packages/db/src/migrations
    git commit -m "feat(db): add diagnostic lifecycle and snapshots"

---

## Task 3: Define Shared Diagnostic Types and Invariants

**Files:**

- Create: apps/web/src/lib/diagnostic/types.ts
- Create: apps/web/src/lib/diagnostic/types.test.ts

- [ ] **Step 1: Write failing invariant tests**

Cover exclusive finding categories, verdict values, progress checkpoints, and money grouping. The core types must expose:

    export const DIAGNOSTIC_CATEGORIES = [
      "naturally_recovered",
      "open_automatable",
      "open_human",
      "historically_lost_automatable",
      "historically_lost_human",
      "excluded",
    ] as const;

    export const DIAGNOSTIC_CHECKPOINTS = [
      "account_loaded",
      "invoices_loaded",
      "payment_evidence_loaded",
      "revenue_normalized",
      "findings_classified",
      "snapshot_persisted",
    ] as const;

- [ ] **Step 2: Run and confirm failure**

    bun run --filter web test -- src/lib/diagnostic/types.test.ts

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement types and runtime parsers**

Use Zod for data crossing route/job boundaries. Keep pure policy inputs as narrow serializable structures rather than passing Stripe SDK objects throughout the product.

Represent money as:

    type MoneyByCurrency = Record<string, number>;

    type DiagnosticVerdict =
      | "activation_recommended"
      | "monitoring_recommended"
      | "insufficient_data";

Add helpers that reject negative amounts, normalize ISO currency to lowercase, and prevent adding different currencies.

- [ ] **Step 4: Run tests and commit**

    bun run --filter web test -- src/lib/diagnostic/types.test.ts
    git add apps/web/src/lib/diagnostic
    git commit -m "feat(diagnostic): define domain types and invariants"

---

## Task 4: Implement Recurring-Revenue Normalization

**Files:**

- Create: apps/web/src/lib/diagnostic/recurring-revenue.ts
- Create: apps/web/src/lib/diagnostic/recurring-revenue.test.ts

- [ ] **Step 1: Add table-driven failing tests**

Fixtures must cover monthly, annual, quarterly, discounted, active, past_due, canceled, incomplete_expired, one-off invoice lines, tax, credits, refunds, and one/two/three variable invoices.

Representative expectations:

    monthly fixed net 4900 -> fixedMrr 4900
    annual fixed net 120000 -> fixedMrr 10000
    quarterly fixed net 30000 -> fixedMrr 10000
    canceled subscription -> excludedMrr only
    metered invoices [9000, 12000, 15000] -> variableMrr 12000
    two metered invoices -> average plus limitedConfidenceMrr

- [ ] **Step 2: Run and confirm failure**

    bun run --filter web test -- src/lib/diagnostic/recurring-revenue.test.ts

Expected: FAIL because the normalizer does not exist.

- [ ] **Step 3: Implement the pure normalizer**

The public function should have no network or database imports:

    export function normalizeRecurringRevenue(
      input: RecurringRevenueInput,
    ): RecurringRevenueResult

Normalize fixed intervals with intervalCount. Apply discounts before classification. Exclude tax, credit, refund, and one-off components. Mark variable averages based on fewer than three finalized invoices as limited confidence.

- [ ] **Step 4: Run tests, mutation checks, and commit**

    bun run --filter web test -- src/lib/diagnostic/recurring-revenue.test.ts
    bunx tsc --noEmit -p apps/web/tsconfig.json
    git add apps/web/src/lib/diagnostic
    git commit -m "feat(diagnostic): normalize recurring Stripe revenue"

---

## Task 5: Implement the Versioned Addressability Classifier

**Files:**

- Create: apps/web/src/lib/diagnostic/addressability.ts
- Create: apps/web/src/lib/diagnostic/addressability.test.ts

- [ ] **Step 1: Add failing precedence tests**

Cover:

- fraud/compliance/duplicate/merchant errors excluded before advice codes;
- advice_code before decline_code;
- do_not_try_again as open_human only when another legitimate payment action exists;
- authentication and update-payment-method flows as automatable;
- naturally recovered as exclusive;
- void/uncollectible as historically lost only with supporting involuntary-failure evidence;
- unknown evidence as excluded_unknown.

- [ ] **Step 2: Run and confirm failure**

    bun run --filter web test -- src/lib/diagnostic/addressability.test.ts

Expected: FAIL because the classifier does not exist.

- [ ] **Step 3: Implement a pure, versioned policy**

Expose:

    export const ADDRESSABILITY_POLICY_VERSION = "2026-07-18.1";

    export function classifyFailure(
      evidence: FailureEvidence,
    ): ClassificationResult

ClassificationResult must include category, reasonCode, humanReason, sourceSignal, and policyVersion. A new Stripe code must default to excluded, not automatable.

- [ ] **Step 4: Run tests and commit**

    bun run --filter web test -- src/lib/diagnostic/addressability.test.ts
    git add apps/web/src/lib/diagnostic
    git commit -m "feat(diagnostic): classify addressable payment failures"

---

## Task 6: Implement FX and ROI Qualification Policies

**Files:**

- Create: apps/web/src/lib/diagnostic/fx.ts
- Create: apps/web/src/lib/diagnostic/fx.test.ts
- Create: apps/web/src/lib/diagnostic/qualification.ts
- Create: apps/web/src/lib/diagnostic/qualification.test.ts

- [ ] **Step 1: Add failing FX tests**

Test dominant currency at 79.99% and 80%, USD passthrough, EUR-to-USD cross-rate calculation, rate metadata persistence shape, a seven-day-old cached rate accepted, and an eight-day-old rate rejected.

- [ ] **Step 2: Add failing qualification boundary tests**

Cover MRR bands at $24,999.99, $25,000, $49,999.99, and $50,000; 3× addressable thresholds for $49/$99/$199; above-$100k manual fit visibility; current-open qualification with incomplete history; incomplete pagination; missing dominant currency; and missing FX.

Expected deterministic shape:

    {
      verdict: "activation_recommended",
      planCode: "mrr_under_25k",
      planPriceUsd: 4900,
      breakEvenUsd: 4900,
      requiredAddressableUsd: 14700
    }

- [ ] **Step 3: Run and confirm failure**

    bun run --filter web test -- src/lib/diagnostic/fx.test.ts src/lib/diagnostic/qualification.test.ts

Expected: FAIL because both modules are absent.

- [ ] **Step 4: Implement the ECB adapter with injected fetch and clock**

The adapter returns source, series keys, rate date, fetched timestamp, and rateToUsd. Cache only successful rates. A stale or unsupported rate returns a typed unavailable result; it must not silently use 1:1 conversion.

- [ ] **Step 5: Implement the pure qualification policy**

Expose:

    export const QUALIFICATION_POLICY_VERSION = "2026-07-18.1";

    export function qualifyDiagnostic(
      input: QualificationInput,
    ): QualificationResult

The policy accepts normalized numeric inputs only. It never imports marketing recovery assumptions.

- [ ] **Step 6: Run focused tests and commit**

    bun run --filter web test -- src/lib/diagnostic/fx.test.ts src/lib/diagnostic/qualification.test.ts
    git add apps/web/src/lib/diagnostic
    git commit -m "feat(diagnostic): qualify ROI with conservative FX policy"

---

## Task 7: Build the Read-Only Paginated Stripe Source

**Files:**

- Create: apps/web/src/lib/diagnostic/stripe-source.ts
- Create: apps/web/src/lib/diagnostic/stripe-source.test.ts

- [ ] **Step 1: Add failing adapter tests with a fake Stripe client**

Assert:

- 12-month invoice pagination continues until has_more is false;
- subscription pagination includes active and past_due;
- invoice lines are expanded or paginated without truncation;
- PaymentIntent and charge evidence is loaded only for included subscription invoices;
- 429 retry uses bounded exponential backoff;
- exhausted retry returns partial coverage and a resumable cursor;
- no Stripe mutation method exists on the exported interface;
- test and live modes are retained separately.

- [ ] **Step 2: Run and confirm failure**

    bun run --filter web test -- src/lib/diagnostic/stripe-source.test.ts

Expected: FAIL because the source does not exist.

- [ ] **Step 3: Implement the adapter**

The exported boundary should be structurally read-only:

    export interface StripeDiagnosticSource {
      loadAccount(): Promise<AccountEvidence>;
      loadSubscriptions(cursor?: string): Promise<Page<SubscriptionEvidence>>;
      loadInvoices(window: TimeWindow, cursor?: string): Promise<Page<InvoiceEvidence>>;
      loadPaymentEvidence(invoiceIds: string[]): Promise<PaymentEvidence[]>;
    }

Use limit 100 and starting_after pagination. Record page and record counts. Restrict the first pass to subscription-linked invoices. Return typed coverage failures rather than extrapolated totals.

- [ ] **Step 4: Run tests and commit**

    bun run --filter web test -- src/lib/diagnostic/stripe-source.test.ts
    git add apps/web/src/lib/diagnostic
    git commit -m "feat(diagnostic): load complete read-only Stripe evidence"

---

## Task 8: Orchestrate and Persist Idempotent Diagnostics

**Files:**

- Create: apps/web/src/lib/diagnostic/service.ts
- Create: apps/web/src/lib/diagnostic/service.test.ts
- Create: apps/web/src/trigger/run-diagnostic.ts
- Create: apps/web/src/trigger/run-diagnostic.test.ts

- [ ] **Step 1: Add failing service tests**

Test:

- one job per connection and analysis window;
- checkpoint updates in the approved order;
- incomplete coverage persists an insufficient_data snapshot;
- a complete refresh atomically marks the previous snapshot non-current;
- a failed refresh leaves the previous current snapshot untouched and stale;
- findings are inserted only for the new snapshot;
- rerunning the same job creates no duplicates;
- no recovery tables are written.

- [ ] **Step 2: Add failing Trigger.dev registration tests**

Mock task from @trigger.dev/sdk and assert id run-stripe-diagnostic, the payload schema connectionId plus reason, and delegation to DiagnosticService.

- [ ] **Step 3: Run and confirm failure**

    bun run --filter web test -- src/lib/diagnostic/service.test.ts src/trigger/run-diagnostic.test.ts

Expected: FAIL because the service and task do not exist.

- [ ] **Step 4: Implement DiagnosticService**

Expose:

    run({ connectionId, reason, now }): Promise<DiagnosticRunResult>
    getCurrent(connectionId): Promise<DiagnosticSnapshotView | null>
    getProgress(connectionId): Promise<DiagnosticProgress>

Use a database transaction only for the final snapshot/finding swap. Network retrieval and pure calculations happen outside the transaction. Update connection phase to diagnostic_ready, monitoring, or the retained prior phase only after successful persistence.

- [ ] **Step 5: Implement the Trigger.dev task**

The callback will enqueue:

    await runDiagnosticTask.trigger({
      connectionId,
      reason: "initial",
    });

Use an idempotency key based on connectionId, reason, and scheduled window. Log only counts, phase, and coarse error category; never invoice/customer data or money.

- [ ] **Step 6: Run tests and commit**

    bun run --filter web test -- src/lib/diagnostic/service.test.ts src/trigger/run-diagnostic.test.ts
    git add apps/web/src/lib/diagnostic/service.ts apps/web/src/lib/diagnostic/service.test.ts apps/web/src/trigger/run-diagnostic.ts apps/web/src/trigger/run-diagnostic.test.ts
    git commit -m "feat(diagnostic): persist idempotent diagnostic jobs"

---

## Task 9: Split Stripe OAuth into Diagnostic and Activation Intents

**Files:**

- Create: apps/web/src/lib/stripe-oauth-state.ts
- Create: apps/web/src/lib/stripe-oauth-state.test.ts
- Modify: apps/web/src/routes/api/stripe/connect.ts
- Modify: apps/web/src/routes/api/stripe/callback.ts
- Replace relevant assertions: apps/web/src/routes/-onboarding.test.ts

- [ ] **Step 1: Add failing OAuth-state tests**

The sealed state must bind nonce, userId, intent, optional target Stripe account, issuedAt, and return path. Test tampering, wrong user, expiry after ten minutes, and activation without a target account.

- [ ] **Step 2: Add failing callback safety contracts**

The diagnostic callback test must assert:

    scope is read_only
    phase becomes diagnosing
    webhook setup is not called
    sequence seeding is not called
    historical payment import is not called
    one diagnostic job is enqueued

The activation intent test must assert read_write scope and rejection when the returned Stripe account differs from the diagnostic connection.

- [ ] **Step 3: Run and confirm failure**

    bun run --filter web test -- src/lib/stripe-oauth-state.test.ts src/routes/-onboarding.test.ts

Expected: FAIL on current read_write scope and write-side callback effects.

- [ ] **Step 4: Implement sealed OAuth state**

Use BETTER_AUTH_SECRET for HMAC-SHA256. Store the sealed payload in an HttpOnly, SameSite=Lax, Secure-in-production cookie. Compare signatures with a timing-safe operation. Clear the cookie on every terminal callback path.

- [ ] **Step 5: Update connect route**

Accept only intent=diagnostic or intent=activation. Diagnostic requests read_only. Activation requires an existing ready/recommended connection and requests read_write. Emit diagnostic_oauth_started or diagnostic_activation_started with intent and plan band only.

- [ ] **Step 6: Rewrite callback as two explicit branches**

Diagnostic branch:

- upsert encrypted token and exact Stripe account;
- store scope read_only, liveMode, phase diagnosing;
- leave webhook fields null;
- enqueue the diagnostic task;
- redirect to onboarding progress.

Activation branch:

- verify user, state, target account, and existing connection;
- replace encrypted token;
- store scope read_write and phase write_authorized;
- call idempotent webhook reconciliation;
- seed sequences disabled;
- redirect to email configuration.

Do not call importExistingFailedPayments from either branch.

- [ ] **Step 7: Run tests and commit**

    bun run --filter web test -- src/lib/stripe-oauth-state.test.ts src/routes/-onboarding.test.ts
    git add apps/web/src/lib/stripe-oauth-state.ts apps/web/src/lib/stripe-oauth-state.test.ts apps/web/src/routes/api/stripe/connect.ts apps/web/src/routes/api/stripe/callback.ts apps/web/src/routes/-onboarding.test.ts
    git commit -m "feat(stripe): separate read-only diagnostic authorization"

---

## Task 10: Expose Diagnostic State and Build the Shared Report

**Files:**

- Create: apps/web/src/functions/diagnostic.ts
- Create: apps/web/src/functions/diagnostic.test.ts
- Modify: apps/web/src/lib/queries.ts
- Create: apps/web/src/lib/diagnostic/analytics.ts
- Create: apps/web/src/lib/diagnostic/analytics.test.ts
- Create: apps/web/src/components/diagnostic/permission-step.tsx
- Create: apps/web/src/components/diagnostic/progress-step.tsx
- Create: apps/web/src/components/diagnostic/diagnostic-report.tsx
- Create: apps/web/src/components/diagnostic/monitoring-consent.tsx
- Create: apps/web/src/components/diagnostic/diagnostic-report.test.tsx
- Modify: apps/web/src/routes/onboarding.tsx
- Create: apps/web/src/routes/_dashboard/diagnostic.tsx
- Modify: apps/web/src/routes/dashboard.benchmark.tsx
- Modify: apps/web/src/routes/_dashboard.tsx
- Regenerate: apps/web/src/routeTree.gen.ts

- [ ] **Step 1: Add failing server-function tests**

Test authenticated getDiagnosticState, getDiagnosticReport, the temporary unsupported response from enableMonitoring until Task 11, and authorization by userId plus connectionId. Returned views must omit tokens and raw customer identifiers.

- [ ] **Step 2: Add failing report component tests**

Cover:

- decision-first ordering;
- three verdicts and their distinct primary actions;
- addressable amount never labeled recovered or guaranteed;
- automatable and founder-review split;
- coverage timestamps, exclusions, test-mode badge, FX source/date;
- accessible status semantics during progress;
- no fake percentage.

- [ ] **Step 3: Run and confirm failure**

    bun run --filter web test -- src/functions/diagnostic.test.ts src/lib/diagnostic/analytics.test.ts src/components/diagnostic/diagnostic-report.test.tsx src/routes/-onboarding.test.ts

Expected: FAIL because the report and new flow do not exist.

- [ ] **Step 4: Add server functions and query options**

Use query keys scoped by connection:

    ["diagnostic", "state", connectionId]
    ["diagnostic", "report", connectionId]

The progress query may poll only while phase is diagnosing. Stop polling on ready, monitoring, activation, and errors.

- [ ] **Step 5: Replace onboarding with phase-driven orchestration**

Route order:

1. permission explanation;
2. persisted analysis checkpoints;
3. DiagnosticReport;
4. activation write authorization;
5. email provider;
6. final activation summary.

Derive the current screen from persisted connection phase, not an unrestricted query-string step. Query strings may select a subview only when compatible with the persisted phase.

- [ ] **Step 6: Add the authenticated Diagnostic route and navigation**

Create /diagnostic under the dashboard layout, add Diagnostic to the sidebar, and make /dashboard/benchmark redirect to /diagnostic. Keep the public /benchmark route unchanged.

- [ ] **Step 7: Add privacy-safe analytics**

Capture only approved event names with verdict and plan band where specified. Centralize payload construction in the diagnostic server/view boundary and add a test rejecting keys matching amount, revenue, customer, invoice, email, decline, or currency.

- [ ] **Step 8: Run tests, type check, and commit**

    bun run --filter web test -- src/functions/diagnostic.test.ts src/lib/diagnostic/analytics.test.ts src/components/diagnostic/diagnostic-report.test.tsx src/routes/-onboarding.test.ts
    bunx tsc --noEmit -p apps/web/tsconfig.json
    git add apps/web/src/functions/diagnostic.ts apps/web/src/functions/diagnostic.test.ts apps/web/src/lib/diagnostic/analytics.ts apps/web/src/lib/diagnostic/analytics.test.ts apps/web/src/lib/queries.ts apps/web/src/components/diagnostic apps/web/src/routes/onboarding.tsx apps/web/src/routes/_dashboard/diagnostic.tsx apps/web/src/routes/dashboard.benchmark.tsx apps/web/src/routes/_dashboard.tsx apps/web/src/routeTree.gen.ts
    git commit -m "feat(diagnostic): add guided report experience"

---

## Task 11: Add Quiet Monthly Monitoring and Meaningful Notifications

**Files:**

- Modify: apps/web/src/functions/diagnostic.ts
- Create: apps/web/src/lib/diagnostic/notifications.ts
- Create: apps/web/src/lib/diagnostic/notifications.test.ts
- Create: apps/web/src/trigger/monitor-diagnostics.ts
- Create: apps/web/src/trigger/monitor-diagnostics.test.ts

- [ ] **Step 1: Add failing monitoring-threshold tests**

Notify only when:

- verdict changes from non-activation to activation_recommended; or
- monthly addressable rises at least 25% and at least one current monthly plan price.

Do not notify on unchanged verdict, a 24.99% increase, or an increase smaller than one plan month.

- [ ] **Step 2: Add failing schedule tests**

Register one daily scheduler that selects due read-only monitoring connections. It must not register one cron per customer. Assert it skips read_write inactive states, disabled monitoring, and not-yet-due rows.

- [ ] **Step 3: Run and confirm failure**

    bun run --filter web test -- src/lib/diagnostic/notifications.test.ts src/trigger/monitor-diagnostics.test.ts

Expected: FAIL because monitoring is absent.

- [ ] **Step 4: Implement explicit opt-in**

enableDiagnosticMonitoring must require a ready snapshot, keep scope read_only, set monitoringEnabled true, phase monitoring, and nextAnalysisAt one calendar month ahead. It must not create a webhook.

- [ ] **Step 5: Implement scheduler and notification**

The scheduler enqueues the same runDiagnostic task with reason monitoring. After a successful refresh, compare immutable prior/current snapshots. Send through the platform transactional email path, not the customer’s configured recovery provider. Include verdict and a link only—no invoice/customer details or financial totals.

- [ ] **Step 6: Run tests and commit**

    bun run --filter web test -- src/lib/diagnostic/notifications.test.ts src/trigger/monitor-diagnostics.test.ts
    git add apps/web/src/functions/diagnostic.ts apps/web/src/lib/diagnostic/notifications.ts apps/web/src/lib/diagnostic/notifications.test.ts apps/web/src/trigger/monitor-diagnostics.ts apps/web/src/trigger/monitor-diagnostics.test.ts
    git commit -m "feat(diagnostic): add quiet read-only monitoring"

---

## Task 12: Gate Recovery Behind Write Authorization and Final Confirmation

**Files:**

- Modify: apps/web/src/functions/stripe.ts
- Modify: apps/web/src/functions/email-provider.ts
- Modify: apps/web/src/lib/stripe-webhooks.ts
- Create: apps/web/src/routes/api/stripe/activate.ts
- Create: apps/web/src/routes/api/stripe/recovery/confirm.ts
- Create: apps/web/src/routes/api/stripe/-activation.test.ts
- Create: apps/web/src/components/diagnostic/activation-summary.tsx
- Modify: apps/web/src/routes/onboarding.tsx

- [ ] **Step 1: Add failing activation-boundary tests**

Assert:

- activation starts only from activation_recommended;
- target account and user must match;
- webhook reconciliation is idempotent;
- default sequences are seeded with isActive false;
- saving an email provider moves write_authorized to email_configured only;
- no sequence activates until final confirmation;
- final confirmation requires read_write, a webhook, configured email provider, and an explicit accepted summary;
- recovery_active applies only to future webhook events.

- [ ] **Step 2: Run and confirm failure**

    bun run --filter web test -- src/routes/api/stripe/-activation.test.ts

Expected: FAIL because the boundary does not exist and sequence seeding is active by default.

- [ ] **Step 3: Make write-side setup idempotent and disabled**

Change:

    seedDefaultSequences(userId, { isActive: false })

Existing rows must not be re-enabled implicitly. Replace setupWebhooks with reconcileWebhook that returns the existing endpoint when valid and creates at most one endpoint otherwise.

- [ ] **Step 4: Transition email configuration deliberately**

After a successful provider save/test, transition write_authorized to email_configured. Do not alter diagnostic_ready or monitoring connections.

- [ ] **Step 5: Implement final activation**

The confirmation endpoint accepts a boolean confirmation plus the visible workflow version. In one transaction, verify prerequisites, activate only selected future sequences, set phase recovery_active, and emit recovery_activated without financial data.

Do not import historical failures. Remove or hard-disable the old syncExistingFailedPayments action from onboarding and activation surfaces.

- [ ] **Step 6: Run focused tests and commit**

    bun run --filter web test -- src/routes/api/stripe/-activation.test.ts src/routes/-onboarding.test.ts
    bunx tsc --noEmit -p apps/web/tsconfig.json
    git add apps/web/src/functions/stripe.ts apps/web/src/functions/email-provider.ts apps/web/src/lib/stripe-webhooks.ts apps/web/src/routes/api/stripe/activate.ts apps/web/src/routes/api/stripe/recovery/confirm.ts apps/web/src/routes/api/stripe/-activation.test.ts apps/web/src/components/diagnostic/activation-summary.tsx apps/web/src/routes/onboarding.tsx
    git commit -m "feat(recovery): require explicit activation confirmation"

---

## Task 13: Implement Export and Connection-Scoped Disconnect Cleanup

**Files:**

- Create: apps/web/src/lib/diagnostic/export.ts
- Create: apps/web/src/lib/diagnostic/export.test.ts
- Create: apps/web/src/routes/api/stripe/export.ts
- Modify: apps/web/src/routes/api/stripe/disconnect.ts
- Create: apps/web/src/routes/api/stripe/-disconnect.test.ts
- Modify: apps/web/src/routes/_dashboard/settings.tsx

- [ ] **Step 1: Add failing export tests**

The export contains the current diagnostic summary, calculation policy versions, coverage, original-currency totals, and FX metadata. It excludes access tokens, webhook secrets, raw customer names/emails, and provider credentials.

- [ ] **Step 2: Add failing disconnect tests**

Cover:

- already disconnected is successful and idempotent;
- monitoring work is canceled;
- Dunlo webhook is deleted when present;
- diagnostic snapshots/findings are deleted by connection;
- Stripe-derived failed payments, attempts, and escalations for that Stripe account are deleted after activation;
- email-provider data and user account remain;
- partial remote cleanup leaves phase disconnect_failed;
- the success response is returned only after local in-scope deletion completes.

- [ ] **Step 3: Run and confirm failure**

    bun run --filter web test -- src/lib/diagnostic/export.test.ts src/routes/api/stripe/-disconnect.test.ts

Expected: FAIL because export and complete cleanup do not exist.

- [ ] **Step 4: Implement export**

Return a downloaded JSON file named dunlo-diagnostic-YYYY-MM-DD.json with a stable schemaVersion. Build it from the authenticated current snapshot and aggregated findings only.

- [ ] **Step 5: Implement idempotent cleanup**

Set phase disconnecting first. Attempt remote webhook deletion/revocation. In a transaction, delete connection-scoped recovery data and then the connection, allowing cascades to remove diagnostic data. If remote cleanup fails in a way that requires retry, persist disconnect_failed and return a non-success status with a retry-safe error code.

Never delete by userId alone when a Stripe account identifier is available.

- [ ] **Step 6: Add explicit UI confirmation**

Settings must offer export before deletion, enumerate what is deleted and retained, and announce completion/error accessibly.

- [ ] **Step 7: Run tests and commit**

    bun run --filter web test -- src/lib/diagnostic/export.test.ts src/routes/api/stripe/-disconnect.test.ts
    git add apps/web/src/lib/diagnostic/export.ts apps/web/src/lib/diagnostic/export.test.ts apps/web/src/routes/api/stripe/export.ts apps/web/src/routes/api/stripe/disconnect.ts apps/web/src/routes/api/stripe/-disconnect.test.ts apps/web/src/routes/_dashboard/settings.tsx
    git commit -m "feat(stripe): export and delete connection-scoped data"

---

## Task 14: Complete End-to-End Safety and Regression Verification

**Files:**

- Create: apps/web/src/lib/diagnostic/diagnostic-flow.integration.test.ts
- Modify: apps/web/src/routes/-onboarding.test.ts
- Regenerate: apps/web/src/routeTree.gen.ts only through the repository’s normal TanStack generation command
- Update: docs/superpowers/specs/2026-07-18-product-proposition-alignment-diagnostic-design.md status

- [ ] **Step 1: Add the complete safety regression**

Create one fixture-driven integration test that performs:

1. authenticated diagnostic OAuth;
2. read-only callback;
3. multi-page Stripe analysis;
4. report qualification;
5. monitoring opt-in;
6. activation OAuth;
7. email configuration;
8. final confirmation;
9. future failure event.

Before step 8, assert zero recovery attempts, zero emails, zero escalations, zero portal sessions, and zero write-side Stripe calls. After step 8, assert only the new future failure enters the selected sequence.

- [ ] **Step 2: Run every focused diagnostic suite**

Run:

    bun run --filter @dunlo-v2/db test
    bun run --filter web test -- src/lib/diagnostic src/trigger src/routes/-onboarding.test.ts src/routes/api/stripe
    bunx vitest run apps/marketing/src/lib/product-truth-contract.test.ts apps/marketing/src/lib/involuntary-churn-seo.test.ts apps/marketing/src/components/landing/landing-style-contract.test.ts

Expected: PASS.

- [ ] **Step 3: Run static validation**

Run:

    bun run check-types
    bun run build

Expected: PASS. If unrelated pre-existing failures remain, record their exact command/output and prove the changed packages pass their focused checks; do not hide them by weakening configuration.

- [ ] **Step 4: Scan for forbidden claims and unsafe code paths**

Run:

    rg -n '\$19|recover 40[–-]60%|RECOVERABILITY_RATE' apps/web apps/marketing
    rg -n 'scope: "read_write"|setupWebhooks|seedDefaultSequences|importExistingFailedPayments' apps/web/src/routes/api/stripe/callback.ts
    rg -n 'amount|revenue|customer|invoice|email|decline|currency' apps/web/src/lib/diagnostic/analytics.ts apps/web/src/functions/diagnostic.ts

Expected:

- no obsolete $19 or 40–60% product claim;
- any modeled calculator rate uses the explicit MODELED_RECOVERY_ASSUMPTION name;
- callback write calls appear only inside the activation branch;
- analytics payload definitions contain no forbidden financial or customer properties.

- [ ] **Step 5: Perform browser verification**

Run the web app and verify at 390, 768, 1024, 1280, and 1440 px:

- account creation precedes Stripe OAuth;
- permission copy says read-only and lists actions Dunlo cannot take;
- progress uses real checkpoints and resumes after reload;
- verdict is first and matches persisted policy output;
- addressable amounts are never described as guaranteed recovery;
- coverage, exclusions, test-mode status, and ECB rate details are discoverable;
- monitoring remains read-only;
- activation shows a second Stripe consent and final confirmation;
- keyboard order, focus return, live regions, and error announcements work;
- prefers-reduced-motion preserves all information;
- export/disconnect confirmation is explicit.

- [ ] **Step 6: Update the design status and final implementation notes**

Change the design status to Implemented only after all acceptance criteria pass. Add a short verification section listing commands and browser sizes, without changing approved product decisions.

- [ ] **Step 7: Final commit**

    git add apps/web/src/lib/diagnostic/diagnostic-flow.integration.test.ts apps/web/src/routes/-onboarding.test.ts apps/web/src/routeTree.gen.ts docs/superpowers/specs/2026-07-18-product-proposition-alignment-diagnostic-design.md
    git commit -m "test(diagnostic): verify read-only activation boundaries"

## Final Acceptance Checklist

- [ ] Initial Stripe authorization is technically read_only.
- [ ] Initial callback performs no Stripe or recovery write.
- [ ] Diagnostic uses subscription invoice data over 12 months with a 90-day decision window and complete pagination.
- [ ] One-off revenue cannot affect MRR or qualification.
- [ ] Facts, naturally recovered revenue, automatable opportunity, founder-review opportunity, loss, and exclusions are distinct.
- [ ] No modeled recovery percentage affects qualification.
- [ ] Activation recommendation requires monthly addressable revenue at least 3× plan price.
- [ ] Currency comparison uses fresh or at-most-seven-day ECB metadata and otherwise fails conservatively.
- [ ] Public Benchmark and private Diagnostic remain separate.
- [ ] Monitoring is explicit, monthly, read-only, and quiet.
- [ ] Second read_write OAuth and final confirmation are both required before recovery.
- [ ] Historical invoices never enter recovery automatically.
- [ ] Disconnect deletes all in-scope Stripe-derived data and offers export first.
- [ ] Product copy contains no unsupported recovery performance or obsolete $19 plan.
- [ ] Focused tests, type checks, builds, responsive checks, keyboard checks, and reduced-motion checks pass.
