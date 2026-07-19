# Dunlo Product Proposition Alignment — Roadmap and Read-Only Diagnostic

## Status

Approved design. Awaiting written-spec review before implementation planning.

## Context

Dunlo's validated proposition is:

> Dunlo reveals to Stripe-first B2B SaaS companies what failed payments actually cost their MRR, then operates recovery from their own sending domain—automatically for routine cases and with founder approval for important accounts.

The initial customer is a lean, Stripe-first B2B SaaS company around $10k–$100k MRR. The team does not have dedicated billing or RevOps staff, sees enough recurring-payment failures for recovery to matter, and has customer relationships valuable enough to warrant human review in selected cases.

The current product already contains a Stripe OAuth connection, a 90-day benchmark, recovery sequences, email-provider configuration, escalation, payment tracking, and a marketing surface. The main alignment gaps are structural:

- The first Stripe connection requests `read_write` even though onboarding describes the initial phase as read-only.
- The authenticated benchmark scans PaymentIntents and can mix recurring and one-off revenue.
- The current 90-day scan stops after 500 PaymentIntents and estimates MRR from successful payment volume.
- The same term, "benchmark," describes both a public model and a private analysis of real Stripe data.
- The recovery model contains unsupported global and failure-code recovery percentages.
- A successful payment after a failure is marked recovered without distinguishing Stripe recovery, spontaneous recovery, or a Dunlo-assisted outcome.
- Existing failed payments can enter recovery when Stripe is connected, before a dedicated historical-review decision.
- Public pricing and product copy still contain a $19 entry tier and unsupported recovery-rate statements.

This design establishes the complete alignment roadmap and fully specifies the first implementation project: an honest, read-only Stripe diagnostic with ROI qualification, optional monitoring, and an explicit upgrade boundary before recovery activation.

## Validated Commercial Principles

- The diagnosis reveals the problem; operating recovery creates the paid value.
- Stripe provides recovery tools; Dunlo provides an opinionated operating layer for lean SaaS teams.
- Recovery logic requires no dunning expertise, but beta users may connect their own email provider so messages use their sending domain.
- Routine cases run automatically after activation; important cases return to a human.
- Stripe-hosted payment-update flows remain the permanent card-update boundary.
- Dunlo uses conservative attribution and does not claim outcomes it cannot observe.
- Planned pricing is flat by MRR: $49, $99, and $199 per month, with no recovered-revenue percentage.
- Dunlo should not recommend a paid plan when the observable opportunity cannot justify it.
- Product-performance percentages remain unpublished until approved Dunlo cohorts support them.

## Alignment Roadmap

### Guardrail 0 — Immediate Truth Corrections

Remove unsupported product-performance percentages, the obsolete $19 entry price, and copy that presents future diagnostic behavior as already available. This is a narrow integrity correction, not the full commercial rewrite.

### Project 1 — Read-Only Diagnostic and ROI Qualification

Build the authenticated diagnostic specified in this document. It analyzes recurring Stripe revenue, reports observed and addressable loss, recommends activation only when break-even is credible, and offers read-only monitoring otherwise.

### Project 2 — Conservative Recovery Attribution

Separate recoveries into Dunlo-assisted, Stripe/spontaneous, and uncertain. Persist the causal signals required to support honest product and customer-proof reporting.

### Project 3 — Intelligent Recovery Operator

Recommend an escalation threshold from the account's invoice distribution, preserve manual overrides, and add a controlled workflow for selecting recent historical invoices. Routine future cases remain automatic; important cases remain human-reviewed.

### Project 4 — Commercial Alignment

Align the landing page, SEO pages, onboarding copy, pricing, proof policy, and product navigation with the shipped diagnostic and attribution model. Present the $49/$99/$199 tiers, no revenue cut, and honest disqualification path.

### Project 5 — Monetization and Beta Conversion

Implement billing, plan transitions, the monitoring-to-paid conversion path, and beta funnel measurement. Validate willingness to pay and plan boundaries before broadening the product.

The dependency order is deliberate:

> Product truth → measurement truth → reliable automation → commercial story → billing.

## Project 1 Goals

