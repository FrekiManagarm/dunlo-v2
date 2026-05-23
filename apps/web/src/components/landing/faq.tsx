import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { usePostHog } from "posthog-js/react";
import { FadeIn } from "./shared";

const FAQ_ITEMS = [
  {
    q: "Does Dunlo work with Stripe Connect?",
    a: "Yes. Dunlo connects to both standard Stripe accounts and Stripe Connect platforms. We read your payment intents and customer data to detect failed payments and trigger recovery flows.",
  },
  {
    q: "What happens after the beta?",
    a: "During beta, every plan is free. When we launch, you'll pick the tier that fits your MRR. We'll give you a 2-week heads-up before any billing starts.",
  },
  {
    q: "Will my recovery emails go to spam?",
    a: "Dunlo sends from your domain via your own email provider. You control deliverability. We avoid spam-trigger patterns and our templates are written for high inbox placement.",
  },
  {
    q: "How long does setup take?",
    a: "About 5 minutes: connect Stripe, add your email provider, review the default sequences. No code, no engineering team needed.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. No lock-in. During beta there's nothing to cancel. After launch, you can downgrade or pause at any time from your dashboard.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const posthog = usePostHog();

  return (
    <FadeIn>
      <section
        id="faq"
        className="overflow-hidden rounded-3xl border border-gray-200/60 bg-white p-8 md:p-12"
      >
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[2fr_3fr]">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
              Still have questions?
              <br />
              We have the answers.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-gray-500">
              Can't find what you're looking for?{" "}
              <a
                href="mailto:hello@dunlo.io"
                className="font-semibold text-dunlo-dim hover:underline"
              >
                Email us
              </a>
            </p>
          </div>

          <div className="divide-y divide-gray-100">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i}>
                <button
                  onClick={() => {
                    const isOpening = open !== i;
                    setOpen(open === i ? null : i);
                    if (isOpening)
                      posthog.capture("faq_item_expanded", { question: item.q });
                  }}
                  className="flex w-full items-center justify-between py-5 text-left"
                  aria-expanded={open === i}
                >
                  <span className="pr-4 text-sm font-semibold text-gray-900">
                    {item.q}
                  </span>
                  <ChevronDown
                    size={15}
                    className={`shrink-0 text-gray-400 transition-transform duration-300 ${open === i ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 text-sm leading-relaxed text-gray-500">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>
    </FadeIn>
  );
}
