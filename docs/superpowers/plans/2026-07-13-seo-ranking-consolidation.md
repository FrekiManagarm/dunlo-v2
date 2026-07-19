# SEO Ranking Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate Dunlo's emerging non-brand rankings around four clear content owners and strengthen the failed-payments pillar without creating new SEO pages.

**Architecture:** Keep the current Next.js routes and Fumadocs content system. Add two optional blog metadata fields through one pure helper, then make focused copy, link, and JSON-LD changes in the existing page owners. Source-contract tests guard exact titles, descriptions, H1s, source links, and internal-link ownership while the production build verifies the rendered application.

**Tech Stack:** Next.js 16 App Router, React 19, Fumadocs MDX, TypeScript, Vitest, Bun, Tailwind CSS v4.

---

## File Structure

### New files

- `apps/marketing/src/lib/blog-seo.ts` — pure fallback logic for optional blog search titles and modification dates.
- `apps/marketing/src/lib/blog-seo.test.ts` — unit tests for blog metadata fallback behavior.
- `apps/marketing/src/lib/source-test-utils.ts` — reads marketing source files for SEO contract tests.
- `apps/marketing/src/lib/smart-retries-seo.test.ts` — Smart Retries title, copy, link, and source contract.
- `apps/marketing/src/lib/involuntary-churn-seo.test.ts` — involuntary-churn frontmatter, source, link, and CTA contract.
- `apps/marketing/src/lib/card-velocity-seo.test.ts` — decline-code ownership and cannibalization contract.
- `apps/marketing/src/lib/stripe-dunning-seo.test.ts` — dunning title, definition, link, and source contract.
- `apps/marketing/src/lib/failed-payments-links.test.ts` — inbound-link contract for the broad pillar.

### Modified files

- `apps/marketing/source.config.ts` — accepts optional `seoTitle` and `updated` frontmatter.
- `apps/marketing/src/lib/blog.ts` — exposes optional blog SEO metadata.
- `apps/marketing/src/app/blog/[slug]/page.tsx` — uses the SEO title and modification-date fallbacks.
- `apps/marketing/src/app/sitemap.ts` — publishes accurate modification dates for refreshed static, blog, and decline-code URLs.
- `apps/marketing/content/blog/involuntary-churn-in-saas.mdx` — refreshed intent, sources, internal links, and CTA sequencing.
- `apps/marketing/src/app/stripe-smart-retries-alternative/page.tsx` — informational-first Smart Retries owner.
- `apps/marketing/src/lib/stripe-decline-codes.ts` — exact card-velocity metadata, opening answer, and modification date.
- `apps/marketing/src/app/stripe-decline-codes/[slug]/page.tsx` — renders optional focused openings and per-guide modification dates.
- `apps/marketing/content/blog/stripe-failure-codes-the-complete-guide.mdx` — removes the duplicate card-velocity answer and links to its owner.
- `apps/marketing/src/app/stripe-dunning/page.tsx` — informational-first dunning owner with authoritative sources.
- `apps/marketing/src/app/stripe-failed-payments/page.tsx` — adds contextual inbound links to all priority owners.

## Task 1: Add Backward-Compatible Blog SEO Metadata

**Files:**

- Create: `apps/marketing/src/lib/blog-seo.ts`
- Create: `apps/marketing/src/lib/blog-seo.test.ts`
- Modify: `apps/marketing/source.config.ts`
- Modify: `apps/marketing/src/lib/blog.ts`
- Modify: `apps/marketing/src/app/blog/[slug]/page.tsx`

- [ ] **Step 1: Write the failing metadata helper tests**

Create `apps/marketing/src/lib/blog-seo.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { getBlogModifiedDate, getBlogSeoTitle } from "./blog-seo";

describe("blog SEO metadata", () => {
  test("prefers a dedicated search title without changing the editorial title", () => {
    expect(
      getBlogSeoTitle({
        title: "What Is Involuntary Churn in SaaS?",
        seoTitle: "Involuntary Churn in SaaS: Causes & Fixes | Dunlo",
      }),
    ).toBe("Involuntary Churn in SaaS: Causes & Fixes | Dunlo");
  });

  test("keeps the current blog-title fallback for existing posts", () => {
    expect(getBlogSeoTitle({ title: "A practical guide" })).toBe(
      "A practical guide - Dunlo Blog",
    );
  });

  test("uses the update date only when the post declares one", () => {
    expect(
      getBlogModifiedDate({ date: "2026-05-22", updated: "2026-07-13" }),
    ).toBe("2026-07-13");
    expect(getBlogModifiedDate({ date: "2026-05-22" })).toBe("2026-05-22");
  });
});
```

- [ ] **Step 2: Run the test and verify the missing module failure**

Run:

```bash
bunx vitest run apps/marketing/src/lib/blog-seo.test.ts
```

Expected: FAIL because `./blog-seo` does not exist.

- [ ] **Step 3: Implement the pure metadata helper**

Create `apps/marketing/src/lib/blog-seo.ts`:

