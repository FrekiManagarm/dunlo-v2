# SEO Ranking Consolidation Design

## Goal

Turn Dunlo's growing non-brand Google impressions into stronger first- and second-page rankings by assigning one page to each emerging query cluster, improving search-intent alignment, and consolidating overlapping content.

This is a 30-day consolidation sprint. It improves pages that Google is already testing instead of adding more broad SEO pages.

## Current Baseline

Google Search Console on July 13, 2026 shows:

| Window | Clicks | Impressions | CTR | Average position |
| --- | ---: | ---: | ---: | ---: |
| Available three-month view | 21 | 3,820 | 0.5% | 24.9 |
| Last 28 days | 11 | 2,590 | 0.4% | 23.6 |

Approximately 68% of all recorded impressions occurred during the last 28 days. The latest daily impression count is also the highest in the available chart. Google is expanding discovery, but most impressions occur around page two or three. Ranking depth is therefore the primary constraint. CTR becomes the primary optimization target only when a page reaches an average position of 15 or better.

The crawl and indexation foundation is already healthy:

- Live `robots.txt`, `sitemap.xml`, and the priority pages return HTTP 200.
- Marketing pages use self-referencing canonical URLs.
- The relevant pages include structured data in their rendered output.
- Google has indexed the main recovery, dunning, churn, and failure-code content cluster.

## Audience And Conversion Goal

The audience is Stripe-first SaaS founders and small operators who want to recover failed payments without replacing Stripe Billing or adopting a broad retention suite.

The primary business conversion remains creating a free beta account and connecting Stripe. Informational pages should use the benchmark or a calculator as the lower-friction first CTA, then introduce the product when the reader reaches recovery workflow or tool-selection intent.

## Approved Direction

Use a consolidation-first approach:

1. Give every emerging query cluster a single canonical content owner.
2. Align the owner's title, H1, opening answer, supporting sections, links, and CTA with the query intent.
3. Reduce duplicated answers on broader pages and replace them with short summaries that link to the owner.
4. Strengthen the internal-link paths from broad educational content to specific recovery guidance and product pages.
5. Measure query-to-page ownership and position for 28 days before expanding the cluster.

## Keyword Ownership

| Query cluster | Search intent | Owning page | Supporting pages |
| --- | --- | --- | --- |
| `smart retries`, `Stripe Smart Retries` | Informational and commercial investigation | `/stripe-smart-retries-alternative` | `/stripe-dunning`, `/stripe-failed-payment-recovery-software`, `/benchmark` |
| `involuntary churn`, `involuntary churn SaaS` | Informational | `/blog/involuntary-churn-in-saas` | `/involuntary-churn-calculator`, `/stripe-failed-payments`, `/benchmark` |
| `card_velocity_exceeded` and punctuation variants | Diagnostic and action-oriented | `/stripe-decline-codes/card-velocity-exceeded` | `/stripe-decline-codes`, `/blog/stripe-failure-codes-the-complete-guide`, `/stripe-dunning-schedule-calculator` |
| `stripe dunning`, `dunning SaaS` | Informational and commercial investigation | `/stripe-dunning` | `/stripe-dunning-schedule-calculator`, `/stripe-decline-codes`, `/stripe-failed-payment-recovery-software` |
| `stripe failed payments` | Informational and commercial investigation | `/stripe-failed-payments` | Failure-code guides, dunning guide, recovery-software page |

The involuntary churn calculator owns calculator-specific queries only. The broad failure-code article owns the general failure-code topic, not any individual decline-code query.

## Page Design

### Stripe Smart Retries

Update `apps/marketing/src/app/stripe-smart-retries-alternative/page.tsx` so the page answers the informational query before making the commercial comparison.