- Give a founder a useful result before requesting any Stripe write permission or email-provider configuration.
- Analyze actual recurring revenue and failed subscription invoices, not generic payment volume.
- Show observed loss, natural Stripe recovery, unresolved exposure, and addressable opportunity without predicting a Dunlo recovery rate.
- Recommend a paid plan only when observable monthly addressable revenue is at least three times the plan price.
- Offer quiet, opt-in, read-only monitoring to accounts that are not yet good paid candidates.
- Make every permission, estimate, exclusion, coverage limit, and data source understandable.
- Provide an explicit second consent before any Stripe write access or recovery activation.
- Delete all Stripe-derived diagnostic data when the account disconnects Stripe.

## Project 1 Non-Goals

- Attributing recovered revenue to Dunlo.
- Processing historical invoices through recovery workflows.
- Recommending a personalized escalation threshold.
- Rewriting the full marketing site or all SEO pages.
- Implementing billing or collecting payment.
- Adding SMS, in-app dunning, cancellation flows, other payment processors, or a broader retention suite.
- Building a Dunlo-hosted card-update page.
- Publishing a predicted recovery percentage or guaranteed result.

## Terminology

### Benchmark

The public, unauthenticated calculator and market-comparison content. It uses visible assumptions and does not claim to describe a visitor's actual Stripe account.

### Diagnostic

The private, authenticated report generated from the user's real Stripe subscription and invoice data.

### Monitoring

An explicit opt-in that refreshes the private diagnostic monthly using read-only access. It does not create webhooks or trigger recovery actions.

### Observed failed recurring revenue

The net recurring amount attached to subscription invoices with a documented failed payment attempt during the analyzed period.

### Naturally recovered revenue

Failed recurring revenue that later became paid without an observable Dunlo recovery action. In Project 1, all historical recovery belongs to this category.

### Addressable revenue

Observed failed recurring revenue for which Stripe's signals and account state indicate either an automated customer action or a founder-led action can still be useful. It is an opportunity amount, not a forecast.

## User Experience

### Entry and Account Creation

The user creates a Dunlo account through Google or email before Stripe OAuth. Authentication provides a stable owner for OAuth state, report persistence, background completion, and later resume.

No email-provider, sequence, threshold, or recovery setting appears before the diagnostic result.

### Guided Onboarding

The onboarding is a focused, resumable sequence with one primary action per screen:

1. Create the Dunlo account.
2. Explain the exact read-only data access and explicitly state what Dunlo cannot do yet.
3. Authorize Stripe with `read_only` scope.
4. Analyze the account asynchronously with progress based on completed work.
5. Present a decision-first diagnostic.

The user can leave during analysis. Dunlo resumes from the last completed state and may send one transactional notification when the report is ready.

### Diagnostic Result Hierarchy

The result starts with the commercial verdict, not a dashboard of unexplained charts:

1. Verdict: activation recommended, monitoring recommended, or insufficient data.
2. Monthly addressable revenue and break-even requirement.
3. Observed facts: failures, natural recovery, open/unresolved, and historically lost.
4. Split of addressable revenue into automatable and founder-review opportunity.
5. Coverage, exclusions, currencies, and calculation policy.
6. Suggested next actions by failure reason.

The report never labels addressable revenue as "recovered," "recoverable," or "Dunlo revenue."

### Verdict States

#### Activation Recommended

The account has a usable primary currency and monthly addressable revenue of at least three times the applicable plan price. The CTA opens the proposed recovery plan and begins the explicit read-write activation path.

#### Monitoring Recommended

The diagnostic is complete, but monthly addressable revenue does not meet the 3× threshold. The primary CTA enables quiet read-only monitoring. The interface explicitly says that a paid recovery product is not yet clearly justified.

#### Insufficient Data

Dunlo cannot issue a reliable commercial verdict because coverage is incomplete, recurring data is unavailable, currencies cannot be normalized reliably, or the account has no usable dominant currency. The user may enable monitoring or disconnect; Dunlo does not treat this state as a negative qualification.

## Diagnostic Scope and Coverage

### Analysis Windows

- Reference window: trailing 12 months.
- Commercial decision window: trailing 90 days.
- A new account may qualify from currently open addressable invoices even without 90 days of history.
- Historical trend qualification requires a complete 90-day window.
- The report shows the actual start/end timestamps and whether the window is complete.

### Pagination

The source adapter paginates all required Stripe collections. There is no silent record cap. If Stripe prevents complete analysis, the snapshot records partial coverage and the UI renders insufficient data rather than extrapolating.

