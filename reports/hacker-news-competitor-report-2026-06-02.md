# Dunlo Competitor Report from Hacker News Signals

Generated: 2026-06-02

Scope: failed payment recovery, dunning, involuntary churn, Stripe Billing recovery, payment orchestration, subscription billing platforms, and adjacent email/billing infrastructure.

## Executive Summary

The Hacker News landscape strongly validates Dunlo's category, but it does not show a crowded set of direct HN-native competitors. The only direct competitor with a substantial failed-payment-recovery launch on HN is FlyCode. Older HN discussions repeatedly mention Churn Buster and Stunning as the original Stripe dunning tools, while newer comments and Show HN posts show solo founders building simpler Stripe recovery products such as Rekko, WorkAid Dunning, and Rebill.

The real competitive field is broader than HN mentions alone:

- Direct failed-payment recovery platforms: FlyCode, Churn Buster, Baremetrics Recover, ChurnKey Payment Recovery, Revive, RetryFix, PayCircuit, Recoupt, ChurnRecover.
- Subscription billing platforms with built-in dunning: Stripe Billing, Paddle Retain, Recurly, Chargebee.
- Payment performance/orchestration platforms: Revaly/FlexPay, Gr4vy, Adyen/Solidgate-style orchestration.
- Adjacent messaging/infrastructure: Loops, Customer.io, Klaviyo, custom webhook-based recovery flows.

The main opportunity for Dunlo is to own a narrower wedge:

> Stripe-first failed-payment recovery for early SaaS founders who want visibility, better recovery emails, and clear pricing without enterprise setup or recovered-revenue fees.

## Research Method

I searched Hacker News through Algolia for product names and category terms including:

- failed payment recovery
- payment recovery SaaS
- dunning SaaS
- involuntary churn
- Stripe failed payments
- Stripe Smart Retries
- subscription dunning
- FlyCode
- Churn Buster
- Stunning
- Baremetrics Recover
- ProfitWell Retain
- Paddle Retain
- Chargebee dunning
- Recurly dunning
- FlexPay
- Butter Payments
- Gr4vy
- Rekko
- WorkAid Dunning
- Stripe Billing
- Autumn
- Loops

Raw HN result set: 321 deduplicated HN stories/comments across the search batch. Many were false positives because words like "recovery", "retain", "gravy", and "stunning" are noisy. The analysis below emphasizes relevant mentions.

## Market Map

| Segment | Competitors | Threat Level | Why It Matters |
|---|---|---:|---|
| Direct failed-payment recovery | FlyCode, Churn Buster, Baremetrics Recover, ChurnKey, Revive, RetryFix, PayCircuit, Recoupt | High | These sell the same outcome Dunlo sells: recover failed subscription payments. |
| Legacy Stripe dunning | Churn Buster, Stunning | Medium | Strong historical credibility, but some feel older or broader than Dunlo's founder wedge. |
| Billing platforms | Stripe Billing, Paddle Retain, Recurly, Chargebee | High | Customers may decide native dunning is "good enough." |
| Payment performance / orchestration | Revaly/FlexPay, Gr4vy, Adyen, Solidgate | Medium | More enterprise, more technical, but can own the "higher authorization rate" narrative. |
| Email/workflow platforms | Loops, Customer.io, Klaviyo, Zapier/custom webhooks | Medium | DIY alternative for technical founders. |
| Indie/new tools | Rekko, WorkAid Dunning, Rebill, RetryFix, Revive | Medium | Validate demand at the low end and may copy Dunlo's positioning. |

## HN Signal Ranking

| Competitor | HN Signal | Notes |
|---|---:|---|
| FlyCode | Very high | 2024 Launch HN had 103 points and 66 comments. 2025 Show HN around backup payment method had 22 points and 38 comments. |
| Churn Buster | High historical | Mentioned in 2014 Ask HN and expired-card discussions. Had an acquisition post in 2015. |
| Stunning | Medium historical | Mentioned alongside Churn Buster as an original Stripe dunning option. |
| Stripe Billing | High platform | Stripe Billing launch had major HN attention, and comments explicitly asked whether Stripe makes tools like Stunning redundant. |
| Autumn | Medium adjacent | Strong HN launch for open-source Stripe infra. Failed payments are one part of the broader billing-infra pitch. |
| Rekko | Low but direct | Tiny HN posts in 2026, but directly Stripe failed-payment recovery with SMS/email. |
| Baremetrics Recover | Low direct | HN mention exists, but little discussion. Stronger brand outside HN. |
| Recurly / Chargebee | Low specific HN, high market | HN discussions mention them in billing-platform evaluation, not as focused payment recovery tools. |
| Paddle Retain / ProfitWell | Low specific HN, high market | Low direct HN signal, but important because Paddle owns ProfitWell and Retain inside a Merchant of Record platform. |
| Revaly/FlexPay / Gr4vy | Low HN, high enterprise | Payment-performance narrative is strong outside HN. |