```ts
type BlogTitleInput = {
  title: string;
  seoTitle?: string;
};

type BlogDateInput = {
  date: string;
  updated?: string;
};

export function getBlogSeoTitle({ title, seoTitle }: BlogTitleInput) {
  return seoTitle ?? `${title} - Dunlo Blog`;
}

export function getBlogModifiedDate({ date, updated }: BlogDateInput) {
  return updated ?? date;
}
```

- [ ] **Step 4: Run the helper test and verify it passes**

Run:

```bash
bunx vitest run apps/marketing/src/lib/blog-seo.test.ts
```

Expected: PASS with 3 tests.

- [ ] **Step 5: Extend the Fumadocs schema and blog metadata shape**

Add these fields after `date` in `apps/marketing/source.config.ts`:

```ts
seoTitle: z.string().optional(),
updated: z.string().optional(),
```

Add the optional fields to `BlogPostMeta` in `apps/marketing/src/lib/blog.ts`:

```ts
seoTitle?: string;
updated?: string;
```

Add them to `toPostMeta`:

```ts
seoTitle: page.data.seoTitle,
updated: page.data.updated,
```

- [ ] **Step 6: Use the helper in the blog route**

Import the helper in `apps/marketing/src/app/blog/[slug]/page.tsx`:

```ts
import { getBlogModifiedDate, getBlogSeoTitle } from "@/lib/blog-seo";
```

Replace the metadata title with:

```ts
title: getBlogSeoTitle(post.data),
```

Replace the Article JSON-LD modification date with:

```ts
dateModified: getBlogModifiedDate(post.data),
```

Keep `post.data.title` for the visible H1, related cards, breadcrumb, and Article `headline`. Keep `post.data.date` for `datePublished`.

- [ ] **Step 7: Regenerate content types and run focused verification**

Run:

```bash
bun run --cwd apps/marketing check-types
bunx vitest run apps/marketing/src/lib/blog-seo.test.ts apps/marketing/src/lib/beta-testimonials.test.ts
```

Expected: type checking succeeds and both test files pass.

- [ ] **Step 8: Commit the metadata foundation**

```bash
git add apps/marketing/source.config.ts apps/marketing/src/lib/blog.ts apps/marketing/src/lib/blog-seo.ts apps/marketing/src/lib/blog-seo.test.ts apps/marketing/src/app/blog/'[slug]'/page.tsx
git commit -m "feat(marketing): support blog seo titles and update dates"
```

## Task 2: Make Smart Retries Informational-First

**Files:**

- Create: `apps/marketing/src/lib/source-test-utils.ts`
- Create: `apps/marketing/src/lib/smart-retries-seo.test.ts`
- Modify: `apps/marketing/src/app/stripe-smart-retries-alternative/page.tsx`
- Modify: `apps/marketing/src/app/sitemap.ts`

- [ ] **Step 1: Add the source reader and failing Smart Retries contract**

Create `apps/marketing/src/lib/source-test-utils.ts`:

```ts
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const marketingRoot = resolve(process.cwd(), "apps/marketing");

export function readMarketingSource(relativePath: string) {
  return readFileSync(resolve(marketingRoot, relativePath), "utf8");
}
```

Create `apps/marketing/src/lib/smart-retries-seo.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { readMarketingSource } from "./source-test-utils";

const source = readMarketingSource(
  "src/app/stripe-smart-retries-alternative/page.tsx",
);
const sitemap = readMarketingSource("src/app/sitemap.ts");
const title = "Stripe Smart Retries: Limits & Alternatives | Dunlo";
const description =
  "Learn how Stripe Smart Retries works, which payment failures need customer action, and when SaaS teams need a broader failed-payment recovery workflow.";

describe("Smart Retries SEO owner", () => {
  test("uses the approved title, description, H1, and modification date", () => {
    expect(title.length).toBeLessThanOrEqual(60);
    expect(description.length).toBeGreaterThanOrEqual(150);
    expect(description.length).toBeLessThanOrEqual(160);
    expect(source).toContain(JSON.stringify(title));
    expect(source).toContain(JSON.stringify(description));
    expect(source).toContain(
      "Stripe Smart Retries: what it covers and when SaaS needs more",
    );
    expect(source).toContain("2026-07-13T00:00:00.000Z");
    expect(sitemap).toMatch(
      /path: "\/stripe-smart-retries-alternative"[\s\S]*?lastModified: "2026-07-13"/,
    );
  });

  test("links to the three supporting internal destinations", () => {
    for (const href of [
      "/stripe-dunning",
      "/stripe-failed-payment-recovery-software",
      "/benchmark",
    ]) {
      expect(source).toContain(`href: "${href}"`);
    }
  });

  test("retains three authoritative Stripe sources", () => {
    for (const href of [
      "https://docs.stripe.com/billing/revenue-recovery/smart-retries",
      "https://docs.stripe.com/billing/revenue-recovery",
      "https://docs.stripe.com/api/events/types#event_types-invoice.payment_failed",
    ]) {
      expect(source).toContain(href);
    }
  });
});
```

