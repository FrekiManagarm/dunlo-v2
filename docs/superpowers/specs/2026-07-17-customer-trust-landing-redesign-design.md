# Dunlo Customer-Trust Landing Redesign

## Status

Approved direction, awaiting written-spec review before implementation planning.

## Context

Dunlo is a Stripe payment recovery SaaS for SaaS founders. The marketing homepage already explains failed-payment detection, failure-specific recovery messages, founder escalation, recovered-revenue tracking, beta pricing, and ROI. Its main weaknesses are not missing product concepts; they are trust, interaction accuracy, accessibility, mobile length, and a visual language that resembles a generic black-and-green SaaS template.

The July 17 Impeccable critique scored the current page 23/40 and identified five priorities:

1. Simulated product data is presented without a clear example label while no approved customer proof is available.
2. Several preview controls look interactive but do nothing, and some CTA labels do not match their signup destination.
3. White text on the bright Dunlo green fails WCAG contrast.
4. The mobile page is readable but excessively long, and many interactive targets are smaller than 44 px.
5. Repeated rounded cards, decorative grids, uppercase monospace labels, and console-style panels hide the product's distinctiveness.

`BETA_TESTIMONIALS` is intentionally empty. This redesign must not invent customer logos, quotes, recovery metrics, or implied social proof. It replaces unsupported proof with transparent example labeling, security explanations, methodology, public proof policy, and founder accountability.

This specification supersedes the visual-preservation requirement in `2026-05-19-landing-marketing-design.md`. It preserves the product positioning and green brand identity, but deliberately changes typography, layout, density, component shapes, motion, and narrative order.

## Approved Direction

The homepage promise is:

> **Recover failed payments without losing customer trust.**

Supporting explanation:

> Dunlo reads why a Stripe payment failed, sends the right recovery message, and pauses sensitive accounts for founder review.

The promise combines the commercial outcome with Dunlo's actual differentiator: customer-safe recovery communication and human control for sensitive accounts. It avoids introducing an invented category or metaphor.

The quality bar is flagship. This is not a targeted reskin. The redesign may restructure sections, replace the marketing typography, simplify or remove existing mockups, and refactor landing components while preserving the product's scope and the existing shared design tokens.

## Reference Set

The design should learn from current YC-backed fintech landing pages without copying their visual identity:

