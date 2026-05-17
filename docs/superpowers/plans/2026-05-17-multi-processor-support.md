# Multi-Processor Payment Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend Dunlo beyond Stripe to support Paddle, Adyen, Mollie, and Mangopay — each with a webhook handler, failure code normalizer, and connection management — without breaking the existing Stripe flow.

**Architecture:** Each payment processor implements a shared `ProcessorAdapter` interface that normalizes raw webhook events into `NormalizedPaymentEvent` objects. A processor-agnostic core (`webhook-core.ts`) handles the DB writes and recovery sequence scheduling. Per-processor webhook routes verify signatures and call that core.

**Tech Stack:** TanStack Start (file-based routes), Drizzle ORM + Neon, `@dunlo-v2/db/encrypt` for secrets at rest, Vitest for unit tests, `bun` as package manager.

---

## Reference: Decline Code Mapping

Each adapter normalizes processor-native codes to a shared set of semantic codes used by `recoverySequence.failureCode`. Unknown codes fall back to `card_declined`.

### Normalized codes

| Code | Meaning | Retry? |
|---|---|---|
| `insufficient_funds` | Solde insuffisant | Non |
| `card_declined` | Refus générique | Oui |
| `expired_card` | Carte expirée | Non |
| `authentication_required` | 3DS requis | Oui |
| `authentication_failed` | Échec 3DS | Oui |
| `fraudulent` | Fraude détectée | Non |
| `lost_card` | Carte perdue | Non |
| `stolen_card` | Carte volée | Non |
| `processing_error` | Erreur technique temporaire | Oui |
| `card_blocked` | Carte bloquée par la banque | Non |
| `do_not_honor` | Refus vague (do not honor) | Non |
| `issuer_unavailable` | Banque injoignable | Oui |
| `velocity_exceeded` | Limite de transactions dépassée | Non |
| `not_permitted` | Transaction non autorisée | Non |
| `token_revoked` | Token/mandat révoqué | Non |

### Stripe → Normalized

| Stripe `decline_code` | Normalized |
|---|---|
| `insufficient_funds` | `insufficient_funds` |
| `card_declined` / `generic_decline` | `card_declined` |
| `expired_card` | `expired_card` |
| `authentication_required` | `authentication_required` |
| `fraudulent` | `fraudulent` |
| `lost_card` | `lost_card` |
| `stolen_card` | `stolen_card` |
| `processing_error` / `issuer_not_available` | `processing_error` |
| `do_not_honor` | `do_not_honor` |
| `card_velocity_exceeded` | `velocity_exceeded` |
| `not_permitted` / `transaction_not_allowed` | `not_permitted` |
| *(anything else)* | `card_declined` |

### Paddle → Normalized

| Paddle `error_code` | Normalized |
|---|---|
| `not_enough_balance` | `insufficient_funds` |
| `declined` | `card_declined` |
| `declined_not_retryable` | `card_declined` |
| `expired_card` | `expired_card` |
| `authentication_failed` | `authentication_failed` |
| `fraud` | `fraudulent` |
| `lost_card` | `lost_card` |
| `stolen_card` | `stolen_card` |
| `issuer_unavailable` / `processor_unavailable` | `issuer_unavailable` |
| `blocked_card` | `card_blocked` |
| *(anything else)* | `card_declined` |

### Adyen → Normalized

| Adyen `refusalReasonCode` | Normalized |
|---|---|
| `12` (Not Enough Balance) | `insufficient_funds` |
| `2` (Refused) | `card_declined` |
| `6` (Expired Card) | `expired_card` |
| `38` / `11` (Authentication Required/Failed) | `authentication_required` |
| `14` / `20` (Fraud) | `fraudulent` |
| `5` (Blocked Card) | `card_blocked` |
| `9` (Issuer Unavailable) | `issuer_unavailable` |
| `4` (Acquirer Error) | `processing_error` |
| `23` / `25` (Not Permitted / Restricted) | `not_permitted` |
| `50` (Token Revoked) | `token_revoked` |
| `46` (Blocked By Adyen — excessive retry) | `velocity_exceeded` |
| *(anything else)* | `card_declined` |

### Mollie → Normalized

| Mollie `failureReason` | Normalized |
|---|---|
| `insufficient_funds` | `insufficient_funds` |
| `card_declined` / `refused_by_issuer` | `card_declined` |
| `card_expired` | `expired_card` |
| `authentication_abandoned` / `authentication_failed` / `authentication_required` / `authentication_unavailable_acs` | `authentication_failed` |
| `possible_fraud` | `fraudulent` |
| `inactive_card` | `card_blocked` |
| `invalid_card_number` / `invalid_cvv` / `invalid_card_holder_name` | `card_declined` |
| *(anything else)* | `card_declined` |

### Mangopay → Normalized

| Mangopay `ResultCode` prefix | Normalized |
|---|---|
| `001830` (Insufficient bank balance) | `insufficient_funds` |
| `101101` (Do not honor) | `do_not_honor` |
| `101102` / `101104` (Limit reached) | `velocity_exceeded` |
| `101105` (Expired card) | `expired_card` |
| `101106` (Inactive card) | `card_blocked` |
| `101301` / `101304` / `101305` (3DS failures) | `authentication_failed` |
| `008xxx` (Fraud codes) | `fraudulent` |
| `009xxx` (PSP/Technical errors) | `processing_error` |
| `001801` (Bank account closed) | `not_permitted` |
| *(anything else)* | `card_declined` |

---

## File Map

### New files

| File | Responsibility |
|---|---|
| `apps/web/src/lib/processors/types.ts` | Shared TS types + `ProcessorAdapter` interface |
| `apps/web/src/lib/processors/normalize.ts` | All per-processor code mapping functions |
| `apps/web/src/lib/processors/webhook-core.ts` | Processor-agnostic `handleFailedPayment` / `handleRecoveredPayment` |
| `apps/web/src/lib/processors/stripe-adapter.ts` | Stripe implementation of `ProcessorAdapter` |
| `apps/web/src/lib/processors/paddle-adapter.ts` | Paddle implementation |
| `apps/web/src/lib/processors/adyen-adapter.ts` | Adyen implementation |
| `apps/web/src/lib/processors/mollie-adapter.ts` | Mollie implementation |
| `apps/web/src/lib/processors/mangopay-adapter.ts` | Mangopay implementation |
| `apps/web/src/routes/api/paddle/webhook.ts` | Paddle webhook TanStack route |
| `apps/web/src/routes/api/adyen/webhook.ts` | Adyen webhook TanStack route |
| `apps/web/src/routes/api/mollie/webhook.ts` | Mollie webhook TanStack route |
| `apps/web/src/routes/api/mangopay/webhook.ts` | Mangopay webhook TanStack route |
| `apps/web/src/routes/api/paddle/connect.ts` | Paddle API-key connection route |
| `apps/web/src/routes/api/adyen/connect.ts` | Adyen API-key connection route |
| `apps/web/src/routes/api/mollie/connect.ts` | Mollie API-key connection route |
| `apps/web/src/routes/api/mangopay/connect.ts` | Mangopay API-key connection route |
| `apps/web/src/lib/processors/normalize.test.ts` | Unit tests for all normalizers |

### Modified files

| File | Change |
|---|---|
| `packages/db/src/schema/domain.ts` | Add `processor` enum + column to `failedPayment`; add `processorConnection` table |
| `apps/web/src/routes/api/stripe/webhook.ts` | Refactor: use `ProcessorAdapter` + `webhook-core.ts` |
| `packages/env/src/server.ts` | Add env vars for Paddle, Adyen, Mollie, Mangopay webhook secrets |

---

## Task 1: Processor Adapter Types

**Files:**
- Create: `apps/web/src/lib/processors/types.ts`

- [ ] **Step 1: Create the types file**

```typescript
// apps/web/src/lib/processors/types.ts

export type ProcessorName =
  | "stripe"
  | "paddle"
  | "adyen"
  | "mollie"
  | "mangopay";

export type NormalizedFailureCode =
  | "insufficient_funds"
  | "card_declined"
  | "expired_card"
  | "authentication_required"
  | "authentication_failed"
  | "fraudulent"
  | "lost_card"
  | "stolen_card"
  | "processing_error"
  | "card_blocked"
  | "do_not_honor"
  | "issuer_unavailable"
  | "velocity_exceeded"
  | "not_permitted"
  | "token_revoked";

export type NormalizedFailedPayment = {
  processorPaymentId: string;
  processorCustomerId: string;
  processorInvoiceId: string | null;
  amount: number;
  currency: string;
  failureCode: NormalizedFailureCode;
  failureMessage: string | null;
  customerEmail: string;
  customerName: string | null;
  lastFour: string | null;
  description: string | null;
};

export type NormalizedRecoveredPayment = {
  processorPaymentId: string;
  processorInvoiceId: string | null;
};

export interface ProcessorAdapter {
  name: ProcessorName;
  verifySignature(rawBody: string, headers: Headers, secret: string): boolean;
  parseFailedPayment(rawBody: string): NormalizedFailedPayment | null;
  parseRecoveredPayment(rawBody: string): NormalizedRecoveredPayment | null;
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/lib/processors/types.ts
git commit -m "feat: add ProcessorAdapter interface and normalized payment types"
```

---

## Task 2: Normalize Functions + Unit Tests

**Files:**
- Create: `apps/web/src/lib/processors/normalize.ts`
- Create: `apps/web/src/lib/processors/normalize.test.ts`

- [ ] **Step 1: Write failing tests first**