- [ ] **Step 2: Run the contract and verify it fails on the old title**

Run:

```bash
bunx vitest run apps/marketing/src/lib/smart-retries-seo.test.ts
```

Expected: FAIL because the approved title, H1, modification date, and recovery-software link are absent.

- [ ] **Step 3: Update metadata and Article JSON-LD**

Replace the top-level constants with:

```ts
const TITLE = "Stripe Smart Retries: Limits & Alternatives | Dunlo";
const DESCRIPTION =
  "Learn how Stripe Smart Retries works, which payment failures need customer action, and when SaaS teams need a broader failed-payment recovery workflow.";
const PATH = "/stripe-smart-retries-alternative";
const PUBLISHED_TIME = "2026-06-11T00:00:00.000Z";
const MODIFIED_TIME = "2026-07-13T00:00:00.000Z";
```

Use this Article JSON-LD headline and modification date:

```ts
headline: "Stripe Smart Retries: what it covers and when SaaS needs more",
dateModified: MODIFIED_TIME,
```

Change the `/stripe-smart-retries-alternative` entry in `apps/marketing/src/app/sitemap.ts` to:

```ts
lastModified: "2026-07-13",
```

- [ ] **Step 4: Replace the hero copy and CTA order**

Use this H1 and opening paragraph:

```tsx
<h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-tight text-gray-950 md:text-6xl">
  Stripe Smart Retries: what it covers and when SaaS needs more
</h1>
<p className="mt-6 max-w-2xl text-base leading-8 text-gray-600 md:text-lg">
  Stripe Smart Retries chooses when to retry eligible failed payments.
  SaaS teams still need a plan for failures that require customer action,
  clear communication, account escalation, and recovery visibility.
</p>
```

Replace the hero CTAs with:

```tsx
<div className="mt-8 flex flex-col gap-3 sm:flex-row">
  <Link
    href="#comparison"
    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gray-950 px-6 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:bg-gray-800 active:scale-[0.98]"
  >
    See what Smart Retries covers
    <ArrowRight size={16} strokeWidth={2} />
  </Link>
  <Link
    href="/benchmark"
    className="inline-flex h-12 items-center justify-center rounded-full border border-gray-200 px-6 text-sm font-semibold text-gray-900 transition-all hover:-translate-y-px hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98]"
  >
    Estimate failed MRR
  </Link>
</div>
```

The final page CTA remains the only direct signup CTA.

- [ ] **Step 5: Make related links explicit and add the missing recovery-software link**

Add a `RELATED_GUIDES` constant above `metadata`:

```ts
const RELATED_GUIDES = [
  {
    href: "/stripe-dunning",
    title: "Stripe dunning",
    copy: "Build the workflow around retries, customer action, and escalation.",
  },
  {
    href: "/stripe-failed-payment-recovery-software",
    title: "Recovery software",
    copy: "See the customer-facing recovery layer around Stripe Billing.",
  },
  {
    href: "/benchmark",
    title: "Failed-payment benchmark",
    copy: "Estimate failed MRR and recoverable revenue before signup.",
  },
] as const;
```

Replace the inline array in “Related Stripe recovery guides” with:

```tsx
{RELATED_GUIDES.map((item) => (
```

Keep the existing card renderer and closing `))}`.

- [ ] **Step 6: Run the Smart Retries contract and type check**

Run:

```bash
bunx vitest run apps/marketing/src/lib/smart-retries-seo.test.ts
bun run --cwd apps/marketing check-types
```

Expected: PASS.

- [ ] **Step 7: Commit the Smart Retries owner**

```bash
git add apps/marketing/src/lib/source-test-utils.ts apps/marketing/src/lib/smart-retries-seo.test.ts apps/marketing/src/app/stripe-smart-retries-alternative/page.tsx apps/marketing/src/app/sitemap.ts
git commit -m "feat(marketing): sharpen smart retries search intent"
```

## Task 3: Refresh the Involuntary-Churn Guide

**Files:**

- Create: `apps/marketing/src/lib/involuntary-churn-seo.test.ts`
- Modify: `apps/marketing/content/blog/involuntary-churn-in-saas.mdx`
- Modify: `apps/marketing/src/app/sitemap.ts`

- [ ] **Step 1: Write the failing article contract**

