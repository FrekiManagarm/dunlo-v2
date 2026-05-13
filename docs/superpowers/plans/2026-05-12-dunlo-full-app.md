# Dunlo Full App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full business layer for Dunlo — Stripe Connect OAuth, failed-payment webhook ingestion, automated email recovery sequences (editable), real dashboard data, AI-drafted escalation emails for high-value churn, and supporting routes (onboarding, sequences, settings, payments). Authentication hardened with email verification, password reset, rate limiting, and secure sessions.

**Architecture:** Everything ships inside the existing TanStack Start monorepo. API routes (`apps/web/src/routes/api/...`) handle Stripe OAuth + webhooks. A Nitro plugin runs the email scheduler every 5 minutes against `recoveryAttempt` rows. Better Auth lives in `packages/auth` and sends platform auth emails via Resend. Per-user recovery emails use the user's own Resend API key (encrypted at rest with AES-256-GCM). AI escalation drafts use the Anthropic SDK (Claude Sonnet 4.6). No new services, no external queues.

**Constraint:** The existing visual design is LOCKED. Reuse current Tailwind tokens (`bg-dunlo`, `text-dunlo-dim`, `border-dunlo/25`, `rounded-2xl border border-gray-100 bg-white shadow-sm`, pill buttons). Never hardcode hex values. New pages mirror the dashboard/login layout style.

**Tech Stack:** TanStack Start (SSR + Nitro), TanStack Router (file-based), Better Auth 1.6.9 + `tanstackStartCookies`, Drizzle ORM + Neon PostgreSQL, Stripe SDK, Resend, Anthropic SDK (`@anthropic-ai/sdk`), Vitest, Bun 1.2.21, Turborepo.

---

## Execution Order

Tasks must be executed in numerical order — later tasks depend on earlier ones:

| # | Task | Depends on |
|---|---|---|
| 1 | Foundation (packages, env, encryption, domain schema, Vitest) | — |
| 2 | Better Auth hardening + auth UI flows (verify email, reset password) | 1 |
| 3 | Stripe Connect OAuth + Webhook ingestion | 1 |
| 4 | Email engine (template renderer, Resend wrapper, scheduler, Nitro plugin) | 1, 3 |
| 5 | Dashboard real data + `/payments` list | 1, 3 |
| 6 | Sequence editor + Settings + Stripe disconnect | 1, 3 |
| 7 | Onboarding wizard + AI escalation drafts | 1, 3, 4, 6 |

---

## Full File Map

**Modified packages:**
- `apps/web/package.json` — add `stripe`, `@anthropic-ai/sdk`, `vitest`, `marked` (or local md-to-html)
- `packages/auth/package.json` — add `resend`
- `packages/env/src/server.ts` — add `STRIPE_CLIENT_ID`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `ENCRYPTION_KEY`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `APP_URL`, `CRON_SECRET`, `SCHEDULER_INTERVAL_MINUTES`
- `packages/db/src/schema/index.ts` — export new domain schema
- `packages/auth/src/index.ts` — email verification, password reset, rate limit, session hardening
- `apps/web/src/components/sign-up-form.tsx` — "check inbox" message + `callbackURL` for onboarding
- `apps/web/src/components/sign-in-form.tsx` — "forgot password" inline view
- `apps/web/src/routes/dashboard.tsx` — real loader data
- `apps/web/vite.config.ts` — register Nitro plugin (if needed)

**New files (apps/web/src/):**
- `lib/stripe.ts` — Stripe SDK factories
- `lib/resend.ts` — User Resend client + sender
- `lib/anthropic.ts` — Anthropic SDK instance
- `lib/template.ts` + `lib/template.test.ts` — variable renderer, format helpers
- `functions/stripe.ts` — `getStripeConnection`, `seedDefaultSequences`
- `functions/payments.ts` — dashboard + payments-page data
- `functions/sequences.ts` — sequence CRUD server functions
- `functions/email-provider.ts` — Resend config CRUD + test send
- `functions/escalations.ts` — escalation CRUD + AI draft trigger
- `functions/scheduler.ts` — `processScheduledEmails()` (plain async)
- `routes/reset-password.tsx` — password reset form
- `routes/onboarding.tsx` — 3-step wizard
- `routes/payments.tsx` — full payments list with filters
- `routes/sequences.tsx` — editable sequence editor
- `routes/settings.tsx` — account / email provider / escalation tabs
- `routes/api/stripe/connect.ts` — OAuth redirect
- `routes/api/stripe/callback.ts` — OAuth return + seed
- `routes/api/stripe/webhook.ts` — Stripe Connect events
- `routes/api/stripe/disconnect.ts` — Remove connection
- `routes/api/cron/process-emails.ts` — Manual scheduler trigger
- `server/plugins/email-scheduler.ts` — Nitro `setInterval` plugin

**New files (packages/):**
- `packages/db/src/encrypt.ts` + `packages/db/src/encrypt.test.ts` — AES-256-GCM
- `packages/db/src/schema/domain.ts` — 7 new tables
- `packages/auth/src/email.ts` — Platform Resend sender + auth email templates

---
## Task 1: Foundation — packages, env, encryption, domain schema

**Goal:** Lay the groundwork for the recovery engine. Add SDK dependencies, validate every new env var, ship a tested AES-256-GCM utility, and create the seven domain tables with enums + relations.

**Files:**
- Modify: `apps/web/package.json`
- Modify: `packages/auth/package.json`
- Modify: `packages/db/package.json` (add `vitest` devDep so encrypt tests can run inside the `@dunlo-v2/db` package)
- Modify: `packages/env/src/server.ts`
- Modify: `packages/db/src/schema/index.ts`
- Create: `packages/db/vitest.config.ts`
- Create: `packages/db/src/encrypt.ts`
- Create: `packages/db/src/encrypt.test.ts`
- Create: `apps/web/vitest.config.ts`
- Create: `packages/db/src/schema/domain.ts`

---

- [x] **Step 1: Add Stripe, Anthropic SDK, and Vitest dev tooling to `apps/web/package.json`**

Replace the existing `apps/web/package.json` so that it contains:

```json
{
  "name": "web",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "vite build",
    "serve": "vite preview",
    "dev": "vite dev",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.37.0",
    "@dunlo-v2/auth": "workspace:*",
    "@dunlo-v2/db": "workspace:*",
    "@dunlo-v2/env": "workspace:*",
    "@dunlo-v2/ui": "workspace:*",
    "@tailwindcss/vite": "^4.2.2",
    "@tanstack/react-form": "^1.28.0",
    "@tanstack/react-query": "^5.99.0",
    "@tanstack/react-query-devtools": "^5.100.10",
    "@tanstack/react-router": "^1.168.22",
    "@tanstack/react-start": "^1.167.41",
    "better-auth": "catalog:",
    "dotenv": "catalog:",
    "evlog": "^2.14.1",
    "framer-motion": "^12.38.0",
    "lucide-react": "^1.8.0",
    "nitro": "^3.0.260429-beta",
    "react": "^19.2.5",
    "react-dom": "^19.2.5",
    "resend": "^6.12.3",
    "sonner": "^2.0.7",
    "stripe": "^17.5.0",
    "tailwindcss": "^4.2.2",
    "three": "^0.184.0",
    "zod": "catalog:",
    "zustand": "^5.0.13"
  },
  "devDependencies": {
    "@dunlo-v2/config": "workspace:*",
    "@resvg/resvg-js": "^2.6.2",
    "@tanstack/react-router-devtools": "^1.166.13",
    "@testing-library/dom": "^10.4.1",
    "@testing-library/react": "^16.3.2",
    "@types/react": "^19.2.14",
    "@types/react-dom": "catalog:",
    "@types/three": "^0.184.1",
    "@vitejs/plugin-react": "^6.0.1",
    "jsdom": "^29.0.2",
    "typescript": "catalog:",
    "vite": "^8.0.8",
    "vitest": "^2.1.9",
    "web-vitals": "^5.2.0"
  }
}
```

Notes:
- `@dunlo-v2/db` added under `dependencies` because `apps/web` will need direct access to the encrypt utility and domain schema in later tasks.
- `stripe` and `@anthropic-ai/sdk` are runtime deps (used by server routes).
- `vitest` is a devDep, paired with a `test` script that runs once and exits.

---

- [x] **Step 2: Add Resend to `packages/auth/package.json`**

Replace `packages/auth/package.json` with:

```json
{
  "name": "@dunlo-v2/auth",
  "type": "module",
  "exports": {
    ".": {
      "default": "./src/index.ts"
    },
    "./*": {
      "default": "./src/*.ts"
    }
  },
  "scripts": {},
  "dependencies": {
    "@dunlo-v2/db": "workspace:*",
    "@dunlo-v2/env": "workspace:*",
    "better-auth": "catalog:",
    "dotenv": "catalog:",
    "resend": "^6.12.3",
    "zod": "catalog:"
  },
  "devDependencies": {
    "@dunlo-v2/config": "workspace:*",
    "typescript": "catalog:"
  }
}
```

This lets the auth package send verification + password-reset emails via the platform Resend key.

---

- [x] **Step 3: Add Vitest to `packages/db/package.json` and wire a test script**

Replace `packages/db/package.json` with:

```json
{
  "name": "@dunlo-v2/db",
  "type": "module",
  "exports": {
    ".": {
      "default": "./src/index.ts"
    },
    "./*": {
      "default": "./src/*.ts"
    }
  },
  "scripts": {
    "db:push": "drizzle-kit push",
    "db:generate": "drizzle-kit generate",
    "db:studio": "drizzle-kit studio",
    "db:migrate": "drizzle-kit migrate",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@dunlo-v2/env": "workspace:*",
    "@neondatabase/serverless": "^1.0.2",
    "dotenv": "catalog:",
    "drizzle-orm": "^0.45.1",
    "zod": "catalog:"
  },
  "devDependencies": {
    "@dunlo-v2/config": "workspace:*",
    "drizzle-kit": "^0.31.8",
    "typescript": "catalog:",
    "vitest": "^2.1.9"
  }
}
```

---

- [x] **Step 4: Run `bun install` to fetch new dependencies**

From the repo root:

```bash
bun install
```

Expect: lockfile updates, no errors, new packages present in `node_modules`.

---

- [x] **Step 5: Extend `packages/env/src/server.ts` to validate the new env vars**

Replace the file with:

```ts
import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    CORS_ORIGIN: z.url(),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

    STRIPE_CLIENT_ID: z.string().min(1),
    STRIPE_SECRET_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),

    ENCRYPTION_KEY: z
      .string()
      .regex(/^[0-9a-fA-F]{64}$/, "ENCRYPTION_KEY must be a 64-char hex string (32 bytes)"),

    ANTHROPIC_API_KEY: z.string().min(1),
    RESEND_API_KEY: z.string().min(1),

    APP_URL: z.url(),

    SCHEDULER_INTERVAL_MINUTES: z.coerce.number().int().positive().default(5),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
```

Then add the new values to the root `.env` (do not commit `.env` itself — `.gitignore` already covers it). Locally run:

```bash
openssl rand -hex 32
```

and paste the result into `ENCRYPTION_KEY=...` in `.env`. Set placeholder values for the Stripe / Anthropic / Resend keys for now — they will be filled in later tasks.

`.env` (local only, not committed):

```env
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development

STRIPE_CLIENT_ID=ca_test_placeholder
STRIPE_SECRET_KEY=sk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_test_placeholder
ENCRYPTION_KEY=<paste 64-hex>
ANTHROPIC_API_KEY=sk-ant-placeholder
RESEND_API_KEY=re_placeholder
APP_URL=http://localhost:3000
SCHEDULER_INTERVAL_MINUTES=5
```

---

- [x] **Step 6: Create `apps/web/vitest.config.ts`**

Create the file with:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    globals: false,
  },
});
```

(The app rarely has unit tests today; this config exists so `bun --filter web test` does not error when invoked in CI.)

---

- [x] **Step 7: Create `packages/db/vitest.config.ts`**

This is where the encryption tests actually live. Create:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    globals: false,
  },
});
```

---

- [x] **Step 8: Create the failing test file `packages/db/src/encrypt.test.ts` (TDD — RED)**

Create the file with:

```ts
import { describe, expect, it, beforeAll } from "vitest";
import { randomBytes } from "node:crypto";

beforeAll(() => {
  if (!process.env.ENCRYPTION_KEY) {
    process.env.ENCRYPTION_KEY = randomBytes(32).toString("hex");
  }
  if (!process.env.DATABASE_URL) process.env.DATABASE_URL = "postgres://test";
  if (!process.env.BETTER_AUTH_SECRET)
    process.env.BETTER_AUTH_SECRET = "x".repeat(32);
  if (!process.env.BETTER_AUTH_URL)
    process.env.BETTER_AUTH_URL = "http://localhost:3000";
  if (!process.env.CORS_ORIGIN) process.env.CORS_ORIGIN = "http://localhost:3000";
  if (!process.env.STRIPE_CLIENT_ID) process.env.STRIPE_CLIENT_ID = "ca_test";
  if (!process.env.STRIPE_SECRET_KEY) process.env.STRIPE_SECRET_KEY = "sk_test";
  if (!process.env.STRIPE_WEBHOOK_SECRET)
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  if (!process.env.ANTHROPIC_API_KEY)
    process.env.ANTHROPIC_API_KEY = "sk-ant-test";
  if (!process.env.RESEND_API_KEY) process.env.RESEND_API_KEY = "re_test";
  if (!process.env.APP_URL) process.env.APP_URL = "http://localhost:3000";
});

describe("encrypt / decrypt (AES-256-GCM)", () => {
  it("roundtrips a UTF-8 string", async () => {
    const { encrypt, decrypt } = await import("./encrypt");
    const plaintext = "sk_live_abc123-with-unicode-é-ñ";
    const ciphertext = encrypt(plaintext);
    expect(ciphertext).not.toBe(plaintext);
    expect(decrypt(ciphertext)).toBe(plaintext);
  });

  it("produces a 3-part colon-separated base64 payload", async () => {
    const { encrypt } = await import("./encrypt");
    const ciphertext = encrypt("hello");
    const parts = ciphertext.split(":");
    expect(parts).toHaveLength(3);
    for (const part of parts) {
      expect(part.length).toBeGreaterThan(0);
      expect(() => Buffer.from(part, "base64")).not.toThrow();
    }
  });

  it("produces a different ciphertext on each call (random IV)", async () => {
    const { encrypt } = await import("./encrypt");
    const a = encrypt("same-input");
    const b = encrypt("same-input");
    expect(a).not.toBe(b);
  });

  it("throws when the auth tag is tampered with", async () => {
    const { encrypt, decrypt } = await import("./encrypt");
    const ciphertext = encrypt("super-secret");
    const [iv, , data] = ciphertext.split(":");
    const fakeTag = Buffer.alloc(16, 0).toString("base64");
    const tampered = [iv, fakeTag, data].join(":");
    expect(() => decrypt(tampered)).toThrow();
  });

  it("throws when the ciphertext body is tampered with", async () => {
    const { encrypt, decrypt } = await import("./encrypt");
    const ciphertext = encrypt("super-secret");
    const [iv, tag, data] = ciphertext.split(":");
    const flipped = Buffer.from(data, "base64");
    flipped[0] = flipped[0] ^ 0xff;
    const tampered = [iv, tag, flipped.toString("base64")].join(":");
    expect(() => decrypt(tampered)).toThrow();
  });

  it("throws on a malformed payload", async () => {
    const { decrypt } = await import("./encrypt");
    expect(() => decrypt("not-a-valid-ciphertext")).toThrow();
  });
});
```

Run the tests, expect FAIL (file does not exist yet):

```bash
bun --filter @dunlo-v2/db test
```

Expected output: `Cannot find module './encrypt'` or equivalent.

---

- [x] **Step 9: Implement `packages/db/src/encrypt.ts` (TDD — GREEN)**

Create the file with:

```ts
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  type CipherGCM,
  type DecipherGCM,
} from "node:crypto";
import { env } from "@dunlo-v2/env/server";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getKey(): Buffer {
  const key = Buffer.from(env.ENCRYPTION_KEY, "hex");
  if (key.length !== 32) {
    throw new Error(
      `ENCRYPTION_KEY must decode to 32 bytes (got ${key.length})`,
    );
  }
  return key;
}

export function encrypt(plaintext: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv) as CipherGCM;
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
}

export function decrypt(ciphertext: string): string {
  const parts = ciphertext.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid ciphertext format");
  }
  const [ivB64, tagB64, dataB64] = parts;
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(tagB64, "base64");
  const data = Buffer.from(dataB64, "base64");

  if (iv.length !== IV_LENGTH) throw new Error("Invalid IV length");
  if (authTag.length !== AUTH_TAG_LENGTH)
    throw new Error("Invalid auth tag length");

  const decipher = createDecipheriv(ALGORITHM, getKey(), iv) as DecipherGCM;
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString("utf8");
}
```

Run tests, expect PASS:

```bash
bun --filter @dunlo-v2/db test
```

Expected output: all 6 tests pass.

---

- [x] **Step 10: Create `packages/db/src/schema/domain.ts` with all 7 tables + enums + relations**

Create the file with:

```ts
import { relations } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const failedPaymentStatus = pgEnum("failed_payment_status", [
  "in_recovery",
  "recovered",
  "escalated",
  "failed",
  "dismissed",
]);

export const recoveryAttemptStatus = pgEnum("recovery_attempt_status", [
  "scheduled",
  "sent",
  "failed",
]);

export const escalationStatus = pgEnum("escalation_status", [
  "pending",
  "sent",
  "dismissed",
]);

export const stripeConnection = pgTable(
  "stripe_connection",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    stripeAccountId: text("stripe_account_id").notNull().unique(),
    accessToken: text("access_token").notNull(),
    publishableKey: text("publishable_key"),
    webhookEndpointId: text("webhook_endpoint_id"),
    webhookSecret: text("webhook_secret").notNull(),
    scope: text("scope").default("read_write").notNull(),
    escalationThreshold: integer("escalation_threshold").default(50000),
    escalationCurrency: text("escalation_currency").default("eur").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("stripe_connection_user_id_idx").on(table.userId),
    index("stripe_connection_stripe_account_id_idx").on(table.stripeAccountId),
  ],
);

export const emailProvider = pgTable(
  "email_provider",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    provider: text("provider").default("resend").notNull(),
    apiKey: text("api_key").notNull(),
    fromEmail: text("from_email").notNull(),
    fromName: text("from_name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("email_provider_user_id_idx").on(table.userId)],
);

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

export const recoverySequence = pgTable(
  "recovery_sequence",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    failureCode: text("failure_code").notNull(),
    name: text("name").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("recovery_sequence_user_failure_unique").on(
      table.userId,
      table.failureCode,
    ),
    index("recovery_sequence_user_id_idx").on(table.userId),
  ],
);

export const sequenceStep = pgTable(
  "sequence_step",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    sequenceId: text("sequence_id")
      .notNull()
      .references(() => recoverySequence.id, { onDelete: "cascade" }),
    stepNumber: integer("step_number").notNull(),
    delayHours: integer("delay_hours").default(0).notNull(),
    subject: text("subject").notNull(),
    body: text("body").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("sequence_step_sequence_id_idx").on(table.sequenceId),
    uniqueIndex("sequence_step_sequence_step_unique").on(
      table.sequenceId,
      table.stepNumber,
    ),
  ],
);

export const recoveryAttempt = pgTable(
  "recovery_attempt",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    failedPaymentId: text("failed_payment_id")
      .notNull()
      .references(() => failedPayment.id, { onDelete: "cascade" }),
    sequenceStepId: text("sequence_step_id")
      .notNull()
      .references(() => sequenceStep.id),
    status: recoveryAttemptStatus("status").default("scheduled").notNull(),
    scheduledAt: timestamp("scheduled_at").notNull(),
    sentAt: timestamp("sent_at"),
    resendEmailId: text("resend_email_id"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("recovery_attempt_status_scheduled_at_idx").on(
      table.status,
      table.scheduledAt,
    ),
    index("recovery_attempt_failed_payment_id_idx").on(table.failedPaymentId),
  ],
);

export const escalation = pgTable(
  "escalation",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    failedPaymentId: text("failed_payment_id")
      .notNull()
      .unique()
      .references(() => failedPayment.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    draftSubject: text("draft_subject"),
    draftBody: text("draft_body"),
    status: escalationStatus("status").default("pending").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("escalation_user_id_idx").on(table.userId)],
);

// ---------- Relations ----------

export const stripeConnectionRelations = relations(
  stripeConnection,
  ({ one }) => ({
    user: one(user, {
      fields: [stripeConnection.userId],
      references: [user.id],
    }),
  }),
);

export const emailProviderRelations = relations(emailProvider, ({ one }) => ({
  user: one(user, {
    fields: [emailProvider.userId],
    references: [user.id],
  }),
}));

export const failedPaymentRelations = relations(
  failedPayment,
  ({ one, many }) => ({
    user: one(user, {
      fields: [failedPayment.userId],
      references: [user.id],
    }),
    attempts: many(recoveryAttempt),
    escalation: one(escalation, {
      fields: [failedPayment.id],
      references: [escalation.failedPaymentId],
    }),
  }),
);

export const recoverySequenceRelations = relations(
  recoverySequence,
  ({ one, many }) => ({
    user: one(user, {
      fields: [recoverySequence.userId],
      references: [user.id],
    }),
    steps: many(sequenceStep),
  }),
);

export const sequenceStepRelations = relations(
  sequenceStep,
  ({ one, many }) => ({
    sequence: one(recoverySequence, {
      fields: [sequenceStep.sequenceId],
      references: [recoverySequence.id],
    }),
    attempts: many(recoveryAttempt),
  }),
);

export const recoveryAttemptRelations = relations(
  recoveryAttempt,
  ({ one }) => ({
    failedPayment: one(failedPayment, {
      fields: [recoveryAttempt.failedPaymentId],
      references: [failedPayment.id],
    }),
    step: one(sequenceStep, {
      fields: [recoveryAttempt.sequenceStepId],
      references: [sequenceStep.id],
    }),
  }),
);

export const escalationRelations = relations(escalation, ({ one }) => ({
  failedPayment: one(failedPayment, {
    fields: [escalation.failedPaymentId],
    references: [failedPayment.id],
  }),
  user: one(user, {
    fields: [escalation.userId],
    references: [user.id],
  }),
}));
```

---

- [x] **Step 11: Update `packages/db/src/schema/index.ts` to export the domain schema**

Replace the file with:

```ts
export * from "./auth";
export * from "./domain";
```

(The previous `export {};` placeholder is removed — it is only needed when a file has no exports.)

---

- [x] **Step 12: Type-check the workspace**

From the repo root:

```bash
bun run check-types
```

Expect: clean type-check across `@dunlo-v2/db`, `@dunlo-v2/env`, `@dunlo-v2/auth`, and `web`. If `crypto.randomUUID()` complains about missing types, ensure `"lib": ["ESNext"]` or `@types/node` is present (it already is via the workspace).

---

- [ ] **Step 13: Push the new schema to Neon**

From the repo root:

```bash
bun run db:push
```

Expect: Drizzle Kit detects three new enums (`failed_payment_status`, `recovery_attempt_status`, `escalation_status`) and seven new tables (`stripe_connection`, `email_provider`, `failed_payment`, `recovery_sequence`, `sequence_step`, `recovery_attempt`, `escalation`) with their indexes. Confirm the prompt to apply.

Spot-check in Drizzle Studio (optional):

```bash
bun run db:studio
```

---

- [x] **Step 14: Final test run — encryption tests still green after schema changes**

```bash
bun --filter @dunlo-v2/db test
```

Expect: 6/6 passing.

---

- [ ] **Step 15: Commit**

```bash
git add \
  apps/web/package.json \
  apps/web/vitest.config.ts \
  packages/auth/package.json \
  packages/db/package.json \
  packages/db/vitest.config.ts \
  packages/db/src/encrypt.ts \
  packages/db/src/encrypt.test.ts \
  packages/db/src/schema/domain.ts \
  packages/db/src/schema/index.ts \
  packages/env/src/server.ts \
  bun.lock
```

