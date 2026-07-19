import Image from "next/image";
import { TrackedLink } from "@/components/tracked-link";
import { SIGNUP_URL } from "@/lib/app-url";
import { PRODUCT_IMAGES } from "./product-assets";

const STEPS = [
  {
    title: "Connect Stripe",
    body: "OAuth connects the payment context without exposing your Stripe credentials.",
  },
  {
    title: "Let the failure speak",
    body: "Each decline code selects a timing, message, and secure customer action.",
  },
  {
    title: "Recover or review",
    body: "Routine paths run. Sensitive accounts wait for your decision.",
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 overflow-hidden bg-dunlo px-4 py-24 text-dunlo-ink md:px-6 md:py-36"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <h2 className="max-w-4xl text-balance text-4xl font-bold leading-[0.92] tracking-[-0.04em] md:text-7xl">
            One event in Stripe. One clear recovery path.
          </h2>
          <div className="lg:justify-self-end">
            <p className="max-w-[52ch] text-pretty text-base leading-7 text-dunlo-ink/72 md:text-lg md:leading-8">
              Dunlo turns payment failures into a visible sequence your team
              can understand, edit, and trust.
            </p>
            <TrackedLink
              href={SIGNUP_URL}
              eventProperties={{
                button_text: "Start free in beta",
                destination: SIGNUP_URL,
                location: "homepage_how_it_works",
              }}
              className="group mt-7 inline-flex min-h-12 items-center gap-3 rounded-full bg-dunlo-ink px-6 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dunlo-ink focus-visible:ring-offset-2 focus-visible:ring-offset-dunlo"
            >
              Start free in beta
              <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
            </TrackedLink>
          </div>
        </div>

        <div className="mt-16 overflow-hidden rounded-2xl bg-[#0b1822] shadow-[0_8px_0_rgba(5,28,19,0.22)] md:mt-20">
          <Image
            src={PRODUCT_IMAGES.sequences}
            alt="Dunlo recovery sequence for a failed Stripe card payment"
            width={1413}
            height={1080}
            sizes="(min-width: 1440px) 1400px, 100vw"
            className="h-auto w-full"
          />
        </div>

        <ol className="mt-10 grid border-t border-dunlo-ink/28 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="border-b border-dunlo-ink/28 py-7 md:border-b-0 md:border-r md:px-7 md:first:pl-0 md:last:border-r-0"
            >
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-xs font-bold text-dunlo-ink/46">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-xl font-bold">{step.title}</h3>
              </div>
              <p className="mt-3 max-w-[36ch] pl-8 text-sm leading-6 text-dunlo-ink/68">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