Create `apps/marketing/src/lib/involuntary-churn-seo.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { readMarketingSource } from "./source-test-utils";

const source = readMarketingSource(
  "content/blog/involuntary-churn-in-saas.mdx",
);
const sitemap = readMarketingSource("src/app/sitemap.ts");
const title = "Involuntary Churn in SaaS: Causes & Fixes | Dunlo";
const description =
  "Learn what involuntary churn means for SaaS, how failed payments become churn, how to measure the revenue loss, and which recovery steps reduce it today.";

describe("involuntary churn SEO owner", () => {
  test("declares separate search and editorial metadata", () => {
    expect(title.length).toBeLessThanOrEqual(60);
    expect(description.length).toBeGreaterThanOrEqual(150);
    expect(description.length).toBeLessThanOrEqual(160);
    expect(source).toContain(`seoTitle: "${title}"`);
    expect(source).toContain(`description: "${description}"`);
    expect(source).toContain('updated: "2026-07-13"');
    expect(source).toContain('title: "What Is Involuntary Churn in SaaS?"');
    expect(sitemap).toContain("lastModified: post.updated ?? post.date");
  });

  test("links to the calculator, failed-payment pillar, and benchmark", () => {
    for (const href of [
      "/involuntary-churn-calculator",
      "/stripe-failed-payments",
      "/benchmark",
    ]) {
      expect(source).toContain(`](${href})`);
    }
  });

  test("cites three authoritative sources", () => {
    for (const href of [
      "https://stripe.com/blog/how-we-built-it-smart-retries",
      "https://docs.stripe.com/billing/revenue-recovery",
      "https://www.paddle.com/resources/payment-failure",
    ]) {
      expect(source).toContain(href);
    }
  });

  test("labels the 5% table as a planning scenario", () => {
    expect(source).toContain(
      "This is a planning scenario, not a universal SaaS benchmark.",
    );
  });
});
```

- [ ] **Step 2: Run the article contract and verify it fails**

Run:

```bash
bunx vitest run apps/marketing/src/lib/involuntary-churn-seo.test.ts
```

Expected: FAIL because the search title, update date, calculator link, sources, and scenario qualification are absent.

- [ ] **Step 3: Update the frontmatter**

Use this frontmatter header while preserving the existing tags, keywords, and reading time:

```yaml
---
title: "What Is Involuntary Churn in SaaS?"
seoTitle: "Involuntary Churn in SaaS: Causes & Fixes | Dunlo"
description: "Learn what involuntary churn means for SaaS, how failed payments become churn, how to measure the revenue loss, and which recovery steps reduce it today."
author: "Dunlo team"
date: "2026-05-22"
updated: "2026-07-13"
published: true
tags: ["involuntary churn", "churn", "saas", "stripe"]
keywords:
  [
    "what is involuntary churn",
    "involuntary churn saas",
    "involuntary churn rate",
    "reduce involuntary churn",
    "involuntary churn recovery",
    "delinquent churn",
    "failed payment recovery",
  ]
readingTime: "14 min"
---
```

- [ ] **Step 4: Make the early action calculator-specific**

Replace the first benchmark sentence with:

```md
If you want to estimate the leak before reading, use the free [involuntary churn calculator](/involuntary-churn-calculator). It separates failed MRR, recovered MRR, and the amount that finally becomes churn.
```

- [ ] **Step 5: Replace the unsourced benchmark framing**

Replace the “How common is involuntary churn?” introduction and retain the existing table beneath it:

```md
## How common is involuntary churn?

[Stripe reports that payment failures account for 25% of lapsed subscriptions](https://stripe.com/blog/how-we-built-it-smart-retries). The share varies by customer mix, billing interval, geography, saved payment method, and retry configuration, so your own Stripe history is the useful operating baseline.

The table below models a company with a 5% monthly failed-payment rate and a 60% recovery assumption. This is a planning scenario, not a universal SaaS benchmark.
```

Add this paragraph immediately after the table:

```md
Run the same scenario with your own MRR using the [involuntary churn calculator](/involuntary-churn-calculator), then compare the estimate with actual failed invoices in Stripe.
```

- [ ] **Step 6: Add authoritative sources and the final commercial CTA**

Insert this section before “The bottom line”:

```md
## Sources and further reading

- [Stripe: How Smart Retries was built](https://stripe.com/blog/how-we-built-it-smart-retries) explains why retry timing varies by payment failure and customer context.
- [Stripe revenue recovery documentation](https://docs.stripe.com/billing/revenue-recovery) documents native recovery analytics, retries, and customer communication.
- [Paddle's payment failure guide](https://www.paddle.com/resources/payment-failure) explains the relationship between failed payments, dunning, and involuntary churn.
```

Replace the final paragraph with:

```md
Start with the [free failed-payment benchmark](/benchmark). When you are ready to turn the result into a recovery workflow, [start free with Dunlo](https://app.dunlo.io/login?mode=signup).
```

- [ ] **Step 7: Run content tests and type checking**

Before running the checks, change the blog sitemap mapping in `apps/marketing/src/app/sitemap.ts` from `post.date` to:

```ts
lastModified: post.updated ?? post.date,
```

Run:

```bash
bunx vitest run apps/marketing/src/lib/blog-seo.test.ts apps/marketing/src/lib/involuntary-churn-seo.test.ts
bun run --cwd apps/marketing check-types
```

Expected: PASS.

- [ ] **Step 8: Commit the refreshed churn guide**