```bash
git commit -m "$(cat <<'EOF'
feat(db,env): foundation for recovery engine — encryption, env, domain schema

Adds Stripe + Anthropic SDKs, Resend in @dunlo-v2/auth, and Vitest tooling.
Validates new env vars (Stripe, Anthropic, Resend, encryption key, app URL,
scheduler interval). Ships AES-256-GCM encrypt/decrypt with full test
coverage. Creates seven domain tables with enums, indexes, and relations:
stripeConnection, emailProvider, failedPayment, recoverySequence,
sequenceStep, recoveryAttempt, escalation.
EOF
)"
```

---

**Done when:**
- `bun install` completes cleanly with new deps present.
- `bun run check-types` passes.
- `bun --filter @dunlo-v2/db test` reports 6/6 passing.
- `bun run db:push` reports all seven new tables created in Neon.
- A single commit captures every modified/created file listed above.
## Task 2: Better Auth hardening + auth UI flows

Harden the Better Auth configuration with email verification, password reset, secure sessions, and rate limiting, then wire up the corresponding UI flows (sign-up confirmation screen, forgot-password view, reset-password route).

**Files:**
- Create: `packages/auth/src/email.ts`
- Modify: `packages/auth/src/index.ts`
- Modify: `apps/web/src/components/sign-up-form.tsx`
- Modify: `apps/web/src/components/sign-in-form.tsx`
- Create: `apps/web/src/routes/reset-password.tsx`

**Architectural notes (read before starting):**
- `packages/auth` MUST NOT import from `apps/web`. Platform email sender lives in `packages/auth/src/email.ts`. The design spec mentions `apps/web/src/lib/auth-email.ts` — that location is wrong and is overruled here.
- `resend` is a runtime dependency of `packages/auth` (added in Task 1).
- Rate-limit storage uses `"memory"` (NOT `"database"`) to avoid needing a `rate_limit` table. Overrules the spec.
- `env.BETTER_AUTH_URL` (e.g. `http://localhost:3000` in dev) is used to construct absolute URLs for password-reset emails — both server- and client-side.
- `RESEND_API_KEY` must already exist in `packages/env/src/server.ts` (added in Task 1). If it doesn't, add it before Step 1 runs.

---

- [ ] **Step 1: Create the platform email sender**

Create `packages/auth/src/email.ts`:

```ts
import { env } from "@dunlo-v2/env/server";
import { Resend } from "resend";

const resend = new Resend(env.RESEND_API_KEY);

const FROM = "Dunlo <noreply@dunlo.io>";
const ACCENT = "#00e87b";

export async function sendAuthEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
  });
  if (error) {
    console.error("[auth-email] resend error", error);
    throw new Error(error.message ?? "Failed to send auth email");
  }
}

function wrap(inner: string) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f7f8fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;border:1px solid #eef0f3;padding:32px;">
            <tr>
              <td>
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:24px;">
                  <span style="display:inline-block;width:24px;height:24px;border-radius:9999px;background:${ACCENT};color:#fff;font-weight:700;font-size:12px;text-align:center;line-height:24px;">D</span>
                  <span style="font-weight:700;font-size:14px;color:#0f172a;">dunlo</span>
                </div>
                ${inner}
                <p style="margin-top:32px;font-size:12px;color:#94a3b8;">If you didn't request this email, you can safely ignore it.</p>
              </td>
            </tr>
          </table>
          <p style="margin-top:16px;font-size:11px;color:#94a3b8;">© ${new Date().getFullYear()} Dunlo</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function verificationEmailHtml({ url }: { url: string }) {
  return wrap(`
    <h1 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Verify your email</h1>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.55;color:#475569;">
      Tap the button below to verify your email and finish setting up your Dunlo account.
    </p>
    <a href="${url}" style="display:inline-block;background:${ACCENT};color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 20px;border-radius:9999px;">
      Verify email
    </a>
    <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;word-break:break-all;">
      Or paste this link into your browser:<br/>${url}
    </p>
  `);
}

export function passwordResetEmailHtml({ url }: { url: string }) {
  return wrap(`
    <h1 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Reset your password</h1>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.55;color:#475569;">
      We received a request to reset your Dunlo password. The link below expires in 1 hour.
    </p>
    <a href="${url}" style="display:inline-block;background:${ACCENT};color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 20px;border-radius:9999px;">
      Reset password
    </a>
    <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;word-break:break-all;">
      Or paste this link into your browser:<br/>${url}
    </p>
  `);
}
```

---

- [ ] **Step 2: Harden Better Auth config (sessions, rate limit, email flows)**

Replace `packages/auth/src/index.ts` entirely:

```ts
import { createDb } from "@dunlo-v2/db";
import * as schema from "@dunlo-v2/db/schema/auth";
import { env } from "@dunlo-v2/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import {
  passwordResetEmailHtml,
  sendAuthEmail,
  verificationEmailHtml,
} from "./email";

export function createAuth() {
  const db = createDb();

  return betterAuth({
    appName: "Dunlo",
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: schema,
    }),
    trustedOrigins: [env.CORS_ORIGIN],
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      sendResetPassword: async ({ user, url }) => {
        await sendAuthEmail({
          to: user.email,
          subject: "Reset your Dunlo password",
          html: passwordResetEmailHtml({ url }),
        });
      },
    },

    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        await sendAuthEmail({
          to: user.email,
          subject: "Verify your Dunlo email",
          html: verificationEmailHtml({ url }),
        });
      },
    },

    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5,
      },
    },

    advanced: {
      useSecureCookies: env.NODE_ENV === "production",
    },

    rateLimit: {
      enabled: true,
      window: 60,
      max: 10,
      storage: "memory",
    },

    plugins: [tanstackStartCookies()],
  });
}

export const auth = createAuth();
```

---

- [ ] **Step 3: Regenerate auth schema and push to Neon**

From the repo root:

```bash
bunx @better-auth/cli@latest generate
bun run db:push
```

Verification:
- `bunx @better-auth/cli@latest generate` should report either "no changes" or write into `packages/db/src/schema/auth.ts`. The existing schema already has `emailVerified`, `verification`, and ip/userAgent on `session`, so changes should be minimal.
- `bun run db:push` should succeed with no destructive prompts. If Drizzle reports a column rename interactively, abort and reconcile manually — do NOT accept blind drops.
- `bun run check-types` should still pass.

---

- [ ] **Step 4: Update sign-up form to render a "Check your inbox" screen**

Replace `apps/web/src/components/sign-up-form.tsx` entirely:

```tsx
import { Input } from "@dunlo-v2/ui/components/input";
import { Label } from "@dunlo-v2/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { ChevronRight, Loader2, MailCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";

export default function SignUpForm({
  onSwitchToSignIn,
}: {
  onSwitchToSignIn: () => void;
}) {
  const { isPending } = authClient.useSession();
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { name: "", email: "", password: "" },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        { email: value.email, password: value.password, name: value.name },
        {
          onSuccess: () => {
            setSubmittedEmail(value.email);
          },
          onError: (err) =>
            toast.error(err.error.message || err.error.statusText),
        },
      );
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, "At least 2 characters"),
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Minimum 8 characters"),
      }),
    },
  });

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-5 animate-spin text-dunlo" />
      </div>
    );
  }

  if (submittedEmail) {
    return (
      <div className="text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-dunlo/15">
          <MailCheck className="size-6 text-dunlo-deep" />
        </div>
        <h2 className="mt-5 text-2xl font-bold text-gray-900">
          Check your inbox
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          We've sent a verification link to{" "}
          <span className="font-semibold text-gray-900">{submittedEmail}</span>.
          Click it to finish creating your Dunlo account.
        </p>
        <p className="mt-6 text-xs text-gray-400">
          Didn't get it? Check spam, or{" "}
          <button
            onClick={() => setSubmittedEmail(null)}
            className="font-semibold text-dunlo-dim hover:underline"
          >
            try another email
          </button>
          .
        </p>
        <p className="mt-8 text-center text-sm text-gray-500">
          Already verified?{" "}
          <button
            onClick={onSwitchToSignIn}
            className="font-semibold text-gray-900 hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
      <p className="mt-1 text-sm text-gray-500">
        Free during beta — no credit card needed.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="mt-8 space-y-5"
      >
        <form.Field name="name">
          {(field) => (
            <div className="space-y-1.5">
              <Label
                htmlFor={field.name}
                className="text-sm font-medium text-gray-700"
              >
                Full name
              </Label>
              <Input
                id={field.name}
                name={field.name}
                autoComplete="name"
                placeholder="Jane Smith"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="h-11 rounded-xl border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:border-dunlo focus:ring-dunlo/20"
              />
              {field.state.meta.errors.map((error) => (
                <p key={error?.message} className="text-xs text-red-500">
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        <form.Field name="email">
          {(field) => (
            <div className="space-y-1.5">
              <Label
                htmlFor={field.name}
                className="text-sm font-medium text-gray-700"
              >
                Work email
              </Label>
              <Input
                id={field.name}
                name={field.name}
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="h-11 rounded-xl border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:border-dunlo focus:ring-dunlo/20"
              />
              {field.state.meta.errors.map((error) => (
                <p key={error?.message} className="text-xs text-red-500">
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <div className="space-y-1.5">
              <Label
                htmlFor={field.name}
                className="text-sm font-medium text-gray-700"
              >
                Password
              </Label>
              <Input
                id={field.name}
                name={field.name}
                type="password"
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="h-11 rounded-xl border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:border-dunlo focus:ring-dunlo/20"
              />
              {field.state.meta.errors.map((error) => (
                <p key={error?.message} className="text-xs text-red-500">
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        <form.Subscribe
          selector={(s) => ({
            canSubmit: s.canSubmit,
            isSubmitting: s.isSubmitting,
          })}
        >
          {({ canSubmit, isSubmitting }) => (
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-dunlo text-sm font-semibold text-white transition-all hover:bg-dunlo-hover active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Creating account…
                </>
              ) : (
                <>
                  Create free account <ChevronRight size={15} />
                </>
              )}
            </button>
          )}
        </form.Subscribe>
      </form>

      <p className="mt-4 text-center text-[11px] text-gray-400">
        By signing up you agree to our{" "}
        <a
          href="#"
          className="underline underline-offset-2 hover:text-gray-600"
        >
          Terms
        </a>{" "}
        and{" "}
        <a
          href="#"
          className="underline underline-offset-2 hover:text-gray-600"
        >
          Privacy Policy
        </a>
        .
      </p>

      <p className="mt-5 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <button
          onClick={onSwitchToSignIn}
          className="font-semibold text-gray-900 hover:underline"
        >
          Sign in
        </button>
      </p>
    </div>
  );
}
```

---

- [ ] **Step 5: Wire up "Forgot password?" inline view on the sign-in form**

Replace `apps/web/src/components/sign-in-form.tsx` entirely:

```tsx
import { Input } from "@dunlo-v2/ui/components/input";
import { Label } from "@dunlo-v2/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";

type View = "signin" | "forgot" | "forgot-sent";

export default function SignInForm({
  onSwitchToSignUp,
}: {
  onSwitchToSignUp: () => void;
}) {
  const navigate = useNavigate({ from: "/login" });
  const { isPending } = authClient.useSession();
  const [view, setView] = useState<View>("signin");

  const signInForm = useForm({
    defaultValues: { email: "", password: "" },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        { email: value.email, password: value.password },
        {
          onSuccess: () => {
            navigate({ to: "/dashboard" });
            toast.success("Welcome back!");
          },
          onError: (err) =>
            toast.error(err.error.message || err.error.statusText),
        },
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Minimum 8 characters"),
      }),
    },
  });

  const forgotForm = useForm({
    defaultValues: { email: "" },
    onSubmit: async ({ value }) => {
      await authClient.requestPasswordReset(
        {
          email: value.email,
          redirectTo: `${window.location.origin}/reset-password`,
        },
        {
          onSuccess: () => setView("forgot-sent"),
          onError: () => setView("forgot-sent"),
        },
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Invalid email address"),
      }),
    },
  });

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-5 animate-spin text-dunlo" />
      </div>
    );
  }

  if (view === "forgot-sent") {
    return (
      <div className="text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-dunlo/15">
          <MailCheck className="size-6 text-dunlo-deep" />
        </div>
        <h2 className="mt-5 text-2xl font-bold text-gray-900">
          Check your inbox
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          If an account exists for that email, we've sent you a reset link.
        </p>
        <button
          onClick={() => setView("signin")}
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 hover:underline"
        >
          <ArrowLeft size={14} /> Back to sign in
        </button>
      </div>
    );
  }

  if (view === "forgot") {
    return (
      <div>
        <button
          onClick={() => setView("signin")}
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={12} /> Back to sign in
        </button>

        <h2 className="text-2xl font-bold text-gray-900">Reset your password</h2>
        <p className="mt-1 text-sm text-gray-500">
          Enter your email and we'll send you a reset link.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            forgotForm.handleSubmit();
          }}
          className="mt-8 space-y-5"
        >
          <forgotForm.Field name="email">
            {(field) => (
              <div className="space-y-1.5">
                <Label
                  htmlFor={field.name}
                  className="text-sm font-medium text-gray-700"
                >
                  Email
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="h-11 rounded-xl border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:border-dunlo focus:ring-dunlo/20"
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-xs text-red-500">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </forgotForm.Field>

          <forgotForm.Subscribe
            selector={(s) => ({
              canSubmit: s.canSubmit,
              isSubmitting: s.isSubmitting,
            })}
          >
            {({ canSubmit, isSubmitting }) => (
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gray-900 text-sm font-semibold text-white transition-all hover:bg-gray-700 active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Sending…
                  </>
                ) : (
                  "Send reset link"
                )}
              </button>
            )}
          </forgotForm.Subscribe>
        </form>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
      <p className="mt-1 text-sm text-gray-500">Sign in to your Dunlo account.</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          signInForm.handleSubmit();
        }}
        className="mt-8 space-y-5"
      >
        <signInForm.Field name="email">
          {(field) => (
            <div className="space-y-1.5">
              <Label
                htmlFor={field.name}
                className="text-sm font-medium text-gray-700"
              >
                Email
              </Label>
              <Input
                id={field.name}
                name={field.name}
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="h-11 rounded-xl border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:border-dunlo focus:ring-dunlo/20"
              />
              {field.state.meta.errors.map((error) => (
                <p key={error?.message} className="text-xs text-red-500">
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </signInForm.Field>

        <signInForm.Field name="password">
          {(field) => (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor={field.name}
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </Label>
                <button
                  type="button"
                  onClick={() => setView("forgot")}
                  className="text-xs font-medium text-dunlo-dim hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id={field.name}
                name={field.name}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="h-11 rounded-xl border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:border-dunlo focus:ring-dunlo/20"
              />
              {field.state.meta.errors.map((error) => (
                <p key={error?.message} className="text-xs text-red-500">
                  {error?.message}
                </p>
              ))}
            </div>
          )}
        </signInForm.Field>

        <signInForm.Subscribe
          selector={(s) => ({
            canSubmit: s.canSubmit,
            isSubmitting: s.isSubmitting,
          })}
        >
          {({ canSubmit, isSubmitting }) => (
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gray-900 text-sm font-semibold text-white transition-all hover:bg-gray-700 active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          )}
        </signInForm.Subscribe>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        No account?{" "}
        <button
          onClick={onSwitchToSignUp}
          className="font-semibold text-dunlo-dim hover:underline"
        >
          Create one free
        </button>
      </p>
    </div>
  );
}
```

---

- [ ] **Step 6: Create the reset-password route**

Create `apps/web/src/routes/reset-password.tsx`:

```tsx
import { Input } from "@dunlo-v2/ui/components/input";
import { Label } from "@dunlo-v2/ui/components/label";
import { useForm } from "@tanstack/react-form";
import {
  createFileRoute,
  Link,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import z from "zod";

import { Logo } from "@/components/logo";
import { authClient } from "@/lib/auth-client";

const searchSchema = z.object({
  token: z.string().min(1).optional(),
});

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Reset password — Dunlo" },
    ],
  }),
  validateSearch: (search) => searchSchema.parse(search),
  component: RouteComponent,
});

function RouteComponent() {
  const { token } = useSearch({ from: "/reset-password" });
  const navigate = useNavigate({ from: "/reset-password" });

  const form = useForm({
    defaultValues: { newPassword: "", confirmPassword: "" },
    onSubmit: async ({ value }) => {
      if (!token) return;
      await authClient.resetPassword(
        { newPassword: value.newPassword, token },
        {
          onSuccess: () => {
            toast.success("Password updated. Please sign in.");
            navigate({ to: "/login" });
          },
          onError: (err) =>
            toast.error(err.error.message || err.error.statusText),
        },
      );
    },
    validators: {
      onSubmit: z
        .object({
          newPassword: z.string().min(8, "Minimum 8 characters"),
          confirmPassword: z.string().min(8, "Minimum 8 characters"),
        })
        .refine((v) => v.newPassword === v.confirmPassword, {
          message: "Passwords don't match",
          path: ["confirmPassword"],
        }),
    },
  });

  return (
    <div className="flex min-h-dvh flex-col bg-[#f7f8fa] font-sans">
      <header className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <Logo size={22} />
        </Link>
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={12} /> Back to sign in
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          {!token ? (
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Invalid reset link
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                This password reset link is missing or has expired. Request a
                new one from the sign-in page.
              </p>
              <Link
                to="/login"
                className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-gray-900 px-6 text-sm font-semibold text-white transition-all hover:bg-gray-700 active:scale-[0.98]"
              >
                Go to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-dunlo/15">
                <CheckCircle2 className="size-6 text-dunlo-deep" />
              </div>
              <h1 className="mt-5 text-center text-2xl font-bold text-gray-900">
                Set a new password
              </h1>
              <p className="mt-1 text-center text-sm text-gray-500">
                Choose a strong password — at least 8 characters.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit();
                }}
                className="mt-8 space-y-5"
              >
                <form.Field name="newPassword">
                  {(field) => (
                    <div className="space-y-1.5">
                      <Label
                        htmlFor={field.name}
                        className="text-sm font-medium text-gray-700"
                      >
                        New password
                      </Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        autoComplete="new-password"
                        placeholder="Min. 8 characters"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="h-11 rounded-xl border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:border-dunlo focus:ring-dunlo/20"
                      />
                      {field.state.meta.errors.map((error) => (
                        <p key={error?.message} className="text-xs text-red-500">
                          {error?.message}
                        </p>
                      ))}
                    </div>
                  )}
                </form.Field>

                <form.Field name="confirmPassword">
                  {(field) => (
                    <div className="space-y-1.5">
                      <Label
                        htmlFor={field.name}
                        className="text-sm font-medium text-gray-700"
                      >
                        Confirm password
                      </Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        autoComplete="new-password"
                        placeholder="Repeat password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="h-11 rounded-xl border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:border-dunlo focus:ring-dunlo/20"
                      />
                      {field.state.meta.errors.map((error) => (
                        <p key={error?.message} className="text-xs text-red-500">
                          {error?.message}
                        </p>
                      ))}
                    </div>
                  )}
                </form.Field>

                <form.Subscribe
                  selector={(s) => ({
                    canSubmit: s.canSubmit,
                    isSubmitting: s.isSubmitting,
                  })}
                >
                  {({ canSubmit, isSubmitting }) => (
                    <button
                      type="submit"
                      disabled={!canSubmit || isSubmitting}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gray-900 text-sm font-semibold text-white transition-all hover:bg-gray-700 active:scale-[0.98] disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="size-4 animate-spin" /> Updating…
                        </>
                      ) : (
                        "Update password"
                      )}
                    </button>
                  )}
                </form.Subscribe>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
```

---

- [ ] **Step 7: Type-check the workspace**

```bash
bun run check-types
```

Verification:
- Zero TypeScript errors across `packages/auth`, `packages/db`, `apps/web`.
- If TanStack Router complains about the new route, run the dev server once (`bun run dev:web`) so it regenerates `routeTree.gen.ts`, then re-run `bun run check-types`.

---

- [ ] **Step 8: Manual end-to-end verification**

Start the dev server:

```bash
bun run dev:web
```

Walk through this checklist using a real (or Resend-allowlisted) email:

- [ ] Visit `http://localhost:3000/login`, switch to "Create account".
- [ ] Sign up with name + email + password (>= 8 chars). The form should swap to "Check your inbox — we've sent a verification link to <email>".
- [ ] Open the inbox, confirm the email arrived from `Dunlo <noreply@dunlo.io>`, branded with the dunlo green pill button.
- [ ] Click the verification link → you should be auto-signed in and land on `/dashboard` (because `autoSignInAfterVerification: true`).
- [ ] Sign out (or open a private window). Try signing in BEFORE verifying a brand-new account — you should see an "email not verified" toast (because `requireEmailVerification: true`).
- [ ] On the sign-in form, click "Forgot password?". The view should swap to the email-only form. Submit your email.
- [ ] The form should swap to "If an account exists, we've sent you a reset link." Check inbox for the reset email.
- [ ] Click the reset link → land on `/reset-password?token=...`. Verify `<head>` has `noindex, nofollow` (DevTools → Elements).
- [ ] Visit `/reset-password` without a token → the "Invalid reset link" panel renders.
- [ ] Submit a new password (with matching confirm) → redirect to `/login` with success toast. Sign in with the new password.
- [ ] Smash the sign-in endpoint 15 times in 60 seconds with bad credentials — after 10 attempts you should get a rate-limit error (Better Auth `rateLimit` window=60, max=10).
- [ ] Open DevTools → Application → Cookies in dev: cookie should NOT be `Secure` (env=development). In a production build it WOULD be.

If any step fails, do not commit — fix the underlying issue first.

---

- [ ] **Step 9: Commit**

```bash
git add packages/auth/src/email.ts \
        packages/auth/src/index.ts \
        apps/web/src/components/sign-up-form.tsx \
        apps/web/src/components/sign-in-form.tsx \
        apps/web/src/routes/reset-password.tsx

git commit -m "$(cat <<'EOF'
feat(auth): harden Better Auth with email verification, password reset, and rate limiting

Add platform email sender (Resend) wired into Better Auth's emailVerification
and sendResetPassword hooks. Enable requireEmailVerification, cookieCache,
secure-cookies-in-prod, and an in-memory rate limit. Update sign-up to render
a "check your inbox" confirmation, add an inline forgot-password view to
sign-in, and ship the /reset-password route.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```
## Task 3: Stripe Connect OAuth + Webhook ingestion

**Goal:** Connect a user's Stripe account via OAuth, register a per-account webhook, seed default recovery sequences on first connect, and ingest payment failure/success events to drive the recovery flow.

**Prerequisites (assumed from prior tasks):**
- Task 1 added env vars (`STRIPE_CLIENT_ID`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `ENCRYPTION_KEY`, `APP_URL`) to `packages/env/src/server.ts`.
- Task 2 created `packages/db/src/encrypt.ts` (`encrypt` / `decrypt`) and `packages/db/src/schema/domain.ts` (`stripeConnection`, `failedPayment`, `recoverySequence`, `sequenceStep`, `recoveryAttempt`, `escalation`).
- `stripe@^17` is installed in `apps/web/package.json`.

**Files:**
- Create: `apps/web/src/lib/stripe.ts`
- Create: `apps/web/src/functions/stripe.ts`
- Create: `apps/web/src/routes/api/stripe/connect.ts`
- Create: `apps/web/src/routes/api/stripe/callback.ts`
- Create: `apps/web/src/routes/api/stripe/webhook.ts`

---

- [ ] **Step 1: Install the Stripe SDK in the web app (if not already done in Task 1)**

```bash
bun add stripe --filter=@dunlo-v2/web
```

Confirm `stripe` appears under `dependencies` in `apps/web/package.json`. If the version that lands does not accept the `apiVersion` string used below, omit the `apiVersion` option entirely and let the SDK use its default pinned version.

---

- [ ] **Step 2: Create the Stripe SDK factory**

Create `apps/web/src/lib/stripe.ts`:

