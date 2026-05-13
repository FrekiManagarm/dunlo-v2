# Escalations & Alerts Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/escalations` and `/alerts` dashboard pages, wire up notification delivery (email + Slack) for key payment events, and update all sidebar navs to link to the new routes.

**Architecture:** Escalations page wraps pre-existing server functions (`functions/escalations.ts`) in a card UI with editable AI drafts. Alerts page derives its event feed from existing DB tables (no new event log table) and stores per-event notification toggles + Slack URL in a new `notification_settings` table. A shared `lib/notifications.ts` utility handles fire-and-forget delivery triggered from the webhook handler and email scheduler.

**Tech Stack:** TanStack Start (SSR), TanStack Router file-based routes, Drizzle ORM + Neon PostgreSQL, Tailwind CSS v4, Resend (email), Slack incoming webhooks (fetch), Vitest

---

## File Map

| Action | Path |
|---|---|
| Modify | `packages/db/src/schema/domain.ts` |
| Create | `apps/web/src/functions/alerts.ts` |
| Create | `apps/web/src/lib/notifications.ts` |
| Create | `apps/web/src/lib/notifications.test.ts` |
| Create | `apps/web/src/routes/escalations.tsx` |
| Create | `apps/web/src/routes/alerts.tsx` |
| Modify | `apps/web/src/routes/api/stripe/webhook.ts` |
| Modify | `apps/web/src/functions/scheduler.ts` |
| Modify | `apps/web/src/routes/dashboard.tsx` |
| Modify | `apps/web/src/routes/payments.tsx` |
| Modify | `apps/web/src/routes/sequences.tsx` |
| Modify | `apps/web/src/routes/settings.tsx` |

---

## Task 1: Add `notification_settings` table to DB schema

**Files:**
- Modify: `packages/db/src/schema/domain.ts`

- [ ] **Step 1: Add table definition**

Open `packages/db/src/schema/domain.ts`. After the `escalation` table (around line 205) and before the `// ---------- Relations ----------` comment, add:

```ts
export const notificationSettings = pgTable(
  "notification_settings",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    emailOnFailure: boolean("email_on_failure").default(true).notNull(),
    emailOnRecovery: boolean("email_on_recovery").default(true).notNull(),
    emailOnEscalation: boolean("email_on_escalation").default(true).notNull(),
    emailOnEmailSent: boolean("email_on_email_sent").default(false).notNull(),
    slackOnFailure: boolean("slack_on_failure").default(false).notNull(),
    slackOnRecovery: boolean("slack_on_recovery").default(false).notNull(),
    slackOnEscalation: boolean("slack_on_escalation").default(true).notNull(),
    slackOnEmailSent: boolean("slack_on_email_sent").default(false).notNull(),
    slackWebhookUrl: text("slack_webhook_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("notification_settings_user_id_idx").on(table.userId)],
);
```

Also add a relation at the bottom of the file (after `escalationRelations`):

```ts
export const notificationSettingsRelations = relations(
  notificationSettings,
  ({ one }) => ({
    user: one(user, {
      fields: [notificationSettings.userId],
      references: [user.id],
    }),
  }),
);
```

- [ ] **Step 2: Push schema to database**

```bash
bun run db:push
```

Expected: prompts confirm, then `All changes applied`.

- [ ] **Step 3: Commit**

```bash
git add packages/db/src/schema/domain.ts
git commit -m "feat(db): add notification_settings table"
```

---

## Task 2: Create `functions/alerts.ts` with server functions

**Files:**
- Create: `apps/web/src/functions/alerts.ts`

- [ ] **Step 1: Create the file**

Create `apps/web/src/functions/alerts.ts` with the full content:

