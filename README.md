<div align="center">

# Dunlo

**Stripe payment recovery for SaaS businesses.**  
Automatically retry failed charges, send smart dunning emails, and track every dollar recovered — so you don't lose customers to involuntary churn.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TanStack Start](https://img.shields.io/badge/TanStack_Start-SSR-FF4154?style=flat-square)](https://tanstack.com/start)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Bun](https://img.shields.io/badge/Bun-1.2-fbf0df?style=flat-square&logo=bun&logoColor=black)](https://bun.sh/)

</div>

---

## Overview

Dunlo monitors your Stripe account for failed payments and handles recovery automatically:

- **Detects** failed charges in real time via Stripe webhooks
- **Retries** payments on an intelligent schedule
- **Emails** customers with branded, actionable recovery messages
- **Tracks** recovered revenue with a clear dashboard

Currently in **free beta** — full recovery pipeline available to early adopters at no cost.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [TanStack Start](https://tanstack.com/start) (SSR, Vite + Nitro) |
| Router | [TanStack Router](https://tanstack.com/router) (file-based, type-safe) |
| Auth | [better-auth](https://better-auth.com) + `tanstackStartCookies` |
| Database | [Drizzle ORM](https://orm.drizzle.team) + [Neon](https://neon.tech) (serverless PostgreSQL) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Components | [shadcn/ui](https://ui.shadcn.com/) (built on `@base-ui/react`) |
| Forms | [@tanstack/react-form](https://tanstack.com/form) + Zod |
| Payments | [Stripe](https://stripe.com) |
| Blog/MDX | [Fumadocs MDX](https://fumadocs.vercel.app/) |
| Analytics | [PostHog](https://posthog.com) |
| Build | [Turborepo](https://turbo.build/) + [Bun](https://bun.sh) workspaces |
| Deployment | [Vercel](https://vercel.com) |

---

## Monorepo Structure

```
dunlo-v2/
├── apps/
│   └── web/                  # TanStack Start SSR app (frontend + API)
│       ├── src/
│       │   ├── components/   # UI components
│       │   ├── lib/          # Utilities, server functions, API queries
│       │   ├── routes/       # File-based routes (TanStack Router)
│       │   └── server/       # Nitro server plugins (email scheduler, etc.)
│       └── content/
│           └── blog/         # MDX blog articles
├── packages/
│   ├── auth/                 # better-auth config (shared server-side)
│   ├── config/               # Shared TypeScript / tooling config
│   ├── db/                   # Drizzle ORM schema + Neon client
│   ├── env/                  # Type-safe env vars (@t3-oss/env-core)
│   └── ui/                   # Shared component library + global CSS
├── package.json              # Root — Bun workspaces + Turborepo scripts
└── turbo.json                # Turborepo pipeline
```

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) `>= 1.2`
- A [Neon](https://neon.tech) PostgreSQL database
- A [Stripe](https://stripe.com) account (test mode works for local dev)

### Installation

```bash
git clone https://github.com/FrekiManagarm/dunlo-v2.git
cd dunlo-v2
bun install
```

### Environment Variables

Create a `.env` file at the repo root:

```env
# Database
DATABASE_URL=postgresql://...

# Auth
BETTER_AUTH_SECRET=...                 # Random 32+ character secret
BETTER_AUTH_URL=http://localhost:3001
CORS_ORIGIN=http://localhost:3001
GOOGLE_CLIENT_ID=...                   # Google OAuth web client ID
GOOGLE_CLIENT_SECRET=...               # Google OAuth web client secret

# Platform email for auth + alerts
AUTH_EMAIL_PROVIDER=postmark           # postmark | resend | mailgun | sendgrid
PLATFORM_EMAIL_FROM="Dunlo <noreply@yourdomain.com>"
POSTMARK_SERVER_TOKEN=...
# Or use RESEND_API_KEY / MAILGUN_API_KEY + MAILGUN_DOMAIN / SENDGRID_API_KEY

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

NODE_ENV=development
```

### Database Setup

```bash
bun run db:push
```

### Start Development

```bash
bun run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/login` | Sign in / Sign up |
| `/onboarding` | Stripe Connect onboarding |
| `/dashboard` | Payments overview, stats, recovery status |
| `/blog` | Marketing blog (MDX articles) |
| `/blog/:slug` | Individual blog post |

---

## Available Scripts

Run from the **repo root**:

| Command | Description |
|---|---|
| `bun run dev` | Start all apps in parallel (hot reload) |
| `bun run dev:web` | Start only the web app |
| `bun run build` | Production build |
| `bun run check-types` | TypeScript type-check across the monorepo |
| `bun run db:push` | Push Drizzle schema to Neon |
| `bun run db:generate` | Generate migration files |
| `bun run db:migrate` | Run pending migrations |
| `bun run db:studio` | Open Drizzle Studio |

---

## UI Customization

Design tokens live in `packages/ui/src/styles/globals.css` and are available as Tailwind utilities everywhere in the monorepo:

| Class | Description |
|---|---|
| `bg-dunlo` / `text-dunlo` | Primary brand green |
| `text-dunlo-dim` | Green links on white backgrounds |
| `text-dunlo-deep` | Dark green text on light green |
| `bg-dunlo/20`, `border-dunlo/30` | Opacity modifier variants |

To add shadcn/ui primitives to the shared package:

```bash
npx shadcn@latest add accordion dialog -c packages/ui
```

```tsx
import { Button } from "@dunlo-v2/ui/components/button";
```

---

## License

[MIT](LICENSE)
