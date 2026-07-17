import { ArrowRight } from "lucide-react";
import { TrackedLink } from "@/components/tracked-link";
import { SIGNUP_URL } from "@/lib/app-url";

export function FinalCta() {
  return (
    <section className="px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto grid max-w-7xl gap-8 rounded-2xl bg-dunlo px-6 py-10 text-dunlo-ink md:px-10 md:py-14 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-sm font-semibold">Free during beta</p>
          <h2 className="mt-4 max-w-4xl text-balance text-4xl font-semibold leading-none tracking-[-0.03em] md:text-6xl">Recover the payment. Keep the customer relationship intact.</h2>
        </div>
        <TrackedLink
          href={SIGNUP_URL}
          eventProperties={{ button_text: "Start free in beta", destination: SIGNUP_URL, location: "homepage_final_cta" }}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-dunlo-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dunlo-ink focus-visible:ring-offset-2 focus-visible:ring-offset-dunlo"
        >
          Start free in beta <ArrowRight size={16} aria-hidden />
        </TrackedLink>
      </div>
    </section>
  );
}