- Title: `Stripe Smart Retries: Limits & Alternatives | Dunlo`
- H1: `Stripe Smart Retries: what it covers and when SaaS needs more`
- Opening answer: explain in plain language that Smart Retries optimizes retry timing inside Stripe and that customer action, failure-specific messaging, owner escalation, and recovery workflow visibility are separate concerns.
- Preserve the accurate distinction between Stripe's native recovery capabilities and Dunlo. Do not claim that Stripe lacks customer emails, hosted update flows, analytics, or configurable recovery features.
- Add or retain sections covering how Smart Retries works, which failures can benefit from retries, which failures need customer action, when Stripe alone is sufficient, and when a recovery layer is useful.
- Link contextually to `/stripe-dunning`, `/stripe-failed-payment-recovery-software`, and `/benchmark`.
- Cite at least three authoritative sources, including Stripe's Smart Retries and revenue recovery documentation.
- Use an early comparison anchor, a mid-page benchmark CTA, and a final beta signup CTA.

### Involuntary Churn

Update `apps/marketing/content/blog/involuntary-churn-in-saas.mdx` without creating another general involuntary-churn article.

- Search title: `Involuntary Churn in SaaS: Causes & Fixes | Dunlo`
- Visible article title: `What Is Involuntary Churn in SaaS?`
- Preserve the direct definition near the top and make it the snippet-ready answer.
- Separate failed payment, delinquency, recovered payment, and final involuntary churn so the measurement model is unambiguous.
- Support quantitative claims with current authoritative sources. Remove or qualify any benchmark that cannot be traced to a reliable source.
- Link contextually to `/involuntary-churn-calculator`, `/stripe-failed-payments`, and `/benchmark`.
- Include at least three authoritative external references and retain a visible FAQ.
- Use the calculator or benchmark for the early and mid-article CTA. Use beta signup only after the recovery workflow or tool-selection section.

Extend the shared blog frontmatter schema in `apps/marketing/source.config.ts` with optional `seoTitle` and `updated` fields. Expose both fields through the existing blog data layer. The blog route must prefer `seoTitle` for search and social metadata while retaining `title` for the visible H1, cards, breadcrumbs, and Article headline. It must prefer `updated` for `dateModified` while retaining `date` for `datePublished`. Existing posts without either optional field must keep their current behavior.

### `card_velocity_exceeded`

Update the `card-velocity-exceeded` entry in `apps/marketing/src/lib/stripe-decline-codes.ts` and use the existing dynamic detail template.

- Title: `Stripe card_velocity_exceeded: Meaning & Fix | Dunlo`
- H1: `Stripe card_velocity_exceeded: what it means and how to recover the payment`
- Opening answer: define the code, state that it usually reflects an issuer limit or velocity control, recommend waiting before another retry, and offer another payment method or issuer approval as the next action.
- Address the exact code plus the observed punctuation and spelling variants naturally. Do not create separate URLs for typo variants.
- Preserve customer-safe language and avoid presenting an issuer diagnosis as certainty.
- Link contextually to `/stripe-decline-codes`, `/stripe-dunning`, and `/stripe-dunning-schedule-calculator`.
- Retain Article and breadcrumb structured data and ensure their text matches the visible page.

Reduce cannibalization in `apps/marketing/content/blog/stripe-failure-codes-the-complete-guide.mdx`:

- Keep `card_velocity_exceeded` in the overview table.
- Replace repeated standalone explanations with one concise summary.
- Link the exact anchor `Stripe card_velocity_exceeded recovery guide` to the dedicated detail page.
- Keep the broad article focused on classification and navigation across failure-code families.

### Stripe Dunning

Update `apps/marketing/src/app/stripe-dunning/page.tsx` as the owner of both `stripe dunning` and `dunning SaaS`.

- Title: `Stripe Dunning for SaaS: Recovery Guide | Dunlo`
- H1: `Stripe dunning for SaaS failed-payment recovery`
- Opening answer: define dunning and list its core parts: retries, customer communication, payment update paths, account handling, and recovery measurement.
- Preserve the failure-aware positioning while explaining where Stripe's native recovery settings fit.
- Add or retain sections for the workflow, recommended sequence, failure-specific branches, measurement, build-versus-buy decision, and FAQ.
- Link contextually to `/stripe-dunning-schedule-calculator`, `/stripe-decline-codes`, and `/stripe-failed-payment-recovery-software`.
- Cite at least three authoritative external sources for Stripe mechanics or factual claims.
- Use the schedule calculator as the low-friction CTA and beta signup as the final commercial CTA.