```bash
git add apps/marketing/content/blog/involuntary-churn-in-saas.mdx apps/marketing/src/lib/involuntary-churn-seo.test.ts apps/marketing/src/app/sitemap.ts
git commit -m "feat(marketing): refresh involuntary churn guide"
```

## Task 4: Give `card_velocity_exceeded` One Clear Owner

**Files:**

- Create: `apps/marketing/src/lib/card-velocity-seo.test.ts`
- Modify: `apps/marketing/src/lib/stripe-decline-codes.ts`
- Modify: `apps/marketing/src/app/stripe-decline-codes/[slug]/page.tsx`
- Modify: `apps/marketing/content/blog/stripe-failure-codes-the-complete-guide.mdx`
- Modify: `apps/marketing/src/app/sitemap.ts`

- [ ] **Step 1: Write the failing ownership contract**

Create `apps/marketing/src/lib/card-velocity-seo.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { readMarketingSource } from "./source-test-utils";

const dataSource = readMarketingSource("src/lib/stripe-decline-codes.ts");
const pageSource = readMarketingSource(
  "src/app/stripe-decline-codes/[slug]/page.tsx",
);
const broadArticle = readMarketingSource(
  "content/blog/stripe-failure-codes-the-complete-guide.mdx",
);
const sitemap = readMarketingSource("src/app/sitemap.ts");
const title = "Stripe card_velocity_exceeded: Meaning & Fix | Dunlo";
const description =
  "Learn what Stripe card_velocity_exceeded means, when to retry the payment, and how to guide customers toward issuer approval or another payment method.";

describe("card velocity SEO owner", () => {
  test("uses focused metadata and an action-oriented opening", () => {
    expect(title.length).toBeLessThanOrEqual(60);
    expect(description.length).toBeGreaterThanOrEqual(150);
    expect(description.length).toBeLessThanOrEqual(160);
    expect(dataSource).toContain(JSON.stringify(title));
    expect(dataSource).toContain(JSON.stringify(description));
    expect(dataSource).toContain(
      "Stripe card_velocity_exceeded: what it means and how to recover the payment",
    );
    expect(dataSource).toContain('dateModified: "2026-07-13"');
    expect(pageSource).toContain("guide.openingAnswer ??");
    expect(pageSource).toContain("guide.dateModified ??");
    expect(sitemap).toContain(
      'lastModified: guide.dateModified ?? "2026-07-03"',
    );
  });

  test("keeps one detailed article link from the broad guide", () => {
    const href = "/stripe-decline-codes/card-velocity-exceeded";
    expect(broadArticle.match(new RegExp(href, "g"))).toHaveLength(1);
    expect(broadArticle).toContain(
      `[Stripe card_velocity_exceeded recovery guide](${href})`,
    );
  });

  test("keeps the detail-page recovery links", () => {
    for (const href of [
      "/stripe-decline-codes",
      "/stripe-dunning",
      "/stripe-dunning-schedule-calculator",
    ]) {
      expect(pageSource).toContain(href);
    }
  });
});
```

- [ ] **Step 2: Run the ownership contract and verify it fails**

Run:

```bash
bunx vitest run apps/marketing/src/lib/card-velocity-seo.test.ts
```

Expected: FAIL because focused fields and the dedicated broad-article link are absent.

- [ ] **Step 3: Extend the guide type for focused openings and modification dates**

Add these optional fields to `StripeDeclineCodeGuide` in `apps/marketing/src/lib/stripe-decline-codes.ts`:

```ts
openingAnswer?: string;
dateModified?: string;
```

- [ ] **Step 4: Replace the `card-velocity-exceeded` data entry**

Use this complete entry:

```ts
{
  slug: "card-velocity-exceeded",
  code: "card_velocity_exceeded",
  title:
    "Stripe card_velocity_exceeded: what it means and how to recover the payment",
  metaTitle: "Stripe card_velocity_exceeded: Meaning & Fix | Dunlo",
  metaDescription:
    "Learn what Stripe card_velocity_exceeded means, when to retry the payment, and how to guide customers toward issuer approval or another payment method.",
  shortDescription:
    "The issuer applied a balance, credit, transaction, or velocity limit to the card.",
  openingAnswer:
    "Stripe card_velocity_exceeded usually means the issuer applied a spending or velocity limit. Wait before retrying, then ask the customer to approve the charge with the issuer or use another payment method.",
  dateModified: "2026-07-13",
  searchIntent:
    "Teams searching for card_velocity_exceeded, card_velocity_exceed, or the code with trailing punctuation need a safe retry cadence and a clear customer action.",
  customerMeaning:
    "The card may work later or after issuer approval, but the customer may need another payment method for the current invoice.",
  firstMove:
    "Explain that the issuer limited the charge and give the customer a secure path to use another payment method.",
  retryTiming:
    "Wait at least 24 hours before another automated retry unless the customer confirms that the issuer limit is resolved.",
  emailAngle:
    "Frame it as a card-limit issue, not a subscription problem. Offer another card or issuer approval as the practical next step.",
  avoid:
    "Avoid immediate retry loops, claiming certainty about the issuer's internal rule, or implying that the customer cancelled.",
  dunloWorkflow: [
    "Classify the failure as limit-related.",
    "Wait before scheduling another retry.",
    "Send a calm card-limit email with a secure update-payment link.",
    "Escalate important accounts if the customer does not act.",
  ],
  relatedSlugs: ["insufficient-funds", "do-not-honor", "generic-decline"],
  keywords: [
    "Stripe card_velocity_exceeded",
    "card_velocity_exceed",
    "card velocity exceeded Stripe",
    "Stripe card limit decline",
    "recover card velocity exceeded payment",
  ],
},
```