### Recurring Revenue Only

The diagnostic includes invoice lines associated with Stripe subscriptions. It excludes one-off invoices and one-off invoice lines from MRR, ROI qualification, and addressable revenue.

One-off failed payments may appear later as a separate informational surface, but they are outside Project 1.

## MRR Normalization

MRR is derived from active or `past_due` subscriptions, not successful payment volume.

- Monthly fixed recurring lines retain their net monthly amount.
- Annual fixed recurring lines are divided by 12.
- Other fixed intervals normalize by their interval and interval count.
- Metered or variable recurring lines use the net average of the last three finalized recurring invoices when three exist.
- With one or two finalized variable invoices, Dunlo uses the available average and marks that component as limited-confidence.
- Taxes, credits, refunds, and one-off lines are excluded.
- Discounts reduce MRR because qualification must use net recurring value.
- Canceled and `incomplete_expired` subscriptions do not contribute current MRR.

The snapshot stores fixed, variable, excluded, and limited-confidence MRR components separately so the report can explain the result.

## Failure and Invoice States

Each failed subscription invoice belongs to one exclusive diagnostic state:

1. `naturally_recovered` — payment failed and the invoice later became paid without a Dunlo action.
2. `open_automatable` — still open and the current signal supports a retry, authentication, or payment-method update path.
3. `open_human` — still open and useful action requires customer/founder contact or an alternate payment method.
4. `historically_lost_automatable` — the invoice became uncollectible/void or the associated subscription ended after a failure, and the historical signal indicates an automatable recovery path could have been relevant.
5. `historically_lost_human` — the same historical outcome with a human-action path.
6. `excluded` — fraud/risk block, compliance issue, duplicate, voluntary cancellation, merchant/integration error, non-recurring invoice, or another condition outside a legitimate Dunlo recovery path.

`void` alone does not prove involuntary churn. It counts as historically lost only when the surrounding subscription and payment-failure evidence supports that interpretation. Otherwise it is excluded with a recorded reason.

## Addressability Classification

The classifier uses this precedence:

1. Explicit exclusions such as fraud, compliance, voluntary cancellation, and merchant/integration errors.
2. Stripe `advice_code` when available.
3. Stripe `decline_code` or relevant error code as fallback.
4. Invoice and subscription lifecycle context.
5. Conservative `excluded_unknown` when evidence is insufficient.

Automatable examples include `try_again_later`, authentication-required flows, expired/incorrect payment details, and customer-confirmation paths.

Human examples include a new payment method, issuer contact, or a high-context customer relationship where automation is not appropriate.

`do_not_try_again` means Dunlo must not retry the same card. It may still qualify as a human/customer-action opportunity when a different payment method or issuer contact is legitimate.

Every finding stores the classifier version, selected category, source signal, and human-readable reason. The diagnostic displays automatable and human addressable totals separately and adds them only for the total addressable amount.

## ROI Qualification

The product does not use the existing 62% global assumption or per-code recovery percentages for qualification.

### Monthly Addressable Revenue

For a complete 90-day window:

```text
monthly addressable revenue =
  addressable failed recurring amount in the dominant currency
  observed in the decision window
  / exact number of covered months
```

Current open addressable invoices appear separately as "addressable now" and can qualify a new account even when the historical window is incomplete.

### Plan Policy

- Under $25k normalized MRR: $49/month.
- $25k–$50k normalized MRR: $99/month.
- $50k and above: $199/month for automated qualification.
- Accounts above the target $100k MRR remain visible for manual fit review; Project 1 does not add an enterprise tier.

### Verdict Rule

```text
activation recommended when:
  monthly addressable revenue >= 3 × monthly plan price
```

The UI explains break-even in concrete terms:

> Dunlo needs to help recover $49 of the $780 monthly addressable amount to cover this plan.

The report does not say Dunlo will recover that amount.

## Currency Handling

Amounts are never added across currencies without normalization.

