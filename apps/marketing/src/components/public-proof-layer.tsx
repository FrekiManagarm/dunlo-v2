import Link from "next/link";
import { ArrowRight } from "lucide-react";

const PROOF_ITEMS = [
  {
    label: "Public benchmark",
    title: "Failure-rate ranges are visible before signup.",
    body: "The calculator shows the current public MRR bands, estimated failed MRR, and recoverable revenue assumptions without asking for an email first.",
    href: "/benchmark",
    cta: "Open benchmark",
  },
  {
    label: "Product evidence",
    title: "The workflow is failure-code first.",
    body: "Dunlo is built around Stripe failure reasons, timed recovery emails, secure update links, and founder escalation for accounts that should not receive generic automation.",
    href: "/stripe-failed-payments",
    cta: "See failure codes",
  },
  {
    label: "Beta proof policy",
    title: "No anonymous uplift claims before approval.",
    body: "Customer metrics, screenshots, and testimonials are published only when the beta sample is large enough and the customer has approved the public version.",
    href: "/state-of-stripe-payments-2026",
    cta: "Read report policy",
  },
] as const;

type PublicProofLayerProps = {
  compact?: boolean;
};

export function PublicProofLayer({ compact = false }: PublicProofLayerProps) {
  return (
    <section
      className={
        compact
          ? "rounded-3xl border border-gray-200 bg-white px-5 py-6 md:px-7"
          : "mx-auto max-w-6xl rounded-[2rem] border border-gray-200 bg-white/80 p-6 backdrop-blur-md md:p-8 lg:p-10"
      }
    >
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
            Public proof
          </p>
          <h2 className="mt-3 max-w-md text-2xl font-semibold tracking-tight text-gray-950 md:text-4xl">
            What we can prove today.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-gray-600">
            Dunlo should earn trust with visible mechanics, public benchmarks,
            and approved beta evidence instead of vague recovery claims.
          </p>
        </div>

        <div className="divide-y divide-gray-100 border-y border-gray-100">
          {PROOF_ITEMS.map((item) => (
            <div
              key={item.title}
              className="grid gap-4 py-5 md:grid-cols-[0.42fr_1fr]"
            >
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
                {item.label}
              </p>
              <div>
                <h3 className="text-base font-semibold tracking-tight text-gray-950">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {item.body}
                </p>
                <Link
                  href={item.href}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-dunlo-deep transition-all hover:gap-3"
                >
                  {item.cta}
                  <ArrowRight size={14} strokeWidth={1.8} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
