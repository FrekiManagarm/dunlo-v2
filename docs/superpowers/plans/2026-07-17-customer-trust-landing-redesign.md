# Customer-Trust Landing Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Dunlo marketing homepage into a modern, accessible Stripe payment-recovery landing page centered on recovering failed payments without losing customer trust.

**Architecture:** Keep `LandingPage` as a server-rendered composition root, move each major section into one focused component, and centralize all homepage copy/data in a tested content module shared by visible FAQ and JSON-LD. Keep client components limited to navigation, tracked links, the ROI calculator, and intentional stateful product demonstrations.

Resources appear immediately before the final CTA so signup is the homepage's actual ending before the footer.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Framer Motion, Vitest, Lucide React, PostHog, shared tokens from `@dunlo-v2/ui`.

**Source specification:** `docs/superpowers/specs/2026-07-17-customer-trust-landing-redesign-design.md`

---

## File Map

### Create

- `apps/marketing/src/components/landing/landing-content.ts` — one source of truth for homepage examples, trust items, FAQ, pricing features, and resource links.
- `apps/marketing/src/components/landing/landing-content.test.ts` — content-truth, proof, CTA, and structured-data invariants.
- `apps/marketing/src/components/landing/landing-style-contract.test.ts` — source-level regression checks for accessibility tokens and rejected visual patterns.
- `apps/marketing/src/components/landing/payment-recovery-hero.tsx` — approved headline, CTA pair, and clearly labeled static product example.
- `apps/marketing/src/components/landing/trust-strip.tsx` — OAuth, card-storage, founder-control, and beta trust facts.
- `apps/marketing/src/components/landing/failure-response-map.tsx` — plain-language failure reasons mapped to recovery responses.
- `apps/marketing/src/components/landing/pricing.tsx` — single beta plan and accurate signup CTA.
- `apps/marketing/src/components/landing/faq.tsx` — visible FAQ driven by the shared content module.
- `apps/marketing/src/components/landing/resource-library.tsx` — compact pre-footer SEO/resource links.
- `apps/marketing/src/components/landing/final-cta.tsx` — short final conversion section.

### Modify

- `packages/ui/src/styles/globals.css` — semantic ink/ground/line tokens, accessible brand foregrounds, typography utilities, and landing motion cleanup.
- `apps/marketing/src/app/layout.tsx` — replace marketing Outfit with Geist while retaining JetBrains Mono for real operational data.
- `apps/marketing/src/app/page.tsx` — use shared FAQ content for JSON-LD.
- `apps/marketing/src/lib/site-navigation.ts` — trust-first homepage navigation.
- `apps/marketing/src/components/landing/nav.tsx` — straight sticky desktop header and accessible mobile section menu.
- `apps/marketing/src/components/landing/escalation.tsx` — remove fake controls and make founder review accurate.
- `apps/marketing/src/components/landing/how-it-works.tsx` — remove autoplay and keep user-controlled steps.
- `apps/marketing/src/components/landing/roi-calculator.tsx` — compact layout, honest estimate wording, methodology link, and accurate CTA.
- `apps/marketing/src/components/public-proof-layer.tsx` — verifiable proof policy and sources only.
- `apps/marketing/src/components/landing/built-by-mathieu.tsx` — compact founder accountability presentation.
- `apps/marketing/src/components/landing-page.tsx` — reduce to section composition and remove inline legacy sections/data.

### Delete after migration

- No standalone file is deleted in this plan. Remove obsolete inline functions and commented blocks from `landing-page.tsx`, but leave reusable alternate components outside the new homepage composition untouched.

---

### Task 1: Centralize and test truthful homepage content

**Files:**
- Create: `apps/marketing/src/components/landing/landing-content.ts`
- Create: `apps/marketing/src/components/landing/landing-content.test.ts`
- Modify: `apps/marketing/src/app/page.tsx:12-33`

- [ ] **Step 1: Write the failing content-contract tests**

Create `apps/marketing/src/components/landing/landing-content.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import {
  FAQ_ITEMS,
  PRICING_FEATURES,
  RECOVERY_EXAMPLES,
  RESOURCE_LINKS,
  TRUST_ITEMS,
} from "./landing-content";

describe("landing content", () => {
  test("labels every simulated recovery record as example data", () => {
    expect(RECOVERY_EXAMPLES).toHaveLength(3);
    expect(RECOVERY_EXAMPLES.every((item) => item.isExample)).toBe(true);
    expect(
      RECOVERY_EXAMPLES.every(
        (item) => !item.companyName && !item.amount && !item.recoveredValue,
      ),
    ).toBe(true);
  });

  test("publishes trust facts instead of synthetic customer proof", () => {
    expect(TRUST_ITEMS.map((item) => item.title)).toEqual([
      "Stripe OAuth",
      "No card storage",
      "Founder control",
      "Free in beta",
    ]);
    expect(TRUST_ITEMS.every((item) => item.body.length > 20)).toBe(true);
  });

  test("keeps visible FAQ and JSON-LD content in one source", () => {
    expect(FAQ_ITEMS).toHaveLength(6);
    expect(FAQ_ITEMS.every((item) => item.question && item.answer)).toBe(true);
  });

  test("keeps pricing and resources intentionally compact", () => {
    expect(PRICING_FEATURES).toHaveLength(5);
    expect(RESOURCE_LINKS).toHaveLength(4);
  });
});
```

- [ ] **Step 2: Run the test and verify the missing module failure**

Run:

```bash
bunx vitest run apps/marketing/src/components/landing/landing-content.test.ts
```

Expected: FAIL because `./landing-content` does not exist.

- [ ] **Step 3: Implement the content source of truth**

Create `apps/marketing/src/components/landing/landing-content.ts`:

