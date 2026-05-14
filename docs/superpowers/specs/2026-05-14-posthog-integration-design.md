# PostHog Integration — Design Spec

**Date:** 2026-05-14  
**Status:** Approved

---

## Overview

Integrate PostHog into the Dunlo web app for product analytics (custom events) and session recording. Coverage is global: landing page, login, and dashboard. Users remain anonymous (no `posthog.identify()` call).

---

## Architecture

### Package

Install `posthog-js` in `apps/web`.

### Environment Variables

Add to `packages/env/src/client.ts` (prefix `VITE_`):

- `VITE_POSTHOG_KEY` — PostHog project API key
- `VITE_POSTHOG_HOST` — PostHog host (e.g. `https://eu.i.posthog.com` or `https://us.i.posthog.com`)

### Initialization

PostHog is initialized once in `apps/web/src/routes/__root.tsx`, client-side only (`typeof window !== 'undefined'`), with:

```ts
posthog.init(env.VITE_POSTHOG_KEY, {
  api_host: env.VITE_POSTHOG_HOST,
  capture_pageview: false,        // manual pageviews via router
  session_recording: { enabled: true },
  autocapture: false,             // use explicit events only
})
```

`autocapture` is disabled to keep the event list clean and intentional.

### Provider

`<PostHogProvider client={posthog}>` wraps the app in `RootDocument`, inside `QueryClientProvider` and `AutumnProvider`.

### Pageview Tracking

A `useEffect` in `RootDocument` subscribes to `router.subscribe('onResolved', ...)` and calls `posthog.capture('$pageview')` on each resolved navigation. This is the correct pattern for SPAs with client-side routing.

### Session Recording

Enabled globally on all routes (landing, `/login`, `/onboarding`, `/dashboard/*`). PostHog automatically masks password inputs and other sensitive fields. No additional masking configuration needed.

---

## Events

### Funnel — Acquisition (Landing)

| Event | Trigger | Properties |
|---|---|---|
| `cta_clicked` | Any CTA button clicked | `{ location: 'hero' \| 'pricing' \| 'cta_banner' }` |
| `pricing_viewed` | Pricing section enters viewport | — |
| `faq_item_expanded` | FAQ item opened | `{ question: string }` |

**Implementation notes:**
- `cta_clicked` is called in `hero.tsx`, `pricing.tsx`, and `cta-banner.tsx` via `usePostHog()` hook
- `pricing_viewed` uses a `useInView` ref (already used in landing for framer-motion animations)
- `faq_item_expanded` called in `faq.tsx` on accordion open

### Funnel — Auth

| Event | Trigger | Properties |
|---|---|---|
| `signup_started` | Signup form submitted | — |
| `signup_completed` | better-auth success callback | — |
| `signup_failed` | better-auth error callback | `{ error: string }` |
| `login_success` | Sign-in success callback | — |
| `login_failed` | Sign-in error callback | `{ error: string }` |

**Implementation notes:**
- Events called inside `onSuccess` / `onError` callbacks of `authClient.signIn.email()` and `authClient.signUp.email()` in `sign-in-form.tsx` and `sign-up-form.tsx`

### Dashboard Actions

| Event | Trigger | Properties |
|---|---|---|
| `sequence_toggled` | Sequence enable/disable toggle | `{ sequence_id: string, enabled: boolean }` |
| `payment_viewed` | Payment detail page loaded | `{ payment_id: string }` |
| `settings_updated` | Settings saved successfully | `{ section: string }` |

**Implementation notes:**
- `sequence_toggled` called in `sequences.tsx` on mutation success
- `payment_viewed` called in `payments_.$id.tsx` on route load
- `settings_updated` called in `settings.tsx` on form submit success

---

## Files Changed

| File | Change |
|---|---|
| `apps/web/package.json` | Add `posthog-js` |
| `packages/env/src/client.ts` | Add `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST` |
| `apps/web/src/routes/__root.tsx` | Init PostHog, add `PostHogProvider`, add router subscriber for pageviews |
| `apps/web/src/components/landing/hero.tsx` | `cta_clicked` (location: hero) |
| `apps/web/src/components/landing/pricing.tsx` | `cta_clicked` (location: pricing) + `pricing_viewed` |
| `apps/web/src/components/landing/cta-banner.tsx` | `cta_clicked` (location: cta_banner) |
| `apps/web/src/components/landing/faq.tsx` | `faq_item_expanded` |
| `apps/web/src/components/sign-in-form.tsx` | `login_success`, `login_failed` |
| `apps/web/src/components/sign-up-form.tsx` | `signup_started`, `signup_completed`, `signup_failed` |
| `apps/web/src/routes/_dashboard/sequences.tsx` | `sequence_toggled` |
| `apps/web/src/routes/_dashboard/payments_.$id.tsx` | `payment_viewed` |
| `apps/web/src/routes/_dashboard/settings.tsx` | `settings_updated` |

---

## Out of Scope

- User identification (`posthog.identify()`) — users remain anonymous
- Stripe onboarding events (`stripe_connect_started`, etc.) — deferred
- Feature flags — not needed at this stage
- A/B testing — not needed at this stage