- [Increase](https://increase.com/): a bold, recognizable hero gesture with the product integrated into the composition.
- [Modern Treasury](https://www.moderntreasury.com/): generous whitespace, a single direct promise, and an operational diagram that explains the infrastructure.
- [End Close](https://www.endclose.com/): product evidence, control, compliance, and functional benefits visible in the first viewport.
- [Stripe](https://stripe.com/): strong typographic hierarchy, decisive art direction, and credibility immediately following the hero.
- [FlyCode](https://www.flycode.com/): a useful direct-competitor reference for pain-first copy and immediate Stripe relevance. Dunlo must avoid its more aggressive dark/AI aesthetic and unsupported performance language.

The resulting page should feel calm, exact, protective, and contemporary. Its physical-object reference is a well-designed financial operations instrument: precise typography, explicit states, strong alignment, and no decorative ambiguity.

## Goals

- Make the core promise understandable within five seconds.
- Explain why different Stripe failure reasons need different customer responses.
- Make founder review the emotional and product differentiation peak.
- Establish trust before asking the visitor to connect Stripe.
- Clearly distinguish example product data from customer proof.
- Remove every false affordance and ensure CTA labels match their destinations.
- Meet WCAG AA contrast and keyboard requirements.
- Shorten the mobile journey through progressive disclosure and narrative compression.
- Create a recognizably modern Dunlo marketing identity without generic fintech or AI decoration.
- Preserve analytics, SEO metadata, semantic content, and existing public acquisition routes.

## Non-Goals

- Changing the authenticated product, Stripe integration, email-provider implementation, or database.
- Introducing new customer metrics or testimonials before approval.
- Adding a CMS or remote content source.
- Changing beta pricing or adding billing logic.
- Positioning Dunlo as a broad payment-operations, lifecycle, AI-agent, or finance-suite platform.
- Rebuilding all marketing and SEO pages in the new visual language during this implementation. The homepage and shared global tokens are the scope; other pages may inherit typography/token improvements but are not individually redesigned.

## Information Architecture

The homepage follows a trust-first narrative. Resources no longer interrupt the product story near the top.

### 1. Navigation

Use a straight, compact header rather than a large floating pill. Desktop navigation contains Product, Trust, Pricing, Sign in, and one primary Start free CTA. Mobile keeps logo, Sign in, Start free, and an accessible menu for section links.

The header remains sticky but must not hide anchored headings. Every touch target is at least 44 px on mobile.

### 2. Hero: Outcome, Mechanism, Product Evidence

The hero uses the approved headline and supporting copy. It has only two actions:

- Primary: **Start free in beta** → signup.
- Secondary: **See how Dunlo works** → the first product-mechanism section.

The product preview shows three representative cases:

- Expired card → customer action / secure update link.
- Insufficient funds → wait / retry timing.
- High-value account → founder review.

The preview is explicitly labeled **Example data**. It contains no focusable or clickable controls unless they change visible state. Static preview actions use text/status elements, not buttons.

The preview must fit at 1280–1440 px without clipping. On mobile, show a compact summary of the three cases rather than the full desktop composition.

### 3. Trust Strip

Place a four-part trust strip directly below the hero:

- Stripe OAuth — no Stripe credentials shared with Dunlo.
- No card storage — payment updates remain in Stripe-hosted flows.
- Founder control — sensitive accounts can pause for review.
- Free in beta — no recovered-revenue cut during the beta.

Each item must link or anchor to supporting detail where appropriate. The strip replaces unavailable customer logos; it must not imitate a logo wall.

### 4. Why Payment Failures Need Different Responses

Replace the generic feature-card grid with one structured comparison. Explain each case in plain language before showing the Stripe term:

- The card expired.
- The customer may need time before another retry.
- The bank needs the customer to approve the payment.
- The bank gave no useful reason and the account may need review.

Each row maps the customer situation to the recovery message and next action. Technical codes appear as supporting detail, not the primary label.

### 5. Founder Safeguard

This is the page's emotional peak. It shows that Dunlo automates routine recovery but preserves human judgment for valuable or sensitive accounts.

The section contains one genuine interactive example at most. If interaction is retained, selecting a case updates the visible draft and status with clear feedback. Otherwise, render it as an explicitly labeled product preview with no buttons.

The copy must avoid implying that AI independently decides or sends sensitive communication. Dunlo prepares context and a draft; the founder controls the outcome.

### 6. How Dunlo Works

Present a compact three-step sequence:

1. Connect Stripe using OAuth.
2. Match the failure context to the right recovery message and timing.
3. Track the result or pause for founder review.

Do not autoplay tabs. User-selected steps may update one product visualization, with visible selected state and keyboard support. On mobile, the steps become a simple vertical sequence.

### 7. ROI Estimate

Keep the calculator because it provides useful self-qualification. Compress its surrounding UI and reduce nested cards.

Required changes:

- Label the result as an estimate.
- Keep the 5% failed-payment and 63% recoverability assumptions visible.
- Link to the public benchmark or methodology for the assumptions.
- Use a CTA that describes the signup destination, such as **Start measuring failed payments** rather than **See my benchmark** if it opens signup.
- Preserve keyboard operation and `aria-live` updates.

### 8. Honest Proof and Founder Accountability

Reuse and redesign `PublicProofLayer` rather than rendering synthetic testimonials or a "waiting for testimonials" sales block.

This section contains:

- What can be verified today: public benchmark assumptions, failure-code methodology, and proof publication policy.
- What is intentionally not claimed: anonymous uplift, synthetic logos, or unapproved customer stories.
- A compact founder block using the real Mathieu image and existing public profiles.

The section should be confident, not apologetic. Beta transparency is presented as a product principle.

### 9. Pricing and FAQ

Keep a single beta plan. Use dark text on the bright green CTA. Explicitly state:

- Free during beta.
- No recovered-revenue percentage during beta.
- What happens when beta pricing changes will be communicated before billing.

The FAQ should cover Stripe Smart Retries, message quality, OAuth/data access, card storage, beta pricing, and whether sensitive accounts can require founder review.

### 10. Final CTA and Resources

The final CTA repeats the approved customer-trust promise in a shorter form and links to signup.

Move homepage resource links below the final CTA or into a compact pre-footer library. They support SEO and advanced visitors without interrupting the primary conversion narrative.

## Visual System

### Typography

Replace Outfit on the marketing app with Geist, loaded through `next/font/google`. Geist provides a sharper contemporary grotesque while remaining readable for long explanatory content. Retain JetBrains Mono only for real Stripe codes, numeric values, timestamps, and operational states. Do not use monospace for generic section labels.

Display rules:

- Maximum desktop hero size: 72 px.
- Minimum display tracking: `-0.04em`; target `-0.03em`.
- Body size: 16–18 px with 1.55–1.7 line height.
- Body line length: 65–72 characters.
- Use balanced wrapping on headings and pretty wrapping on prose.

### Color

Preserve the Dunlo green as the brand signal. Use it for progress, positive state, selected state, and key visual moments, not as generic decoration.

Required token behavior:

- Bright Dunlo green always uses near-black foreground text.
- Small green text on light surfaces uses a darker accessible token meeting 4.5:1.
- Muted body text meets 4.5:1 on its actual surface.
- Low-opacity text on dark surfaces is strengthened until it meets the appropriate threshold.
- Colors remain defined in `packages/ui/src/styles/globals.css`; components use semantic utilities and never hardcode brand hex values.

The page uses a restrained palette: neutral ground, near-black ink, system lines, and Dunlo green. No gradient text, decorative neon, or broad fintech-blue/purple gradients.

### Shape and Layout

- Standard card and section radius: 12–16 px maximum.
- Full pills remain valid for CTA buttons and compact statuses.
- Remove decorative two-axis grid backgrounds.
- Avoid border plus large soft shadow on the same element.
- Prefer ruled sections, full-width dividers, and asymmetric editorial/product compositions over repeated card grids.
- Use generous whitespace and variable section rhythm; do not apply an identical vertical template to every section.

### Motion

Motion expresses product state:

- failed → message prepared → founder review or customer action → recovered.
- Hover and focus transitions use 150–250 ms ease-out curves.
- No permanent floating animation.
- No content is hidden by default waiting for an entrance animation.
- `prefers-reduced-motion` preserves all content and state without motion.

## Component Architecture

`LandingPage` remains the composition root but should stop owning large section implementations inline.

Recommended component boundaries:

- `landing/nav.tsx` — desktop and mobile navigation.
- `landing/payment-recovery-hero.tsx` — approved hero copy and static example preview.
- `landing/trust-strip.tsx` — OAuth, card storage, founder control, beta terms.
- `landing/failure-response-map.tsx` — plain-language failure cases and recovery actions.
- `landing/escalation.tsx` — founder safeguard, simplified and made interaction-accurate.
- `landing/how-it-works.tsx` — three user-controlled steps, no autoplay.
- `landing/roi-calculator.tsx` — compact accessible calculator with methodology link.
- `public-proof-layer.tsx` — transparent proof policy and verifiable sources.
- `landing/built-by-mathieu.tsx` — compact founder accountability block.
- `landing/pricing.tsx`, `landing/faq.tsx`, and `landing/final-cta.tsx` — extracted from the current monolithic file when doing so reduces complexity.
- `landing/resource-library.tsx` — compact pre-footer resource links.

Shared section primitives should be introduced only when at least two sections genuinely share structure. Do not create a generic card abstraction that forces visual sameness.

## Data and Interaction Flow

- Product preview data remains static and local to the marketing app. Every fictional company, amount, or status is labeled as example data.
- Approved testimonials continue to flow through `BETA_TESTIMONIALS` and its existing publication filter. An empty collection renders no testimonial claim.
- CTA tracking continues through `TrackedLink` and existing PostHog event names/properties.
- The ROI calculator remains client-side and does not send financial inputs to a backend.
- No new API, database table, authentication state, or Stripe permission is introduced.
- Mobile navigation state is local and must close after navigation or Escape.

## Error and Edge-Case Behavior

- No interactive element may silently do nothing.
- CTA text must identify whether it opens signup, an internal section, or a public resource.
- The ROI range input remains usable with keyboard and touch, with a visible focus state.
- Long company names, failure labels, and translated copy must wrap or truncate intentionally without hiding the recovery action.
- The page must remain understandable when JavaScript is slow or disabled; static content and links still render server-side.
- Animation failure or reduced-motion mode must not hide content.
- Missing founder image must preserve layout and accessible name.
- No customer-proof section renders unless the publication rules pass.

## Responsive Behavior

Required verification widths: 390, 768, 1024, 1280, and 1440 px.

Mobile behavior:

- No horizontal overflow.
- Primary and secondary hero CTAs stack and remain at least 44 px tall.
- Navigation exposes section links through an accessible control.
- Complex desktop previews become compact summaries or semantic disclosure blocks.
- Pricing and trust content appear earlier in scroll than on the current 11,420 px page.
- Body copy is never smaller than 14 px; important explanatory copy remains 16 px.
- Footer links receive adequate touch spacing without turning every inline link into a large button.

## Accessibility Requirements

- WCAG AA contrast for all text and controls.
- Visible `:focus-visible` state with at least 3:1 component contrast.
- Logical heading hierarchy with one `h1`.
- All icons that do not add meaning are `aria-hidden`.
- All meaningful images have descriptive alt text.
- Interactive tabs, menus, details, and range controls work by keyboard.
- Touch targets are at least 44×44 px for primary mobile actions and controls.
- Status changes use `aria-live` only when the user triggers them; decorative preview changes do not create screen-reader noise.

## Performance and SEO

- Preserve current metadata, JSON-LD, canonical URLs, sitemap behavior, and FAQ structured data.
- Avoid adding large hero video, WebGL, or heavy raster assets.
- Use CSS and lightweight DOM structure for the visual recovery flow.
- Retain `next/font` optimization and `display: swap`.
- Keep client components limited to genuinely interactive sections: navigation, how-it-works, calculator, analytics links, and any approved escalation interaction.
- Remove dead commented landing sections and unused imports once the new composition is complete.

## Verification Plan

1. Run focused unit tests for beta testimonial publication and any extracted pure helpers.
2. Run `bun run check-types`.
3. Run the marketing production build.
4. Run the Impeccable detector on the landing source; treat its output as defect evidence, not design approval.
5. Inspect the running homepage at 390, 768, 1024, 1280, and 1440 px.
6. Verify no horizontal overflow or hero clipping.
7. Traverse all interactive controls by keyboard and confirm visible focus and accurate state changes.
8. Measure contrast for CTA text, small green labels, muted text, and dark-panel metadata.
9. Confirm every fictional value is labeled as example data and no unapproved proof is rendered.
10. Confirm every CTA destination matches its label and analytics location.
11. Verify reduced-motion mode and initial rendering without waiting for animations.
12. Re-run `$impeccable critique` and compare the result with the 23/40 baseline.

## Implementation Order

The implementation must address functional trust issues before visual polish:

1. Content truth and proof labeling.
2. Interaction semantics and CTA accuracy.
3. Color tokens and contrast.
4. Mobile navigation, progressive disclosure, target sizes, and clipping.
5. Typography, layout, shape, and motion redesign.
6. Cleanup, build, browser verification, and final critique.

## Acceptance Criteria

- The homepage uses the approved customer-trust headline.
- No instance of the rejected design metaphor appears in user-facing or design-system copy.
- All simulated product data is clearly labeled.
- No inert button exists.
- All bright-green buttons use accessible dark text.
- The homepage has a working mobile navigation.
- The first viewport combines product evidence with trust information.
- The resource library no longer interrupts the main product narrative.
- The page no longer uses decorative grid backgrounds or 32 px card radii.
- The marketing typography no longer uses Outfit.
- The layout passes all specified viewport, keyboard, contrast, reduced-motion, type-check, and build checks.
