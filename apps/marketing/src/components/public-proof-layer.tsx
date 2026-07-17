import Link from "next/link";
import { ArrowRight, FileText, ShieldCheck, SquareActivity } from "lucide-react";
import {
  HOMEPAGE_RECOVERABILITY_PERCENT,
  RECOVERY_MODEL_UPDATED,
} from "@/lib/recovery-assumptions";

const proofItems = [
  {
    title: "Visible assumptions",
    body: `The public benchmark exposes the illustrative failed-payment bands and ${HOMEPAGE_RECOVERABILITY_PERCENT} recoverability assumption used in its model. Updated ${RECOVERY_MODEL_UPDATED}.`,
    href: "/benchmark",
    cta: "Inspect the public model",
    icon: SquareActivity,
  },
  {
    title: "Visible mechanics",
    body: "Failure reasons, recovery timing, customer update links, and founder review are documented before signup.",
    href: "/stripe-failed-payments",
    cta: "See the mechanics",
    icon: ShieldCheck,
  },
  {
    title: "Visible proof policy",
    body: "Customer metrics and stories remain private until the sample is useful and the customer approves publication.",
    href: "/state-of-stripe-payments-2026",
    cta: "Read the proof policy",
    icon: FileText,
  },
] as const;

type PublicProofLayerProps = {
  compact?: boolean;
};

export function PublicProofLayer({ compact = false }: PublicProofLayerProps) {
  return (
    <section
      id="proof"
      className={
        compact
          ? "scroll-mt-24 overflow-hidden rounded-2xl border border-dunlo-line bg-white"
          : "scroll-mt-24 border-y border-dunlo-line bg-white"
      }
    >
      <div
        className={
          compact
            ? "grid lg:grid-cols-[0.72fr_1.28fr]"
            : "mx-auto grid max-w-7xl lg:grid-cols-[0.72fr_1.28fr]"
        }
      >
        <div className="border-b border-dunlo-line p-6 md:p-10 lg:border-b-0 lg:border-r lg:border-dunlo-line">
          <p className="text-sm font-semibold text-dunlo-deep">
            Beta transparency
          </p>
          <h2 className="mt-4 max-w-xl text-balance text-4xl font-semibold leading-none tracking-[-0.03em] text-dunlo-ink md:text-6xl">
            What can be verified today.
          </h2>
          <p className="mt-6 max-w-[62ch] text-pretty text-base leading-7 text-gray-700">
            Dunlo publishes assumptions, recovery mechanics, and its proof
            policy before it publishes customer outcomes.
          </p>
          <p className="mt-5 border-l border-dunlo-ink pl-4 text-sm font-semibold leading-6 text-dunlo-ink">
            During beta, customer outcomes are published only with approval and
            enough context to be useful.
          </p>
        </div>

        <div className="divide-y divide-dunlo-line">
          {proofItems.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="grid gap-4 p-6 md:grid-cols-[auto_1fr_auto] md:items-center md:p-8"
              >
                <Icon className="text-dunlo-deep" size={20} aria-hidden />
                <div>
                  <h3 className="text-lg font-semibold text-dunlo-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-700">
                    {item.body}
                  </p>
                </div>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-dunlo-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dunlo-deep focus-visible:ring-offset-2"
                >
                  {item.cta}
                  <ArrowRight size={14} aria-hidden />
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
