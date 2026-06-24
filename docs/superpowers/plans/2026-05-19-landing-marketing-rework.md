# Landing Marketing Rework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the Dunlo landing page copy and section framing so each major section explains payment recovery to novices while giving Stripe-specific proof to advanced readers.

**Architecture:** Keep the existing landing structure and visual system, then sharpen the narrative layer in place. Most changes are copy, constants, and compact proof blocks in existing landing components rather than new product behavior or large layout rewrites.

**Tech Stack:** TanStack Start, TanStack Router, React, TypeScript, Tailwind CSS v4, framer-motion, lucide-react.

---

## File Map

- `apps/web/src/lib/seo.ts`: Update default metadata to match the new founder-to-founder promise.
- `apps/web/src/routes/index.tsx`: Update hero copy, feature/problem framing, pricing text, FAQ answers, final CTA, and JSON-LD description.
- `apps/web/src/components/landing/stats-banner.tsx`: Reframe stats as an education/proof section with clearer novice and expert language.
- `apps/web/src/components/landing/escalation.tsx`: Tighten the AI escalation section around "automation for routine failures, founder touch for meaningful revenue."
- `apps/web/src/components/landing/how-it-works.tsx`: Reframe setup steps around Stripe signal, editable sequences, email provider, and monitoring.
- `apps/web/src/components/landing/roi-calculator.tsx`: Make assumptions explicit and reduce overclaiming.

Do not edit auth, dashboard, Stripe route handlers, pricing mechanics, or design tokens.

---

### Task 1: Update Metadata And Top-Level Marketing Constants

**Files:**
- Modify: `apps/web/src/lib/seo.ts`
- Modify: `apps/web/src/routes/index.tsx`

- [ ] **Step 1: Update SEO defaults**

In `apps/web/src/lib/seo.ts`, replace `DEFAULT_TITLE` and `DEFAULT_DESCRIPTION` with:

```ts
export const DEFAULT_TITLE =
  "Dunlo - Recover Failed Payments Before Customers Disappear";
export const DEFAULT_DESCRIPTION =
  "Dunlo helps SaaS founders recover failed payments with failure-code-specific emails, founder escalation for high-value accounts, and clear recovered-revenue tracking.";
```

- [ ] **Step 2: Update the JSON-LD application description**

In `apps/web/src/routes/index.tsx`, inside the `SoftwareApplication` JSON-LD object, replace the `description` value with:

```ts
description:
  "Stripe payment recovery SaaS that reads failed-payment reasons, sends failure-code-specific recovery emails, and drafts founder escalation emails for high-value accounts.",
```

- [ ] **Step 3: Update the `FEATURE_ITEMS` copy**

In `apps/web/src/routes/index.tsx`, replace the current `FEATURE_ITEMS` array with:

```ts
const FEATURE_ITEMS = [
  {
    label: "Understand",
    title: "Shows why the payment failed",
    body: "Expired card, insufficient funds, bank decline, or do-not-honor are treated as different recovery paths.",
    icon: CreditCard,
  },
  {
    label: "Recover",
    title: "Sends the right follow-up",
    body: "Dunlo matches the Stripe reason to a clearer message, safer timing, and the right payment update path.",
    icon: MailCheck,
  },
  {
    label: "Escalate",
    title: "Keeps important accounts human",
    body: "High-value failures can pause automation and become a founder email draft before the customer goes quiet.",
    icon: FileText,
  },
] as const;
```

- [ ] **Step 4: Update the FAQ copy**

In `apps/web/src/routes/index.tsx`, replace the `FAQS` array with:

```ts
const FAQS = [
  {
    question: "What is involuntary churn?",
    answer:
      "It is churn caused by payment failure rather than a customer choosing to cancel. A good customer can disappear because their card expired, their bank declined a charge, or they missed a payment update email.",
  },
  {
    question: "How is Dunlo different from Stripe Smart Retries?",
    answer:
      "Stripe Smart Retries can keep retrying the card. Dunlo handles the customer communication around the failure: why it happened, what message to send, when to follow up, and when a founder should step in.",
  },
  {
    question: "How is Dunlo different from Triggla or Churn Buster?",
    answer:
      "Dunlo is narrower: Stripe-first recovery, failure-code-specific emails, AI founder escalation, and simple beta pricing instead of a broad lifecycle suite or a recovered-revenue cut.",
  },
  {
    question: "What is the AI escalation feature exactly?",
    answer:
      "When a failed payment crosses your threshold, Dunlo pauses automation and drafts a short personal email from the founder with Stripe context and account value. You can review, regenerate, dismiss, or send it.",
  },
  {
    question: "Is my Stripe data safe?",
    answer:
      "Dunlo uses Stripe data to understand failed-payment context and recovery status. It does not need to move money, change charges, or store card details.",
  },
  {
    question: "How much setup is involved?",
    answer:
      "Connect Stripe, review the default sequences, and add your email provider. The baseline setup does not require an engineering team.",
  },
  {
    question: "What happens during beta?",
    answer:
      "The product is free during beta. Pricing is visible now so you know the direction before Dunlo starts billing.",
  },
] as const;
```

