# Product Marketing Context

*Last updated: 2026-06-19*

## Product Overview
**One-liner:** Dunlo helps Stripe-first SaaS founders recover failed payments before they become involuntary churn.

**What it does:** Dunlo monitors Stripe payment failures, reads the failure context, sends recovery emails matched to the reason, routes customers to Stripe-hosted update flows, flags high-value accounts for founder review, and tracks recovered revenue. It is built as a focused recovery layer around Stripe, not as a replacement billing suite.

**Product category:** Stripe payment recovery software, dunning software, involuntary churn reduction.

**Product type:** B2B SaaS.

**Business model:** Free during beta until July 31, 2026. Planned post-beta pricing is flat monthly SaaS pricing by MRR range, starting at $19/month, with no recovered-revenue percentage.

## Target Audience
**Target companies:** SaaS companies using Stripe Billing, especially founder-led and small teams around $5k-$80k MRR.

**Decision-makers:** Founder, indie hacker, technical founder, head of growth, finance/operator at a small SaaS company.

**Primary use case:** Recover failed Stripe payments that would otherwise become silent involuntary churn.

**Jobs to be done:**
- Understand how much MRR is leaking through failed payments.
- Send customer-friendly recovery emails without building custom Stripe webhook workflows.
- Escalate valuable accounts before automation becomes noisy or impersonal.

**Use cases:**
- Replace generic Stripe failed-payment emails with failure-code-specific recovery messages.
- Add a lightweight dunning workflow without migrating to a broader billing or retention platform.
- Benchmark failed-payment leakage before connecting Stripe.
- Give founders visibility into MRR at risk, recovery status, and high-value failed payments.

## Personas
| Persona | Cares about | Challenge | Value we promise |
|---------|-------------|-----------|------------------|
| Founder / owner | Revenue, customer trust, speed to setup | Failed payments are invisible until churn shows up | Recover revenue with a 5-minute Stripe-first workflow |
| Technical founder | Avoiding maintenance burden | Custom webhook and email logic becomes brittle | Use a focused recovery layer instead of maintaining bespoke dunning code |
| Operator / growth lead | Funnel visibility and measurable recovery | Payment failures are mixed into generic churn reporting | Track failed MRR, recovered MRR, recovery rate, and accounts at risk |
| Finance-minded buyer | Pricing predictability | Revenue-share recovery tools can feel expensive | Flat pricing with no recovered-revenue percentage |

## Problems & Pain Points
**Core problem:** Good customers disappear because payments fail, not because they decided to cancel.

**Why alternatives fall short:**
- Stripe Smart Retries optimizes retry timing but does not provide a full customer-facing recovery workflow.
- Generic failed-payment emails ignore the reason the payment failed.
- Building custom webhooks, email sequences, retry logic, and dashboards creates maintenance work.
- Larger billing or retention suites are often too broad, expensive, or operationally heavy for small Stripe-first teams.

**What it costs them:** Lost MRR, overstated churn, founder stress, unnecessary support follow-up, and missed opportunities to save accounts that still want the product.

**Emotional tension:** Founders worry that a quiet billing issue is being mistaken for product churn, and that clumsy payment emails will damage customer trust.

## Competitive Landscape
**Direct:** Churn Buster, RetryFix, Stunning, RecoverIQ, Recurly Recover, Paddle Retain, FlyCode, Slicker, Revaly/FlexPay.

**Secondary:** Stripe Smart Retries, Stripe customer emails, custom Stripe webhooks, Loops or lifecycle email tools used for dunning.

**Indirect:** Broader billing and retention platforms such as Chargebee, Churnkey, Baremetrics Recover, ProfitWell/Paddle Retain, RevenueCat for mobile subscription contexts.

## Differentiation
**Key differentiators:**
- Stripe-first focus instead of broad billing migration.
- Failure-code-specific recovery emails.
- Stripe-hosted payment update links.
- Founder escalation drafts for valuable or sensitive accounts.
- Flat pricing direction with no recovered-revenue cut.
- Public engineering-as-marketing tools: benchmark, audit, dunning schedule calculator, comparison pages, and LLM-readable pricing/context.

**How we do it differently:** Dunlo sits around Stripe Billing as a narrow recovery workflow. It turns Stripe failure context into clear customer messaging, recovery timing, escalation, and reporting.

**Why that's better:** Small SaaS teams get most of the recovery discipline they need without paying for, migrating to, or configuring a larger finance or retention suite.

