import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FadeIn, SectionPill } from "./shared";

const CYCLE_MS = 5000;

function ProgressBar({ duration }: { duration: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const raf = requestAnimationFrame(() => {
      if (el) el.style.transform = "scaleX(1)";
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={ref}
      style={{
        height: "2px",
        borderRadius: "999px",
        backgroundColor: "var(--dunlo-accent)",
        transform: "scaleX(0)",
        transformOrigin: "left",
        transition: `transform ${duration}ms linear`,
        marginTop: "12px",
        width: "100%",
      }}
    />
  );
}

const FEATURE_ITEMS = [
  {
    tag: "Detect",
    headline: "Every failure type has a different fix.",
    body: "Card expired, insufficient funds, bank declined — each tells a different story. Dunlo reads the Stripe failure code and sends the exact right email at the exact right moment. Generic retries are gone.",
    visual: (
      <div className="space-y-2.5 p-6">
        {[
          {
            code: "card_declined",
            label: "Bank declined",
            action: "Send bank update template",
            color: "bg-red-50 border-red-200 text-red-700",
          },
          {
            code: "expired_card",
            label: "Card expired",
            action: "Send secure update link",
            color: "bg-amber-50 border-amber-200 text-amber-700",
          },
          {
            code: "insufficient_funds",
            label: "Insufficient funds",
            action: "Schedule timed retry",
            color: "bg-blue-50 border-blue-200 text-blue-700",
          },
          {
            code: "do_not_honor",
            label: "Generic decline",
            action: "Escalate if > €500",
            color: "bg-dunlo/8 border-dunlo/25 text-dunlo-deep",
          },
        ].map((item) => (
          <div
            key={item.code}
            className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
          >
            <div>
              <p className="text-xs font-semibold text-gray-900">
                {item.label}
              </p>
              <p className="font-mono text-[10px] text-gray-400">{item.code}</p>
            </div>
            <span
              className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${item.color}`}
            >
              {item.action}
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    tag: "Recover",
    headline: "Automated sequences that feel human.",
    body: "Pre-built email flows tailored to each failure type. Your customers receive a clear, personal message with the right CTA — not a cold automated blast. Average recovery starts within 3 minutes of failure.",
    visual: (
      <div className="space-y-3 p-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-dunlo/15 text-[10px] font-bold text-dunlo-deep">
              JR
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900">
                dunlo recovery
              </p>
              <p className="text-[10px] text-gray-400">
                to: james.r@meridian.io
              </p>
            </div>
            <span className="ml-auto rounded-full border border-dunlo/25 bg-dunlo/8 px-2 py-0.5 text-[10px] font-semibold text-dunlo-deep">
              Sent · 3 min ago
            </span>
          </div>
          <p className="mb-1 text-xs font-semibold text-gray-900">
            Your payment didn't go through
          </p>
          <p className="text-[11px] leading-relaxed text-gray-500">
            Hi James, your card ending in 4242 was declined. Tap below to update
            your payment details and keep your subscription active.
          </p>
          <div className="mt-3 inline-flex rounded-full bg-dunlo px-4 py-1.5 text-[11px] font-semibold text-white">
            Update payment →
          </div>
        </div>
        <div className="flex items-center gap-2 px-2">
          <div className="h-px flex-1 bg-gray-100" />
          <p className="text-[10px] text-gray-400">
            Opened · 4.2 min after send
          </p>
          <div className="h-px flex-1 bg-gray-100" />
        </div>
        <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
          <p className="text-[11px] font-semibold text-gray-900">
            Payment recovered <span className="text-dunlo-dim">€890</span>
          </p>
          <p className="mt-0.5 text-[10px] text-gray-400">
            Card updated · 8 min after email
          </p>
        </div>
      </div>
    ),
  },
  {
    tag: "Escalate",
    headline:
      "High-value failures get a human response — drafted by AI, sent by you.",
    body: "Set your threshold. When a failed payment crosses it, Dunlo stops the automation and drafts a personal email from you instead. Review, regenerate, or send — your call.",
    visual: (
      <div className="space-y-3 p-6">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="rounded-full border border-red-200 bg-red-100 px-2.5 py-0.5 text-[10px] font-bold text-red-700">
                ESCALATION
              </span>
              <p className="mt-2 text-sm font-bold text-gray-900">
                Orbis Finance · €3,500/mo
              </p>
              <p className="mt-0.5 text-[11px] text-gray-500">
                Bank declined · 12 min ago
              </p>
            </div>
            <TrendingUp size={18} className="mt-1 text-red-500" />
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="mb-2 text-[11px] font-semibold text-gray-500">
            AI draft ready — review, regenerate, or send
          </p>
          <p className="text-xs leading-relaxed text-gray-800">
            "Hey Marcus, I saw your card didn't go through today. Given what
            you're building at Orbis, I wanted to reach out personally..."
          </p>
          <div className="mt-3 flex gap-2">
            <button className="flex-1 rounded-full bg-dunlo py-2 text-[11px] font-semibold text-white">
              Send
            </button>
            <button className="rounded-full border border-gray-200 px-3 py-2 text-[11px] font-semibold text-gray-600">
              Regenerate
            </button>
            <button className="rounded-full border border-gray-200 px-3 py-2 text-[11px] font-semibold text-gray-600">
              Dismiss
            </button>
          </div>
        </div>
      </div>
    ),
  },
];

export function Features() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setTimeout(
      () => setActive((p) => (p + 1) % FEATURE_ITEMS.length),
      CYCLE_MS,
    );
    return () => clearTimeout(t);
  }, [active]);

  return (
    <FadeIn>
      <section
        id="features"
        className="overflow-hidden rounded-3xl border border-gray-200/60 bg-white"
      >
        <div className="p-8 md:p-12 lg:p-14">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <SectionPill>Recovery</SectionPill>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
                Built for real churn scenarios.
              </h2>
              <p className="mt-3 max-w-md text-base text-gray-500">
                Not a generic retry tool. Every feature maps to a specific
                Stripe failure code.
              </p>
            </div>
            <Link
              to="/login"
              className="hidden shrink-0 items-center gap-1.5 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-gray-700 active:scale-[0.97] md:flex"
            >
              Start recovering
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:h-[438px] md:grid-cols-[2fr_3fr]">
            <div className="space-y-1">
              {FEATURE_ITEMS.map((f, i) => (
                <button
                  key={f.tag}
                  onClick={() => setActive(i)}
                  className={`w-full rounded-2xl border px-5 py-4 text-left transition-all duration-200 ${
                    active === i
                      ? "border-gray-200 bg-gray-50"
                      : "border-transparent hover:bg-gray-50/60"
                  }`}
                >
                  <div
                    className={`mb-1 flex items-center gap-2 ${active === i ? "text-dunlo-deep" : "text-gray-400"}`}
                  >
                    <div
                      className={`size-1.5 rounded-full transition-colors ${active === i ? "bg-dunlo" : "bg-gray-300"}`}
                    />
                    <span className="text-[11px] font-bold uppercase tracking-widest">
                      {f.tag}
                    </span>
                  </div>
                  <h3
                    className={`min-h-10 text-sm font-semibold leading-snug transition-colors ${active === i ? "text-gray-900" : "text-gray-400"}`}
                  >
                    {f.headline}
                  </h3>
                  {active === i && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="mt-2 h-36 overflow-hidden md:h-32"
                    >
                      <p className="text-sm leading-relaxed text-gray-500">
                        {f.body}
                      </p>
                      <ProgressBar key={active} duration={CYCLE_MS} />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>

            <div className="relative min-h-[380px] overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/70 md:min-h-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0"
                >
                  {FEATURE_ITEMS[active].visual}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </FadeIn>
  );
}