- [ ] **Step 5: Run a type check for this small copy change**

Run:

```bash
bun run check-types
```

Expected: exit code `0`.

- [ ] **Step 6: Commit Task 1**

Run:

```bash
git add apps/web/src/lib/seo.ts apps/web/src/routes/index.tsx
git commit -m "copy: update landing metadata and faq"
```

Expected: commit succeeds.

---

### Task 2: Rework Hero And Problem Education In `index.tsx`

**Files:**
- Modify: `apps/web/src/routes/index.tsx`

- [ ] **Step 1: Replace the hero badge, headline, body, CTAs, and reassurance line**

In `LandingPage`, inside the first hero text column, use this copy:

```tsx
<span className="size-1.5 rounded-full bg-dunlo" />
Free during beta
```

```tsx
Recover failed payments before good customers disappear.
```

```tsx
Dunlo turns Stripe failure reasons into the right recovery email, the right retry timing, and a founder-written follow-up when the account matters.
```

Keep the primary CTA text:

```tsx
See your benchmark
```

Replace the secondary CTA text with:

```tsx
Why payments fail
```

and point it to:

```tsx
href="#payment-failures"
```

- [ ] **Step 2: Add a compact expert proof row below the hero body**

Still inside the hero text column and before the CTA row, add:

```tsx
<motion.div
  initial={{ opacity: 0, y: 14 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{
    duration: 0.58,
    delay: 0.2,
    ease: [0.16, 1, 0.3, 1],
  }}
  className="mt-6 grid gap-2 sm:grid-cols-3"
>
  {[
    { label: "Stripe signal", value: "failure_code" },
    { label: "Recovery move", value: "sequence + timing" },
    { label: "Human layer", value: "founder draft" },
  ].map((item) => (
    <div
      key={item.label}
      className="rounded-2xl border border-gray-200 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-md"
    >
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
        {item.label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-gray-900">
        {item.value}
      </p>
    </div>
  ))}
</motion.div>
```

- [ ] **Step 3: Add the problem-education section before the existing stats section**

Insert this section before `<section id="product" className="scroll-mt-24">`:

```tsx
<section id="payment-failures" className="scroll-mt-24">
  <div className={SECTION_SURFACE}>
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
      <div>
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
          Payment failures
        </p>
        <h2 className="mt-4 max-w-lg text-3xl font-semibold tracking-tight text-gray-950 md:text-5xl">
          A failed payment is not one problem.
        </h2>
        <p className="mt-5 max-w-md text-base leading-7 text-gray-600">
          A card can expire, a bank can decline a charge, or a customer can be short on funds for a few days. Treating all of those moments the same is how recoverable revenue turns into silent churn.
        </p>
      </div>

      <div className="grid gap-3">
        {[
          {
            code: "expired_card",
            plain: "The card needs an update.",
            move: "Send a secure payment update link quickly.",
          },
          {
            code: "insufficient_funds",
            plain: "The customer may need a softer retry window.",
            move: "Wait, retry, and phrase the email with less urgency.",
          },
          {
            code: "do_not_honor",
            plain: "The bank gave a generic refusal.",
            move: "Give clear context and escalate if the account value is high.",
          },
        ].map((item) => (
          <article
            key={item.code}
            className="rounded-[1.25rem] border border-gray-100 bg-white px-4 py-4 shadow-sm"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-mono text-xs font-semibold text-dunlo-deep">
                  {item.code}
                </p>
                <h3 className="mt-2 text-base font-semibold tracking-tight text-gray-950">
                  {item.plain}
                </h3>
              </div>
              <p className="max-w-sm text-sm leading-6 text-gray-600">
                {item.move}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 4: Reframe the existing feature section header**

In the section with `id="features"`, replace the heading and body with:

```tsx
From Stripe signal to recovery action.
```

```tsx
Dunlo keeps the simple version simple: why did the payment fail, what should the customer hear, and when should a founder step in?
```

- [ ] **Step 5: Run type check**

Run:

```bash
bun run check-types
```

Expected: exit code `0`.

- [ ] **Step 6: Commit Task 2**

Run:

```bash
git add apps/web/src/routes/index.tsx
git commit -m "copy: reframe landing hero and failure education"
```

Expected: commit succeeds.

---

### Task 3: Rework Proof, Stats, And ROI Copy

**Files:**
- Modify: `apps/web/src/components/landing/stats-banner.tsx`
- Modify: `apps/web/src/components/landing/roi-calculator.tsx`

- [ ] **Step 1: Add an intro column to `StatsBanner`**

In `apps/web/src/components/landing/stats-banner.tsx`, change the section body from only a 3-column stats grid to this wrapper:

```tsx
<div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
  <div className="border-b border-gray-100 px-8 py-8 md:py-10 lg:border-r lg:border-b-0">
    <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
      Why it matters
    </p>
    <h2 className="mt-4 max-w-md text-3xl font-semibold tracking-tight text-gray-950 md:text-4xl">
      Failed payments are often recoverable revenue, not lost customers.
    </h2>
    <p className="mt-4 max-w-md text-sm leading-6 text-gray-600">
      If you are new to payment recovery, start here: some churn happens because billing failed. If you already know dunning, the key is precision by failure reason.
    </p>
  </div>
  <div className="grid grid-cols-1 divide-y divide-gray-100 md:grid-cols-3 md:divide-x md:divide-y-0 lg:grid-cols-1 lg:divide-x-0 xl:grid-cols-3 xl:divide-x xl:divide-y-0">
    {/* existing stat cards stay here */}
  </div>
