type RecoveryExample = {
  readonly reason: string;
  readonly stripeCode: string;
  readonly customerMeaning: string;
  readonly action: string;
  readonly status: string;
  readonly isExample: true;
  readonly companyName?: never;
  readonly amount?: never;
  readonly recoveredValue?: never;
};

export const RECOVERY_EXAMPLES: readonly RecoveryExample[] = [
  {
    reason: "Expired card",
    stripeCode: "expired_card",
    customerMeaning: "The customer needs a secure payment update link.",
    action: "Customer action",
    status: "Email ready",
    isExample: true,
  },
  {
    reason: "Insufficient funds",
    stripeCode: "insufficient_funds",
    customerMeaning: "Timing matters more than sending another reminder now.",
    action: "Wait 4 hours",
    status: "Retry scheduled",
    isExample: true,
  },
  {
    reason: "High-value account",
    stripeCode: "founder_threshold",
    customerMeaning: "Keep an important customer relationship human.",
    action: "Founder review",
    status: "Draft prepared",
    isExample: true,
  },
] as const;

export const FAILURE_RESPONSE_CATEGORIES = [
  {
    situation: "The card expired",
    stripeCode: "expired_card",
    response: "Send a secure Stripe-hosted payment update link.",
    action: "Request a card update",
  },
  {
    situation: "The customer may need time",
    stripeCode: "insufficient_funds",
    response: "Use a calm message and retry at a more useful moment.",
    action: "Delay and retry",
  },
  {
    situation: "The bank needs customer approval",
    stripeCode: "authentication_required",
    response: "Guide the customer through Stripe's SCA confirmation path.",
    action: "Request authentication",
  },
  {
    situation: "No useful reason, or a sensitive account",
    stripeCode: "generic_decline",
    context: "No useful reason · sensitive/high-value account",
    response: "Pause automation and surface the Stripe context to a person.",
    action: "Manual founder review",
  },
] as const;

export const TRUST_ITEMS = [
  {
    title: "Read-only OAuth first",
    body: "The diagnostic cannot retry charges, send customer emails, or change Stripe.",
    href: "/privacy",
  },
  {
    title: "Private decision report",
    body: "Coverage, exclusions, currency context, and assumptions stay visible to you.",
    href: "/privacy",
  },
  {
    title: "No hidden activation",
    body: "Recovery needs a second Stripe consent, your email provider, and a final confirmation.",
    href: "/#founder-review",
  },
  {
    title: "Export or disconnect",
    body: "Download your diagnostic, then delete the Stripe-derived data for that connection.",
    href: "/#pricing",
  },
] as const;

export const PRICING_FEATURES = [
  "12-month recurring payment diagnostic",
  "Coverage, exclusions, and currency context",
  "Explicit read-only monitoring",
  "Optional recovery from your email provider",
  "Founder review for sensitive accounts",
] as const;

export const FAQ_ITEMS = [
  {
    question: "Is this just Stripe Smart Retries with nicer emails?",
    answer:
      "No. Dunlo begins by showing what failed recurring payments cost, which cases are automatable, and which need a person. If you activate recovery later, it adds the customer-facing layer around Stripe: message, timing, founder review, and recovered-payment reporting.",
  },
  {
    question: "Will customers know an automation sent the email?",
    answer:
      "No customer receives anything during the diagnostic. If you activate recovery, Dunlo uses the email provider you configure; high-value or sensitive accounts can pause for founder review before anything is sent.",
  },
  {
    question: "How does Dunlo connect to Stripe?",
    answer:
      "Dunlo first uses read-only Stripe OAuth for the diagnostic. Recovery requires a separate read-write consent and a final confirmation. You can revoke the connection from Stripe or Dunlo.",
  },
  {
    question: "Does Dunlo store card numbers?",
    answer:
      "No. Dunlo uses payment and subscription context, not full card numbers or CVC data. Card updates stay inside Stripe-hosted flows.",
  },
  {
    question: "Do I pay during beta?",
    answer:
      "No. Dunlo is free during beta and does not take a percentage of recovered revenue during that period. Pricing changes will be communicated before billing starts.",
  },
  {
    question: "Can sensitive accounts require founder review?",
    answer:
      "Yes. Once recovery is activated, important accounts can pause before a message is sent so a founder can review the Stripe context and prepared draft.",
  },
] as const;

export const RESOURCE_LINKS = [
  {
    href: "/stripe-failed-payment-recovery-software",
    title: "Stripe recovery software",
    body: "See the complete failed-payment recovery workflow.",
  },
  {
    href: "/stripe-dunning-schedule-calculator",
    title: "Dunning schedule calculator",
    body: "Plan email timing and retries by failure reason.",
  },
  {
    href: "/stripe-decline-codes",
    title: "Stripe decline codes",
    body: "Translate issuer responses into a useful next step.",
  },
  {
    href: "/benchmark",
    title: "Failed-payment benchmark",
    body: "Estimate failed MRR using visible assumptions.",
  },
] as const;
