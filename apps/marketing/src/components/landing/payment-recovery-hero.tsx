import { ArrowRight } from "lucide-react";
import { SIGNUP_URL } from "@/lib/app-url";
import { TrackedLink } from "@/components/tracked-link";
import { RECOVERY_EXAMPLES } from "./landing-content";

export function PaymentRecoveryHero() {
  return (
    <section className="px-4 pb-12 pt-28 md:px-6 md:pb-20 md:pt-36">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-2xl border border-dunlo-line bg-white lg:grid-cols-[0.92fr_1.08fr]">
        <div className="flex flex-col justify-center p-6 md:p-10 lg:p-14">
          <p className="anim-1 text-sm font-semibold text-dunlo-deep">
            Stripe payment recovery, free in beta
          </p>
          <h1 className="anim-2 mt-5 max-w-3xl text-balance text-4xl font-semibold leading-[0.98] tracking-[-0.035em] text-dunlo-ink sm:text-5xl md:text-6xl lg:text-7xl">
            Recover failed payments without losing customer trust.
          </h1>
          <p className="anim-3 mt-6 max-w-[62ch] text-pretty text-base leading-7 text-gray-700 md:text-lg md:leading-8">
            Dunlo reads why a Stripe payment failed, sends the right recovery
            message, and pauses sensitive accounts for founder review.
          </p>
          <div className="anim-4 mt-8 flex flex-col gap-3 sm:flex-row">
            <TrackedLink
              href={SIGNUP_URL}
              eventProperties={{
                button_text: "Start free in beta",
                destination: SIGNUP_URL,
                location: "homepage_hero",
              }}
              className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-dunlo-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dunlo-deep"
            >
              Start free in beta
              <ArrowRight size={16} aria-hidden />
            </TrackedLink>
            <a
              href="#how-it-works"
              className="flex min-h-11 items-center justify-center rounded-full border border-dunlo-line px-5 text-sm font-semibold text-dunlo-ink transition-colors hover:bg-dunlo-ground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dunlo-deep"
            >
              See how Dunlo works
            </a>
          </div>
        </div>

        <div className="border-t border-dunlo-line bg-dunlo-ground p-4 md:p-7 lg:border-l lg:border-t-0">
          <div className="h-full rounded-xl border border-dunlo-line bg-white p-4 md:p-6">
            <div className="flex items-center justify-between gap-4 border-b-2 border-dunlo-ink pb-4 text-xs font-semibold">
              <span>Payment recovery preview</span>
              <span className="text-dunlo-deep">Example data</span>
            </div>
            <div className="divide-y divide-dunlo-line">
              {RECOVERY_EXAMPLES.map((example) => (
                <article
                  key={example.stripeCode}
                  className="grid gap-4 py-5 sm:grid-cols-[1fr_auto] sm:items-start"
                >
                  <div>
                    <h2 className="text-sm font-semibold text-dunlo-ink">
                      {example.reason}
                    </h2>
                    <code className="mt-1 block font-mono text-xs text-gray-500">
                      {example.stripeCode}
                    </code>
                    <p className="mt-3 text-sm leading-6 text-gray-700">
                      {example.customerMeaning}
                    </p>
                  </div>
                  <dl className="grid min-w-32 gap-3 text-xs sm:text-right">
                    <div>
                      <dt className="text-gray-500">Action</dt>
                      <dd className="mt-1 font-semibold text-dunlo-ink">
                        {example.action}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Status</dt>
                      <dd className="mt-1 font-semibold text-dunlo-deep">
                        {example.status}
                      </dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