### Stripe Failed Payments

Keep `/stripe-failed-payments` as the broad failed-payment pillar. Avoid a full rewrite during this sprint because the page is already earning non-brand clicks.

- Add contextual links to `/stripe-smart-retries-alternative`, `/blog/involuntary-churn-in-saas`, `/stripe-decline-codes/card-velocity-exceeded`, and `/stripe-dunning`.
- Ensure the page does not become the most detailed answer for Smart Retries, involuntary churn, dunning, or individual decline codes.
- Preserve its existing canonical URL, structured data, and conversion path.

## Internal-Link Architecture

The intended reader and crawler path is:

1. Broad problem page or article.
2. Specific diagnostic, dunning, or churn guide.
3. Calculator or benchmark for a low-friction action.
4. Recovery-software page or beta signup for commercial intent.

Every priority owner must have at least three contextual internal links to relevant pages and at least two contextual inbound links from existing indexed pages. Footer links do not count toward this requirement.

Use descriptive anchors that name the destination topic. Avoid repeating the exact same keyword anchor across every page; natural variants are preferred.

## Structured Data And Metadata

- Keep self-referencing canonicals and existing URLs unchanged.
- Preserve Article, FAQ, breadcrumb, Organization, and WebSite structured data where currently applicable.
- FAQ structured data must describe FAQs visible on the page.
- Updated Article pages must use an accurate `dateModified` while preserving the original `datePublished`.
- Titles must be no longer than 60 characters and descriptions must be 150-160 characters without keyword stuffing.
- Each priority page must have one H1. The primary query must appear in the H1 and within the first 100 words.

## Measurement Plan

Record a Search Console baseline immediately before deployment for each query cluster and owning page:

- Clicks
- Impressions
- CTR
- Average position
- Share of cluster impressions received by the intended owner

Review seven days after deployment only for crawl or ownership regressions. Evaluate ranking performance after 14 and 28 days.

The sprint is successful when, after 28 days:

- The intended owner receives at least 80% of impressions for its query cluster.
- At least two of the four refreshed owners improve by five average positions or reach an average position of 20 or better.
- No supporting page receives more than 20% of a cluster's impressions because it duplicates the owner's full answer.
- Non-brand clicks across the tracked clusters increase relative to the pre-deployment 28-day baseline.
- No priority page loses indexability, its self-canonical, or valid rendered structured data.

CTR is diagnostic rather than a standalone success threshold while average position remains worse than 15.

## Verification

Before deployment:

- Run the marketing app type check and production build.
- Render every refreshed page and confirm its title, meta description, canonical, H1, opening answer, and internal links.
- Confirm the broad failure-code article links to the dedicated `card_velocity_exceeded` guide and no longer repeats the full answer.
- Inspect rendered JSON-LD for the refreshed pages and validate that Article, FAQ, and breadcrumb data matches visible content.
- Check all added internal and external links. They must avoid 4xx and 5xx responses; redirects are acceptable only when the destination intentionally owns the URL.
- Confirm that the sitemap still contains every priority URL.

After deployment:

- Request recrawling for the four refreshed owners in Search Console.
- Confirm that Google selects the intended canonical.
- Compare query-to-page ownership after 7, 14, and 28 days.

## Non-Goals

- Creating new broad dunning, Smart Retries, involuntary churn, or failed-payment pages.
- Creating separate URLs for decline-code spelling or punctuation variants.
- Expanding the decline-code library during the 30-day observation window.
- Changing existing public URLs or cross-canonicalizing content.
- Redesigning the marketing site.
- Running a backlink or digital PR campaign as part of this implementation.
- Guaranteeing rankings, traffic, clicks, or revenue outcomes.
