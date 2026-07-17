import Link from "next/link";
import { TRUST_ITEMS } from "./landing-content";

export function TrustStrip() {
  return (
    <section id="trust" className="scroll-mt-24 px-4 md:px-6">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-xl border border-dunlo-ink bg-white sm:grid-cols-2 lg:grid-cols-4">
        {TRUST_ITEMS.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="group min-h-28 border-b border-dunlo-line p-5 last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-dunlo-deep sm:border-r sm:last:border-r-0 sm:[&:nth-child(2)]:border-r-0 sm:[&:nth-last-child(-n+2)]:border-b-0 lg:border-b-0 lg:[&:nth-child(2)]:border-r lg:last:border-r-0"
          >
            <h2 className="text-sm font-semibold text-dunlo-ink group-hover:text-dunlo-deep">
              {item.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-700">{item.body}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
