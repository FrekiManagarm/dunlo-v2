# Dunlo Marketing Tracking Plan

*Last updated: 2026-06-19*

## Overview
- Tool: PostHog
- Current implementation: manual pageviews, disabled autocapture, selective custom events
- Primary business question: which marketing surfaces produce qualified Stripe-connected beta users?
- Privacy rule: do not send email addresses, customer names, card data, or Stripe identifiers to marketing analytics.

## Core Funnel
| Stage | Question | Primary events |
|-------|----------|----------------|
| Acquisition | Which pages and channels attract qualified visitors? | `$pageview` |
| Tool usage | Which free tools create buying intent? | `tool_value_changed`, `tool_result_viewed` |
| Lead capture | Which tools create email/report requests? | `lead_form_submitted`, `lead_form_succeeded`, `lead_form_failed` |
| CTA intent | Which pages move people toward signup? | `cta_clicked` |
| Signup | Do visitors start and complete account creation? | `signup_started`, `signup_completed`, `signup_failed` |
| Activation | Do beta users connect Stripe and configure email? | `onboarding_step_completed`, `stripe_connected`, `email_provider_configured` |

## Marketing Site Events
| Event Name | Category | Properties | Trigger | Notes |
|------------|----------|------------|---------|-------|
| `$pageview` | Acquisition | `$current_url` | Route change | Already implemented manually |
| `cta_clicked` | Conversion | `button_text`, `location`, `destination` | Primary/secondary CTA click | No PII |
| `tool_value_changed` | Free tools | `tool_name`, `field_name`, `value_bucket` | Slider/select/input changes worth analyzing | Bucket values where possible |
| `tool_result_viewed` | Free tools | `tool_name`, `variant`, `mrr_range`, `failed_payment_rate`, `failed_mrr_bucket`, `recoverable_mrr_bucket` | Benchmark result rendered or recalculated | No email |
| `lead_form_submitted` | Lead capture | `form_type`, `source`, `mrr_range`, `failed_payment_rate`, `failed_mrr_bucket`, `recoverable_mrr_bucket` | Benchmark/audit form submit | Do not include email |
| `lead_form_succeeded` | Lead capture | Same as submit | Lead API returns OK | Conversion |
| `lead_form_failed` | Lead capture | `form_type`, `source` | Lead API fails | Debug conversion friction |

## Product Events
| Event Name | Category | Properties | Trigger | Notes |
|------------|----------|------------|---------|-------|
| `signup_started` | Signup | `method` when available | Email or OAuth signup attempt | Already partially implemented |
| `signup_completed` | Signup | `method` when available | Account created / verification flow reached | Already partially implemented |
| `signup_failed` | Signup | `error_type` | Signup error | Avoid raw backend messages if they may include PII |
| `onboarding_step_completed` | Activation | `step_number`, `step_name` | Stripe connect, benchmark viewed, email configured, setup completed | Add next |
| `stripe_connected` | Activation | `source` | Stripe OAuth success | Product activation milestone |
| `email_provider_configured` | Activation | `provider` | Email provider saved | Product activation milestone |
| `sequence_toggled` | Product usage | `failure_type`, `enabled` | Sequence on/off | Already implemented |
| `feedback_submitted` | Product feedback | `rating`, `area` | Feedback widget submitted | Already implemented |

## Conversion Definitions
| Conversion | Event | Counting |
|------------|-------|----------|
| Marketing CTA intent | `cta_clicked` where destination contains signup/login | Every click |
| Benchmark lead | `lead_form_succeeded` where source is `benchmark` | Once per visitor/session in reporting |
| Audit lead | `lead_form_succeeded` where source is `audit` | Once per visitor/session in reporting |
| Account created | `signup_completed` | Once per user |
| Activated beta user | `stripe_connected` plus `email_provider_configured` | Once per user/account |

## Implementation Notes
- Keep `autocapture: false` until consent/privacy posture is explicit.
- Use object-action event names.
- Prefer buckets for money values: `<$5k`, `$5k-$20k`, `$20k-$80k`, `$80k+`.
- Never pass the benchmark lead email into PostHog.
- Add UTM preservation before paid campaigns or Product Hunt retargeting.
