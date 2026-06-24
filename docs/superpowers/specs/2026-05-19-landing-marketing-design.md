# Landing Marketing Rework Design

## Context

Dunlo is a Stripe payment recovery SaaS for SaaS founders. The current landing already explains the core mechanics: Stripe failure-code detection, recovery emails, AI founder escalation, pricing, ROI, and setup.

The marketing gap is not a missing feature. The page needs a clearer double-reading structure:

- A founder who does not know involuntary churn should understand the problem quickly.
- A founder or operator who knows Stripe, dunning, Smart Retries, and recovery workflows should see why Dunlo is more precise than generic retry tooling.

The approved direction is a founder-to-founder narrative with a pedagogical base.

## Goals

- Make every section understandable in plain language without prior payment-recovery knowledge.
- Add a second layer of concrete Stripe/recovery detail for advanced readers.
- Keep the page focused on Dunlo's specific wedge: Stripe-first recovery, failure-code-specific emails, founder escalation, and revenue tracking.
- Preserve the existing visual language: light default mode, Dunlo green tokens, rounded surfaces, Outfit typography, and product-like mockups.
- Avoid turning the page into a broad lifecycle, retention, or payment-operations suite pitch.

## Non-Goals

- Redesigning the product UI.
- Adding new paid-plan logic or changing the pricing model.
- Reworking authentication, dashboard, Stripe connection, or email-provider setup.
- Replacing the current brand system or hardcoding new colors in components.

## Narrative Strategy

The landing should follow this arc:

1. Failed payments are not normal churn.
2. Different failure reasons need different recovery moves.
3. Dunlo turns Stripe signals into the right customer communication.
4. Routine failures can be automated, while high-value accounts deserve founder attention.
5. The impact should be measurable through benchmark, ROI, recovered revenue, and transparent pricing.

Each major section should include two levels:

- **Simple layer:** what the visitor should understand in one pass.
- **Expert layer:** the concrete mechanism, signal, or decision behind the claim.

## Section Design

### 1. Hero

Purpose: make the promise clear before introducing technical detail.

Simple layer:

- Failed Stripe payments can become silent churn if nobody catches them.
- Dunlo helps recover them before good customers disappear.

Expert layer:

- Dunlo reads Stripe failure reasons.
- It adapts timing, messaging, and escalation based on the failure type.
- High-value failures can pause automation and produce a founder email draft.

Primary CTA should remain beta/benchmark-oriented because the app already supports that expectation.

### 2. Problem Education

Purpose: explain why failed payment recovery is not one generic problem.

Simple layer:

- An expired card, insufficient funds, and a bank decline each need a different follow-up.
- Sending the same reminder to everyone creates avoidable churn and awkward customer communication.

Expert layer:

- Show a small mapping between Stripe failure codes and recommended recovery moves.
- Examples:
  - `expired_card` -> secure payment update link.
  - `insufficient_funds` -> softer timing and retry window.
  - `do_not_honor` or bank decline -> clearer customer context and possible escalation.

### 3. Recovery Engine

Purpose: show Dunlo's operating model.

Simple layer:

- Dunlo watches the failed payment, decides the next move, sends the right message, and tracks whether revenue comes back.

Expert layer:

- Present the flow as Stripe signal -> recovery decision -> email sequence -> payment status -> recovered revenue.
- Make clear that Dunlo complements Stripe retries rather than replacing them.
- Keep wording tight around permissions: Dunlo does not need to move money or store card details.

### 4. Human Escalation

Purpose: make AI escalation feel useful, controlled, and founder-led.

Simple layer:

- Small routine failures can be automated.
- Important accounts should not receive a cold generic reminder.

Expert layer:

- A configurable threshold determines when automation pauses.
- Dunlo uses Stripe context and account value to draft a personal founder email.
- The founder can review, regenerate, dismiss, or send.

### 5. Proof, Benchmark, And ROI

Purpose: help both audiences understand why recovery is worth doing.

Simple layer:

- Show the money at risk and the revenue that could be recovered.
- Keep the estimate understandable and conservative.

Expert layer:

- Explain the assumptions behind the ROI calculator: failed-payment rate and recoverable rate.
- Keep source labels visible where stats are used.
- Avoid overclaiming exact recovery outcomes.

### 6. Setup

Purpose: remove implementation anxiety.

Simple layer:

- Connect Stripe, review the default sequences, connect email, and start monitoring.

Expert layer:

- Mention read-only Stripe OAuth where appropriate.
- Explain that the default sequences can be edited for tone and timing.
- Clarify that no engineering team is required for the baseline setup.

### 7. Pricing, FAQ, And Founder Story

Purpose: answer objections and increase trust.

Simple layer:

- Free during beta.
- Pricing is visible before billing starts.
- Dunlo does not take a recovered-revenue percentage.

Expert layer:

- Explain the difference from Stripe Smart Retries: Stripe can retry cards; Dunlo handles customer communication and escalation.
- Explain the narrower positioning versus broader dunning or lifecycle tools.
- Include security expectations around Stripe data and card details.
- Keep the founder story as a credibility section, not a long autobiography.

## Content Principles

- Use plain words first, then technical terms.
- Prefer concrete examples over abstract SaaS language.
- Avoid jargon without context. If a term like "involuntary churn" appears, explain it nearby.
- Avoid generic claims such as "boost revenue" unless paired with the mechanism that creates the lift.
- Use "failed payment", "Stripe failure reason", "recovery sequence", "founder escalation", and "recovered revenue" consistently.
- Keep the tone founder-to-founder: direct, useful, and calm.

## Visual And Component Direction

- Keep the existing page composition and Dunlo brand system.
- Existing product mockups can be reused, but the surrounding copy should teach more clearly.
- Add compact expert proof blocks where useful rather than creating large new decorative sections.
- Preserve existing Tailwind token usage and do not hardcode Dunlo hex values in components.
- Keep mobile readability high: expert details should stack cleanly and never rely on dense side-by-side layouts.

## Implementation Boundaries

Likely files to update during implementation:

- `apps/web/src/routes/index.tsx`
- `apps/web/src/components/landing/stats-banner.tsx`
- `apps/web/src/components/landing/escalation.tsx`
- `apps/web/src/components/landing/how-it-works.tsx`
- `apps/web/src/components/landing/roi-calculator.tsx`
- `apps/web/src/lib/seo.ts`

Existing unused or alternative landing components should not be removed unless implementation confirms they are obsolete.

## Verification Plan

- Run the project type check.
- Run the production build if dependencies and environment allow it.
- Start the web app and visually inspect the landing page on desktop and mobile.
- Check that no component hardcodes Dunlo green hex values.
- Check that the page remains understandable without interacting with animated panels.

## Implementation Notes

- Final headline wording can be refined during implementation, but it should keep the approved promise: recover failed payments before good customers disappear.
- The exact number of expert proof blocks should be chosen while editing the page, based on visual density and mobile readability.
