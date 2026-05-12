# Dunlo Full App — Design Spec

**Date:** 2026-05-12  
**Scope:** Full application implementation (Stripe Connect, email recovery engine, sequence editor, real dashboard data, settings, onboarding)  
**Constraint:** Existing design/theme is locked — no visual changes to current components or Tailwind tokens.

---

## Overview

Dunlo is a Stripe payment recovery SaaS. The UI and auth are fully built. This spec covers implementing all business logic: connecting Stripe accounts via OAuth, ingesting failed payment webhooks, running automated email recovery sequences (editable per user), surfacing real data in the dashboard, and AI-drafting escalation emails for high-value accounts.

**Architecture decision:** Everything stays in the existing TanStack Start monorepo. API routes handle Stripe OAuth + webhooks. A Nitro scheduled task runs email delivery every 5 minutes. No new services, no external queues.

**Email provider:** Users configure their own Resend API key + sending domain. Dunlo calls Resend on their behalf at send time.

**AI drafting:** Anthropic SDK (Claude Sonnet) generates escalation email drafts. Requires adding `@anthropic-ai/sdk` and `ANTHROPIC_API_KEY`.

---

## 1. Database Schema

All new tables live in `packages/db/src/schema/`. Added to `schema/index.ts` exports.

### `stripeConnection`
One per user. Stores OAuth credentials for their connected Stripe account.

```ts
stripeConnection {
  id: text PK
  userId: text FK→user CASCADE DELETE
  stripeAccountId: text UNIQUE          // e.g. "acct_1ABC..."
  accessToken: text                     // AES-256-GCM encrypted
  publishableKey: text
  webhookEndpointId: text               // Stripe webhook endpoint ID (for cleanup on disconnect)
  webhookSecret: text                   // AES-256-GCM encrypted
  scope: text                           // "read_write"
  escalationThreshold: integer nullable // cents; null = escalation disabled; default 50000 (€500)
  escalationCurrency: text DEFAULT "eur"
  createdAt: timestamp DEFAULT now()
  updatedAt: timestamp
}
indexes: stripeConnection_userId_idx, stripeConnection_stripeAccountId_idx
```

### `emailProvider`
One per user. Their Resend configuration.

```ts
emailProvider {
  id: text PK
  userId: text FK→user CASCADE DELETE UNIQUE
  provider: text DEFAULT "resend"
  apiKey: text                          // AES-256-GCM encrypted
  fromEmail: text                       // e.g. "noreply@acme.io"
  fromName: text                        // e.g. "Acme"
  createdAt: timestamp DEFAULT now()
  updatedAt: timestamp
}
```

### `failedPayment`
One per Stripe failed payment event. Central entity for the recovery flow.

```ts
failedPayment {
  id: text PK
  userId: text FK→user
  stripePaymentIntentId: text UNIQUE
  stripeCustomerId: text
  stripeInvoiceId: text nullable
  amount: integer                       // cents
  currency: text DEFAULT "eur"
  failureCode: text                     // Stripe's decline_code
  failureMessage: text nullable
  customerName: text nullable
  customerEmail: text
  lastFour: text nullable               // last 4 of card
  description: text nullable            // product/subscription name
  status: enum("in_recovery"|"recovered"|"escalated"|"failed"|"dismissed")
  recoveredAt: timestamp nullable
  createdAt: timestamp DEFAULT now()
  updatedAt: timestamp
}
indexes: failedPayment_userId_idx, failedPayment_status_idx, failedPayment_createdAt_idx
```

### `recoverySequence`
Per user per failure code. Seeded with defaults when Stripe connects.

```ts
recoverySequence {
  id: text PK
  userId: text FK→user
  failureCode: text                     // "expired_card" | "card_declined" | "insufficient_funds" | "do_not_honor"
  name: text                            // display name e.g. "Card Expired"
  isActive: boolean DEFAULT true
  createdAt: timestamp DEFAULT now()
  updatedAt: timestamp
}
unique: (userId, failureCode)
```

### `sequenceStep`
Individual email steps within a sequence. Ordered by `stepNumber`.

```ts
sequenceStep {
  id: text PK
  sequenceId: text FK→recoverySequence CASCADE DELETE
  stepNumber: integer                   // 1-based
  delayHours: integer DEFAULT 0        // 0 = send immediately on event
  subject: text
  body: text                            // Markdown, supports {{variables}}
  createdAt: timestamp DEFAULT now()
  updatedAt: timestamp
}
```

### `recoveryAttempt`
One per sequence step per failed payment. Tracks scheduling + delivery.