</div>
```

Keep the existing `STATS.map` rendering inside the inner grid.

- [ ] **Step 2: Update stat labels for clarity**

In `STATS`, use:

```ts
const STATS = [
  {
    prefix: "~",
    value: 5,
    suffix: "%",
    label: "of recurring payments can fail in a typical month",
    source: "Stripe",
  },
  {
    prefix: "",
    value: 40,
    suffix: "%",
    label: "of churn can be involuntary when payments fail",
    source: "ProfitWell",
    note: "up to",
  },
  {
    prefix: "",
    value: 63,
    suffix: "%",
    label: "of failed payments may be recoverable with the right follow-up",
    source: "Stripe",
  },
];
```

- [ ] **Step 3: Update ROI intro copy**

In `apps/web/src/components/landing/roi-calculator.tsx`, replace the heading and paragraph with:

```tsx
Estimate the revenue hiding in failed payments.
```

```tsx
Move the slider to match your MRR. Dunlo estimates failed revenue, then applies a recoverable-rate assumption so the number stays understandable instead of magical.
```

- [ ] **Step 4: Update ROI result and assumptions copy**

In the dark result panel, replace the `id="roi-calculator-result"` paragraph with:

```tsx
You may have ~
<span className="text-dunlo">
  <AnimatedCurrency value={recovered} />
