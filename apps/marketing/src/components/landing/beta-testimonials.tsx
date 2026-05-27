import { Quote, ShieldCheck } from "lucide-react";
import {
  BETA_TESTIMONIALS,
  getPublishableBetaTestimonials,
  type BetaTestimonial,
} from "@/lib/beta-testimonials";

type BetaTestimonialsSectionProps = {
  compact?: boolean;
  showEmptyState?: boolean;
  testimonials?: readonly BetaTestimonial[];
};

export function BetaTestimonialsSection({
  compact = false,
  showEmptyState = false,
  testimonials = BETA_TESTIMONIALS,
}: BetaTestimonialsSectionProps) {
  const published = getPublishableBetaTestimonials(testimonials);
  const hasEnoughProof = published.length >= 3;

  if (!hasEnoughProof && !showEmptyState) return null;

  if (!hasEnoughProof) {
    return (
      <section className="rounded-[2rem] border border-gray-200 bg-white/80 px-5 py-7 backdrop-blur-md md:px-8">
        <div className="grid gap-5 md:grid-cols-[0.8fr_1.2fr] md:items-center">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
              Beta proof
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-gray-950 md:text-4xl">
              Testimonials are waiting on customer approval.
            </h2>
          </div>
          <p className="text-sm leading-6 text-gray-600">
            Add three approved entries in `BETA_TESTIMONIALS` with founder
            details, MRR range, recovered-payment metrics, a direct quote, and a
            logo label. The section will publish automatically once the proof is
            complete.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="beta-testimonials"
      className={
        compact
          ? "rounded-3xl border border-gray-200 bg-white px-5 py-7 md:px-8"
          : "mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-gray-200 bg-white/80 p-5 backdrop-blur-md md:p-8 lg:p-10"
      }
    >
      <div className="grid gap-7 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
            Beta proof
          </p>
          <h2 className="mt-3 max-w-md text-3xl font-semibold leading-tight tracking-tight text-gray-950 md:text-5xl">
            Recovery stories with numbers attached.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-6 text-gray-600">
            Verified beta users, direct quotes, and concrete recovered-payment
            metrics. No blended benchmark, no anonymous uplift claim.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-[1.08fr_0.92fr]">
          {published.slice(0, 3).map((item, index) => (
            <article
              key={`${item.companyName}-${item.founderName}`}
              className={`rounded-[1.4rem] border border-gray-200 bg-white p-5 shadow-[0_20px_40px_-24px_rgba(15,23,42,0.24)] ${
                index === 0 ? "md:row-span-2 md:p-6" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-dunlo/25 bg-dunlo/10 font-mono text-sm font-semibold text-dunlo-deep">
                  {getInitials(item.logoLabel)}
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500">
                  <ShieldCheck size={12} className="text-dunlo-deep" />
                  Approved
                </div>
              </div>

              <Quote
                size={index === 0 ? 25 : 20}
                strokeWidth={1.8}
                className="mt-5 text-dunlo-deep"
              />
              <p
                className={`mt-3 font-medium leading-7 text-gray-950 ${
                  index === 0 ? "text-lg md:text-xl" : "text-base"
                }`}
              >
                "{item.quote}"
              </p>

              <dl className="mt-5 grid grid-cols-2 gap-2 border-y border-gray-100 py-4">
                <Metric label="MRR" value={item.mrr} />
                <Metric
                  label="Recovered"
                  value={`${item.recoveredPayments} payments`}
                />
                <Metric label="Value" value={item.recoveredValue} wide />
              </dl>

              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-950">
                  {item.founderName}
                </p>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  {item.founderTitle}, {item.companyName}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">
        {label}
      </dt>
      <dd className="mt-1 font-mono text-sm font-semibold text-gray-950">
        {value}
      </dd>
    </div>
  );
}

function getInitials(label: string) {
  return label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