```typescript
// apps/web/src/lib/processors/normalize.test.ts
import { describe, expect, it } from "vitest";
import {
  normalizeStripeCode,
  normalizePaddleCode,
  normalizeAdyenCode,
  normalizeMollieCode,
  normalizeMangopayCode,
} from "./normalize";

describe("normalizeStripeCode", () => {
  it("maps insufficient_funds", () => {
    expect(normalizeStripeCode("insufficient_funds")).toBe("insufficient_funds");
  });
  it("maps expired_card", () => {
    expect(normalizeStripeCode("expired_card")).toBe("expired_card");
  });
  it("maps lost_card", () => {
    expect(normalizeStripeCode("lost_card")).toBe("lost_card");
  });
  it("maps stolen_card", () => {
    expect(normalizeStripeCode("stolen_card")).toBe("stolen_card");
  });
  it("maps fraudulent", () => {
    expect(normalizeStripeCode("fraudulent")).toBe("fraudulent");
  });
  it("maps authentication_required", () => {
    expect(normalizeStripeCode("authentication_required")).toBe("authentication_required");
  });
  it("maps processing_error", () => {
    expect(normalizeStripeCode("processing_error")).toBe("processing_error");
  });
  it("maps issuer_not_available to processing_error", () => {
    expect(normalizeStripeCode("issuer_not_available")).toBe("processing_error");
  });
  it("maps do_not_honor", () => {
    expect(normalizeStripeCode("do_not_honor")).toBe("do_not_honor");
  });
  it("maps card_velocity_exceeded to velocity_exceeded", () => {
    expect(normalizeStripeCode("card_velocity_exceeded")).toBe("velocity_exceeded");
  });
  it("falls back to card_declined for unknowns", () => {
    expect(normalizeStripeCode("some_unknown_code")).toBe("card_declined");
  });
});

describe("normalizePaddleCode", () => {
  it("maps not_enough_balance to insufficient_funds", () => {
    expect(normalizePaddleCode("not_enough_balance")).toBe("insufficient_funds");
  });
  it("maps declined", () => {
    expect(normalizePaddleCode("declined")).toBe("card_declined");
  });
  it("maps declined_not_retryable to card_declined", () => {
    expect(normalizePaddleCode("declined_not_retryable")).toBe("card_declined");
  });
  it("maps expired_card", () => {
    expect(normalizePaddleCode("expired_card")).toBe("expired_card");
  });
  it("maps blocked_card to card_blocked", () => {
    expect(normalizePaddleCode("blocked_card")).toBe("card_blocked");
  });
  it("maps fraud to fraudulent", () => {
    expect(normalizePaddleCode("fraud")).toBe("fraudulent");
  });
  it("maps authentication_failed", () => {
    expect(normalizePaddleCode("authentication_failed")).toBe("authentication_failed");
  });
  it("maps issuer_unavailable", () => {
    expect(normalizePaddleCode("issuer_unavailable")).toBe("issuer_unavailable");
  });
  it("falls back", () => {
    expect(normalizePaddleCode("unknown")).toBe("card_declined");
  });
});

describe("normalizeAdyenCode", () => {
  it("maps 12 to insufficient_funds", () => {
    expect(normalizeAdyenCode("12")).toBe("insufficient_funds");
  });
  it("maps 2 to card_declined", () => {
    expect(normalizeAdyenCode("2")).toBe("card_declined");
  });
  it("maps 6 to expired_card", () => {
    expect(normalizeAdyenCode("6")).toBe("expired_card");
  });
  it("maps 38 to authentication_required", () => {
    expect(normalizeAdyenCode("38")).toBe("authentication_required");
  });
  it("maps 20 to fraudulent", () => {
    expect(normalizeAdyenCode("20")).toBe("fraudulent");
  });
  it("maps 9 to issuer_unavailable", () => {
    expect(normalizeAdyenCode("9")).toBe("issuer_unavailable");
  });
  it("maps 50 to token_revoked", () => {
    expect(normalizeAdyenCode("50")).toBe("token_revoked");
  });
  it("maps 46 to velocity_exceeded", () => {
    expect(normalizeAdyenCode("46")).toBe("velocity_exceeded");
  });
  it("falls back", () => {
    expect(normalizeAdyenCode("999")).toBe("card_declined");
  });
});

describe("normalizeMollieCode", () => {
  it("maps insufficient_funds", () => {
    expect(normalizeMollieCode("insufficient_funds")).toBe("insufficient_funds");
  });
  it("maps card_expired to expired_card", () => {
    expect(normalizeMollieCode("card_expired")).toBe("expired_card");
  });
  it("maps authentication_abandoned to authentication_failed", () => {
    expect(normalizeMollieCode("authentication_abandoned")).toBe("authentication_failed");
  });
  it("maps possible_fraud to fraudulent", () => {
    expect(normalizeMollieCode("possible_fraud")).toBe("fraudulent");
  });
  it("maps inactive_card to card_blocked", () => {
    expect(normalizeMollieCode("inactive_card")).toBe("card_blocked");
  });
  it("falls back", () => {
    expect(normalizeMollieCode("unknown_reason")).toBe("card_declined");
  });
});

describe("normalizeMangopayCode", () => {
  it("maps 001830 to insufficient_funds", () => {
    expect(normalizeMangopayCode("001830")).toBe("insufficient_funds");
  });
  it("maps 101101 to do_not_honor", () => {
    expect(normalizeMangopayCode("101101")).toBe("do_not_honor");
  });
  it("maps 101105 to expired_card", () => {
    expect(normalizeMangopayCode("101105")).toBe("expired_card");
  });
  it("maps 101106 to card_blocked", () => {
    expect(normalizeMangopayCode("101106")).toBe("card_blocked");
  });
  it("maps 101301 to authentication_failed", () => {
    expect(normalizeMangopayCode("101301")).toBe("authentication_failed");
  });
  it("maps 008001 to fraudulent (008xxx prefix)", () => {
    expect(normalizeMangopayCode("008001")).toBe("fraudulent");
  });
  it("maps 009101 to processing_error (009xxx prefix)", () => {
    expect(normalizeMangopayCode("009101")).toBe("processing_error");
  });
  it("maps 101102 to velocity_exceeded", () => {
    expect(normalizeMangopayCode("101102")).toBe("velocity_exceeded");
  });
  it("falls back", () => {
    expect(normalizeMangopayCode("999999")).toBe("card_declined");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd apps/web && bun run vitest src/lib/processors/normalize.test.ts
```

Expected: FAIL — `normalize` module not found.

- [ ] **Step 3: Implement the normalizers**

```typescript
// apps/web/src/lib/processors/normalize.ts
import type { NormalizedFailureCode } from "./types";

export function normalizeStripeCode(code: string): NormalizedFailureCode {
  const map: Record<string, NormalizedFailureCode> = {
    insufficient_funds: "insufficient_funds",
    card_declined: "card_declined",
    generic_decline: "card_declined",
    expired_card: "expired_card",
    authentication_required: "authentication_required",
    mobile_device_authentication_required: "authentication_required",
    fraudulent: "fraudulent",
    lost_card: "lost_card",
    stolen_card: "stolen_card",
    processing_error: "processing_error",
    issuer_not_available: "processing_error",
    reenter_transaction: "processing_error",
    do_not_honor: "do_not_honor",
    card_velocity_exceeded: "velocity_exceeded",
    withdrawal_count_limit_exceeded: "velocity_exceeded",
    not_permitted: "not_permitted",
    transaction_not_allowed: "not_permitted",
    service_not_allowed: "not_permitted",
    pickup_card: "not_permitted",
    restricted_card: "not_permitted",
    blocked_card: "card_blocked",
  };
  return map[code] ?? "card_declined";
}

export function normalizePaddleCode(code: string): NormalizedFailureCode {
  const map: Record<string, NormalizedFailureCode> = {
    not_enough_balance: "insufficient_funds",
    declined: "card_declined",
    declined_not_retryable: "card_declined",
    expired_card: "expired_card",
    blocked_card: "card_blocked",
    fraud: "fraudulent",
    lost_card: "lost_card",
    stolen_card: "stolen_card",
    authentication_failed: "authentication_failed",
    issuer_unavailable: "issuer_unavailable",
    processor_unavailable: "issuer_unavailable",
  };
  return map[code] ?? "card_declined";
}

export function normalizeAdyenCode(code: string): NormalizedFailureCode {
  const map: Record<string, NormalizedFailureCode> = {
    "2": "card_declined",
    "4": "processing_error",
    "5": "card_blocked",
    "6": "expired_card",
    "9": "issuer_unavailable",
    "11": "authentication_failed",
    "12": "insufficient_funds",
    "14": "fraudulent",
    "20": "fraudulent",
    "23": "not_permitted",
    "25": "not_permitted",
    "31": "fraudulent",
    "38": "authentication_required",
    "42": "authentication_failed",
    "46": "velocity_exceeded",
    "50": "token_revoked",
  };
  return map[code] ?? "card_declined";
}

export function normalizeMollieCode(code: string): NormalizedFailureCode {
  const map: Record<string, NormalizedFailureCode> = {
    insufficient_funds: "insufficient_funds",
    card_declined: "card_declined",
    refused_by_issuer: "card_declined",
    card_expired: "expired_card",
    authentication_abandoned: "authentication_failed",
    authentication_failed: "authentication_failed",
    authentication_required: "authentication_required",
    authentication_unavailable_acs: "authentication_failed",
    possible_fraud: "fraudulent",
    inactive_card: "card_blocked",
    invalid_card_type: "not_permitted",
  };
  return map[code] ?? "card_declined";
}

export function normalizeMangopayCode(code: string): NormalizedFailureCode {
  const prefix = code.slice(0, 3);
  if (prefix === "008") return "fraudulent";
  if (prefix === "009") return "processing_error";

  const map: Record<string, NormalizedFailureCode> = {
    "001830": "insufficient_funds",
    "001801": "not_permitted",
    "101101": "do_not_honor",
    "101102": "velocity_exceeded",
    "101104": "velocity_exceeded",
    "101105": "expired_card",
    "101106": "card_blocked",
    "101301": "authentication_failed",
    "101304": "authentication_failed",
    "101305": "authentication_required",
  };
  return map[code] ?? "card_declined";
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd apps/web && bun run vitest src/lib/processors/normalize.test.ts
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/processors/normalize.ts apps/web/src/lib/processors/normalize.test.ts
git commit -m "feat: add payment failure code normalizers for all processors"
```

