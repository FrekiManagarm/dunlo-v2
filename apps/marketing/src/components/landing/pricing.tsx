import { ArrowRight, Check } from "lucide-react";
import { TrackedLink } from "@/components/tracked-link";
import { SIGNUP_URL } from "@/lib/app-url";
import { PRICING_FEATURES } from "./landing-content";

export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-24 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
        <div>
          <p className="text-sm font-semibold text-dunlo-deep">Beta pricing</p>
          <h2 className="mt-4 max-w-xl text-balance text-4xl font-semibold leading-none tracking-[-0.03em] text-dunlo-ink md:text-6xl">Free during beta. No recovery cut.</h2>
          <p className="mt-6 max-w-[62ch] text-pretty text-base leading-7 text-gray-700">Dunlo will communicate any pricing change before billing starts.</p>
        </div>
        <div className="grid overflow-hidden rounded-2xl border border-dunlo-line bg-white md:grid-cols-[0.78fr_1.22fr]">
          <div className="bg-dunlo-ink p-6 text-white md:p-8">
            <p className="text-sm font-semibold text-dunlo">Beta plan</p>
            <p className="mt-8 font-mono text-5xl font-semibold">$0</p>
            <p className="mt-2 text-sm text-white/75">until beta ends</p>
            <TrackedLink
              href={SIGNUP_URL}
              eventProperties={{ button_text: "Start free in beta", destination: SIGNUP_URL, location: "homepage_pricing" }}
              className="mt-8 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-dunlo px-5 text-sm font-semibold text-dunlo-ink transition-colors hover:bg-dunlo-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-dunlo-ink"
            >
              Start free in beta <ArrowRight size={16} aria-hidden />
            </TrackedLink>
          </div>
          <ul className="divide-y divide-dunlo-line">
            {PRICING_FEATURES.map((feature) => (
              <li key={feature} className="flex min-h-14 items-center gap-3 px-5 py-4 text-sm font-semibold text-gray-800">
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