```ts
export const RECOVERY_EXAMPLES = [
  {
    reason: "Expired card",
    stripeCode: "expired_card",
    customerMeaning: "The customer needs a secure payment update link.",
    action: "Customer action",
    status: "Email ready",
    isExample: true,
  },
  {
    reason: "Insufficient funds",
    stripeCode: "insufficient_funds",
    customerMeaning: "Timing matters more than sending another reminder now.",
    action: "Wait 4 hours",
    status: "Retry scheduled",
    isExample: true,
  },
  {
    reason: "High-value account",
    stripeCode: "founder_threshold",
    customerMeaning: "Keep an important customer relationship human.",
    action: "Founder review",
    status: "Draft prepared",
    isExample: true,
  },
] as const;

export const TRUST_ITEMS = [
  {
    title: "Stripe OAuth",
    body: "Connect without sharing Stripe credentials with Dunlo.",
    href: "/privacy",
  },
  {
    title: "No card storage",
    body: "Payment updates stay inside Stripe-hosted flows.",
    href: "/privacy",
  },
  {
    title: "Founder control",
    body: "Pause sensitive accounts before a recovery message is sent.",
    href: "/#founder-review",
  },
  {
    title: "Free in beta",
    body: "No recovered-revenue cut while Dunlo remains in beta.",
    href: "/#pricing",
  },
] as const;

export const PRICING_FEATURES = [
  "Stripe failure-reason detection",
  "Recovery emails matched to the failure",
  "Stripe-hosted payment update links",
  "Founder review for sensitive accounts",
  "Recovered-payment tracking",
] as const;

export const FAQ_ITEMS = [
  {
    question: "Is this just Stripe Smart Retries with nicer emails?",
    answer:
      "No. Stripe can retry cards. Dunlo handles the customer-facing recovery layer around Stripe: message, timing, founder review, and recovered-payment reporting.",
  },
  {
    question: "Will customers know an automation sent the email?",
    answer:
      "The copy is plain, specific, and tied to the payment reason. High-value or sensitive accounts can pause for founder review before anything is sent.",
  },
  {
    question: "How does Dunlo connect to Stripe?",
    answer:
      "Dunlo uses Stripe OAuth. You authorize access in Stripe and can revoke that connection from Stripe or Dunlo.",
  },
  {
    question: "Does Dunlo store card numbers?",
    answer:
      "No. Card updates happen through Stripe-hosted flows. Dunlo uses payment and subscription context, not full card numbers or CVC data.",
  },
  {
    question: "Do I pay during beta?",
    answer:
      "No. Dunlo is free during beta and does not take a percentage of recovered revenue during that period. Pricing changes will be communicated before billing starts.",
  },
  {
    question: "Can sensitive accounts require founder review?",
    answer:
      "Yes. Important accounts can pause before a message is sent so a founder can review the Stripe context and prepared draft.",
  },
] as const;

export const RESOURCE_LINKS = [
  {
    href: "/stripe-failed-payment-recovery-software",
    title: "Stripe recovery software",
    body: "See the complete failed-payment recovery workflow.",
  },
  {
    href: "/stripe-dunning-schedule-calculator",
    title: "Dunning schedule calculator",
    body: "Plan email timing and retries by failure reason.",
  },
  {
    href: "/stripe-decline-codes",
    title: "Stripe decline codes",
    body: "Translate issuer responses into a useful next step.",
  },
  {
    href: "/benchmark",
    title: "Failed-payment benchmark",
    body: "Estimate failed MRR using visible assumptions.",
  },
] as const;
```

- [ ] **Step 4: Make JSON-LD use the shared FAQ**

In `apps/marketing/src/app/page.tsx`, remove `FAQ_JSON_LD` and add:

```ts
import { FAQ_ITEMS } from "@/components/landing/landing-content";
```

Then change the JSON-LD map to:

```ts
mainEntity: FAQ_ITEMS.map((item) => ({
  "@type": "Question",
  name: item.question,
  acceptedAnswer: {
    "@type": "Answer",
    text: item.answer,
  },
})),
```

- [ ] **Step 5: Run focused tests and type-check the marketing app**

Run:

```bash
bunx vitest run apps/marketing/src/components/landing/landing-content.test.ts
bun run --cwd apps/marketing check-types
```

Expected: tests PASS; type-check exits 0.

- [ ] **Step 6: Commit the truthful content contract**

```bash
git add apps/marketing/src/components/landing/landing-content.ts \
  apps/marketing/src/components/landing/landing-content.test.ts \
  apps/marketing/src/app/page.tsx
git commit -m "test(marketing): define truthful landing content"
```

---

### Task 2: Establish accessible modern typography and tokens

**Files:**
- Create: `apps/marketing/src/components/landing/landing-style-contract.test.ts`
- Modify: `packages/ui/src/styles/globals.css:7-120`
- Modify: `apps/marketing/src/app/layout.tsx:1-24,70-73`

- [ ] **Step 1: Write the failing style-contract test**

Create `apps/marketing/src/components/landing/landing-style-contract.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const repoRoot = resolve(import.meta.dirname, "../../../../..");

describe("landing style contract", () => {
  test("uses an accessible foreground on bright Dunlo green", () => {
    const css = readFileSync(
      resolve(repoRoot, "packages/ui/src/styles/globals.css"),
      "utf8",
    );

    expect(css).toContain("--dunlo-ink:");
    expect(css).toContain("--primary-foreground: var(--dunlo-ink)");
    expect(css).toContain("--accent-foreground: var(--dunlo-ink)");
  });

  test("loads Geist instead of Outfit for marketing", () => {
    const layout = readFileSync(
      resolve(repoRoot, "apps/marketing/src/app/layout.tsx"),
      "utf8",
    );

    expect(layout).toContain("Geist");
    expect(layout).not.toContain("Outfit");
  });
});
```

- [ ] **Step 2: Run the style test and verify both assertions fail**

Run:

```bash
bunx vitest run apps/marketing/src/components/landing/landing-style-contract.test.ts
```

Expected: FAIL because the ink token and Geist import are absent.

- [ ] **Step 3: Add semantic visual tokens and accessible foregrounds**

In `packages/ui/src/styles/globals.css`, extend the brand block and update the semantic aliases:

```css
:root {
  --dunlo-accent: #00e87b;
  --dunlo-accent-hover: #00ff8c;
  --dunlo-accent-dim: #00a85b;
  --dunlo-accent-deep: #006f3d;
  --dunlo-ink: oklch(0.16 0.015 155);
  --dunlo-ground: oklch(0.985 0.004 155);
  --dunlo-line: oklch(0.86 0.008 155);

  --background: var(--dunlo-ground);
  --foreground: var(--dunlo-ink);
  --card: oklch(1 0 0);
  --card-foreground: var(--dunlo-ink);
  --primary: var(--dunlo-accent);
  --primary-foreground: var(--dunlo-ink);
  --accent: var(--dunlo-accent);
  --accent-foreground: var(--dunlo-ink);
  --border: var(--dunlo-line);
  --ring: var(--dunlo-accent-deep);
}
```

Map the new roles in `@theme inline`:

```css
--color-dunlo-ink: var(--dunlo-ink);
--color-dunlo-ground: var(--dunlo-ground);
--color-dunlo-line: var(--dunlo-line);
```

Delete the `landing-float` keyframes/class. Change `.anim-1` through `.anim-6` so content is visible without animation and motion only enhances supported browsers:

```css
.anim-1,
.anim-2,
.anim-3,
.anim-4,
.anim-5,
.anim-6 {
  animation: fade-up 0.56s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@media (prefers-reduced-motion: reduce) {
  .anim-1,
  .anim-2,
  .anim-3,
  .anim-4,
  .anim-5,
  .anim-6,
  .landing-rise {
    animation: none;
  }
}
```

- [ ] **Step 4: Replace Outfit with Geist in the marketing layout**