- [ ] **Step 5: Render the focused opening and accurate modification date**

Replace the hero paragraph in `apps/marketing/src/app/stripe-decline-codes/[slug]/page.tsx` with:

```tsx
<p className="mt-5 max-w-lg border-l-2 border-dunlo pl-4 text-base italic leading-7 text-gray-700">
  {guide.openingAnswer ??
    `${guide.shortDescription} For SaaS subscriptions, the useful question is not just why it failed, but what customer action will recover the invoice.`}
</p>
```

Replace the Article `dateModified` value with:

```ts
dateModified: guide.dateModified ?? "2026-07-03",
```

Keep `datePublished: "2026-07-03"`.

Replace the decline-code sitemap modification date in `apps/marketing/src/app/sitemap.ts` with:

```ts
const declineCodeRoutes = STRIPE_DECLINE_CODE_GUIDES.map(
  (guide: StripeDeclineCodeGuide) =>
    toRoute({
      path: declineCodePath(guide.slug),
      lastModified: guide.dateModified ?? "2026-07-03",
      changeFrequency: "monthly",
      priority: 0.74,
    }),
);
```

Add `type StripeDeclineCodeGuide` to the existing import from `@/lib/stripe-decline-codes`. The explicit callback type widens the inferred guide union so the optional field is available for every entry.

- [ ] **Step 6: Consolidate the broad failure-code article**

Remove `"stripe card_velocity_exceeded"` from the article frontmatter keywords. Delete the early standalone “What does `card_velocity_exceeded` mean in Stripe?” answer.

Replace the later detailed subsection with:

```md
### `card_velocity_exceeded`

This code usually signals an issuer limit rather than a broken subscription. Wait before another retry and give the customer an issuer-approval or alternate-payment path. Read the [Stripe card_velocity_exceeded recovery guide](/stripe-decline-codes/card-velocity-exceeded) for the full customer message, timing, and escalation workflow.
```

Keep the code in the overview and summary tables.

- [ ] **Step 7: Run ownership tests and type checking**

Run:

```bash
bunx vitest run apps/marketing/src/lib/card-velocity-seo.test.ts
bun run --cwd apps/marketing check-types
```

Expected: PASS.

- [ ] **Step 8: Commit the ownership fix**

```bash
git add apps/marketing/src/lib/stripe-decline-codes.ts apps/marketing/src/app/stripe-decline-codes/'[slug]'/page.tsx apps/marketing/content/blog/stripe-failure-codes-the-complete-guide.mdx apps/marketing/src/lib/card-velocity-seo.test.ts apps/marketing/src/app/sitemap.ts
git commit -m "feat(marketing): consolidate card velocity search intent"
```

## Task 5: Make Stripe Dunning the Dunning Pillar

**Files:**

- Create: `apps/marketing/src/lib/stripe-dunning-seo.test.ts`
- Modify: `apps/marketing/src/app/stripe-dunning/page.tsx`
- Modify: `apps/marketing/src/app/sitemap.ts`

- [ ] **Step 1: Write the failing dunning contract**

Create `apps/marketing/src/lib/stripe-dunning-seo.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { readMarketingSource } from "./source-test-utils";

const source = readMarketingSource("src/app/stripe-dunning/page.tsx");
const sitemap = readMarketingSource("src/app/sitemap.ts");
const title = "Stripe Dunning for SaaS: Recovery Guide | Dunlo";
const description =
  "Learn how Stripe dunning combines retries, customer emails, payment update paths, and recovery measurement to prevent failed-payment churn in SaaS teams.";

describe("Stripe dunning SEO owner", () => {
  test("uses the approved metadata and direct definition", () => {
    expect(title.length).toBeLessThanOrEqual(60);
    expect(description.length).toBeGreaterThanOrEqual(150);
    expect(description.length).toBeLessThanOrEqual(160);
    expect(source).toContain(JSON.stringify(title));
    expect(source).toContain(JSON.stringify(description));
    expect(source).toContain("Stripe dunning for SaaS failed-payment recovery");
    expect(source).toContain(
      "Stripe dunning is the workflow for recovering a failed subscription payment",
    );
    expect(sitemap).toMatch(
      /path: "\/stripe-dunning"[\s\S]*?lastModified: "2026-07-13"/,
    );
  });

  test("links to supporting pages and three Stripe sources", () => {
    for (const href of [
      "/stripe-dunning-schedule-calculator",
      "/stripe-decline-codes",
      "/stripe-failed-payment-recovery-software",
      "https://docs.stripe.com/billing/revenue-recovery",
      "https://docs.stripe.com/billing/revenue-recovery/smart-retries",
      "https://docs.stripe.com/declines/codes",
    ]) {
      expect(source).toContain(href);
    }
  });
});
```