## Competitor Profiles

### 1. FlyCode

Website: https://www.flycode.com/

HN sources:

- https://news.ycombinator.com/item?id=41994658
- https://news.ycombinator.com/item?id=45348730

Positioning:

FlyCode positions itself as an AI-powered failed-payment recovery and payment intelligence layer for subscription businesses. It targets B2B SaaS, B2C SaaS, DTC subscription brands, CFOs, finance teams, billing leaders, and retention teams.

What they emphasize:

- AI-powered smart retries.
- Decisioning models using hundreds of data points.
- Coordination of retries with email/SMS.
- Stripe and Shopify apps.
- Visa and Stripe marketplace credibility.
- Backup payment method recovery using alternate cards on file.
- Broader payment-stack integrations and payment routing.

HN sentiment:

FlyCode got the most relevant HN attention by far. The 2024 Launch HN framed failed payments as a black-box revenue problem. Comments surfaced two important objections: some HN users saw aggressive recovery as ethically questionable, while others argued that customers often still want access and simply need a proper recovery path. Another thread questioned whether this should be a standalone business or a Stripe feature.

Threat to Dunlo:

Very high for social proof, enterprise credibility, and category ownership. FlyCode has the "serious payments team" aura that Dunlo cannot fake yet.

Dunlo opportunity:

Do not fight FlyCode on enterprise sophistication. Position against complexity and revenue-share economics:

> FlyCode is for payment teams. Dunlo is for Stripe-first SaaS founders.

### 2. Churn Buster

Website: https://churnbuster.io/

HN sources:

- https://news.ycombinator.com/item?id=8464145
- https://news.ycombinator.com/item?id=8530470
- https://news.ycombinator.com/item?id=10502239

Positioning:

Churn Buster is a long-running retention platform focused on passive churn and active churn. It now markets advanced dunning, cancel flows, strategic guidance, concierge setup, and integrations across Stripe, Shopify, Recharge, Loop, Skio, Smartrr, and more.

What they emphasize:

- 10+ years of subscription churn expertise.
- Dunning plus cancellation prevention.
- Adaptive retry logic.
- Strategic retention partnership.
- eCommerce and B2B SaaS.
- Transparent attribution and account reviews.

HN sentiment:

HN treated Churn Buster as one of the original serious answers to "who helps recover customers with failed payments?" Patrick McKenzie pointed people to Churn Buster and Stunning in 2014. The category has been around for more than a decade.

Threat to Dunlo:

High for credibility, lower for early SaaS self-serve. Churn Buster feels more mature, consultative, and subscription-brand oriented.

Dunlo opportunity:

Position as simpler and Stripe-first:

> Churn Buster is a retention partner. Dunlo is the focused Stripe recovery layer you can set up before you need a retention team.

### 3. Stunning

Website: historically bestunning.net / stunning.co

HN sources:

- https://news.ycombinator.com/item?id=8464145
- https://news.ycombinator.com/item?id=8530470
- https://news.ycombinator.com/item?id=5103774

Positioning:

Stunning was one of the early Stripe dunning tools: failed-payment emails, notifications, receipts, and recovery workflows.

HN sentiment:

Stunning appears in HN as an early category reference. It is not driving recent HN conversation, but its existence proves the problem is old and persistent.

Threat to Dunlo:

Medium as a legacy alternative, lower as a modern marketing competitor.

Dunlo opportunity:

Use "modern Stripe-native recovery" language. The market knows old dunning exists; Dunlo can argue the old generation is too generic and email-centric.

### 4. Baremetrics Recover

Website: https://baremetrics.com/pricing

HN source:

- https://news.ycombinator.com/item?id=14032043

Positioning:

Baremetrics Recover is attached to the broader Baremetrics subscription analytics suite. It focuses on automated failed-payment recovery, billing pages, credit-card capture, widgets, and recovery campaigns.

