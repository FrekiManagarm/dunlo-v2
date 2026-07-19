# SEO Audit Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clarify Dunlo's homepage category, keep campaign and machine-readable URLs out of Google's sitemap, and add curated internal links between commercial comparison pages.

**Architecture:** Preserve the existing Next.js metadata and sitemap helpers. Add one small pure helper that owns curated alternative-page relationships, then consume it from the shared comparison template. Cover metadata and source integration with the repository's existing source-test pattern, and cover link selection with direct unit tests.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Bun, Vitest-compatible Bun tests.

---

## File Map

- Create `apps/marketing/src/lib/seo-audit-fixes.test.ts`: regression coverage for homepage ownership, sitemap exclusions, Product Hunt robots metadata, and template integration.
- Create `apps/marketing/src/lib/related-alternatives.ts`: pure curated related-slug selection.
- Create `apps/marketing/src/lib/related-alternatives.test.ts`: behavior tests for curated and fallback selections.
- Modify `apps/marketing/src/lib/seo.ts`: approved homepage/default title.
- Modify `apps/marketing/src/components/landing/hero-content.tsx`: approved homepage H1.
- Modify `apps/marketing/src/app/sitemap.ts`: remove Product Hunt and machine-readable URLs.
- Modify `apps/marketing/src/app/product-hunt/page.tsx`: add `noindex, follow` metadata.
- Modify `apps/marketing/src/components/alternatives/alternative-page.tsx`: render curated related comparisons.

### Task 1: Homepage and indexation signals

**Files:**
- Create: `apps/marketing/src/lib/seo-audit-fixes.test.ts`
- Modify: `apps/marketing/src/lib/seo.ts`
- Modify: `apps/marketing/src/components/landing/hero-content.tsx`
- Modify: `apps/marketing/src/app/sitemap.ts`
- Modify: `apps/marketing/src/app/product-hunt/page.tsx`

- [ ] **Step 1: Write the failing metadata and sitemap tests**

```ts
import { describe, expect, test } from "vitest";
import { readMarketingSource } from "./source-test-utils";

const seo = readMarketingSource("src/lib/seo.ts");
const hero = readMarketingSource("src/components/landing/hero-content.tsx");
const sitemap = readMarketingSource("src/app/sitemap.ts");
const productHunt = readMarketingSource("src/app/product-hunt/page.tsx");

describe("SEO audit fixes", () => {
  test("makes Stripe payment recovery the homepage search owner", () => {
    expect(seo).toContain(
      '"Dunlo — Stripe Payment Recovery for SaaS"',
    );
    expect(hero).toContain(
      "Recover failed Stripe payments before they churn.",
    );
  });

  test("keeps campaign and machine-readable URLs out of the sitemap", () => {
    expect(sitemap).not.toContain('path: "/product-hunt"');
    expect(sitemap).not.toContain('path: "/llms.txt"');
    expect(sitemap).not.toContain('path: "/pricing.md"');
  });

  test("keeps the Product Hunt campaign crawlable but non-indexable", () => {
    expect(productHunt).toContain("robots: {");
    expect(productHunt).toContain("index: false");
    expect(productHunt).toContain("follow: true");
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
rtk bun test apps/marketing/src/lib/seo-audit-fixes.test.ts
```

Expected: three failing assertions because the old title/H1, sitemap entries, and Product Hunt index policy are still present.

- [ ] **Step 3: Implement the minimal signal changes**

In `src/lib/seo.ts`:

```ts
export const DEFAULT_TITLE = "Dunlo — Stripe Payment Recovery for SaaS";
```

In `src/components/landing/hero-content.tsx`, replace the current H1 text with:

```tsx
Recover failed Stripe payments before they churn.
```

In `src/app/sitemap.ts`, delete the `/product-hunt` entry, delete `MACHINE_READABLE_ROUTES`, and remove its spread from the returned sitemap array.

In `src/app/product-hunt/page.tsx`, extend the page metadata:

```ts
export const metadata: Metadata = {
  ...pageSeoMetadata({
    title: TITLE,
    description: DESCRIPTION,
    keywords: KEYWORDS,
    path: "/product-hunt",
  }),
  robots: {
    index: false,
    follow: true,
  },
};
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```bash
rtk bun test apps/marketing/src/lib/seo-audit-fixes.test.ts
```

Expected: 3 pass, 0 fail.

- [ ] **Step 5: Commit the signal changes**

```bash
rtk git add apps/marketing/src/lib/seo-audit-fixes.test.ts apps/marketing/src/lib/seo.ts apps/marketing/src/components/landing/hero-content.tsx apps/marketing/src/app/sitemap.ts apps/marketing/src/app/product-hunt/page.tsx
rtk git commit -m "fix(marketing): clarify seo indexation signals"
```

### Task 2: Curated related alternatives

**Files:**
- Create: `apps/marketing/src/lib/related-alternatives.ts`
- Create: `apps/marketing/src/lib/related-alternatives.test.ts`
- Modify: `apps/marketing/src/lib/seo-audit-fixes.test.ts`
- Modify: `apps/marketing/src/components/alternatives/alternative-page.tsx`

- [ ] **Step 1: Write failing unit tests for link selection**

```ts
import { describe, expect, test } from "vitest";
import { getRelatedAlternativeSlugs } from "./related-alternatives";

