# Product Hunt Launch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Product Hunt-specific marketing page and launch kit for Dunlo.

**Architecture:** Implement `/product-hunt` as a server-rendered Next.js App Router page in the marketing app, reusing existing metadata, navigation, footer, app URL, and OG image helpers. Keep launch operations in Markdown documentation under `docs/growth/`.

**Tech Stack:** Next.js App Router, React Server Components, Tailwind CSS v4, lucide-react, Bun, Turborepo.

---

### Task 1: Create Documentation

**Files:**
- Create: `docs/growth/product-hunt-launch-kit.md`
- Create: `docs/superpowers/specs/2026-06-15-product-hunt-launch-design.md`
- Create: `docs/superpowers/plans/2026-06-15-product-hunt-launch.md`

- [ ] Write the Product Hunt launch kit with tagline, description, first comment, channel copy, timeline, and follow-up checklist.
- [ ] Keep all asks compliant with Product Hunt norms by asking for feedback, comments, or sharing, not upvotes.

### Task 2: Add Product Hunt Page

**Files:**
- Create: `apps/marketing/src/app/product-hunt/page.tsx`

- [ ] Create static metadata with `pageSeoMetadata`.
- [ ] Build a full page using `Nav`, `Footer`, `SIGNUP_URL`, and `Link`.
- [ ] Include hero, launch panel, reasons, workflow, beta offer, FAQ, and final CTA sections.
- [ ] Use existing Tailwind tokens such as `bg-dunlo`, `text-dunlo-deep`, `border-dunlo/30`; do not hardcode Dunlo hex values.

### Task 3: Add Product Hunt OG Image

**Files:**
- Create: `apps/marketing/src/app/product-hunt/opengraph-image.tsx`

- [ ] Reuse `createDunloOgImage` and `ogImageSize`.
- [ ] Set launch-specific title, description, badge, metric label, and metric value.

### Task 4: Add Sitemap Entry

**Files:**
- Modify: `apps/marketing/src/app/sitemap.ts`

- [ ] Add `/product-hunt` to `STATIC_ROUTES` with a June 15, 2026 `lastModified` value and a launch-appropriate priority.

### Task 5: Verify

**Files:**
- Check: changed files

- [ ] Run `bun run check-types`.
- [ ] Run a targeted build command if type checks pass and time allows.
- [ ] Inspect `git diff --check`.