---

## Task 3: DB Schema — Add `processor` to `failedPayment`

**Files:**
- Modify: `packages/db/src/schema/domain.ts`

The `failedPayment` table currently has `stripePaymentIntentId` as a NOT NULL unique column. We need to:
1. Add `processor` enum column (default `'stripe'`)
2. Add `processorPaymentId` text column — the canonical payment ID for all processors
3. Change the unique index from `stripePaymentIntentId` alone to `(processorPaymentId, processor)`
4. Keep `stripePaymentIntentId` temporarily for DB compatibility, but treat it as deprecated

- [ ] **Step 1: Add the processor enum and update `failedPayment`**

In `packages/db/src/schema/domain.ts`, update the top section:

```typescript
// Add to existing enum list, after `escalationStatus`:
export const processorEnum = pgEnum("processor", [
  "stripe",
  "paddle",
  "adyen",
  "mollie",
  "mangopay",
]);
```

Then update the `failedPayment` table definition — replace:

```typescript
export const failedPayment = pgTable(
  "failed_payment",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    stripePaymentIntentId: text("stripe_payment_intent_id").notNull().unique(),
    stripeCustomerId: text("stripe_customer_id").notNull(),
    stripeInvoiceId: text("stripe_invoice_id"),
    amount: integer("amount").notNull(),
    currency: text("currency").default("eur").notNull(),
    failureCode: text("failure_code").notNull(),
    failureMessage: text("failure_message"),
    customerName: text("customer_name"),
    customerEmail: text("customer_email").notNull(),
    lastFour: text("last_four"),
    description: text("description"),
    status: failedPaymentStatus("status").default("in_recovery").notNull(),
    recoveredAt: timestamp("recovered_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("failed_payment_user_id_idx").on(table.userId),
    index("failed_payment_status_idx").on(table.status),
    index("failed_payment_created_at_idx").on(table.createdAt),
  ],
);
```

With:

```typescript
export const failedPayment = pgTable(
  "failed_payment",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    processor: processorEnum("processor").default("stripe").notNull(),
    processorPaymentId: text("processor_payment_id").notNull(),
    processorCustomerId: text("processor_customer_id").notNull(),
    processorInvoiceId: text("processor_invoice_id"),
    // Kept for backward compat with existing Stripe rows — do not use for new processors
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    stripeCustomerId: text("stripe_customer_id"),
    stripeInvoiceId: text("stripe_invoice_id"),
    amount: integer("amount").notNull(),
    currency: text("currency").default("eur").notNull(),
    failureCode: text("failure_code").notNull(),
    failureMessage: text("failure_message"),
    customerName: text("customer_name"),
    customerEmail: text("customer_email").notNull(),
    lastFour: text("last_four"),
    description: text("description"),
    status: failedPaymentStatus("status").default("in_recovery").notNull(),
    recoveredAt: timestamp("recovered_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("failed_payment_processor_payment_unique").on(
      table.processorPaymentId,
      table.processor,
    ),
    index("failed_payment_user_id_idx").on(table.userId),
    index("failed_payment_status_idx").on(table.status),
    index("failed_payment_created_at_idx").on(table.createdAt),
    index("failed_payment_processor_idx").on(table.processor),
  ],
);
```

- [ ] **Step 2: Add `processorConnection` table** (for non-Stripe processors that use API keys)

Add after `stripeConnection` in the same file:

```typescript
export const processorConnection = pgTable(
  "processor_connection",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    processor: processorEnum("processor").notNull(),
    apiKey: text("api_key").notNull(),           // encrypted via @dunlo-v2/db/encrypt
    apiSecret: text("api_secret"),               // encrypted — Mangopay client secret, Adyen HMAC key
    merchantId: text("merchant_id"),             // Adyen merchant account, Mangopay client ID
    webhookId: text("webhook_id"),
    webhookSecret: text("webhook_secret"),       // encrypted
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("processor_connection_user_processor_unique").on(
      table.userId,
      table.processor,
    ),
    index("processor_connection_user_id_idx").on(table.userId),
  ],
);

export const processorConnectionRelations = relations(
  processorConnection,
  ({ one }) => ({
    user: one(user, {
      fields: [processorConnection.userId],
      references: [user.id],
    }),
  }),
);
```

- [ ] **Step 3: Push the schema**

```bash
bun run db:push
```

Expected: Neon schema updated with new columns and `processor_connection` table.

> **Note:** The migration adds nullable `processorPaymentId` and `processorCustomerId`. Run a one-off backfill in Drizzle Studio or a script to copy existing `stripePaymentIntentId` → `processorPaymentId` and `stripeCustomerId` → `processorCustomerId` for all existing rows where `processor = 'stripe'`.

- [ ] **Step 4: Commit**

```bash
git add packages/db/src/schema/domain.ts
git commit -m "feat: add processor column + processorConnection table to schema"
```

---

## Task 4: Processor-Agnostic Webhook Core

**Files:**
- Create: `apps/web/src/lib/processors/webhook-core.ts`

This replaces the Stripe-specific `processFailedPayment` / `processRecoveredPayment` logic in `webhook.ts`. It reads `NormalizedFailedPayment` and handles DB writes, sequence scheduling, escalation logic — all processor-agnostic.

- [ ] **Step 1: Create webhook-core.ts**

```typescript
// apps/web/src/lib/processors/webhook-core.ts
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@dunlo-v2/db";
import {
  escalation,
  failedPayment,
  recoveryAttempt,
  recoverySequence,
  sequenceStep,
} from "@dunlo-v2/db/schema/domain";
import type { ProcessorName, NormalizedFailedPayment, NormalizedRecoveredPayment } from "./types";

type ConnectionCtx = {
  userId: string;
  escalationThreshold: number | null;
};

type FailedResult = {
  wasEscalated: boolean;
  customerName: string | null;
  customerEmail: string;
  amount: number;
  currency: string;
} | null;

export async function handleFailedPayment(
  processor: ProcessorName,
  normalized: NormalizedFailedPayment,
  connection: ConnectionCtx,
): Promise<FailedResult> {
  if (!normalized.customerEmail) return null;

  const existing = await db
    .select({ id: failedPayment.id })
    .from(failedPayment)
    .where(
      and(
        eq(failedPayment.processorPaymentId, normalized.processorPaymentId),
        eq(failedPayment.processor, processor),
      ),
    )
    .limit(1);
  if (existing.length > 0) return null;

  const threshold = connection.escalationThreshold;
  const shouldEscalate =
    threshold !== null && threshold > 0 && normalized.amount >= threshold;

  const paymentId = crypto.randomUUID();

  await db.insert(failedPayment).values({
    id: paymentId,
    userId: connection.userId,
    processor,
    processorPaymentId: normalized.processorPaymentId,
    processorCustomerId: normalized.processorCustomerId,
    processorInvoiceId: normalized.processorInvoiceId,
    amount: normalized.amount,
    currency: normalized.currency,
    failureCode: normalized.failureCode,
    failureMessage: normalized.failureMessage,
    customerName: normalized.customerName,
    customerEmail: normalized.customerEmail,
    lastFour: normalized.lastFour,
    description: normalized.description,
    status: shouldEscalate ? "escalated" : "in_recovery",
  });

  if (shouldEscalate) {
    const escalationId = crypto.randomUUID();
    await db.insert(escalation).values({
      id: escalationId,
      failedPaymentId: paymentId,
      userId: connection.userId,
      draftSubject: null,
      draftBody: null,
      status: "pending",
    });
    return {
      wasEscalated: true,
      customerName: normalized.customerName,
      customerEmail: normalized.customerEmail,
      amount: normalized.amount,
      currency: normalized.currency,
    };
  }

  const sequence = await findSequence(connection.userId, normalized.failureCode);
  if (!sequence) return null;

  const steps = await db
    .select()
    .from(sequenceStep)
    .where(eq(sequenceStep.sequenceId, sequence.id));

  if (steps.length === 0) return null;

  const now = Date.now();
  for (const step of steps.sort((a, b) => a.stepNumber - b.stepNumber)) {
    await db.insert(recoveryAttempt).values({
      id: crypto.randomUUID(),
      failedPaymentId: paymentId,
      sequenceStepId: step.id,
      status: "scheduled",
      scheduledAt: new Date(now + step.delayHours * 3600 * 1000),
    });
  }

  return {
    wasEscalated: false,
    customerName: normalized.customerName,
    customerEmail: normalized.customerEmail,
    amount: normalized.amount,
    currency: normalized.currency,
  };
}

async function findSequence(userId: string, failureCode: string) {
  const [direct] = await db
    .select()
    .from(recoverySequence)
    .where(
      and(
        eq(recoverySequence.userId, userId),
        eq(recoverySequence.failureCode, failureCode),
        eq(recoverySequence.isActive, true),
      ),
    )
    .limit(1);
  if (direct) return direct;

  const [fallback] = await db
    .select()
    .from(recoverySequence)
    .where(
      and(
        eq(recoverySequence.userId, userId),
        eq(recoverySequence.failureCode, "card_declined"),
        eq(recoverySequence.isActive, true),
      ),
    )
    .limit(1);
  return fallback ?? null;
}

type RecoveredResult = {
  customerName: string | null;
  customerEmail: string;
  amount: number;
  currency: string;
} | null;

export async function handleRecoveredPayment(
  processor: ProcessorName,
  normalized: NormalizedRecoveredPayment,
  userId: string,
): Promise<RecoveredResult> {
  const matches = await db
    .select()
    .from(failedPayment)
    .where(
      and(
        eq(failedPayment.userId, userId),
        eq(failedPayment.processor, processor),
        inArray(failedPayment.status, ["in_recovery", "escalated"]),
      ),
    );

  const target = matches.find(
    (p) =>
      p.processorPaymentId === normalized.processorPaymentId ||
      (normalized.processorInvoiceId &&
        p.processorInvoiceId === normalized.processorInvoiceId),
  );
  if (!target) return null;

  await db
    .update(failedPayment)
    .set({ status: "recovered", recoveredAt: new Date() })
    .where(eq(failedPayment.id, target.id));

  await db
    .update(recoveryAttempt)
    .set({ status: "dismissed" })
    .where(
      and(
        eq(recoveryAttempt.failedPaymentId, target.id),
        eq(recoveryAttempt.status, "scheduled"),
      ),
    );

  return {
    customerName: target.customerName,
    customerEmail: target.customerEmail,
    amount: target.amount,
    currency: target.currency,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/lib/processors/webhook-core.ts
git commit -m "feat: add processor-agnostic webhook core for failed/recovered payments"
```