- [ ] **Step 2: Run the dunning contract and verify it fails**

Run:

```bash
bunx vitest run apps/marketing/src/lib/stripe-dunning-seo.test.ts
```

Expected: FAIL because the approved metadata, direct H1, definition, and external sources are absent.

- [ ] **Step 3: Update metadata, H1, and opening answer**

Replace the constants with:

```ts
const TITLE = "Stripe Dunning for SaaS: Recovery Guide | Dunlo";
const DESCRIPTION =
  "Learn how Stripe dunning combines retries, customer emails, payment update paths, and recovery measurement to prevent failed-payment churn in SaaS teams.";
```

Change the `/stripe-dunning` entry in `apps/marketing/src/app/sitemap.ts` to:

```ts
lastModified: "2026-07-13",
```

Use this hero H1 and paragraph:

```tsx
<h1 className="mt-8 max-w-xl text-4xl font-semibold leading-[1.02] tracking-tight text-gray-950 sm:text-5xl sm:leading-[0.98] md:text-6xl">
  Stripe dunning for SaaS failed-payment recovery
</h1>
<p className="mt-5 max-w-lg border-l-2 border-dunlo pl-4 text-base italic leading-7 text-gray-700">
  Stripe dunning is the workflow for recovering a failed subscription
  payment through retries, customer emails, payment update paths, account
  handling, and recovery measurement.
</p>
```

- [ ] **Step 4: Make the calculator the early CTA**

Use these hero actions:

```tsx
<div className="mt-8 flex flex-col gap-3 sm:flex-row">
  <Link
    href="/stripe-dunning-schedule-calculator"
    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gray-950 px-6 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-px hover:bg-gray-800 active:scale-[0.98]"
  >
    Plan your dunning schedule
    <ArrowRight size={16} strokeWidth={1.8} />
  </Link>
  <Link
    href="#workflow"
    className="inline-flex h-12 items-center justify-center rounded-full border border-gray-300 px-6 text-sm font-semibold text-gray-800 transition-all duration-300 hover:-translate-y-px hover:border-gray-950 active:scale-[0.98]"
  >
    See the recovery workflow
  </Link>
</div>
```

Add `id="workflow"` to the section that renders `DUNNING_STEPS`. Keep the final `CtaSection` as the direct beta signup.

- [ ] **Step 5: Make the Smart Retries FAQ answer accurate**

Replace its answer with:

```ts
answer:
  "Stripe Smart Retries optimizes retry timing, and Stripe also provides native recovery emails, hosted update flows, and analytics. A broader dunning workflow becomes useful when the team needs failure-specific messaging, founder escalation, and a focused view of accounts still at risk.",
```

- [ ] **Step 6: Add the authoritative sources section**

Add this constant after `RELATED_LINKS`:

```ts
const SOURCES = [
  {
    label: "Stripe revenue recovery",
    href: "https://docs.stripe.com/billing/revenue-recovery",
  },
  {
    label: "Stripe Smart Retries",
    href: "https://docs.stripe.com/billing/revenue-recovery/smart-retries",
  },
  {
    label: "Stripe decline codes",
    href: "https://docs.stripe.com/declines/codes",
  },
] as const;
```

Render this section immediately before `CtaSection`:

```tsx
<section className="rounded-[2rem] border border-gray-200 bg-white/80 p-6 md:p-8">
  <h2 className="text-2xl font-bold tracking-tight">Stripe dunning sources</h2>
  <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
    These Stripe references document the native recovery controls, retry
    behavior, and decline signals used in this guide.
  </p>
  <div className="mt-5 flex flex-wrap gap-3">
    {SOURCES.map((source) => (
      <a
        key={source.href}
        href={source.href}
        target="_blank"
        rel="noreferrer"
        className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
      >
        {source.label}
      </a>
    ))}
  </div>
</section>
```

- [ ] **Step 7: Run dunning tests and type checking**

Run:

```bash
bunx vitest run apps/marketing/src/lib/stripe-dunning-seo.test.ts
bun run --cwd apps/marketing check-types
```

Expected: PASS.

- [ ] **Step 8: Commit the dunning pillar**

```bash
git add apps/marketing/src/app/stripe-dunning/page.tsx apps/marketing/src/lib/stripe-dunning-seo.test.ts apps/marketing/src/app/sitemap.ts
git commit -m "feat(marketing): strengthen stripe dunning pillar"
```

## Task 6: Add Pillar Inbound Links and Verify the Full Sprint

**Files:**

- Create: `apps/marketing/src/lib/failed-payments-links.test.ts`
- Modify: `apps/marketing/src/app/stripe-failed-payments/page.tsx`