```ts
import { env } from "@dunlo-v2/env/server";
import Stripe from "stripe";

const STRIPE_API_VERSION = "2024-12-18.acacia" as Stripe.LatestApiVersion;

export function getPlatformStripe(): Stripe {
  return new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: STRIPE_API_VERSION,
    typescript: true,
    appInfo: {
      name: "Dunlo",
      url: env.APP_URL,
    },
  });
}

export function getConnectedStripe(accessToken: string): Stripe {
  return new Stripe(accessToken, {
    apiVersion: STRIPE_API_VERSION,
    typescript: true,
    appInfo: {
      name: "Dunlo",
      url: env.APP_URL,
    },
  });
}
```

> If the installed `stripe` SDK does not accept `"2024-12-18.acacia"` as a literal type, replace the constant with `undefined` (i.e. drop the `apiVersion` field from both `new Stripe(...)` calls) so the SDK uses its bundled default.

---

- [ ] **Step 3: Create the Stripe server helpers**

Create `apps/web/src/functions/stripe.ts`:

```ts
import { db } from "@dunlo-v2/db";
import { decrypt } from "@dunlo-v2/db/encrypt";
import {
  recoverySequence,
  sequenceStep,
  stripeConnection,
} from "@dunlo-v2/db/schema/domain";
import { and, eq } from "drizzle-orm";

export type DecryptedStripeConnection = {
  id: string;
  userId: string;
  stripeAccountId: string;
  accessToken: string;
  publishableKey: string | null;
  webhookEndpointId: string | null;
  webhookSecret: string;
  scope: string | null;
  escalationThreshold: number | null;
  escalationCurrency: string;
};

export async function getStripeConnection(
  userId: string,
): Promise<DecryptedStripeConnection | null> {
  const [row] = await db
    .select()
    .from(stripeConnection)
    .where(eq(stripeConnection.userId, userId))
    .limit(1);

  if (!row) return null;

  return {
    id: row.id,
    userId: row.userId,
    stripeAccountId: row.stripeAccountId,
    accessToken: decrypt(row.accessToken),
    publishableKey: row.publishableKey,
    webhookEndpointId: row.webhookEndpointId,
    webhookSecret: decrypt(row.webhookSecret),
    scope: row.scope,
    escalationThreshold: row.escalationThreshold,
    escalationCurrency: row.escalationCurrency,
  };
}

export async function getStripeConnectionByAccountId(
  stripeAccountId: string,
): Promise<DecryptedStripeConnection | null> {
  const [row] = await db
    .select()
    .from(stripeConnection)
    .where(eq(stripeConnection.stripeAccountId, stripeAccountId))
    .limit(1);

  if (!row) return null;

  return {
    id: row.id,
    userId: row.userId,
    stripeAccountId: row.stripeAccountId,
    accessToken: decrypt(row.accessToken),
    publishableKey: row.publishableKey,
    webhookEndpointId: row.webhookEndpointId,
    webhookSecret: decrypt(row.webhookSecret),
    scope: row.scope,
    escalationThreshold: row.escalationThreshold,
    escalationCurrency: row.escalationCurrency,
  };
}

type DefaultSequence = {
  failureCode: string;
  name: string;
  steps: Array<{
    stepNumber: number;
    delayHours: number;
    subject: string;
    body: string;
  }>;
};

const DEFAULT_SEQUENCES: DefaultSequence[] = [
  {
    failureCode: "expired_card",
    name: "Card Expired",
    steps: [
      {
        stepNumber: 1,
        delayHours: 0,
        subject:
          "Your card has expired — update to keep {{product_name}}",
        body: `Hi {{customer_name}},\n\nWe tried to charge {{amount}} to your card ending in {{last_four}}, but it has expired.\n\nUpdate your card here to keep things running: {{update_payment_url}}\n\nThanks,\n{{sender_name}}`,
      },
      {
        stepNumber: 2,
        delayHours: 24,
        subject: "Reminder: update your payment to stay subscribed",
        body: `Hi {{customer_name}},\n\nQuick reminder — your card on file has expired and we still need to charge {{amount}}.\n\nIt only takes a minute to fix: {{update_payment_url}}\n\n{{sender_name}}`,
      },
      {
        stepNumber: 3,
        delayHours: 72,
        subject:
          "Final notice: your {{product_name}} subscription is at risk",
        body: `Hi {{customer_name}},\n\nThis is the last reminder before we pause your subscription. The {{amount}} charge is still failing because your card expired.\n\nUpdate now: {{update_payment_url}}\n\n{{sender_name}}`,
      },
    ],
  },
  {
    failureCode: "card_declined",
    name: "Card Declined",
    steps: [
      {
        stepNumber: 1,
        delayHours: 0,
        subject: "We couldn't process your payment",
        body: `Hi {{customer_name}},\n\nYour card ending in {{last_four}} was declined for {{amount}} ({{failure_reason}}).\n\nYou can update your payment method here: {{update_payment_url}}\n\n{{sender_name}}`,
      },
      {
        stepNumber: 2,
        delayHours: 48,
        subject: "Payment still failing — try a different card",
        body: `Hi {{customer_name}},\n\nWe retried the {{amount}} charge and it failed again.\n\nIf the first card isn't working, you can try another one here: {{update_payment_url}}\n\n{{sender_name}}`,
      },
    ],
  },
  {
    failureCode: "insufficient_funds",
    name: "Insufficient Funds",
    steps: [
      {
        stepNumber: 1,
        delayHours: 24,
        subject: "We'll retry your payment in 48 hours",
        body: `Hi {{customer_name}},\n\nYour {{amount}} payment couldn't go through due to insufficient funds. We'll retry automatically in 48 hours.\n\nNeed to use a different card? Update here: {{update_payment_url}}\n\n{{sender_name}}`,
      },
      {
        stepNumber: 2,
        delayHours: 72,
        subject: "Payment retry failed — please update your details",
        body: `Hi {{customer_name}},\n\nThe retry for {{amount}} failed again. Please update your payment method to avoid losing access: {{update_payment_url}}\n\n{{sender_name}}`,
      },
    ],
  },
  {
    failureCode: "do_not_honor",
    name: "Bank Declined",
    steps: [
      {
        stepNumber: 1,
        delayHours: 0,
        subject: "Your bank declined the payment",
        body: `Hi {{customer_name}},\n\nYour bank declined the {{amount}} charge on the card ending in {{last_four}}. This usually means contacting your bank or trying a different card.\n\nUpdate your payment method here: {{update_payment_url}}\n\n{{sender_name}}`,
      },
      {
        stepNumber: 2,
        delayHours: 48,
        subject: "Please contact your bank or use a different card",
        body: `Hi {{customer_name}},\n\nThe charge for {{amount}} is still being declined by your bank.\n\nTrying a different card usually solves this: {{update_payment_url}}\n\n{{sender_name}}`,
      },
    ],
  },
];

export async function seedDefaultSequences(userId: string): Promise<void> {
  for (const seq of DEFAULT_SEQUENCES) {
    const existing = await db
      .select({ id: recoverySequence.id })
      .from(recoverySequence)
      .where(
        and(
          eq(recoverySequence.userId, userId),
          eq(recoverySequence.failureCode, seq.failureCode),
        ),
      )
      .limit(1);

    if (existing.length > 0) continue;

    const sequenceId = crypto.randomUUID();
    await db.insert(recoverySequence).values({
      id: sequenceId,
      userId,
      failureCode: seq.failureCode,
      name: seq.name,
      isActive: true,
    });

    for (const step of seq.steps) {
      await db.insert(sequenceStep).values({
        id: crypto.randomUUID(),
        sequenceId,
        stepNumber: step.stepNumber,
        delayHours: step.delayHours,
        subject: step.subject,
        body: step.body,
      });
    }
  }
}
```

> If `recoverySequence` / `sequenceStep` use a different primary key strategy (e.g. `createId()` from cuid2), swap the `crypto.randomUUID()` calls accordingly. Match whatever Task 2 settled on for the rest of the domain tables.

---

- [ ] **Step 4: Create the OAuth start route (`/api/stripe/connect`)**

Create `apps/web/src/routes/api/stripe/connect.ts`:

```ts
import { auth } from "@dunlo-v2/auth";
import { env } from "@dunlo-v2/env/server";
import { createFileRoute } from "@tanstack/react-router";

const STATE_COOKIE = "stripe_oauth_state";
const STATE_TTL_SECONDS = 60 * 10; // 10 minutes

function buildStateCookie(value: string): string {
  const parts = [
    `${STATE_COOKIE}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${STATE_TTL_SECONDS}`,
  ];
  if (env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

export const Route = createFileRoute("/api/stripe/connect")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session?.user) {
          return new Response(null, {
            status: 302,
            headers: { Location: "/login" },
          });
        }

        const state = crypto.randomUUID();

        const params = new URLSearchParams({
          response_type: "code",
          client_id: env.STRIPE_CLIENT_ID,
          scope: "read_write",
          redirect_uri: `${env.APP_URL}/api/stripe/callback`,
          state,
        });

        const oauthUrl = `https://connect.stripe.com/oauth/authorize?${params.toString()}`;

        return new Response(null, {
          status: 302,
          headers: {
            Location: oauthUrl,
            "Set-Cookie": buildStateCookie(state),
          },
        });
      },
    },
  },
});
```

---

- [ ] **Step 5: Create the OAuth callback route (`/api/stripe/callback`)**

Create `apps/web/src/routes/api/stripe/callback.ts`:

```ts
import { auth } from "@dunlo-v2/auth";
import { db } from "@dunlo-v2/db";
import { encrypt } from "@dunlo-v2/db/encrypt";
import { stripeConnection } from "@dunlo-v2/db/schema/domain";
import { env } from "@dunlo-v2/env/server";
import { createFileRoute } from "@tanstack/react-router";

import { seedDefaultSequences } from "@/functions/stripe";
import { getConnectedStripe } from "@/lib/stripe";

const STATE_COOKIE = "stripe_oauth_state";

const WEBHOOK_EVENTS: string[] = [
  "payment_intent.payment_failed",
  "payment_intent.succeeded",
  "invoice.payment_failed",
  "invoice.payment_succeeded",
];

function clearStateCookie(): string {
  const parts = [
    `${STATE_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
  ];
  if (env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key) out[key] = decodeURIComponent(value);
  }
  return out;
}

function redirectWithError(message: string): Response {
  const params = new URLSearchParams({
    error: "stripe_failed",
    msg: message,
  });
  return new Response(null, {
    status: 302,
    headers: {
      Location: `/onboarding?${params.toString()}`,
      "Set-Cookie": clearStateCookie(),
    },
  });
}

type StripeOAuthTokenResponse = {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  stripe_publishable_key?: string;
  stripe_user_id: string;
  scope?: string;
  livemode?: boolean;
};

export const Route = createFileRoute("/api/stripe/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const code = url.searchParams.get("code");
          const state = url.searchParams.get("state");
          const errorParam = url.searchParams.get("error");

          if (errorParam) {
            return redirectWithError(errorParam);
          }

          if (!code || !state) {
            return redirectWithError("missing_code_or_state");
          }

          const cookies = parseCookies(request.headers.get("cookie"));
          const cookieState = cookies[STATE_COOKIE];
          if (!cookieState || cookieState !== state) {
            return redirectWithError("invalid_state");
          }

          const session = await auth.api.getSession({
            headers: request.headers,
          });
          if (!session?.user) {
            return new Response(null, {
              status: 302,
              headers: { Location: "/login" },
            });
          }

          const tokenRes = await fetch(
            "https://connect.stripe.com/oauth/token",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                grant_type: "authorization_code",
                code,
                client_secret: env.STRIPE_SECRET_KEY,
              }).toString(),
            },
          );

          if (!tokenRes.ok) {
            const errBody = await tokenRes.text();
            console.error("[stripe/callback] token exchange failed", errBody);
            return redirectWithError("token_exchange_failed");
          }

          const token = (await tokenRes.json()) as StripeOAuthTokenResponse;

          const connectedStripe = getConnectedStripe(token.access_token);
          const webhook = await connectedStripe.webhookEndpoints.create({
            url: `${env.APP_URL}/api/stripe/webhook`,
            enabled_events: WEBHOOK_EVENTS as never,
          });

          if (!webhook.secret) {
            return redirectWithError("webhook_secret_missing");
          }

          await db.insert(stripeConnection).values({
            id: crypto.randomUUID(),
            userId: session.user.id,
            stripeAccountId: token.stripe_user_id,
            accessToken: encrypt(token.access_token),
            publishableKey: token.stripe_publishable_key ?? null,
            webhookEndpointId: webhook.id,
            webhookSecret: encrypt(webhook.secret),
            scope: token.scope ?? "read_write",
            escalationThreshold: 50000,
            escalationCurrency: "eur",
          });

          await seedDefaultSequences(session.user.id);

          return new Response(null, {
            status: 302,
            headers: {
              Location: "/dashboard?stripe=connected",
              "Set-Cookie": clearStateCookie(),
            },
          });
        } catch (err) {
          console.error("[stripe/callback] error", err);
          const message =
            err instanceof Error ? err.message.slice(0, 200) : "unknown";
          return redirectWithError(message);
        }
      },
    },
  },
});
```

> If the Stripe SDK's typed `enabled_events` enum rejects the string array literal, the `as never` cast keeps the runtime call honest while sidestepping a noisy literal-union type. If your installed SDK accepts the strings directly, drop the cast.

---

- [ ] **Step 6: Create the webhook receiver (`/api/stripe/webhook`)**

Create `apps/web/src/routes/api/stripe/webhook.ts`. The handler:

1. Parses the raw body without verifying (only to read `event.account`).
2. Looks up the matching `stripeConnection` to find the per-account webhook secret.
3. Re-verifies the signature using that decrypted secret.
4. Dispatches to `processFailedPayment` or `processRecoveredPayment` — both exported so Task 7 can later layer AI draft generation on top of `processFailedPayment` without rewriting the route.

```ts
import { db } from "@dunlo-v2/db";
import {
  failedPayment,
  recoveryAttempt,
  recoverySequence,
  sequenceStep,
  escalation,
} from "@dunlo-v2/db/schema/domain";
import { createFileRoute } from "@tanstack/react-router";
import { and, eq, inArray } from "drizzle-orm";
import type Stripe from "stripe";

import { getStripeConnectionByAccountId, type DecryptedStripeConnection } from "@/functions/stripe";
import { getPlatformStripe } from "@/lib/stripe";

const FAILURE_EVENTS = new Set<string>([
  "payment_intent.payment_failed",
  "invoice.payment_failed",
]);

const SUCCESS_EVENTS = new Set<string>([
  "payment_intent.succeeded",
  "invoice.payment_succeeded",
]);

function pickFailureCode(
  event: Stripe.Event,
): { code: string; message: string | null } {
  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object as Stripe.PaymentIntent;
    return {
      code:
        pi.last_payment_error?.decline_code ??
        pi.last_payment_error?.code ??
        "card_declined",
      message: pi.last_payment_error?.message ?? null,
    };
  }
  if (event.type === "invoice.payment_failed") {
    const inv = event.data.object as Stripe.Invoice;
    const reason =
      (inv.last_finalization_error?.decline_code as string | undefined) ??
      (inv.last_finalization_error?.code as string | undefined) ??
      "card_declined";
    return {
      code: reason,
      message: inv.last_finalization_error?.message ?? null,
    };
  }
  return { code: "card_declined", message: null };
}

function extractFailureContext(event: Stripe.Event) {
  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object as Stripe.PaymentIntent;
    const charge =
      pi.charges && "data" in pi.charges ? pi.charges.data[0] : undefined;
    return {
      paymentIntentId: pi.id,
      invoiceId: (pi.invoice as string | null) ?? null,
      customerId: (pi.customer as string | null) ?? null,
      amount: pi.amount,
      currency: pi.currency,
      customerEmail:
        (pi.receipt_email as string | null) ??
        (charge?.billing_details?.email as string | null) ??
        null,
      customerName:
        (charge?.billing_details?.name as string | null) ?? null,
      lastFour: (charge?.payment_method_details?.card?.last4 as string | null) ?? null,
      description: pi.description ?? null,
    };
  }
  if (event.type === "invoice.payment_failed") {
    const inv = event.data.object as Stripe.Invoice;
    return {
      paymentIntentId:
        typeof inv.payment_intent === "string"
          ? inv.payment_intent
          : inv.payment_intent?.id ?? `inv_${inv.id}`,
      invoiceId: inv.id,
      customerId:
        typeof inv.customer === "string"
          ? inv.customer
          : inv.customer?.id ?? null,
      amount: inv.amount_due,
      currency: inv.currency,
      customerEmail: inv.customer_email ?? null,
      customerName: inv.customer_name ?? null,
      lastFour: null,
      description: inv.description ?? inv.lines?.data?.[0]?.description ?? null,
    };
  }
  return null;
}

export async function processFailedPayment(
  event: Stripe.Event,
  connection: DecryptedStripeConnection,
): Promise<void> {
  const ctx = extractFailureContext(event);
  if (!ctx) return;
  if (!ctx.customerEmail) {
    console.warn(
      "[stripe/webhook] skipping failed payment with no customer email",
      ctx.paymentIntentId,
    );
    return;
  }

  const { code: failureCode, message: failureMessage } = pickFailureCode(event);

  const existing = await db
    .select({ id: failedPayment.id })
    .from(failedPayment)
    .where(eq(failedPayment.stripePaymentIntentId, ctx.paymentIntentId))
    .limit(1);
  if (existing.length > 0) return;

  const threshold = connection.escalationThreshold;
  const shouldEscalate =
    threshold !== null && threshold > 0 && ctx.amount >= threshold;

  const paymentId = crypto.randomUUID();

  await db.insert(failedPayment).values({
    id: paymentId,
    userId: connection.userId,
    stripePaymentIntentId: ctx.paymentIntentId,
    stripeCustomerId: ctx.customerId ?? "",
    stripeInvoiceId: ctx.invoiceId,
    amount: ctx.amount,
    currency: ctx.currency,
    failureCode,
    failureMessage,
    customerName: ctx.customerName,
    customerEmail: ctx.customerEmail,
    lastFour: ctx.lastFour,
    description: ctx.description,
    status: shouldEscalate ? "escalated" : "in_recovery",
  });

  if (shouldEscalate) {
    await db.insert(escalation).values({
      id: crypto.randomUUID(),
      failedPaymentId: paymentId,
      userId: connection.userId,
      draftSubject: null,
      draftBody: null,
      status: "pending",
    });
    return;
  }

  const sequence = await findSequenceForFailureCode(
    connection.userId,
    failureCode,
  );
  if (!sequence) return;

  const steps = await db
    .select()
    .from(sequenceStep)
    .where(eq(sequenceStep.sequenceId, sequence.id));

  if (steps.length === 0) return;

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
}

async function findSequenceForFailureCode(userId: string, failureCode: string) {
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

export async function processRecoveredPayment(
  event: Stripe.Event,
  connection: DecryptedStripeConnection,
): Promise<void> {
  let paymentIntentId: string | null = null;
  let invoiceId: string | null = null;

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as Stripe.PaymentIntent;
    paymentIntentId = pi.id;
    invoiceId =
      typeof pi.invoice === "string"
        ? pi.invoice
        : (pi.invoice as Stripe.Invoice | null)?.id ?? null;
  } else if (event.type === "invoice.payment_succeeded") {
    const inv = event.data.object as Stripe.Invoice;
    invoiceId = inv.id;
    paymentIntentId =
      typeof inv.payment_intent === "string"
        ? inv.payment_intent
        : inv.payment_intent?.id ?? null;
  }

  if (!paymentIntentId && !invoiceId) return;

  const matches = await db
    .select()
    .from(failedPayment)
    .where(
      and(
        eq(failedPayment.userId, connection.userId),
        inArray(failedPayment.status, ["in_recovery", "escalated"]),
      ),
    );

  const target = matches.find(
    (p) =>
      (paymentIntentId && p.stripePaymentIntentId === paymentIntentId) ||
      (invoiceId && p.stripeInvoiceId === invoiceId),
  );
  if (!target) return;

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
}

export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        const sig = request.headers.get("stripe-signature");

        if (!sig) {
          return new Response("Missing stripe-signature header", {
            status: 400,
          });
        }

        let parsed: { account?: string; type?: string };
        try {
          parsed = JSON.parse(rawBody);
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const accountId = parsed.account;
        if (!accountId) {
          return new Response("Missing account on event", { status: 400 });
        }

        const connection = await getStripeConnectionByAccountId(accountId);
        if (!connection) {
          return new Response("Unknown connected account", { status: 400 });
        }

        const stripe = getPlatformStripe();
        let event: Stripe.Event;
        try {
          event = stripe.webhooks.constructEvent(
            rawBody,
            sig,
            connection.webhookSecret,
          );
        } catch (err) {
          console.error("[stripe/webhook] signature verification failed", err);
          return new Response("Invalid signature", { status: 400 });
        }

        try {
          if (FAILURE_EVENTS.has(event.type)) {
            await processFailedPayment(event, connection);
          } else if (SUCCESS_EVENTS.has(event.type)) {
            await processRecoveredPayment(event, connection);
          }
        } catch (err) {
          console.error(
            "[stripe/webhook] handler error",
            event.type,
            event.id,
            err,
          );
          return new Response("Handler error", { status: 500 });
        }

        return Response.json({ received: true });
      },
    },
  },
});
```

> **Status enum note:** the spec calls for `recoveryAttempt.status` to include `"dismissed"`. Task 2 should have set the enum to `("scheduled" | "sent" | "failed" | "dismissed")`. If it didn't, add `"dismissed"` to the `recoveryAttempt` status enum in `packages/db/src/schema/domain.ts` and run `bun run db:push` before continuing.
>
> **Encryption side-channel:** when a connection record was inserted seconds before the first webhook, Neon's serverless driver may not see it yet on a cold connection. If you see "Unknown connected account" on the very first event, retry — subsequent events will resolve.

---

- [ ] **Step 7: Type-check the monorepo**

```bash
bun run check-types
```

Fix any type errors before continuing. Common ones:
- `apiVersion` literal mismatch in `lib/stripe.ts` → drop the field as noted in Step 2.
- `enabled_events` union mismatch in `callback.ts` → keep the `as never` cast.
- `recoveryAttempt.status` missing `"dismissed"` → see the schema note in Step 6.

---

- [ ] **Step 8: Manual verification — OAuth round trip**

1. Make sure `.env` has `STRIPE_CLIENT_ID`, `STRIPE_SECRET_KEY`, `ENCRYPTION_KEY`, `APP_URL=http://localhost:3001` (or whichever port the dev server uses).
2. In the Stripe dashboard → Connect → Settings, add `http://localhost:3001/api/stripe/callback` to the OAuth redirect URIs for your platform.
3. Start the app: `bun run dev:web`.
4. Sign in, then in the browser hit `http://localhost:3001/api/stripe/connect`. You should be redirected to `connect.stripe.com/oauth/authorize`.
5. Complete the OAuth flow with a Stripe test account.
6. Expect a redirect to `/dashboard?stripe=connected`.
7. Verify in Drizzle Studio (`bun run db:studio`):
   - One `stripeConnection` row exists for the user.
   - Four `recoverySequence` rows (`expired_card`, `card_declined`, `insufficient_funds`, `do_not_honor`) and their seeded `sequenceStep` rows exist.

---

- [ ] **Step 9: Manual verification — webhook ingestion via Stripe CLI**

In a separate terminal:

```bash
stripe login
stripe listen \
  --forward-connect-to localhost:3001/api/stripe/webhook \
  --events payment_intent.payment_failed,payment_intent.succeeded,invoice.payment_failed,invoice.payment_succeeded
```

> Use `--forward-connect-to` (not `--forward-to`) so events are sent as Connect events with an `account` field populated — that field is what the handler keys on.

In another terminal, fire test events scoped to your connected account:

```bash
stripe trigger payment_intent.payment_failed --stripe-account=acct_XXXXXXXX
```

Replace `acct_XXXXXXXX` with the `stripeAccountId` from the row inserted in Step 8.

Expect:
- HTTP 200 from the webhook handler.
- A new `failedPayment` row with `status = "in_recovery"` (or `"escalated"` if you trigger an amount above 50000).
- `recoveryAttempt` rows for each step in the matched sequence, all `status = "scheduled"`.

Then trigger recovery:

```bash
stripe trigger payment_intent.succeeded --stripe-account=acct_XXXXXXXX
```

> The PI from `trigger` won't necessarily match the previous one, so this may not flip the existing row. For an end-to-end test, drive a failure → success against the same payment intent by creating a payment intent, attaching a failing card, then a successful one, all under the connected account.

To validate the recovery branch directly, in Drizzle Studio set a `failedPayment.stripePaymentIntentId` to a known value, then fire:

```bash
stripe trigger payment_intent.succeeded --stripe-account=acct_XXXXXXXX --override payment_intent:id=<that-pi-id>
```

Expect:
- That `failedPayment` row flips to `status = "recovered"` with `recoveredAt` set.
- All its `recoveryAttempt` rows with `status = "scheduled"` flip to `"dismissed"`.

---

- [ ] **Step 10: Commit**

```bash
git add \
  apps/web/src/lib/stripe.ts \
  apps/web/src/functions/stripe.ts \
  apps/web/src/routes/api/stripe/connect.ts \
  apps/web/src/routes/api/stripe/callback.ts \
  apps/web/src/routes/api/stripe/webhook.ts \
  apps/web/package.json \
  bun.lock

git commit -m "feat(stripe): add Connect OAuth and webhook ingestion

- Add platform + connected Stripe SDK factories in lib/stripe.ts
- Add seedDefaultSequences and getStripeConnection helpers
- Wire /api/stripe/connect and /api/stripe/callback OAuth routes with CSRF state cookie
- Register per-account webhook endpoints on OAuth completion
- Ingest payment_intent and invoice failure/success events; create failedPayment + recoveryAttempt rows or escalate above threshold; mark recovered on success"
```

---

**Done when:**
- `bun run check-types` is clean.
- OAuth round trip creates a `stripeConnection` row and seeds 4 sequences.
- `stripe trigger payment_intent.payment_failed --stripe-account=...` produces a `failedPayment` row plus scheduled `recoveryAttempt` rows.
- A `payment_intent.succeeded` event for a known failed payment flips it to `recovered` and dismisses its scheduled attempts.
- The webhook returns 400 on missing signature, missing account, unknown account, or signature verification failure.
## Task 4: Email engine (template renderer + Resend wrapper + scheduler + Nitro plugin)

**Goal:** Build the email recovery pipeline. A scheduler function loads scheduled `recoveryAttempt` rows, renders templates with payment context, generates Stripe billing portal links, sends via each user's Resend key, and marks attempts sent/failed. Triggered both by a Nitro background interval and a Bearer-authenticated cron API route.

**Files:**
- Create: `apps/web/src/lib/template.ts`
- Create: `apps/web/src/lib/template.test.ts`
- Create: `apps/web/src/lib/resend.ts`
- Create: `apps/web/src/functions/scheduler.ts`
- Create: `apps/web/src/routes/api/cron/process-emails.ts`
- Create: `apps/web/server/plugins/email-scheduler.ts`
- Modify: `packages/env/src/server.ts` (add `CRON_SECRET`, `SCHEDULER_INTERVAL_MINUTES`, `APP_URL`)
- Modify: `apps/web/vite.config.ts` (register Nitro plugin via `tanstackStart()` options)
- Modify: `apps/web/package.json` (add `resend`, `marked`; add `vitest` to devDeps if not present)

**Assumptions from prior tasks:**
- Task 1 has created `packages/db/src/schema/domain.ts` exporting `stripeConnection`, `emailProvider`, `failedPayment`, `recoverySequence`, `sequenceStep`, `recoveryAttempt`, `escalation`.
- Task 2 has created `packages/db/src/encrypt.ts` exporting `encrypt` / `decrypt`.
- Task 3 has created `apps/web/src/lib/stripe.ts` exporting `getConnectedStripe(accessToken: string)` that returns a configured `Stripe` instance.
- All schema tables are re-exported from `@dunlo-v2/db/schema/domain` and the `db` client is exported from `@dunlo-v2/db`.

If any of those are missing when this task runs, stop and request a fix to the relevant earlier task — do NOT inline workarounds here.

---

- [ ] **Step 1: Add new env vars**

Edit `packages/env/src/server.ts`:

```ts
import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    CORS_ORIGIN: z.url(),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

    APP_URL: z.url(),
    CRON_SECRET: z.string().min(16),
    SCHEDULER_INTERVAL_MINUTES: z.coerce.number().int().positive().default(5),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
```

Add corresponding entries to the root `.env` (use placeholders — user fills in real values):

```env
APP_URL=http://localhost:3001
CRON_SECRET=<openssl rand -hex 24>
SCHEDULER_INTERVAL_MINUTES=5
```

---

- [ ] **Step 2: Add runtime dependencies**

From the repo root:

```bash
cd apps/web && bun add resend marked
cd apps/web && bun add -d vitest @types/marked
```

Verify `apps/web/package.json` now contains `resend`, `marked`, and devDeps include `vitest`.

---

- [ ] **Step 3: Write template renderer tests (TDD — RED)**

Create `apps/web/src/lib/template.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { formatAmount, humanizeFailureCode, renderTemplate } from "./template";

describe("renderTemplate", () => {
  it("replaces simple variables", () => {
    expect(renderTemplate("Hello {{name}}", { name: "Mat" })).toBe("Hello Mat");
  });

  it("handles whitespace inside braces", () => {
    expect(renderTemplate("Hi {{ name }}!", { name: "Mat" })).toBe("Hi Mat!");
  });

  it("replaces multiple occurrences of the same variable", () => {
    expect(renderTemplate("{{a}} and {{a}}", { a: "x" })).toBe("x and x");
  });

  it("substitutes missing variables with empty string", () => {
    expect(renderTemplate("Hello {{name}}!", {})).toBe("Hello !");
  });

  it("substitutes undefined variables with empty string", () => {
    expect(renderTemplate("Hello {{name}}!", { name: undefined })).toBe("Hello !");
  });

  it("leaves text without placeholders unchanged", () => {
    expect(renderTemplate("plain text", { x: "y" })).toBe("plain text");
  });
});

describe("formatAmount", () => {
  it("formats EUR amounts", () => {
    expect(formatAmount(8900, "eur")).toMatch(/89[.,]00/);
    expect(formatAmount(8900, "eur")).toMatch(/€/);
  });

  it("formats USD amounts", () => {
    expect(formatAmount(12345, "usd")).toMatch(/123[.,]45/);
    expect(formatAmount(12345, "usd")).toMatch(/\$/);
  });

  it("handles zero", () => {
    expect(formatAmount(0, "eur")).toMatch(/0[.,]00/);
  });
});

describe("humanizeFailureCode", () => {
  it("maps known codes", () => {
    expect(humanizeFailureCode("expired_card")).toBe("Card expired");
    expect(humanizeFailureCode("card_declined")).toBe("Card declined");
    expect(humanizeFailureCode("insufficient_funds")).toBe("Insufficient funds");
    expect(humanizeFailureCode("do_not_honor")).toBe("Bank declined the payment");
  });

  it("falls back to Title Case for unknown codes", () => {
    expect(humanizeFailureCode("some_weird_code")).toBe("Some Weird Code");
    expect(humanizeFailureCode("foo")).toBe("Foo");
  });

  it("handles empty string", () => {
    expect(humanizeFailureCode("")).toBe("");
  });
});
```

---

- [ ] **Step 4: Run tests (expect FAIL — module not found)**

```bash
cd apps/web && bunx vitest run src/lib/template.test.ts
```

Expected: FAIL with "Cannot find module './template'" or equivalent. This confirms the RED step.

---

- [ ] **Step 5: Implement template renderer (TDD — GREEN)**

Create `apps/web/src/lib/template.ts`:

```ts
const KNOWN_FAILURE_CODES: Record<string, string> = {
  expired_card: "Card expired",
  card_declined: "Card declined",
  insufficient_funds: "Insufficient funds",
  do_not_honor: "Bank declined the payment",
};

export function renderTemplate(
  template: string,
  vars: Record<string, string | undefined>,
): string {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_match, key: string) => {
    const value = vars[key];
    return value ?? "";
  });
}

export function formatAmount(cents: number, currency: string): string {
  const code = (currency || "eur").toUpperCase();
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${code}`;
  }
}

