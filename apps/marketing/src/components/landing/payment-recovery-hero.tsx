import Image from "next/image";
import { SIGNUP_URL } from "@/lib/app-url";
import { TrackedLink } from "@/components/tracked-link";
import { PRODUCT_IMAGES } from "./product-assets";

export function PaymentRecoveryHero() {
  return (
    <section className="relative flex min-h-[100dvh] items-center overflow-hidden bg-dunlo-ink px-4 pb-12 pt-28 text-white md:px-6 md:pb-16 md:pt-32">
      <div className="landing-orbit" aria-hidden="true" />
      <div className="relative mx-auto grid w-full max-w-[1400px] gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-4">
        <div className="relative z-10 max-w-2xl lg:pb-16 lg:pt-10">
          <div className="anim-1 flex items-center gap-3 text-sm font-semibold text-white/72">
            <span className="size-2 rounded-full bg-dunlo" />
            Free during beta · no recovery cut
          </div>
          <h1 className="anim-2 mt-7 text-balance text-[clamp(3rem,5.7vw,5.5rem)] font-bold leading-[0.92] tracking-[-0.04em]">
            Recover failed payments. Keep the customer.
          </h1>
          <p className="anim-3 mt-7 max-w-[58ch] text-pretty text-base leading-7 text-white/72 md:text-lg md:leading-8">
            Dunlo reads the Stripe failure, chooses the right recovery path,
            and gives sensitive accounts back to a human before the message
            goes out.
          </p>
          <div className="anim-4 mt-9 flex flex-col gap-3 sm:flex-row">
            <TrackedLink
              href={SIGNUP_URL}
              eventProperties={{
                button_text: "Start free in beta",
                destination: SIGNUP_URL,
                location: "homepage_hero",
              }}
              className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-dunlo px-6 text-sm font-bold text-dunlo-ink transition-transform duration-300 ease-out hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-dunlo-ink"
            >
              Start free in beta
              <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">→</span>
            </TrackedLink>
            <a
              href="#how-it-works"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/24 px-6 text-sm font-semibold text-white transition-colors hover:border-white/60 hover:bg-white/6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Explore the product
            </a>
          </div>
          <div className="anim-5 mt-12 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/14 pt-5 text-xs font-medium text-white/55">
            <span>Stripe OAuth</span>
            <span>No card storage</span>
            <span>Founder review</span>
          </div>
        </div>

        <div className="anim-3 relative min-w-0 lg:-mr-[18vw] lg:translate-x-8">
          <div className="landing-product-float">
            <div className="landing-product-frame overflow-hidden rounded-2xl bg-[#0b1822]">
              <Image
                src={PRODUCT_IMAGES.overview}
                alt="Dunlo dashboard showing failed payments, recovery status, and revenue at risk"
                width={1407}
                height={1080}
                priority
                sizes="(min-width: 1024px) 72vw, 100vw"
                className="h-auto w-full"
              />
            </div>
          </div>
          <p className="mt-4 text-right font-mono text-[11px] text-white/45">
            Product capture · example workspace
          </p>
        </div>
      </div>
    </section>
  );
}