In `apps/marketing/src/app/layout.tsx`:

```ts
import { Geist, JetBrains_Mono } from "next/font/google";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});
```

Apply both variables:

```tsx
<body className={`${geist.variable} ${jetbrainsMono.variable}`}>
```

- [ ] **Step 5: Run tests and type-check**

```bash
bunx vitest run apps/marketing/src/components/landing/landing-style-contract.test.ts
bun run --cwd apps/marketing check-types
```

Expected: PASS and exit 0.

- [ ] **Step 6: Commit the design-system foundation**

```bash
git add packages/ui/src/styles/globals.css \
  apps/marketing/src/app/layout.tsx \
  apps/marketing/src/components/landing/landing-style-contract.test.ts
git commit -m "feat(marketing): establish accessible landing tokens"
```

---

### Task 3: Build the navigation, hero, and trust-first first viewport

**Files:**
- Modify: `apps/marketing/src/lib/site-navigation.ts:1-15`
- Modify: `apps/marketing/src/components/landing/nav.tsx:1-73`
- Create: `apps/marketing/src/components/landing/payment-recovery-hero.tsx`
- Create: `apps/marketing/src/components/landing/trust-strip.tsx`

- [ ] **Step 1: Update the source-level contract for first-viewport semantics**

Append to `landing-style-contract.test.ts`:

```ts
test("keeps the hero static preview honest and non-interactive", () => {
  const hero = readFileSync(
    resolve(
      repoRoot,
      "apps/marketing/src/components/landing/payment-recovery-hero.tsx",
    ),
    "utf8",
  );

  expect(hero).toContain("Recover failed payments without losing customer trust.");
  expect(hero).toContain("Example data");
  expect(hero).not.toContain("<button");
});
```

- [ ] **Step 2: Run the focused test and verify the missing hero failure**

```bash
bunx vitest run apps/marketing/src/components/landing/landing-style-contract.test.ts
```

Expected: FAIL because `payment-recovery-hero.tsx` does not exist.

- [ ] **Step 3: Update homepage navigation data**

Replace `HEADER_NAV_LINKS` in `apps/marketing/src/lib/site-navigation.ts`:

```ts
export const HEADER_NAV_LINKS = [
  { label: "Product", href: "/#how-it-works" },
  { label: "Trust", href: "/#trust" },
  { label: "Pricing", href: "/#pricing" },
] as const satisfies readonly SiteLink[];
```

- [ ] **Step 4: Rebuild the sticky navigation with a mobile disclosure**

Add the following React import and local menu helpers inside `Nav`:

```tsx
import { useRef, type KeyboardEvent } from "react";

const mobileMenuRef = useRef<HTMLDetailsElement>(null);

function closeMobileMenu() {
  mobileMenuRef.current?.removeAttribute("open");
}

function handleMobileMenuKeyDown(event: KeyboardEvent<HTMLDetailsElement>) {
  if (event.key !== "Escape") return;
  closeMobileMenu();
  mobileMenuRef.current?.querySelector<HTMLElement>("summary")?.focus();
}
```

Replace the `Nav` return value with:

```tsx
return (
  <header className="fixed inset-x-0 top-0 z-50 border-b border-dunlo-line bg-dunlo-ground/95 backdrop-blur-md">
    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
      <Link href="/" className="flex min-h-11 items-center" aria-label="Dunlo home">
        <Logo size={26} />
      </Link>

      <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
        {HEADER_NAV_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="inline-flex min-h-11 items-center px-3 text-sm font-medium text-gray-700 transition-colors hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dunlo-deep"
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-1.5">
        <Link
          href={loginUrl}
          onClick={() => captureCtaClick("Sign in", loginUrl)}
          className="inline-flex min-h-11 items-center px-3 text-sm font-semibold text-gray-800"
        >
          Sign in
        </Link>
        <Link
          href={SIGNUP_URL}
          onClick={() => captureCtaClick("Start free", SIGNUP_URL)}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-dunlo px-4 text-sm font-semibold text-dunlo-ink transition-colors hover:bg-dunlo-hover"
        >
          Start free
          <ChevronRight size={14} aria-hidden />
        </Link>
        <details
          ref={mobileMenuRef}
          onKeyDown={handleMobileMenuKeyDown}
          className="relative md:hidden"
        >
          <summary className="flex size-11 cursor-pointer list-none items-center justify-center rounded-full border border-dunlo-line bg-white marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dunlo-deep [&::-webkit-details-marker]:hidden">
            <span className="sr-only">Open navigation</span>
            <Menu size={18} aria-hidden />
          </summary>
          <nav
            aria-label="Mobile primary"
            className="absolute right-0 mt-2 w-48 rounded-xl border border-dunlo-line bg-white p-2 shadow-sm"
          >
            {HEADER_NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={closeMobileMenu}
                className="flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </details>
      </div>
    </div>
  </header>
);
```

Add `Menu` to the Lucide import.

- [ ] **Step 5: Create the static, clearly labeled hero preview**

Create `apps/marketing/src/components/landing/payment-recovery-hero.tsx`:

```tsx
import { ArrowRight } from "lucide-react";
import { SIGNUP_URL } from "@/lib/app-url";
import { TrackedLink } from "@/components/tracked-link";
import { RECOVERY_EXAMPLES } from "./landing-content";

export function PaymentRecoveryHero() {
  return (
    <section className="px-4 pb-12 pt-28 md:px-6 md:pb-20 md:pt-36">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-2xl border border-dunlo-line bg-white lg:grid-cols-[0.92fr_1.08fr]">
        <div className="flex flex-col justify-center p-6 md:p-10 lg:p-14">
          <p className="anim-1 text-sm font-semibold text-dunlo-deep">
            Stripe payment recovery, free in beta
          </p>
          <h1 className="anim-2 mt-5 max-w-3xl text-balance text-4xl font-semibold leading-[0.98] tracking-[-0.035em] text-dunlo-ink sm:text-5xl md:text-6xl lg:text-7xl">
            Recover failed payments without losing customer trust.
          </h1>
          <p className="anim-3 mt-6 max-w-[62ch] text-pretty text-base leading-7 text-gray-700 md:text-lg md:leading-8">
            Dunlo reads why a Stripe payment failed, sends the right recovery
            message, and pauses sensitive accounts for founder review.
          </p>
          <div className="anim-4 mt-8 flex flex-col gap-3 sm:flex-row">
            <TrackedLink
              href={SIGNUP_URL}
              eventProperties={{
                button_text: "Start free in beta",
                destination: SIGNUP_URL,
                location: "homepage_hero",
              }}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-dunlo-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
            >
              Start free in beta
              <ArrowRight size={16} aria-hidden />
            </TrackedLink>
            <a
              href="#how-it-works"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-gray-400 bg-white px-5 text-sm font-semibold text-gray-900 transition-colors hover:border-gray-700"
            >
              See how Dunlo works
            </a>
          </div>
        </div>

        <div className="border-t border-dunlo-line bg-dunlo-ground p-4 md:p-7 lg:border-l lg:border-t-0">
          <div className="h-full rounded-xl border border-dunlo-line bg-white p-4 md:p-6">
            <div className="flex items-center justify-between gap-4 border-b-2 border-dunlo-ink pb-4 text-xs font-semibold">
              <span>Payment recovery preview</span>
              <span className="text-dunlo-deep">Example data</span>
            </div>
            <div className="divide-y divide-dunlo-line">
              {RECOVERY_EXAMPLES.map((item) => (
                <article
                  key={item.stripeCode}
                  className="grid gap-3 py-5 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <div>
                    <p className="text-xs font-semibold text-gray-600">
                      {item.reason}
                    </p>
                    <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-dunlo-ink">
                      {item.customerMeaning}
                    </p>
                    <code className="mt-2 block font-mono text-xs text-gray-600">
                      {item.stripeCode}
                    </code>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-xs font-bold text-dunlo-deep">
                      {item.action}
                    </p>
                    <p className="mt-1 text-xs text-gray-600">{item.status}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Create the trust strip**

Create `apps/marketing/src/components/landing/trust-strip.tsx`:

```tsx
import Link from "next/link";
import { TRUST_ITEMS } from "./landing-content";

