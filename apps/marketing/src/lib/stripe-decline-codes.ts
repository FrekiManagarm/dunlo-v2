export type StripeDeclineCodeGuide = {
  slug: string;
  code: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  shortDescription: string;
  searchIntent: string;
  customerMeaning: string;
  firstMove: string;
  retryTiming: string;
  emailAngle: string;
  avoid: string;
  dunloWorkflow: string[];
  relatedSlugs: string[];
  keywords: readonly string[];
};

export const STRIPE_DECLINE_CODE_GUIDES = [
  {
    slug: "insufficient-funds",
    code: "insufficient_funds",
    title: "Stripe insufficient_funds decline code",
    metaTitle: "Stripe insufficient_funds Decline Code: Recovery Guide | Dunlo",
    metaDescription:
      "Learn what Stripe insufficient_funds means, when to retry, what to tell the customer, and how to recover the failed SaaS payment.",
    shortDescription:
      "The customer does not have enough available funds for the payment at that moment.",
    searchIntent:
      "Founders usually want to know whether they should retry immediately or wait for a better collection window.",
    customerMeaning:
      "The card may still be valid and the customer may still want the product. The recovery motion is about timing, a calm explanation, and an alternative payment path.",
    firstMove:
      "Send a plain email that explains the payment did not clear because of available funds and gives the customer a secure way to update or change the payment method.",
    retryTiming:
      "Do not hammer the same card. Wait long enough for a payroll, card balance, or customer action window, then retry with a reminder.",
    emailAngle:
      "Keep the tone neutral: the payment could not be completed, the subscription is still active for now, and they can update the payment method safely.",
    avoid:
      "Avoid blame, urgency that sounds like collections, or repeated same-day retries that create issuer noise without helping the customer.",
    dunloWorkflow: [
      "Tag the failure as a timing-sensitive recoverable payment.",
      "Send a failure-aware email with a Stripe-hosted update link.",
      "Schedule a delayed retry window instead of an immediate retry loop.",
      "Escalate high-MRR accounts for founder review before cancellation.",
    ],
    relatedSlugs: ["card-velocity-exceeded", "generic-decline", "do-not-honor"],
    keywords: [
      "Stripe insufficient_funds",
      "insufficient funds Stripe decline",
      "recover insufficient funds payment",
      "Stripe failed payment insufficient funds",
    ],
  },
  {
    slug: "expired-card",
    code: "expired_card",
    title: "Stripe expired_card decline code",
    metaTitle: "Stripe expired_card Decline Code: Recovery Guide | Dunlo",
    metaDescription:
      "Learn what Stripe expired_card means, why retries alone will not fix it, and how SaaS teams should ask customers to update payment details.",
    shortDescription:
      "The card attached to the subscription has expired and needs to be replaced.",
    searchIntent:
      "Founders want to know whether Stripe can retry the payment or whether the customer must update the card.",
    customerMeaning:
      "This is one of the cleanest recovery cases: the customer often still wants the subscription, but the stored card is stale.",
    firstMove:
      "Send an update-card email immediately with a secure Stripe-hosted billing link and a short explanation that the saved card has expired.",
    retryTiming:
      "Retry after the customer updates the payment method. Blind retries against the expired card are unlikely to recover revenue.",
    emailAngle:
      "Make the action obvious: update the saved card, then the invoice can be collected without changing their plan.",
    avoid:
      "Avoid vague failed-payment copy. If the card expired, tell the customer the specific fix instead of asking them to contact support.",
    dunloWorkflow: [
      "Classify the failure as customer-action required.",
      "Send the card-update email first, not a generic retry notice.",
      "Watch for payment method updates before retrying collection.",
      "Track the recovered invoice once Stripe confirms payment.",
    ],
    relatedSlugs: ["incorrect-cvc", "authentication-required", "generic-decline"],
    keywords: [
      "Stripe expired_card",
      "expired card Stripe decline",
      "Stripe card expired recovery",
      "expired card dunning email",
    ],
  },
  {
    slug: "authentication-required",
    code: "authentication_required",
    title: "Stripe authentication_required decline code",
    metaTitle:
      "Stripe authentication_required Decline Code: Recovery Guide | Dunlo",
    metaDescription:
      "Learn what Stripe authentication_required means for SaaS subscriptions and how to recover payments that need customer authentication.",
    shortDescription:
      "The payment needs customer authentication before it can be completed.",
    searchIntent:
      "Teams need to know why an off-session subscription payment failed and how to bring the customer back into an authentication flow.",
    customerMeaning:
      "The customer may need to confirm the payment through their bank, card app, or 3D Secure flow before Stripe can collect the invoice.",
    firstMove:
      "Send a customer-safe authentication email that explains the bank needs one more confirmation step and links to the hosted payment flow.",
    retryTiming:
      "Treat this as action required. Stripe documentation lists authentication_required among hard decline cases where collection needs a new payment method or customer action.",
    emailAngle:
      "Use reassuring language: their bank needs confirmation, and the secure link will let them finish the payment.",
    avoid:
      "Avoid retry-only sequences. The missing piece is customer authentication, not just another attempt at the same charge.",
    dunloWorkflow: [
      "Detect the authentication-required state from Stripe failure context.",
      "Send a confirmation-focused email instead of a generic card-declined notice.",
      "Route the customer to Stripe-hosted payment completion.",
      "Escalate important accounts if authentication is not completed quickly.",
    ],
    relatedSlugs: ["expired-card", "transaction-not-allowed", "do-not-honor"],
    keywords: [
      "Stripe authentication_required",
      "Stripe authentication required declined",
      "3D Secure failed subscription payment",
      "Stripe SCA failed payment recovery",
    ],
  },
  {
    slug: "do-not-honor",
    code: "do_not_honor",
    title: "Stripe do_not_honor decline code",
    metaTitle: "Stripe do_not_honor Decline Code: Recovery Guide | Dunlo",
    metaDescription:
      "Learn what Stripe do_not_honor means, why the bank blocked the payment, and how to recover SaaS revenue without confusing customers.",
    shortDescription:
      "The issuer declined the payment for an unknown reason and usually wants the customer to contact the card issuer.",
    searchIntent:
      "Founders want a translation of a vague bank response into a practical recovery message.",
    customerMeaning:
      "The card issuer blocked the payment, but Stripe does not receive a more specific reason. The customer may need to approve the charge or contact the bank.",
    firstMove:
      "Tell the customer the bank did not approve the charge and give them two paths: try another payment method or contact the card issuer.",
    retryTiming:
      "A later retry may work only after issuer/customer action. Follow up with context before retrying repeatedly.",
    emailAngle:
      "Be specific without overclaiming: the bank declined the charge, and the fastest fix is often another card or issuer approval.",
    avoid:
      "Avoid pretending you know the bank's exact reason. Stripe labels this as unknown, so the copy should not invent a cause.",
    dunloWorkflow: [
      "Treat the payment as issuer-action likely.",
      "Send copy that explains the bank block without blaming the customer.",
      "Offer a secure update-payment route as the lowest-friction fallback.",
      "Flag high-value accounts for a personal founder note.",
    ],
    relatedSlugs: ["generic-decline", "transaction-not-allowed", "insufficient-funds"],
    keywords: [
      "Stripe do_not_honor",
      "do not honor Stripe decline",
      "Stripe bank declined payment",
      "recover do_not_honor payment",
    ],
  },
  {
    slug: "incorrect-cvc",
    code: "incorrect_cvc",
    title: "Stripe incorrect_cvc decline code",
    metaTitle: "Stripe incorrect_cvc Decline Code: Recovery Guide | Dunlo",
    metaDescription:
      "Learn what Stripe incorrect_cvc means and how SaaS teams should help customers correct card verification details after a failed payment.",
    shortDescription:
      "The card security code did not match the issuer's records.",
    searchIntent:
      "Teams want to know how to ask for corrected billing details without sounding like support noise.",
    customerMeaning:
      "The card may be usable, but the verification details need correction before the payment can succeed.",
    firstMove:
      "Send a short email asking the customer to re-enter or update their payment details through a secure billing link.",
    retryTiming:
      "Retry after corrected details are submitted. Retrying the same incorrect card data is unlikely to help.",
    emailAngle:
      "Keep it practical: the card verification details did not match, and the customer can fix it by updating payment details.",
    avoid:
      "Avoid asking the customer to email card details or CVC. Keep all sensitive information inside Stripe-hosted flows.",
    dunloWorkflow: [
      "Classify the failure as payment-detail correction needed.",
      "Send a secure update-details email.",
      "Wait for the billing update before retrying the invoice.",
      "Track whether the account recovers or needs human follow-up.",
    ],
    relatedSlugs: ["expired-card", "generic-decline", "authentication-required"],
    keywords: [
      "Stripe incorrect_cvc",
      "incorrect cvc Stripe decline",
      "Stripe CVC failed payment",
      "incorrect CVC recovery email",
    ],
  },
  {
    slug: "generic-decline",
    code: "generic_decline",
    title: "Stripe generic_decline decline code",
    metaTitle: "Stripe generic_decline Decline Code: Recovery Guide | Dunlo",
    metaDescription:
      "Learn what Stripe generic_decline means and how to recover SaaS payments when the bank or Stripe gives only a broad decline reason.",
    shortDescription:
      "The payment was declined for a broad or unknown reason, including some cases blocked by Stripe Radar or Adaptive Acceptance.",
    searchIntent:
      "Founders want to know what to say when Stripe does not provide a specific customer-facing reason.",
    customerMeaning:
      "There is not enough detail to give the customer a precise explanation. The safest recovery path is another payment method or issuer contact.",
    firstMove:
      "Send a neutral failed-payment email with a secure update-payment link and a simple note that the card could not be approved.",
    retryTiming:
      "Use a measured follow-up cadence. If the issuer keeps declining, the customer likely needs to use another card or contact the bank.",
    emailAngle:
      "Do not over-explain. Give the customer a clear next step and keep the message calm.",
    avoid:
      "Avoid exposing fraud or risk language to the customer. Stripe recommends presenting sensitive blocks like generic declines.",
    dunloWorkflow: [
      "Use generic-decline copy that does not reveal sensitive internal signals.",
      "Route the customer to a secure update-payment flow.",
      "Delay follow-ups to avoid noisy repeated attempts.",
      "Escalate valuable accounts with a founder-safe draft.",
    ],
    relatedSlugs: ["do-not-honor", "transaction-not-allowed", "incorrect-cvc"],
    keywords: [
      "Stripe generic_decline",
      "generic decline Stripe",
      "Stripe generic declined payment",
      "recover generic_decline payment",
    ],
  },
  {
    slug: "transaction-not-allowed",
    code: "transaction_not_allowed",
    title: "Stripe transaction_not_allowed decline code",
    metaTitle:
      "Stripe transaction_not_allowed Decline Code: Recovery Guide | Dunlo",
    metaDescription:
      "Learn what Stripe transaction_not_allowed means, why retries may not run, and how to ask SaaS customers for a usable payment method.",
    shortDescription:
      "The issuer did not permit this transaction type, and the customer usually needs issuer help or another payment method.",
    searchIntent:
      "SaaS teams want to know whether a subscription retry will succeed or whether the card cannot be used for this payment.",
    customerMeaning:
      "The bank may have blocked the transaction type or the card may not be allowed for the subscription payment.",
    firstMove:
      "Ask the customer to use a different payment method or contact the issuer to allow the transaction.",
    retryTiming:
      "Stripe treats transaction_not_allowed as a hard decline for billing retries, so recovery usually needs a new payment method or customer action.",
    emailAngle:
      "Explain that the bank did not permit this subscription charge and offer a secure way to switch payment methods.",
    avoid:
      "Avoid retrying as if the issue were temporary funds. The restriction is more structural than timing-based.",
    dunloWorkflow: [
      "Mark the invoice as customer-action required.",
      "Send a payment-method-change email.",
      "Pause blind retry messaging until a new method or customer confirmation appears.",
      "Bring the account into founder review if the MRR is material.",
    ],
    relatedSlugs: ["authentication-required", "do-not-honor", "generic-decline"],
    keywords: [
      "Stripe transaction_not_allowed",
      "transaction not allowed Stripe",
      "Stripe hard decline subscription",
      "recover transaction_not_allowed payment",
    ],
  },
  {
    slug: "card-velocity-exceeded",
    code: "card_velocity_exceeded",
    title: "Stripe card_velocity_exceeded decline code",
    metaTitle:
      "Stripe card_velocity_exceeded Decline Code: Recovery Guide | Dunlo",
    metaDescription:
      "Learn what Stripe card_velocity_exceeded means and how SaaS teams should recover payments blocked by card limits or velocity controls.",
    shortDescription:
      "The card exceeded an issuer balance, credit, transaction, or velocity limit.",
    searchIntent:
      "Teams need a practical recovery cadence for payments blocked by spending limits instead of a broken card.",
    customerMeaning:
      "The card may work later or with issuer approval, but the customer may need to use another payment method for the current invoice.",
    firstMove:
      "Send an email that explains the card hit a limit and gives the customer an update-payment path.",
    retryTiming:
      "Wait before retrying. A same-moment retry usually repeats the same limit failure.",
    emailAngle:
      "Frame it as a card limit issue, not a subscription problem. Offer another card or bank approval as the practical next step.",
    avoid:
      "Avoid immediate retry loops and avoid implying the customer has cancelled.",
    dunloWorkflow: [
      "Classify the failure as limit-related.",
      "Delay retries until a more plausible payment window.",
      "Send a calm card-limit recovery email.",
      "Escalate important accounts if no update happens after follow-up.",
    ],
    relatedSlugs: ["insufficient-funds", "do-not-honor", "generic-decline"],
    keywords: [
      "Stripe card_velocity_exceeded",
      "card velocity exceeded Stripe",
      "Stripe card limit decline",
      "recover card velocity exceeded payment",
    ],
  },
] as const satisfies readonly StripeDeclineCodeGuide[];

export const STRIPE_DECLINE_CODE_GUIDES_BY_SLUG = Object.fromEntries(
  STRIPE_DECLINE_CODE_GUIDES.map((guide) => [guide.slug, guide]),
) as Record<string, StripeDeclineCodeGuide>;

export function getRelatedDeclineCodeGuides(guide: StripeDeclineCodeGuide) {
  return guide.relatedSlugs
    .map((slug) => STRIPE_DECLINE_CODE_GUIDES_BY_SLUG[slug])
    .filter((related): related is StripeDeclineCodeGuide => Boolean(related));
}

export function declineCodePath(slug: string) {
  return `/stripe-decline-codes/${slug}`;
}
