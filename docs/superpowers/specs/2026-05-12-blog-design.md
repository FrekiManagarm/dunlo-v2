# Blog Feature Design — Dunlo v2

**Date:** 2026-05-12  
**Status:** Approved

---

## Overview

Add a `/blog` section to dunlo.io backed by MDX files in the repository. Uses Fumadocs for MDX processing and content loading, with fully custom blog UI that matches the existing Dunlo design system.

---

## Content Pipeline

1. `fumadocs-mdx/vite` Vite plugin watches `apps/web/content/blog/` at build/dev time and compiles MDX files.
2. `apps/web/source.config.ts` defines the blog collection via `defineDocs({ dir: 'content/blog' })`.
3. `apps/web/src/lib/source.ts` exposes a typed `blog` source via `fumadocs-core/source` loader at base URL `/blog`.
4. Route server functions call `blog.getPages()` and `blog.getPage(slug)` to load post data server-side.

### Post Frontmatter Schema

```mdx
---
title: string        # Post title
description: string  # Short excerpt shown on cards
date: YYYY-MM-DD     # Publication date (ISO)
author: string       # Author display name
---
```

---

## New Files

| Path | Purpose |
|---|---|
| `apps/web/source.config.ts` | Defines `blog` collection pointing to `content/blog/` |
| `apps/web/src/lib/source.ts` | Exports `blog` loader (base URL `/blog`) |
| `apps/web/src/components/mdx-components.tsx` | Custom MDX component map for rendering post content |
| `apps/web/src/routes/blog/index.tsx` | Blog index page (`/blog`) |
| `apps/web/src/routes/blog/$slug.tsx` | Individual post page (`/blog/:slug`) |
| `apps/web/content/blog/hello-world.mdx` | Seed post so blog is non-empty on first load |

### Vite Config Change

Add `fumadocs-mdx/vite` plugin to `apps/web/vite.config.ts`:

```ts
import mdx from 'fumadocs-mdx/vite';
// add mdx() to plugins array before tanstackStart()
```

### CSS Change

Add Fumadocs stylesheets to `packages/ui/src/styles/globals.css` (before existing tokens):

```css
@import 'fumadocs-ui/css/neutral.css';
@import 'fumadocs-ui/css/preset.css';
```

### TypeScript Path Alias

Add to `apps/web/tsconfig.json` `compilerOptions.paths`:

```json
"collections/*": ["./.source/*"]
```

This maps the auto-generated `.source/` directory (created by the fumadocs-mdx Vite plugin) to the `collections/*` import used in `src/lib/source.ts`.

### Root Layout Change

Wrap `<Outlet />` in `__root.tsx` with `<RootProvider>` from `fumadocs-ui/provider/tanstack` to enable Fumadocs context (required for MDX rendering, search, etc.).

---

## Routes

### `/blog` — Index Page

- Loads all posts server-side via `createServerFn` calling `blog.getPages()`, sorted by date descending.
- UI: shared site nav → full-width featured card (latest post: title, description, date, "Read more" link) → 3-column card grid of remaining posts (title, date, excerpt, link).
- Design tokens: `rounded-2xl`, `bg-dunlo` for CTA buttons, `text-dunlo-dim` for links, consistent with landing page.

### `/blog/:slug` — Post Page

- Loads single post server-side via `createServerFn` calling `blog.getPage([slug])`. Returns 404 if not found.
- UI: shared site nav → narrow centered column → large post title → meta row (date + author) → MDX body rendered with `<MDXContent components={mdxComponents} />`.
- No sidebar. Clean reading layout.

---

## MDX Components

`src/components/mdx-components.tsx` provides a component map passed to `<MDXContent>`. Overrides:

- `pre` / `code` — styled with JetBrains Mono and Dunlo's dark surface colors
- `a` — uses `text-dunlo-dim` link color
- `blockquote` — left border accent with `border-dunlo/30`
- All other elements: rely on Fumadocs defaults

---

## Data Flow

```
content/blog/*.mdx
  → fumadocs-mdx/vite (compile)
  → .source/ (generated)
  → collections/server (auto-generated)
  → src/lib/source.ts (loader)
  → createServerFn (route loaders)
  → React components (render)
```

---

## Out of Scope

- Search (`/api/search`) — not needed for a blog (few posts)
- Pagination — not needed initially
- Tags / categories — not needed initially
- RSS feed — not in this iteration
- Dark mode — project is light-mode only