---

## Task 5: Refactor Stripe to Use the New Interface

**Files:**
- Create: `apps/web/src/lib/processors/stripe-adapter.ts`
- Modify: `apps/web/src/routes/api/stripe/webhook.ts`

- [ ] **Step 1: Create stripe-adapter.ts**

```typescript
// apps/web/src/lib/processors/stripe-adapter.ts
import Stripe from "stripe";
import type { ProcessorAdapter, NormalizedFailedPayment, NormalizedRecoveredPayment } from "./types";
import { normalizeStripeCode } from "./normalize";

const STRIPE_API_VERSION = "2024-12-18.acacia" as Stripe.LatestApiVersion;

export const stripeAdapter: ProcessorAdapter = {
  name: "stripe",

  verifySignature(rawBody: string, headers: Headers, secret: string): boolean {
    const sig = headers.get("stripe-signature");
    if (!sig) return false;
    try {
      const stripe = new Stripe("", { apiVersion: STRIPE_API_VERSION });
      stripe.webhooks.constructEvent(rawBody, sig, secret);
      return true;
    } catch {
      return false;
    }
  },

  parseFailedPayment(rawBody: string): NormalizedFailedPayment | null {
    let event: Stripe.Event;
    try {
      event = JSON.parse(rawBody) as Stripe.Event;
    } catch {
      return null;
    }

    if (event.type === "payment_intent.payment_failed") {
      const pi = event.data.object as Stripe.PaymentIntent;
      const piWithCharges = pi as Stripe.PaymentIntent & {
        charges?: { data: Stripe.Charge[] };
      };
      const charge =
        piWithCharges.charges?.data[0] ??
        (typeof pi.latest_charge === "object" && pi.latest_charge !== null
          ? (pi.latest_charge as Stripe.Charge)
          : undefined);

      const rawCode =
        pi.last_payment_error?.decline_code ??
        pi.last_payment_error?.code ??
        "card_declined";

      return {
        processorPaymentId: pi.id,
        processorCustomerId: (pi.customer as string | null) ?? "",
        processorInvoiceId: (pi.invoice as string | null) ?? null,
        amount: pi.amount,
        currency: pi.currency,
        failureCode: normalizeStripeCode(rawCode),
        failureMessage: pi.last_payment_error?.message ?? null,
        customerEmail:
          (pi.receipt_email as string | null) ??
          (charge?.billing_details?.email as string | null) ??
          null,
        customerName: (charge?.billing_details?.name as string | null) ?? null,
        lastFour:
          (charge?.payment_method_details?.card?.last4 as string | null) ?? null,
        description: pi.description ?? null,
      } as NormalizedFailedPayment;
    }

    if (event.type === "invoice.payment_failed") {
      const inv = event.data.object as Stripe.Invoice;
      const rawCode =
        (inv.last_finalization_error?.decline_code as string | undefined) ??
        (inv.last_finalization_error?.code as string | undefined) ??
        "card_declined";
      const piId =
        typeof inv.payment_intent === "string"
          ? inv.payment_intent
          : inv.payment_intent?.id ?? `inv_${inv.id}`;

      return {
        processorPaymentId: piId,
        processorCustomerId:
          typeof inv.customer === "string"
            ? inv.customer
            : inv.customer?.id ?? "",
        processorInvoiceId: inv.id,
        amount: inv.amount_due,
        currency: inv.currency,
        failureCode: normalizeStripeCode(rawCode),
        failureMessage: inv.last_finalization_error?.message ?? null,
        customerEmail: inv.customer_email ?? null,
        customerName: inv.customer_name ?? null,
        lastFour: null,
        description:
          inv.description ?? inv.lines?.data?.[0]?.description ?? null,
      } as NormalizedFailedPayment;
    }

    return null;
  },

  parseRecoveredPayment(rawBody: string): NormalizedRecoveredPayment | null {
    let event: Stripe.Event;
    try {
      event = JSON.parse(rawBody) as Stripe.Event;
    } catch {
      return null;
    }

    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object as Stripe.PaymentIntent;
      return {
        processorPaymentId: pi.id,
        processorInvoiceId:
          typeof pi.invoice === "string"
            ? pi.invoice
            : (pi.invoice as Stripe.Invoice | null)?.id ?? null,
      };
    }

    if (event.type === "invoice.payment_succeeded") {
      const inv = event.data.object as Stripe.Invoice;
      return {
        processorPaymentId:
          typeof inv.payment_intent === "string"
            ? inv.payment_intent
            : inv.payment_intent?.id ?? "",
        processorInvoiceId: inv.id,
      };
    }

    return null;
  },
};
```

- [ ] **Step 2: Update webhook.ts to use the new adapter and core**

In `apps/web/src/routes/api/stripe/webhook.ts`, replace `processFailedPayment` and `processRecoveredPayment` calls with:

```typescript
// In the POST handler, replace the try block:
try {
  const FAILURE_EVENTS = new Set(["payment_intent.payment_failed", "invoice.payment_failed"]);
  const SUCCESS_EVENTS = new Set(["payment_intent.succeeded", "invoice.payment_succeeded"]);

  if (FAILURE_EVENTS.has(event.type)) {
    const normalized = stripeAdapter.parseFailedPayment(rawBody);
    if (normalized?.customerEmail) {
      const result = await handleFailedPayment("stripe", normalized, {
        userId: connection.userId,
        escalationThreshold: connection.escalationThreshold,
      });
      if (result) {
        sendAlertNotification({ ... }).catch(console.error);
      }
    }
  } else if (SUCCESS_EVENTS.has(event.type)) {
    const normalized = stripeAdapter.parseRecoveredPayment(rawBody);
    if (normalized) {
      const result = await handleRecoveredPayment("stripe", normalized, connection.userId);
      if (result) {
        sendAlertNotification({ ... }).catch(console.error);
      }
    }
  } else if (event.type === "customer.updated") {
    await processPaymentMethodUpdate(event, connection);
  }
}
```

> Note: `processPaymentMethodUpdate` (invoice retry on card update) is Stripe-specific; keep it as-is. The `sendAlertNotification` call signature remains unchanged.

- [ ] **Step 3: Verify types compile**

```bash
bun run check-types
```

Expected: No type errors.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/lib/processors/stripe-adapter.ts apps/web/src/routes/api/stripe/webhook.ts
git commit -m "refactor: move stripe webhook logic to ProcessorAdapter interface"
```

---

## Task 6: Paddle Adapter

**Files:**
- Create: `apps/web/src/lib/processors/paddle-adapter.ts`
- Create: `apps/web/src/routes/api/paddle/webhook.ts`
- Create: `apps/web/src/routes/api/paddle/connect.ts`
- Create: `apps/web/src/routes/api/paddle/disconnect.ts`

### How Paddle webhooks work

- Paddle sends a `Paddle-Signature` header: `ts=1234567890;h1=<hmac-sha256>`
- Signature is HMAC-SHA256 of `ts:rawBody` using the webhook secret
- Failure event: `transaction.payment_failed` — body contains `data.error_code` and transaction details
- Success event: `transaction.completed`
- Paddle uses API keys (not OAuth) — no OAuth flow needed

- [ ] **Step 1: Install Paddle SDK**

```bash
bun add @paddle/paddle-node-sdk
```

- [ ] **Step 2: Create paddle-adapter.ts**

```typescript
// apps/web/src/lib/processors/paddle-adapter.ts
import { createHmac } from "crypto";
import type { ProcessorAdapter, NormalizedFailedPayment, NormalizedRecoveredPayment } from "./types";
import { normalizePaddleCode } from "./normalize";

type PaddleTransactionPaymentFailedEvent = {
  event_type: "transaction.payment_failed";
  data: {
    id: string;
    customer_id: string;
    invoice_id?: string | null;
    currency_code: string;
    details: {
      totals: { total: string };
      error_code: string | null;
    };
    custom_data?: { customer_email?: string; customer_name?: string } | null;
    billing_details?: {
      name?: string;
      email?: string;
    } | null;
  };
  error_code?: string | null;
};

type PaddleTransactionCompletedEvent = {
  event_type: "transaction.completed";
  data: {
    id: string;
    invoice_id?: string | null;
  };
};

function verifyPaddleSignature(rawBody: string, signatureHeader: string, secret: string): boolean {
  const parts = signatureHeader.split(";");
  const tsPart = parts.find((p) => p.startsWith("ts="));
  const h1Part = parts.find((p) => p.startsWith("h1="));
  if (!tsPart || !h1Part) return false;
  const ts = tsPart.slice(3);
  const h1 = h1Part.slice(3);
  const expected = createHmac("sha256", secret)
    .update(`${ts}:${rawBody}`)
    .digest("hex");
  return expected === h1;
}

