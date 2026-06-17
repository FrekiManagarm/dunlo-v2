# Stripe Smart Retries - raw source notes

Generated: 2026-06-15
Source URLs:
- https://docs.stripe.com/billing/revenue-recovery/smart-retries
- https://docs.stripe.com/billing/revenue-recovery

Key extracted facts:
- Stripe Billing revenue recovery includes recovery analytics, Smart Retries, customer emails, automatic card updates, and automations.
- Smart Retries uses AI to choose retry times for failed invoice payments.
- Stripe recommends Smart Retries, with a documented default of 8 tries within 2 weeks.
- Stripe does not execute retries when there is no payment method, a hard decline, India-issued recurring card constraints, or a disconnected Connect account.
- Stripe's native job is retry timing and billing-system recovery. It is not positioned as a founder-facing workflow, customer-specific copy layer, or escalation queue.