- The diagnostic groups MRR and failed recurring revenue by currency.
- A currency becomes dominant when it represents at least 80% of normalized MRR.
- Original-currency totals remain visible.
- Qualification normalizes the dominant-currency plan comparison to USD using the ECB daily reference-rate dataset (`EXR.D.<CURRENCY>.EUR.SP00.A` plus the corresponding USD/EUR series).
- The snapshot stores the source, series keys, rate date, fetched timestamp, and conversion rate.
- A last valid ECB rate can be reused for at most seven calendar days.
- If the dominant currency is unsupported by the ECB reference dataset, no fresh rate is available within seven days, or no currency reaches 80%, the result is `insufficient_data`.
- FX normalization is used only for plan comparison. The UI continues to lead with the account's original dominant currency.

ECB reference rates are informational rather than transaction settlement prices. The report labels the conversion as a qualification reference, not an accounting value.

## Architecture

### Component Boundaries

#### `StripeDiagnosticSource`

Owns read-only Stripe retrieval and pagination for account, subscriptions, invoices, invoice lines, PaymentIntents, and relevant charge outcomes. It exposes no mutation methods.

#### `RecurringRevenueNormalizer`

Transforms Stripe recurring data into normalized MRR components and coverage metadata. It has no database or network dependency.

#### `AddressabilityClassifier`

Transforms invoice/payment evidence into an exclusive diagnostic category and reason. It is a versioned pure policy module.

#### `RoiQualificationPolicy`

Selects the plan, applies currency normalization, computes addressable monthly revenue and break-even, and returns a deterministic verdict.

#### `DiagnosticService`

Orchestrates data retrieval, persistence, refresh, monitoring, and result loading. It does not contain the normalization/classification policies.

### UI Boundaries

- `onboarding.tsx` remains the route-level orchestration shell and owns navigation between resumable steps.
- Dedicated components render permission explanation, progress, report, monitoring consent, and activation handoff.
- A single `DiagnosticReport` component renders the authenticated report in onboarding and the dashboard.
- The authenticated benchmark route redirects to the Diagnostic surface.
- The public Benchmark remains separate and explicitly modeled.

### Async Analysis

The OAuth callback does not calculate the report. It validates state, stores the encrypted read-only connection, transitions the user to `diagnosing`, and enqueues an idempotent diagnostic job.

The job checkpoints real stages:

1. account and subscription data loaded;
2. invoice pages loaded;
3. payment evidence loaded;
4. recurring revenue normalized;
5. findings classified;
6. snapshot and verdict persisted.

The progress UI reflects checkpoints and never invents a percentage. A user may close the page and resume later.

## Persistence Model

### Stripe Connection Changes

Extend the connection with an explicit lifecycle rather than inferring state from incidental data:

- `scope`: `read_only` or `read_write`;
- `phase`: one of the product states below;
- `monitoringEnabled`;
- `lastAnalyzedAt`;
- `nextAnalysisAt`;
- encrypted OAuth credentials and existing Stripe account identifiers.

Product phases:

```text
diagnosing
diagnostic_ready
monitoring
activation_requested
write_authorized
email_configured
recovery_active
disconnecting
disconnect_failed
```

### Diagnostic Snapshot

One current snapshot per user/account plus immutable prior snapshots required for monitor comparisons:

- analysis and decision windows;
- coverage status and counts;
- MRR components and dominant currency;
- observed failure, natural recovery, open, lost, and excluded totals;
- automatable and human addressable totals;
- plan, break-even, and verdict;
- classifier and qualification policy versions;
- ECB rate metadata;
- created/updated timestamps.

### Diagnostic Finding

Invoice-level minimal evidence required to explain and refresh the report:

- Stripe invoice/customer/subscription identifiers;
- amount, currency, and relevant timestamps;
- invoice/subscription/payment status;
- advice/decline signal;
- exclusive diagnostic category and reason;
- policy version.

The finding does not enter the recovery queue and does not create a recovery attempt.

## OAuth Permission Boundary

### Diagnostic Authorization

The initial Stripe OAuth URL requests `read_only`. After callback:

- no webhook endpoint is created;
- no default sequence is seeded;
- no billing portal session is created;
- no invoice is retried;
- no email is scheduled or sent;
- no recovery or escalation row is created.

### Activation Authorization

When the verdict recommends activation and the user accepts the proposed plan, Dunlo begins a second OAuth flow requesting `read_write`. The OAuth state records the activation intent, target account, and return step.

After a successful upgrade:

