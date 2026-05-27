export type BetaTestimonial = {
  founderName: string;
  founderTitle: string;
  companyName: string;
  mrr: string;
  recoveredPayments: number;
  recoveredValue: string;
  quote: string;
  logoLabel: string;
  approvedAt: string | null;
};

export const BETA_TESTIMONIALS = [] satisfies BetaTestimonial[];

export function getPublishableBetaTestimonials(
  testimonials: readonly BetaTestimonial[],
) {
  return testimonials.filter(isPublishableBetaTestimonial);
}

export function isPublishableBetaTestimonial(testimonial: BetaTestimonial) {
  return (
    hasText(testimonial.founderName) &&
    hasText(testimonial.founderTitle) &&
    hasText(testimonial.companyName) &&
    hasText(testimonial.mrr) &&
    hasText(testimonial.recoveredValue) &&
    hasText(testimonial.logoLabel) &&
    testimonial.recoveredPayments > 0 &&
    hasText(testimonial.approvedAt) &&
    countSentences(testimonial.quote) >= 1 &&
    countSentences(testimonial.quote) <= 3
  );
}

function hasText(value: string | null) {
  return Boolean(value?.trim());
}

function countSentences(value: string) {
  return value
    .trim()
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean).length;
}