```ts
import { db } from "@dunlo-v2/db";
import {
  escalation,
  failedPayment,
  notificationSettings,
  recoveryAttempt,
} from "@dunlo-v2/db/schema/domain";
import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { authMiddleware } from "@/middleware/auth";

export type AlertEventType = "failure" | "recovery" | "escalation" | "emailSent";

export type FeedEvent = {
  id: string;
  type: AlertEventType;
  label: string;
  customerName: string | null;
  customerEmail: string;
  amount: number;
  currency: string;
  timestamp: Date;
};

export type NotificationSettings = {
  id: string;
  userId: string;
  emailOnFailure: boolean;
  emailOnRecovery: boolean;
  emailOnEscalation: boolean;
  emailOnEmailSent: boolean;
  slackOnFailure: boolean;
  slackOnRecovery: boolean;
  slackOnEscalation: boolean;
  slackOnEmailSent: boolean;
  slackWebhookUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export const getAlertFeed = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<FeedEvent[]> => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    const [failures, escalations, sentAttempts] = await Promise.all([
      db
        .select()
        .from(failedPayment)
        .where(eq(failedPayment.userId, userId))
        .orderBy(desc(failedPayment.createdAt)),
      db
        .select()
        .from(escalation)
        .innerJoin(failedPayment, eq(escalation.failedPaymentId, failedPayment.id))
        .where(eq(escalation.userId, userId))
        .orderBy(desc(escalation.createdAt)),
      db
        .select({ attempt: recoveryAttempt, payment: failedPayment })
        .from(recoveryAttempt)
        .innerJoin(
          failedPayment,
          eq(recoveryAttempt.failedPaymentId, failedPayment.id),
        )
        .where(
          and(
            eq(failedPayment.userId, userId),
            eq(recoveryAttempt.status, "sent"),
          ),
        )
        .orderBy(desc(recoveryAttempt.sentAt)),
    ]);

    const events: FeedEvent[] = [];

    for (const p of failures) {
      events.push({
        id: `failure-${p.id}`,
        type: "failure",
        label: "New failed payment",
        customerName: p.customerName,
        customerEmail: p.customerEmail,
        amount: p.amount,
        currency: p.currency,
        timestamp: p.createdAt,
      });
    }

    for (const p of failures) {
      if (p.status === "recovered" && p.recoveredAt) {
        events.push({
          id: `recovery-${p.id}`,
          type: "recovery",
          label: "Payment recovered",
          customerName: p.customerName,
          customerEmail: p.customerEmail,
          amount: p.amount,
          currency: p.currency,
          timestamp: p.recoveredAt,
        });
      }
    }

    for (const row of escalations) {
      events.push({
        id: `escalation-${row.escalation.id}`,
        type: "escalation",
        label: "Escalation triggered",
        customerName: row.failed_payment.customerName,
        customerEmail: row.failed_payment.customerEmail,
        amount: row.failed_payment.amount,
        currency: row.failed_payment.currency,
        timestamp: row.escalation.createdAt,
      });
    }

    for (const { attempt, payment } of sentAttempts) {
      if (attempt.sentAt) {
        events.push({
          id: `emailSent-${attempt.id}`,
          type: "emailSent",
          label: "Recovery email sent",
          customerName: payment.customerName,
          customerEmail: payment.customerEmail,
          amount: payment.amount,
          currency: payment.currency,
          timestamp: attempt.sentAt,
        });
      }
    }

    return events
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 50);
  });

export const getNotificationSettings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<NotificationSettings> => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    const [existing] = await db
      .select()
      .from(notificationSettings)
      .where(eq(notificationSettings.userId, userId))
      .limit(1);

    if (existing) return existing as NotificationSettings;

    const [created] = await db
      .insert(notificationSettings)
      .values({ id: crypto.randomUUID(), userId })
      .returning();

    return created as NotificationSettings;
  });

const settingsSchema = z.object({
  emailOnFailure: z.boolean(),
  emailOnRecovery: z.boolean(),
  emailOnEscalation: z.boolean(),
  emailOnEmailSent: z.boolean(),
  slackOnFailure: z.boolean(),
  slackOnRecovery: z.boolean(),
  slackOnEscalation: z.boolean(),
  slackOnEmailSent: z.boolean(),
  slackWebhookUrl: z.string().url().nullable().or(z.literal("")).transform((v) => v || null),
});

export const updateNotificationSettings = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((input) => settingsSchema.parse(input))
  .handler(async ({ context, data }) => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    await db
      .insert(notificationSettings)
      .values({ id: crypto.randomUUID(), userId, ...data })
      .onConflictDoUpdate({
        target: notificationSettings.userId,
        set: { ...data, updatedAt: new Date() },
      });

    return { ok: true };
  });
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/functions/alerts.ts
git commit -m "feat: add alerts server functions (feed + notification settings)"
```

---

## Task 3: Create `lib/notifications.ts` delivery utility + tests

**Files:**
- Create: `apps/web/src/lib/notifications.ts`
- Create: `apps/web/src/lib/notifications.test.ts`

- [ ] **Step 1: Write the failing test first**

Create `apps/web/src/lib/notifications.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildAlertMessage } from "./notifications";

describe("buildAlertMessage", () => {
  it("returns correct label for failure event", () => {
    const { label } = buildAlertMessage("failure", "John Doe", "j@x.com", 5000, "eur");
    expect(label).toBe("New failed payment");
  });

  it("returns correct label for recovery event", () => {
    const { label } = buildAlertMessage("recovery", null, "j@x.com", 2000, "usd");
    expect(label).toBe("Payment recovered");
  });

  it("returns correct label for escalation event", () => {
    const { label } = buildAlertMessage("escalation", "Alice", "a@x.com", 15000, "eur");
    expect(label).toBe("Escalation triggered");
  });

  it("returns correct label for emailSent event", () => {
    const { label } = buildAlertMessage("emailSent", "Bob", "b@x.com", 3000, "gbp");
    expect(label).toBe("Recovery email sent");
  });

  it("uses email as customer display when name is null", () => {
    const { message } = buildAlertMessage("recovery", null, "jane@example.com", 2000, "eur");
    expect(message).toContain("jane@example.com");
    expect(message).not.toContain("null");
  });

  it("includes formatted amount in the message", () => {
    const { message } = buildAlertMessage("failure", "John", "j@x.com", 10000, "eur");
    expect(message).toContain("€100.00");
  });

  it("subject includes the event label", () => {
    const { subject, label } = buildAlertMessage("escalation", "Alice", "a@x.com", 5000, "eur");
    expect(subject).toContain(label);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd apps/web && bun run test
```