What they emphasize:

- Recover as part of subscription analytics.
- Stripe-focused setup.
- Hosted billing/update pages.
- Automated personalized drip campaigns.
- ROI guarantee messaging on pricing.

HN sentiment:

Direct HN discussion is weak. Baremetrics has brand awareness in SaaS analytics, but Recover did not produce major HN conversation.

Threat to Dunlo:

Medium. Strong SaaS brand, but heavier and less focused than a dedicated Stripe recovery product.

Dunlo opportunity:

Compete on focus and pricing:

> Baremetrics is analytics with recovery. Dunlo is recovery built around failed-payment workflows first.

### 5. ChurnKey Payment Recovery

Website/docs: https://docs.churnkey.co/failed-payment-recovery/payment-recovery/

Positioning:

ChurnKey is broader churn management: cancellation flows, surveys, offers, and failed-payment recovery. Their payment recovery docs emphasize automated email campaigns, recovery dashboards, advanced settings, analytics, email/SMS, update pages, and Stripe settings.

HN signal:

Low direct HN signal in my search, but high competitive relevance. ChurnKey appears often in broader SaaS chatter outside HN.

Threat to Dunlo:

High in the "retention suite" category. It can bundle active and passive churn into one platform.

Dunlo opportunity:

Frame Dunlo as narrower and easier:

> If your immediate leak is failed Stripe payments, you do not need a full cancellation platform.

### 6. Stripe Billing / Stripe Revenue Recovery

Website/docs:

- https://stripe.com/en-US/billing
- https://docs.stripe.com/billing/revenue-recovery

HN source:

- https://news.ycombinator.com/item?id=16766846

Positioning:

Stripe Billing includes native revenue recovery: Smart Retries, custom retry schedules, revenue recovery automations, hosted payment method updates, failed-payment emails, recovery analytics, and card network updater support.

HN sentiment:

Stripe Billing is the biggest platform threat. In the Stripe Billing HN thread, a commenter explicitly asked how Stripe auto-recovery compares to Stunning and whether it makes tools like that redundant. Stripe's response framed ecosystem recovery tools as complementary.

Threat to Dunlo:

Very high. Most Dunlo prospects will ask "why not just use Stripe?"

Dunlo opportunity:

This should be Dunlo's core objection-handling page:

> Stripe gives you the recovery primitives. Dunlo gives you the founder dashboard, failure-code context, better sequences, and revenue visibility.

### 7. Paddle Retain / ProfitWell Retain

Docs: https://www.paddle.com/help/profitwell-metrics/retain/how-it-works/retain-payment-recovery-how-it-works-retry-cadence

Positioning:

Retain is Paddle's payment recovery system for Paddle Billing and Paddle Classic. It combines algorithmic retries, dunning emails, and in-app notifications.

What they emphasize:

- Automatic recovery after subscription renewal failure.
- Algorithmic retry timing based on decline reason, card type, buyer location, and other signals.
- Up to 4 recovery emails.
- In-app payment update prompts.
- Default dunning window around 30 days.

HN signal:

Low direct HN signal in this search. Market relevance remains high because Paddle is a major SaaS Merchant of Record.

Threat to Dunlo:

High for companies already using Paddle or considering MoR.

Dunlo opportunity:

Stripe-native angle:

> Dunlo is for founders who want to stay on Stripe and improve recovery without moving billing or becoming dependent on an MoR.

### 8. Recurly

Website/docs:

- https://recurly.com/product/recover/
- https://docs.recurly.com/recurly-subscriptions/docs/dunning-summary

HN sources:

- https://news.ycombinator.com/item?id=41861473
- https://news.ycombinator.com/item?id=20996650

Positioning:

Recurly is a subscription billing platform with mature dunning and recovery dashboards. Its recovery stack includes Account Updater, customer dunning prompts, intelligent retries, and analytics.

HN sentiment:

HN discussions frame Recurly as a billing-platform choice, not a point solution. One Ask HN compared Stripe, Chargebee, and Recurly. Another older thread discussed migrating away from Recurly to Stripe Billing, with concerns about cost and complexity.

Threat to Dunlo:

Medium-high for larger subscription businesses, low for early Stripe-first SaaS.

Dunlo opportunity:

Avoid being compared as billing infrastructure. Dunlo should say:

> Keep Stripe Billing. Add recovery visibility and workflows.