describe("related alternatives", () => {
  test("returns the curated commercial cluster", () => {
    expect(getRelatedAlternativeSlugs("churn-buster")).toEqual([
      "churnkey",
      "retryfix",
      "stripe-customer-emails",
    ]);
  });

  test("falls back to core alternatives without linking to itself", () => {
    const links = getRelatedAlternativeSlugs("stripe-customer-emails");

    expect(links).toHaveLength(3);
    expect(links).not.toContain("stripe-customer-emails");
    expect(new Set(links).size).toBe(3);
  });
});
```

- [ ] **Step 2: Run the helper test and verify RED**

Run:

```bash
rtk bun test apps/marketing/src/lib/related-alternatives.test.ts
```

Expected: FAIL because `related-alternatives.ts` does not exist.

- [ ] **Step 3: Implement the pure curated selector**

```ts
const CORE_ALTERNATIVE_SLUGS = [
  "churn-buster",
  "churnkey",
  "stripe-customer-emails",
  "retryfix",
] as const;

const RELATED_ALTERNATIVE_SLUGS: Record<string, readonly string[]> = {
  "churn-buster": ["churnkey", "retryfix", "stripe-customer-emails"],
  churnkey: ["churn-buster", "chargebee", "paddle-retain"],
  chargebee: ["churnkey", "churn-buster", "paddle-retain"],
  "paddle-retain": ["churnkey", "chargebee", "churn-buster"],
  retryfix: ["churn-buster", "stripe-customer-emails", "churnkey"],
};

export function getRelatedAlternativeSlugs(slug: string): string[] {
  const candidates =
    RELATED_ALTERNATIVE_SLUGS[slug] ?? CORE_ALTERNATIVE_SLUGS;

  return [...new Set(candidates)]
    .filter((candidate) => candidate !== slug)
    .slice(0, 3);
}
```

- [ ] **Step 4: Run the helper test and verify GREEN**

Run:

```bash
rtk bun test apps/marketing/src/lib/related-alternatives.test.ts
```

Expected: 2 pass, 0 fail.

- [ ] **Step 5: Add a failing template integration test**

Append to `seo-audit-fixes.test.ts`:

```ts
const alternativeTemplate = readMarketingSource(
  "src/components/alternatives/alternative-page.tsx",
);

test("renders curated related comparisons in the shared template", () => {
  expect(alternativeTemplate).toContain("getRelatedAlternativeSlugs(page.slug)");
  expect(alternativeTemplate).toContain("Related comparisons");
  expect(alternativeTemplate).toContain("relatedPages.map");
});
```

- [ ] **Step 6: Run the integration test and verify RED**

Run:

```bash
rtk bun test apps/marketing/src/lib/seo-audit-fixes.test.ts
```

Expected: the new template integration assertion fails because the component does not render related comparisons.

- [ ] **Step 7: Render the related-comparisons section**

Import the helper, derive `relatedPages` at the start of `AlternativePage`, and render a compact section before Sources:

```tsx
const relatedPages = getRelatedAlternativeSlugs(page.slug)
  .map((slug) => ALTERNATIVES[slug])
  .filter((candidate): candidate is AlternativePageData => Boolean(candidate));
```

```tsx
<section className="rounded-3xl border border-gray-200 bg-white px-6 py-6 md:px-8">
  <h2 className="text-base font-semibold text-gray-950">
    Related comparisons
  </h2>
  <div className="mt-4 grid gap-3 md:grid-cols-3">
    {relatedPages.map((relatedPage) => (
      <Link
        key={relatedPage.path}
        href={relatedPage.path}
        className="rounded-2xl border border-gray-200 px-4 py-4 transition-colors hover:border-dunlo/40 hover:bg-dunlo/[0.04]"
      >
        <span className="text-sm font-semibold text-gray-950">
          Dunlo vs {relatedPage.competitorName}
        </span>
        <span className="mt-1 block text-sm leading-6 text-gray-600">
          Compare recovery focus, setup, and fit.
        </span>
      </Link>
    ))}
  </div>
</section>
```

- [ ] **Step 8: Run both focused tests and verify GREEN**

Run:

```bash
rtk bun test apps/marketing/src/lib/related-alternatives.test.ts apps/marketing/src/lib/seo-audit-fixes.test.ts
```

Expected: 6 pass, 0 fail.

- [ ] **Step 9: Commit the internal-linking changes**

```bash
rtk git add apps/marketing/src/lib/related-alternatives.ts apps/marketing/src/lib/related-alternatives.test.ts apps/marketing/src/lib/seo-audit-fixes.test.ts apps/marketing/src/components/alternatives/alternative-page.tsx
rtk git commit -m "feat(marketing): link related recovery alternatives"
```

### Task 3: Full verification

**Files:**
- Verify all modified marketing files.

- [ ] **Step 1: Run the complete marketing SEO regression suite**

```bash
rtk bun test apps/marketing/src/lib/blog-seo.test.ts apps/marketing/src/lib/stripe-dunning-seo.test.ts apps/marketing/src/lib/smart-retries-seo.test.ts apps/marketing/src/lib/involuntary-churn-seo.test.ts apps/marketing/src/lib/card-velocity-seo.test.ts apps/marketing/src/lib/failed-payments-links.test.ts apps/marketing/src/lib/seo-audit-fixes.test.ts apps/marketing/src/lib/related-alternatives.test.ts
```

Expected: all tests pass with 0 failures.

- [ ] **Step 2: Type-check the marketing app**

```bash
rtk bun run --filter marketing check-types
```

Expected: exit code 0 with no TypeScript errors.

- [ ] **Step 3: Build the marketing app**

```bash
rtk bun run --filter marketing build
```

Expected: exit code 0 and a successful Next.js production build.

- [ ] **Step 4: Review the final diff and repository state**

```bash
rtk git diff HEAD~2 --check
rtk git status --short
```

Expected: no whitespace errors; only pre-existing unrelated changes remain unstaged.