Expected: FAIL — `Cannot find module './notifications'`

- [ ] **Step 3: Create the implementation**

Create `apps/web/src/lib/notifications.ts`:

```ts
import { db } from "@dunlo-v2/db";
import { notificationSettings } from "@dunlo-v2/db/schema/domain";
import { user } from "@dunlo-v2/db/schema/auth";
import { eq } from "drizzle-orm";
import { env } from "@dunlo-v2/env/server";
import { Resend } from "resend";
import { formatAmount } from "./template";
import type { AlertEventType } from "@/functions/alerts";

export { AlertEventType };

type AlertPayload = {
  userId: string;
  eventType: AlertEventType;
  customerName: string | null;
  customerEmail: string;
  amount: number;
  currency: string;
};

const LABELS: Record<AlertEventType, string> = {
  failure: "New failed payment",
  recovery: "Payment recovered",
  escalation: "Escalation triggered",
  emailSent: "Recovery email sent",
};

export function buildAlertMessage(
  eventType: AlertEventType,
  customerName: string | null,
  customerEmail: string,
  amount: number,
  currency: string,
): { label: string; subject: string; message: string } {
  const label = LABELS[eventType];
  const customer = customerName ?? customerEmail;
  const amountStr = formatAmount(amount, currency);

  return {
    label,
    subject: `Dunlo alert: ${label}`,
    message: `${label}: ${customer} — ${amountStr}`,
  };
}

type NotificationSettingsRow = typeof notificationSettings.$inferSelect;

function emailToggleOn(settings: NotificationSettingsRow, eventType: AlertEventType): boolean {
  const map: Record<AlertEventType, boolean> = {
    failure: settings.emailOnFailure,
    recovery: settings.emailOnRecovery,
    escalation: settings.emailOnEscalation,
    emailSent: settings.emailOnEmailSent,
  };
  return map[eventType];
}

function slackToggleOn(settings: NotificationSettingsRow, eventType: AlertEventType): boolean {
  const map: Record<AlertEventType, boolean> = {
    failure: settings.slackOnFailure,
    recovery: settings.slackOnRecovery,
    escalation: settings.slackOnEscalation,
    emailSent: settings.slackOnEmailSent,
  };
  return map[eventType];
}

export async function sendAlertNotification(payload: AlertPayload): Promise<void> {
  const [settings] = await db
    .select()
    .from(notificationSettings)
    .where(eq(notificationSettings.userId, payload.userId))
    .limit(1);

  if (!settings) return;

  const { label, subject, message } = buildAlertMessage(
    payload.eventType,
    payload.customerName,
    payload.customerEmail,
    payload.amount,
    payload.currency,
  );

  if (emailToggleOn(settings, payload.eventType)) {
    const [ownerRow] = await db
      .select({ email: user.email })
      .from(user)
      .where(eq(user.id, payload.userId))
      .limit(1);

    if (ownerRow?.email) {
      try {
        const resend = new Resend(env.RESEND_API_KEY);
        await resend.emails.send({
          from: "Dunlo Alerts <alerts@dunlo.co>",
          to: ownerRow.email,
          subject,
          html: `<p>${message}</p><p style="margin-top:16px"><a href="${env.APP_URL}/dashboard">View dashboard →</a></p>`,
        });
      } catch (e) {
        console.error("[notifications] email delivery failed", e);
      }
    }
  }

  if (slackToggleOn(settings, payload.eventType) && settings.slackWebhookUrl) {
    try {
      await fetch(settings.slackWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message }),
      });
    } catch (e) {
      console.error("[notifications] slack delivery failed", e);
    }
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd apps/web && bun run test
```

Expected: All `buildAlertMessage` tests PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/notifications.ts apps/web/src/lib/notifications.test.ts
git commit -m "feat: add notifications delivery utility with tests"
```

---

## Task 4: Create the Escalations page

**Files:**
- Create: `apps/web/src/routes/escalations.tsx`

- [ ] **Step 1: Create the route file**

Create `apps/web/src/routes/escalations.tsx`:

```tsx
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  AlertCircle,
  Bell,
  CheckCircle,
  LayoutDashboard,
  LogOut,
  Receipt,
  RefreshCw,
  Send,
  Settings,
  Trash2,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/logo";
import { authClient } from "@/lib/auth-client";
import { getUser } from "@/functions/get-user";
import {
  dismissEscalation,
  getEscalations,
  regenerateEscalationDraft,
  sendEscalationEmail,
  updateEscalationDraft,
  type EscalationRow,
} from "@/functions/escalations";
import { formatAmount, humanizeFailureCode } from "@/lib/template";

export const Route = createFileRoute("/escalations")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Escalations — Dunlo" },
    ],
  }),
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await getUser();
    return { session };
  },
  loader: async ({ context }) => {
    if (!context.session) throw redirect({ to: "/login" });
    const escalations = await getEscalations();
    return { escalations };
  },
});

