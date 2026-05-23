import { Check, X } from "lucide-react";
import { FadeIn, SectionPill } from "./shared";

const FAILURE_ROWS = [
  {
    code: "card_expired",
    generic: "Your payment failed. Please update your card.",
    dunlo:
      "Looks like your card expired. Happens to everyone. Here is your one-click update link.",
  },
  {
    code: "insufficient_funds",
    generic: "Your payment failed. Please update your card.",
    dunlo: "We will retry in a few days. No action needed right now.",
  },
  {
    code: "do_not_honor",
    generic: "Your payment failed. Please update your card.",
    dunlo:
      "Your bank blocked the charge. Here is what usually fixes this in 2 minutes.",
  },
] as const;

export function FailureCodeDifferentiation() {
  return (
    <FadeIn>
      <section className="overflow-hidden rounded-3xl border border-gray-200/60 bg-white">
        <div className="grid gap-8 p-6 md:p-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-10 lg:p-12">
          <div className="flex flex-col justify-between">
            <div>
              <SectionPill>Failure-code precision</SectionPill>
              <h2 className="mt-5 max-w-xl text-3xl font-bold leading-tight tracking-tight text-gray-900 md:text-5xl">
                Not all failed payments are the same. Dunlo knows the
                difference.
              </h2>
            </div>
            <p className="mt-6 max-w-md text-base leading-7 text-gray-500">
              The practical difference is the email your customer receives
              after Stripe tells you why the charge failed.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="overflow-hidden rounded-[1.6rem] border border-red-100 bg-red-50/60">
              <div className="flex items-center justify-between border-b border-red-100 bg-white/70 px-5 py-4">
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-red-400">
                    Generic tools
                  </p>
                  <h3 className="mt-1 text-base font-bold tracking-tight text-gray-900">
                    Same email
                  </h3>
                </div>
                <span className="flex size-9 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <X size={16} />
                </span>
              </div>
              <div className="divide-y divide-red-100/80">
                {FAILURE_ROWS.map((row) => (
                  <div key={row.code} className="px-5 py-4">
                    <p className="font-mono text-[11px] font-semibold text-red-500">
                      {row.code}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-gray-700">
                      {row.generic}
                    </p>
                  </div>
                ))}
              </div>
              <p className="border-t border-red-100 px-5 py-4 text-sm font-semibold text-red-700">
                Same email. Every time. Regardless of why it failed.
              </p>
            </div>

            <div className="overflow-hidden rounded-[1.6rem] border border-dunlo/25 bg-dunlo/8 shadow-[0_24px_70px_-52px_rgba(0,153,80,0.5)]">
              <div className="flex items-center justify-between border-b border-dunlo/20 bg-white/75 px-5 py-4">
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-dunlo-dim">
                    Dunlo
                  </p>
                  <h3 className="mt-1 text-base font-bold tracking-tight text-gray-900">
                    Right reason
                  </h3>
                </div>
                <span className="flex size-9 items-center justify-center rounded-full bg-dunlo text-white">
                  <Check size={16} />
                </span>
              </div>
              <div className="divide-y divide-dunlo/15">
                {FAILURE_ROWS.map((row) => (
                  <div key={row.code} className="px-5 py-4">
                    <p className="font-mono text-[11px] font-semibold text-dunlo-deep">
                      {row.code}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-gray-800">
                      {row.dunlo}
                    </p>
                  </div>
                ))}
              </div>
              <p className="border-t border-dunlo/20 px-5 py-4 text-sm font-semibold text-dunlo-deep">
                The right message, for the right reason, at the right time.
              </p>
            </div>
          </div>
        </div>
      </section>
    </FadeIn>
  );
}
