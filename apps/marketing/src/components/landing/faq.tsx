import { ChevronRight } from "lucide-react";
import { FAQ_ITEMS } from "./landing-content";

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-24 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[0.68fr_1.32fr]">
        <h2 className="max-w-lg text-balance text-4xl font-semibold leading-none tracking-[-0.03em] text-dunlo-ink md:text-6xl">Straight answers before you connect Stripe.</h2>
        <div className="border-y-2 border-dunlo-ink">
          {FAQ_ITEMS.map((item, index) => (
            <details key={item.question} className="group border-b border-dunlo-line last:border-b-0" open={index === 0}>
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 py-3 text-lg font-semibold marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-dunlo-deep [&::-webkit-details-marker]:hidden">
                {item.question}<ChevronRight size={18} className="shrink-0 transition-transform group-open:rotate-90" aria-hidden />
              </summary>
              <p className="max-w-3xl pb-5 text-sm leading-6 text-gray-700">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
