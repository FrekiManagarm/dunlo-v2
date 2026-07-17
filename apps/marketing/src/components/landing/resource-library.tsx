import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RESOURCE_LINKS } from "./landing-content";

export function ResourceLibrary() {
  return (
    <section className="bg-white px-4 pb-24 md:px-6 md:pb-32">
      <div className="mx-auto max-w-[1400px] border-t border-dunlo-line pt-10">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold text-dunlo-deep">Explore further</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-dunlo-ink">Stripe payment recovery resources</h2>
          </div>
          <Link href="/blog" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-dunlo-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dunlo-deep focus-visible:ring-offset-2">Browse all resources <ArrowRight size={14} aria-hidden /></Link>
        </div>
        <div className="mt-6 grid border-y border-dunlo-line md:grid-cols-2">
          {RESOURCE_LINKS.map((item) => (
            <Link key={item.href} href={item.href} className="group border-b border-dunlo-line py-6 last:border-b-0 odd:md:border-r odd:md:pr-7 even:md:pl-7 md:[&:nth-last-child(-n+2)]:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-dunlo-deep">
              <h3 className="text-lg font-bold text-dunlo-ink group-hover:text-dunlo-deep">{item.title} <span className="ml-2 text-dunlo-deep transition-transform group-hover:translate-x-1" aria-hidden="true">→</span></h3>
              <p className="mt-2 text-sm leading-6 text-gray-700">{item.body}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