```ts
recoveryAttempt {
  id: text PK
  failedPaymentId: text FK→failedPayment CASCADE DELETE
  sequenceStepId: text FK→sequenceStep
  status: enum("scheduled"|"sent"|"failed")
  scheduledAt: timestamp
  sentAt: timestamp nullable
  resendEmailId: text nullable
  errorMessage: text nullable
  createdAt: timestamp DEFAULT now()
}
indexes: recoveryAttempt_status_scheduledAt_idx (for scheduler query)
```

### `escalation`
High-value failed payments awaiting manual founder review.

```ts
escalation {
  id: text PK
  failedPaymentId: text FK→failedPayment UNIQUE
  userId: text FK→user
  draftSubject: text nullable           // AI-generated
  draftBody: text nullable              // AI-generated (populated async)
  status: enum("pending"|"sent"|"dismissed")
  createdAt: timestamp DEFAULT now()
  updatedAt: timestamp
}
```

---

## 2. Encryption Utility

New file: `packages/db/src/encrypt.ts`

- AES-256-GCM encryption using Node's `crypto` module
- Exports `encrypt(plaintext: string): string` and `decrypt(ciphertext: string): string`
- Key sourced from `ENCRYPTION_KEY` env var (32-byte hex string)
- Ciphertext format: `iv:authTag:encrypted` (base64-encoded, colon-separated)

---

## 3. Environment Variables

New vars to add to `packages/env/src/server.ts` and `.env`:

```env
# Stripe Connect
STRIPE_CLIENT_ID=ca_...               # From your Stripe Connect application
STRIPE_SECRET_KEY=sk_...              # Your Stripe platform secret key
STRIPE_WEBHOOK_SECRET=whsec_...       # For locally testing webhooks (dev only)

# Encryption
ENCRYPTION_KEY=<32-byte hex string>

# Anthropic (AI escalation drafts)
ANTHROPIC_API_KEY=sk-ant-...

# App URL (for OAuth callbacks)
APP_URL=http://localhost:3001
```

---

## 4. Stripe Connect OAuth

### `/api/stripe/connect` (GET)
- Generates CSRF `state` token, stores in session
- Builds Stripe OAuth URL:
  ```
  https://connect.stripe.com/oauth/authorize
    ?client_id={STRIPE_CLIENT_ID}
    &scope=read_write
    &redirect_uri={APP_URL}/api/stripe/callback
    &state={csrfToken}
  ```
- Redirects user

### `/api/stripe/callback` (GET)
- Validates `state` against session
- Exchanges `code` for `access_token` via `POST https://connect.stripe.com/oauth/token`
- Calls `stripe.webhookEndpoints.create()` on the connected account:
  ```ts
  enabled_events: [
    "payment_intent.payment_failed",
    "payment_intent.succeeded",
    "invoice.payment_failed",
    "invoice.payment_succeeded"
  ]
  url: `${APP_URL}/api/stripe/webhook`
  ```
- Stores encrypted `stripeConnection` record
- Seeds default recovery sequences (see Section 6)
- Redirects to `/dashboard`

### `/api/stripe/disconnect` (POST, authenticated)
- Deletes `stripeConnection` for current user
- Optionally: calls Stripe to deregister the webhook endpoint
- Redirects to `/settings`

---

## 5. Webhook Receiver

### `/api/stripe/webhook` (POST, no auth)

1. Read raw body (must be raw bytes for signature verification)
2. Verify `Stripe-Signature` header using `stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)`
3. Dispatch by event type:

**`payment_intent.payment_failed`:**
- Extract: `payment_intent.id`, `payment_intent.last_payment_error`, customer info from `customer` expand
- Find `stripeConnection` by `stripeAccountId` (from event `account` field)
- Create `failedPayment` record with `status = "in_recovery"`
- Route to recovery (see below)

**`invoice.payment_failed`:**
- Extract: `invoice.payment_intent`, `invoice.customer`, `invoice.amount_due`, `invoice.subscription`
- Same routing logic

**`payment_intent.succeeded`** (recovery signal — customer updated card and payment went through):
- Find `failedPayment` by `stripePaymentIntentId` WHERE `status IN ("in_recovery", "escalated")`
- Update `status = "recovered"`, set `recoveredAt = now()`
- Cancel any pending `recoveryAttempt` records (`status = "scheduled"` → `"dismissed"`)

**`invoice.payment_succeeded`** (for subscription invoices):
- Find `failedPayment` by `stripeInvoiceId` WHERE `status IN ("in_recovery", "escalated")`
- Same recovery marking as above

**Recovery routing (shared logic):**
```
IF amount >= user.escalationThreshold:
  → Create escalation record
  → Trigger async AI draft generation
  → Update failedPayment.status = "escalated"
ELSE:
  → Find active recoverySequence for failureCode (fallback: card_declined)
  → For each sequenceStep:
      Create recoveryAttempt {
        scheduledAt: now() + delayHours * 3600s,
        status: "scheduled"
      }
  → First step (delayHours = 0): send immediately (inline, no scheduler wait)
```