1. Replace the encrypted read-only credential with the read-write credential.
2. Store the returned scope.
3. Create or reconcile the required webhook endpoint idempotently.
4. Seed relevant default sequences in a disabled state.
5. Continue to email-provider setup.
6. Present a final workflow summary.
7. Activate recovery only after explicit confirmation.

Project 1 activates future failures only. Existing diagnostic findings never create recovery attempts.

## Monitoring

Monitoring is an explicit opt-in available after a ready diagnostic.

- It keeps `read_only` scope.
- It does not create webhooks.
- A scheduled job runs monthly and enqueues the same idempotent diagnostic analysis.
- It creates a new snapshot only after a complete successful refresh.
- A failed refresh leaves the last valid snapshot intact and marks it stale.
- Dunlo sends no routine empty digest.

A notification is allowed when:

- the verdict changes to activation recommended; or
- monthly addressable revenue increases by at least 25% and by at least one monthly plan price.

The monitoring email contains no sensitive invoice/customer details. It links to the authenticated diagnostic.

## Disconnect and Data Deletion

Disconnect is a real deletion boundary.

Before deletion, Dunlo offers an export of the current report. On confirmation it:

1. Cancels scheduled diagnostic and recovery work.
2. Deregisters Dunlo-created Stripe webhooks when present.
3. Revokes or deletes the OAuth connection.
4. Deletes diagnostic findings and snapshots.
5. Deletes Stripe-derived failed-payment, recovery-attempt, and escalation data associated with the connection when the account had been activated.
6. Retains only the Dunlo user account and records legally required for billing/security.

Deletion is idempotent. A partial failure leaves the connection in a visible `disconnect_failed` operational state and retries cleanup; the UI never claims deletion succeeded until all in-scope data is removed.

## Error and Edge-Case Behavior

- OAuth refusal returns to the permission explanation without creating a connection.
- OAuth state mismatch fails closed and records no token.
- Repeated callbacks do not create duplicate jobs, connections, webhooks, or sequences.
- Stripe rate limits use bounded exponential backoff and resumable checkpoints.
- Partial pagination produces insufficient data, never a partial commercial verdict.
- A failed monitor refresh retains the prior valid snapshot.
- If the account changes materially during a long analysis, the job records its source timestamps and schedules a later refresh rather than mixing windows silently.
- Missing advice codes fall back conservatively; unknown cases do not inflate addressable revenue.
- Accounts with no recurring subscriptions receive insufficient data, not a zero-loss recommendation.
- Multi-account Stripe users are scoped by the exact connected account identifier.
- Test-mode data is visibly labeled and never mixed with live-mode qualification.
- A disabled or expired token pauses monitoring and asks for reauthorization.

## Analytics and Privacy

PostHog receives funnel events, not financial amounts, customer identifiers, invoice identifiers, or decline details.

Events:

- `diagnostic_account_created`;
- `diagnostic_oauth_started`;
- `diagnostic_oauth_completed`;
- `diagnostic_started`;
- `diagnostic_completed`;
- `diagnostic_failed` with a coarse error category;
- `diagnostic_verdict_viewed` with verdict and plan band only;
- `diagnostic_monitoring_enabled`;
- `diagnostic_activation_started`;
- `diagnostic_write_oauth_completed`;
- `recovery_activated`.

Financial data remains in the application database and authenticated UI.

## Immediate Truth Guardrail

Before or with Project 1 implementation:

- Remove "Most teams recover 40–60% of failed payments within their first week."
- Remove the unsupported 62% recoverability headline/claim from product-facing qualification.
- Remove public statements that imply Dunlo has proven failure-code recovery rates.
- Remove the $19 plan and old Solo/Starter/Growth/Scale pricing direction from public pricing copy.
- Until Project 4 ships the validated tiers, public pricing states only that beta is free and future pricing will be communicated before billing starts.
- Do not advertise the read-only diagnostic until it is deployed and verified.
- Keep public calculators labeled as modeled estimates with visible assumptions.

This guardrail does not perform the full Project 4 marketing rewrite.

## Verification Strategy

### Latest Verification Record

Status remains **Approved design**. Automated evidence is recorded in the Task 14 report from these commands:

- `bun run --filter @dunlo-v2/db test`
- `bun run --filter web test -- src/lib/diagnostic src/trigger src/routes/-onboarding.test.ts src/routes/api/stripe`
- `bunx vitest run apps/marketing/src/lib/product-truth-contract.test.ts apps/marketing/src/lib/involuntary-churn-seo.test.ts apps/marketing/src/components/landing/landing-style-contract.test.ts`
- `bun run check-types`
- `bun run build`