### 9. Chargebee

Docs:

- https://www.chargebee.com/docs/payments/2.0/dunning/dunning-v2

HN source:

- https://news.ycombinator.com/item?id=41861473

Positioning:

Chargebee is subscription and revenue-growth management with built-in dunning. Its dunning docs cover retries, failed-payment emails, subscription status actions, and rules for cards/e-wallets/direct debit.

Threat to Dunlo:

Medium-high for SaaS teams already evaluating billing platforms.

Dunlo opportunity:

Dunlo should not fight Chargebee as a billing platform. The right message:

> If you already run on Stripe, do not migrate billing just to improve failed-payment recovery.

### 10. Revaly / FlexPay

Docs:

- https://docs.revaly.co/docs/overview

Positioning:

FlexPay appears to have become Revaly. The current docs position Revaly as a Payment Performance Management platform that prevents payment failures before they happen and recovers revenue intelligently after unavoidable failures.

What they emphasize:

- Direct issuer and payment ecosystem intelligence.
- Prevention-first optimization.
- Intelligent recovery strategies.
- CRM and payment gateway integrations.
- More enterprise payment-performance language than dunning language.

HN signal:

No meaningful direct HN signal in the search set.

Threat to Dunlo:

Medium. More enterprise and infrastructure-heavy, but strong narrative around "payment failures are an approval/performance problem, not just a messaging problem."

Dunlo opportunity:

For early SaaS, Revaly/FlexPay may feel too big. Dunlo can own the practical founder use case.

### 11. Gr4vy

Website:

- https://gr4vy.com/

Positioning:

Gr4vy is a payment orchestration platform. It focuses on routing, PSP abstraction, payment methods, retries, failover routing, and authorization-rate optimization.

HN signal:

Low in the failed-payment-specific HN search. It appeared mainly through hiring and unrelated mentions.

Threat to Dunlo:

Medium for larger merchants with multiple PSPs. Low for Stripe-only early SaaS founders.

Dunlo opportunity:

Position away from orchestration complexity:

> If you only use Stripe, you do not need payment orchestration to fix basic failed-payment leakage.

### 12. Autumn

Website/HN:

- https://news.ycombinator.com/item?id=44365620
- https://useautumn.com/

Positioning:

Autumn is open-source infrastructure over Stripe for pricing, entitlements, payments, upgrades, downgrades, and billing state. Failed payments are part of the broader billing-infra story.

HN sentiment:

Autumn had a strong Show HN in 2025. HN comments liked the open-source and Stripe-infra angle, and compared it to Lago.

Threat to Dunlo:

Medium as an adjacent founder-infra product. If Autumn adds a strong recovery module, it could absorb part of Dunlo's early-stage audience.

Dunlo opportunity:

Dunlo can integrate with products like Autumn or position as a specialized layer:

> Use Autumn to manage pricing and entitlements; use Dunlo to recover failed payments.

### 13. Loops and Email Platforms

HN source:

- https://news.ycombinator.com/item?id=37596253

Positioning:

Loops is not a payment recovery competitor, but it is an important DIY substitute. Its HN launch explicitly mentions that revenue teams can use it for dunning.

Threat to Dunlo:

Medium. Technical founders may wire Stripe webhooks into Loops, Customer.io, Resend, Postmark, or Klaviyo and build their own dunning.

Dunlo opportunity:

Say that generic email tools do not solve recovery attribution, failure-code segmentation, retry context, or revenue reporting.

### 14. Rekko

HN sources:

- https://news.ycombinator.com/item?id=46752628
- https://news.ycombinator.com/item?id=46763898

Positioning:

Rekko is a small Stripe app for failed subscription payment recovery with automated SMS/email. The founder framed the pain as manually chasing failed payments and Stripe's built-in emails having low recovery.

Threat to Dunlo:

Low today, but strategically meaningful. It validates the same "small SaaS founder" wedge.

Dunlo opportunity:

Move faster on proof, polish, and SEO so Dunlo becomes the obvious low-end Stripe recovery option.

### 15. WorkAid Dunning

HN source:

- https://news.ycombinator.com/item?id=47427516

Positioning:

WorkAid Dunning was posted as a small tool that connects to Stripe, detects failed payments, sends recovery emails, tracks recovery performance, supports Stripe Connect platforms, and provides analytics dashboards.

Threat to Dunlo:

