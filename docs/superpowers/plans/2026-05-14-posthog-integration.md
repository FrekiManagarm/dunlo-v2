# PostHog Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install PostHog and instrument analytics events + session recording globally across the Dunlo web app (landing, auth, dashboard).

**Architecture:** PostHog initialized client-side in `__root.tsx` via `posthog.init()` wrapped in a `PostHogProvider`. Pageviews are tracked manually via a TanStack Router `onResolved` subscriber. Custom events are captured with the `usePostHog()` hook directly in components. Users remain anonymous (no `identify()` call).

**Tech Stack:** `posthog-js` (includes `posthog-js/react`), `@t3-oss/env-core` for typed env vars, TanStack Router for route subscriptions, framer-motion `useInView` for `pricing_viewed`.

---

## File Map

| File | Change |
|---|---|
| `apps/web/package.json` | Add `posthog-js` dependency |
| `packages/env/src/web.ts` | Add `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST` |
| `apps/web/src/routes/__root.tsx` | Init PostHog, add `PostHogProvider`, router subscriber |
| `apps/web/src/components/landing/hero.tsx` | `cta_clicked` on `MagneticCtaButton` |
| `apps/web/src/components/landing/pricing.tsx` | `cta_clicked` on plan CTAs + `pricing_viewed` on section enter |
| `apps/web/src/components/landing/cta-banner.tsx` | `cta_clicked` on banner CTA |
| `apps/web/src/components/landing/faq.tsx` | `faq_item_expanded` on accordion open |
| `apps/web/src/components/sign-in-form.tsx` | `login_success`, `login_failed` |
| `apps/web/src/components/sign-up-form.tsx` | `signup_started`, `signup_completed`, `signup_failed` |
| `apps/web/src/routes/_dashboard/sequences.tsx` | `sequence_toggled` on toggle mutation success |
| `apps/web/src/routes/_dashboard/payments_.$id.tsx` | `payment_viewed` on mount |
| `apps/web/src/routes/_dashboard/settings.tsx` | `settings_updated` on save success |

---

### Task 1: Install package and add env vars

**Files:**
- Modify: `apps/web/package.json`
- Modify: `packages/env/src/web.ts`

- [ ] **Step 1: Install posthog-js**

Run from repo root:
```bash
cd apps/web && bun add posthog-js
```

Expected: `posthog-js` appears in `apps/web/package.json` dependencies.

- [ ] **Step 2: Add env vars to packages/env/src/web.ts**

Current file:
```ts
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {},
  runtimeEnv: (import.meta as any).env,
  emptyStringAsUndefined: true,
});
```

Replace with:
```ts
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_POSTHOG_KEY: z.string().min(1),
    VITE_POSTHOG_HOST: z.url(),
  },
  runtimeEnv: (import.meta as any).env,
  emptyStringAsUndefined: true,
});
```

- [ ] **Step 3: Add env vars to .env**

Add to `.env` at the repo root:
```
VITE_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_POSTHOG_HOST=https://eu.i.posthog.com
```

(Use the actual key from your PostHog project settings → Project API key. Use `https://us.i.posthog.com` if on US cloud.)

- [ ] **Step 4: Type-check**

```bash
bun run check-types
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add apps/web/package.json bun.lock packages/env/src/web.ts
git commit -m "feat(analytics): install posthog-js and add VITE_POSTHOG_KEY/HOST env vars"
```

---

### Task 2: Initialize PostHog in `__root.tsx`

**Files:**
- Modify: `apps/web/src/routes/__root.tsx`

- [ ] **Step 1: Update __root.tsx**

Replace the entire file with:

