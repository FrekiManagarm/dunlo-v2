import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef } from "react";
import { FadeIn } from "./shared";

function CountUp({ to, inView }: { to: number; inView: boolean }) {
  const raw = useMotionValue(0);
  const spring = useSpring(raw, { stiffness: 55, damping: 18 });
  const rounded = useTransform(spring, Math.round);

  useEffect(() => {
    if (inView) raw.set(to);
  }, [inView, raw, to]);

  return <motion.span>{rounded}</motion.span>;
}

const STATS = [
  {
    prefix: "~",
    value: 7,
    suffix: "%",
    label: "of recurring payments can fail in a typical month",
    source: "Stripe",
  },
  {
    prefix: "",
    value: 40,
    suffix: "%",
    label: "of churn can be involuntary when payments fail",
    source: "ProfitWell",
    note: "up to",
  },
  {
    prefix: "",
    value: 63,
    suffix: "%",
    label: "of failed payments may be recoverable with the right follow-up",
    source: "Stripe",
  },
];

export function StatsBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <FadeIn>
      <section
        ref={ref}
        className="overflow-hidden rounded-3xl border border-gray-200/60 bg-white"
      >
        <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="border-b border-gray-100 px-8 py-8 md:py-10 lg:border-r lg:border-b-0">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-dunlo-deep">
              Why it matters
            </p>
            <h2 className="mt-4 max-w-md text-3xl font-semibold tracking-tight text-gray-950 md:text-4xl">
              Failed payments are often recoverable revenue, not lost customers.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-gray-600">
              If you are new to payment recovery, start here: some churn happens
              because billing failed. If you already know dunning, the key is
              precision by failure reason.
            </p>
          </div>
          <div className="grid grid-cols-1 divide-y divide-gray-100 md:grid-cols-3 md:divide-x md:divide-y-0 lg:grid-cols-1 lg:divide-x-0 xl:grid-cols-3 xl:divide-x xl:divide-y-0">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="flex flex-col gap-2 px-8 py-8 md:py-10"
              >
                <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  {stat.source}
                </span>
                <p className="font-sans text-[2.6rem] font-bold leading-none tracking-tighter text-gray-900">
                  {stat.note && (
                    <span className="mr-1 text-xl font-semibold text-gray-400">
                      {stat.note}
                    </span>
                  )}
                  <span className="text-dunlo">
                    {stat.prefix}
                    <CountUp to={stat.value} inView={inView} />
                    {stat.suffix}
                  </span>
                </p>
                <p className="max-w-[22ch] text-sm leading-relaxed text-gray-500">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </FadeIn>
  );
}