export function humanizeFailureCode(code: string): string {
  if (!code) return "";
  if (KNOWN_FAILURE_CODES[code]) return KNOWN_FAILURE_CODES[code];
  return code
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
```

---

- [ ] **Step 6: Re-run tests (expect PASS)**

```bash
cd apps/web && bunx vitest run src/lib/template.test.ts
```

Expected: all tests pass (GREEN).

---

- [ ] **Step 7: Implement Resend wrapper**

Create `apps/web/src/lib/resend.ts`:

```ts
import { decrypt } from "@dunlo-v2/db/encrypt";
import { Resend } from "resend";

export type UserEmailProvider = {
  apiKey: string;
  fromEmail: string;
  fromName: string;
};

export function getUserResend(provider: { apiKey: string }): Resend {
  const decrypted = decrypt(provider.apiKey);
  return new Resend(decrypted);
}

export async function sendUserEmail(args: {
  provider: UserEmailProvider;
  to: string;
  subject: string;
  html: string;
}): Promise<string> {
  const { provider, to, subject, html } = args;
  const resend = getUserResend(provider);
  const result = await resend.emails.send({
    from: `${provider.fromName} <${provider.fromEmail}>`,
    to,
    subject,
    html,
  });

  if (result.error) {
    throw new Error(result.error.message ?? "Resend send failed");
  }
  if (!result.data?.id) {
    throw new Error("Resend returned no email id");
  }
  return result.data.id;
}
```

---

- [ ] **Step 8: Implement scheduler**

Create `apps/web/src/functions/scheduler.ts`:

```ts
import { db } from "@dunlo-v2/db";
import { decrypt } from "@dunlo-v2/db/encrypt";
import {
  emailProvider,
  failedPayment,
  recoveryAttempt,
  sequenceStep,
  stripeConnection,
} from "@dunlo-v2/db/schema/domain";
import { env } from "@dunlo-v2/env/server";
import { and, eq, lte } from "drizzle-orm";
import { marked } from "marked";
import { getConnectedStripe } from "@/lib/stripe";
import {
  formatAmount,
  humanizeFailureCode,
  renderTemplate,
} from "@/lib/template";
import { sendUserEmail } from "@/lib/resend";

type SchedulerResult = {
  processed: number;
  sent: number;
  failed: number;
};

const BATCH_SIZE = 50;

function markdownToHtml(md: string): string {
  try {
    return marked.parse(md, { async: false }) as string;
  } catch {
    return md
      .split(/\n{2,}/)
      .map((block) => {
        const withBold = block.replace(
          /\*\*([^*]+)\*\*/g,
          "<strong>$1</strong>",
        );
        return `<p>${withBold.replace(/\n/g, "<br/>")}</p>`;
      })
      .join("\n");
  }
}

export async function processScheduledEmails(): Promise<SchedulerResult> {
  const now = new Date();

  const rows = await db
    .select({
      attempt: recoveryAttempt,
      step: sequenceStep,
      payment: failedPayment,
    })
    .from(recoveryAttempt)
    .innerJoin(sequenceStep, eq(sequenceStep.id, recoveryAttempt.sequenceStepId))
    .innerJoin(
      failedPayment,
      eq(failedPayment.id, recoveryAttempt.failedPaymentId),
    )
    .where(
      and(
        eq(recoveryAttempt.status, "scheduled"),
        lte(recoveryAttempt.scheduledAt, now),
      ),
    )
    .limit(BATCH_SIZE);

  let processed = 0;
  let sent = 0;
  let failed = 0;

  for (const { attempt, step, payment } of rows) {
    processed += 1;

    if (payment.status === "recovered" || payment.status === "dismissed") {
      await db
        .update(recoveryAttempt)
        .set({ status: "failed", errorMessage: "payment_no_longer_active" })
        .where(eq(recoveryAttempt.id, attempt.id));
      continue;
    }

    const [provider] = await db
      .select()
      .from(emailProvider)
      .where(eq(emailProvider.userId, payment.userId))
      .limit(1);

    if (!provider) {
      await db
        .update(recoveryAttempt)
        .set({
          status: "failed",
          errorMessage: "no_email_provider_configured",
        })
        .where(eq(recoveryAttempt.id, attempt.id));
      failed += 1;
      continue;
    }

    const [connection] = await db
      .select()
      .from(stripeConnection)
      .where(eq(stripeConnection.userId, payment.userId))
      .limit(1);

    if (!connection) {
      await db
        .update(recoveryAttempt)
        .set({
          status: "failed",
          errorMessage: "no_stripe_connection",
        })
        .where(eq(recoveryAttempt.id, attempt.id));
      failed += 1;
      continue;
    }

    let updatePaymentUrl = "";
    try {
      const stripe = getConnectedStripe(decrypt(connection.accessToken));
      const portal = await stripe.billingPortal.sessions.create({
        customer: payment.stripeCustomerId,
        return_url: env.APP_URL,
      });
      updatePaymentUrl = portal.url;
    } catch (err) {
      console.warn(
        "[scheduler] billing portal unavailable for payment",
        payment.id,
        err instanceof Error ? err.message : err,
      );
      updatePaymentUrl = "";
    }

    const vars: Record<string, string | undefined> = {
      customer_name: payment.customerName ?? "there",
      amount: formatAmount(payment.amount, payment.currency),
      currency: (payment.currency ?? "eur").toUpperCase(),
      last_four: payment.lastFour ?? "",
      failure_reason: humanizeFailureCode(payment.failureCode ?? ""),
      product_name: payment.description ?? "your subscription",
      sender_name: provider.fromName,
      update_payment_url: updatePaymentUrl,
    };

    const subject = renderTemplate(step.subject, vars);
    const renderedBody = renderTemplate(step.body, vars);
    const html = markdownToHtml(renderedBody);

    try {
      const resendId = await sendUserEmail({
        provider: {
          apiKey: provider.apiKey,
          fromEmail: provider.fromEmail,
          fromName: provider.fromName,
        },
        to: payment.customerEmail,
        subject,
        html,
      });

      await db
        .update(recoveryAttempt)
        .set({
          status: "sent",
          sentAt: new Date(),
          resendEmailId: resendId,
        })
        .where(eq(recoveryAttempt.id, attempt.id));

      sent += 1;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await db
        .update(recoveryAttempt)
        .set({
          status: "failed",
          errorMessage: message.slice(0, 500),
        })
        .where(eq(recoveryAttempt.id, attempt.id));
      failed += 1;
    }
  }

  return { processed, sent, failed };
}
```

Note on Drizzle status comparisons: this uses string literals (`"scheduled"`, `"recovered"`, etc.) which works whether the column is a `pgEnum` or a `text` column. If Task 1 typed `recoveryAttempt.status` as a `pgEnum`, the literal values must match the enum members exactly.

---

- [ ] **Step 9: Implement cron API route**

Create `apps/web/src/routes/api/cron/process-emails.ts`:

```ts
import { createFileRoute } from "@tanstack/react-router";
import { env } from "@dunlo-v2/env/server";
import { processScheduledEmails } from "@/functions/scheduler";

function authorized(request: Request): boolean {
  const header = request.headers.get("authorization") ?? "";
  return header === `Bearer ${env.CRON_SECRET}`;
}

async function handle(request: Request): Promise<Response> {
  if (!authorized(request)) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const result = await processScheduledEmails();
    return new Response(JSON.stringify({ ok: true, ...result }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cron/process-emails] error", message);
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

export const Route = createFileRoute("/api/cron/process-emails")({
  server: {
    handlers: {
      GET: ({ request }) => handle(request),
      POST: ({ request }) => handle(request),
    },
  },
});
```

---

- [ ] **Step 10: Implement Nitro plugin**

Create `apps/web/server/plugins/email-scheduler.ts`:

```ts
import { defineNitroPlugin } from "nitropack/runtime";
import { env } from "@dunlo-v2/env/server";
import { processScheduledEmails } from "../../src/functions/scheduler";

export default defineNitroPlugin(() => {
  if (env.NODE_ENV === "test") {
    return;
  }

  const intervalMs = env.SCHEDULER_INTERVAL_MINUTES * 60 * 1000;

  const tick = async () => {
    try {
      const result = await processScheduledEmails();
      if (result.processed > 0) {
        console.log(
          `[email-scheduler] processed=${result.processed} sent=${result.sent} failed=${result.failed}`,
        );
      }
    } catch (err) {
      console.error(
        "[email-scheduler] tick failed:",
        err instanceof Error ? err.message : err,
      );
    }
  };

  const timer = setInterval(tick, intervalMs);
  if (typeof (timer as { unref?: () => void }).unref === "function") {
    (timer as { unref: () => void }).unref();
  }

  console.log(
    `[email-scheduler] started; interval=${env.SCHEDULER_INTERVAL_MINUTES}min`,
  );
});
```

---

- [ ] **Step 11: Register Nitro plugin in Vite config**

TanStack Start auto-discovers `server/plugins/*.ts` when the `srcDir` aligns, but registering explicitly is the safer convention. Edit `apps/web/vite.config.ts`:

```ts
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 3001,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      nitro: {
        plugins: ["./server/plugins/email-scheduler.ts"],
      },
    }),
    viteReact(),
  ],
});
```

If `tanstackStart()` rejects the `nitro` option at this version (TanStack Start's Nitro pass-through has shifted between versions), fall back to the default auto-discovery: drop the option, keep the file at `apps/web/server/plugins/email-scheduler.ts`, and verify it boots by looking for the `[email-scheduler] started` log line on `bun run dev:web`. If neither works, an alternative is wiring the interval inside the cron route module itself (module-load side effect) — but that runs once per Nitro worker, so prefer fixing the Nitro plugin path first.

---

- [ ] **Step 12: Type-check the web app**

```bash
bun run check-types
```

Expected: clean (no new errors). Resolve any type mismatches against the schema types from Task 1 before proceeding (most likely culprits: enum value typing on `recoveryAttempt.status` or column nullability of `payment.customerName` / `payment.description`).

---

- [ ] **Step 13: Manual verification — cron route auth**

Start the dev server in a separate shell:

```bash
bun run dev:web
```

In another shell, hit the route without auth and confirm 401:

```bash
curl -i http://localhost:3001/api/cron/process-emails
```

Expected: `HTTP/1.1 401` with body `{"error":"unauthorized"}`.

Then with the secret:

```bash
curl -i -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3001/api/cron/process-emails
```

Expected: `HTTP/1.1 200` with body `{"ok":true,"processed":0,"sent":0,"failed":0}` (assuming no scheduled attempts exist yet).

---

- [ ] **Step 14: Manual verification — end-to-end send**

Pre-req: at least one user has `emailProvider` + `stripeConnection` rows configured with valid (encrypted) credentials, and at least one `recoveryAttempt` exists with `status = "scheduled"` and `scheduledAt <= now()` pointing at a real `failedPayment` and `sequenceStep`.

Quickest way to seed for verification: insert a row by hand via `bun run db:studio`, copying an existing `sequenceStep.id` and using a real `failedPayment.id` whose `customerEmail` is your own inbox.

Then trigger:

```bash
curl -i -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3001/api/cron/process-emails
```

Expected:
- Response shows `"sent":1` (or `"failed":1` with a clear error in the row's `errorMessage`).
- The `recoveryAttempt` row's `status` is now `"sent"`, `sentAt` is populated, `resendEmailId` matches Resend's dashboard entry.
- The test inbox receives the rendered email with `{{customer_name}}`, `{{amount}}`, and `{{update_payment_url}}` properly substituted.

---

- [ ] **Step 15: Manual verification — Nitro plugin boots**

Restart `bun run dev:web` and confirm the boot log includes:

```
[email-scheduler] started; interval=5min
```

Wait until the first tick fires (or temporarily set `SCHEDULER_INTERVAL_MINUTES=1`) and confirm a `[email-scheduler] processed=...` log appears. Reset `SCHEDULER_INTERVAL_MINUTES` back to `5` afterwards.

If the boot line does not appear, revisit Step 11 — try removing the explicit `nitro.plugins` option to fall back on auto-discovery, then restart and retry.

---

- [ ] **Step 16: Commit**

```bash
git add apps/web/src/lib/template.ts \
        apps/web/src/lib/template.test.ts \
        apps/web/src/lib/resend.ts \
        apps/web/src/functions/scheduler.ts \
        apps/web/src/routes/api/cron/process-emails.ts \
        apps/web/server/plugins/email-scheduler.ts \
        apps/web/vite.config.ts \
        apps/web/package.json \
        packages/env/src/server.ts \
        bun.lock
```

```bash
git commit -m "$(cat <<'EOF'
feat(email): add recovery email scheduler, template renderer, and Nitro tick

Adds the email engine that consumes scheduled recoveryAttempt rows: a
template renderer with format/humanize helpers, a per-user Resend wrapper,
a scheduler function that renders + sends + marks status, a Bearer-secured
cron API route, and a Nitro background plugin that ticks every
SCHEDULER_INTERVAL_MINUTES.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```
## Task 5: Dashboard real data + Payments list

**Files:**
- Create: `apps/web/src/functions/payments.ts`
- Modify: `apps/web/src/routes/dashboard.tsx`
- Create: `apps/web/src/routes/payments.tsx`

**Hard constraint:** the existing visual design of `dashboard.tsx` is LOCKED. We only swap mock arrays for real DB data — no Tailwind class, layout, or copy change beyond data labels. All brand greens must stay as `bg-dunlo` / `text-dunlo-deep` / `border-dunlo/25` / `bg-dunlo/8` tokens. Never hardcode hex.

This task depends on Task 1 (domain schema: `failedPayment`, `escalation`, `stripeConnection`) and Task 2 (lib helpers: `formatAmount`, `humanizeFailureCode` from `@/lib/template`). If those helpers don't exist yet when this task runs, inline minimal versions and TODO-link them.

---

- [ ] **Step 1: Create payments server functions**

Create `apps/web/src/functions/payments.ts`:

```ts
import { createServerFn } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";
import { db } from "@dunlo-v2/db";
import {
  failedPayment,
  escalation,
  stripeConnection,
} from "@dunlo-v2/db/schema/domain";
import { and, desc, eq, gte } from "drizzle-orm";
import { z } from "zod";

import { authMiddleware } from "@/middleware/auth";
import { formatAmount, humanizeFailureCode } from "@/lib/template";

type PaymentStatus =
  | "in_recovery"
  | "recovered"
  | "escalated"
  | "failed"
  | "dismissed";

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function relativeTime(from: Date, now: Date = new Date()): string {
  const diffMs = now.getTime() - from.getTime();
  const sec = Math.max(0, Math.floor(diffMs / 1000));
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} day${day === 1 ? "" : "s"} ago`;
  const month = Math.floor(day / 30);
  if (month < 12) return `${month} month${month === 1 ? "" : "s"} ago`;
  const year = Math.floor(day / 365);
  return `${year} year${year === 1 ? "" : "s"} ago`;
}

function customerDisplayName(row: {
  customerName: string | null;
  customerEmail: string;
}): string {
  if (row.customerName && row.customerName.trim().length > 0) {
    return row.customerName;
  }
  const prefix = row.customerEmail.split("@")[0] ?? row.customerEmail;
  return prefix;
}

export const getDashboardData = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (!context.session) {
      throw redirect({ to: "/login" });
    }
    const userId = context.session.user.id;

    const [connection] = await db
      .select()
      .from(stripeConnection)
      .where(eq(stripeConnection.userId, userId))
      .limit(1);

    const currency = connection?.escalationCurrency ?? "eur";
    const stripeConnected = Boolean(connection);

    const monthStart = startOfMonth(new Date());

    const monthRows = await db
      .select()
      .from(failedPayment)
      .where(
        and(
          eq(failedPayment.userId, userId),
          gte(failedPayment.createdAt, monthStart),
        ),
      );

    const allInRecoveryRows = await db
      .select()
      .from(failedPayment)
      .where(
        and(
          eq(failedPayment.userId, userId),
          eq(failedPayment.status, "in_recovery"),
        ),
      );

    const recoveredAmount = monthRows
      .filter((p) => p.status === "recovered")
      .reduce((acc, p) => acc + p.amount, 0);

    const inRecoveryCount = allInRecoveryRows.length;

    const successDenominatorRows = monthRows.filter((p) =>
      ["recovered", "failed", "dismissed"].includes(p.status),
    );
    const recoveredCountThisMonth = monthRows.filter(
      (p) => p.status === "recovered",
    ).length;
    const successRate =
      successDenominatorRows.length > 0
        ? (recoveredCountThisMonth / successDenominatorRows.length) * 100
        : 0;

    const mrrAtRisk = allInRecoveryRows.reduce((acc, p) => acc + p.amount, 0);

    const recentRows = await db
      .select()
      .from(failedPayment)
      .where(eq(failedPayment.userId, userId))
      .orderBy(desc(failedPayment.createdAt))
      .limit(20);

    const now = new Date();
    const recentPayments = recentRows.map((row) => ({
      id: row.id,
      name: customerDisplayName(row),
      email: row.customerEmail,
      amount: formatAmount(row.amount, row.currency),
      currency: row.currency,
      status: row.status as PaymentStatus,
      type: humanizeFailureCode(row.failureCode),
      time: relativeTime(row.createdAt, now),
    }));

    const pendingEscalationRows = await db
      .select()
      .from(escalation)
      .where(
        and(eq(escalation.userId, userId), eq(escalation.status, "pending")),
      );

    return {
      stripeConnected,
      stats: {
        recoveredAmount,
        inRecoveryCount,
        successRate,
        mrrAtRisk,
      },
      recentPayments,
      pendingEscalations: pendingEscalationRows.length,
      currency,
    };
  });

const PAYMENT_STATUSES = [
  "in_recovery",
  "recovered",
  "escalated",
  "failed",
  "dismissed",
] as const;

const getPaymentsInput = z.object({
  status: z.enum(PAYMENT_STATUSES).optional(),
  limit: z.number().int().min(1).max(200).default(50),
  offset: z.number().int().min(0).default(0),
});

export const getPayments = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((raw: unknown) => getPaymentsInput.parse(raw))
  .handler(async ({ context, data }) => {
    if (!context.session) {
      throw redirect({ to: "/login" });
    }
    const userId = context.session.user.id;
    const { status, limit, offset } = data;

    const whereClause = status
      ? and(eq(failedPayment.userId, userId), eq(failedPayment.status, status))
      : eq(failedPayment.userId, userId);

    const rows = await db
      .select()
      .from(failedPayment)
      .where(whereClause)
      .orderBy(desc(failedPayment.createdAt))
      .limit(limit + 1)
      .offset(offset);

    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;

    const now = new Date();
    const payments = pageRows.map((row) => ({
      id: row.id,
      name: customerDisplayName(row),
      email: row.customerEmail,
      amount: formatAmount(row.amount, row.currency),
      amountCents: row.amount,
      currency: row.currency,
      status: row.status as PaymentStatus,
      type: humanizeFailureCode(row.failureCode),
      time: relativeTime(row.createdAt, now),
      createdAt: row.createdAt.toISOString(),
    }));

    return {
      payments,
      hasMore,
      limit,
      offset,
    };
  });
```

Notes:
- Imports `formatAmount` and `humanizeFailureCode` from `@/lib/template` (created in Task 2). If Task 2 hasn't landed yet at this point, stub them in `@/lib/template` first.
- Aggregates in JS via `.reduce()` / `.filter()` — fine at expected scale (single-user volumes).
- `stripeConnection.escalationCurrency` defaults to `"eur"` in the schema, but we still fall back to `"eur"` if no connection row exists.
- `recentPayments` returns top 20 across all time, not just the current month — matches existing "Payments in recovery" widget intent.

---

- [ ] **Step 2: Update dashboard.tsx to use real data**

Overwrite `apps/web/src/routes/dashboard.tsx`. Every Tailwind class from the original is preserved; only the data source, the conditional banner, and the conditional pill change. The "Connect Stripe" button becomes a real `<a>`, and the table gets `failed` / `dismissed` neutral status styles plus an empty-state row.

```tsx
import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle,
  ChevronRight,
  DollarSign,
  LayoutDashboard,
  LogOut,
  Settings,
  TrendingUp,
  Zap,
  Bell,
  ExternalLink,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { getUser } from "@/functions/get-user";
import { getDashboardData } from "@/functions/payments";
import { formatAmount } from "@/lib/template";
import { Logo } from "@/components/logo";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Dashboard — Dunlo" },
    ],
  }),
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await getUser();
    return { session };
  },
  loader: async ({ context }) => {
    if (!context.session) {
      throw redirect({ to: "/login" });
    }
    const data = await getDashboardData();
    return data;
  },
});

const STATUS_STYLE: Record<string, string> = {
  recovered: "bg-dunlo/8 text-dunlo-deep border-dunlo/25",
  in_recovery: "bg-amber-50 text-amber-700 border-amber-200",
  escalated: "bg-red-50 text-red-700 border-red-200",
  pending: "bg-gray-100 text-gray-600 border-gray-200",
  failed: "bg-gray-100 text-gray-600 border-gray-200",
  dismissed: "bg-gray-100 text-gray-600 border-gray-200",
};

const STATUS_LABEL: Record<string, string> = {
  recovered: "recovered",
  in_recovery: "in recovery",
  escalated: "escalated",
  pending: "pending",
  failed: "failed",
  dismissed: "dismissed",
};

function RouteComponent() {
  const { session } = Route.useRouteContext();
  const loaderData = Route.useLoaderData();
  const navigate = Route.useNavigate();

  const handleSignOut = () => {
    authClient.signOut({
      fetchOptions: { onSuccess: () => navigate({ to: "/" }) },
    });
  };

  const { stripeConnected, stats: s, recentPayments, currency } = loaderData;

  const stats = [
    {
      label: "Recovered this month",
      value: formatAmount(s.recoveredAmount, currency),
      delta: stripeConnected ? "Current month" : "Connect Stripe to track",
      icon: TrendingUp,
      positive: s.recoveredAmount > 0 ? true : null,
    },
    {
      label: "Failed payments",
      value: String(s.inRecoveryCount),
      delta: `${s.inRecoveryCount} in recovery`,
      icon: AlertCircle,
      positive: null,
    },
    {
      label: "Recovery rate",
      value: `${s.successRate.toFixed(1)}%`,
      delta: "Current month",
      icon: CheckCircle,
      positive: s.successRate > 0 ? true : null,
    },
    {
      label: "MRR at risk",
      value: formatAmount(s.mrrAtRisk, currency),
      delta: `${s.inRecoveryCount} account${s.inRecoveryCount === 1 ? "" : "s"}`,
      icon: DollarSign,
      positive: s.mrrAtRisk > 0 ? false : null,
    },
  ];

  return (
    <div className="flex min-h-dvh bg-[#f7f8fa] font-sans">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-gray-100 bg-white lg:flex">
        <div className="flex items-center border-b border-gray-100 px-5 py-4">
          <Logo size={26} />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {[
            { icon: LayoutDashboard, label: "Overview", active: true },
            { icon: Zap, label: "Recovery sequences", active: false },
            { icon: AlertCircle, label: "Escalations", active: false },
            { icon: Bell, label: "Alerts", active: false },
            { icon: Settings, label: "Settings", active: false },
          ].map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>

        <div className="border-t border-gray-100 p-4">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-700">
              {session?.user.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">
                {session?.user.name}
              </p>
              <p className="truncate text-xs text-gray-400">
                {session?.user.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-xs text-gray-400 transition-colors hover:text-gray-700"
          >
            <LogOut size={12} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-100 bg-white/80 px-6 py-4 backdrop-blur-md">
          <div>
            <h1 className="text-base font-bold text-gray-900">Overview</h1>
            <p className="text-xs text-gray-400">
              Welcome back, {session?.user.name?.split(" ")[0]}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-dunlo/25 bg-dunlo/8 px-3 py-1.5">
              <span className="size-1.5 animate-pulse rounded-full bg-dunlo" />
              <span className="text-[11px] font-semibold text-dunlo-deep">
                {stripeConnected
                  ? "Beta · Stripe connected"
                  : "Beta · Stripe not connected"}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Stripe CTA — only when not connected */}
          {!stripeConnected && (
            <div className="flex items-center justify-between rounded-2xl border border-dunlo/25 bg-dunlo/8 p-5">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Connect Stripe to start recovering payments
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  Takes 2 minutes. OAuth, no code required.
                </p>
              </div>
              <a
                href="/api/stripe/connect"
                className="flex shrink-0 items-center gap-2 rounded-full bg-dunlo px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-dunlo-hover active:scale-[0.97]"
              >
                Connect Stripe
                <ExternalLink size={13} />
              </a>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(({ label, value, delta, icon: Icon, positive }) => (
              <div
                key={label}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <p className="text-xs font-medium text-gray-400">{label}</p>
                  <div className="rounded-xl bg-gray-50 p-1.5">
                    <Icon size={14} className="text-gray-400" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
                <p
                  className={`mt-1 text-xs font-semibold ${
                    positive === true
                      ? "text-dunlo-dim"
                      : positive === false
                        ? "text-red-500"
                        : "text-gray-400"
                  }`}
                >
                  {delta}
                </p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-900">
                Payments in recovery
              </h2>
              <a
                href="/payments"
                className="flex items-center gap-1 text-xs font-medium text-dunlo-dim hover:underline"
              >
                View all <ChevronRight size={13} />
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50">
                    {[
                      "Customer",
                      "Failure type",
                      "Amount",
                      "Status",
                      "Time",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentPayments.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-10 text-center text-xs text-gray-400"
                      >
                        No failed payments yet — your dashboard will populate
                        when a payment fails.
                      </td>
                    </tr>
                  ) : (
                    recentPayments.map((p) => (
                      <tr
                        key={p.id}
                        className="transition-colors hover:bg-gray-50/50"
                      >
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-gray-900">
                            {p.name}
                          </p>
                          <p className="text-xs text-gray-400">{p.email}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-gray-600">
                            {p.type}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-mono text-sm font-semibold text-gray-900">
                            {p.amount}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${STATUS_STYLE[p.status] ?? STATUS_STYLE.pending}`}
                          >
                            {STATUS_LABEL[p.status] ?? p.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs text-gray-400">
                            {p.time}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                title: "Edit recovery sequences",
                desc: "Customize emails per failure type",
                cta: "Open editor",
              },
              {
                title: "Set escalation threshold",
                desc: "Get alerted for high-value accounts",
                cta: "Configure",
              },
              {
                title: "View analytics",
                desc: "Track recovery rate trends over time",
                cta: "View report",
              },
            ].map((a) => (
              <div
                key={a.title}
                className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <p className="text-sm font-semibold text-gray-900">{a.title}</p>
                <p className="mt-1 text-xs text-gray-400">{a.desc}</p>
                <button className="mt-4 flex items-center gap-1 text-xs font-semibold text-dunlo-dim transition-all group-hover:gap-2">
                  {a.cta}
                  <ChevronRight size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
```

Design-preservation diff summary (what changed vs. the original):
- `loader` now returns `await getDashboardData()` instead of `undefined`.
- New import: `getDashboardData`, `formatAmount`.
- `STATUS_STYLE` keeps `recovered`, `escalated`, `pending`, renames `recovering` semantics to `in_recovery` (DB key), and adds `failed` + `dismissed` as neutral gray. All classes use existing tokens.
- New `STATUS_LABEL` map turns `in_recovery` into `"in recovery"` for display.
- The pill in the top bar conditionally shows "Beta · Stripe connected" vs "Beta · Stripe not connected". Same wrapper classes, same dot, same colors.
- The Stripe-connect banner is wrapped in `{!stripeConnected && (...)}` — unchanged styling.
- Connect Stripe `<button>` becomes `<a href="/api/stripe/connect">` — same classes.
- "View all" `<button>` becomes `<a href="/payments">` — same classes.
- Table now maps over `recentPayments`. Empty state is a single `<tr>` with `colSpan={5}` + small gray copy.
- No hex values, no new colors, no spacing changes.

---

- [ ] **Step 3: Create payments.tsx**

Create `apps/web/src/routes/payments.tsx`. The sidebar is duplicated inline (per task instructions — no layout component). Sidebar matches the dashboard verbatim; only the `active` flag moves from `Overview` to `Payments` (which means adding a `Payments` entry that maps to this route).

```tsx
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  AlertCircle,
  Bell,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Settings,
  Zap,
  Receipt,
} from "lucide-react";
import { z } from "zod";

import { authClient } from "@/lib/auth-client";
import { getUser } from "@/functions/get-user";
import { getPayments } from "@/functions/payments";
import { Logo } from "@/components/logo";

const PAGE_SIZE = 50;

const STATUS_VALUES = [
  "in_recovery",
  "recovered",
  "escalated",
  "failed",
  "dismissed",
] as const;
type StatusFilter = (typeof STATUS_VALUES)[number];

const searchSchema = z.object({
  status: z.enum(STATUS_VALUES).optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
});

const STATUS_STYLE: Record<string, string> = {
  recovered: "bg-dunlo/8 text-dunlo-deep border-dunlo/25",
  in_recovery: "bg-amber-50 text-amber-700 border-amber-200",
  escalated: "bg-red-50 text-red-700 border-red-200",
  pending: "bg-gray-100 text-gray-600 border-gray-200",
  failed: "bg-gray-100 text-gray-600 border-gray-200",
  dismissed: "bg-gray-100 text-gray-600 border-gray-200",
};

const STATUS_LABEL: Record<string, string> = {
  recovered: "recovered",
  in_recovery: "in recovery",
  escalated: "escalated",
  pending: "pending",
  failed: "failed",
  dismissed: "dismissed",
};

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Payments — Dunlo" },
    ],
  }),
  validateSearch: searchSchema,
  beforeLoad: async () => {
    const session = await getUser();
    return { session };
  },
  loaderDeps: ({ search }) => ({
    status: search.status,
    page: search.page ?? 1,
  }),
  loader: async ({ context, deps }) => {
    if (!context.session) {
      throw redirect({ to: "/login" });
    }
    const offset = ((deps.page ?? 1) - 1) * PAGE_SIZE;
    const data = await getPayments({
      data: {
        status: deps.status,
        limit: PAGE_SIZE,
        offset,
      },
    });
    return data;
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { session } = Route.useRouteContext();
  const { status, page } = Route.useSearch();
  const { payments, hasMore } = Route.useLoaderData();
  const navigate = Route.useNavigate();

  const currentPage = page ?? 1;

  const handleSignOut = () => {
    authClient.signOut({
      fetchOptions: { onSuccess: () => navigate({ to: "/" }) },
    });
  };

  const handleStatusChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const value = e.target.value;
    navigate({
      to: "/payments",
      search: {
        status: value === "all" ? undefined : (value as StatusFilter),
        page: 1,
      },
    });
  };

  const goToPage = (next: number) => {
    navigate({
      to: "/payments",
      search: { status, page: next },
    });
  };

  return (
    <div className="flex min-h-dvh bg-[#f7f8fa] font-sans">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-gray-100 bg-white lg:flex">
        <div className="flex items-center border-b border-gray-100 px-5 py-4">
          <Logo size={26} />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {[
            {
              icon: LayoutDashboard,
              label: "Overview",
              active: false,
              to: "/dashboard" as const,
            },
            {
              icon: Receipt,
              label: "Payments",
              active: true,
              to: "/payments" as const,
            },
            {
              icon: Zap,
              label: "Recovery sequences",
              active: false,
              to: null,
            },
            {
              icon: AlertCircle,
              label: "Escalations",
              active: false,
              to: null,
            },
            { icon: Bell, label: "Alerts", active: false, to: null },
            { icon: Settings, label: "Settings", active: false, to: null },
          ].map(({ icon: Icon, label, active, to }) => {
            const className = `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
              active
                ? "bg-gray-100 text-gray-900"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            }`;
            if (to) {
              return (
                <Link key={label} to={to} className={className}>
                  <Icon size={15} />
                  {label}
                </Link>
              );
            }
            return (
              <button key={label} className={className}>
                <Icon size={15} />
                {label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-gray-100 p-4">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-700">
              {session?.user.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">
                {session?.user.name}
              </p>
              <p className="truncate text-xs text-gray-400">
                {session?.user.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-xs text-gray-400 transition-colors hover:text-gray-700"
          >
            <LogOut size={12} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-100 bg-white/80 px-6 py-4 backdrop-blur-md">
          <div>
            <h1 className="text-base font-bold text-gray-900">Payments</h1>
            <p className="text-xs text-gray-400">All failed payments</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={status ?? "all"}
              onChange={handleStatusChange}
              className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-gray-700 focus:border-dunlo/40 focus:outline-none"
            >
              <option value="all">All statuses</option>
              <option value="in_recovery">In recovery</option>
              <option value="recovered">Recovered</option>
              <option value="escalated">Escalated</option>
              <option value="failed">Failed</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-900">
                {status
                  ? `${STATUS_LABEL[status] ?? status} payments`
                  : "All payments"}
              </h2>
              <span className="text-xs text-gray-400">
                Page {currentPage}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50">
                    {[
                      "Customer",
                      "Failure type",
                      "Amount",
                      "Status",
                      "Created",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {payments.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-10 text-center text-xs text-gray-400"
                      >
                        No payments to show.
                      </td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr
                        key={p.id}
                        className="transition-colors hover:bg-gray-50/50"
                      >
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-gray-900">
                            {p.name}
                          </p>
                          <p className="text-xs text-gray-400">{p.email}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-gray-600">
                            {p.type}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-mono text-sm font-semibold text-gray-900">
                            {p.amount}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${STATUS_STYLE[p.status] ?? STATUS_STYLE.pending}`}
                          >
                            {STATUS_LABEL[p.status] ?? p.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs text-gray-400">
                            {p.time}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
              <button
                onClick={() => goToPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={13} />
                Previous
              </button>
              <span className="text-xs text-gray-400">
                Showing {payments.length} result
                {payments.length === 1 ? "" : "s"}
              </span>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={!hasMore}
                className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
```

Notes:
- Status filter uses TanStack Router's `validateSearch` so `?status=...&page=...` is type-safe.
- Pagination uses `limit + 1` peek pattern (see `getPayments`) so we know `hasMore` without a `COUNT(*)`.
- Sidebar duplicated from `dashboard.tsx` verbatim, with two changes: (1) "Overview" is no longer active, (2) a new "Payments" entry with `active: true` is inserted, using `Receipt` icon (already in `lucide-react`). Both "Overview" and "Payments" are real `<Link>` nodes — non-implemented routes remain `<button>` placeholders, matching dashboard behavior.
- All Tailwind tokens identical to dashboard. No hex values.
- Select uses `focus:border-dunlo/40` — using the brand token, not a hex.

---

- [ ] **Step 4: Type check**

Run from repo root:

```bash
bun run check-types
```

Expected: no new TypeScript errors. If `@/lib/template` is missing because Task 2 hasn't landed, you'll see import errors — implement `formatAmount` and `humanizeFailureCode` stubs in `apps/web/src/lib/template.ts` first.

---

- [ ] **Step 5: Manual verification**

- [ ] Run `bun run dev:web` and sign in with a test user.
- [ ] Visit `/dashboard`. With no `stripeConnection` row: confirm the pill reads "Beta · Stripe not connected", the green Connect Stripe banner is visible, the Connect Stripe button is an `<a>` pointing at `/api/stripe/connect`.
- [ ] Stats cards should render zeros / 0.0% / no-account copy. Table should show the empty-state row "No failed payments yet…".
- [ ] Insert a `stripeConnection` row via Drizzle Studio (`bun run db:studio`) for the signed-in user. Refresh `/dashboard`. The pill flips to "Beta · Stripe connected" and the banner disappears.
- [ ] Insert 3 `failedPayment` rows for the user: one `status="recovered"` (current month, amount 8900), one `status="in_recovery"` (amount 23400), one `status="escalated"` (amount 41500). Refresh and confirm: Recovered = €89.00, Failed payments count includes in_recovery, Recovery rate = 100.0% (1 recovered / 1 in denominator), MRR at risk = €234.00. Table shows 3 rows with correct customer / amount / status pills.
- [ ] Visit `/payments`. Sidebar highlights "Payments". Top bar shows "Payments / All failed payments". Table lists all 3 rows.
- [ ] Change the status select to "Recovered". URL updates to `?status=recovered`. Only the recovered row is visible.
- [ ] Change to "Escalated". Only the escalated row is visible. Pill color is red-tinted.
- [ ] Insert >50 rows (script or repeated inserts), then test pagination: Next moves to page 2, Previous returns. Disabled state on edge pages.
- [ ] Visit `/payments` while signed out — should redirect to `/login`.
- [ ] Sign out from `/payments` sidebar — should land on `/`.

---

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/functions/payments.ts apps/web/src/routes/dashboard.tsx apps/web/src/routes/payments.tsx
git commit -m "feat(dashboard): wire real data + add /payments list route

- getDashboardData server fn returns stats, recent payments, escalations, stripe connection state
- getPayments server fn with status filter + offset pagination
- dashboard.tsx swaps mocks for real DB data, conditional Stripe banner, conditional connected pill, real /api/stripe/connect link
- new /payments route with status filter, pagination, and shared sidebar
- design tokens preserved verbatim (bg-dunlo, text-dunlo-deep, border-dunlo/25)"
```
## Task 6: Sequence editor + Settings + Stripe disconnect

**Goal:** Give users full control over their recovery flow. Build server functions for sequences, email provider config, and escalations; surface them in two new authenticated pages (`/sequences`, `/settings`) that exactly match the existing dashboard's sidebar + card visual language; and add a `POST /api/stripe/disconnect` endpoint that best-effort removes the Stripe webhook and deletes the connection row (keeping recovery sequences intact for reconnect).

**Prerequisites (assumed from prior tasks):**
- Task 1 added env vars (`ENCRYPTION_KEY`, `RESEND_API_KEY`, `STRIPE_SECRET_KEY`, `APP_URL`) to `packages/env/src/server.ts`.
- Task 2 created `packages/db/src/encrypt.ts` (`encrypt` / `decrypt`) and `packages/db/src/schema/domain.ts` exporting `stripeConnection`, `emailProvider`, `failedPayment`, `recoverySequence`, `sequenceStep`, `recoveryAttempt`, `escalation`. The PK strategy uses `crypto.randomUUID()` via `$defaultFn` (so manual id assignment is unnecessary but harmless).
- Task 3 created `apps/web/src/lib/stripe.ts` (`getConnectedStripe`) and `apps/web/src/functions/stripe.ts` exporting `getStripeConnection(userId)` and `seedDefaultSequences(userId)`.
- Task 4 created `apps/web/src/lib/resend.ts` exporting a Resend client factory `getResendClient(apiKey: string)`.
- `authMiddleware` lives at `apps/web/src/middleware/auth.ts` and returns `{ session: { user: { id, email, name }, ... } | null }` on `context.session`.
- `Logo` lives at `apps/web/src/components/logo.tsx`.

If any of those are missing when this task runs, stop and fix the relevant earlier task — do NOT inline workarounds here.

**Files:**
- Create: `apps/web/src/functions/sequences.ts`
- Create: `apps/web/src/functions/email-provider.ts`
- Create: `apps/web/src/functions/escalations.ts`
- Create: `apps/web/src/routes/sequences.tsx`
- Create: `apps/web/src/routes/settings.tsx`
- Create: `apps/web/src/routes/api/stripe/disconnect.ts`

---

- [ ] **Step 1: Create sequence server functions**

Create `apps/web/src/functions/sequences.ts`:

```ts
import { db } from "@dunlo-v2/db";
import {
  recoverySequence,
  sequenceStep,
} from "@dunlo-v2/db/schema/domain";
import { createServerFn } from "@tanstack/react-start";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";

import { authMiddleware } from "@/middleware/auth";
import { seedDefaultSequences } from "@/functions/stripe";

export type SequenceWithSteps = {
  id: string;
  failureCode: string;
  name: string;
  isActive: boolean;
  steps: Array<{
    id: string;
    stepNumber: number;
    delayHours: number;
    subject: string;
    body: string;
  }>;
};

export const getSequences = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<SequenceWithSteps[]> => {
    if (!context.session?.user) {
      throw new Error("Unauthorized");
    }
    const userId = context.session.user.id;

    const sequences = await db
      .select()
      .from(recoverySequence)
      .where(eq(recoverySequence.userId, userId))
      .orderBy(asc(recoverySequence.failureCode));

    if (sequences.length === 0) return [];

    const steps = await db
      .select()
      .from(sequenceStep)
      .innerJoin(
        recoverySequence,
        eq(sequenceStep.sequenceId, recoverySequence.id),
      )
      .where(eq(recoverySequence.userId, userId))
      .orderBy(asc(sequenceStep.stepNumber));

    return sequences.map((seq) => ({
      id: seq.id,
      failureCode: seq.failureCode,
      name: seq.name,
      isActive: seq.isActive,
      steps: steps
        .filter((row) => row.sequence_step.sequenceId === seq.id)
        .map((row) => ({
          id: row.sequence_step.id,
          stepNumber: row.sequence_step.stepNumber,
          delayHours: row.sequence_step.delayHours,
          subject: row.sequence_step.subject,
          body: row.sequence_step.body,
        })),
    }));
  });

const updateStepSchema = z.object({
  stepId: z.string().min(1),
  subject: z.string().min(1).max(500).optional(),
  body: z.string().min(1).max(10000).optional(),
  delayHours: z.number().int().min(0).max(24 * 30).optional(),
});

export const updateSequenceStep = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => updateStepSchema.parse(input))
  .handler(async ({ context, data }) => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    const [owned] = await db
      .select({ id: sequenceStep.id })
      .from(sequenceStep)
      .innerJoin(
        recoverySequence,
        eq(sequenceStep.sequenceId, recoverySequence.id),
      )
      .where(
        and(
          eq(sequenceStep.id, data.stepId),
          eq(recoverySequence.userId, userId),
        ),
      )
      .limit(1);

    if (!owned) throw new Error("Step not found");

    const patch: Record<string, unknown> = { updatedAt: new Date() };
    if (data.subject !== undefined) patch.subject = data.subject;
    if (data.body !== undefined) patch.body = data.body;
    if (data.delayHours !== undefined) patch.delayHours = data.delayHours;

    await db
      .update(sequenceStep)
      .set(patch)
      .where(eq(sequenceStep.id, data.stepId));

    return { ok: true };
  });

const toggleSchema = z.object({
  sequenceId: z.string().min(1),
  isActive: z.boolean(),
});

export const toggleSequence = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => toggleSchema.parse(input))
  .handler(async ({ context, data }) => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    const [owned] = await db
      .select({ id: recoverySequence.id })
      .from(recoverySequence)
      .where(
        and(
          eq(recoverySequence.id, data.sequenceId),
          eq(recoverySequence.userId, userId),
        ),
      )
      .limit(1);

    if (!owned) throw new Error("Sequence not found");

    await db
      .update(recoverySequence)
      .set({ isActive: data.isActive, updatedAt: new Date() })
      .where(eq(recoverySequence.id, data.sequenceId));

    return { ok: true };
  });

const addStepSchema = z.object({
  sequenceId: z.string().min(1),
  stepNumber: z.number().int().min(1).max(20),
  subject: z.string().min(1).max(500),
  body: z.string().min(1).max(10000),
  delayHours: z.number().int().min(0).max(24 * 30),
});

export const addSequenceStep = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => addStepSchema.parse(input))
  .handler(async ({ context, data }) => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    const [owned] = await db
      .select({ id: recoverySequence.id })
      .from(recoverySequence)
      .where(
        and(
          eq(recoverySequence.id, data.sequenceId),
          eq(recoverySequence.userId, userId),
        ),
      )
      .limit(1);

    if (!owned) throw new Error("Sequence not found");

    const id = crypto.randomUUID();
    await db.insert(sequenceStep).values({
      id,
      sequenceId: data.sequenceId,
      stepNumber: data.stepNumber,
      subject: data.subject,
      body: data.body,
      delayHours: data.delayHours,
    });

    return { id };
  });

const deleteStepSchema = z.object({ stepId: z.string().min(1) });

export const deleteSequenceStep = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => deleteStepSchema.parse(input))
  .handler(async ({ context, data }) => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    const [owned] = await db
      .select({ id: sequenceStep.id })
      .from(sequenceStep)
      .innerJoin(
        recoverySequence,
        eq(sequenceStep.sequenceId, recoverySequence.id),
      )
      .where(
        and(
          eq(sequenceStep.id, data.stepId),
          eq(recoverySequence.userId, userId),
        ),
      )
      .limit(1);

    if (!owned) throw new Error("Step not found");

    await db.delete(sequenceStep).where(eq(sequenceStep.id, data.stepId));

    return { ok: true };
  });

export const resetSequencesToDefault = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    await db
      .delete(recoverySequence)
      .where(eq(recoverySequence.userId, userId));

    await seedDefaultSequences(userId);

    return { ok: true };
  });
```

> If Drizzle's join return shape uses different keys (e.g. `recovery_sequence` instead of `sequence_step`), adjust the property names in `getSequences` accordingly — they follow the table name as defined in Task 2's `pgTable("sequence_step", ...)` call.

---

- [ ] **Step 2: Create email provider server functions**

Create `apps/web/src/functions/email-provider.ts`:

```ts
import { db } from "@dunlo-v2/db";
import { decrypt, encrypt } from "@dunlo-v2/db/encrypt";
import { emailProvider } from "@dunlo-v2/db/schema/domain";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { authMiddleware } from "@/middleware/auth";
import { getResendClient } from "@/lib/resend";

function maskKey(plain: string): string {
  if (!plain) return "";
  const prefix = plain.slice(0, 4);
  return `${prefix}_${"*".repeat(8)}`;
}

export type EmailProviderState = {
  apiKey: string | null;
  fromEmail: string;
  fromName: string;
  configured: boolean;
};

export const getEmailProvider = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<EmailProviderState> => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    const [row] = await db
      .select()
      .from(emailProvider)
      .where(eq(emailProvider.userId, userId))
      .limit(1);

    if (!row) {
      return { apiKey: null, fromEmail: "", fromName: "", configured: false };
    }

    let masked: string | null = null;
    try {
      const plain = decrypt(row.apiKey);
      masked = maskKey(plain);
    } catch {
      masked = null;
    }

    return {
      apiKey: masked,
      fromEmail: row.fromEmail ?? "",
      fromName: row.fromName ?? "",
      configured: Boolean(masked && row.fromEmail && row.fromName),
    };
  });

const saveSchema = z.object({
  apiKey: z.string().max(200),
  fromEmail: z.email("Invalid email"),
  fromName: z.string().min(1).max(100),
});

export const saveEmailProvider = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => saveSchema.parse(input))
  .handler(async ({ context, data }) => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    const [existing] = await db
      .select()
      .from(emailProvider)
      .where(eq(emailProvider.userId, userId))
      .limit(1);

    const trimmedKey = data.apiKey.trim();

    if (!existing) {
      if (!trimmedKey) {
        throw new Error("API key is required on first setup");
      }
      await db.insert(emailProvider).values({
        id: crypto.randomUUID(),
        userId,
        provider: "resend",
        apiKey: encrypt(trimmedKey),
        fromEmail: data.fromEmail,
        fromName: data.fromName,
      });
    } else {
      const patch: Record<string, unknown> = {
        fromEmail: data.fromEmail,
        fromName: data.fromName,
        updatedAt: new Date(),
      };
      if (trimmedKey) {
        patch.apiKey = encrypt(trimmedKey);
      }
      await db
        .update(emailProvider)
        .set(patch)
        .where(eq(emailProvider.userId, userId));
    }

    return { ok: true };
  });

export const sendTestEmail = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const userId = context.session.user.id;
    const userEmail = context.session.user.email;

    const [row] = await db
      .select()
      .from(emailProvider)
      .where(eq(emailProvider.userId, userId))
      .limit(1);

    if (!row) throw new Error("Configure your email provider first");

    const apiKey = decrypt(row.apiKey);
    const resend = getResendClient(apiKey);

    const result = await resend.emails.send({
      from: `${row.fromName} <${row.fromEmail}>`,
      to: userEmail,
      subject: "Hello from Dunlo — your email setup is working",
      html: `<p>Nice work. Your Resend API key, sending domain, and from name are all wired up correctly.</p><p>You can now run recovery sequences from this address.</p><p>— The Dunlo team</p>`,
    });

    if ("error" in result && result.error) {
      throw new Error(result.error.message ?? "Resend failed");
    }

    return { ok: true };
  });
```

> The Resend SDK's `emails.send` return shape varies between minor versions. If `result.error` is not present, just `return { ok: true }`; the SDK throws on hard failures.

---

- [ ] **Step 3: Create escalation server functions**

Create `apps/web/src/functions/escalations.ts`:

```ts
import { db } from "@dunlo-v2/db";
import { decrypt } from "@dunlo-v2/db/encrypt";
import {
  emailProvider,
  escalation,
  failedPayment,
  stripeConnection,
} from "@dunlo-v2/db/schema/domain";
import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { authMiddleware } from "@/middleware/auth";
import { getResendClient } from "@/lib/resend";

export type EscalationRow = {
  id: string;
  status: "pending" | "sent" | "dismissed";
  draftSubject: string | null;
  draftBody: string | null;
  createdAt: Date;
  payment: {
    id: string;
    customerName: string | null;
    customerEmail: string;
    amount: number;
    currency: string;
    failureCode: string;
    description: string | null;
  };
};

export const getEscalations = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<EscalationRow[]> => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    const rows = await db
      .select()
      .from(escalation)
      .innerJoin(failedPayment, eq(escalation.failedPaymentId, failedPayment.id))
      .where(
        and(
          eq(escalation.userId, userId),
          inArray(escalation.status, ["pending", "sent"]),
        ),
      )
      .orderBy(desc(escalation.createdAt));

    return rows.map((row) => ({
      id: row.escalation.id,
      status: row.escalation.status as EscalationRow["status"],
      draftSubject: row.escalation.draftSubject,
      draftBody: row.escalation.draftBody,
      createdAt: row.escalation.createdAt,
      payment: {
        id: row.failed_payment.id,
        customerName: row.failed_payment.customerName,
        customerEmail: row.failed_payment.customerEmail,
        amount: row.failed_payment.amount,
        currency: row.failed_payment.currency,
        failureCode: row.failed_payment.failureCode,
        description: row.failed_payment.description,
      },
    }));
  });

const updateDraftSchema = z.object({
  escalationId: z.string().min(1),
  subject: z.string().min(1).max(500),
  body: z.string().min(1).max(10000),
});

export const updateEscalationDraft = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => updateDraftSchema.parse(input))
  .handler(async ({ context, data }) => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    const [owned] = await db
      .select({ id: escalation.id })
      .from(escalation)
      .where(
        and(
          eq(escalation.id, data.escalationId),
          eq(escalation.userId, userId),
        ),
      )
      .limit(1);

    if (!owned) throw new Error("Escalation not found");

    await db
      .update(escalation)
      .set({
        draftSubject: data.subject,
        draftBody: data.body,
        updatedAt: new Date(),
      })
      .where(eq(escalation.id, data.escalationId));

    return { ok: true };
  });

const sendSchema = z.object({ escalationId: z.string().min(1) });

export const sendEscalationEmail = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => sendSchema.parse(input))
  .handler(async ({ context, data }) => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    const [row] = await db
      .select()
      .from(escalation)
      .innerJoin(failedPayment, eq(escalation.failedPaymentId, failedPayment.id))
      .where(
        and(
          eq(escalation.id, data.escalationId),
          eq(escalation.userId, userId),
        ),
      )
      .limit(1);

    if (!row) throw new Error("Escalation not found");
    if (!row.escalation.draftSubject || !row.escalation.draftBody) {
      throw new Error("Draft not ready yet");
    }

    const [provider] = await db
      .select()
      .from(emailProvider)
      .where(eq(emailProvider.userId, userId))
      .limit(1);

    if (!provider) throw new Error("Configure your email provider first");

    const apiKey = decrypt(provider.apiKey);
    const resend = getResendClient(apiKey);

    await resend.emails.send({
      from: `${provider.fromName} <${provider.fromEmail}>`,
      to: row.failed_payment.customerEmail,
      subject: row.escalation.draftSubject,
      html: row.escalation.draftBody.replace(/\n/g, "<br />"),
    });

    await db
      .update(escalation)
      .set({ status: "sent", updatedAt: new Date() })
      .where(eq(escalation.id, data.escalationId));

    return { ok: true };
  });

const dismissSchema = z.object({ escalationId: z.string().min(1) });

export const dismissEscalation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => dismissSchema.parse(input))
  .handler(async ({ context, data }) => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    const [owned] = await db
      .select({ id: escalation.id })
      .from(escalation)
      .where(
        and(
          eq(escalation.id, data.escalationId),
          eq(escalation.userId, userId),
        ),
      )
      .limit(1);

    if (!owned) throw new Error("Escalation not found");

    await db
      .update(escalation)
      .set({ status: "dismissed", updatedAt: new Date() })
      .where(eq(escalation.id, data.escalationId));

    return { ok: true };
  });

export type EscalationSettings = {
  thresholdMajor: number | null;
  currency: string;
  hasConnection: boolean;
};

export const getEscalationSettings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<EscalationSettings> => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    const [row] = await db
      .select()
      .from(stripeConnection)
      .where(eq(stripeConnection.userId, userId))
      .limit(1);

    if (!row) {
      return { thresholdMajor: null, currency: "eur", hasConnection: false };
    }

    return {
      thresholdMajor:
        row.escalationThreshold !== null
          ? Math.round(row.escalationThreshold / 100)
          : null,
      currency: row.escalationCurrency ?? "eur",
      hasConnection: true,
    };
  });

const updateSettingsSchema = z.object({
  threshold: z.number().int().min(0).max(1_000_000).nullable(),
  currency: z.enum(["eur", "usd", "gbp"]),
});

export const updateEscalationSettings = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => updateSettingsSchema.parse(input))
  .handler(async ({ context, data }) => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    await db
      .update(stripeConnection)
      .set({
        escalationThreshold: data.threshold === null ? null : data.threshold * 100,
        escalationCurrency: data.currency,
        updatedAt: new Date(),
      })
      .where(eq(stripeConnection.userId, userId));

    return { ok: true };
  });
```

> NOTE: AI draft generation (`generateEscalationDraft`) is intentionally NOT in this file — Task 7 owns it and will add a new exported server function here. Do not block on it.

---

- [ ] **Step 4: Create the `/sequences` route**

Create `apps/web/src/routes/sequences.tsx`:

```tsx
import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  AlertCircle,
  Bell,
  LayoutDashboard,
  LogOut,
  Plus,
  RotateCcw,
  Save,
  Settings,
  Trash2,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/logo";
import { authClient } from "@/lib/auth-client";
import { getUser } from "@/functions/get-user";
import {
  addSequenceStep,
  deleteSequenceStep,
  getSequences,
  resetSequencesToDefault,
  toggleSequence,
  updateSequenceStep,
  type SequenceWithSteps,
} from "@/functions/sequences";

export const Route = createFileRoute("/sequences")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Recovery sequences — Dunlo" },
    ],
  }),
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await getUser();
    return { session };
  },
  loader: async ({ context }) => {
    if (!context.session) {
      throw redirect({ to: "/login" });
    }
    const sequences = await getSequences();
    return { sequences };
  },
});

const TEMPLATE_VARS = [
  "{{customer_name}}",
  "{{amount}}",
  "{{currency}}",
  "{{last_four}}",
  "{{failure_reason}}",
  "{{product_name}}",
  "{{update_payment_url}}",
  "{{sender_name}}",
];

function RouteComponent() {
  const { session } = Route.useRouteContext();
  const { sequences: initialSequences } = Route.useLoaderData();
  const router = Route.useRouter();
  const navigate = Route.useNavigate();
  const [sequences, setSequences] = useState<SequenceWithSteps[]>(initialSequences);
  const [busy, setBusy] = useState(false);

  const handleSignOut = () => {
    authClient.signOut({
      fetchOptions: { onSuccess: () => navigate({ to: "/" }) },
    });
  };

  const refresh = async () => {
    const fresh = await getSequences();
    setSequences(fresh);
  };

  const onToggle = async (sequenceId: string, isActive: boolean) => {
    try {
      await toggleSequence({ data: { sequenceId, isActive } });
      setSequences((prev) =>
        prev.map((s) => (s.id === sequenceId ? { ...s, isActive } : s)),
      );
      toast.success(isActive ? "Sequence enabled" : "Sequence paused");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    }
  };

  const onReset = async () => {
    if (!window.confirm("Reset all sequences to defaults? This will delete your customizations.")) {
      return;
    }
    setBusy(true);
    try {
      await resetSequencesToDefault();
      await refresh();
      toast.success("Sequences reset to defaults");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Reset failed");
    } finally {
      setBusy(false);
    }
  };

  const onAddStep = async (seq: SequenceWithSteps) => {
    const nextNumber = (seq.steps.at(-1)?.stepNumber ?? 0) + 1;
    try {
      await addSequenceStep({
        data: {
          sequenceId: seq.id,
          stepNumber: nextNumber,
          subject: "New step subject",
          body: "Hi {{customer_name}},\n\nYour message here.\n\n{{sender_name}}",
          delayHours: 24,
        },
      });
      await refresh();
      toast.success("Step added");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add step");
    }
  };

  const onDelete = async (stepId: string) => {
    if (!window.confirm("Delete this step?")) return;
    try {
      await deleteSequenceStep({ data: { stepId } });
      await refresh();
      toast.success("Step deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  return (
    <div className="flex min-h-dvh bg-[#f7f8fa] font-sans">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-gray-100 bg-white lg:flex">
        <div className="flex items-center border-b border-gray-100 px-5 py-4">
          <Logo size={26} />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {[
            { icon: LayoutDashboard, label: "Overview", to: "/dashboard", active: false },
            { icon: Zap, label: "Recovery sequences", to: "/sequences", active: true },
            { icon: AlertCircle, label: "Escalations", to: "/dashboard", active: false },
            { icon: Bell, label: "Alerts", to: "/dashboard", active: false },
            { icon: Settings, label: "Settings", to: "/settings", active: false },
          ].map(({ icon: Icon, label, to, active }) => (
            <button
              key={label}
              onClick={() => navigate({ to })}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>

        <div className="border-t border-gray-100 p-4">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-700">
              {session?.user.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">
                {session?.user.name}
              </p>
              <p className="truncate text-xs text-gray-400">
                {session?.user.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-xs text-gray-400 transition-colors hover:text-gray-700"
          >
            <LogOut size={12} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-100 bg-white/80 px-6 py-4 backdrop-blur-md">
          <div>
            <h1 className="text-base font-bold text-gray-900">Recovery sequences</h1>
            <p className="text-xs text-gray-400">
              One sequence per Stripe failure code. Steps run automatically when a payment fails.
            </p>
          </div>
          <button
            onClick={onReset}
            disabled={busy}
            className="flex shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50"
          >
            <RotateCcw size={12} />
            Reset to defaults
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Template vars helper */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-900">Available variables</p>
            <p className="mt-1 text-xs text-gray-500">
              Drop these into any subject or body — they're replaced at send time.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {TEMPLATE_VARS.map((v) => (
                <code
                  key={v}
                  className="rounded-md bg-gray-50 px-2 py-1 font-mono text-[11px] text-gray-700"
                >
                  {v}
                </code>
              ))}
            </div>
          </div>

          {sequences.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
              <p className="text-sm font-semibold text-gray-900">No sequences yet</p>
              <p className="mt-1 text-xs text-gray-500">
                Connect Stripe from the dashboard to seed default recovery sequences.
              </p>
            </div>
          ) : (
            sequences.map((seq) => (
              <div
                key={seq.id}
                className="rounded-2xl border border-gray-100 bg-white shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{seq.name}</p>
                    <p className="text-xs text-gray-400">
                      Failure code:{" "}
                      <code className="font-mono text-gray-500">{seq.failureCode}</code>
                    </p>
                  </div>
                  <label className="flex cursor-pointer items-center gap-2">
                    <span className="text-xs font-medium text-gray-500">
                      {seq.isActive ? "Active" : "Paused"}
                    </span>
                    <span
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        seq.isActive ? "bg-dunlo" : "bg-gray-200"
                      }`}
                      onClick={() => onToggle(seq.id, !seq.isActive)}
                    >
                      <span
                        className={`inline-block size-4 transform rounded-full bg-white shadow transition-transform ${
                          seq.isActive ? "translate-x-4" : "translate-x-0.5"
                        }`}
                      />
                    </span>
                  </label>
                </div>

                <div className="divide-y divide-gray-50">
                  {seq.steps.map((step) => (
                    <StepEditor
                      key={step.id}
                      step={step}
                      canDelete={seq.steps.length > 1}
                      onSaved={refresh}
                      onDelete={() => onDelete(step.id)}
                    />
                  ))}
                </div>

                <div className="border-t border-gray-100 px-5 py-3">
                  <button
                    onClick={() => onAddStep(seq)}
                    className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-200"
                  >
                    <Plus size={12} />
                    Add step
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

function StepEditor({
  step,
  canDelete,
  onSaved,
  onDelete,
}: {
  step: SequenceWithSteps["steps"][number];
  canDelete: boolean;
  onSaved: () => Promise<void> | void;
  onDelete: () => void;
}) {
  const [subject, setSubject] = useState(step.subject);
  const [body, setBody] = useState(step.body);
  const [delayHours, setDelayHours] = useState(step.delayHours);
  const [saving, setSaving] = useState(false);

  const dirty =
    subject !== step.subject ||
    body !== step.body ||
    delayHours !== step.delayHours;

  const onSave = async () => {
    if (subject.trim().length === 0 || body.trim().length === 0) {
      toast.error("Subject and body are required");
      return;
    }
    setSaving(true);
    try {
      await updateSequenceStep({
        data: { stepId: step.id, subject, body, delayHours },
      });
      await onSaved();
      toast.success(`Step ${step.stepNumber} saved`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3 px-5 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-dunlo/15 text-[11px] font-bold text-dunlo-deep">
            {step.stepNumber}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>Send after</span>
            <input
              type="number"
              min={0}
              max={720}
              value={delayHours}
              onChange={(e) => setDelayHours(Number(e.target.value) || 0)}
              className="h-7 w-16 rounded-lg border border-gray-200 bg-white px-2 text-center font-mono text-xs text-gray-900 focus:border-dunlo focus:outline-none"
            />
            <span>hours</span>
          </div>
        </div>
        {canDelete && (
          <button
            onClick={onDelete}
            className="text-gray-400 transition-colors hover:text-red-500"
            aria-label="Delete step"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Subject
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-dunlo focus:outline-none focus:ring-2 focus:ring-dunlo/20"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Body
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 font-mono text-xs text-gray-900 focus:border-dunlo focus:outline-none focus:ring-2 focus:ring-dunlo/20"
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={onSave}
          disabled={!dirty || saving}
          className="flex items-center gap-1.5 rounded-full bg-dunlo px-4 py-1.5 text-xs font-semibold text-white transition-all hover:bg-dunlo-hover active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save size={12} />
          {saving ? "Saving…" : "Save step"}
        </button>
      </div>
    </div>
  );
}
```

---

- [ ] **Step 5: Create the `/settings` route**

Create `apps/web/src/routes/settings.tsx`:

```tsx
import { Input } from "@dunlo-v2/ui/components/input";
import { Label } from "@dunlo-v2/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  AlertCircle,
  Bell,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  Save,
  Send,
  Settings as SettingsIcon,
  Unplug,
  User as UserIcon,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Logo } from "@/components/logo";
import { authClient } from "@/lib/auth-client";
import {
  getEmailProvider,
  saveEmailProvider,
  sendTestEmail,
} from "@/functions/email-provider";
import {
  getEscalationSettings,
  updateEscalationSettings,
} from "@/functions/escalations";
import { getUser } from "@/functions/get-user";

type Tab = "account" | "email" | "escalation";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Settings — Dunlo" },
    ],
  }),
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await getUser();
    return { session };
  },
  loader: async ({ context }) => {
    if (!context.session) {
      throw redirect({ to: "/login" });
    }
    const [emailState, escalationState] = await Promise.all([
      getEmailProvider(),
      getEscalationSettings(),
    ]);
    return { emailState, escalationState };
  },
});

function RouteComponent() {
  const { session } = Route.useRouteContext();
  const { emailState, escalationState } = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const [tab, setTab] = useState<Tab>("account");

  const handleSignOut = () => {
    authClient.signOut({
      fetchOptions: { onSuccess: () => navigate({ to: "/" }) },
    });
  };

  return (
    <div className="flex min-h-dvh bg-[#f7f8fa] font-sans">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-gray-100 bg-white lg:flex">
        <div className="flex items-center border-b border-gray-100 px-5 py-4">
          <Logo size={26} />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {[
            { icon: LayoutDashboard, label: "Overview", to: "/dashboard", active: false },
            { icon: Zap, label: "Recovery sequences", to: "/sequences", active: false },
            { icon: AlertCircle, label: "Escalations", to: "/dashboard", active: false },
            { icon: Bell, label: "Alerts", to: "/dashboard", active: false },
            { icon: SettingsIcon, label: "Settings", to: "/settings", active: true },
          ].map(({ icon: Icon, label, to, active }) => (
            <button
              key={label}
              onClick={() => navigate({ to })}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>

        <div className="border-t border-gray-100 p-4">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-700">
              {session?.user.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">
                {session?.user.name}
              </p>
              <p className="truncate text-xs text-gray-400">
                {session?.user.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-xs text-gray-400 transition-colors hover:text-gray-700"
          >
            <LogOut size={12} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-100 bg-white/80 px-6 py-4 backdrop-blur-md">
          <div>
            <h1 className="text-base font-bold text-gray-900">Settings</h1>
            <p className="text-xs text-gray-400">Account, email provider, and escalation.</p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl space-y-6 p-6">
          {/* Tab switcher (pill group) */}
          <div className="inline-flex items-center gap-1 rounded-full border border-gray-100 bg-white p-1 shadow-sm">
            {(
              [
                { id: "account", label: "Account", icon: UserIcon },
                { id: "email", label: "Email provider", icon: Mail },
                { id: "escalation", label: "Escalation", icon: AlertCircle },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  tab === t.id
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <t.icon size={12} />
                {t.label}
              </button>
            ))}
          </div>

          {tab === "account" && (
            <AccountTab
              name={session?.user.name ?? ""}
              email={session?.user.email ?? ""}
              onSignOut={handleSignOut}
            />
          )}
          {tab === "email" && <EmailTab initial={emailState} />}
          {tab === "escalation" && (
            <EscalationTab initial={escalationState} />
          )}
        </div>
      </main>
    </div>
  );
}

function AccountTab({
  name,
  email,
  onSignOut,
}: {
  name: string;
  email: string;
  onSignOut: () => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-gray-900">Account</p>
      <p className="mt-1 text-xs text-gray-500">
        Your profile details. Email is managed via Better Auth and cannot be changed here.
      </p>

      <div className="mt-5 space-y-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Name</Label>
          <Input
            value={name}
            readOnly
            className="h-11 rounded-xl border-gray-200 bg-gray-50 text-sm text-gray-700"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Email</Label>
          <Input
            value={email}
            readOnly
            className="h-11 rounded-xl border-gray-200 bg-gray-50 text-sm text-gray-700"
          />
        </div>
      </div>

      <div className="mt-6 border-t border-gray-100 pt-5">
        <button
          onClick={onSignOut}
          className="flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut size={12} />
          Sign out
        </button>
      </div>
    </div>
  );
}

function EmailTab({
  initial,
}: {
  initial: Awaited<ReturnType<typeof getEmailProvider>>;
}) {
  const [testing, setTesting] = useState(false);

  const form = useForm({
    defaultValues: {
      apiKey: "",
      fromEmail: initial.fromEmail,
      fromName: initial.fromName,
    },
    onSubmit: async ({ value }) => {
      try {
        await saveEmailProvider({ data: value });
        toast.success("Email provider saved");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Save failed");
      }
    },
    validators: {
      onSubmit: z.object({
        apiKey: z.string().max(200),
        fromEmail: z.email("Invalid email"),
        fromName: z.string().min(1, "Required").max(100),
      }),
    },
  });

  const onTest = async () => {
    setTesting(true);
    try {
      await sendTestEmail();
      toast.success("Test email sent — check your inbox");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Test send failed");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">Email provider</p>
          <p className="mt-1 text-xs text-gray-500">
            Resend API key + the address recovery emails will be sent from.
          </p>
        </div>
        {initial.configured && (
          <span className="rounded-full border border-dunlo/25 bg-dunlo/8 px-2.5 py-1 text-[11px] font-semibold text-dunlo-deep">
            Configured
          </span>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="mt-5 space-y-4"
      >
        <form.Field name="apiKey">
          {(field) => (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Resend API key
              </Label>
              <Input
                type="password"
                autoComplete="off"
                placeholder={initial.apiKey ?? "re_..."}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="h-11 rounded-xl border-gray-200 bg-white font-mono text-sm placeholder:text-gray-400 focus:border-dunlo focus:ring-dunlo/20"
              />
              <p className="text-[11px] text-gray-400">
                {initial.apiKey
                  ? "Leave blank to keep the existing key."
                  : "Create a key at resend.com/api-keys."}
              </p>
              {field.state.meta.errors.map((err) => (
                <p key={err?.message} className="text-xs text-red-500">
                  {err?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        <form.Field name="fromEmail">
          {(field) => (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">From email</Label>
              <Input
                type="email"
                placeholder="noreply@yourdomain.com"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="h-11 rounded-xl border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:border-dunlo focus:ring-dunlo/20"
              />
              {field.state.meta.errors.map((err) => (
                <p key={err?.message} className="text-xs text-red-500">
                  {err?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        <form.Field name="fromName">
          {(field) => (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">From name</Label>
              <Input
                placeholder="Acme"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="h-11 rounded-xl border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:border-dunlo focus:ring-dunlo/20"
              />
              {field.state.meta.errors.map((err) => (
                <p key={err?.message} className="text-xs text-red-500">
                  {err?.message}
                </p>
              ))}
            </div>
          )}
        </form.Field>

        <div className="flex items-center justify-between border-t border-gray-100 pt-5">
          <button
            type="button"
            onClick={onTest}
            disabled={!initial.configured || testing}
            className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {testing ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
            Send test email
          </button>

          <form.Subscribe
            selector={(s) => ({ canSubmit: s.canSubmit, isSubmitting: s.isSubmitting })}
          >
            {({ canSubmit, isSubmitting }) => (
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="flex items-center gap-1.5 rounded-full bg-dunlo px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-dunlo-hover active:scale-[0.97] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Save size={12} />
                )}
                Save
              </button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </div>
  );
}

function EscalationTab({
  initial,
}: {
  initial: Awaited<ReturnType<typeof getEscalationSettings>>;
}) {
  const [disconnecting, setDisconnecting] = useState(false);

  const form = useForm({
    defaultValues: {
      threshold: initial.thresholdMajor ?? 500,
      currency: initial.currency as "eur" | "usd" | "gbp",
    },
    onSubmit: async ({ value }) => {
      try {
        await updateEscalationSettings({
          data: { threshold: value.threshold, currency: value.currency },
        });
        toast.success("Escalation settings saved");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Save failed");
      }
    },
    validators: {
      onSubmit: z.object({
        threshold: z.coerce.number().int().min(0).max(1_000_000),
        currency: z.enum(["eur", "usd", "gbp"]),
      }),
    },
  });

  const onDisconnect = async () => {
    if (
      !window.confirm(
        "Disconnect Stripe? Recovery sequences are preserved and will be reused if you reconnect.",
      )
    ) {
      return;
    }
    setDisconnecting(true);
    try {
      const res = await fetch("/api/stripe/disconnect", { method: "POST" });
      if (!res.ok) throw new Error(`Disconnect failed (${res.status})`);
      toast.success("Stripe disconnected");
      window.location.reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Disconnect failed");
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-gray-900">Escalation threshold</p>
        <p className="mt-1 text-xs text-gray-500">
          Failed payments above this amount skip the recovery sequence and are surfaced to you for a
          personal email.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="mt-5 space-y-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_140px]">
            <form.Field name="threshold">
              {(field) => (
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">
                    Amount (in major units)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="500"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number(e.target.value) || 0)}
                    className="h-11 rounded-xl border-gray-200 bg-white font-mono text-sm focus:border-dunlo focus:ring-dunlo/20"
                  />
                  <p className="text-[11px] text-gray-400">
                    Stored in cents on save (e.g. 500 → 50000).
                  </p>
                </div>
              )}
            </form.Field>

            <form.Field name="currency">
              {(field) => (
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Currency</Label>
                  <select
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(e.target.value as "eur" | "usd" | "gbp")
                    }
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-dunlo focus:outline-none focus:ring-2 focus:ring-dunlo/20"
                  >
                    <option value="eur">EUR</option>
                    <option value="usd">USD</option>
                    <option value="gbp">GBP</option>
                  </select>
                </div>
              )}
            </form.Field>
          </div>

          <div className="flex justify-end border-t border-gray-100 pt-5">
            <form.Subscribe
              selector={(s) => ({ canSubmit: s.canSubmit, isSubmitting: s.isSubmitting })}
            >
              {({ canSubmit, isSubmitting }) => (
                <button
                  type="submit"
                  disabled={!canSubmit || isSubmitting || !initial.hasConnection}
                  className="flex items-center gap-1.5 rounded-full bg-dunlo px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-dunlo-hover active:scale-[0.97] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Save size={12} />
                  )}
                  Save
                </button>
              )}
            </form.Subscribe>
          </div>
          {!initial.hasConnection && (
            <p className="text-xs text-gray-400">
              Connect Stripe from the dashboard before adjusting escalation settings.
            </p>
          )}
        </form>
      </div>

      <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-gray-900">Disconnect Stripe</p>
        <p className="mt-1 text-xs text-gray-500">
          Removes the OAuth connection and deregisters the webhook on Stripe's side. Your recovery
          sequences and historical data are kept.
        </p>
        <button
          onClick={onDisconnect}
          disabled={!initial.hasConnection || disconnecting}
          className="mt-4 flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {disconnecting ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Unplug size={12} />
          )}
          {initial.hasConnection ? "Disconnect Stripe" : "Not connected"}
        </button>
      </div>
    </div>
  );
}
```

---

- [ ] **Step 6: Create the `/api/stripe/disconnect` route**

Create `apps/web/src/routes/api/stripe/disconnect.ts`:

```ts
import { auth } from "@dunlo-v2/auth";
import { db } from "@dunlo-v2/db";
import { decrypt } from "@dunlo-v2/db/encrypt";
import { stripeConnection } from "@dunlo-v2/db/schema/domain";
import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";

import { getConnectedStripe } from "@/lib/stripe";

export const Route = createFileRoute("/api/stripe/disconnect")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session?.user) {
          return new Response(
            JSON.stringify({ error: "Unauthorized" }),
            { status: 401, headers: { "Content-Type": "application/json" } },
          );
        }

        const userId = session.user.id;

        const [connection] = await db
          .select()
          .from(stripeConnection)
          .where(eq(stripeConnection.userId, userId))
          .limit(1);

        if (!connection) {
          return new Response(
            JSON.stringify({ disconnected: true, alreadyDisconnected: true }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }

        // Best-effort webhook deletion on the connected account.
        if (connection.webhookEndpointId) {
          try {
            const accessToken = decrypt(connection.accessToken);
            const stripe = getConnectedStripe(accessToken);
            await stripe.webhookEndpoints.del(connection.webhookEndpointId);
          } catch (err) {
            console.error(
              "[stripe.disconnect] webhook cleanup failed (continuing):",
              err,
            );
          }
        }

        // We deliberately keep recoverySequence rows so a future reconnect
        // restores the user's customizations.
        await db
          .delete(stripeConnection)
          .where(eq(stripeConnection.userId, userId));

        return new Response(
          JSON.stringify({ disconnected: true }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});
```

---

- [ ] **Step 7: Type check**

Run from the repo root:

```bash
bun run check-types
```

Resolve any errors. Common adjustments:
- If Drizzle's join return shape uses different keys than `row.sequence_step` / `row.failed_payment` / `row.escalation`, rename per the actual `pgTable("...", ...)` table names from Task 2.
- If `Route.useRouter()` is unused in `sequences.tsx`, remove it.
- If the Resend SDK signature returns a different shape, adjust `sendTestEmail` accordingly.

---

- [ ] **Step 8: Manual verification**

Start the app and the email scheduler:

```bash
bun run dev:web
```

1. **Auth + nav**
   - Navigate to `/sequences` while logged out → redirects to `/login`.
   - Log in → navigate to `/sequences`. Sidebar shows the same look as `/dashboard`; "Recovery sequences" is highlighted.
   - Click each sidebar link (Overview / Sequences / Settings) — they navigate without full-page reloads.

2. **Sequences**
   - If the user has connected Stripe (so sequences are seeded), four cards appear (Card Expired, Card Declined, Insufficient Funds, Bank Declined).
   - Edit a step's subject → click "Save step" → toast appears → reload page → change persists.
   - Change `delayHours` to `48` → save → reload → persists.
   - Toggle a sequence from Active to Paused → DB shows `is_active = false` (verify via `bun run db:studio`).
   - Click "Add step" on a sequence → new step appears at the bottom with default copy.
   - Click trash on a step (when more than one step exists) → confirm → step disappears.
   - Trash icon is hidden on a sequence with only one step.
   - Click "Reset to defaults" → confirm → all sequences are re-seeded; any custom step you added is gone.
   - Confirm the template variables helper card lists all 8 variables.

3. **Settings — Account tab**
   - `/settings` shows Account tab by default with name + email read-only fields.
   - Click "Sign out" (red button) → redirects to `/`.

4. **Settings — Email provider tab**
   - First load (no provider configured): API key placeholder shows `re_...`, no "Configured" badge.
   - Enter a valid Resend test key + from-email + from-name → Save → toast → DB row created in `email_provider`.
   - Reload → "Configured" badge appears, API key placeholder shows masked form (e.g. `re_e_********`). The API key input itself is empty (so the user can leave it blank to keep the existing key).
   - Change only the from-name → Save → DB updates; API key column is unchanged (verify via `db:studio`).
   - Click "Send test email" → toast success → check your own inbox.

5. **Settings — Escalation tab**
   - If Stripe is connected: threshold input shows `500` (default €500), currency `EUR`.
   - Change threshold to `1000`, currency to `USD` → Save → DB shows `escalation_threshold = 100000`, `escalation_currency = "usd"`.
   - If Stripe is NOT connected: form is shown but the Save button is disabled, with a hint underneath.

6. **Stripe disconnect**
   - With Stripe connected, click "Disconnect Stripe" → confirm → toast success → page reloads → "Not connected" button appears.
   - In Stripe dashboard (Connect → connected account → Webhooks): the webhook endpoint is gone.
   - In DB: `stripe_connection` row for this user is deleted; `recovery_sequence` rows are still there.
   - Reconnect Stripe via dashboard CTA → sequences are reused (no duplicates).

7. **Error handling**
   - Try saving an empty subject in a step editor → inline toast error.
   - Try sending a test email before any provider is configured → toast: "Configure your email provider first" (or disabled button).

---

- [ ] **Step 9: Commit**

```bash
git add apps/web/src/functions/sequences.ts \
        apps/web/src/functions/email-provider.ts \
        apps/web/src/functions/escalations.ts \
        apps/web/src/routes/sequences.tsx \
        apps/web/src/routes/settings.tsx \
        apps/web/src/routes/api/stripe/disconnect.ts

git commit -m "feat(web): sequence editor, settings page, and Stripe disconnect

Adds /sequences and /settings authenticated routes plus server functions
for recovery sequence CRUD, email provider config, and escalation
settings. Adds POST /api/stripe/disconnect that best-effort removes the
Stripe webhook and deletes the connection row while keeping recovery
sequences intact for reconnect."
```
## Task 7: Onboarding wizard + AI escalation drafts

This task wires Anthropic Claude into the failed-payment pipeline to draft personalized escalation emails for high-value accounts, and ships the `/onboarding` wizard that new users land on after verifying their email.

**Model note:** Uses `claude-sonnet-4-6` (current best Sonnet, per project guide). If the Anthropic SDK / API rejects the id in a given environment, fall back to `claude-sonnet-4-5` — both are non-breaking for our prompt shape.

**Files:**
- Create: `apps/web/src/lib/anthropic.ts`
- Modify: `apps/web/src/functions/escalations.ts` (Task 6 created the base file with `listEscalations`, `sendEscalation`, `dismissEscalation`, `saveEmailProvider`)
- Modify: `apps/web/src/routes/api/stripe/webhook.ts` (Task 3 created this with `processFailedPayment` helper)
- Create: `apps/web/src/routes/onboarding.tsx`
- Modify: `apps/web/src/components/sign-up-form.tsx` (one-line `callbackURL` addition)

**Dependencies already added in earlier tasks:**
- `@anthropic-ai/sdk` in `apps/web/package.json` (Task 1)
- `ANTHROPIC_API_KEY` in `packages/env/src/server.ts` (Task 1)
- `humanizeFailureCode` + `formatAmount` helpers in `apps/web/src/lib/format.ts` (Task 3)
- `authMiddleware` in `apps/web/src/middleware/auth.ts` (Task 2)

---

- [ ] **Step 1: Create Anthropic client**

Create `apps/web/src/lib/anthropic.ts`:

```ts
import Anthropic from "@anthropic-ai/sdk";
import { env } from "@dunlo-v2/env/server";

let client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  }
  return client;
}

export const ANTHROPIC_MODEL = "claude-sonnet-4-6";
```

The singleton avoids re-instantiating the SDK on every webhook event. Falls back to `claude-sonnet-4-5` if `claude-sonnet-4-6` is rejected — change `ANTHROPIC_MODEL` only.

---

- [ ] **Step 2: Add `generateEscalationDraft` to `escalations.ts`**

Replace `apps/web/src/functions/escalations.ts` with the full updated contents below. The plain async `generateEscalationDraft(escalationId)` is the fire-and-forget worker; `regenerateEscalationDraft` is its authenticated server-function wrapper for the dashboard "Regenerate" button.

```ts
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@dunlo-v2/db";
import { escalation, emailProvider, failedPayment } from "@dunlo-v2/db/schema";
import { decrypt } from "@dunlo-v2/db/encrypt";

import { authMiddleware } from "@/middleware/auth";
import { getAnthropic, ANTHROPIC_MODEL } from "@/lib/anthropic";
import { formatAmount, humanizeFailureCode } from "@/lib/format";
import { getResend } from "@/lib/resend";

export const listEscalations = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const rows = await db
      .select({
        escalation,
        payment: failedPayment,
      })
      .from(escalation)
      .innerJoin(failedPayment, eq(failedPayment.id, escalation.failedPaymentId))
      .where(eq(escalation.userId, context.user.id))
      .orderBy(escalation.createdAt);
    return rows;
  });

export const sendEscalation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      escalationId: z.string(),
      subject: z.string().min(1),
      body: z.string().min(1),
    }),
  )
  .handler(async ({ data, context }) => {
    const [row] = await db
      .select({
        escalation,
        payment: failedPayment,
        provider: emailProvider,
      })
      .from(escalation)
      .innerJoin(failedPayment, eq(failedPayment.id, escalation.failedPaymentId))
      .leftJoin(emailProvider, eq(emailProvider.userId, escalation.userId))
      .where(eq(escalation.id, data.escalationId))
      .limit(1);

    if (!row || row.escalation.userId !== context.user.id) {
      throw new Error("Escalation not found");
    }
    if (!row.provider) {
      throw new Error("Configure an email provider in Settings before sending.");
    }

    const resend = getResend(decrypt(row.provider.apiKey));
    await resend.emails.send({
      from: `${row.provider.fromName} <${row.provider.fromEmail}>`,
      to: row.payment.customerEmail,
      subject: data.subject,
      text: data.body,
    });

    await db
      .update(escalation)
      .set({ status: "sent", updatedAt: new Date() })
      .where(eq(escalation.id, data.escalationId));

    return { ok: true };
  });

export const dismissEscalation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ escalationId: z.string() }))
  .handler(async ({ data, context }) => {
    const [row] = await db
      .select()
      .from(escalation)
      .where(eq(escalation.id, data.escalationId))
      .limit(1);
    if (!row || row.userId !== context.user.id) {
      throw new Error("Escalation not found");
    }
    await db
      .update(escalation)
      .set({ status: "dismissed", updatedAt: new Date() })
      .where(eq(escalation.id, data.escalationId));
    return { ok: true };
  });

export const saveEmailProvider = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      apiKey: z.string().min(1),
      fromEmail: z.email(),
      fromName: z.string().min(1),
    }),
  )
  .handler(async ({ data, context }) => {
    const { encrypt } = await import("@dunlo-v2/db/encrypt");
    const encryptedKey = encrypt(data.apiKey);

    const [existing] = await db
      .select()
      .from(emailProvider)
      .where(eq(emailProvider.userId, context.user.id))
      .limit(1);

    if (existing) {
      await db
        .update(emailProvider)
        .set({
          apiKey: encryptedKey,
          fromEmail: data.fromEmail,
          fromName: data.fromName,
          updatedAt: new Date(),
        })
        .where(eq(emailProvider.userId, context.user.id));
    } else {
      await db.insert(emailProvider).values({
        id: crypto.randomUUID(),
        userId: context.user.id,
        provider: "resend",
        apiKey: encryptedKey,
        fromEmail: data.fromEmail,
        fromName: data.fromName,
      });
    }
    return { ok: true };
  });

/**
 * Plain async draft generator — NOT a server function so it can be
 * fire-and-forget from the webhook (no client round-trip, no middleware).
 * Always resolves; failures fall back to a generic draft.
 */
export async function generateEscalationDraft(
  escalationId: string,
): Promise<void> {
  const [row] = await db
    .select({
      escalation,
      payment: failedPayment,
    })
    .from(escalation)
    .innerJoin(failedPayment, eq(failedPayment.id, escalation.failedPaymentId))
    .where(eq(escalation.id, escalationId))
    .limit(1);

  if (!row) return;

  const customerName = row.payment.customerName ?? "there";
  const productName = row.payment.description ?? "your subscription";
  const subject = `Quick question about your ${productName} payment`;

  const fallback = {
    subject,
    body: `Hi ${customerName}, I noticed your recent payment didn't go through — let me know if there's anything I can do to help.`,
  };

  try {
    const system =
      "You are writing a short, personal email from a SaaS founder to a customer whose payment failed. The email should feel human, not automated. 2-3 sentences max. No subject line needed.";

    const userPrompt =
      `Customer: ${customerName}. ` +
      `Monthly value: ${formatAmount(row.payment.amount, row.payment.currency)}. ` +
      `Product: ${productName}. ` +
      `Failure: ${humanizeFailureCode(row.payment.failureCode)}. ` +
      `Write the email body only.`;

    const response = await getAnthropic().messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 400,
      system,
      messages: [{ role: "user", content: userPrompt }],
    });

    const first = response.content[0];
    const body =
      first && first.type === "text" && first.text.trim().length > 0
        ? first.text.trim()
        : fallback.body;

    await db
      .update(escalation)
      .set({
        draftSubject: subject,
        draftBody: body,
        updatedAt: new Date(),
      })
      .where(eq(escalation.id, escalationId));
  } catch (e) {
    console.error("[escalations] AI draft generation failed:", e);
    await db
      .update(escalation)
      .set({
        draftSubject: fallback.subject,
        draftBody: fallback.body,
        updatedAt: new Date(),
      })
      .where(eq(escalation.id, escalationId));
  }
}

export const regenerateEscalationDraft = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ escalationId: z.string() }))
  .handler(async ({ data, context }) => {
    const [row] = await db
      .select()
      .from(escalation)
      .where(eq(escalation.id, data.escalationId))
      .limit(1);
    if (!row || row.userId !== context.user.id) {
      throw new Error("Escalation not found");
    }
    await generateEscalationDraft(data.escalationId);
    return { ok: true };
  });
```

---

- [ ] **Step 3: Hook AI draft into the Stripe webhook**

Replace `apps/web/src/routes/api/stripe/webhook.ts` with the contents below. Only the `processFailedPayment` helper changes — after inserting the `escalation` row we kick off `generateEscalationDraft(...)` without `await` so the webhook still responds in <5s. All other handlers from Task 3 are preserved verbatim.

```ts
import { createServerFileRoute } from "@tanstack/react-start/server";
import { and, eq, inArray } from "drizzle-orm";
import Stripe from "stripe";

import { db } from "@dunlo-v2/db";
import {
  escalation,
  failedPayment,
  recoveryAttempt,
  recoverySequence,
  sequenceStep,
  stripeConnection,
} from "@dunlo-v2/db/schema";
import { decrypt } from "@dunlo-v2/db/encrypt";
import { env } from "@dunlo-v2/env/server";

import { getStripe } from "@/lib/stripe";
import { generateEscalationDraft } from "@/functions/escalations";

export const ServerRoute = createServerFileRoute(
  "/api/stripe/webhook",
).methods({
  POST: async ({ request }) => {
    const sig = request.headers.get("stripe-signature");
    if (!sig) return new Response("Missing signature", { status: 400 });

    const rawBody = await request.text();

    let event: Stripe.Event;
    try {
      const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
        apiVersion: "2024-10-28.acacia",
      });
      event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (e) {
      console.error("[webhook] signature verification failed:", e);
      return new Response("Bad signature", { status: 400 });
    }

    const accountId = event.account;
    if (!accountId) {
      return new Response("Missing account", { status: 400 });
    }

    const [conn] = await db
      .select()
      .from(stripeConnection)
      .where(eq(stripeConnection.stripeAccountId, accountId))
      .limit(1);

    if (!conn) {
      return new Response("Unknown account", { status: 404 });
    }

    try {
      switch (event.type) {
        case "payment_intent.payment_failed": {
          const pi = event.data.object as Stripe.PaymentIntent;
          await processFailedPayment(conn, pi);
          break;
        }
        case "invoice.payment_failed": {
          const inv = event.data.object as Stripe.Invoice;
          await processFailedInvoice(conn, inv);
          break;
        }
        case "payment_intent.succeeded": {
          const pi = event.data.object as Stripe.PaymentIntent;
          await markRecoveredByPaymentIntent(pi.id);
          break;
        }
        case "invoice.payment_succeeded": {
          const inv = event.data.object as Stripe.Invoice;
          if (inv.id) await markRecoveredByInvoice(inv.id);
          break;
        }
        default:
          break;
      }
    } catch (e) {
      console.error("[webhook] handler error:", e);
      return new Response("Handler error", { status: 500 });
    }

    return new Response("ok", { status: 200 });
  },
});

async function processFailedPayment(
  conn: typeof stripeConnection.$inferSelect,
  pi: Stripe.PaymentIntent,
): Promise<void> {
  const userId = conn.userId;
  const stripe = getStripe(decrypt(conn.accessToken));

  const customerId =
    typeof pi.customer === "string" ? pi.customer : pi.customer?.id;
  let customerName: string | null = null;
  let customerEmail: string | null = pi.receipt_email ?? null;

  if (customerId) {
    const customer = await stripe.customers.retrieve(customerId);
    if (!("deleted" in customer && customer.deleted)) {
      customerName = customer.name ?? null;
      customerEmail = customer.email ?? customerEmail;
    }
  }

  if (!customerEmail) {
    console.warn("[webhook] no customer email; skipping");
    return;
  }

  const failureCode =
    pi.last_payment_error?.decline_code ??
    pi.last_payment_error?.code ??
    "card_declined";
  const lastFour = pi.last_payment_error?.payment_method?.card?.last4 ?? null;

  const paymentId = crypto.randomUUID();
  await db.insert(failedPayment).values({
    id: paymentId,
    userId,
    stripePaymentIntentId: pi.id,
    stripeCustomerId: customerId ?? "",
    stripeInvoiceId: null,
    amount: pi.amount,
    currency: pi.currency,
    failureCode,
    failureMessage: pi.last_payment_error?.message ?? null,
    customerName,
    customerEmail,
    lastFour,
    description: pi.description ?? null,
    status: "in_recovery",
  });

  const threshold = conn.escalationThreshold;
  if (threshold !== null && pi.amount >= threshold) {
    const escalationId = crypto.randomUUID();
    await db.insert(escalation).values({
      id: escalationId,
      failedPaymentId: paymentId,
      userId,
      status: "pending",
    });
    await db
      .update(failedPayment)
      .set({ status: "escalated", updatedAt: new Date() })
      .where(eq(failedPayment.id, paymentId));

    // Fire-and-forget AI draft — webhook must respond fast.
    generateEscalationDraft(escalationId).catch((e) =>
      console.error("[webhook] AI draft failed:", e),
    );
    return;
  }

  await scheduleRecoveryAttempts(userId, paymentId, failureCode);
}

async function processFailedInvoice(
  conn: typeof stripeConnection.$inferSelect,
  inv: Stripe.Invoice,
): Promise<void> {
  const stripe = getStripe(decrypt(conn.accessToken));
  const piId =
    typeof inv.payment_intent === "string"
      ? inv.payment_intent
      : inv.payment_intent?.id;
  if (!piId) return;
  const pi = await stripe.paymentIntents.retrieve(piId);
  await processFailedPayment(conn, pi);
}

async function scheduleRecoveryAttempts(
  userId: string,
  paymentId: string,
  failureCode: string,
): Promise<void> {
  const [seq] = await db
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

  const sequence =
    seq ??
    (
      await db
        .select()
        .from(recoverySequence)
        .where(
          and(
            eq(recoverySequence.userId, userId),
            eq(recoverySequence.failureCode, "card_declined"),
            eq(recoverySequence.isActive, true),
          ),
        )
        .limit(1)
    )[0];

  if (!sequence) return;

  const steps = await db
    .select()
    .from(sequenceStep)
    .where(eq(sequenceStep.sequenceId, sequence.id))
    .orderBy(sequenceStep.stepNumber);

  const now = Date.now();
  for (const step of steps) {
    await db.insert(recoveryAttempt).values({
      id: crypto.randomUUID(),
      failedPaymentId: paymentId,
      sequenceStepId: step.id,
      status: "scheduled",
      scheduledAt: new Date(now + step.delayHours * 3600 * 1000),
    });
  }
}

async function markRecoveredByPaymentIntent(piId: string): Promise<void> {
  const [row] = await db
    .select()
    .from(failedPayment)
    .where(eq(failedPayment.stripePaymentIntentId, piId))
    .limit(1);
  if (!row || !["in_recovery", "escalated"].includes(row.status)) return;

  await db
    .update(failedPayment)
    .set({ status: "recovered", recoveredAt: new Date(), updatedAt: new Date() })
    .where(eq(failedPayment.id, row.id));
  await db
    .update(recoveryAttempt)
    .set({ status: "failed", errorMessage: "Recovered before send" })
    .where(
      and(
        eq(recoveryAttempt.failedPaymentId, row.id),
        inArray(recoveryAttempt.status, ["scheduled"]),
      ),
    );
}

async function markRecoveredByInvoice(invoiceId: string): Promise<void> {
  const [row] = await db
    .select()
    .from(failedPayment)
    .where(eq(failedPayment.stripeInvoiceId, invoiceId))
    .limit(1);
  if (!row) return;
  await markRecoveredByPaymentIntent(row.stripePaymentIntentId);
}
```

---

- [ ] **Step 4: Create the onboarding route**

Create `apps/web/src/routes/onboarding.tsx`. The wizard step is driven by a `?step=` URL search param (validated with Zod) so a page refresh keeps state. The loader auto-advances users past steps they already completed.

```tsx
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { Check, ChevronRight, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Input } from "@dunlo-v2/ui/components/input";
import { Label } from "@dunlo-v2/ui/components/label";

import { Logo } from "@/components/logo";
import { getUser } from "@/functions/get-user";
import { getOnboardingState } from "@/functions/stripe";
import { saveEmailProvider } from "@/functions/escalations";

const searchSchema = z.object({
  step: z.coerce.number().int().min(1).max(3).catch(1),
});

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Get started — Dunlo" },
    ],
  }),
  validateSearch: searchSchema,
  beforeLoad: async () => {
    const session = await getUser();
    if (!session) throw redirect({ to: "/login" });
    return { session };
  },
  loader: async () => {
    const state = await getOnboardingState();
    return state;
  },
  component: RouteComponent,
});

