const LOGOS = [
  "Stripe",
  "Notion",
  "Linear",
  "Vercel",
  "Figma",
  "Loom",
  "Intercom",
  "Segment",
  "Mixpanel",
  "Heap",
];

export function LogoMarquee() {
  return (
    <section className="mt-10 overflow-hidden py-8">
      <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-gray-400">
        Trusted by fast-growing SaaS teams
      </p>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-linear-to-r from-stone-100 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-linear-to-l from-stone-100 to-transparent" />
        <div
          className="flex animate-marquee gap-12"
          style={{ width: "max-content" }}
        >
          {[...LOGOS, ...LOGOS].map((name, i) => (
            <span
              key={i}
              className="whitespace-nowrap text-base font-semibold tracking-tight text-gray-400/60"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
