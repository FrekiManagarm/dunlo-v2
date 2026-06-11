import { Quote, ShieldCheck, TimerReset } from "lucide-react";
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
      <section
        className={
          compact
            ? "overflow-hidden rounded-[2rem] border border-gray-200 bg-white"
            : "mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] border border-gray-200 bg-white"
        }
      >
        <div className="grid gap-0 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="border-b border-gray-200 p-6 md:p-9 lg:border-b-0 lg:border-r">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
              Beta proof
            </p>
            <h2 className="mt-4 max-w-md text-4xl font-semibold leading-none tracking-tight text-gray-950 md:text-5xl">
              Customer stories publish only when the numbers are approved.
            </h2>
            <p className="mt-5 max-w-[58ch] text-base leading-7 text-gray-600">
              Until the beta sample is large enough, Dunlo shows the recovery
              mechanics and proof policy instead of dressing up anonymous
              testimonials.
            </p>
          </div>

          <div className="bg-stone-50 p-4 md:p-6">
            <div className="rounded-[1.5rem] border border-gray-200 bg-white p-4 md:p-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                    Proof pipeline
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
                    Waiting on customer approval
                  </h3>
                </div>
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-dunlo/12 text-dunlo-deep">
                  <TimerReset size={19} strokeWidth={2} />
                </span>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {[
                  ["01", "Recovered payment metric"],
                  ["02", "Direct founder quote"],
                  ["03", "Public logo approval"],
                ].map(([n, label]) => (
                  <div
                    key={label}
                    className="rounded-[1.2rem] border border-gray-100 bg-stone-50 p-4"
                  >
                    <span className="font-mono text-xs font-semibold text-dunlo-deep">
                      {n}
                    </span>
                    <p className="mt-4 text-sm font-semibold leading-5 text-gray-950">
                      {label}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-gray-500">
                      Required before anything becomes public.
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-[1.2rem] bg-gray-950 p-4 text-white">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-dunlo">
                  Current policy
                </p>
                <p className="mt-3 text-sm leading-6 text-white/62">
                  No anonymous uplift claims, no synthetic logos, no blended
                  customer quote until the source is approved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="beta-testimonials"
      className={
        compact
          ? "overflow-hidden rounded-[2rem] border border-gray-200 bg-white"
          : "mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] border border-gray-200 bg-white"
      }
    >
      <div className="grid gap-0 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="border-b border-gray-200 p-6 md:p-9 lg:border-b-0 lg:border-r">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
            Beta proof
          </p>
          <h2 className="mt-4 max-w-md text-4xl font-semibold leading-none tracking-tight text-gray-950 md:text-5xl">
            Recovery stories with numbers attached.
          </h2>
          <p className="mt-5 max-w-[58ch] text-base leading-7 text-gray-600">
            Verified beta users, direct quotes, and concrete recovered-payment
            metrics. No anonymous uplift claim.
          </p>
        </div>

        <div className="grid gap-3 bg-stone-50 p-4 md:grid-cols-[1.1fr_0.9fr] md:p-6">
          {published.slice(0, 3).map((item, index) => (
            <article
              key={`${item.companyName}-${item.founderName}`}
              className={`rounded-[1.5rem] border border-gray-200 bg-white p-5 shadow-[0_22px_70px_-58px_rgba(15,23,42,0.45)] ${
                index === 0 ? "md:row-span-2 md:p-6" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-dunlo/12 font-mono text-sm font-semibold text-dunlo-deep">
                  {getInitials(item.logoLabel)}
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500">
                  <ShieldCheck size={12} className="text-dunlo-deep" />
                  Approved
                </span>
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