```tsx
import { AutumnProvider } from "autumn-js/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@dunlo-v2/ui/components/sonner";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { createMiddleware } from "@tanstack/react-start";
import { evlogErrorHandler } from "evlog/nitro/v3";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect } from "react";
import { env } from "@dunlo-v2/env/web";
import appCss from "../index.css?url";

export interface RouterAppContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  server: {
    middleware: [createMiddleware().server(evlogErrorHandler)],
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Dunlo — Stop losing revenue to failed payments" },
      {
        name: "description",
        content:
          "Dunlo connects to Stripe, detects every failed payment by type, and sends the right recovery email automatically. Setup in 5 minutes.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Dunlo" },
      {
        property: "og:title",
        content: "Dunlo — Stop losing revenue to failed payments",
      },
      {
        property: "og:description",
        content:
          "Dunlo connects to Stripe, detects every failed payment by type, and sends the right recovery email automatically. Setup in 5 minutes.",
      },
      {
        property: "og:image",
        content: "https://dunlo.io/brand/dunlo-logo.png",
      },
      { property: "og:url", content: "https://dunlo.io" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Dunlo — Stop losing revenue to failed payments",
      },
      {
        name: "twitter:description",
        content:
          "Dunlo connects to Stripe, detects every failed payment by type, and sends the right recovery email automatically. Setup in 5 minutes.",
      },
      {
        name: "twitter:image",
        content: "https://dunlo.io/brand/dunlo-logo.png",
      },
    ],
    links: [
      { rel: "icon", href: "/brand/dunlo-mark.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/brand/dunlo-mark.png", type: "image/png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    posthog.init(env.VITE_POSTHOG_KEY, {
      api_host: env.VITE_POSTHOG_HOST,
      capture_pageview: false,
      autocapture: false,
      session_recording: { enabled: true },
    });

    posthog.capture("$pageview");

    const unsubscribe = router.subscribe("onResolved", () => {
      posthog.capture("$pageview");
    });

    return unsubscribe;
  }, []);

  return (
    <PostHogProvider client={posthog}>
      <QueryClientProvider client={queryClient}>
        <AutumnProvider useBetterAuth>
          <html lang="en">
            <head>
              <HeadContent />
            </head>
            <body>
              <Outlet />
              <Toaster richColors position="bottom-right" />
              <TanStackRouterDevtools position="bottom-left" />
              <ReactQueryDevtools initialIsOpen={false} />
              <Scripts />
            </body>
          </html>
        </AutumnProvider>
      </QueryClientProvider>
    </PostHogProvider>
  );
}
```

- [ ] **Step 2: Start dev server and verify**

```bash
bun run dev:web
```

Open `http://localhost:3000`. In PostHog → Live events, you should see a `$pageview` event appear within a few seconds. Navigate to `/login` — a second `$pageview` should appear. Session recordings should begin appearing under PostHog → Session Replay.

- [ ] **Step 3: Type-check**

```bash
bun run check-types
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/routes/__root.tsx
git commit -m "feat(analytics): init PostHog with session recording and pageview tracking"
```

---

### Task 3: Landing page CTA events

**Files:**
- Modify: `apps/web/src/components/landing/hero.tsx`
- Modify: `apps/web/src/components/landing/pricing.tsx`
- Modify: `apps/web/src/components/landing/cta-banner.tsx`

- [ ] **Step 1: hero.tsx — add cta_clicked on MagneticCtaButton**

Add `usePostHog` import and hook call. In `hero.tsx`, add to the top-level imports:

```tsx
import { usePostHog } from "posthog-js/react";
```

In `MagneticCtaButton`, add the hook and `onClick`:

```tsx
function MagneticCtaButton() {
  const posthog = usePostHog();
  const ref = useRef<HTMLDivElement>(null);
  // ... rest of existing x/y motion values and handlers unchanged ...

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x: springX, y: springY }}
      className="inline-block"
    >
      <Link
        to="/login"
        onClick={() => posthog.capture("cta_clicked", { location: "hero" })}
        className="inline-flex items-center gap-0 rounded-full border border-gray-200 bg-white px-2 py-2 shadow-sm transition-shadow hover:shadow-md active:scale-[0.98]"
      >
        <span className="px-4 text-sm font-semibold text-gray-900">
          Get started now
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-dunlo px-4 py-2 text-sm font-semibold text-white">
          for free
          <ChevronRight size={14} />
        </span>
      </Link>
    </motion.div>
  );
}
```

- [ ] **Step 2: pricing.tsx — add cta_clicked + pricing_viewed**

Add imports at the top of `pricing.tsx`:

```tsx
import { useInView } from "framer-motion";
import { useEffect, useRef } from "react";
import { usePostHog } from "posthog-js/react";
```

Update the `Pricing` component:

