import { ArrowRight, LockKeyhole, ScanSearch } from "lucide-react";
import { TrackedLink } from "@/components/tracked-link";
import { SIGNUP_URL } from "@/lib/app-url";

const REPORT_ROWS = [
  ["Recurring MRR at risk", "Visible"],
  ["Automatable opportunity", "Separated"],
  ["Founder-review accounts", "Protected"],
] as const;

export function PaymentRecoveryHero() {
  return (
    <section className="relative flex min-h-[100dvh] items-center overflow-hidden bg-dunlo-ink px-4 pb-12 pt-28 text-white md:px-6 md:pb-16 md:pt-32">
      <div className="landing-orbit" aria-hidden="true" />
      <div className="relative mx-auto grid w-full max-w-[1400px] gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-4">
        <div className="relative z-10 max-w-2xl lg:pb-16 lg:pt-10">
          <p className="anim-1 text-sm font-semibold text-dunlo">
            Stripe diagnostic for B2B SaaS
          </p>
          <h1 className="anim-2 mt-7 text-balance text-[clamp(3rem,5.7vw,5.5rem)] font-bold leading-[0.94] tracking-[-0.04em]">
            See what failed payments are really costing your MRR.
          </h1>
          <p className="anim-3 mt-7 max-w-[58ch] text-pretty text-base leading-7 text-white/78 md:text-lg md:leading-8">
            Connect Stripe in read-only mode. Dunlo turns your recurring invoice
            history into a private report: what is addressable, what needs a
            human, and what should be excluded.
          </p>
          <div className="anim-4 mt-9 flex flex-col gap-3 sm:flex-row">
            <TrackedLink
              href={SIGNUP_URL}
              eventProperties={{
                button_text: "Run my private diagnostic",
                destination: SIGNUP_URL,
                location: "homepage_hero",
              }}
              className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-dunlo px-6 text-sm font-bold text-dunlo-ink transition-transform duration-300 ease-out hover:-translate-y-0.5 active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-dunlo-ink"
            >
              Run my private diagnostic
              <ArrowRight
                className="transition-transform group-hover:translate-x-1"
                size={16}
                aria-hidden
              />
            </TrackedLink>
            <a
              href="#how-it-works"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/24 px-6 text-sm font-semibold text-white transition-colors hover:border-white/60 hover:bg-white/6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              See the flow
            </a>
          </div>
          <div className="anim-5 mt-12 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/14 pt-5 text-xs font-medium text-white/64">
            <span className="inline-flex items-center gap-2">
              <LockKeyhole size={14} aria-hidden /> Read-only first
            </span>
            <span>12 months analysed</span>
            <span>No emails or retries before confirmation</span>
          </div>
        </div>

        <div className="anim-3 relative min-w-0 lg:-mr-[8vw] lg:translate-x-6">
          <div className="overflow-hidden rounded-2xl border border-white/16 bg-dunlo-night p-3 shadow-[0_8px_0_color-mix(in_oklab,var(--dunlo-accent)_44%,transparent)] md:p-5">
            <div className="rounded-xl bg-white p-5 text-dunlo-ink md:p-7">
              <div className="flex items-start justify-between gap-5 border-b border-dunlo-line pb-6">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-dunlo-deep">
                    <ScanSearch size={17} aria-hidden />
                    Private diagnostic
                  </div>
                  <p className="mt-3 text-2xl font-bold tracking-[-0.03em] md:text-3xl">
                    Your decision report is ready.
                  </p>
                  <p className="mt-2 max-w-[44ch] text-sm leading-6 text-dunlo-ink/68">
                    Recurring invoices only · coverage and exclusions included
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-dunlo/15 px-3 py-1 text-xs font-semibold text-dunlo-deep">
                  Read-only
                </span>
              </div>

              <div className="mt-6 grid gap-3">
                {REPORT_ROWS.map(([label, status]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-4 border-b border-dunlo-line py-3 last:border-b-0"
                  >
                    <span className="text-sm font-semibold">{label}</span>
                    <span className="text-xs font-semibold text-dunlo-deep">
                      {status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-7 rounded-xl bg-dunlo-mist p-4">
                <p className="text-sm font-bold">Nothing changes in Stripe.</p>
                <p className="mt-1 text-sm leading-6 text-dunlo-ink/72">
                  You choose whether monitoring or recovery should ever be
                  enabled.
                </p>
              </div>
            </div>
          </div>
          <p className="mt-4 text-right text-xs text-white/50">
            Illustrative diagnostic report · not customer data
          </p>
        </div>
      </div>
    </section>
  );
}
