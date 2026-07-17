import { ArrowRight, Check } from "lucide-react";
import { TrackedLink } from "@/components/tracked-link";
import { SIGNUP_URL } from "@/lib/app-url";
import { PRICING_FEATURES } from "./landing-content";

export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-24 bg-dunlo-ground px-4 py-24 md:px-6 md:py-36">
      <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <div>
          <p className="text-sm font-semibold text-dunlo-deep">Beta pricing</p>
          <h2 className="mt-5 max-w-xl text-balance text-4xl font-bold leading-[0.94] tracking-[-0.04em] text-dunlo-ink md:text-6xl">Free during beta. No recovery cut.</h2>
          <p className="mt-6 max-w-[62ch] text-pretty text-base leading-7 text-gray-700">Dunlo will communicate any pricing change before billing starts.</p>
        </div>
        <div className="grid overflow-hidden rounded-2xl bg-white md:grid-cols-[0.78fr_1.22fr]">
          <div className="flex flex-col justify-between bg-dunlo-ink p-7 text-white md:p-9">
            <div>
            <p className="text-sm font-semibold text-dunlo">Beta plan</p>
            <p className="mt-8 text-6xl font-bold tracking-[-0.04em]">$0</p>
            <p className="mt-2 text-sm text-white/75">until beta ends</p>
            </div>
            <TrackedLink
              href={SIGNUP_URL}
              eventProperties={{ button_text: "Start free in beta", destination: SIGNUP_URL, location: "homepage_pricing" }}
              className="mt-10 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-dunlo px-5 text-sm font-bold text-dunlo-ink transition-transform hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-dunlo-ink"
            >
              Start free in beta <ArrowRight size={16} aria-hidden />
            </TrackedLink>
          </div>
          <ul className="divide-y divide-dunlo-line">
            {PRICING_FEATURES.map((feature) => (
              <li key={feature} className="flex min-h-16 items-center gap-4 px-6 py-4 text-sm font-semibold text-gray-800">
                <Check size={16} className="text-dunlo-deep" aria-hidden />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