export const paddleAdapter: ProcessorAdapter = {
  name: "paddle",

  verifySignature(rawBody: string, headers: Headers, secret: string): boolean {
    const sig = headers.get("paddle-signature");
    if (!sig) return false;
    return verifyPaddleSignature(rawBody, sig, secret);
  },

  parseFailedPayment(rawBody: string): NormalizedFailedPayment | null {
    let event: PaddleTransactionPaymentFailedEvent;
    try {
      event = JSON.parse(rawBody) as PaddleTransactionPaymentFailedEvent;
    } catch {
      return null;
    }
    if (event.event_type !== "transaction.payment_failed") return null;

    const d = event.data;
    const rawCode = d.details?.error_code ?? event.error_code ?? "declined";
    const amountCents = Math.round(
      parseFloat(d.details?.totals?.total ?? "0") * 100,
    );

    return {
      processorPaymentId: d.id,
      processorCustomerId: d.customer_id,
      processorInvoiceId: d.invoice_id ?? null,
      amount: amountCents,
      currency: d.currency_code.toLowerCase(),
      failureCode: normalizePaddleCode(rawCode),
      failureMessage: rawCode,
      customerEmail:
        d.billing_details?.email ??
        d.custom_data?.customer_email ??
        null,
      customerName:
        d.billing_details?.name ??
        d.custom_data?.customer_name ??
        null,
      lastFour: null,
      description: null,
    } as NormalizedFailedPayment;
  },

  parseRecoveredPayment(rawBody: string): NormalizedRecoveredPayment | null {
    let event: PaddleTransactionCompletedEvent;
    try {
      event = JSON.parse(rawBody) as PaddleTransactionCompletedEvent;
    } catch {
      return null;
    }
    if (event.event_type !== "transaction.completed") return null;
    return {
      processorPaymentId: event.data.id,
      processorInvoiceId: event.data.invoice_id ?? null,
    };
  },
};
```

- [ ] **Step 3: Create Paddle webhook route**

```typescript
// apps/web/src/routes/api/paddle/webhook.ts
import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { db } from "@dunlo-v2/db";
import { processorConnection } from "@dunlo-v2/db/schema/domain";
import { decrypt } from "@dunlo-v2/db/encrypt";
import { paddleAdapter } from "@/lib/processors/paddle-adapter";
import { handleFailedPayment, handleRecoveredPayment } from "@/lib/processors/webhook-core";
import { sendAlertNotification } from "@/lib/notifications";

export const Route = createFileRoute("/api/paddle/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();

        // Paddle sends the webhook as a platform-level event
        // We need to resolve which Dunlo user owns this Paddle account.
        // Paddle includes a `customer_id` in the event — we can't route by
        // account ID like Stripe. Instead we verify against all active connections.
        const connections = await db
          .select()
          .from(processorConnection)
          .where(eq(processorConnection.processor, "paddle"));

        let matchedConnection: (typeof connections)[number] | undefined;
        for (const conn of connections) {
          const secret = conn.webhookSecret ? decrypt(conn.webhookSecret) : "";
          if (paddleAdapter.verifySignature(rawBody, request.headers, secret)) {
            matchedConnection = conn;
            break;
          }
        }

        if (!matchedConnection) {
          return new Response("Invalid signature", { status: 400 });
        }

        const failed = paddleAdapter.parseFailedPayment(rawBody);
        if (failed?.customerEmail) {
          const result = await handleFailedPayment("paddle", failed, {
            userId: matchedConnection.userId,
            escalationThreshold: null,
          });
          if (result) {
            sendAlertNotification({
              userId: matchedConnection.userId,
              eventType: result.wasEscalated ? "escalation" : "failure",
              customerName: result.customerName,
              customerEmail: result.customerEmail,
              amount: result.amount,
              currency: result.currency,
            }).catch(console.error);
          }
          return Response.json({ received: true });
        }

        const recovered = paddleAdapter.parseRecoveredPayment(rawBody);
        if (recovered) {
          const result = await handleRecoveredPayment(
            "paddle",
            recovered,
            matchedConnection.userId,
          );
          if (result) {
            sendAlertNotification({
              userId: matchedConnection.userId,
              eventType: "recovery",
              customerName: result.customerName,
              customerEmail: result.customerEmail,
              amount: result.amount,
              currency: result.currency,
            }).catch(console.error);
          }
        }

        return Response.json({ received: true });
      },
    },
  },
});
```

- [ ] **Step 4: Create Paddle connect route**

```typescript
// apps/web/src/routes/api/paddle/connect.ts
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { db } from "@dunlo-v2/db";
import { processorConnection } from "@dunlo-v2/db/schema/domain";
import { encrypt } from "@dunlo-v2/db/encrypt";
import { authMiddleware } from "@/middleware/auth";
import { z } from "zod";

export const connectPaddle = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((raw: unknown) =>
    z.object({
      apiKey: z.string().min(1),        // Paddle API key (sk_live_...)
      webhookSecret: z.string().min(1), // From Paddle dashboard
    }).parse(raw)
  )
  .handler(async ({ context, data }) => {
    if (!context.session) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    await db
      .insert(processorConnection)
      .values({
        userId,
        processor: "paddle",
        apiKey: encrypt(data.apiKey),
        webhookSecret: encrypt(data.webhookSecret),
        isActive: true,
      })
      .onConflictDoUpdate({
        target: [processorConnection.userId, processorConnection.processor],
        set: {
          apiKey: encrypt(data.apiKey),
          webhookSecret: encrypt(data.webhookSecret),
          isActive: true,
          updatedAt: new Date(),
        },
      });

    return { ok: true };
  });

export const Route = createFileRoute("/api/paddle/connect")({});
```

- [ ] **Step 5: Create Paddle disconnect route**

```typescript
// apps/web/src/routes/api/paddle/disconnect.ts
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { db } from "@dunlo-v2/db";
import { processorConnection } from "@dunlo-v2/db/schema/domain";
import { authMiddleware } from "@/middleware/auth";

export const disconnectPaddle = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (!context.session) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    await db
      .update(processorConnection)
      .set({ isActive: false })
      .where(
        and(
          eq(processorConnection.userId, userId),
          eq(processorConnection.processor, "paddle"),
        ),
      );

    return { ok: true };
  });

export const Route = createFileRoute("/api/paddle/disconnect")({});
```

- [ ] **Step 6: Verify types compile**

```bash
bun run check-types
```

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/lib/processors/paddle-adapter.ts apps/web/src/routes/api/paddle/
git commit -m "feat: add Paddle payment processor adapter and webhook route"
```

---

## Task 7: Adyen Adapter

**Files:**
- Create: `apps/web/src/lib/processors/adyen-adapter.ts`
- Create: `apps/web/src/routes/api/adyen/webhook.ts`
- Create: `apps/web/src/routes/api/adyen/connect.ts`
- Create: `apps/web/src/routes/api/adyen/disconnect.ts`

### How Adyen webhooks work

- Adyen sends `AUTHORISATION` notifications with `success: "true"` or `success: "false"`
- Signature: HMAC-SHA256 of a concatenated string of notification fields using a custom key
- Key field: `additionalData.refusalReasonCode` contains the numeric code (e.g. `"12"`)
- Amount is in `amount.value` (smallest currency unit — same as Stripe)
- Adyen requires responding `[accepted]` (plain text) to acknowledge

- [ ] **Step 1: Create adyen-adapter.ts**

```typescript
// apps/web/src/lib/processors/adyen-adapter.ts
import { createHmac } from "crypto";
import type { ProcessorAdapter, NormalizedFailedPayment, NormalizedRecoveredPayment } from "./types";
import { normalizeAdyenCode } from "./normalize";

type AdyenNotificationItem = {
  NotificationRequestItem: {
    eventCode: string;
    success: string;
    pspReference: string;
    originalReference?: string;
    merchantReference: string;
    amount: { value: number; currency: string };
    additionalData?: {
      refusalReasonCode?: string;
      refusalReason?: string;
      cardSummary?: string;
    };
    reason?: string;
  };
};

type AdyenWebhookBody = {
  live: string;
  notificationItems: AdyenNotificationItem[];
};

function verifyAdyenSignature(
  item: AdyenNotificationItem["NotificationRequestItem"],
  hmacKey: string,
): boolean {
  const fields = [
    item.pspReference ?? "",
    item.originalReference ?? "",
    item.merchantReference ?? "",
    item.amount.value?.toString() ?? "",
    item.amount.currency ?? "",
    item.eventCode ?? "",
    item.success ?? "",
  ];
  const signData = fields.join(":");
  const key = Buffer.from(hmacKey, "hex");
  const expected = createHmac("sha256", key).update(signData).digest("base64");
  return (item as unknown as Record<string, string>)["additionalData.hmacSignature"] === expected;
}

export const adyenAdapter: ProcessorAdapter = {
  name: "adyen",

  verifySignature(rawBody: string, _headers: Headers, secret: string): boolean {
    let body: AdyenWebhookBody;
    try {
      body = JSON.parse(rawBody) as AdyenWebhookBody;
    } catch {
      return false;
    }
    const item = body.notificationItems?.[0]?.NotificationRequestItem;
    if (!item) return false;
    return verifyAdyenSignature(item, secret);
  },

  parseFailedPayment(rawBody: string): NormalizedFailedPayment | null {
    let body: AdyenWebhookBody;
    try {
      body = JSON.parse(rawBody) as AdyenWebhookBody;
    } catch {
      return null;
    }
    const item = body.notificationItems?.[0]?.NotificationRequestItem;
    if (!item) return null;
    if (item.eventCode !== "AUTHORISATION" || item.success === "true") return null;

    const rawCode = item.additionalData?.refusalReasonCode ?? "2";

    // merchantReference is typically customer email for Adyen checkout
    const customerEmail = item.merchantReference?.includes("@")
      ? item.merchantReference
      : null;

    return {
      processorPaymentId: item.pspReference,
      processorCustomerId: item.merchantReference,
      processorInvoiceId: null,
      amount: item.amount.value,
      currency: item.amount.currency.toLowerCase(),
      failureCode: normalizeAdyenCode(rawCode),
      failureMessage: item.additionalData?.refusalReason ?? item.reason ?? null,
      customerEmail,
      customerName: null,
      lastFour: item.additionalData?.cardSummary ?? null,
      description: null,
    } as NormalizedFailedPayment;
  },

  parseRecoveredPayment(rawBody: string): NormalizedRecoveredPayment | null {
    let body: AdyenWebhookBody;
    try {
      body = JSON.parse(rawBody) as AdyenWebhookBody;
    } catch {
      return null;
    }
    const item = body.notificationItems?.[0]?.NotificationRequestItem;
    if (!item) return null;
    if (item.eventCode !== "AUTHORISATION" || item.success !== "true") return null;

    return {
      processorPaymentId: item.pspReference,
      processorInvoiceId: null,
    };
  },
};
```