Low, but this is extremely close to Dunlo's stated product surface. It is a signal that other solo builders see the same opportunity.

Dunlo opportunity:

Differentiate on brand, data, copy quality, Stripe-specific expertise, and founder trust.

### 16. Rebill

HN source:

- https://news.ycombinator.com/item?id=47219667

Positioning:

Rebill appeared in an HN hiring thread as "failed payment recovery for SaaS." There is not enough signal to profile deeply.

Threat to Dunlo:

Low but worth monitoring.

### 17. ProfitKit

HN source:

- https://news.ycombinator.com/item?id=19106238

Positioning:

ProfitKit was a Stripe subscriptions management tool with calendar events, notifications, revenue metrics, and automated failed-payment emails.

Threat to Dunlo:

Low current threat, useful historical signal. It shows that Stripe subscription management products often expand into failed-payment recovery.

## What HN Reveals About Buyer Psychology

### 1. People understand the pain, but they distrust aggressive recovery

FlyCode's HN threads show a split:

- Business owners understand failed payments are often accidental.
- HN users worry about unethical subscription behavior, especially if recovery feels like stealth collection.

Dunlo implication:

Make ethics part of the brand:

- "Polite recovery."
- "No dark-pattern dunning."
- "Recover customers who still want access."
- "Clear cancellation and update paths."
- "Do not treat failed payments like debt collection."

### 2. "Why is this not just a Stripe feature?" is the core objection

HN commenters asked whether Stripe would build this or already has incentives to maximize recovery.

Dunlo implication:

Create content around:

- "Stripe Smart Retries vs Dunlo"
- "When Stripe's default recovery is enough"
- "What Stripe does not show you about failed-payment leakage"
- "How to audit failed-payment recovery in Stripe"

### 3. Early founders want simplicity and visibility

Small HN projects and comments repeatedly mention:

- Stripe's emails feel insufficient.
- Failed-payment visibility is weak.
- Founders do not know how much revenue is lost.
- Manual chasing is annoying.
- Generic emails are ignored.

Dunlo implication:

Lead with the dashboard and audit:

> See how much Stripe failed-payment revenue you are losing before writing a single workflow.

### 4. HN likes technical credibility

FlyCode's strongest HN pitch was technical: error codes, issuer behavior, retry timing, metadata, network rules, compliance. HN wants to know the mechanism.

Dunlo implication:

Do not only say "automated emails." Explain:

- How failure codes change copy and timing.
- Why "insufficient funds" differs from "expired card."
- What Stripe Smart Retries do and do not do.
- How Dunlo avoids excessive retries.

## Positioning Gaps Dunlo Can Own

### Gap 1: Stripe-first, not payment-stack-first

FlyCode, Revaly, and Gr4vy increasingly talk about payment stacks, routing, issuers, networks, PSPs, and enterprise payment intelligence. That is credible, but too much for many founders.

Dunlo position:

> Built for SaaS founders who run on Stripe and want failed-payment recovery fixed this week.

### Gap 2: Ethical recovery

HN has a strong sensitivity to subscription dark patterns. Most competitors do not lead with ethical recovery.

Dunlo position:

> Recover good customers without turning failed payments into a hostile collections workflow.

### Gap 3: No revenue-share tax

Competitors often use recovered-revenue share, custom pricing, or broader platform pricing. Dunlo can make transparent pricing a major wedge.

Dunlo position:

> Keep the revenue you recover. Dunlo is fixed-price.

### Gap 4: Failure-code-specific content

HN comments specifically pointed out that failed-payment emails often hide useful error context.

Dunlo position:

> Different failure reasons need different recovery playbooks.

### Gap 5: Founder-scale recovery benchmarks

Most public benchmarks are enterprise or generic. Dunlo can own early SaaS benchmarks by MRR band.

Dunlo position:

> What failed payments look like for Stripe SaaS between $5k and $80k MRR.

## Recommended Competitor Pages

Priority 1:

1. Dunlo vs FlyCode
2. Dunlo vs Stripe Smart Retries
3. Dunlo vs Churn Buster
4. Dunlo vs Baremetrics Recover
5. Dunlo vs ChurnKey Payment Recovery

Priority 2:

1. Dunlo vs Paddle Retain
2. Dunlo vs Recurly Recover
3. Dunlo vs Chargebee Dunning
4. Dunlo vs Revive
5. Dunlo vs RetryFix

