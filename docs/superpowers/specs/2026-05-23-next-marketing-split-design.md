# Next Marketing Split Design

## Context

Dunlo currently serves both marketing pages and the product app from `apps/web`, a TanStack Start application. The marketing surface includes the landing page, blog, alternatives pages, legal pages, SEO metadata, public assets, robots, sitemap, and llms files. The product surface includes authentication, dashboard, onboarding, Stripe connection, webhooks, cron jobs, and product API routes.

The approved direction is to split these concerns into two deployable apps.

## Goals

- Add a dedicated Next.js App Router application at `apps/marketing`.
- Serve the public marketing website from `dunlo.io`.
- Keep the existing TanStack Start app at `apps/web` for the product app on `app.dunlo.io`.
- Move all marketing routes and content to Next.js:
  - `/`
  - `/blog`
  - `/blog/[slug]`
  - `/alternatives`
  - `/alternatives/[slug]`
  - `/privacy`
  - `/terms`
  - `/state-of-stripe-payments-2026`
  - marketing static files such as `robots.txt`, `sitemap.xml`, `llms.txt`, favicons, OG images, brand assets, and pricing markdown.
- Redirect product routes on `dunlo.io` to `app.dunlo.io`.
- Preserve the existing Dunlo visual system by reusing `@dunlo-v2/ui/globals.css` and shared UI components.

## Non-Goals

- Redesigning the landing page, blog, or alternatives content.
- Replacing Better Auth, Stripe, Neon, Drizzle, or TanStack Start in the product app.
- Changing pricing, onboarding, dashboard behavior, or recovery workflows.
- Building a CMS.

## Architecture

`apps/marketing` is a Next.js App Router app. It owns public SEO, marketing content, and static assets. It imports the shared UI CSS and components from `packages/ui`, and it keeps marketing-specific components local under `apps/marketing/src/components`.

`apps/web` remains TanStack Start and owns product runtime behavior. It keeps `/login`, `/signup`, `/register`, `/reset-password`, `/onboarding`, `/dashboard`, `/benchmark`, and all API routes. Its deployment host becomes `app.dunlo.io`.

Marketing CTAs use an app URL helper so links can point to `https://app.dunlo.io` in production and a configurable local product URL in development.

## Routing

Next.js on `dunlo.io`:

- `/`
- `/blog`
- `/blog/[slug]`
- `/alternatives`
- `/alternatives/[slug]`
- `/privacy`
- `/terms`
- `/state-of-stripe-payments-2026`

Redirects from `dunlo.io` to `app.dunlo.io`:

- `/login`
- `/signup`
- `/register`
- `/reset-password`
- `/onboarding`
- `/dashboard`
- `/dashboard/:path*`
- `/benchmark`

TanStack Start on `app.dunlo.io`:

- Product/auth/dashboard routes
- Product API routes
- Stripe webhooks and cron endpoints

## Blog And Content

The existing MDX files move from `apps/web/content/blog` to `apps/marketing/content/blog`. Blog metadata parsing should be framework-native for Next.js. The implementation can avoid Fumadocs initially by reading MDX frontmatter and compiling MDX with Next-compatible tooling.

## SEO

The marketing app owns canonical URLs for `https://dunlo.io`. Each migrated page should preserve the current title, description, Open Graph data, structured data, robots, sitemap, and llms behavior where applicable.

## Verification

- `bun run check-types`
- `bun run build`
- Start the marketing app and product app locally.
- Inspect `/`, `/blog`, one blog post, `/alternatives`, one alternative page, `/privacy`, `/terms`, and redirect behavior from product paths.
- Confirm no Dunlo brand hex values are hardcoded in migrated components.