- [ ] **Step 2: Create Adyen webhook route**

```typescript
// apps/web/src/routes/api/adyen/webhook.ts
import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { db } from "@dunlo-v2/db";
import { processorConnection } from "@dunlo-v2/db/schema/domain";
import { decrypt } from "@dunlo-v2/db/encrypt";
import { adyenAdapter } from "@/lib/processors/adyen-adapter";
import { handleFailedPayment, handleRecoveredPayment } from "@/lib/processors/webhook-core";
import { sendAlertNotification } from "@/lib/notifications";

export const Route = createFileRoute("/api/adyen/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();

        const connections = await db
          .select()
          .from(processorConnection)
          .where(eq(processorConnection.processor, "adyen"));

        let matchedConnection: (typeof connections)[number] | undefined;
        for (const conn of connections) {
          const secret = conn.apiSecret ? decrypt(conn.apiSecret) : "";
          if (adyenAdapter.verifySignature(rawBody, request.headers, secret)) {
            matchedConnection = conn;
            break;
          }
        }

        if (!matchedConnection) {
          return new Response("[accepted]", { status: 200 });
        }

        const failed = adyenAdapter.parseFailedPayment(rawBody);
        if (failed?.customerEmail) {
          const result = await handleFailedPayment("adyen", failed, {
            userId: matchedConnection.userId,
            escalationThreshold: null,
          });
          if (result) {
            sendAlertNotification({
              userId: matchedConnection.userId,
              eventType: result.wasEscalated ? "escalation" : "failure",
              customerName: result.customerName,
              customerEmail: result.customerEmail,
              amount: result.amount,
              currency: result.currency,
            }).catch(console.error);
          }
          return new Response("[accepted]", { status: 200 });
        }

        const recovered = adyenAdapter.parseRecoveredPayment(rawBody);
        if (recovered) {
          const result = await handleRecoveredPayment(
            "adyen",
            recovered,
            matchedConnection.userId,
          );
          if (result) {
            sendAlertNotification({
              userId: matchedConnection.userId,
              eventType: "recovery",
              customerName: result.customerName,
              customerEmail: result.customerEmail,
              amount: result.amount,
              currency: result.currency,
            }).catch(console.error);
          }
        }

        // Adyen requires plain text "[accepted]" response
        return new Response("[accepted]", { status: 200 });
      },
    },
  },
});
```

- [ ] **Step 3: Create connect / disconnect routes**

These follow the exact same pattern as Paddle. For Adyen:
- `apiKey` = Adyen API key
- `apiSecret` = HMAC signing key (hex string from Adyen dashboard)
- `merchantId` = Adyen merchant account name

```typescript
// apps/web/src/routes/api/adyen/connect.ts
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { db } from "@dunlo-v2/db";
import { processorConnection } from "@dunlo-v2/db/schema/domain";
import { encrypt } from "@dunlo-v2/db/encrypt";
import { authMiddleware } from "@/middleware/auth";
import { z } from "zod";

export const connectAdyen = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((raw: unknown) =>
    z.object({
      apiKey: z.string().min(1),
      hmacKey: z.string().min(1),      // hex HMAC signing key
      merchantId: z.string().min(1),   // Adyen merchant account name
    }).parse(raw)
  )
  .handler(async ({ context, data }) => {
    if (!context.session) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    await db
      .insert(processorConnection)
      .values({
        userId,
        processor: "adyen",
        apiKey: encrypt(data.apiKey),
        apiSecret: encrypt(data.hmacKey),
        merchantId: data.merchantId,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: [processorConnection.userId, processorConnection.processor],
        set: {
          apiKey: encrypt(data.apiKey),
          apiSecret: encrypt(data.hmacKey),
          merchantId: data.merchantId,
          isActive: true,
          updatedAt: new Date(),
        },
      });

    return { ok: true };
  });

export const Route = createFileRoute("/api/adyen/connect")({});
```

```typescript
// apps/web/src/routes/api/adyen/disconnect.ts
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { db } from "@dunlo-v2/db";
import { processorConnection } from "@dunlo-v2/db/schema/domain";
import { authMiddleware } from "@/middleware/auth";

export const disconnectAdyen = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (!context.session) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    await db
      .update(processorConnection)
      .set({ isActive: false })
      .where(and(eq(processorConnection.userId, userId), eq(processorConnection.processor, "adyen")));

    return { ok: true };
  });

export const Route = createFileRoute("/api/adyen/disconnect")({});
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/lib/processors/adyen-adapter.ts apps/web/src/routes/api/adyen/
git commit -m "feat: add Adyen payment processor adapter and webhook route"
```

---

## Task 8: Mollie Adapter

**Files:**
- Create: `apps/web/src/lib/processors/mollie-adapter.ts`
- Create: `apps/web/src/routes/api/mollie/webhook.ts`
- Create: `apps/web/src/routes/api/mollie/connect.ts`
- Create: `apps/web/src/routes/api/mollie/disconnect.ts`

### How Mollie webhooks work

Mollie webhooks are **pull-based**: they POST only `id=tr_xxxxx` in the body (no event type). You must call the Mollie API with the payment ID to get its status. A payment with `status: 'failed'` is a failure; `status: 'paid'` is success.

Mollie does not sign webhooks with HMAC. Instead you verify the payment by making an API call — the API key acts as the authentication.

- [ ] **Step 1: Install Mollie SDK**

```bash
bun add @mollie/api-client
```

- [ ] **Step 2: Create mollie-adapter.ts**

```typescript
// apps/web/src/lib/processors/mollie-adapter.ts
import type { ProcessorAdapter, NormalizedFailedPayment, NormalizedRecoveredPayment } from "./types";
import { normalizeMollieCode } from "./normalize";

// Mollie does not support HMAC signatures on webhooks.
// Verification is done by calling their API with the payment ID.
// The `verifySignature` step is intentionally a no-op — actual
// verification happens in the route handler by calling the API.

export const mollieAdapter: ProcessorAdapter = {
  name: "mollie",

  verifySignature(_rawBody: string, _headers: Headers, _secret: string): boolean {
    // No HMAC signature — API call verification is done in the route handler
    return true;
  },

  parseFailedPayment(rawBody: string): NormalizedFailedPayment | null {
    // rawBody here is the Mollie payment object fetched from the API,
    // not the raw webhook POST. The route handler fetches and passes it.
    let payment: Record<string, unknown>;
    try {
      payment = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      return null;
    }

    if (payment.status !== "failed") return null;

    const details = payment.details as Record<string, unknown> | undefined;
    const amount = payment.amount as { value: string; currency: string } | undefined;
    const amountCents = Math.round(parseFloat(amount?.value ?? "0") * 100);

    return {
      processorPaymentId: payment.id as string,
      processorCustomerId: (payment.customerId as string | null) ?? "",
      processorInvoiceId: (payment.subscriptionId as string | null) ?? null,
      amount: amountCents,
      currency: (amount?.currency ?? "eur").toLowerCase(),
      failureCode: normalizeMollieCode(
        (payment.failureReason as string | null) ?? "unknown_reason",
      ),
      failureMessage: (payment.failureMessage as string | null) ?? null,
      customerEmail: (details?.consumerAccount as string | null) ?? null,
      customerName: (details?.consumerName as string | null) ?? null,
      lastFour: (details?.cardNumber as string | null)?.slice(-4) ?? null,
      description: (payment.description as string | null) ?? null,
    } as NormalizedFailedPayment;
  },

  parseRecoveredPayment(rawBody: string): NormalizedRecoveredPayment | null {
    let payment: Record<string, unknown>;
    try {
      payment = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      return null;
    }

    if (payment.status !== "paid") return null;

    return {
      processorPaymentId: payment.id as string,
      processorInvoiceId: (payment.subscriptionId as string | null) ?? null,
    };
  },
};
```

- [ ] **Step 3: Create Mollie webhook route**

