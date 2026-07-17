import Image from "next/image";
import { TrackedLink } from "@/components/tracked-link";
import { SIGNUP_URL } from "@/lib/app-url";
import { PRODUCT_IMAGES } from "./product-assets";

export function Escalation() {
  return (
    <section
      id="founder-review"
      className="scroll-mt-24 overflow-hidden bg-dunlo-ink px-4 py-24 text-white md:px-6 md:py-36"
    >
      <div className="mx-auto grid max-w-[1400px] gap-14 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-dunlo">Founder review</p>
          <h2 className="mt-5 text-balance text-4xl font-bold leading-[0.94] tracking-[-0.04em] md:text-6xl">
            Automation knows when to stop.
          </h2>
          <p className="mt-7 max-w-[52ch] text-pretty text-base leading-7 text-white/68 md:text-lg md:leading-8">
            High-value or ambiguous failures land in a focused review queue.
            Dunlo prepares the Stripe context and a draft. You decide what the
            customer receives.
          </p>
          <dl className="mt-10 grid grid-cols-2 border-y border-white/14 py-6 text-sm">
            <div>
              <dt className="text-white/45">Failure context</dt>
              <dd className="mt-2 font-semibold text-white">At a glance</dd>
            </div>
            <div>
              <dt className="text-white/45">Before send</dt>
              <dd className="mt-2 font-semibold text-dunlo">Founder decides</dd>
            </div>
          </dl>
          <TrackedLink
            href={SIGNUP_URL}
            eventProperties={{
              button_text: "Start with founder control",
              destination: SIGNUP_URL,
              location: "homepage_founder_review",
            }}
            className="group mt-8 inline-flex min-h-12 items-center gap-3 rounded-full bg-white px-6 text-sm font-bold text-dunlo-ink transition-transform hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-dunlo-ink"
          >
            Start with founder control
            <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
          </TrackedLink>
        </div>

        <div className="relative min-w-0 lg:-mr-[12vw]">
          <div className="overflow-hidden rounded-2xl bg-[#0b1822] shadow-[0_8px_0_rgba(0,232,123,0.38)]">
            <Image
              src={PRODUCT_IMAGES.escalations}
              alt="Dunlo founder escalation queue with Stripe payment context and a prepared recovery email"
              width={1410}
              height={1080}
              sizes="(min-width: 1024px) 68vw, 100vw"
              className="h-auto w-full"
            />
          </div>
          <p className="mt-4 text-right font-mono text-[11px] text-white/42">
            Product capture · example workspace
          </p>
        </div>
      </div>
    </section>
  );
}
