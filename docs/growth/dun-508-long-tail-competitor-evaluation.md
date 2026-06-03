# DUN-508 - Long-tail competitor page evaluation

Date: 2026-06-03

## Decision criteria

Create a long-tail comparison page when at least two of these are true:

- The query maps to a real buyer objection for Stripe-first SaaS founders.
- The competitor is close enough to payment recovery, dunning, billing, or subscription retention.
- Dunlo has a clear and honest contrast.
- The page can answer a concrete search intent without pretending Dunlo replaces a broader platform.

Defer when the competitor is mostly payment orchestration, enterprise billing, or too far from failed-payment recovery.

## Create or keep live

| Ticket | Page | Decision | Reason |
| --- | --- | --- | --- |
| DUN-511 | `/alternatives/stripe-smart-retries` | Strengthen | Highest-intent objection: "Why not just Stripe Smart Retries?" |
| DUN-507 | `/alternatives/custom-stripe-webhooks` | Create | Strong founder objection: build versus buy. |
| DUN-506 | `/alternatives/loops-dunning` | Create | Useful comparison for teams considering email-workflow tooling. |
| DUN-503 | `/alternatives/retryfix` | Create | Direct failed-payment recovery alternative intent. |
| DUN-502 | `/alternatives/revive` | Create | Direct recovery/dunning alternative intent. |
| DUN-501 | `/alternatives/recurly-recover` | Create | Strong contrast for teams on Stripe versus Recurly. |
| DUN-500 | `/alternatives/flycode` | Create | Relevant payment recovery competitor with enough commercial overlap. |

## Low priority, keep light

| Ticket | Page | Decision | Reason |
| --- | --- | --- | --- |
| DUN-505 | `/alternatives/revaly-flexpay` | Create light page | Adjacent enough to failed-payment recovery, but likely lower search volume. |
| DUN-504 | `/alternatives/gr4vy` | Create light page | Useful only to explain why payment orchestration is not the same as dunning. |

## Defer for now

| Candidate | Decision | Reason |
| --- | --- | --- |
| Stunning | Defer | Legacy-ish query and weaker current buyer intent for Stripe-first SaaS. |
| PayCircuit | Defer | Too thin without a clear Stripe failed-payment recovery angle. |
| Recoupt | Defer | Insufficient evidence of direct search demand. |
| ChurnRecover | Defer | Possible future page, but not as strong as RetryFix, Revive, or FlyCode. |
| Rekko | Defer | Not enough direct overlap with the current Dunlo positioning. |
| WorkAid Dunning | Defer | Too narrow until search demand is proven. |
| Rebill | Defer | More billing/subscription platform than dunning objection. |
| Autumn | Defer | Billing infrastructure angle, not a failed-payment recovery buyer page. |

## Content rule

Each page should stay simple:

- one buyer question in the hero;
- one practical comparison table;
- one "when the competitor fits" section;
- one "when Dunlo fits" section;
- official source links only;
- no invented testimonials, screenshots, or recovery metrics.

This keeps the pages aligned with Dunlo's current design direction and avoids noisy SEO pages that feel disconnected from the product.