```typescript
// apps/web/src/routes/api/mollie/webhook.ts
// NOTE: Webhook URL format per Mollie connection must include a userId token
// so we can resolve which Dunlo user the payment belongs to.
// Route: /api/mollie/webhook/:userId
import { createFileRoute } from "@tanstack/react-router";
import { and, eq } from "drizzle-orm";
import { db } from "@dunlo-v2/db";
import { processorConnection } from "@dunlo-v2/db/schema/domain";
import { decrypt } from "@dunlo-v2/db/encrypt";
import { mollieAdapter } from "@/lib/processors/mollie-adapter";
import { handleFailedPayment, handleRecoveredPayment } from "@/lib/processors/webhook-core";
import { sendAlertNotification } from "@/lib/notifications";

export const Route = createFileRoute("/api/mollie/webhook/$userId")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const { userId } = params;
        const formData = await request.formData();
        const paymentId = formData.get("id") as string | null;

        if (!paymentId) {
          return new Response("Missing id", { status: 400 });
        }

        const [connection] = await db
          .select()
          .from(processorConnection)
          .where(
            and(
              eq(processorConnection.userId, userId),
              eq(processorConnection.processor, "mollie"),
              eq(processorConnection.isActive, true),
            ),
          )
          .limit(1);

        if (!connection) {
          return new Response("Unknown user", { status: 400 });
        }

        const apiKey = decrypt(connection.apiKey);

        // Fetch payment from Mollie API to get full details + status
        const mollieResponse = await fetch(
          `https://api.mollie.com/v2/payments/${paymentId}`,
          { headers: { Authorization: `Bearer ${apiKey}` } },
        );

        if (!mollieResponse.ok) {
          return new Response("Failed to fetch payment", { status: 500 });
        }

        const paymentJson = await mollieResponse.text();

        const failed = mollieAdapter.parseFailedPayment(paymentJson);
        if (failed?.customerEmail) {
          const result = await handleFailedPayment("mollie", failed, {
            userId: connection.userId,
            escalationThreshold: null,
          });
          if (result) {
            sendAlertNotification({
              userId: connection.userId,
              eventType: result.wasEscalated ? "escalation" : "failure",
              customerName: result.customerName,
              customerEmail: result.customerEmail,
              amount: result.amount,
              currency: result.currency,
            }).catch(console.error);
          }
          return new Response("OK", { status: 200 });
        }

        const recovered = mollieAdapter.parseRecoveredPayment(paymentJson);
        if (recovered) {
          const result = await handleRecoveredPayment(
            "mollie",
            recovered,
            connection.userId,
          );
          if (result) {
            sendAlertNotification({
              userId: connection.userId,
              eventType: "recovery",
              customerName: result.customerName,
              customerEmail: result.customerEmail,
              amount: result.amount,
              currency: result.currency,
            }).catch(console.error);
          }
        }

        return new Response("OK", { status: 200 });
      },
    },
  },
});
```

> **Important:** When a Mollie user connects, the webhook URL to register in Mollie's dashboard must be `https://dunlo.io/api/mollie/webhook/{userId}`.

- [ ] **Step 4: Create Mollie connect / disconnect (same pattern as Paddle)**

```typescript
// apps/web/src/routes/api/mollie/connect.ts
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { db } from "@dunlo-v2/db";
import { processorConnection } from "@dunlo-v2/db/schema/domain";
import { encrypt } from "@dunlo-v2/db/encrypt";
import { authMiddleware } from "@/middleware/auth";
import { z } from "zod";

export const connectMollie = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((raw: unknown) =>
    z.object({ apiKey: z.string().min(1) }).parse(raw)
  )
  .handler(async ({ context, data }) => {
    if (!context.session) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    await db
      .insert(processorConnection)
      .values({
        userId,
        processor: "mollie",
        apiKey: encrypt(data.apiKey),
        isActive: true,
      })
      .onConflictDoUpdate({
        target: [processorConnection.userId, processorConnection.processor],
        set: { apiKey: encrypt(data.apiKey), isActive: true, updatedAt: new Date() },
      });

    return { webhookUrl: `https://dunlo.io/api/mollie/webhook/${userId}` };
  });

export const Route = createFileRoute("/api/mollie/connect")({});
```

```typescript
// apps/web/src/routes/api/mollie/disconnect.ts
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { db } from "@dunlo-v2/db";
import { processorConnection } from "@dunlo-v2/db/schema/domain";
import { authMiddleware } from "@/middleware/auth";

export const disconnectMollie = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (!context.session) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    await db
      .update(processorConnection)
      .set({ isActive: false })
      .where(and(eq(processorConnection.userId, userId), eq(processorConnection.processor, "mollie")));

    return { ok: true };
  });

export const Route = createFileRoute("/api/mollie/disconnect")({});
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/processors/mollie-adapter.ts apps/web/src/routes/api/mollie/
git commit -m "feat: add Mollie payment processor adapter and webhook route"
```

---

## Task 9: Mangopay Adapter

**Files:**
- Create: `apps/web/src/lib/processors/mangopay-adapter.ts`
- Create: `apps/web/src/routes/api/mangopay/webhook.ts`
- Create: `apps/web/src/routes/api/mangopay/connect.ts`
- Create: `apps/web/src/routes/api/mangopay/disconnect.ts`

### How Mangopay webhooks work

Mangopay sends a GET request (not POST) to the webhook URL with query parameters:
- `EventType=PAYIN_NORMAL_FAILED`
- `RessourceId=<payment_id>`
- `Date=<unix_timestamp>`

There is no HMAC signature. You verify by fetching the payment from Mangopay's API. The `ResultCode` (6-digit string) is the failure code.

Failure event: `EventType=PAYIN_NORMAL_FAILED`
Success event: `EventType=PAYIN_NORMAL_SUCCEEDED`

- [ ] **Step 1: Create mangopay-adapter.ts**

```typescript
// apps/web/src/lib/processors/mangopay-adapter.ts
import type { ProcessorAdapter, NormalizedFailedPayment, NormalizedRecoveredPayment } from "./types";
import { normalizeMangopayCode } from "./normalize";

type MangopayPayIn = {
  Id: string;
  AuthorId: string;
  DebitedFunds: { Amount: number; Currency: string };
  ResultCode: string;
  ResultMessage: string;
  Status: "SUCCEEDED" | "FAILED" | "CREATED";
  PaymentType: string;
  ExecutionDetails?: {
    CardId?: string;
  };
};

export const mangopayAdapter: ProcessorAdapter = {
  name: "mangopay",

  verifySignature(_rawBody: string, _headers: Headers, _secret: string): boolean {
    // Mangopay does not sign webhooks — verification is API-call based (done in route handler)
    return true;
  },

  parseFailedPayment(rawBody: string): NormalizedFailedPayment | null {
    // rawBody = Mangopay PayIn object fetched from the API
    let payin: MangopayPayIn;
    try {
      payin = JSON.parse(rawBody) as MangopayPayIn;
    } catch {
      return null;
    }

    if (payin.Status !== "FAILED") return null;

    return {
      processorPaymentId: payin.Id,
      processorCustomerId: payin.AuthorId,
      processorInvoiceId: null,
      amount: payin.DebitedFunds.Amount,
      currency: payin.DebitedFunds.Currency.toLowerCase(),
      failureCode: normalizeMangopayCode(payin.ResultCode),
      failureMessage: payin.ResultMessage ?? null,
      customerEmail: null, // Mangopay doesn't expose email on PayIn — must be fetched from User object
      customerName: null,
      lastFour: null,
      description: null,
    } as NormalizedFailedPayment;
  },

  parseRecoveredPayment(rawBody: string): NormalizedRecoveredPayment | null {
    let payin: MangopayPayIn;
    try {
      payin = JSON.parse(rawBody) as MangopayPayIn;
    } catch {
      return null;
    }

    if (payin.Status !== "SUCCEEDED") return null;

    return {
      processorPaymentId: payin.Id,
      processorInvoiceId: null,
    };
  },
};
```

- [ ] **Step 2: Create Mangopay webhook route**

```typescript
// apps/web/src/routes/api/mangopay/webhook.ts
// Mangopay sends GET requests to webhook URLs.
// Route: /api/mangopay/webhook/:userId
import { createFileRoute } from "@tanstack/react-router";
import { and, eq } from "drizzle-orm";
import { db } from "@dunlo-v2/db";
import { processorConnection } from "@dunlo-v2/db/schema/domain";
import { decrypt } from "@dunlo-v2/db/encrypt";
import { mangopayAdapter } from "@/lib/processors/mangopay-adapter";
import { handleFailedPayment, handleRecoveredPayment } from "@/lib/processors/webhook-core";
import { sendAlertNotification } from "@/lib/notifications";

const MANGOPAY_BASE = "https://api.mangopay.com/v2.01";

export const Route = createFileRoute("/api/mangopay/webhook/$userId")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { userId } = params;
        const url = new URL(request.url);
        const eventType = url.searchParams.get("EventType");
        const resourceId = url.searchParams.get("RessourceId");

        if (!resourceId) return new Response("OK", { status: 200 });

        const isFailed = eventType === "PAYIN_NORMAL_FAILED";
        const isSucceeded = eventType === "PAYIN_NORMAL_SUCCEEDED";
        if (!isFailed && !isSucceeded) return new Response("OK", { status: 200 });

        const [connection] = await db
          .select()
          .from(processorConnection)
          .where(
            and(
              eq(processorConnection.userId, userId),
              eq(processorConnection.processor, "mangopay"),
              eq(processorConnection.isActive, true),
            ),
          )
          .limit(1);

        if (!connection) return new Response("OK", { status: 200 });

        const clientId = connection.merchantId;
        const apiKey = decrypt(connection.apiKey);
        const credentials = Buffer.from(`${clientId}:${apiKey}`).toString("base64");

        // Fetch PayIn from Mangopay API
        const mgResponse = await fetch(
          `${MANGOPAY_BASE}/${clientId}/payins/${resourceId}`,
          { headers: { Authorization: `Basic ${credentials}` } },
        );

        if (!mgResponse.ok) return new Response("OK", { status: 200 });

        const payinJson = await mgResponse.text();

        // For failures, we also need to fetch the user email from /users/:AuthorId
        let finalJson = payinJson;
        if (isFailed) {
          const payin = JSON.parse(payinJson) as { AuthorId: string };
          const userResponse = await fetch(
            `${MANGOPAY_BASE}/${clientId}/users/${payin.AuthorId}`,
            { headers: { Authorization: `Basic ${credentials}` } },
          );
          if (userResponse.ok) {
            const mgUser = await userResponse.json() as { Email?: string; FirstName?: string; LastName?: string };
            const enriched = Object.assign(JSON.parse(payinJson) as object, {
              _customerEmail: mgUser.Email ?? null,
              _customerName:
                mgUser.FirstName && mgUser.LastName
                  ? `${mgUser.FirstName} ${mgUser.LastName}`
                  : null,
            });
            finalJson = JSON.stringify(enriched);
          }
        }

        if (isFailed) {
          const failed = mangopayAdapter.parseFailedPayment(finalJson);
          // Inject email from enriched fields
          const enriched = JSON.parse(finalJson) as { _customerEmail?: string; _customerName?: string };
          if (failed) {
            failed.customerEmail = enriched._customerEmail ?? null;
            failed.customerName = enriched._customerName ?? null;
          }

          if (failed?.customerEmail) {
            const result = await handleFailedPayment("mangopay", failed, {
              userId: connection.userId,
              escalationThreshold: null,
            });
            if (result) {
              sendAlertNotification({
                userId: connection.userId,
                eventType: result.wasEscalated ? "escalation" : "failure",
                customerName: result.customerName,
                customerEmail: result.customerEmail,
                amount: result.amount,
                currency: result.currency,
              }).catch(console.error);
            }
          }
        } else {
          const recovered = mangopayAdapter.parseRecoveredPayment(finalJson);
          if (recovered) {
            const result = await handleRecoveredPayment(
              "mangopay",
              recovered,
              connection.userId,
            );
            if (result) {
              sendAlertNotification({
                userId: connection.userId,
                eventType: "recovery",
                customerName: result.customerName,
                customerEmail: result.customerEmail,
                amount: result.amount,
                currency: result.currency,
              }).catch(console.error);
            }
          }
        }

        return new Response("OK", { status: 200 });
      },
    },
  },
});
```

- [ ] **Step 3: Create Mangopay connect / disconnect**

```typescript
// apps/web/src/routes/api/mangopay/connect.ts
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { db } from "@dunlo-v2/db";
import { processorConnection } from "@dunlo-v2/db/schema/domain";
import { encrypt } from "@dunlo-v2/db/encrypt";
import { authMiddleware } from "@/middleware/auth";
import { z } from "zod";