- [ ] **Step 1: Write the failing inbound-link contract**

Create `apps/marketing/src/lib/failed-payments-links.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { readMarketingSource } from "./source-test-utils";

const source = readMarketingSource("src/app/stripe-failed-payments/page.tsx");

describe("failed-payment pillar links", () => {
  test("links contextually to all four refreshed owners", () => {
    for (const href of [
      "/stripe-smart-retries-alternative",
      "/blog/involuntary-churn-in-saas",
      "/stripe-decline-codes/card-velocity-exceeded",
      "/stripe-dunning",
    ]) {
      expect(source).toContain(`href: "${href}"`);
    }
  });
});
```

- [ ] **Step 2: Run the link contract and verify it fails**

Run:

```bash
bunx vitest run apps/marketing/src/lib/failed-payments-links.test.ts
```

Expected: FAIL for the Smart Retries, involuntary-churn, and card-velocity destinations.

- [ ] **Step 3: Expand the contextual guide cards**

Add these entries to `RELATED_GUIDES` while preserving the existing Stripe dunning entry:

```ts
{
  title: "Stripe Smart Retries",
  copy: "See which failures benefit from retry timing and which need customer action.",
  href: "/stripe-smart-retries-alternative",
},
{
  title: "Involuntary churn",
  copy: "Measure when a failed payment becomes churn and how much MRR remains recoverable.",
  href: "/blog/involuntary-churn-in-saas",
},
{
  title: "card_velocity_exceeded",
  copy: "Handle issuer-limit declines with safer timing and a clear customer action.",
  href: "/stripe-decline-codes/card-velocity-exceeded",
},
```

Keep the existing email-template, recovery-software, dunning, decline-code, and calculator cards. The resulting eight-card grid remains `md:grid-cols-2 lg:grid-cols-4`.

- [ ] **Step 4: Run all focused SEO contracts**

Run:

```bash
bunx vitest run \
  apps/marketing/src/lib/blog-seo.test.ts \
  apps/marketing/src/lib/smart-retries-seo.test.ts \
  apps/marketing/src/lib/involuntary-churn-seo.test.ts \
  apps/marketing/src/lib/card-velocity-seo.test.ts \
  apps/marketing/src/lib/stripe-dunning-seo.test.ts \
  apps/marketing/src/lib/failed-payments-links.test.ts \
  apps/marketing/src/lib/beta-testimonials.test.ts
```

Expected: all test files pass.

- [ ] **Step 5: Run the marketing type check and production build**

Run:

```bash
bun run --cwd apps/marketing check-types
bun run --cwd apps/marketing build
```

Expected: both commands exit successfully and the build lists all four refreshed routes plus `/stripe-failed-payments`.

- [ ] **Step 6: Commit the pillar links**

```bash
git add apps/marketing/src/app/stripe-failed-payments/page.tsx apps/marketing/src/lib/failed-payments-links.test.ts
git commit -m "feat(marketing): link seo recovery owners"
```

- [ ] **Step 7: Inspect rendered metadata and JSON-LD locally**

Start the production server after the build:

```bash
bun run --cwd apps/marketing start
```

Open each route in a rendered browser:

```text
http://localhost:3000/stripe-smart-retries-alternative
http://localhost:3000/blog/involuntary-churn-in-saas
http://localhost:3000/stripe-decline-codes/card-velocity-exceeded
http://localhost:3000/stripe-dunning
http://localhost:3000/stripe-failed-payments
```

For each route, verify one H1, the self-referencing canonical, the approved title and description, and working internal links. In the browser console run:

```js
[...document.querySelectorAll('script[type="application/ld+json"]')].map(
  (node) => JSON.parse(node.textContent ?? "{}"),
);
```

Expected: valid parsed objects; visible FAQ content matches FAQ structured data; Article pages preserve `datePublished` and use the new `dateModified`; breadcrumbs point to the current canonical URL.

- [ ] **Step 8: Verify live-link status before deployment**

Run:

```bash
for url in \
  https://docs.stripe.com/billing/revenue-recovery/smart-retries \
  https://docs.stripe.com/billing/revenue-recovery \
  https://docs.stripe.com/declines/codes \
  https://stripe.com/blog/how-we-built-it-smart-retries \
  https://www.paddle.com/resources/payment-failure; do
  curl -sS -L -o /dev/null -w '%{http_code} %{url_effective}\n' "$url"
done
```

Expected: every final response is below 400.

- [ ] **Step 9: Capture the deployment baseline and request recrawling**

Immediately before deployment, export a 28-day Search Console report for each approved query cluster with query, page, clicks, impressions, CTR, and average position. After deployment, request indexing for the four refreshed owner URLs. Repeat the same export after 7, 14, and 28 days; use the 7-day report only to detect crawl, canonical, or ownership regressions.

Do not add more broad pages during the 30-day observation window. Treat CTR as diagnostic until an owner reaches average position 15 or better.