---

## 6. Default Sequences (Seeded at Stripe Connect)

Seeded via `seedDefaultSequences(userId)` server function called after OAuth.

| Failure code | Step | Delay | Subject |
|---|---|---|---|
| `expired_card` | 1 | 0h | "Your card has expired — update to keep {{product_name}}" |
| `expired_card` | 2 | 24h | "Reminder: update your payment to stay subscribed" |
| `expired_card` | 3 | 72h | "Final notice: your {{product_name}} subscription is at risk" |
| `card_declined` | 1 | 0h | "We couldn't process your payment" |
| `card_declined` | 2 | 48h | "Payment still failing — try a different card" |
| `insufficient_funds` | 1 | 24h | "We'll retry your payment in 48 hours" |
| `insufficient_funds` | 2 | 72h | "Payment retry failed — please update your details" |
| `do_not_honor` | 1 | 0h | "Your bank declined the payment" |
| `do_not_honor` | 2 | 48h | "Please contact your bank or use a different card" |

**Template variables available in body:**
```
{{customer_name}}      — from Stripe customer.name
{{amount}}             — formatted, e.g. "€89.00"
{{currency}}           — "EUR", "USD", etc.
{{last_four}}          — card last 4 digits
{{failure_reason}}     — human-readable failure code
{{product_name}}       — from invoice.description or subscription plan name
{{update_payment_url}} — Stripe billing portal one-time URL
{{sender_name}}        — user's emailProvider.fromName
```

---

## 7. Email Engine (Scheduler)

**Nitro scheduled task** in `apps/web/server/plugins/email-scheduler.ts`:

Runs every 5 minutes (configurable via `SCHEDULER_INTERVAL_MINUTES`).

```ts
// Pseudo-logic
const due = await db.select(recoveryAttempt)
  .where(eq(status, "scheduled"))
  .where(lte(scheduledAt, now()))
  .limit(50)  // process in batches

for (const attempt of due) {
  const [step, payment, provider] = await loadContext(attempt)
  const body = renderTemplate(step.body, payment)
  const subject = renderTemplate(step.subject, payment)
  const portalUrl = await generatePortalUrl(payment)  // Stripe billing portal
  const finalBody = body.replace("{{update_payment_url}}", portalUrl)

  try {
    const { id } = await resend.emails.send({
      from: `${provider.fromName} <${provider.fromEmail}>`,
      to: payment.customerEmail,
      subject,
      html: markdownToHtml(finalBody),
    })
    await markSent(attempt.id, id)
  } catch (e) {
    await markFailed(attempt.id, e.message)
  }
}
```

**Stripe billing portal URL generation:**
- Call `stripe.billingPortal.sessions.create({ customer: payment.stripeCustomerId, return_url: payment.stripeInvoiceId ? invoiceUrl : appUrl })`
- If portal not configured: fall back to the Stripe-hosted invoice URL from `invoice.hosted_invoice_url`

---

## 8. AI Escalation Draft Generation

**Package:** `@anthropic-ai/sdk` (add to `apps/web/package.json`)

**Server function:** `generateEscalationDraft(escalationId: string)`

Prompt pattern:
```
System: You are writing a short, personal email from a SaaS founder to a customer 
whose payment failed. The email should feel human, not automated. 2-3 sentences max.
No subject line needed.

User: Customer: {customerName}. Monthly value: {amount}. 
Product: {description}. Failure: {failureReason}.
Write the email body only.
```

Response is stored in `escalation.draftSubject` + `escalation.draftBody`.  
Generation is triggered async after the escalation record is created (fire-and-forget server function call from the webhook handler). Dashboard polls or shows a loading state until draft is ready.

---

## 9. New Routes

### `/onboarding`
Multi-step wizard shown to new users with no Stripe connection. Can be accessed via a banner on `/dashboard` (not a hard gate).

Steps:
1. **Connect Stripe** — "Connect Stripe" button → hits `/api/stripe/connect`
2. **Email provider** — Resend API key + from email + from name form
3. **Done** — Shows summary + link to dashboard

### `/payments`
Full payments list with filters and pagination.
- Filter by status (in_recovery, recovered, escalated, failed)
- Filter by date range
- Sort by amount desc / date desc
- Each row: customer, amount, failure type, status badge, created date
- Follows existing dashboard table visual style

### `/sequences`
Sequence editor. Lists sequences by failure type. For each:
- Toggle active/inactive
- List of steps with delay, subject, body
- Edit inline (form per step)
- Add/remove steps
- Reset to defaults button

### `/settings`
Three-tab layout (follows existing dashboard card style):
- **Account** — name, email (read-only), sign out
- **Email provider** — Resend API key (masked), from email, from name; save + test send button
- **Escalation** — threshold amount + currency; Stripe disconnect button

