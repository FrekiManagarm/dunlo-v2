# Next Marketing Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split Dunlo into a Next.js marketing app on `dunlo.io` and a TanStack Start product app on `app.dunlo.io`.

**Architecture:** Create `apps/marketing` as a Next.js App Router workspace that owns landing, blog, alternatives, legal pages, SEO files, and marketing assets. Keep `apps/web` as the TanStack Start product app and remove public marketing routes from it after equivalent Next routes exist.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS v4 via `@dunlo-v2/ui`, shadcn/ui shared package, MDX blog content, Bun workspaces, Turborepo.

---

### Task 1: Add Marketing Workspace

**Files:**
- Create: `apps/marketing/package.json`
- Create: `apps/marketing/tsconfig.json`
- Create: `apps/marketing/next.config.ts`
- Create: `apps/marketing/postcss.config.mjs`
- Create: `apps/marketing/src/app/layout.tsx`
- Create: `apps/marketing/src/app/globals.css`
- Modify: `package.json`

- [ ] Add a Next.js workspace named `marketing` with `dev`, `build`, `start`, and `check-types` scripts.
- [ ] Configure TypeScript path aliases for `@/*` and `@dunlo-v2/ui/*`.
- [ ] Import `@dunlo-v2/ui/globals.css` from the Next root stylesheet.
- [ ] Add root scripts `dev:marketing` and `dev:app`.

### Task 2: Move Shared Marketing Utilities

**Files:**
- Create: `apps/marketing/src/lib/seo.ts`
- Create: `apps/marketing/src/lib/app-url.ts`
- Create: `apps/marketing/src/lib/blog.ts`
- Move/copy: `apps/web/content/blog/*.mdx` to `apps/marketing/content/blog/*.mdx`

- [ ] Port SEO constants and helpers with `SITE_URL` set to `https://dunlo.io`.
- [ ] Add `appUrl(path)` so marketing links can point to `https://app.dunlo.io` by default.
- [ ] Add a Next-compatible blog loader for MDX metadata and slugs.

### Task 3: Migrate Marketing Components

**Files:**
- Create: `apps/marketing/src/components/**`

- [ ] Copy landing, blog, logo, MDX, header/footer, and alternatives components needed by public pages.
- [ ] Replace TanStack Router `Link` usage with `next/link`.
- [ ] Replace product CTAs with `appUrl("/signup")`, `appUrl("/login")`, or the appropriate product route.
- [ ] Keep Tailwind token usage and avoid hardcoded Dunlo hex colors.

### Task 4: Add Next Marketing Routes

**Files:**
- Create: `apps/marketing/src/app/page.tsx`
- Create: `apps/marketing/src/app/blog/page.tsx`
- Create: `apps/marketing/src/app/blog/[slug]/page.tsx`
- Create: `apps/marketing/src/app/alternatives/page.tsx`
- Create: `apps/marketing/src/app/alternatives/[slug]/page.tsx`
- Create: `apps/marketing/src/app/privacy/page.tsx`
- Create: `apps/marketing/src/app/terms/page.tsx`
- Create: `apps/marketing/src/app/state-of-stripe-payments-2026/page.tsx`

- [ ] Preserve page-level metadata and JSON-LD.
- [ ] Generate static params for blog and alternatives detail routes.
- [ ] Keep visual output equivalent to the existing marketing pages.

### Task 5: Add Redirects And Static Assets

**Files:**
- Modify: `apps/marketing/next.config.ts`
- Copy: `apps/web/public/**` marketing files to `apps/marketing/public/**`

- [ ] Redirect `/login`, `/signup`, `/register`, `/reset-password`, `/onboarding`, `/dashboard`, `/dashboard/:path*`, and `/benchmark` to `https://app.dunlo.io`.
- [ ] Move/copy `robots.txt`, `sitemap.xml`, `llms.txt`, favicons, brand assets, OG assets, and pricing markdown to the marketing public folder.

### Task 6: Clean Product App Marketing Surface

**Files:**
- Modify/delete: marketing-only routes under `apps/web/src/routes`
- Modify/delete: marketing-only components under `apps/web/src/components`
- Modify/delete: marketing-only blog content under `apps/web/content`
- Modify: `apps/web/package.json`
- Modify: `apps/web/src/routes/__root.tsx`

- [ ] Remove landing, blog, alternatives, legal, and marketing report routes from TanStack Start after Next equivalents exist.
- [ ] Keep product/auth/API routes intact.
- [ ] Remove Fumadocs and MDX dependencies from `apps/web` if no longer used.
- [ ] Update SEO host assumptions in product app if needed for `app.dunlo.io`.

### Task 7: Verify

**Files:**
- No source files expected.

- [ ] Run `bun install` if dependency changes require lockfile updates.
- [ ] Run `bun run check-types`.
- [ ] Run `bun run build`.
- [ ] Start both apps and inspect representative marketing and product routes.
- [ ] Search migrated components for hardcoded Dunlo hex values.