**Why customers choose us:** They use Stripe, want to stay on Stripe, and need a focused payment recovery layer that feels founder-friendly and customer-safe.

## Objections
| Objection | Response |
|-----------|----------|
| Is this just Stripe Smart Retries? | No. Stripe retries cards; Dunlo handles customer-facing recovery, failure-aware messaging, founder escalation, and recovered-revenue reporting. |
| Will this annoy customers? | Dunlo emphasizes plain, specific, customer-safe copy and lets high-value or sensitive accounts pause for founder review. |
| Why not build this ourselves? | Custom webhook, email, retry, update-link, and reporting logic takes engineering time and ongoing maintenance. |
| Is beta too early to trust? | Beta is free, Stripe-hosted card update flows keep card data in Stripe, and public proof is approval-gated. |
| Why not use a larger dunning suite? | Use one when you need a broader billing or retention platform. Dunlo is for teams that want focused Stripe recovery first. |

**Anti-persona:** Companies needing multi-gateway payment orchestration, full billing migration, enterprise retention suites, cancellation-save platforms, or mobile subscription recovery outside Stripe-first SaaS.

## Switching Dynamics
**Push:** Failed-payment leakage, generic Stripe emails, invisible involuntary churn, custom webhook fatigue, pricing anxiety around revenue-share recovery tools.

**Pull:** Fast Stripe connection, reason-aware emails, founder visibility, simple pricing, no billing migration.

**Habit:** Teams keep using Stripe defaults because failed payments feel like billing noise and not a growth/retention workflow.

**Anxiety:** Sharing Stripe access, sending emails from the product, damaging customer trust, trusting beta software, and proving the recovery upside.

## Customer Language
**How they describe the problem:**
- "A good customer disappears because a card date changed."
- "Stripe retries, but I do not know which customers are actually at risk."
- "I do not want a finance suite. I just want failed payments handled."
- "I do not want to give up a percentage of recovered revenue."

**How they describe us:**
- "Stripe payment recovery."
- "Failure-code emails."
- "A lightweight dunning workflow."
- "Founder escalation for important accounts."

**Words to use:** Stripe-first, failed payments, payment recovery, involuntary churn, dunning, failure code, decline code, recovery email, update payment link, founder escalation, MRR at risk, recovered revenue.

**Words to avoid:** Debt collection language, aggressive dunning, magical AI claims, guaranteed recovery, enterprise finance-suite framing.

**Glossary:**
| Term | Meaning |
|------|---------|
| Failed payment | A Stripe charge or invoice payment attempt that did not collect successfully |
| Failure code / decline code | Stripe's reason signal for why a payment failed |
| Dunning | The workflow for communicating with customers and retrying collection after failed payments |
| Involuntary churn | Churn caused by billing failure rather than customer cancellation |
| Founder escalation | A manual or AI-drafted personal note for high-value or sensitive failed-payment accounts |
| MRR at risk | Recurring revenue attached to unresolved failed payments |

## Brand Voice
**Tone:** Clear, founder-aware, practical, calm.

**Style:** Direct and concrete, with plain-language explanations of Stripe/payment concepts.

**Personality:** Focused, trustworthy, pragmatic, slightly opinionated, customer-safe.

## Proof Points
**Metrics:** Public benchmark assumptions currently use failed-payment rates by MRR range and a conservative recoverability model. Real customer proof should only publish after customer approval.

**Customers:** Beta customer list not yet public.

**Testimonials:** None public yet. The beta proof policy requires recovered payment metric, direct founder quote, public logo approval, and approval date before publishing.

**Value themes:**
| Theme | Proof |
|-------|-------|
| Focus | Stripe-only positioning, no billing migration, narrow recovery workflow |
| Trust | Stripe-hosted update links; Dunlo does not store full card numbers or CVCs |
| Simplicity | Connect Stripe, review sequences, connect email provider, monitor recovery |
| Predictability | Flat pricing direction; no recovered-revenue percentage |
| Customer fit | Pages and content target Stripe-first SaaS founders and small teams |

## Goals
**Business goal:** Convert beta users into validated recovery case studies, then paid users after beta.

**Conversion action:** Create a free beta account and connect Stripe.

**Current metrics:** Unknown from public repo. Priority measurement needs: homepage CTA click-through, benchmark usage, lead capture rate, signup started/completed, Stripe connection rate, email provider configuration rate, first recovered payment, and beta proof approvals.