### API Routes (server-only, no UI)
- `GET /api/stripe/connect` — OAuth redirect
- `GET /api/stripe/callback` — OAuth return handler
- `POST /api/stripe/webhook` — Stripe events
- `POST /api/stripe/disconnect` — Remove connection
- `GET /api/cron/process-emails` — Manual scheduler trigger (also called by Nitro task)

---

## 10. Dashboard Real Data

Replace all mock data in `apps/web/src/routes/dashboard.tsx`.

**Loader function** (`loader: async ({ context }) => ...`):

```ts
// Stats — current month
const monthStart = startOfMonth(new Date())
const payments = await getPaymentsForUser(userId, { since: monthStart })

const recovered = payments.filter(p => p.status === "recovered")
const inRecovery = payments.filter(p => p.status === "in_recovery")
const total = payments.filter(p => ["recovered","failed","dismissed"].includes(p.status))

return {
  stats: {
    recoveredAmount: sum(recovered.map(p => p.amount)),
    inRecoveryCount: inRecovery.length,
    successRate: total.length ? recovered.length / total.length * 100 : 0,
    mrrAtRisk: sum(inRecovery.map(p => p.amount)),
  },
  recentPayments: payments.slice(0, 20),
  pendingEscalations: await getEscalations(userId, "pending"),
  stripeConnected: !!(await getStripeConnection(userId)),
}
```

The dashboard component receives this data via `Route.useLoaderData()` and renders real values.

---

## 11. Onboarding Banner (Dashboard)

When `stripeConnected === false`, the existing "Connect Stripe" banner in the dashboard UI shows with an active link to `/api/stripe/connect`. This banner already exists in the UI — it just needs to be conditionally shown based on loader data.

---

## 12. Package Changes

**`apps/web/package.json`** — add:
```json
"stripe": "^17.x",
"@anthropic-ai/sdk": "^0.37.x"
```

**`packages/env/src/server.ts`** — add validations for:
`STRIPE_CLIENT_ID`, `STRIPE_SECRET_KEY`, `ENCRYPTION_KEY`, `ANTHROPIC_API_KEY`, `APP_URL`

---

## 13. File Structure (New Files)

```
packages/db/src/
  schema/domain.ts              — New domain tables (stripeConnection, emailProvider, etc.)
  encrypt.ts                    — AES-256-GCM encrypt/decrypt

apps/web/src/
  routes/
    onboarding.tsx              — Multi-step onboarding wizard
    payments.tsx                — Full payments list
    sequences.tsx               — Sequence editor
    settings.tsx                — Settings (account, email, escalation)
    api/
      stripe/
        connect.ts              — OAuth redirect
        callback.ts             — OAuth return + seed
        webhook.ts              — Event ingestion
        disconnect.ts           — Remove connection
      cron/
        process-emails.ts       — Email scheduler trigger
  functions/
    stripe.ts                   — Stripe server functions (getConnection, seedSequences)
    payments.ts                 — Payment data server functions
    sequences.ts                — Sequence CRUD server functions
    email-provider.ts           — Email provider CRUD
    escalations.ts              — Escalation CRUD + draft generation
    scheduler.ts                — Email scheduler logic (called by cron route + Nitro task)
  lib/
    stripe.ts                   — Stripe SDK instance (uses stored access token)
    resend.ts                   — Resend client factory (uses stored api key)
    anthropic.ts                — Anthropic SDK instance
    template.ts                 — Template variable renderer
  server/plugins/
    email-scheduler.ts          — Nitro scheduled task definition
```

---

## 14. Acceptance Criteria

- [ ] User can connect a Stripe account via OAuth; `stripeConnection` record is created
- [ ] Default recovery sequences are seeded on first Stripe connect
- [ ] Webhook receives `payment_intent.payment_failed`; `failedPayment` + `recoveryAttempt` records are created
- [ ] Scheduler sends recovery emails on time using user's Resend API key + from address
- [ ] Template variables are correctly replaced in email subject + body
- [ ] High-value payments create `escalation` records; Claude drafts subject + body
- [ ] Dashboard shows real stats and payment rows from the database
- [ ] `/sequences` allows editing step subject, body, delay; changes persist
- [ ] `/settings` saves email provider config; "Send test" button sends a test email
- [ ] `/onboarding` guides new users through Stripe + email provider setup
- [ ] `charge.refunded` marks the failed payment as recovered, cancels pending attempts
- [ ] TypeScript compiles clean with no new errors

---

## Out of Scope (Future)

- Stripe billing portal auto-configuration
- Email open/click tracking (Resend webhooks)
- Multiple Stripe accounts per user
- CSV export of recovery data
- Custom domain for recovery links
- Two-factor auth
