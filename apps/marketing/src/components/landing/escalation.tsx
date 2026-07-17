import { TrackedLink } from "@/components/tracked-link";
import { SIGNUP_URL } from "@/lib/app-url";
import { ArrowRight, ShieldCheck } from "lucide-react";

export function Escalation() {
  return (
    <section
      id="founder-review"
      className="scroll-mt-24 overflow-hidden rounded-2xl bg-dunlo-ink text-white"
    >
      <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
        <div className="p-6 md:p-10 lg:p-12">
          <p className="text-sm font-semibold text-dunlo">
            Keep important customer moments human
          </p>
          <h2 className="mt-4 max-w-xl text-balance text-4xl font-semibold leading-none tracking-[-0.03em] md:text-6xl">
            Routine recovery can run. Sensitive accounts can pause.
          </h2>
          <p className="mt-6 max-w-[62ch] text-pretty text-base leading-7 text-white/80">
            Dunlo prepares the Stripe context and a customer-safe draft. The
            founder decides whether anything is sent.
          </p>
          <TrackedLink
            href={SIGNUP_URL}
            eventProperties={{
              button_text: "Start with founder control",
              destination: SIGNUP_URL,
              location: "homepage_founder_review",
            }}
            className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-dunlo px-5 text-sm font-semibold text-dunlo-ink"
          >
            Start with founder control
            <ArrowRight size={16} aria-hidden />
          </TrackedLink>
        </div>

        <div className="border-t border-white/15 bg-white/5 p-4 md:p-8 lg:border-l lg:border-t-0">
          <article className="rounded-xl bg-white p-5 text-dunlo-ink md:p-7">
            <div className="flex items-start justify-between gap-4 border-b border-dunlo-line pb-5">
              <div>
                <p className="text-xs font-semibold text-dunlo-deep">
                  Example product preview
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                  Founder review prepared
                </h3>
              </div>
              <ShieldCheck className="text-dunlo-deep" aria-hidden />
            </div>
            <dl className="grid gap-4 border-b border-dunlo-line py-5 sm:grid-cols-3">
              <div>
                <dt className="text-xs text-gray-600">Account</dt>
                <dd className="mt-1 text-sm font-semibold">High value</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-600">Failure</dt>
                <dd className="mt-1 font-mono text-sm font-semibold">
                  authentication_required
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-600">Status</dt>
                <dd className="mt-1 text-sm font-semibold text-dunlo-deep">
                  Paused
                </dd>
              </div>
            </dl>
            <div className="py-5">
              <p className="text-xs font-semibold text-gray-600">
                Prepared draft
              </p>
              <p className="mt-3 text-sm leading-7 text-gray-800">
                Your bank needs one more approval before the subscription
                payment can complete. The secure link below returns you to
                Stripe to finish that step.
              </p>
            </div>
            <p className="border-t border-dunlo-line pt-4 text-xs leading-5 text-gray-600">
              Nothing is sent until the founder reviews the account and draft.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
