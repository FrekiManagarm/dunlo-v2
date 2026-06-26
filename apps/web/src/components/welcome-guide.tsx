import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Link2, Mail, TrendingUp, X, Zap } from "lucide-react";

const STEPS = [
  {
    Icon: Link2,
    label: "Step 1 of 4",
    title: "Connect Stripe",
    description:
      "Link your Stripe account in seconds. Dunlo immediately starts watching every payment — no code required.",
  },
  {
    Icon: Zap,
    label: "Step 2 of 4",
    title: "Failed payments detected",
    description:
      "The moment a charge fails, Dunlo catches it automatically and queues it for recovery in real time.",
  },
  {
    Icon: Mail,
    label: "Step 3 of 4",
    title: "Recovery emails sent",
    description:
      "Personalized email sequences reach your customers at exactly the right time, with your brand and tone.",
  },
  {
    Icon: TrendingUp,
    label: "Step 4 of 4",
    title: "Revenue recovered",
    description:
      "Track every dollar recovered. Most teams recover 40–60% of failed payments within their first week.",
  },
] as const;

const SPRING = { type: "spring" as const, stiffness: 320, damping: 28 };
const FAST_SPRING = { type: "spring" as const, stiffness: 400, damping: 30 };

interface WelcomeGuideProps {
  open: boolean;
  onClose: () => void;
}

export function WelcomeGuide({ open, onClose }: WelcomeGuideProps) {
  const [step, setStep] = useState(0);
  const dirRef = useRef(1);

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  const next = () => {
    if (step === STEPS.length - 1) {
      onClose();
      return;
    }
    dirRef.current = 1;
    setStep((s) => s + 1);
  };

  const goTo = (i: number) => {
    dirRef.current = i > step ? 1 : -1;
    setStep(i);
  };

  const { Icon, label, title, description } = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/20 px-4 backdrop-blur-[3px]"
        >
          <motion.div
            key="modal"
            initial={{ scale: 0.94, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 12 }}
            transition={SPRING}
            className="relative flex w-full max-w-150 overflow-hidden rounded-4xl bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.10),0_0_0_1px_rgba(0,0,0,0.05)]"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 flex size-7 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 active:scale-95"
              aria-label="Close guide"
            >
              <X size={13} />
            </button>

            {/* Left panel */}
            <div className="hidden w-52.5 shrink-0 flex-col items-center justify-center gap-6 bg-[#f2fdf8] sm:flex">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={FAST_SPRING}
                  className="relative flex items-center justify-center"
                >
                  <div className="absolute size-32.5 rounded-full border border-dunlo/10" />
                  <div className="absolute size-22 rounded-full border border-dunlo/15" />
                  <div className="relative z-10 flex size-15 items-center justify-center rounded-2xl bg-white shadow-[0_6px_24px_-6px_rgba(0,232,123,0.28),0_0_0_1px_rgba(0,232,123,0.14)]">
                    <Icon size={22} strokeWidth={1.75} className="text-dunlo" />
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Vertical step track */}
              <div className="flex flex-col items-center gap-1.5">
                {STEPS.map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      height: i === step ? 20 : 6,
                      backgroundColor:
                        i === step
                          ? "var(--color-dunlo)"
                          : i < step
                            ? "rgba(0,232,123,0.35)"
                            : "rgba(0,0,0,0.10)",
                    }}
                    transition={FAST_SPRING}
                    className="w-0.75 rounded-full"
                  />
                ))}
              </div>
            </div>

            {/* Right panel */}
            <div className="flex flex-1 flex-col justify-between p-8 pb-7">
              <div className="mb-8 mt-1 min-h-32.5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: dirRef.current * 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: dirRef.current * -18 }}
                    transition={SPRING}
                  >
                    <p className="mb-3 text-[10.5px] font-bold uppercase tracking-[0.12em] text-dunlo">
                      {label}
                    </p>
                    <h2 className="mb-3 text-[21px] font-semibold leading-snug tracking-tight text-zinc-900">
                      {title}
                    </h2>
                    <p className="max-w-[36ch] text-[13.5px] leading-relaxed text-zinc-500">
                      {description}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {STEPS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      aria-label={`Go to step ${i + 1}`}
                      className="group flex items-center"
                    >
                      <motion.div
                        animate={{
                          width: i === step ? 20 : 6,
                          backgroundColor:
                            i === step
                              ? "var(--color-dunlo)"
                              : i < step
                                ? "rgba(0,232,123,0.4)"
                                : "rgb(228,228,231)",
                        }}
                        transition={FAST_SPRING}
                        className="h-1.5 rounded-full group-hover:opacity-80"
                      />
                    </button>
                  ))}
                </div>

                <motion.button
                  onClick={next}
                  whileTap={{ scale: 0.97 }}
                  className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold transition-colors ${
                    isLast
                      ? "bg-dunlo text-white shadow-[0_6px_24px_-6px_rgba(0,232,123,0.5)] hover:bg-dunlo-hover"
                      : "bg-zinc-900 text-white hover:bg-zinc-800"
                  }`}
                >
                  {isLast ? "Let's go" : "Continue"}
                  <ArrowRight size={13} strokeWidth={2.5} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
