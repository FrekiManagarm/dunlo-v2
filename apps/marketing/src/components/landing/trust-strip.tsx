import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { TRUST_ITEMS } from "./landing-content";

export function TrustStrip() {
  return (
    <section id="trust" className="scroll-mt-24 bg-dunlo-ink px-4 pb-16 text-white md:px-6 md:pb-24">
      <div className="mx-auto grid max-w-[1400px] border-y border-white/14 sm:grid-cols-2 lg:grid-cols-4">
        {TRUST_ITEMS.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="group min-h-32 border-b border-white/14 px-1 py-6 last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-dunlo sm:border-r sm:px-6 sm:last:border-r-0 sm:[&:nth-child(2)]:border-r-0 sm:[&:nth-last-child(-n+2)]:border-b-0 lg:border-b-0 lg:[&:nth-child(2)]:border-r lg:last:border-r-0"
          >
            <h2 className="flex items-center justify-between gap-3 text-sm font-semibold text-white group-hover:text-dunlo">
              <span>{item.title}</span>
              <ArrowUpRight
                className="shrink-0 text-dunlo transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                size={15}
                aria-hidden
              />
            </h2>
            <p className="mt-3 max-w-[30ch] text-sm leading-6 text-white/58">{item.body}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