function StepDot({
  n,
  active,
  done,
}: {
  n: number;
  active: boolean;
  done: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex size-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
          done
            ? "bg-dunlo text-white"
            : active
              ? "bg-dunlo text-white"
              : "bg-gray-100 text-gray-400"
        }`}
      >
        {done ? <Check size={13} /> : n}
      </div>
    </div>
  );
}

function StepConnector({ done }: { done: boolean }) {
  return (
    <div
      className={`h-px w-8 transition-colors ${done ? "bg-dunlo" : "bg-gray-200"}`}
    />
  );
}

function RouteComponent() {
  const { stripeConnected, emailConfigured } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/onboarding" });

  const step = search.step;

  const form = useForm({
    defaultValues: { apiKey: "", fromEmail: "", fromName: "" },
    onSubmit: async ({ value }) => {
      try {
        await saveEmailProvider({ data: value });
        toast.success("Email provider configured");
        navigate({ to: "/onboarding", search: { step: 3 } });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to save");
      }
    },
    validators: {
      onSubmit: z.object({
        apiKey: z.string().min(1, "Required"),
        fromEmail: z.email("Invalid email"),
        fromName: z.string().min(1, "Required"),
      }),
    },
  });

  return (
    <div className="flex min-h-dvh flex-col bg-[#f7f8fa] font-sans">
      <header className="flex items-center justify-between px-8 py-6">
        <Logo size={26} />
        <p className="text-xs text-gray-400">Step {step} of 3</p>
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 pb-16">
        <div className="mb-8 flex items-center">
          <StepDot n={1} active={step === 1} done={step > 1 || stripeConnected} />
          <StepConnector done={step > 1 || stripeConnected} />
          <StepDot n={2} active={step === 2} done={step > 2 || emailConfigured} />
          <StepConnector done={step > 2} />
          <StepDot n={3} active={step === 3} done={false} />
        </div>

        <div className="w-full rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          {step === 1 && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Connect your Stripe account
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                We'll monitor failed payments and trigger recovery emails on
                your behalf. Read-only access until you configure sequences.
              </p>

              {stripeConnected ? (
                <div className="mt-6 flex items-center gap-2 rounded-xl border border-dunlo/25 bg-dunlo/8 px-4 py-3">
                  <Check size={15} className="text-dunlo-deep" />
                  <p className="text-sm font-semibold text-dunlo-deep">
                    Stripe already connected
                  </p>
                </div>
              ) : null}

              <div className="mt-8 flex items-center gap-3">
                <a
                  href="/api/stripe/connect"
                  className="flex h-11 items-center gap-1.5 rounded-full bg-dunlo px-5 text-sm font-semibold text-white transition-all hover:bg-dunlo-hover active:scale-[0.98]"
                >
                  {stripeConnected ? "Reconnect Stripe" : "Connect Stripe"}
                  <ExternalLink size={13} />
                </a>
                {stripeConnected ? (
                  <button
                    onClick={() =>
                      navigate({ to: "/onboarding", search: { step: 2 } })
                    }
                    className="flex h-11 items-center gap-1 rounded-full border border-gray-200 px-5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Continue
                    <ChevronRight size={14} />
                  </button>
                ) : null}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Configure email sending
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Recovery emails are sent from your own Resend account so they
                land in inboxes, not spam.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit();
                }}
                className="mt-8 space-y-5"
              >
                <form.Field name="apiKey">
                  {(field) => (
                    <div className="space-y-1.5">
                      <Label
                        htmlFor={field.name}
                        className="text-sm font-medium text-gray-700"
                      >
                        Resend API key
                      </Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        autoComplete="off"
                        placeholder="re_..."
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="h-11 rounded-xl border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:border-dunlo focus:ring-dunlo/20"
                      />
                      {field.state.meta.errors.map((err) => (
                        <p key={err?.message} className="text-xs text-red-500">
                          {err?.message}
                        </p>
                      ))}
                    </div>
                  )}
                </form.Field>

                <form.Field name="fromEmail">
                  {(field) => (
                    <div className="space-y-1.5">
                      <Label
                        htmlFor={field.name}
                        className="text-sm font-medium text-gray-700"
                      >
                        From email
                      </Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="email"
                        autoComplete="off"
                        placeholder="billing@yourdomain.com"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="h-11 rounded-xl border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:border-dunlo focus:ring-dunlo/20"
                      />
                      {field.state.meta.errors.map((err) => (
                        <p key={err?.message} className="text-xs text-red-500">
                          {err?.message}
                        </p>
                      ))}
                    </div>
                  )}
                </form.Field>

                <form.Field name="fromName">
                  {(field) => (
                    <div className="space-y-1.5">
                      <Label
                        htmlFor={field.name}
                        className="text-sm font-medium text-gray-700"
                      >
                        From name
                      </Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        autoComplete="off"
                        placeholder="Acme Billing"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="h-11 rounded-xl border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:border-dunlo focus:ring-dunlo/20"
                      />
                      {field.state.meta.errors.map((err) => (
                        <p key={err?.message} className="text-xs text-red-500">
                          {err?.message}
                        </p>
                      ))}
                    </div>
                  )}
                </form.Field>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      navigate({ to: "/onboarding", search: { step: 3 } })
                    }
                    className="text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    I'll do this later
                  </button>

                  <form.Subscribe
                    selector={(s) => ({
                      canSubmit: s.canSubmit,
                      isSubmitting: s.isSubmitting,
                    })}
                  >
                    {({ canSubmit, isSubmitting }) => (
                      <button
                        type="submit"
                        disabled={!canSubmit || isSubmitting}
                        className="flex h-11 items-center gap-1.5 rounded-full bg-dunlo px-5 text-sm font-semibold text-white transition-all hover:bg-dunlo-hover active:scale-[0.98] disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            Saving…
                          </>
                        ) : (
                          <>
                            Save and continue
                            <ChevronRight size={14} />
                          </>
                        )}
                      </button>
                    )}
                  </form.Subscribe>
                </div>
              </form>
            </div>
          )}

          {step === 3 && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                You're all set
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Dunlo is now watching for failed payments. Recovery emails will
                fire automatically.
              </p>

              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4">
                  <span
                    className={`flex size-6 items-center justify-center rounded-full ${
                      stripeConnected
                        ? "bg-dunlo/20 text-dunlo-deep"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {stripeConnected ? "✓" : "!"}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Stripe {stripeConnected ? "connected" : "not connected"}
                    </p>
                    {!stripeConnected && (
                      <p className="text-xs text-gray-400">
                        Connect later from Settings.
                      </p>
                    )}
                  </div>
                </li>
                <li className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4">
                  <span
                    className={`flex size-6 items-center justify-center rounded-full ${
                      emailConfigured
                        ? "bg-dunlo/20 text-dunlo-deep"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {emailConfigured ? "✓" : "!"}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Email{" "}
                      {emailConfigured
                        ? "provider configured"
                        : "provider skipped"}
                    </p>
                    {!emailConfigured && (
                      <p className="text-xs text-gray-400">
                        Configure later in Settings → Email provider.
                      </p>
                    )}
                  </div>
                </li>
              </ul>

              <button
                onClick={() => navigate({ to: "/dashboard" })}
                className="mt-8 flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-dunlo text-sm font-semibold text-white transition-all hover:bg-dunlo-hover active:scale-[0.98]"
              >
                Go to dashboard
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
```

**Note on `getOnboardingState`:** Task 4 added `apps/web/src/functions/stripe.ts`. If that file does not already export `getOnboardingState`, add the following server function there (small, additive — does not conflict with Task 4's existing exports):

```ts
export const getOnboardingState = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const [conn] = await db
      .select({ id: stripeConnection.id })
      .from(stripeConnection)
      .where(eq(stripeConnection.userId, context.user.id))
      .limit(1);
    const [prov] = await db
      .select({ id: emailProvider.id })
      .from(emailProvider)
      .where(eq(emailProvider.userId, context.user.id))
      .limit(1);
    return {
      stripeConnected: !!conn,
      emailConfigured: !!prov,
    };
  });
```

---

- [ ] **Step 5: Update sign-up-form to redirect post-verification users to `/onboarding`**

Better Auth's `autoSignInAfterVerification: true` (configured in Task 2's `packages/auth/src/index.ts`) honors a `callbackURL` passed at sign-up time. One-line change in `apps/web/src/components/sign-up-form.tsx`.

Find:

```ts
await authClient.signUp.email(
  { email: value.email, password: value.password, name: value.name },
  {
```

Replace with:

```ts
await authClient.signUp.email(
  {
    email: value.email,
    password: value.password,
    name: value.name,
    callbackURL: "/onboarding",
  },
  {
```

Also update the `onSuccess` handler from `navigate({ to: "/dashboard" })` to `navigate({ to: "/login" })` (since Task 2 already gates the dashboard behind email verification — the user has not yet clicked the link, so we send them back to login with the inline "check your inbox" message Task 2 added).

If Task 2's sign-up-form variant already does the inline "check your inbox" state instead of navigating, leave the `onSuccess` alone — only the `callbackURL` line is required for this task.

---

- [ ] **Step 6: Type check**

```bash
bun run check-types
```

Resolve any TypeScript errors before moving on. Common issues:
- `@anthropic-ai/sdk` content block discriminated union — make sure you check `first.type === "text"` before reading `first.text`.
- `formatAmount` / `humanizeFailureCode` signatures must match Task 3's helpers; adjust import path if they live elsewhere.
- `Route.useLoaderData()` returns the `getOnboardingState` shape — make sure that server function is exported and the type flows through.

---

- [ ] **Step 7: Manual verification**

Wizard end-to-end:
- [ ] Visit `/onboarding` while logged out → redirected to `/login`
- [ ] Sign up a new account → email arrives → click verification link → land on `/onboarding?step=1`
- [ ] Click "Connect Stripe" → Stripe OAuth → return to `/onboarding` (Task 4's callback redirects here)
- [ ] Step indicator now shows step 1 as done; click "Continue" → `?step=2`
- [ ] Fill Resend API key, from email, from name → Save → `?step=3` with both checkmarks green
- [ ] Click "Go to dashboard" → land on `/dashboard`
- [ ] Refresh `/onboarding?step=2` → state persists (URL-driven)
- [ ] Visit `/onboarding?step=999` → `validateSearch` falls back to step 1

AI escalation drafts:
- [ ] In Stripe Dashboard → Developers → Webhooks → trigger a `payment_intent.payment_failed` event with `amount = 60000` (€600, above the default €500 threshold)
- [ ] Within ~2-5s, check the `escalation` row in the DB (`bun run db:studio`): `draftSubject` and `draftBody` are populated, body is 2-3 sentences and mentions the customer name
- [ ] Temporarily set `ANTHROPIC_API_KEY` to an invalid value → trigger another high-value failure → confirm fallback draft is written (`"Hi {customerName}, I noticed your recent payment..."`) and an error is logged
- [ ] Restore the API key. From the dashboard escalations list, click "Regenerate draft" → row updates with a new body

Performance:
- [ ] Webhook responds in <1s even when Anthropic call takes 3-5s (the call is fire-and-forget)

---

- [ ] **Step 8: Commit**

```bash
git add apps/web/src/lib/anthropic.ts apps/web/src/functions/escalations.ts apps/web/src/routes/api/stripe/webhook.ts apps/web/src/routes/onboarding.tsx apps/web/src/components/sign-up-form.tsx apps/web/src/functions/stripe.ts
git commit -m "feat(onboarding): add wizard route + AI escalation draft generation

- New /onboarding route with URL-driven 3-step wizard (Stripe, Resend, done)
- Anthropic SDK client (claude-sonnet-4-6) for escalation drafts
- Fire-and-forget generateEscalationDraft hooked into Stripe webhook
- Fallback draft on AI error; regenerateEscalationDraft server function
- signUp callbackURL points post-verification users to /onboarding"
```
---

## Acceptance Criteria

Run through this checklist after all tasks are complete:

**Auth (Task 2)**
- [ ] Sign-up sends a verification email via platform Resend key; user sees "check inbox" message
- [ ] Verification link logs the user in and redirects to `/onboarding`
- [ ] "Forgot password" flow sends reset email; token-based reset works end-to-end at `/reset-password`
- [ ] Rate limiting blocks >10 auth attempts per 60s per IP
- [ ] Sessions expire after 7 days; cookie refreshes daily
- [ ] `useSecureCookies` is active when `NODE_ENV=production`

**Stripe (Tasks 3 + 6)**
- [ ] User can connect a Stripe account via OAuth; `stripeConnection` row is created with encrypted access token + webhook secret
- [ ] Default recovery sequences are seeded on first Stripe connect (one per failure code)
- [ ] `/api/stripe/webhook` verifies signatures correctly using the per-connection secret looked up via `event.account`
- [ ] `payment_intent.payment_failed` creates a `failedPayment` + `recoveryAttempt` rows
- [ ] `payment_intent.succeeded` / `invoice.payment_succeeded` marks failures as `recovered` and dismisses pending attempts
- [ ] Stripe disconnect deletes the connection and best-effort removes the webhook endpoint

**Email engine (Task 4)**
- [ ] Scheduler sends due recovery emails using the user's Resend API key + from address
- [ ] Template variables (`{{customer_name}}`, `{{amount}}`, `{{update_payment_url}}`, etc.) render correctly
- [ ] `recoveryAttempt` rows transition `scheduled → sent` with `sentAt` + `resendEmailId`
- [ ] Failures are recorded with `errorMessage`, never silently dropped
- [ ] Manual trigger `GET /api/cron/process-emails` with Bearer auth returns counts

**Dashboard + Payments (Task 5)**
- [ ] `/dashboard` shows real stats: recovered amount (this month), in-recovery count, success rate, MRR at risk
- [ ] Recent payments table shows real `failedPayment` rows
- [ ] "Connect Stripe" banner is only visible when not connected
- [ ] `/payments` lists all payments with status filter + pagination

**Sequences + Settings (Task 6)**
- [ ] `/sequences` allows editing step subject, body, delay; changes persist
- [ ] Add/remove step works
- [ ] "Reset to defaults" restores the seeded sequences
- [ ] `/settings` saves email provider config (encrypted apiKey)
- [ ] "Send test email" delivers a test email
- [ ] Escalation threshold + currency persist

**Onboarding + AI (Task 7)**
- [ ] `/onboarding` wizard advances correctly through Stripe → email provider → done
- [ ] URL search param `?step=N` lets the user refresh without losing state
- [ ] High-value (>= threshold) failed payments create `escalation` rows
- [ ] Anthropic generates a 2–3 sentence draft within ~5s of the webhook firing
- [ ] AI failures fall back to a sane default draft

**Cross-cutting**
- [ ] `bun run check-types` passes with no new errors
- [ ] `bun test` passes (encrypt + template renderer)
- [ ] No hardcoded hex values introduced in any component (search for `#00e87b`, `emerald-`, etc.)
- [ ] No new design tokens introduced; only existing `bg-dunlo*`, `text-dunlo*`, `border-dunlo*` used

---

## Execution Handoff

Two execution options once the plan is complete:

**1. Subagent-Driven (recommended)** — Dispatch a fresh subagent per task, review between tasks, fast iteration. Uses `superpowers:subagent-driven-development`.

**2. Inline Execution** — Execute tasks in this session using `superpowers:executing-plans`, batched with checkpoints for review.

Either way, work in a git worktree (`superpowers:using-git-worktrees`) so the main branch stays clean while the plan is implemented.
