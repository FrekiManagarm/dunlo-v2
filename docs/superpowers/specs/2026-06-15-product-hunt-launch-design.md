# Product Hunt Launch Design

## Goal

Prepare Dunlo for a Product Hunt launch with a focused Product Hunt landing page and a reusable launch kit that helps drive qualified beta signups from Stripe-first SaaS founders.

## Audience

The launch is for Product Hunt users who understand SaaS, Stripe, churn, founder-led products, and early beta software. The page should speak to founders and operators who want practical payment recovery without aggressive dunning.

## Page Design

Create a new marketing route at `/product-hunt`. The page should be shorter and more conversion-focused than the main SEO pages. It should use the existing Dunlo marketing shell with `Nav`, `Footer`, `SIGNUP_URL`, `pageSeoMetadata`, and the brand color utilities from `packages/ui`.

The page structure:

- Hero with a Product Hunt launch badge, a direct headline, short value proposition, and two CTAs.
- A compact launch panel that makes the Product Hunt visitor feel the product is active and concrete.
- Three audience-specific reasons Product Hunt users should care.
- A simple three-step workflow for how Dunlo recovers failed Stripe payments.
- A beta offer section explaining that Dunlo is free during beta.
- A short FAQ for common launch-day objections.
- Final CTA.

## Copy Direction

Use plain founder language. Avoid leaderboard promises, upvote requests, or spammy launch language. The page should ask for feedback and beta usage, not Product Hunt votes.

Core message:

> Dunlo recovers failed Stripe payments by turning decline reasons into the right recovery email, retry timing, and founder escalation.

## Documentation

Add a launch kit under `docs/growth/` with:

- Product Hunt tagline, description, first maker comment, and launch assets checklist.
- Launch timeline from two weeks before launch through one week after launch.
- Social, email, and DM copy that asks for feedback instead of upvotes.
- Follow-up plan for beta users and prospects.

## SEO And Sharing

Add Product Hunt-specific metadata and a dedicated Open Graph image using the existing OG helper. Add `/product-hunt` to the sitemap.

## Verification

Run type checks for the marketing app after implementation. If type checks are blocked by pre-existing issues, record the exact failure.