Priority 3:

1. Dunlo vs Gr4vy
2. Dunlo vs Revaly/FlexPay
3. Dunlo vs Loops for dunning
4. Dunlo vs custom Stripe webhooks

## SEO and Content Opportunities

### Bottom-funnel comparison keywords

- flycode alternative
- churn buster alternative
- baremetrics recover alternative
- churnkey payment recovery alternative
- stripe smart retries alternative
- stripe dunning tool
- stripe failed payment recovery software
- failed payment recovery for SaaS
- involuntary churn software

### Middle-funnel educational keywords

- Stripe failed payment emails
- Stripe Smart Retries explained
- Stripe dunning best practices
- failed payment recovery emails
- involuntary churn benchmarks
- Stripe decline codes for SaaS
- how much MRR lost to failed payments
- failed payments vs churn

### HN-shaped content angles

- "Failed payment recovery is not debt collection"
- "When not to retry a failed payment"
- "What Stripe Smart Retries actually solve"
- "The ethics of dunning emails for SaaS"
- "Why your MRR dashboard hides involuntary churn"

## Strategic Recommendations

### This week

1. Publish a "Stripe Smart Retries vs Dunlo" page.
2. Publish a "Dunlo vs FlyCode" page using careful, source-backed claims.
3. Add ethical recovery copy to Dunlo's homepage or FAQ.
4. Add a failed-payment audit CTA: "Connect Stripe and see your lost revenue."
5. Start collecting beta proof: recovery rate, recovered MRR, failed-payment count, time to recovery.

### This month

1. Build a competitor comparison hub.
2. Create a "Stripe failed-payment benchmark for SaaS founders" report.
3. Write 5 failure-code-specific posts:
   - insufficient_funds
   - expired_card
   - do_not_honor
   - authentication_required
   - card_velocity_exceeded
4. Create templates for failed-payment emails by failure reason.
5. Add a landing page for "ethical dunning emails."

### Longer term

1. Consider publishing anonymized Dunlo recovery benchmarks quarterly.
2. Add a public Stripe recovery calculator.
3. Add integration/content pages for TanStack Start/SaaS boilerplates and founder stacks.
4. Monitor HN monthly for new "Show HN failed payment" products.
5. Build a lightweight battlecard for FlyCode, Churn Buster, Baremetrics, ChurnKey, and Stripe.

## Key Sources

HN:

- FlyCode Launch HN: https://news.ycombinator.com/item?id=41994658
- FlyCode backup cards Show HN: https://news.ycombinator.com/item?id=45348730
- Ask HN on failed-payment recovery startups: https://news.ycombinator.com/item?id=8464145
- Expired-card recovery discussion: https://news.ycombinator.com/item?id=8530470
- Baremetrics Recover HN: https://news.ycombinator.com/item?id=14032043
- Stripe Billing HN: https://news.ycombinator.com/item?id=16766846
- Autumn Show HN: https://news.ycombinator.com/item?id=44365620
- Rekko HN: https://news.ycombinator.com/item?id=46752628
- Rekko Show HN: https://news.ycombinator.com/item?id=46763898
- ProfitKit HN: https://news.ycombinator.com/item?id=19106238

Official/product sources:

- FlyCode: https://www.flycode.com/
- Churn Buster: https://churnbuster.io/
- Baremetrics pricing/Recover: https://baremetrics.com/pricing
- ChurnKey payment recovery docs: https://docs.churnkey.co/failed-payment-recovery/payment-recovery/
- Stripe Billing: https://stripe.com/en-US/billing
- Stripe revenue recovery docs: https://docs.stripe.com/billing/revenue-recovery
- Paddle Retain docs: https://www.paddle.com/help/profitwell-metrics/retain/how-it-works/retain-payment-recovery-how-it-works-retry-cadence
- Recurly dunning dashboard: https://docs.recurly.com/recurly-subscriptions/docs/dunning-summary
- Chargebee dunning: https://www.chargebee.com/docs/payments/2.0/dunning/dunning-v2
- Revaly/FlexPay docs: https://docs.revaly.co/docs/overview
- Gr4vy: https://gr4vy.com/
- RetryFix: https://retryfix.com/
- Revive: https://revive-hq.com/
- PayCircuit: https://paycircuit.eu/
- Recoupt: https://www.recoupt.app/
- ChurnRecover: https://churnrecover.com/