function relativeTime(from: Date): string {
  const diffMs = Date.now() - from.getTime();
  const sec = Math.max(0, Math.floor(diffMs / 1000));
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

type CardEdit = { subject: string; body: string };
type BusyState = { sending: boolean; regenerating: boolean; dismissing: boolean };

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Overview", to: "/dashboard" as const },
  { icon: Receipt, label: "Payments", to: "/payments" as const },
  { icon: Zap, label: "Recovery sequences", to: "/sequences" as const },
  { icon: AlertCircle, label: "Escalations", to: "/escalations" as const, active: true },
  { icon: Bell, label: "Alerts", to: "/alerts" as const },
  { icon: Settings, label: "Settings", to: "/settings" as const },
] as const;

function RouteComponent() {
  const { session } = Route.useRouteContext();
  const { escalations: initial } = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const [items, setItems] = useState<EscalationRow[]>(initial);
  const [edits, setEdits] = useState<Record<string, CardEdit>>(() =>
    Object.fromEntries(
      initial.map((e) => [
        e.id,
        { subject: e.draftSubject ?? "", body: e.draftBody ?? "" },
      ]),
    ),
  );
  const [busy, setBusy] = useState<Record<string, BusyState>>(() =>
    Object.fromEntries(
      initial.map((e) => [
        e.id,
        { sending: false, regenerating: false, dismissing: false },
      ]),
    ),
  );
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const handleSignOut = () => {
    authClient.signOut({
      fetchOptions: { onSuccess: () => navigate({ to: "/" }) },
    });
  };

  function scheduleAutoSave(id: string, subject: string, body: string) {
    clearTimeout(saveTimers.current[id]);
    saveTimers.current[id] = setTimeout(async () => {
      if (!subject.trim() || !body.trim()) return;
      try {
        await updateEscalationDraft({ data: { escalationId: id, subject, body } });
      } catch (e) {
        console.error("[escalations] auto-save failed", e);
      }
    }, 1000);
  }

  function setEdit(id: string, field: "subject" | "body", value: string) {
    const next = { ...edits[id], [field]: value };
    setEdits((prev) => ({ ...prev, [id]: next }));
    scheduleAutoSave(id, next.subject, next.body);
  }

  async function handleSend(id: string) {
    setBusy((prev) => ({ ...prev, [id]: { ...prev[id], sending: true } }));
    try {
      await sendEscalationEmail({ data: { escalationId: id } });
      setItems((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: "sent" as const } : e)),
      );
      toast.success("Email sent");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setBusy((prev) => ({ ...prev, [id]: { ...prev[id], sending: false } }));
    }
  }

  async function handleRegenerate(id: string) {
    setBusy((prev) => ({ ...prev, [id]: { ...prev[id], regenerating: true } }));
    try {
      await regenerateEscalationDraft({ data: { escalationId: id } });
      const refreshed = await getEscalations();
      setItems(refreshed);
      const updated = refreshed.find((e) => e.id === id);
      if (updated) {
        setEdits((prev) => ({
          ...prev,
          [id]: {
            subject: updated.draftSubject ?? "",
            body: updated.draftBody ?? "",
          },
        }));
      }
      toast.success("Draft regenerated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to regenerate");
    } finally {
      setBusy((prev) => ({
        ...prev,
        [id]: { ...prev[id], regenerating: false },
      }));
    }
  }

  async function handleDismiss(id: string) {
    setBusy((prev) => ({ ...prev, [id]: { ...prev[id], dismissing: true } }));
    try {
      await dismissEscalation({ data: { escalationId: id } });
      setItems((prev) => prev.filter((e) => e.id !== id));
      toast.success("Escalation dismissed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to dismiss");
    } finally {
      setBusy((prev) => ({
        ...prev,
        [id]: { ...prev[id], dismissing: false },
      }));
    }
  }

  const pendingCount = items.filter((e) => e.status === "pending").length;

  return (
    <div className="flex h-dvh bg-[#f7f8fa] font-sans">
      <aside className="hidden h-dvh w-60 shrink-0 sticky top-0 flex-col border-r border-gray-100 bg-white lg:flex">
        <div className="flex items-center border-b border-gray-100 px-5 py-4">
          <Logo size={26} />
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ icon: Icon, label, to, active }) => (
            <Link
              key={label}
              to={to}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
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
            <h1 className="text-base font-bold text-gray-900">Escalations</h1>
            <p className="text-xs text-gray-400">
              {pendingCount > 0
                ? `${pendingCount} pending manual action`
                : "All clear"}
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl space-y-4 p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <CheckCircle size={40} className="mb-3 text-gray-200" />
              <p className="text-sm font-medium text-gray-500">No escalations</p>
              <p className="mt-1 text-xs text-gray-400">
                Payments above your threshold will appear here. Adjust the
                threshold in{" "}
                <Link to="/settings" className="text-dunlo-dim underline">
                  Settings
                </Link>
                .
              </p>
            </div>
          ) : (
            items.map((esc) => {
              const edit = edits[esc.id] ?? { subject: "", body: "" };
              const b = busy[esc.id] ?? {
                sending: false,
                regenerating: false,
                dismissing: false,
              };
              const draftReady = Boolean(esc.draftSubject);
              const isSent = esc.status === "sent";

              return (
                <div
                  key={esc.id}
                  className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {esc.payment.customerName ?? esc.payment.customerEmail}
                      </p>
                      <p className="text-xs text-gray-400">
                        {esc.payment.customerEmail}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                      <span className="text-xs font-semibold text-gray-900">
                        {formatAmount(
                          esc.payment.amount,
                          esc.payment.currency,
                        )}
                      </span>
                      <span className="rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize text-gray-600">
                        {humanizeFailureCode(esc.payment.failureCode)}
                      </span>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                          isSent
                            ? "border-dunlo/25 bg-dunlo/8 text-dunlo-deep"
                            : "border-amber-200 bg-amber-50 text-amber-700"
                        }`}
                      >
                        {isSent ? "sent" : "pending"}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    {relativeTime(new Date(esc.createdAt))}
                  </p>

                  {!draftReady ? (
                    <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-gray-50 py-6 text-center">
                      <RefreshCw
                        size={14}
                        className="mb-1.5 animate-spin text-gray-400"
                      />
                      <p className="text-xs text-gray-400">
                        AI is drafting your email…
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-2">
                      <input
                        type="text"
                        value={edit.subject}
                        onChange={(e) =>
                          setEdit(esc.id, "subject", e.target.value)
                        }
                        disabled={isSent}
                        placeholder="Subject"
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-dunlo/30 disabled:opacity-50"
                      />
                      <textarea
                        value={edit.body}
                        onChange={(e) =>
                          setEdit(esc.id, "body", e.target.value)
                        }
                        disabled={isSent}
                        rows={4}
                        placeholder="Email body"
                        className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-dunlo/30 disabled:opacity-50"
                      />
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleDismiss(esc.id)}
                      disabled={b.dismissing}
                      className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-1.5 text-xs text-gray-500 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                      <Trash2 size={12} />
                      Dismiss
                    </button>
                    <button
                      onClick={() => handleRegenerate(esc.id)}
                      disabled={b.regenerating || isSent}
                      className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-1.5 text-xs text-gray-500 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                      <RefreshCw
                        size={12}
                        className={b.regenerating ? "animate-spin" : ""}
                      />
                      Regenerate
                    </button>
                    <button
                      onClick={() => handleSend(esc.id)}
                      disabled={b.sending || !draftReady || isSent}
                      className="flex items-center gap-1.5 rounded-xl bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-gray-700 disabled:opacity-50"
                    >
                      <Send size={12} />
                      {b.sending ? "Sending…" : "Send"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Verify type-check passes for this file**

```bash
cd apps/web && bunx tsc --noEmit 2>&1 | grep escalations
```

Expected: no output (no errors in escalations.tsx).

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/routes/escalations.tsx
git commit -m "feat: add escalations page"
```

---

## Task 5: Create the Alerts page

**Files:**
- Create: `apps/web/src/routes/alerts.tsx`

- [ ] **Step 1: Create the route file**

Create `apps/web/src/routes/alerts.tsx`:

```tsx
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  AlertCircle,
  Bell,
  CheckCircle,
  LayoutDashboard,
  LogOut,
  Mail,
  Receipt,
  Save,
  Settings,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/logo";
import { authClient } from "@/lib/auth-client";
import { getUser } from "@/functions/get-user";
import {
  getAlertFeed,
  getNotificationSettings,
  updateNotificationSettings,
  type AlertEventType,
  type FeedEvent,
  type NotificationSettings,
} from "@/functions/alerts";
import { formatAmount } from "@/lib/template";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Alerts — Dunlo" },
    ],
  }),
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await getUser();
    return { session };
  },
  loader: async ({ context }) => {
    if (!context.session) throw redirect({ to: "/login" });
    const [feed, settings] = await Promise.all([
      getAlertFeed(),
      getNotificationSettings(),
    ]);
    return { feed, settings };
  },
});

function relativeTime(from: Date): string {
  const diffMs = Date.now() - from.getTime();
  const sec = Math.max(0, Math.floor(diffMs / 1000));
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

const EVENT_ICON: Record<AlertEventType, React.ElementType> = {
  failure: AlertCircle,
  recovery: CheckCircle,
  escalation: TrendingUp,
  emailSent: Mail,
};

const EVENT_COLOR: Record<AlertEventType, string> = {
  failure: "text-red-500",
  recovery: "text-dunlo",
  escalation: "text-amber-500",
  emailSent: "text-blue-500",
};

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Overview", to: "/dashboard" as const },
  { icon: Receipt, label: "Payments", to: "/payments" as const },
  { icon: Zap, label: "Recovery sequences", to: "/sequences" as const },
  { icon: AlertCircle, label: "Escalations", to: "/escalations" as const },
  { icon: Bell, label: "Alerts", to: "/alerts" as const, active: true },
  { icon: Settings, label: "Settings", to: "/settings" as const },
] as const;

type EmailToggleKey = "emailOnFailure" | "emailOnRecovery" | "emailOnEscalation" | "emailOnEmailSent";
type SlackToggleKey = "slackOnFailure" | "slackOnRecovery" | "slackOnEscalation" | "slackOnEmailSent";

const EMAIL_TOGGLES: { key: EmailToggleKey; label: string }[] = [
  { key: "emailOnFailure", label: "Failed payment" },
  { key: "emailOnRecovery", label: "Payment recovered" },
  { key: "emailOnEscalation", label: "Escalation triggered" },
  { key: "emailOnEmailSent", label: "Recovery email sent" },
];

const SLACK_TOGGLES: { key: SlackToggleKey; label: string }[] = [
  { key: "slackOnFailure", label: "Failed payment" },
  { key: "slackOnRecovery", label: "Payment recovered" },
  { key: "slackOnEscalation", label: "Escalation triggered" },
  { key: "slackOnEmailSent", label: "Recovery email sent" },
];

function RouteComponent() {
  const { session } = Route.useRouteContext();
  const { feed, settings: initialSettings } = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const [settings, setSettings] = useState<NotificationSettings>(initialSettings);
  const [saving, setSaving] = useState(false);

  const handleSignOut = () => {
    authClient.signOut({
      fetchOptions: { onSuccess: () => navigate({ to: "/" }) },
    });
  };

  async function handleSave() {
    setSaving(true);
    try {
      await updateNotificationSettings({
        data: {
          emailOnFailure: settings.emailOnFailure,
          emailOnRecovery: settings.emailOnRecovery,
          emailOnEscalation: settings.emailOnEscalation,
          emailOnEmailSent: settings.emailOnEmailSent,
          slackOnFailure: settings.slackOnFailure,
          slackOnRecovery: settings.slackOnRecovery,
          slackOnEscalation: settings.slackOnEscalation,
          slackOnEmailSent: settings.slackOnEmailSent,
          slackWebhookUrl: settings.slackWebhookUrl ?? "",
        },
      });
      toast.success("Notification settings saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-dvh bg-[#f7f8fa] font-sans">
      <aside className="hidden h-dvh w-60 shrink-0 sticky top-0 flex-col border-r border-gray-100 bg-white lg:flex">
        <div className="flex items-center border-b border-gray-100 px-5 py-4">
          <Logo size={26} />
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ icon: Icon, label, to, active }) => (
            <Link
              key={label}
              to={to}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
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
        <div className="sticky top-0 z-20 flex items-center border-b border-gray-100 bg-white/80 px-6 py-4 backdrop-blur-md">
          <div>
            <h1 className="text-base font-bold text-gray-900">Alerts</h1>
            <p className="text-xs text-gray-400">
              Activity feed and notification settings
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl space-y-6 p-6">
          {/* Activity Feed */}
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Activity
            </h2>
            <div className="divide-y divide-gray-50 rounded-2xl border border-gray-100 bg-white shadow-sm">
              {feed.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Bell size={32} className="mb-3 text-gray-200" />
                  <p className="text-sm font-medium text-gray-500">
                    No activity yet
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Events will appear here once Stripe is connected and
                    payments start flowing.
                  </p>
                </div>
              ) : (
                feed.map((event: FeedEvent) => {
                  const Icon = EVENT_ICON[event.type];
                  return (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 px-5 py-3"
                    >
                      <Icon
                        size={15}
                        className={`shrink-0 ${EVENT_COLOR[event.type]}`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {event.label}
                        </p>
                        <p className="truncate text-xs text-gray-400">
                          {event.customerName ?? event.customerEmail} —{" "}
                          {formatAmount(event.amount, event.currency)}
                        </p>
                      </div>
                      <p className="shrink-0 text-xs text-gray-300">
                        {relativeTime(new Date(event.timestamp))}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Notification Settings */}
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Notification settings
            </h2>
            <div className="space-y-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              {/* Email */}
              <div>
                <p className="mb-3 text-sm font-semibold text-gray-900">
                  Email notifications
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {EMAIL_TOGGLES.map(({ key, label }) => (
                    <label
                      key={key}
                      className="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
                    >
                      <input
                        type="checkbox"
                        checked={settings[key]}
                        onChange={(e) =>
                          setSettings((s) => ({ ...s, [key]: e.target.checked }))
                        }
                        className="rounded border-gray-300 text-dunlo focus:ring-dunlo/30"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Slack */}
              <div>
                <p className="mb-3 text-sm font-semibold text-gray-900">
                  Slack notifications
                </p>
                <input
                  type="url"
                  value={settings.slackWebhookUrl ?? ""}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      slackWebhookUrl: e.target.value || null,
                    }))
                  }
                  placeholder="https://hooks.slack.com/services/…"
                  className="mb-3 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-dunlo/30"
                />
                <div className="grid grid-cols-2 gap-2">
                  {SLACK_TOGGLES.map(({ key, label }) => (
                    <label
                      key={key}
                      className="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
                    >
                      <input
                        type="checkbox"
                        checked={settings[key]}
                        onChange={(e) =>
                          setSettings((s) => ({ ...s, [key]: e.target.checked }))
                        }
                        className="rounded border-gray-300 text-dunlo focus:ring-dunlo/30"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 disabled:opacity-50"
              >
                <Save size={14} />
                {saving ? "Saving…" : "Save settings"}
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Verify type-check for this file**

```bash
cd apps/web && bunx tsc --noEmit 2>&1 | grep alerts
```

Expected: no output (no errors in alerts.tsx).

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/routes/alerts.tsx
git commit -m "feat: add alerts page with activity feed and notification settings"
```

---

## Task 6: Wire notification delivery into the webhook handler

**Files:**
- Modify: `apps/web/src/routes/api/stripe/webhook.ts`

- [ ] **Step 1: Add import for `sendAlertNotification`**

At the top of `apps/web/src/routes/api/stripe/webhook.ts`, add after the existing imports:

```ts
import { sendAlertNotification } from "@/lib/notifications";
```

- [ ] **Step 2: Change `processFailedPayment` return type to return event info**

Change the signature from `Promise<void>` to return a result object. Replace the current function signature line:

```ts
export async function processFailedPayment(
  event: Stripe.Event,
  connection: DecryptedStripeConnection,
): Promise<void> {
```

with:

```ts
type FailedPaymentResult = {
  wasEscalated: boolean;
  customerName: string | null;
  customerEmail: string;
  amount: number;
  currency: string;
} | null;

export async function processFailedPayment(
  event: Stripe.Event,
  connection: DecryptedStripeConnection,
): Promise<FailedPaymentResult> {
```

- [ ] **Step 3: Add return statements inside `processFailedPayment`**

The function currently has two early-exit `return;` paths (one when context is null, one after the dedup check) and falls off the end. Change all `return;` to `return null;`, and add a return value at the end and after the escalation branch.

Replace the current function body's `return;` statements and end of function:

After `if (!ctx) return;` → `if (!ctx) return null;`

After `if (!ctx.customerEmail)` block → `return null;` (already falls through)

After `if (existing.length > 0) return;` → `if (existing.length > 0) return null;`

After the `if (shouldEscalate)` block (before `return;`), change to:
```ts
    generateEscalationDraft(escalationId).catch((e) =>
      console.error("[stripe/webhook] AI draft failed:", e),
    );
    return {
      wasEscalated: true,
      customerName: ctx.customerName,
      customerEmail: ctx.customerEmail,
      amount: ctx.amount,
      currency: ctx.currency,
    };
```

At the end of the function (after inserting recovery attempts), add:
```ts
  return {
    wasEscalated: false,
    customerName: ctx.customerName,
    customerEmail: ctx.customerEmail,
    amount: ctx.amount,
    currency: ctx.currency,
  };
```

- [ ] **Step 4: Change `processRecoveredPayment` return type**

Change:
```ts
export async function processRecoveredPayment(
  event: Stripe.Event,
  connection: DecryptedStripeConnection,
): Promise<void> {
```

to:

```ts
type RecoveredPaymentResult = {
  customerName: string | null;
  customerEmail: string;
  amount: number;
  currency: string;
} | null;

export async function processRecoveredPayment(
  event: Stripe.Event,
  connection: DecryptedStripeConnection,
): Promise<RecoveredPaymentResult> {
```

Then change `if (!target) return;` to `if (!target) return null;`, and add at the end of the function (after both `db.update` calls):

```ts
  return {
    customerName: target.customerName,
    customerEmail: target.customerEmail,
    amount: target.amount,
    currency: target.currency,
  };
```

- [ ] **Step 5: Use return values to fire notifications in the webhook handler**

In the POST handler, replace:

```ts
        try {
          if (FAILURE_EVENTS.has(event.type)) {
            await processFailedPayment(event, connection);
          } else if (SUCCESS_EVENTS.has(event.type)) {
            await processRecoveredPayment(event, connection);
          }
        } catch (err) {
```

with:

```ts
        try {
          if (FAILURE_EVENTS.has(event.type)) {
            const result = await processFailedPayment(event, connection);
            if (result) {
              sendAlertNotification({
                userId: connection.userId,
                eventType: result.wasEscalated ? "escalation" : "failure",
                customerName: result.customerName,
                customerEmail: result.customerEmail,
                amount: result.amount,
                currency: result.currency,
              }).catch((e) =>
                console.error("[webhook] alert notification failed", e),
              );
            }
          } else if (SUCCESS_EVENTS.has(event.type)) {
            const result = await processRecoveredPayment(event, connection);
            if (result) {
              sendAlertNotification({
                userId: connection.userId,
                eventType: "recovery",
                customerName: result.customerName,
                customerEmail: result.customerEmail,
                amount: result.amount,
                currency: result.currency,
              }).catch((e) =>
                console.error("[webhook] alert notification failed", e),
              );
            }
          }
        } catch (err) {
```

- [ ] **Step 6: Verify type-check**

```bash
cd apps/web && bunx tsc --noEmit 2>&1 | grep webhook
```

Expected: no output.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/routes/api/stripe/webhook.ts
git commit -m "feat: fire alert notifications from stripe webhook handler"
```

---

## Task 7: Wire notification delivery into the email scheduler

**Files:**
- Modify: `apps/web/src/functions/scheduler.ts`

- [ ] **Step 1: Add import**

At the top of `apps/web/src/functions/scheduler.ts`, add after existing imports:

```ts
import { sendAlertNotification } from "@/lib/notifications";
```

- [ ] **Step 2: Fire notification after successful send**

Inside `processScheduledEmails`, find the successful send block (around line 164–173):

```ts
      await db
        .update(recoveryAttempt)
        .set({
          status: "sent",
          sentAt: new Date(),
          resendEmailId: resendId,
        })
        .where(eq(recoveryAttempt.id, attempt.id));

      sent += 1;
```

Add the notification call immediately after `sent += 1;`:

```ts
      sendAlertNotification({
        userId: payment.userId,
        eventType: "emailSent",
        customerName: payment.customerName,
        customerEmail: payment.customerEmail,
        amount: payment.amount,
        currency: payment.currency,
      }).catch((e) =>
        console.error("[scheduler] alert notification failed", e),
      );
```

- [ ] **Step 3: Verify type-check**

```bash
cd apps/web && bunx tsc --noEmit 2>&1 | grep scheduler
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/functions/scheduler.ts
git commit -m "feat: fire alert notifications after recovery email is sent"
```

---

## Task 8: Update all existing sidebars to link to `/escalations` and `/alerts`

**Files:**
- Modify: `apps/web/src/routes/dashboard.tsx`
- Modify: `apps/web/src/routes/payments.tsx`
- Modify: `apps/web/src/routes/sequences.tsx`
- Modify: `apps/web/src/routes/settings.tsx`

Each of these files currently has `to: null` for Escalations and Alerts nav items, which renders them as dead `<button>` elements. Replace `to: null` with the real routes and add `TrendingUp` icon import where needed.

- [ ] **Step 1: Update `dashboard.tsx`**

In `apps/web/src/routes/dashboard.tsx`, find the nav items array. Replace:

```ts
            { icon: AlertCircle, label: "Escalations", to: null, active: false },
            { icon: Bell, label: "Alerts", to: null, active: false },
```

with:

```ts
            { icon: AlertCircle, label: "Escalations", to: "/escalations" as const, active: false },
            { icon: Bell, label: "Alerts", to: "/alerts" as const, active: false },
```

- [ ] **Step 2: Update `payments.tsx`**

In `apps/web/src/routes/payments.tsx`, find the nav items array. Replace:

```ts
            {
              icon: AlertCircle,
              label: "Escalations",
              active: false,
              to: null,
            },
            { icon: Bell, label: "Alerts", active: false, to: null },
```

with:

```ts
            {
              icon: AlertCircle,
              label: "Escalations",
              active: false,
              to: "/escalations" as const,
            },
            { icon: Bell, label: "Alerts", active: false, to: "/alerts" as const },
```

- [ ] **Step 3: Update `sequences.tsx`**

In `apps/web/src/routes/sequences.tsx`, find the nav items array. Replace:

```ts
            { icon: AlertCircle, label: "Escalations", to: null, active: false },
            { icon: Bell, label: "Alerts", to: null, active: false },
```

with:

```ts
            { icon: AlertCircle, label: "Escalations", to: "/escalations" as const, active: false },
            { icon: Bell, label: "Alerts", to: "/alerts" as const, active: false },
```

- [ ] **Step 4: Update `settings.tsx`**

In `apps/web/src/routes/settings.tsx`, find the nav items array. Replace:

```ts
            { icon: AlertCircle, label: "Escalations", to: null, active: false },
            { icon: Bell, label: "Alerts", to: null, active: false },
```

with:

```ts
            { icon: AlertCircle, label: "Escalations", to: "/escalations" as const, active: false },
            { icon: Bell, label: "Alerts", to: "/alerts" as const, active: false },
```

- [ ] **Step 5: Verify type-check**

```bash
cd apps/web && bunx tsc --noEmit 2>&1 | grep -E "dashboard|payments|sequences|settings\.tsx"
```

Expected: no new errors in these files.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/routes/dashboard.tsx apps/web/src/routes/payments.tsx apps/web/src/routes/sequences.tsx apps/web/src/routes/settings.tsx
git commit -m "feat: link escalations and alerts in all sidebar navs"
```

---

## Task 9: Smoke test end-to-end

- [ ] **Step 1: Start the dev server**

```bash
bun run dev:web
```

- [ ] **Step 2: Verify navigation**

Open `http://localhost:3000/dashboard`. Click each sidebar item and confirm:
- Overview (`/dashboard`) ✓
- Payments (`/payments`) ✓
- Recovery sequences (`/sequences`) ✓
- Escalations (`/escalations`) — new page loads, shows empty state
- Alerts (`/alerts`) — new page loads, shows empty feed + settings form
- Settings (`/settings`) ✓

- [ ] **Step 3: Verify Alerts settings save**

On `/alerts`, toggle some checkboxes, enter a fake Slack URL (`https://hooks.slack.com/services/test`), and click Save. Confirm toast shows "Notification settings saved". Reload the page and confirm toggles persist.

- [ ] **Step 4: Run full test suite**

```bash
cd apps/web && bun run test
```

Expected: all tests pass including the new `notifications.test.ts`.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: smoke test complete — escalations and alerts pages ship-ready"
```
