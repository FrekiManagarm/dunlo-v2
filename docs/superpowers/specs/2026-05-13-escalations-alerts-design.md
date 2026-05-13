# Escalations & Alerts Pages — Design Spec

**Date:** 2026-05-13  
**Status:** Approved

---

## Overview

Two new dashboard pages to complete the Dunlo navigation:

1. **Escalations** (`/escalations`) — workbench for high-value failed payments that exceeded the escalation threshold. AI-drafted recovery emails are pre-generated; the user reviews, edits, and sends (or dismisses) them manually.
2. **Alerts** (`/alerts`) — activity feed of key payment events + notification settings to deliver those events to the user via email and/or Slack.

---

## Escalations Page

### Route

`apps/web/src/routes/escalations.tsx` → `/escalations`

### Layout

Same structure as other dashboard pages: `h-dvh` root, `sticky h-dvh` sidebar, `flex-1 overflow-auto` main area. Sidebar active item: "Escalations".

### Content

**Header bar** (sticky, `backdrop-blur`): title "Escalations", subtitle count ("3 pending").

**List of escalation cards** — one card per escalation returned by `getEscalations()`. Cards sorted by `createdAt` descending.

Each card contains:
- Customer name + email (top-left), formatted amount + currency + failure code label (top-right)
- Relative timestamp (`createdAt`)
- Status badge: `pending` (amber) or `sent` (green)
- Editable `<textarea>` for subject (single line) and body — pre-filled from `draftSubject` / `draftBody`. While `draftSubject` is null, show a skeleton/spinner ("AI is drafting…").
- Three action buttons:
  - **Send** — calls `sendEscalationEmail`, disabled if draft not ready or already sent
  - **Regenerate** — calls `regenerateEscalationDraft`, then refreshes; disabled while loading
  - **Dismiss** — calls `dismissEscalation`, removes card from list

**Empty state:** "No escalations — payments above your threshold will appear here. You can adjust the threshold in Settings."

### Server functions used (all pre-existing in `functions/escalations.ts`)

| Function | Trigger |
|---|---|
| `getEscalations()` | Loader |
| `updateEscalationDraft` | onChange debounce on subject/body textareas |
| `sendEscalationEmail` | Send button |
| `regenerateEscalationDraft` | Regenerate button |
| `dismissEscalation` | Dismiss button |

No new server functions needed.

---

## Alerts Page

### Route

`apps/web/src/routes/alerts.tsx` → `/alerts`

### Layout

Same sidebar structure. Active item: "Alerts". Main content split into two sections stacked vertically.

### Section 1 — Activity Feed

Reverse-chronological list of events derived from existing tables. Queried server-side on load via a new `getAlertFeed()` server function.

**Event types:**

| Event | Source table | Timestamp field | Icon |
|---|---|---|---|
| New failed payment | `failed_payment` | `created_at` | `AlertCircle` |
| Payment recovered | `failed_payment WHERE status='recovered'` | `recovered_at` | `CheckCircle` |
| Escalation triggered | `escalation` | `created_at` | `TrendingUp` |
| Recovery email sent | `recovery_attempt WHERE status='sent'` | `sent_at` | `Mail` |

The function assembles all four result sets, attaches a `type` discriminant and a `label`, sorts by timestamp descending, and returns up to 50 entries.

Each feed item displays:
- Icon (colored by type)
- Event label (e.g. "Payment recovered")
- Customer name or email + formatted amount
- Relative timestamp (right-aligned)

**Empty state:** "No activity yet — events will appear here once Stripe is connected and payments start flowing."

### Section 2 — Notification Settings

A settings card below the feed. Managed via new server functions in `functions/alerts.ts`.

**Controls:**

- **Email notifications** toggle group: four per-event on/off toggles (Failed, Recovered, Escalation, Email sent). Email is sent to the authenticated user's address using the existing Resend integration.
- **Slack webhook URL** text input + **Slack notifications** toggle group: same four per-event toggles.
- Save button (calls `updateNotificationSettings`).

### DB change — `notification_settings` table

New table in `packages/db/src/schema/domain.ts`:

```ts
notification_settings (
  id           text PK
  user_id      text FK → user.id CASCADE
  
  // email toggles
  email_on_failure    boolean default true
  email_on_recovery   boolean default true
  email_on_escalation boolean default true
  email_on_email_sent boolean default false
  
  // slack toggles
  slack_on_failure    boolean default false
  slack_on_recovery   boolean default false
  slack_on_escalation boolean default true
  slack_on_email_sent boolean default false
  
  slack_webhook_url   text nullable
  
  created_at  timestamp defaultNow
  updated_at  timestamp defaultNow $onUpdate
)
```

Row is created (with defaults) the first time the user visits the Alerts page or when their Stripe connection is established. `getNotificationSettings` upserts on first read.

### Server functions (new file `functions/alerts.ts`)

| Function | Method | Description |
|---|---|---|
| `getAlertFeed()` | GET | Assembles + sorts events from existing tables, returns top 50 |
| `getNotificationSettings()` | GET | Returns user's settings row (upserts defaults on first call) |
| `updateNotificationSettings` | POST | Validates + saves toggles + Slack URL |

### Notification delivery

When events fire, existing handlers check `notification_settings` and dispatch:

- **Webhook handler** (`api/stripe/webhook.ts`): after `processFailedPayment` and `processRecoveredPayment`, load settings for the user and fire email/Slack if the relevant toggle is on.
- **Email scheduler** (`api/cron/process-emails.ts` or equivalent): after sending a recovery attempt, check settings and fire Slack/email notification if `email_on_email_sent` / `slack_on_email_sent` is on.

Delivery is fire-and-forget (errors logged, not surfaced to webhook response).

**Email format:** Simple transactional email to `user.email` via Resend: subject "Dunlo alert: [event label]", short body with customer name, amount, and link to the relevant dashboard page.

**Slack format:** Plain text message with the same details posted via `fetch` to `slackWebhookUrl`.

---

## Sidebar updates

All four existing dashboard pages (`dashboard.tsx`, `payments.tsx`, `sequences.tsx`, `settings.tsx`) need their sidebar nav updated to include `/escalations` and `/alerts` as linked items (replacing the current dead buttons).

---

## Out of scope

- Push notifications / browser notifications
- Per-customer alert rules
- Notification history / delivery log
- Read/unread state on feed items