export function TrustStrip() {
  return (
    <section id="trust" className="scroll-mt-24 px-4 md:px-6">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-xl border border-dunlo-ink bg-white sm:grid-cols-2 lg:grid-cols-4">
        {TRUST_ITEMS.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="group min-h-28 border-b border-dunlo-line p-5 last:border-b-0 sm:border-r sm:[&:nth-child(2)]:border-r-0 lg:border-b-0 lg:[&:nth-child(2)]:border-r lg:last:border-r-0"
          >
            <h2 className="text-sm font-semibold text-dunlo-ink group-hover:text-dunlo-deep">
              {item.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-700">{item.body}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Run tests and type-check**

```bash
bunx vitest run apps/marketing/src/components/landing/landing-style-contract.test.ts
bun run --cwd apps/marketing check-types
```

Expected: PASS and exit 0.

- [ ] **Step 8: Commit the first viewport**

```bash
git add apps/marketing/src/lib/site-navigation.ts \
  apps/marketing/src/components/landing/nav.tsx \
  apps/marketing/src/components/landing/payment-recovery-hero.tsx \
  apps/marketing/src/components/landing/trust-strip.tsx \
  apps/marketing/src/components/landing/landing-style-contract.test.ts
git commit -m "feat(marketing): rebuild trust-first landing hero"
```

---

### Task 4: Replace feature cards and fake escalation controls

**Files:**
- Create: `apps/marketing/src/components/landing/failure-response-map.tsx`
- Modify: `apps/marketing/src/components/landing/escalation.tsx:1-218`

- [ ] **Step 1: Extend the source contract for interaction truth**

Append to `landing-style-contract.test.ts`:

```ts
test("does not render inert escalation buttons", () => {
  const escalation = readFileSync(
    resolve(
      repoRoot,
      "apps/marketing/src/components/landing/escalation.tsx",
    ),
    "utf8",
  );

  expect(escalation).not.toMatch(/<button[^>]*>\s*(Review|Regenerate|Send)/);
  expect(escalation).toContain("Example product preview");
});
```

- [ ] **Step 2: Run the test and verify it fails on current controls**

```bash
bunx vitest run apps/marketing/src/components/landing/landing-style-contract.test.ts
```

Expected: FAIL because the current escalation contains inert buttons and lacks the preview label.

- [ ] **Step 3: Create the failure-response map**

Create `apps/marketing/src/components/landing/failure-response-map.tsx`:

```tsx
import { RECOVERY_EXAMPLES } from "./landing-content";

export function FailureResponseMap() {
  return (
    <section id="failure-responses" className="scroll-mt-24 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold text-dunlo-deep">
              One failed payment is not the same as another
            </p>
            <h2 className="mt-4 max-w-xl text-balance text-4xl font-semibold leading-none tracking-[-0.03em] text-dunlo-ink md:text-6xl">
              The right message starts with what actually failed.
            </h2>
          </div>
          <p className="max-w-[65ch] text-pretty text-base leading-7 text-gray-700 md:text-lg">
            An expired card needs an update link. Insufficient funds needs
            better timing. An important customer may need a person, not another
            automated reminder.
          </p>
        </div>

        <div className="mt-12 border-y-2 border-dunlo-ink">
          {RECOVERY_EXAMPLES.map((item, index) => (
            <article
              key={item.stripeCode}
              className="grid gap-4 border-b border-dunlo-line py-6 last:border-b-0 md:grid-cols-[3rem_0.8fr_1.4fr_auto] md:items-center"
            >
              <span className="font-mono text-xs font-semibold text-gray-600">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-lg font-semibold text-dunlo-ink">
                  {item.reason}
                </h3>
                <code className="mt-1 block font-mono text-xs text-gray-600">
                  {item.stripeCode}
                </code>
              </div>
              <p className="max-w-2xl text-sm leading-6 text-gray-700">
                {item.customerMeaning}
              </p>
              <span className="w-fit rounded-full bg-dunlo px-3 py-2 text-xs font-bold text-dunlo-ink">
                {item.action}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Replace escalation with an honest static founder-review preview**

Rewrite `apps/marketing/src/components/landing/escalation.tsx` as a server component. Keep the existing imports for `SIGNUP_URL`, `TrackedLink`, `ArrowRight`, and `ShieldCheck`, then use:

```tsx
export function Escalation() {
  return (
    <section
      id="founder-review"
      className="scroll-mt-24 overflow-hidden rounded-2xl bg-dunlo-ink text-white"
    >
      <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
        <div className="p-6 md:p-10 lg:p-12">
          <p className="text-sm font-semibold text-dunlo">
            Keep important customer moments human
          </p>
          <h2 className="mt-4 max-w-xl text-balance text-4xl font-semibold leading-none tracking-[-0.03em] md:text-6xl">
            Routine recovery can run. Sensitive accounts can pause.
          </h2>
          <p className="mt-6 max-w-[62ch] text-pretty text-base leading-7 text-white/80">
            Dunlo prepares the Stripe context and a customer-safe draft. The
            founder decides whether anything is sent.
          </p>
          <TrackedLink
            href={SIGNUP_URL}
            eventProperties={{
              button_text: "Start with founder control",
              destination: SIGNUP_URL,
              location: "homepage_founder_review",
            }}
            className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-dunlo px-5 text-sm font-semibold text-dunlo-ink"
          >
            Start with founder control
            <ArrowRight size={16} aria-hidden />
          </TrackedLink>
        </div>

        <div className="border-t border-white/15 bg-white/5 p-4 md:p-8 lg:border-l lg:border-t-0">
          <article className="rounded-xl bg-white p-5 text-dunlo-ink md:p-7">
            <div className="flex items-start justify-between gap-4 border-b border-dunlo-line pb-5">
              <div>
                <p className="text-xs font-semibold text-dunlo-deep">
                  Example product preview
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                  Founder review prepared
                </h3>
              </div>
              <ShieldCheck className="text-dunlo-deep" aria-hidden />
            </div>
            <dl className="grid gap-4 border-b border-dunlo-line py-5 sm:grid-cols-3">
              <div><dt className="text-xs text-gray-600">Account</dt><dd className="mt-1 text-sm font-semibold">High value</dd></div>
              <div><dt className="text-xs text-gray-600">Failure</dt><dd className="mt-1 font-mono text-sm font-semibold">authentication_required</dd></div>
              <div><dt className="text-xs text-gray-600">Status</dt><dd className="mt-1 text-sm font-semibold text-dunlo-deep">Paused</dd></div>
            </dl>
            <div className="py-5">
              <p className="text-xs font-semibold text-gray-600">Prepared draft</p>
              <p className="mt-3 text-sm leading-7 text-gray-800">
                Your bank needs one more approval before the subscription
                payment can complete. The secure link below returns you to
                Stripe to finish that step.
              </p>
            </div>
            <p className="border-t border-dunlo-line pt-4 text-xs leading-5 text-gray-600">
              Nothing is sent until the founder reviews the account and draft.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run tests and type-check**

```bash
bunx vitest run apps/marketing/src/components/landing/landing-style-contract.test.ts
bun run --cwd apps/marketing check-types
```

Expected: PASS and exit 0.

- [ ] **Step 6: Commit the product-differentiation sections**

```bash
git add apps/marketing/src/components/landing/failure-response-map.tsx \
  apps/marketing/src/components/landing/escalation.tsx \
  apps/marketing/src/components/landing/landing-style-contract.test.ts
git commit -m "feat(marketing): clarify payment recovery responses"
```

---

### Task 5: Make setup and ROI accurate, compact, and user-controlled

**Files:**
- Modify: `apps/marketing/src/components/landing/how-it-works.tsx:1-230`
- Modify: `apps/marketing/src/components/landing/roi-calculator.tsx:1-224`

- [ ] **Step 1: Add behavior contracts for autoplay and CTA accuracy**

Append to `landing-style-contract.test.ts`:

```ts
test("keeps setup user-controlled and ROI CTA accurate", () => {
  const howItWorks = readFileSync(
    resolve(repoRoot, "apps/marketing/src/components/landing/how-it-works.tsx"),
    "utf8",
  );
  const roi = readFileSync(
    resolve(repoRoot, "apps/marketing/src/components/landing/roi-calculator.tsx"),
    "utf8",
  );

  expect(howItWorks).not.toContain("setInterval");
  expect(roi).toContain("Estimated recoverable this month");
  expect(roi).toContain("Start measuring failed payments");
  expect(roi).toContain('href="/benchmark"');
});
```

- [ ] **Step 2: Run the test and verify current autoplay/copy failures**

```bash
bunx vitest run apps/marketing/src/components/landing/landing-style-contract.test.ts
```

Expected: FAIL on `setInterval` and missing updated ROI strings.

- [ ] **Step 3: Remove autoplay from How It Works**

Delete `useEffect` and `useReducedMotion` imports and the timer effect. Keep `useState(0)`. Replace the section classes and CTA foreground:

```tsx
<section
  id="how-it-works"
  className="scroll-mt-24 overflow-hidden rounded-2xl border border-dunlo-line bg-white"
>
```

Use this CTA:

```tsx
<Link
  href={SIGNUP_URL}
  className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-dunlo px-5 text-sm font-semibold text-dunlo-ink transition-colors hover:bg-dunlo-hover"
>
  Start free in beta
  <ArrowRight size={16} aria-hidden />
</Link>
```

For each step button, add selection semantics:

```tsx
<button
  key={step.n}
  type="button"
  aria-pressed={isActive}
  onClick={() => setActive(index)}
  className={`min-h-11 w-full rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dunlo-deep ${
    isActive
      ? "border-dunlo-deep bg-dunlo/10"
      : "border-dunlo-line bg-white hover:bg-gray-50"
  }`}
>
```

Remove all `rounded-[1.35rem]`, `rounded-[1.7rem]`, large shadow classes, and white text below 60% opacity from the component. Use `rounded-xl`, borders, and `text-white/75` or stronger.

- [ ] **Step 4: Make ROI wording and links honest**

In `roi-calculator.tsx`, change the result label to:

```tsx
<span className="block pt-2 text-base font-medium leading-6 text-white/75">
  Estimated recoverable this month
</span>
```

Change the assumptions block to:

```tsx
<div className="mt-4 border-t border-dunlo-line pt-4">
  <p className="text-sm leading-6 text-gray-700">
    Estimate based on a 5% failed-payment rate and 62% recoverability.
    Actual recovery depends on failure reasons, customer mix, retry timing,
    and message quality.
  </p>
  <Link
    href="/benchmark"
    className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-dunlo-deep underline decoration-dunlo/40 underline-offset-4"
  >
    Review the benchmark methodology
  </Link>
</div>
```

Change the signup CTA to:

```tsx
<Link
  href={SIGNUP_URL}
  onClick={() =>
    captureMarketingEvent("cta_clicked", {
      button_text: "Start measuring failed payments",
      destination: SIGNUP_URL,
      location: "homepage_roi_calculator",
    })
  }
  className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-dunlo px-5 text-sm font-semibold text-dunlo-ink"
>
  Start measuring failed payments
  <ArrowRight size={16} aria-hidden />
</Link>
```

Reduce section/card radii to `rounded-2xl` for the outer section and `rounded-xl` for inner result surfaces. Delete the decorative grid background and wide drop shadows.

- [ ] **Step 5: Run tests and type-check**

```bash
bunx vitest run apps/marketing/src/components/landing/landing-style-contract.test.ts
bun run --cwd apps/marketing check-types
```

Expected: PASS and exit 0.

- [ ] **Step 6: Commit the controlled setup and calculator**

```bash
git add apps/marketing/src/components/landing/how-it-works.tsx \
  apps/marketing/src/components/landing/roi-calculator.tsx \
  apps/marketing/src/components/landing/landing-style-contract.test.ts
git commit -m "fix(marketing): make landing interactions accurate"
```

---

### Task 6: Build honest proof and founder accountability

**Files:**
- Modify: `apps/marketing/src/components/public-proof-layer.tsx:1-113`
- Modify: `apps/marketing/src/components/landing/built-by-mathieu.tsx:1-70`

- [ ] **Step 1: Add proof-policy source assertions**

Append to `landing-style-contract.test.ts`:

```ts
test("publishes verifiable beta proof without synthetic testimonials", () => {
  const proof = readFileSync(
    resolve(repoRoot, "apps/marketing/src/components/public-proof-layer.tsx"),
    "utf8",
  );

  expect(proof).toContain("What can be verified today");
  expect(proof).toContain("No anonymous uplift claims");
  expect(proof).toContain("/state-of-stripe-payments-2026");
});
```

- [ ] **Step 2: Run the test and verify the new proof copy is absent**

```bash
bunx vitest run apps/marketing/src/components/landing/landing-style-contract.test.ts
```

Expected: FAIL on the two missing phrases.

- [ ] **Step 3: Rewrite PublicProofLayer as transparent evidence**

Keep `proofItems`, but change them to:

```ts
const proofItems = [
  {
    title: "Visible assumptions",
    body: "The public benchmark explains the failed-payment and recoverability ranges used in Dunlo estimates.",
    href: "/benchmark",
    cta: "Review methodology",
    icon: SquareActivity,
  },
  {
    title: "Visible mechanics",
    body: "Failure reasons, recovery timing, Stripe-hosted update links, and founder review are documented before signup.",
    href: "/stripe-failed-payments",
    cta: "See the mechanics",
    icon: ShieldCheck,
  },
  {
    title: "Visible proof policy",
    body: "Customer metrics and stories remain private until the sample is useful and the customer approves publication.",
    href: "/state-of-stripe-payments-2026",
    cta: "Read the proof policy",
    icon: FileText,
  },
] as const;
```

Replace the rendered section heading/copy with:

```tsx
<section
  id="proof"
  className={
    compact
      ? "scroll-mt-24 overflow-hidden rounded-2xl border border-dunlo-line bg-white"
      : "scroll-mt-24 border-y border-dunlo-line bg-white"
  }
>
  <div
    className={
      compact
        ? "grid lg:grid-cols-[0.72fr_1.28fr]"
        : "mx-auto grid max-w-7xl lg:grid-cols-[0.72fr_1.28fr]"
    }
  >
    <div className="p-6 md:p-10 lg:border-r lg:border-dunlo-line">
      <p className="text-sm font-semibold text-dunlo-deep">Beta transparency</p>
      <h2 className="mt-4 max-w-xl text-balance text-4xl font-semibold leading-none tracking-[-0.03em] text-dunlo-ink md:text-6xl">
        What can be verified today.
      </h2>
      <p className="mt-6 max-w-[62ch] text-pretty text-base leading-7 text-gray-700">
        Dunlo publishes assumptions, recovery mechanics, and its proof policy
        before it publishes customer outcomes.
      </p>
      <p className="mt-5 border-l border-dunlo-ink pl-4 text-sm font-semibold leading-6 text-dunlo-ink">
        No anonymous uplift claims. No synthetic logos. No unapproved customer stories.
      </p>
    </div>
    <div className="divide-y divide-dunlo-line">
      {proofItems.map((item) => {
        const Icon = item.icon;
        return (
          <article key={item.title} className="grid gap-4 p-6 md:grid-cols-[auto_1fr_auto] md:items-center md:p-8">
            <Icon className="text-dunlo-deep" size={20} aria-hidden />
            <div>
              <h3 className="text-lg font-semibold text-dunlo-ink">{item.title}</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-700">{item.body}</p>
            </div>
            <Link href={item.href} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-dunlo-deep">
              {item.cta}<ArrowRight size={14} aria-hidden />
            </Link>
          </article>
        );
      })}
    </div>
  </div>
</section>
```

Keep the existing `compact` prop exactly as shown so alternatives and comparison pages retain their contained layout while the homepage receives the full-width ruled treatment.

- [ ] **Step 4: Simplify the founder section**

In `built-by-mathieu.tsx`, use one compact ruled layout:

```tsx
<section className="mx-auto grid max-w-7xl gap-6 border-t border-dunlo-line py-10 md:grid-cols-[auto_1fr_auto] md:items-center">
  <Image
    src={FOUNDER_IMAGE_URL}
    alt="Mathieu Chambaud, founder of Dunlo"
    width={80}
    height={80}
    className="size-20 rounded-xl object-cover"
  />
  <div>
    <p className="text-sm font-semibold text-dunlo-deep">Built and supported by Mathieu</p>
    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-dunlo-ink">
      A founder-led beta with a public standard for proof.
    </h2>
    <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-700">
      I built Dunlo to make failed-payment recovery more specific and less
      awkward for customers. Beta feedback goes directly to me.
    </p>
  </div>
  <Link
    href={X_PROFILE_URL}
    className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-dunlo-deep"
  >
    Follow the build
    <ArrowUpRight size={15} aria-hidden />
  </Link>
</section>
```

- [ ] **Step 5: Run tests, type-check, and inspect all proof importers**

```bash
rg -n "PublicProofLayer" apps/marketing/src
bunx vitest run apps/marketing/src/components/landing/landing-style-contract.test.ts
bun run --cwd apps/marketing check-types
```

Expected: all importers compile; tests PASS; type-check exits 0.

- [ ] **Step 6: Commit honest proof**

```bash
git add apps/marketing/src/components/public-proof-layer.tsx \
  apps/marketing/src/components/landing/built-by-mathieu.tsx \
  apps/marketing/src/components/landing/landing-style-contract.test.ts
git commit -m "feat(marketing): publish honest beta proof"
```

---

### Task 7: Extract conversion sections and compose the new narrative

**Files:**
- Create: `apps/marketing/src/components/landing/pricing.tsx`
- Create: `apps/marketing/src/components/landing/faq.tsx`
- Create: `apps/marketing/src/components/landing/resource-library.tsx`
- Create: `apps/marketing/src/components/landing/final-cta.tsx`
- Modify: `apps/marketing/src/components/landing-page.tsx:1-639`

- [ ] **Step 1: Extend the style contract for composition cleanup**

Append to `landing-style-contract.test.ts`:

```ts
test("removes decorative grids and oversized card radii from the landing composition", () => {
  const files = [
    "apps/marketing/src/components/landing-page.tsx",
    "apps/marketing/src/components/landing/payment-recovery-hero.tsx",
    "apps/marketing/src/components/landing/escalation.tsx",
    "apps/marketing/src/components/landing/how-it-works.tsx",
    "apps/marketing/src/components/landing/roi-calculator.tsx",
  ];
  const source = files
    .map((file) => readFileSync(resolve(repoRoot, file), "utf8"))
    .join("\n");

  expect(source).not.toContain("linear-gradient(to_right");
  expect(source).not.toContain("rounded-[2rem]");
  expect(source).not.toContain("shadow-[0_40px_100px");
});
```

- [ ] **Step 2: Run the test and verify legacy composition failures**

```bash
bunx vitest run apps/marketing/src/components/landing/landing-style-contract.test.ts
```

Expected: FAIL on the current grid background, 2rem radii, and hero shadow.

- [ ] **Step 3: Create the pricing section**

Create `apps/marketing/src/components/landing/pricing.tsx` with these imports and component:

```tsx
import { ArrowRight, Check } from "lucide-react";
import { TrackedLink } from "@/components/tracked-link";
import { SIGNUP_URL } from "@/lib/app-url";
import { PRICING_FEATURES } from "./landing-content";

export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-24 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
        <div>
          <p className="text-sm font-semibold text-dunlo-deep">Beta pricing</p>
          <h2 className="mt-4 max-w-xl text-balance text-4xl font-semibold leading-none tracking-[-0.03em] text-dunlo-ink md:text-6xl">
            Free during beta. No recovery cut.
          </h2>
          <p className="mt-6 max-w-[62ch] text-pretty text-base leading-7 text-gray-700">
            Dunlo will communicate any pricing change before billing starts.
          </p>
        </div>
        <div className="grid overflow-hidden rounded-2xl border border-dunlo-line bg-white md:grid-cols-[0.78fr_1.22fr]">
          <div className="bg-dunlo-ink p-6 text-white md:p-8">
            <p className="text-sm font-semibold text-dunlo">Beta plan</p>
            <p className="mt-8 font-mono text-5xl font-semibold">$0</p>
            <p className="mt-2 text-sm text-white/75">until beta ends</p>
            <TrackedLink
              href={SIGNUP_URL}
              eventProperties={{button_text:"Start free in beta",destination:SIGNUP_URL,location:"homepage_pricing"}}
              className="mt-8 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-dunlo px-5 text-sm font-semibold text-dunlo-ink"
            >
              Start free in beta <ArrowRight size={16} aria-hidden />
            </TrackedLink>
          </div>
          <ul className="divide-y divide-dunlo-line">
            {PRICING_FEATURES.map((feature) => (
              <li key={feature} className="flex min-h-14 items-center gap-3 px-5 py-4 text-sm font-semibold text-gray-800">
                <Check size={16} className="text-dunlo-deep" aria-hidden />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create FAQ, resource library, and final CTA**

`faq.tsx` maps `FAQ_ITEMS` into semantic `<details>` rows with 44 px summaries and no duplicated data.

```tsx
import { ChevronRight } from "lucide-react";
import { FAQ_ITEMS } from "./landing-content";

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-24 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[0.68fr_1.32fr]">
        <h2 className="max-w-lg text-balance text-4xl font-semibold leading-none tracking-[-0.03em] text-dunlo-ink md:text-6xl">
          Straight answers before you connect Stripe.
        </h2>
        <div className="border-y-2 border-dunlo-ink">
          {FAQ_ITEMS.map((item, index) => (
            <details key={item.question} className="group border-b border-dunlo-line last:border-b-0" open={index === 0}>
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 py-3 text-lg font-semibold marker:hidden [&::-webkit-details-marker]:hidden">
                {item.question}<ChevronRight size={18} className="shrink-0 transition-transform group-open:rotate-90" aria-hidden />
              </summary>
              <p className="max-w-3xl pb-5 text-sm leading-6 text-gray-700">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
```

`resource-library.tsx` maps `RESOURCE_LINKS` into a pre-footer ruled list:

```tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RESOURCE_LINKS } from "./landing-content";

export function ResourceLibrary() {
  return (
    <section className="px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto max-w-7xl border-t border-dunlo-line pt-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div><p className="text-sm font-semibold text-dunlo-deep">Explore further</p><h2 className="mt-2 text-2xl font-semibold text-dunlo-ink">Stripe payment recovery resources</h2></div>
          <Link href="/blog" className="inline-flex min-h-11 items-center text-sm font-semibold text-dunlo-deep">Browse all resources <ArrowRight size={14} aria-hidden /></Link>
        </div>
        <div className="mt-6 grid border-y border-dunlo-line md:grid-cols-2">
          {RESOURCE_LINKS.map((item) => (
            <Link key={item.href} href={item.href} className="group border-b border-dunlo-line p-5 odd:md:border-r md:[&:nth-last-child(-n+2)]:border-b-0">
              <h3 className="text-base font-semibold text-dunlo-ink group-hover:text-dunlo-deep">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-700">{item.body}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
```

`final-cta.tsx` uses the approved promise and signup destination:

```tsx
import { ArrowRight } from "lucide-react";
import { TrackedLink } from "@/components/tracked-link";
import { SIGNUP_URL } from "@/lib/app-url";

export function FinalCta() {
  return (
    <section className="px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto grid max-w-7xl gap-8 rounded-2xl bg-dunlo px-6 py-10 text-dunlo-ink md:px-10 md:py-14 lg:grid-cols-[1fr_auto] lg:items-end">
        <div><p className="text-sm font-semibold">Free during beta</p><h2 className="mt-4 max-w-4xl text-balance text-4xl font-semibold leading-none tracking-[-0.03em] md:text-6xl">Recover the payment. Keep the customer relationship intact.</h2></div>
        <TrackedLink href={SIGNUP_URL} eventProperties={{button_text:"Start free in beta",destination:SIGNUP_URL,location:"homepage_final_cta"}} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-dunlo-ink px-5 text-sm font-semibold text-white">Start free in beta <ArrowRight size={16} aria-hidden /></TrackedLink>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Reduce LandingPage to the approved narrative**

Replace `landing-page.tsx` with imports and this composition:

```tsx
import { BuiltByMathieu } from "@/components/landing/built-by-mathieu";
import { Escalation } from "@/components/landing/escalation";
import { FailureResponseMap } from "@/components/landing/failure-response-map";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Nav } from "@/components/landing/nav";
import { PaymentRecoveryHero } from "@/components/landing/payment-recovery-hero";
import { Pricing } from "@/components/landing/pricing";
import { ResourceLibrary } from "@/components/landing/resource-library";
import { RoiCalculator } from "@/components/landing/roi-calculator";
import { TrustStrip } from "@/components/landing/trust-strip";
import { PublicProofLayer } from "@/components/public-proof-layer";

export function LandingPage() {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-dunlo-ground font-sans text-dunlo-ink">
      <Nav />
      <main>
        <PaymentRecoveryHero />
        <TrustStrip />
        <FailureResponseMap />
        <section className="px-4 py-8 md:px-6 md:py-14"><div className="mx-auto max-w-7xl"><Escalation /></div></section>
        <section className="px-4 py-8 md:px-6 md:py-14"><div className="mx-auto max-w-7xl"><HowItWorks /></div></section>
        <section className="px-4 py-8 md:px-6 md:py-14"><div className="mx-auto max-w-7xl"><RoiCalculator /></div></section>
        <PublicProofLayer />
        <section className="px-4 md:px-6"><BuiltByMathieu /></section>
        <Pricing />
        <Faq />
        <ResourceLibrary />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
```

Delete all former inline arrays, `HeroSection`, `RecoveryDesk`, `ResourceLinksSection`, `FeaturesSection`, `PricingSection`, `FaqSection`, `FinalCta`, `GridBackdrop`, and commented proof/testimonial blocks.

- [ ] **Step 6: Run all landing contracts, type-check, and build**

```bash
bunx vitest run \
  apps/marketing/src/components/landing/landing-content.test.ts \
  apps/marketing/src/components/landing/landing-style-contract.test.ts \
  apps/marketing/src/lib/beta-testimonials.test.ts
bun run --cwd apps/marketing check-types
bun run --cwd apps/marketing build
```

Expected: all tests PASS; type-check exits 0; Next build succeeds.

- [ ] **Step 7: Commit the full narrative composition**

```bash
git add apps/marketing/src/components/landing-page.tsx \
  apps/marketing/src/components/landing/pricing.tsx \
  apps/marketing/src/components/landing/faq.tsx \
  apps/marketing/src/components/landing/resource-library.tsx \
  apps/marketing/src/components/landing/final-cta.tsx \
  apps/marketing/src/components/landing/landing-style-contract.test.ts
git commit -m "feat(marketing): compose modern customer-trust landing"
```

---

### Task 8: Browser verification, accessibility hardening, and final cleanup

**Files:**
- Modify only files with verified defects from the checks below.
- Inspect: `apps/marketing/src/components/landing/**/*.tsx`
- Inspect: `apps/marketing/src/components/landing-page.tsx`
- Inspect: `packages/ui/src/styles/globals.css`

- [ ] **Step 1: Start the marketing app and record the process**

Run:

```bash
bun run dev:marketing
```

Expected: Next.js serves the homepage at `http://localhost:3000`. Keep the process ID/session so it can be stopped after verification.

- [ ] **Step 2: Inspect required viewports with Playwright**

Using the Playwright CLI wrapper, open `http://localhost:3000`, then resize and screenshot at:

```text
390 × 844
768 × 1024
1024 × 768
1280 × 900
1440 × 900
```

At each viewport verify:

```text
document.documentElement.scrollWidth === window.innerWidth
hero preview is not clipped
one h1 only
trust strip precedes the first long product section
pricing, FAQ, and resources render in the approved order
```

Expected: no horizontal overflow and no clipped hero content.

- [ ] **Step 3: Verify keyboard and interaction behavior**

Tab through the page and confirm:

```text
logo → desktop/mobile navigation → Sign in → Start free → hero CTAs
mobile menu is reachable and its links are at least 44 px tall
How It Works buttons expose aria-pressed and update visible content
ROI range control moves by ArrowLeft/ArrowRight
FAQ summaries toggle with Enter and Space
every visible focus state has a clear ring
no preview-only element receives focus
```

Expected: every interactive element changes state or navigates; no dead controls.

- [ ] **Step 4: Measure contrast and fix verified failures**

Measure computed foreground/background pairs for:

```text
text-dunlo-ink on bg-dunlo
text-dunlo-deep on white and dunlo-ground
gray body text on dunlo-ground and white
white/75 on dunlo-ink
focus rings against white, ground, green, and ink
```

Required thresholds:

```text
normal text: 4.5:1
large text: 3:1
focus/non-text UI: 3:1
```

If a pair fails, change the semantic token in `globals.css` rather than applying a one-off component color.

- [ ] **Step 5: Verify reduced motion and touch targets**

Emulate `prefers-reduced-motion: reduce` and confirm all content remains visible. At 390 px, measure primary actions, menu rows, step buttons, range input, FAQ summaries, and footer controls.

Expected: primary controls are at least 44×44 px and no information depends on motion.

- [ ] **Step 6: Run Impeccable detector and inspect false negatives manually**

```bash
node .agents/skills/impeccable/scripts/detect.mjs --json \
  apps/marketing/src/components/landing-page.tsx \
  apps/marketing/src/components/landing
```

Expected: address real findings. Regardless of detector output, manually run:

```bash
rg -n "rounded-\[2rem\]|linear-gradient\(to_right|uppercase tracking-|text-white.*bg-dunlo|bg-dunlo.*text-white|landing-float" \
  apps/marketing/src/components/landing-page.tsx \
  apps/marketing/src/components/landing \
  packages/ui/src/styles/globals.css
```

Expected: no decorative grid, oversized card radius, white-on-green CTA, or permanent float animation in the landing scope. Remaining uppercase tracking is limited to real codes/statuses and reviewed individually.

- [ ] **Step 7: Confirm cleanup and rerun the full checks**

Confirm that `landing-page.tsx` contains no legacy inline section implementation or commented-out proof block. Do not delete alternate components used by other marketing routes. Then run:

```bash
bunx vitest run apps/marketing/src/**/*.test.ts
bun run check-types
bun run build
git diff --check
```

Expected: tests PASS; monorepo type-check/build exit 0; diff check is clean.

- [ ] **Step 8: Stop the local server and commit final hardening**

Stop the recorded marketing dev process. Stage only files changed while correcting verified browser/accessibility defects, then commit:

```bash
git add packages/ui/src/styles/globals.css \
  apps/marketing/src/components/landing-page.tsx \
  apps/marketing/src/components/landing/nav.tsx \
  apps/marketing/src/components/landing/payment-recovery-hero.tsx \
  apps/marketing/src/components/landing/trust-strip.tsx \
  apps/marketing/src/components/landing/failure-response-map.tsx \
  apps/marketing/src/components/landing/escalation.tsx \
  apps/marketing/src/components/landing/how-it-works.tsx \
  apps/marketing/src/components/landing/roi-calculator.tsx \
  apps/marketing/src/components/public-proof-layer.tsx \
  apps/marketing/src/components/landing/built-by-mathieu.tsx \
  apps/marketing/src/components/landing/pricing.tsx \
  apps/marketing/src/components/landing/faq.tsx \
  apps/marketing/src/components/landing/resource-library.tsx \
  apps/marketing/src/components/landing/final-cta.tsx \
  apps/marketing/src/components/landing/landing-style-contract.test.ts
git commit -m "fix(marketing): harden landing accessibility and responsive UI"
```

- [ ] **Step 9: Re-run the design critique**

Run `$impeccable critique` against the finished homepage using two independent assessments. Compare the new score with the 23/40 baseline and record remaining P1/P2 findings without weakening the honesty constraints.

Expected: no P0, no known inert controls, no known white-on-green contrast failure, and a materially improved score.
