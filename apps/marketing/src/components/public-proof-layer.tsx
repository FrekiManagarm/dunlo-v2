import Link from "next/link";
import { ArrowRight, FileText, ShieldCheck, SquareActivity } from "lucide-react";

const proofItems = [
  {
    label: "Benchmark",
    title: "Failure-rate ranges are visible before signup.",
    body: "The public calculator shows MRR bands, estimated failed MRR, and recovery assumptions without asking for an email first.",
    href: "/benchmark",
    cta: "Open benchmark",
    icon: SquareActivity,
  },
  {
    label: "Mechanics",
    title: "The workflow is failure-code first.",
    body: "Dunlo is built around Stripe decline reasons, timed emails, hosted update links, and founder escalation.",
    href: "/stripe-failed-payments",
    cta: "See failure codes",
    icon: ShieldCheck,
  },
  {
    label: "Policy",
    title: "Proof is published only when it is approved.",
    body: "Customer screenshots, recovery stories, and beta metrics stay private until the sample is useful and the customer signs off.",
    href: "/state-of-stripe-payments-2026",
    cta: "Read proof policy",
    icon: FileText,
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
          ? "overflow-hidden rounded-[2rem] border border-gray-200 bg-white"
          : "mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] border border-gray-200 bg-white"
      }
    >
      <div className="grid gap-0 lg:grid-cols-[0.78fr_1.22fr]">
        <div className="border-b border-gray-200 p-6 md:p-9 lg:border-b-0 lg:border-r">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
            Public proof
          </p>
          <h2 className="mt-4 max-w-md text-4xl font-semibold leading-none tracking-tight text-gray-950 md:text-5xl">
            Trust built from visible mechanics, not vague uplift claims.
          </h2>
          <p className="mt-5 max-w-[58ch] text-base leading-7 text-gray-600">
            Dunlo is still in beta, so the page shows what can be verified
            today: assumptions, recovery mechanics, and a clear policy for
            publishing customer proof.
          </p>
        </div>

        <div className="bg-stone-50 p-4 md:p-6">
          <div className="rounded-[1.5rem] border border-gray-200 bg-white">
            <div className="grid grid-cols-[0.38fr_1fr_auto] border-b border-gray-200 px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
              <span>Signal</span>
              <span>Evidence</span>
              <span>Source</span>
            </div>
            <div className="divide-y divide-gray-100">
              {proofItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="grid gap-4 px-4 py-5 md:grid-cols-[0.38fr_1fr_auto] md:items-center"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-full bg-dunlo/12 text-dunlo-deep">
                        <Icon size={17} strokeWidth={2} />
                      </span>
                      <span className="font-mono text-xs font-semibold text-gray-500">
                        {item.label}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight text-gray-950">
                        {item.title}
                      </h3>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                        {item.body}
                      </p>
                    </div>
                    <Link
                      href={item.href}
                      className="inline-flex w-fit items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 transition-all hover:border-dunlo/40 hover:text-dunlo-deep active:scale-[0.98]"
                    >
                      {item.cta}
                      <ArrowRight size={14} strokeWidth={2} />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