</span>
/mo in recoverable failed-payment revenue.
```

Replace the explanatory paragraph near the CTA with:

```tsx
Estimate based on {formatCurrency(monthlyFailed)} failed MRR at risk, a 5% failed-payment rate, and 63% recoverability. Actual recovery depends on your customer mix, card network response, timing, and message quality.
```

Replace CTA text with:

```tsx
See my benchmark
```

- [ ] **Step 5: Run type check**

Run:

```bash
bun run check-types
```

Expected: exit code `0`.

- [ ] **Step 6: Commit Task 3**

Run:

```bash
git add apps/web/src/components/landing/stats-banner.tsx apps/web/src/components/landing/roi-calculator.tsx
git commit -m "copy: clarify landing proof and roi assumptions"
```

Expected: commit succeeds.

---

### Task 4: Rework Escalation And Setup Sections

**Files:**
- Modify: `apps/web/src/components/landing/escalation.tsx`
- Modify: `apps/web/src/components/landing/how-it-works.tsx`

- [ ] **Step 1: Update escalation heading and body**

In `apps/web/src/components/landing/escalation.tsx`, replace the main `h2` and paragraph with:

```tsx
Automate routine failures. Keep the founder touch for meaningful revenue.
```

```tsx
Set a threshold for the accounts that deserve a human moment. When a failed payment crosses it, Dunlo pauses the sequence and drafts a founder email using the Stripe context, payment value, and customer record.
```

- [ ] **Step 2: Update escalation CTAs**

Replace:

```tsx
Try escalation drafts
```

with:

```tsx
Review an escalation draft
```

Replace:

```tsx
See Growth plan
```

with:

```tsx
See beta pricing
```

- [ ] **Step 3: Update `HIW_STEPS`**

In `apps/web/src/components/landing/how-it-works.tsx`, replace `HIW_STEPS` with:

```ts
const HIW_STEPS = [
  {
    n: "01",
    title: "Connect Stripe",
    body: "Authorize Dunlo with Stripe OAuth so it can read payment failures, customers, charges, and subscriptions for recovery context.",
    Mockup: MockupConnect,
  },
  {
    n: "02",
    title: "Tune recovery sequences",
    body: "Start with defaults for common failure reasons, then adjust tone, timing, and follow-up windows to match your product.",
    Mockup: MockupSequences,
  },
  {
    n: "03",
    title: "Monitor recovered revenue",
    body: "Track which payments are pending, recovered, or escalated so recovery becomes visible instead of buried in Stripe events.",
    Mockup: MockupDashboard,
  },
] as const;
```

- [ ] **Step 4: Update setup section intro**

In `HowItWorks`, replace the `h2` and paragraph with:

```tsx
Connect Stripe, tune the defaults, then let Dunlo watch the recovery loop.
```

```tsx
No custom webhook build. No payment-ops spreadsheet. You can start with defaults and refine the sequences later.
```

- [ ] **Step 5: Run type check**

Run:

```bash
bun run check-types
```

Expected: exit code `0`.

- [ ] **Step 6: Commit Task 4**

Run:

```bash
git add apps/web/src/components/landing/escalation.tsx apps/web/src/components/landing/how-it-works.tsx
git commit -m "copy: clarify escalation and setup story"
```

Expected: commit succeeds.

---

### Task 5: Polish Pricing, Final CTA, And Full Verification

**Files:**
- Modify: `apps/web/src/routes/index.tsx`

- [ ] **Step 1: Update pricing intro copy**

In the pricing section, replace the paragraph beside the heading with:

```tsx
Every tier includes Stripe failure-code detection, recovery emails, secure update links, and recovered-revenue tracking. The tier only follows your MRR when Dunlo starts billing.
```

- [ ] **Step 2: Update final CTA copy**

In the final CTA section, replace the heading with:

```tsx
Find the failed-payment revenue your Stripe account is already showing you.
```

Replace the CTA text with:

```tsx
Start free in beta
```

- [ ] **Step 3: Run type check**

Run:

```bash
bun run check-types
```

Expected: exit code `0`.

- [ ] **Step 4: Check for forbidden Dunlo hex values in components**

Run:

```bash
rg -n "#00e87b|#00ff8c|#00c66a|#009950|emerald-" apps/web/src packages/ui/src --glob '!packages/ui/src/styles/globals.css'
```

Expected: no matches.

- [ ] **Step 5: Run production build**

Run:

```bash
bun run build
```

Expected: exit code `0`. If the build requires unavailable local environment variables, record the exact missing variables and continue to visual verification with the dev server only if possible.

- [ ] **Step 6: Start the web app**

Run:

```bash
bun run dev:web
```

Expected: dev server starts and prints a local URL, usually `http://localhost:3000`.

- [ ] **Step 7: Visually inspect desktop and mobile**

Open the local URL in the browser and check:

- Hero promise is understandable without knowing dunning terminology.
- `payment-failures` section explains different failure reasons.
- Feature/recovery section gives the advanced Stripe-specific mechanism.
- Escalation section reads as founder-controlled, not autopilot AI.
- ROI section explains assumptions and does not overclaim exact recovery.
- Pricing and FAQ answer Smart Retries, safety, beta, and setup objections.
- No text overlaps on desktop or mobile.

- [ ] **Step 8: Commit final polish**

Run:

```bash
git add apps/web/src/routes/index.tsx
git commit -m "copy: polish landing pricing and final cta"
```

Expected: commit succeeds if `index.tsx` changed in this task.

---

## Self-Review Checklist

- Spec goal "double-reading structure" is covered by Tasks 2, 3, and 4.
- Novice education is covered by hero, payment-failures, stats intro, setup, and FAQ.
- Expert Stripe/recovery proof is covered by failure-code mapping, recovery-engine copy, ROI assumptions, Smart Retries FAQ, and setup details.
- Founder-to-founder tone is covered by hero, escalation, founder-controlled AI language, and final CTA.
- Visual system constraints are covered by in-place section changes and token verification.
- Non-goals are protected because no auth, dashboard, Stripe API route, pricing mechanics, or token files are touched.
