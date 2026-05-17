# Reddit Alert Monitoring Playbook

## Goal

Catch high-intent Reddit conversations around failed Stripe payments, dunning, involuntary churn, and competitor mentions so Dunlo can reply quickly with useful, non-spammy advice.

Primary SLA: reply within 2 hours when a relevant post appears.

## Active Alert Setup

Use two layers:

1. F5Bot for email alerts.
2. Codex automation as a backup monitor that checks Reddit every 2 hours and drafts response angles.

F5Bot source: https://f5bot.com/

## F5Bot Configuration

Create one alert per exact phrase:

- `failed payment stripe`
- `involuntary churn`
- `stripe dunning`
- `payment recovery saas`
- `stripe declined subscription`
- `churn buster`
- `dunning emails`

Recommended settings:

- Monitor Reddit posts and comments.
- Keep Hacker News enabled only if alert volume stays manageable.
- Send alerts to the founder/operator inbox used for growth work.
- Start broad for 7 days, then prune noisy phrases or add more specific phrases.

## Subreddits To Check Daily

Spend 5 minutes per day scanning:

- `r/SaaS`
- `r/stripe`
- `r/EntrepreneurRideAlong`
- `r/indiehackers`
- `r/startups`

Suggested Reddit search queries:

- `subreddit:SaaS ("failed payment" OR "dunning" OR "involuntary churn")`
- `subreddit:stripe ("declined" OR "subscription failed" OR "invoice failed")`
- `subreddit:startups ("payment recovery" OR "failed payments")`
- `subreddit:indiehackers ("churn buster" OR "dunning emails")`
- `subreddit:EntrepreneurRideAlong ("stripe declined" OR "failed payment")`

## Triage Rules

Reply when at least one is true:

- The poster is a SaaS founder, indie hacker, or operator.
- The post mentions Stripe subscriptions, failed invoices, failed cards, dunning, involuntary churn, or payment recovery.
- The poster is comparing tools or asking what to use.
- A competitor is mentioned and the thread is open to alternatives.

Skip when:

- The post is a generic Stripe support issue with no recurring revenue context.
- The thread is hostile to product mentions.
- A direct Dunlo mention would not add value.

## Response Principles

Lead with the answer, not the product.

Good response structure:

1. Diagnose the likely issue in one sentence.
2. Give a practical fix or checklist.
3. Mention Dunlo only when it naturally solves the exact problem.
4. Disclose affiliation if mentioning Dunlo.

Example closing line when relevant:

> I am building Dunlo for this exact Stripe dunning/recovery workflow, so happy to share the checklist we use even if you do not use the product.

## Daily Routine

1. Review F5Bot emails.
2. Review the Codex automation report.
3. Scan the five priority subreddits manually.
4. Reply to high-intent posts first.
5. Record useful threads, phrasing, objections, and competitor mentions in the growth backlog.

## Weekly Optimization

Every Friday:

- Remove phrases that produce noise.
- Add exact phrases found in real posts.
- Track which subreddits produce useful conversations.
- Save strong replies as reusable snippets.
- Turn repeated objections into blog or landing page ideas.

## Starter Reply Snippets

For failed Stripe subscriptions:

> Usually the biggest gap is not the retry itself, it is the sequence around it: when to retry, what email to send, and how easy it is for the customer to update the card. I would check your retry schedule, invoice emails, and whether you are giving customers a one-click way back to the hosted payment method update flow.

For involuntary churn:

> A lot of involuntary churn is recoverable if you separate soft declines from hard declines and avoid sending the same generic email every time. The best-performing setups usually combine smart retries, short human emails, and a final cancellation warning before access is removed.

For competitor mentions:

> If you are comparing dunning tools, I would look at how much control you get over copy, retry timing, Stripe integration depth, and recovery reporting. The boring part matters: you want to know exactly which invoices were recovered and which messages caused action.