Browser verification is unexecuted because no browser is available in this environment. The pending checks are at 390, 768, 1024, 1280, and 1440 px, including OAuth/permission progression, resume behavior, verdict and coverage discoverability, read-only monitoring, activation and final confirmation, keyboard/focus/live-region behavior, reduced motion, and export/disconnect confirmation.

### Pure Policy Tests

- Monthly, annual, multi-interval, discounted, and variable recurring MRR normalization.
- Taxes, credits, refunds, canceled subscriptions, and one-off lines excluded.
- Advice-code precedence and decline-code fallback.
- Automatable, human, historical, natural-recovery, and excluded categories.
- Unknown evidence excluded conservatively.
- 3× plan qualification boundaries.
- Dominant-currency threshold and ECB conversion age limit.
- New-account current-open qualification and incomplete historical coverage.

### Integration Tests

- Read-only OAuth callback stores the correct scope and creates no webhook or sequence.
- Paginated 12-month Stripe fixture completes without a record cap.
- Rate-limit retry resumes without duplicated findings.
- Diagnostic jobs are idempotent.
- A failed refresh keeps the prior snapshot.
- Activation OAuth upgrades scope and reconciles one webhook.
- Recovery remains disabled until email configuration and final confirmation.
- Diagnostic findings never schedule historical emails.
- Disconnect removes all connection-scoped diagnostic and recovery data.

### Route and UI Tests

- Onboarding resumes from each persisted phase.
- Progress corresponds to real checkpoints.
- Each verdict renders accurate primary/secondary actions.
- Modeled Benchmark and factual Diagnostic language remain distinct.
- Financial values are not included in analytics payloads.
- Keyboard navigation, focus order, loading semantics, and error announcements work.

### Browser Verification

Verify the guided flow at 390, 768, 1024, 1280, and 1440 px:

- no dashboard empty state appears before the result;
- permission scope is readable before leaving for Stripe;
- analysis can be left and resumed;
- verdict hierarchy matches the approved decision-first layout;
- coverage, exclusions, rate source, and plan break-even are discoverable;
- monitoring and activation CTAs match their actual outcomes;
- disconnect and export confirmations are explicit;
- reduced-motion mode preserves all information.

## Implementation Sequence

1. Apply the immediate truth guardrail and protect it with focused content tests.
2. Add diagnostic lifecycle, snapshot, and finding schema.
3. Extract pure normalization, classification, FX, and qualification policies with fixtures/tests.
4. Implement the read-only Stripe source and paginated async diagnostic job.
5. Split OAuth diagnostic and activation intents; remove write actions from initial callback.
6. Build the guided onboarding, progress, and shared Diagnostic report.
7. Add monitoring and notification thresholds.
8. Add activation upgrade, disabled sequence seeding, and final activation confirmation.
9. Add export and complete disconnect cleanup.
10. Run focused tests, type checks, builds, and browser verification.

## Acceptance Criteria

- The first Stripe authorization is technically `read_only`.
- No Stripe write, webhook, sequence, email, retry, portal session, or recovery row occurs during diagnostic authorization.
- The diagnostic analyzes subscription invoice data across 12 months with a 90-day decision window and no silent pagination cap.
- One-off revenue does not affect MRR or qualification.
- The report distinguishes observed failure, natural recovery, automatable opportunity, human opportunity, historical loss, and exclusions.
- No recovery percentage is used to produce the verdict.
- Activation is recommended only when monthly addressable revenue reaches 3× the plan price.
- The plan comparison uses a timestamped ECB reference conversion when required and fails conservatively when unavailable.
- The public Benchmark and private Diagnostic are named and implemented separately.
- Monitoring is explicit, read-only, monthly, and quiet until a meaningful change.
- Activation requires a second `read_write` OAuth consent and final workflow confirmation.
- Historical invoices never enter recovery automatically.
- Disconnect removes all Stripe-derived diagnostic and recovery data in scope.
- Unsupported product-performance claims and the $19 price are removed.
- Tests cover policy boundaries, OAuth safety, pagination, idempotency, refresh preservation, deletion, accessibility, and responsive behavior.
