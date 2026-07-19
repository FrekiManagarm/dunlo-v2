# SEO Audit Fixes Design

## Objective

Apply the highest-impact code changes from the July 2026 SEO audit without restructuring the existing content clusters. The changes must clarify the homepage category, keep campaign-only and machine-readable URLs out of Google's sitemap, and strengthen contextual links toward the most commercially relevant comparison pages.

## Chosen Approach

Use a focused SEO patch rather than a broad content rewrite. The site already has healthy crawlability, metadata coverage, schema, and keyword-specific pages. The next code changes should improve signal clarity and internal authority while preserving the recently refreshed Smart Retries, involuntary churn, and decline-code content long enough to collect more Search Console data.

## Homepage Search Ownership

- Change the homepage title to `Dunlo — Stripe Payment Recovery for SaaS`.
- Change the homepage H1 to `Recover failed Stripe payments before they churn.`
- Keep `/stripe-failed-payment-recovery-software` as the owner of the exact software-intent query. Its title and H1 remain unchanged.
- Keep the existing homepage description and supporting copy because they already communicate failure-aware emails, Stripe-hosted update links, and founder review.

## Indexation and Sitemap Policy

- Keep `/product-hunt` available at its current URL for campaign traffic.
- Add page-level `noindex, follow` metadata to `/product-hunt`.
- Remove `/product-hunt` from the XML sitemap.
- Remove `/llms.txt` and `/pricing.md` from the XML sitemap while keeping both resources publicly accessible.
- Do not redirect any of these URLs.

## Internal Linking

- Add a compact `Related comparisons` section to the shared alternative-page template.
- Select related alternatives from an explicit curated mapping so links are commercially and topically relevant rather than generated alphabetically.
- Show at most three links and never link a page to itself.
- Prioritize direct Stripe recovery competitors and alternatives that match current search demand: Churn Buster, Churnkey, Stripe customer emails, RetryFix, Chargebee, Paddle Retain, and Smart Retries.
- Preserve the existing primary CTA hierarchy and sources section.

## Testing

Add focused source-level SEO regression tests, consistent with the existing marketing test suite, covering:

1. The homepage title and H1 contain the approved Stripe payment recovery language.
2. `/product-hunt`, `/llms.txt`, and `/pricing.md` are absent from the sitemap source.
3. `/product-hunt` exports `noindex, follow` metadata.
4. The alternative template renders the related-comparisons section from curated links, limits the result to three, and excludes the current page.

Follow red-green-refactor: introduce the assertions first, confirm the expected failures, implement the smallest production changes, then run the focused SEO suite, marketing type-check, and production build.

## Non-Goals

- No new SEO landing pages.
- No rewrite of recently refreshed Smart Retries, involuntary churn, card velocity, or Stripe dunning pages.
- No schema expansion.
- No redirect of the Product Hunt campaign URL.
- No changes to analytics or conversion tracking.