export const connectMangopay = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((raw: unknown) =>
    z.object({
      clientId: z.string().min(1),  // Mangopay Client ID
      apiKey: z.string().min(1),    // Mangopay API Key
    }).parse(raw)
  )
  .handler(async ({ context, data }) => {
    if (!context.session) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    await db
      .insert(processorConnection)
      .values({
        userId,
        processor: "mangopay",
        merchantId: data.clientId,
        apiKey: encrypt(data.apiKey),
        isActive: true,
      })
      .onConflictDoUpdate({
        target: [processorConnection.userId, processorConnection.processor],
        set: {
          merchantId: data.clientId,
          apiKey: encrypt(data.apiKey),
          isActive: true,
          updatedAt: new Date(),
        },
      });

    return {
      webhookUrl: `https://dunlo.io/api/mangopay/webhook/${userId}`,
      events: ["PAYIN_NORMAL_FAILED", "PAYIN_NORMAL_SUCCEEDED"],
    };
  });

export const Route = createFileRoute("/api/mangopay/connect")({});
```

```typescript
// apps/web/src/routes/api/mangopay/disconnect.ts
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { db } from "@dunlo-v2/db";
import { processorConnection } from "@dunlo-v2/db/schema/domain";
import { authMiddleware } from "@/middleware/auth";

export const disconnectMangopay = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (!context.session) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    await db
      .update(processorConnection)
      .set({ isActive: false })
      .where(and(eq(processorConnection.userId, userId), eq(processorConnection.processor, "mangopay")));

    return { ok: true };
  });

export const Route = createFileRoute("/api/mangopay/disconnect")({});
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/lib/processors/mangopay-adapter.ts apps/web/src/routes/api/mangopay/
git commit -m "feat: add Mangopay payment processor adapter and webhook route"
```

---

## Task 10: Settings UI — Multi-Processor Connect Section

**Files:**
- Modify: `apps/web/src/routes/_dashboard/settings.tsx`

The settings page currently has a Stripe connect section. Add a "Payment Processors" section that shows each processor's connection status and a connect form.

- [ ] **Step 1: Add a server function to list active processor connections**

Add to `apps/web/src/functions/payments.ts` (or a new `src/functions/processors.ts`):

```typescript
export const getProcessorConnections = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (!context.session) throw redirect({ to: "/login" });
    const userId = context.session.user.id;

    const rows = await db
      .select({
        processor: processorConnection.processor,
        isActive: processorConnection.isActive,
        createdAt: processorConnection.createdAt,
      })
      .from(processorConnection)
      .where(eq(processorConnection.userId, userId));

    return rows;
  });
```

- [ ] **Step 2: Add connection cards to the settings page**

In `apps/web/src/routes/_dashboard/settings.tsx`, add a section after the existing Stripe section:

```tsx
{/* --- Processor Connections --- */}
<section className="rounded-2xl border border-border p-6 space-y-4">
  <h2 className="text-lg font-semibold">Other Payment Processors</h2>
  <p className="text-sm text-muted-foreground">
    Connect Dunlo to additional payment processors. Each processor requires a webhook URL configured in its dashboard.
  </p>

  {/* Paddle */}
  <ProcessorCard
    name="Paddle"
    logo="/logos/paddle.svg"
    isConnected={connections.some(c => c.processor === "paddle" && c.isActive)}
    webhookUrl="https://dunlo.io/api/paddle/webhook"
    connectAction={connectPaddle}
    disconnectAction={disconnectPaddle}
    fields={[
      { key: "apiKey", label: "API Key", placeholder: "pdl_live_..." },
      { key: "webhookSecret", label: "Webhook Secret", placeholder: "From Paddle dashboard" },
    ]}
  />

  {/* Adyen */}
  <ProcessorCard
    name="Adyen"
    logo="/logos/adyen.svg"
    isConnected={connections.some(c => c.processor === "adyen" && c.isActive)}
    webhookUrl="https://dunlo.io/api/adyen/webhook"
    connectAction={connectAdyen}
    disconnectAction={disconnectAdyen}
    fields={[
      { key: "apiKey", label: "API Key" },
      { key: "hmacKey", label: "HMAC Signing Key", placeholder: "hex string from Adyen dashboard" },
      { key: "merchantId", label: "Merchant Account Name" },
    ]}
  />

  {/* Mollie */}
  <ProcessorCard
    name="Mollie"
    logo="/logos/mollie.svg"
    isConnected={connections.some(c => c.processor === "mollie" && c.isActive)}
    connectAction={connectMollie}
    disconnectAction={disconnectMollie}
    fields={[
      { key: "apiKey", label: "API Key", placeholder: "live_..." },
    ]}
    webhookInstructions="After connecting, copy the webhook URL and add it to each payment/subscription in Mollie."
  />

  {/* Mangopay */}
  <ProcessorCard
    name="Mangopay"
    logo="/logos/mangopay.svg"
    isConnected={connections.some(c => c.processor === "mangopay" && c.isActive)}
    connectAction={connectMangopay}
    disconnectAction={disconnectMangopay}
    fields={[
      { key: "clientId", label: "Client ID" },
      { key: "apiKey", label: "API Key" },
    ]}
    webhookInstructions="Register PAYIN_NORMAL_FAILED and PAYIN_NORMAL_SUCCEEDED events in your Mangopay dashboard."
  />
</section>
```

> The `ProcessorCard` component is a new shared UI component to create. It takes a connect form definition, calls the appropriate server function, and shows the webhook URL once connected.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/routes/_dashboard/settings.tsx
git commit -m "feat: add multi-processor connection section to settings page"
```

---

## Task 11: Update `humanizeFailureCode` for New Normalized Codes

**Files:**
- Modify: `apps/web/src/lib/template.ts`

The `humanizeFailureCode` function currently maps Stripe codes to human-readable strings. It needs entries for the 15 normalized codes.

- [ ] **Step 1: Update the mapping in template.ts**

Find `humanizeFailureCode` in `apps/web/src/lib/template.ts` and ensure all 15 normalized codes are covered:

```typescript
export function humanizeFailureCode(code: string): string {
  const map: Record<string, string> = {
    insufficient_funds: "Insufficient Funds",
    card_declined: "Card Declined",
    expired_card: "Expired Card",
    authentication_required: "Authentication Required",
    authentication_failed: "Authentication Failed",
    fraudulent: "Fraud Detected",
    lost_card: "Lost Card",
    stolen_card: "Stolen Card",
    processing_error: "Processing Error",
    card_blocked: "Card Blocked",
    do_not_honor: "Do Not Honor",
    issuer_unavailable: "Bank Unavailable",
    velocity_exceeded: "Velocity Limit Exceeded",
    not_permitted: "Not Permitted",
    token_revoked: "Subscription Revoked",
  };
  return map[code] ?? code;
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/lib/template.ts
git commit -m "feat: extend humanizeFailureCode for all normalized processor codes"
```

---

## Self-Review Checklist

### Spec coverage

| Requirement | Covered by |
|---|---|
| Processor interface/types | Task 1 |
| Stripe mapping | Task 2 (normalize) + Task 5 |
| Paddle mapping | Task 2 (normalize) + Task 6 |
| Adyen mapping | Task 2 (normalize) + Task 7 |
| Mollie mapping | Task 2 (normalize) + Task 8 |
| Mangopay mapping | Task 2 (normalize) + Task 9 |
| DB schema generalization | Task 3 |
| Processor-agnostic webhook core | Task 4 |
| Stripe adapter refactor | Task 5 |
| Paddle webhook + connect | Task 6 |
| Adyen webhook + connect | Task 7 |
| Mollie webhook + connect | Task 8 |
| Mangopay webhook + connect | Task 9 |
| Settings UI | Task 10 |
| humanizeFailureCode update | Task 11 |

### Special processor notes for implementors

| Processor | Auth | Signature | Response format | Email in webhook? |
|---|---|---|---|---|
| **Stripe** | OAuth (existing) | `stripe-signature` header HMAC | JSON — respond `{received: true}` | Yes |
| **Paddle** | API key | `Paddle-Signature` header HMAC | JSON — respond `{received: true}` | Sometimes (billing_details) |
| **Adyen** | API key + HMAC key | HMAC field inside payload | Plain text `[accepted]` required | Usually no — use `merchantReference` |
| **Mollie** | API key | None — pull-based | Plain `200 OK` | Must fetch from API |
| **Mangopay** | Client ID + API key | None — pull-based | Plain `200 OK` — expects GET, not POST | Must fetch User from API |
