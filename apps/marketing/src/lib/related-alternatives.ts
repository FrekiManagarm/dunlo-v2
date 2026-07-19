export const CORE_ALTERNATIVE_SLUGS = [
  "churn-buster",
  "churnkey",
  "stripe-customer-emails",
  "retryfix",
] as const;

const RELATED_ALTERNATIVE_SLUGS: Record<string, readonly string[]> = {
  "churn-buster": ["churnkey", "retryfix", "stripe-customer-emails"],
  churnkey: ["churn-buster", "chargebee", "paddle-retain"],
  chargebee: ["churnkey", "churn-buster", "paddle-retain"],
  "paddle-retain": ["churnkey", "chargebee", "churn-buster"],
  retryfix: ["churn-buster", "stripe-customer-emails", "churnkey"],
};

export function getRelatedAlternativeSlugs(slug: string): string[] {
  const candidates =
    RELATED_ALTERNATIVE_SLUGS[slug] ?? CORE_ALTERNATIVE_SLUGS;

  return [...new Set(candidates)]
    .filter((candidate) => candidate !== slug)
    .slice(0, 3);
}