```tsx
export function Pricing() {
  const posthog = usePostHog();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true });

  useEffect(() => {
    if (isInView) posthog.capture("pricing_viewed");
  }, [isInView]);

  return (
    <FadeIn>
      <section
        ref={sectionRef}
        id="pricing"
        className="overflow-hidden rounded-3xl border border-gray-200/60 bg-white p-8 md:p-12"
      >
        {/* ... existing header and beta banner unchanged ... */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan, i) => (
            <FadeIn key={plan.name} i={i}>
              <div
                className={`relative flex h-full flex-col rounded-2xl p-6 transition-shadow hover:shadow-lg ${
                  plan.featured
                    ? "bg-gray-900 text-white shadow-xl ring-1 ring-gray-800"
                    : "border border-gray-100 bg-white shadow-sm"
                }`}
              >
                {/* ... existing plan content unchanged ... */}

                <Link
                  to="/login"
                  onClick={() =>
                    posthog.capture("cta_clicked", { location: "pricing" })
                  }
                  className={`mt-8 flex items-center justify-center rounded-full py-2.5 text-sm font-semibold transition-all active:scale-[0.97] ${
                    plan.featured
                      ? "bg-dunlo text-white hover:bg-dunlo-hover"
                      : "border border-gray-200 text-gray-900 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Get started free
                </Link>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>
    </FadeIn>
  );
}
```

- [ ] **Step 3: cta-banner.tsx — add cta_clicked**

Add import:
```tsx
import { usePostHog } from "posthog-js/react";
```

Update `CtaBanner`:
```tsx
export function CtaBanner() {
  const posthog = usePostHog();

  return (
    <FadeIn>
      <section className="relative overflow-hidden rounded-3xl bg-gray-900 px-8 py-16 text-center">
        {/* ... existing decorative div and text unchanged ... */}

        <div className="relative mt-8">
          <Link
            to="/login"
            onClick={() =>
              posthog.capture("cta_clicked", { location: "cta_banner" })
            }
            className="inline-flex items-center gap-0 rounded-full border border-white/10 bg-white/5 px-2 py-2 backdrop-blur-sm transition-all hover:bg-white/10 active:scale-[0.97]"
          >
            <span className="px-4 text-sm font-semibold text-white">
              Get started now
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-dunlo px-4 py-2 text-sm font-semibold text-white">
              for free
              <ChevronRight size={14} />
            </span>
          </Link>
        </div>
      </section>
    </FadeIn>
  );
}
```

- [ ] **Step 4: Verify in PostHog live events**

Open the landing page in dev, click the hero CTA — expect `cta_clicked { location: "hero" }` in PostHog Live Events. Scroll to pricing, expect `pricing_viewed`. Click a pricing CTA, expect `cta_clicked { location: "pricing" }`. Click the banner CTA, expect `cta_clicked { location: "cta_banner" }`.

- [ ] **Step 5: Type-check**

```bash
bun run check-types
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/components/landing/hero.tsx apps/web/src/components/landing/pricing.tsx apps/web/src/components/landing/cta-banner.tsx
git commit -m "feat(analytics): track cta_clicked and pricing_viewed on landing page"
```

---

### Task 4: FAQ event

**Files:**
- Modify: `apps/web/src/components/landing/faq.tsx`

- [ ] **Step 1: Add usePostHog to faq.tsx**

Add import:
```tsx
import { usePostHog } from "posthog-js/react";
```

In the `Faq` component, add the hook and update the button onClick:

```tsx
export function Faq() {
  const posthog = usePostHog();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <FadeIn>
      <section
        id="faq"
        className="overflow-hidden rounded-3xl border border-gray-200/60 bg-white p-8 md:p-12"
      >
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[2fr_3fr]">
          {/* ... left column unchanged ... */}

          <div className="divide-y divide-gray-100">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i}>
                <button
                  onClick={() => {
                    const isOpening = open !== i;
                    setOpen(open === i ? null : i);
                    if (isOpening)
                      posthog.capture("faq_item_expanded", {
                        question: item.q,
                      });
                  }}
                  className="flex w-full items-center justify-between py-5 text-left"
                  aria-expanded={open === i}
                >
                  {/* ... existing button content unchanged ... */}
                </button>
                {/* ... AnimatePresence unchanged ... */}
              </div>
            ))}
          </div>
        </div>
      </section>
    </FadeIn>
  );
}
```

- [ ] **Step 2: Verify**

In dev, expand any FAQ item — expect `faq_item_expanded { question: "Does Dunlo work with Stripe Connect?" }` in PostHog Live Events. Collapse and re-expand — expect another event. Collapsing should NOT fire an event.

- [ ] **Step 3: Type-check**

```bash
bun run check-types
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/landing/faq.tsx
git commit -m "feat(analytics): track faq_item_expanded on landing FAQ"
```

---

### Task 5: Auth form events

**Files:**
- Modify: `apps/web/src/components/sign-in-form.tsx`
- Modify: `apps/web/src/components/sign-up-form.tsx`

- [ ] **Step 1: sign-in-form.tsx — login_success and login_failed**

Add import:
```tsx
import { usePostHog } from "posthog-js/react";
```

In `SignInForm`, add the hook and update the `signInForm.onSubmit`:

```tsx
export default function SignInForm({ onSwitchToSignUp }: { onSwitchToSignUp: () => void }) {
  const posthog = usePostHog();
  const navigate = useNavigate({ from: "/login" });
  const [view, setView] = useState<View>("signin");

  const signInForm = useForm({
    defaultValues: { email: "", password: "" },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        { email: value.email, password: value.password },
        {
          onSuccess: () => {
            posthog.capture("login_success");
            navigate({ to: "/dashboard" });
            toast.success("Welcome back!");
          },
          onError: (err) => {
            posthog.capture("login_failed", {
              error: err.error.message || err.error.statusText,
            });
            toast.error(err.error.message || err.error.statusText);
          },
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

  // ... rest of component unchanged ...
}
```

- [ ] **Step 2: sign-up-form.tsx — signup_started, signup_completed, signup_failed**

Add import:
```tsx
import { usePostHog } from "posthog-js/react";
```

In `SignUpForm`, add the hook and update `form.onSubmit`:

```tsx
export default function SignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) {
  const posthog = usePostHog();
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { name: "", email: "", password: "" },
    onSubmit: async ({ value }) => {
      posthog.capture("signup_started");
      await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
          callbackURL: "/onboarding",
        },
        {
          onSuccess: () => {
            posthog.capture("signup_completed");
            setSubmittedEmail(value.email);
          },
          onError: (err) => {
            posthog.capture("signup_failed", {
              error: err.error.message || err.error.statusText,
            });
            toast.error(err.error.message || err.error.statusText);
          },
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

  // ... rest of component unchanged ...
}
```

- [ ] **Step 3: Verify**

In dev, attempt a login with wrong credentials — expect `login_failed` in PostHog. Log in successfully — expect `login_success`. Sign up with a new email — expect `signup_started` then `signup_completed`.

- [ ] **Step 4: Type-check**

```bash
bun run check-types
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/sign-in-form.tsx apps/web/src/components/sign-up-form.tsx
git commit -m "feat(analytics): track login and signup events in auth forms"
```

---

### Task 6: Dashboard events

**Files:**
- Modify: `apps/web/src/routes/_dashboard/sequences.tsx`
- Modify: `apps/web/src/routes/_dashboard/payments_.$id.tsx`
- Modify: `apps/web/src/routes/_dashboard/settings.tsx`

- [ ] **Step 1: sequences.tsx — sequence_toggled**

Add import:
```tsx
import { usePostHog } from "posthog-js/react";
```

In `RouteComponent`, add the hook. Find the place where `toggleSequence` is called and capture the event on success. The mutation handler looks like:

```tsx
function RouteComponent() {
  const posthog = usePostHog();
  // ... existing code ...

  // Find the handler that calls toggleSequence and add the capture:
  const handleToggle = async (sequenceId: string, currentEnabled: boolean) => {
    const newEnabled = !currentEnabled;
    await toggleSequence({ data: { sequenceId, enabled: newEnabled } });
    posthog.capture("sequence_toggled", {
      sequence_id: sequenceId,
      enabled: newEnabled,
    });
    queryClient.invalidateQueries(sequencesQueryOptions());
    toast.success(newEnabled ? "Sequence enabled" : "Sequence disabled");
  };
  // ...
}
```

Note: The exact `toggleSequence` call signature matches the existing mutation pattern in the file. Find the existing toggle handler and insert `posthog.capture("sequence_toggled", { sequence_id: ..., enabled: ... })` after the successful `await`.

- [ ] **Step 2: payments_.$id.tsx — payment_viewed**

Add imports:
```tsx
import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";
```

In the page component, add:

```tsx
function RouteComponent() {
  const posthog = usePostHog();
  const { id } = Route.useParams();

  useEffect(() => {
    posthog.capture("payment_viewed", { payment_id: id });
  }, [id]);

  // ... rest of component unchanged ...
}
```

- [ ] **Step 3: settings.tsx — settings_updated**

Add import:
```tsx
import { usePostHog } from "posthog-js/react";
```

In the settings component, find the form submission success handlers and add the capture. For each settings section that saves (profile, email provider, etc.), add after `toast.success(...)`:

```tsx
posthog.capture("settings_updated", { section: "profile" });
// or "email_provider", "notifications", etc. — use the section name
```

Example for the profile form:
```tsx
onSuccess: () => {
  posthog.capture("settings_updated", { section: "profile" });
  toast.success("Profile updated");
},
```

- [ ] **Step 4: Verify**

In dev: toggle a sequence — expect `sequence_toggled { sequence_id: "...", enabled: true/false }`. Navigate to a payment detail — expect `payment_viewed { payment_id: "..." }`. Save settings — expect `settings_updated { section: "..." }`.

- [ ] **Step 5: Type-check**

```bash
bun run check-types
```

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/routes/_dashboard/sequences.tsx apps/web/src/routes/_dashboard/payments_.$id.tsx apps/web/src/routes/_dashboard/settings.tsx
git commit -m "feat(analytics): track sequence_toggled, payment_viewed, settings_updated in dashboard"
```
