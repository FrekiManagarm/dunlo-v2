import { ArrowRight } from "lucide-react";
import { TrackedLink } from "@/components/tracked-link";
import { SIGNUP_URL } from "@/lib/app-url";

export function FinalCta() {
  return (
    <section className="bg-dunlo px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto grid max-w-[1400px] gap-10 text-dunlo-ink lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-sm font-semibold">Private, read-only first</p>
          <h2 className="mt-5 max-w-5xl text-balance text-4xl font-bold leading-[0.92] tracking-[-0.04em] md:text-7xl">
            See the number before you automate the recovery.
          </h2>
        </div>
        <TrackedLink
          href={SIGNUP_URL}
          eventProperties={{
            button_text: "Run my private diagnostic",
            destination: SIGNUP_URL,
            location: "homepage_final_cta",
          }}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-dunlo-ink px-6 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dunlo-ink focus-visible:ring-offset-2 focus-visible:ring-offset-dunlo"
        >
          Run my private diagnostic <ArrowRight size={16} aria-hidden />
        </TrackedLink>
      </div>
    </section>
  );
}
