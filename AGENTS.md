# Dunlo v2 — Project Guide for Claude

## What is Dunlo?

Dunlo is a **Stripe payment recovery SaaS** that helps SaaS founders recover failed payments automatically. It monitors failed charges, sends recovery emails, and tracks recovered revenue. The product is in beta and free during that period.

---

## Monorepo Structure

```
dunlo-v2/
├── apps/
│   └── web/                  # TanStack Start SSR app (main frontend + API)
├── packages/
│   ├── auth/                 # better-auth config (shared server-side)
│   ├── config/               # Shared TypeScript / tooling config
│   ├── db/                   # Drizzle ORM schema + Neon client
│   ├── env/                  # Type-safe env vars (@t3-oss/env-core)
│   └── ui/                   # Shared component library + global CSS
├── package.json              # Root — Bun workspaces + Turborepo scripts
├── turbo.json                # Turborepo pipeline
└── bts.jsonc                 # Bun workspace catalog
```

**Package manager:** `bun@1.2.21`  
**Monorepo tool:** Turborepo

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | TanStack Start (SSR, Vite + Nitro) |
| Router | TanStack Router (file-based, type-safe) |
| Auth | better-auth + `tanstackStartCookies` plugin |
| Database | Drizzle ORM + Neon PostgreSQL (serverless) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (built on `@base-ui/react`) |
| Forms | @tanstack/react-form + Zod |
| Motion | framer-motion |
| Toasts | sonner |
| Icons | lucide-react |
| Env vars | @t3-oss/env-core |

---

## Design System

### Brand Colors

Defined in `packages/ui/src/styles/globals.css` as the single source of truth.

```css
--dunlo-accent:       #00e87b   /* Primary green */
--dunlo-accent-hover: #00ff8c   /* Hover state */
--dunlo-accent-dim:   #00c66a   /* Links on white bg */
--dunlo-accent-deep:  #009950   /* Dark text on pale green bg */
```

### Tailwind v4 Utility Classes

Use these tokens — **never hardcode hex values** in components:

| Class | Use |
|---|---|
| `bg-dunlo` / `text-dunlo` | Primary brand green |
| `bg-dunlo-hover` | Hover backgrounds |
| `text-dunlo-dim` | Green links on white |
| `text-dunlo-deep` | Dark green text on light green bg |
| `bg-dunlo/20`, `border-dunlo/30` | Opacity modifiers — fully supported |

### Typography

- **Sans:** `Outfit` (Google Fonts, loaded in `__root.tsx`)
- **Mono:** `JetBrains Mono` (Google Fonts)
- Font set via `--font-sans` and `--font-mono` in the `@theme inline` block

### Mode

Light mode by default. No `.dark` class on `<html>`. Dark mode tokens are defined but not activated.

### Radius / Shapes

Pill shapes preferred (`rounded-full`). Card radius: `rounded-2xl` or `rounded-xl`. Input radius: `rounded-xl`.

---

## Routes (`apps/web/src/routes/`)

| File | Path | Description |
|---|---|---|
| `__root.tsx` | — | Root layout: fonts, Toaster, devtools. No global header. |
| `index.tsx` | `/` | Landing page: Nav, Hero, Dashboard mockup, Logo marquee, Features, How it works, Pricing, FAQ, CTA, Footer |
| `login.tsx` | `/login` | Split-panel auth page: dark left panel (testimonial + perks) + white right panel (tab switcher between SignIn/SignUp forms) |
| `dashboard.tsx` | `/dashboard` | Protected dashboard: sidebar nav, stat cards, payments table, Stripe connect banner |
| `api/auth` | `/api/auth/*` | better-auth API handler (catch-all) |

---

## Components (`apps/web/src/components/`)

| File | Description |
|---|---|
| `sign-in-form.tsx` | Email + password sign-in. `@tanstack/react-form` + Zod. Pill button in `bg-gray-900`. |
| `sign-up-form.tsx` | Name + email + password sign-up. Green pill CTA (`bg-dunlo`). |

---

## Packages

### `packages/auth`
- `src/index.ts` — better-auth instance with `drizzleAdapter`, `emailAndPassword`, `trustedOrigins` from env, `tanstackStartCookies()` plugin.

### `packages/db`
- `src/index.ts` — Neon + Drizzle client export
- `src/schema/auth.ts` — `user`, `session`, `account`, `verification` tables with Drizzle relations

### `packages/env`
- `src/server.ts` — Server env vars: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `CORS_ORIGIN`, `NODE_ENV`
- `src/client.ts` — Client env vars (prefix `VITE_`)

### `packages/ui`
- `src/styles/globals.css` — **All design tokens live here.** Import order: `tailwindcss`, `tw-animate-css`, `shadcn/tailwind.css`, then `:root`, `.dark`, `@theme inline`.
- Components re-exported from shadcn/ui (`input`, `label`, `button`, etc.)

---

## Environment Variables

Create `.env` at the repo root:

```env
DATABASE_URL=postgresql://...          # Neon connection string
BETTER_AUTH_SECRET=...                 # Random 32+ char secret
BETTER_AUTH_URL=http://localhost:3000  # App origin
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

---

## Dev Commands

Run from the repo root:

```bash
bun run dev          # Start all apps in parallel (Turborepo)
bun run dev:web      # Start only the web app
bun run build        # Build all
bun run check-types  # TypeScript type-check all packages

bun run db:push      # Push Drizzle schema to Neon (no migration files)
bun run db:studio    # Open Drizzle Studio
bun run db:generate  # Generate migration files
bun run db:migrate   # Run migrations
```

---

## Key Conventions

### Routing
- File-based: add a file to `apps/web/src/routes/` → automatically a route
- Every route file exports `Route = createFileRoute("/path")({ component })`
- Auth guard: check `authClient.useSession()` and redirect if needed

### Auth Client
```ts
import { authClient } from "@/lib/auth-client";
const { data: session, isPending } = authClient.useSession();
await authClient.signIn.email({ email, password }, { onSuccess, onError });
await authClient.signOut();
```

### Importing UI Components
```ts
import { Button } from "@dunlo-v2/ui/components/button";
import { Input }  from "@dunlo-v2/ui/components/input";
```

### Tailwind Color Tokens — Required Usage
- Use `bg-dunlo`, `text-dunlo-dim`, `border-dunlo/30`, etc.
- **Never** write `#00e87b`, `#00c66a`, or `emerald-*` directly in component files

### Forms
- Always use `@tanstack/react-form` + Zod (`validators.onSubmit` schema)
- Labels above inputs, errors below inputs (`field.state.meta.errors`)
- Submit button uses `form.Subscribe` to track `canSubmit` + `isSubmitting`

### Animations
- Scroll-triggered reveals use framer-motion `useInView` + `motion.div`
- CSS stagger classes: `.anim-1` through `.anim-6` (defined in `globals.css`)
- CSS marquee: `.animate-marquee` for logo strip

### No Comments Policy
- Only add comments when the WHY is non-obvious — never comment what the code does
