# DUN-484 Beta Testimonial Collection

Goal: publish 3 approved beta testimonials with concrete recovery metrics on the homepage and alternatives pages.

## Candidate Query

Run against the production database after setting a real `DATABASE_URL`.

```sql
select
  u.id,
  u.name,
  u.email,
  count(fp.id)::int as failed_payment_count,
  sum(case when fp.status = 'recovered' then 1 else 0 end)::int as recovered_payment_count,
  sum(case when fp.status = 'recovered' then fp.amount else 0 end)::int as recovered_amount_cents,
  max(fp.updated_at) as last_payment_activity
from "user" u
left join failed_payment fp on fp.user_id = u.id
group by u.id, u.name, u.email
having count(fp.id) > 0
order by recovered_payment_count desc, failed_payment_count desc, last_payment_activity desc nulls last
limit 5;
```

Prioritize users with recovered payments first. If fewer than 3 have recovered payments, use the most active users and ask for qualitative feedback without publishing recovery-value claims.

## Short Questionnaire

Subject: Quick Dunlo beta quote?

Hi {{first_name}},

I am collecting a few short beta testimonials for Dunlo. Would you be open to answering these 5 questions? A rough answer is fine, and I will send the final quote back for approval before anything is published.

1. Your name, role, and SaaS name:
2. Rough MRR range:
3. How many failed payments has Dunlo helped recover?
4. Rough recovered value, either `$X recovered` or `% of MRR`:
5. In 2-3 sentences, what changed after using Dunlo?

If a 15-minute call is easier, send me two times that work.

## Approval Checklist

- Founder/customer approved the final wording.
- Quote is in English and max 2-3 sentences.
- MRR is approximate, not over-precise.
- Recovered payment count is greater than zero for any recovery claim.
- Recovered value is stated as `$X recovered` or `% of MRR recovered`.
- Company/SaaS logo usage is approved, or `logoLabel` initials are used instead.
- Add the final entries to `BETA_TESTIMONIALS` in `apps/marketing/src/lib/beta-testimonials.ts`.

## Publishing Format

Use this shape for each approved entry:

```ts
{
  founderName: "",
  founderTitle: "",
  companyName: "",
  mrr: "",
  recoveredPayments: 0,
  recoveredValue: "",
  quote: "",
  logoLabel: "",
  approvedAt: "YYYY-MM-DD",
}
```

The public testimonial section only renders when at least 3 approved testimonials pass validation.
