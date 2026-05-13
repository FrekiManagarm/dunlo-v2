import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronRight,
  Star,
  TrendingUp,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { HeroScene } from "@/components/hero-scene";
import { Logo, LogoMark } from "@/components/logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:url", content: "https://dunlo.io/" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Dunlo",
          applicationCategory: "BusinessApplication",
          description:
            "Stripe payment recovery SaaS that detects failed payments by type and sends automated recovery emails.",
          operatingSystem: "Web",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "EUR",
            description: "Free during beta",
          },
          url: "https://dunlo.io",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Does Dunlo work with Stripe Connect?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. Dunlo connects to both standard Stripe accounts and Stripe Connect platforms. We read your payment intents and customer data to detect failed payments and trigger recovery flows.",
              },
            },
            {
              "@type": "Question",
              name: "What happens after the beta?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "During beta, every plan is free. When we launch, you'll pick the tier that fits your MRR. We'll give you a 2-week heads-up before any billing starts.",
              },
            },
            {
              "@type": "Question",
              name: "Will my recovery emails go to spam?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Dunlo sends from your domain via your own email provider. You control deliverability. We avoid spam-trigger patterns and our templates are written for high inbox placement.",
              },
            },
            {
              "@type": "Question",
              name: "How long does setup take?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "About 5 minutes: connect Stripe, add your email provider, review the default sequences. No code, no engineering team needed.",
              },
            },
            {
              "@type": "Question",
              name: "Can I cancel anytime?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. No lock-in. During beta there's nothing to cancel. After launch, you can downgrade or pause at any time from your dashboard.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: LandingPage,
});

/* ─── Scroll reveal ─────────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] },
  }),
};

function FadeIn({
  children,
  i = 0,
  className = "",
}: {
  children: React.ReactNode;
  i?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      custom={i}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionPill({
  children,
  dark,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) {
  if (dark) {
    return (
      <span className="inline-block rounded-full border border-white/15 px-4 py-1.5 text-sm font-medium text-white/60">
        {children}
      </span>
    );
  }
  return (
    <span className="inline-block rounded-full bg-dunlo px-4 py-1.5 text-sm font-medium text-white">
      {children}
    </span>
  );
}

/* ─── Magnetic CTA button ───────────────────────────────────────────────────── */
function MagneticCtaButton() {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 280, damping: 22 });
  const springY = useSpring(y, { stiffness: 280, damping: 22 });

  const handleMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - (rect.left + rect.width / 2)) * 0.28);
    y.set((e.clientY - (rect.top + rect.height / 2)) * 0.28);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x: springX, y: springY }}
      className="inline-block"
    >
      <Link
        to="/login"
        className="inline-flex items-center gap-0 rounded-full border border-gray-200 bg-white px-2 py-2 shadow-sm transition-shadow hover:shadow-md active:scale-[0.98]"
      >
        <span className="px-4 text-sm font-semibold text-gray-900">
          Get started now
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-dunlo px-4 py-2 text-sm font-semibold text-white">
          for free
          <ChevronRight size={14} />
        </span>
      </Link>
    </motion.div>
  );
}

/* ─── 3D tilt wrapper ───────────────────────────────────────────────────────── */
function TiltContainer({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotateY = useSpring(useTransform(rawX, [-1, 1], [-7, 7]), {
    stiffness: 120,
    damping: 28,
  });
  const rotateX = useSpring(useTransform(rawY, [-1, 1], [5, -5]), {
    stiffness: 120,
    damping: 28,
  });

  const handleMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    rawX.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
    rawY.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
  };

  const handleLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ perspective: "1400px" }}
      className="w-full"
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="w-full"
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ─── Auto-cycle progress bar (CSS transition, zero JS per frame) ───────────── */
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

/* ─── Page ──────────────────────────────────────────────────────────────────── */
function LandingPage() {
  return (
    <div className="min-h-[100dvh] bg-[#e9eaeb] font-sans">
      <Nav />
      <Hero />
      <LogoMarquee />
      <div className="mx-auto max-w-6xl space-y-3 px-3 pb-6 md:space-y-4 md:px-4">
        <Features />
        <Testimonials />
        <HowItWorks />
        <Pricing />
        <Faq />
        <CtaBanner />
      </div>
      <Footer />
    </div>
  );
}

/* ─── Nav ───────────────────────────────────────────────────────────────────── */
function Nav() {
  return (
    <div className="fixed inset-x-0 top-4 z-50 px-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between rounded-full border border-gray-200 bg-white/90 px-4 py-2.5 shadow-sm backdrop-blur-md">
        <Link to="/">
          <Logo size={26} />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {["Features", "Pricing", "FAQ"].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              className="rounded-full px-3.5 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="rounded-full px-3.5 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
          >
            Sign in
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-1.5 rounded-full bg-gray-900 px-4 py-1.5 text-sm font-semibold text-white transition-all hover:bg-gray-700 active:scale-[0.97]"
          >
            Sign up
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Hero — asymmetric split, full viewport ────────────────────────────────── */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Three.js canvas — isolated WebGL context */}
      <HeroScene />

      {/* Geometric arcs — offset right to frame the mockup side */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <div
          className="absolute rounded-full border border-dunlo/8"
          style={{ width: 820, height: 820, top: -180, right: -180 }}
        />
        <div
          className="absolute rounded-full border border-dunlo/4"
          style={{ width: 1300, height: 1300, top: -460, right: -460 }}
        />
        <div className="absolute right-[20%] top-0 h-full w-px bg-gray-200/40" />
      </div>

      {/* Split grid */}
      <div className="relative mx-auto flex min-h-[100dvh] max-w-6xl items-center px-4 pb-20 pt-28 md:px-6 md:pt-24">
        <div className="grid w-full grid-cols-1 items-center gap-14 md:grid-cols-2 md:gap-10 lg:gap-20">
          {/* ── Left: text ── */}
          <div className="flex flex-col">
            <div className="anim-1 mb-7 inline-flex w-fit items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm shadow-sm">
              <span className="font-medium text-gray-700">
                Beta — free to start
              </span>
              <span className="h-3.5 w-px bg-gray-200" />
              <a
                href="#pricing"
                className="flex items-center gap-1 font-semibold text-dunlo-dim hover:underline"
              >
                See plans
                <ArrowUpRight size={13} />
              </a>
            </div>

            <h1 className="anim-2 text-5xl font-bold leading-[1.04] tracking-tight text-gray-900 lg:text-6xl xl:text-[68px]">
              Stop losing
              <br />
              revenue to
              <br />
              failed payments.
            </h1>

            <p className="anim-3 mt-6 max-w-sm text-lg leading-relaxed text-gray-500">
              Dunlo connects to Stripe, detects every failed payment by type,
              and sends the right recovery email — automatically.
            </p>

            <div className="anim-4 mt-8">
              <MagneticCtaButton />
            </div>

            <p className="anim-5 mt-4 text-xs text-gray-400">
              No credit card required · Cancel anytime · 5 min setup
            </p>

            {/* Stats row */}
            <div className="anim-6 mt-10 flex items-center gap-8 border-t border-gray-200/50 pt-8">
              {[
                { value: "€4.2M+", label: "Recovered" },
                { value: "72.3%", label: "Success rate" },
                { value: "< 3 min", label: "First email" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col gap-0.5">
                  <span className="font-mono text-xl font-bold text-gray-900">
                    {s.value}
                  </span>
                  <span className="text-xs text-gray-400">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: 3D tilt mockup ── */}
          <div className="anim-6 relative">
            {/* Soft green diffusion glow */}
            <div
              className="pointer-events-none absolute inset-10 -z-10 rounded-3xl blur-3xl"
              style={{
                background:
                  "radial-gradient(ellipse, rgba(0,232,123,0.1) 0%, transparent 72%)",
              }}
            />

            {/* Floating badge — top left */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 4.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -left-14 top-6 z-10 hidden rounded-2xl border border-gray-100 bg-white px-4 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.07)] md:block"
            >
              <p className="text-[11px] font-semibold text-gray-900">
                €12,480 recovered
              </p>
              <p className="mt-0.5 text-[10px] text-dunlo-dim">
                this month · +18%
              </p>
            </motion.div>

            {/* Floating badge — bottom right */}
            <motion.div
              animate={{ y: [0, 9, 0] }}
              transition={{
                duration: 3.9,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.3,
              }}
              className="absolute -right-14 bottom-10 z-10 hidden rounded-2xl border border-gray-100 bg-white px-4 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.07)] md:block"
            >
              <p className="text-[11px] font-semibold text-gray-900">
                72.3% success rate
              </p>
              <p className="mt-0.5 text-[10px] text-dunlo-dim">
                +4.1% vs last month
              </p>
            </motion.div>

            <TiltContainer>
              <DashboardMockup />
            </TiltContainer>
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardMockup() {
  const sparkPts = [18, 29, 24, 41, 35, 53, 47, 62, 58, 71];
  const svgW = 64,
    svgH = 22;
  const min = Math.min(...sparkPts),
    max = Math.max(...sparkPts);
  const sparkPath = sparkPts
    .map((v, i) => {
      const x = (i / (sparkPts.length - 1)) * svgW;
      const y = svgH - ((v - min) / (max - min)) * (svgH - 2) - 1;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const payments = [
    {
      abbr: "MA",
      name: "Meridian Analytics",
      amount: "€890",
      status: "recovered",
      type: "Card expired",
    },
    {
      abbr: "VC",
      name: "Volta Cloud",
      amount: "€2,340",
      status: "escalated",
      type: "Bank declined",
    },
    {
      abbr: "PL",
      name: "Praxis Labs",
      amount: "€415",
      status: "recovering",
      type: "Insufficient funds",
    },
    {
      abbr: "HS",
      name: "Helix Software",
      amount: "€1,200",
      status: "recovered",
      type: "Card expired",
    },
    {
      abbr: "OF",
      name: "Orbis Finance",
      amount: "€3,500",
      status: "escalated",
      type: "Bank declined",
    },
  ];

  const statusStyle = {
    recovered: {
      wrap: "bg-dunlo/8 text-dunlo-deep border-dunlo/25",
      dot: "bg-dunlo",
    },
    recovering: {
      wrap: "bg-amber-50 text-amber-700 border-amber-200",
      dot: "bg-amber-400",
    },
    escalated: {
      wrap: "bg-red-50 text-red-600 border-red-200",
      dot: "bg-red-400",
    },
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_24px_64px_-12px_rgba(0,0,0,0.12)]">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/80 px-5 py-3">
        <span className="size-3 rounded-full bg-red-400/60" />
        <span className="size-3 rounded-full bg-amber-400/60" />
        <span className="size-3 rounded-full bg-dunlo/70" />
        <div className="mx-2 flex h-6 flex-1 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3">
          <LogoMark size={13} />
          <span className="text-[11px] text-gray-400">dunlo.io/dashboard</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="size-1.5 animate-pulse rounded-full bg-dunlo" />
          <span className="text-[10px] font-semibold text-dunlo-dim">Live</span>
        </div>
      </div>

      {/* Stats band — 4 divided columns, no truncation possible */}
      <div className="grid grid-cols-4 divide-x divide-gray-100 border-b border-gray-100">
        <div className="px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            Recovered
          </p>
          <p className="mt-1.5 font-mono text-base font-bold text-gray-900">
            €12,480
          </p>
          <p className="mt-0.5 text-[10px] font-semibold text-dunlo-dim">
            +18% this mo.
          </p>
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="mt-2 h-4.5 w-full"
            preserveAspectRatio="none"
            aria-hidden
          >
            <polyline
              points={sparkPath}
              fill="none"
              stroke="var(--dunlo-accent)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            In recovery
          </p>
          <p className="mt-1.5 font-mono text-base font-bold text-gray-900">
            34
          </p>
          <p className="mt-0.5 text-[10px] font-medium text-gray-400">
            active now
          </p>
        </div>

        <div className="px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            Success rate
          </p>
          <p className="mt-1.5 font-mono text-base font-bold text-gray-900">
            72.3%
          </p>
          <p className="mt-0.5 text-[10px] font-semibold text-dunlo-dim">
            +4.1% vs last
          </p>
        </div>

        <div className="px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            MRR at risk
          </p>
          <p className="mt-1.5 font-mono text-base font-bold text-gray-900">
            €3,240
          </p>
          <p className="mt-0.5 text-[10px] font-semibold text-red-500">
            13 accounts
          </p>
        </div>
      </div>

      {/* Payments table */}
      <div className="p-4">
        <div className="overflow-hidden rounded-2xl border border-gray-100">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
            <p className="text-[11px] font-semibold text-gray-700">
              Recent in recovery
            </p>
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-semibold text-gray-500">
              5 of 34
            </span>
          </div>

          <div className="divide-y divide-gray-50">
            {payments.map((p) => {
              const cfg = statusStyle[p.status as keyof typeof statusStyle];
              return (
                <div
                  key={p.name}
                  className="flex items-center gap-3 px-5 py-2.5"
                >
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[9px] font-bold text-gray-600">
                    {p.abbr}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-semibold text-gray-900">
                      {p.name}
                    </p>
                    <p className="text-[10px] text-gray-400">{p.type}</p>
                  </div>
                  <span className="font-mono text-sm font-bold tabular-nums text-gray-900">
                    {p.amount}
                  </span>
                  <span
                    className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold capitalize ${cfg.wrap}`}
                  >
                    <span className={`size-1.5 rounded-full ${cfg.dot}`} />
                    {p.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Logo Marquee ──────────────────────────────────────────────────────────── */
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

function LogoMarquee() {
  return (
    <section className="mt-10 overflow-hidden py-8">
      <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-gray-400">
        Trusted by fast-growing SaaS teams
      </p>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-linear-to-r from-[#e9eaeb] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-linear-to-l from-[#e9eaeb] to-transparent" />
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

/* ─── Features — vertical tabs with auto-cycle ──────────────────────────────── */
const CYCLE_MS = 5000;

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
            color: "bg-purple-50 border-purple-200 text-purple-700",
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
    headline: "High-value accounts get your personal touch.",
    body: "Set a threshold (e.g. €500+/mo) and Dunlo drafts a founder-ready email for each high-risk account. You review and send in one click — high-touch when MRR is on the line.",
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
            Draft ready — review & send
          </p>
          <p className="text-xs leading-relaxed text-gray-800">
            "Hey Marcus, I saw your card didn't go through today. Given what
            you're building at Orbis, I wanted to reach out personally..."
          </p>
          <div className="mt-3 flex gap-2">
            <button className="flex-1 rounded-full bg-dunlo py-2 text-[11px] font-semibold text-white">
              Send now
            </button>
            <button className="rounded-full border border-gray-200 px-3 py-2 text-[11px] font-semibold text-gray-600">
              Edit
            </button>
          </div>
        </div>
      </div>
    ),
  },
];

function Features() {
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

          <div className="grid grid-cols-1 gap-6 md:grid-cols-[2fr_3fr]">
            {/* Left: vertical tabs */}
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
                    className={`text-sm font-semibold leading-snug transition-colors ${active === i ? "text-gray-900" : "text-gray-400"}`}
                  >
                    {f.headline}
                  </h3>
                  <AnimatePresence>
                    {active === i && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="text-sm leading-relaxed text-gray-500">
                          {f.body}
                        </p>
                        <ProgressBar key={active} duration={CYCLE_MS} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              ))}
            </div>

            {/* Right: animated visual */}
            <div className="relative min-h-95 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/70">
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

/* ─── Testimonials ──────────────────────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    name: "Raphaël Bernstein",
    role: "CTO, Meridian Analytics",
    avatar: "RB",
    text: "We were losing roughly €8k/month to failed cards. Within two weeks of activating Dunlo, we recovered over €6,200. The founder escalation feature alone paid for the tool ten times over.",
  },
  {
    name: "Valeria Cortez",
    role: "Founder, Volta Cloud",
    avatar: "VC",
    text: "I spent months manually chasing failed payments. Dunlo just handles it. The email sequences feel genuinely personal — customers don't realize they're automated.",
  },
  {
    name: "Sven Richter",
    role: "Head of Revenue, Praxis Labs",
    avatar: "SR",
    text: "Setup was 4 minutes flat. The failure-type detection is smart — our bank decline recovery rate jumped from 31% to 67% in the first month.",
  },
];

function StarRating() {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={13} className="fill-dunlo text-dunlo" />
      ))}
    </div>
  );
}

function Testimonials() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {TESTIMONIALS.map((t, i) => (
        <FadeIn key={t.name} i={i} className="flex flex-col">
          <div className="flex h-full flex-col rounded-3xl border border-gray-200/60 bg-white p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                {t.avatar}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                <p className="text-xs text-gray-400">{t.role}</p>
              </div>
            </div>
            <StarRating />
            <p className="mt-4 flex-1 text-sm leading-relaxed text-gray-600">
              "{t.text}"
            </p>
          </div>
        </FadeIn>
      ))}
    </div>
  );
}

/* ─── How it works — interactive step switcher ──────────────────────────────── */
function MockupConnect() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/5 px-4 py-3">
        <div className="flex size-8 items-center justify-center rounded-lg bg-[#635bff]">
          <span className="font-bold text-white text-sm">S</span>
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-white">stripe.com</div>
          <div className="text-xs text-white/40">Awaiting authorization…</div>
        </div>
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          className="size-2 rounded-full bg-dunlo"
        />
      </div>
      <div className="rounded-xl border border-white/8 bg-white/5 p-4 space-y-2.5">
        <div className="text-xs text-white/40 mb-3">Requesting read-only access to</div>
        {["Payment Intents", "Customers", "Charges", "Subscriptions"].map((item, i) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 + 0.3, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-2"
          >
            <Check size={12} className="text-dunlo shrink-0" />
            <span className="text-sm text-white/70">{item}</span>
          </motion.div>
        ))}
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="w-full rounded-xl bg-dunlo py-2.5 text-sm font-semibold text-gray-900"
      >
        Authorize Dunlo
      </motion.button>
    </div>
  );
}

function MockupSequences() {
  const emails = [
    { delay: "Immediately", subject: "Quick note about your payment", tag: "High priority" },
    { delay: "After 3 days", subject: "Still want to continue?", tag: "Follow-up" },
    { delay: "After 7 days", subject: "Last chance — update your card", tag: "Final" },
  ];
  return (
    <div className="space-y-2">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs text-white/40">Card declined — recovery sequence</span>
        <span className="rounded-full bg-dunlo/15 px-2 py-0.5 text-xs text-dunlo">Active</span>
      </div>
      {emails.map((email, i) => (
        <motion.div
          key={email.delay}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.18, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="flex gap-3"
        >
          <div className="flex flex-col items-center pt-1.5">
            <div className="size-2 shrink-0 rounded-full bg-dunlo" />
            {i < emails.length - 1 && (
              <div className="mt-1 w-px flex-1 bg-dunlo/20" style={{ minHeight: "2rem" }} />
            )}
          </div>
          <div className="mb-2 flex-1 rounded-xl border border-white/8 bg-white/5 p-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-dunlo/80">{email.delay}</span>
              <span className="text-xs text-white/25">{email.tag}</span>
            </div>
            <div className="text-sm text-white/80">{email.subject}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function MockupDashboard() {
  const rows = [
    { name: "acmecorp.io", amount: "€299", recovered: true },
    { name: "finstack.dev", amount: "€149", recovered: false },
    { name: "buildfast.io", amount: "€499", recovered: true },
    { name: "launchly.co", amount: "€89", recovered: true },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/8 bg-white/5 p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="font-mono text-2xl font-bold text-dunlo">€4,820</div>
            <div className="mt-0.5 text-xs text-white/40">Recovered this month</div>
          </motion.div>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/5 p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-1 font-mono text-2xl font-bold text-white">
              <TrendingUp size={18} className="text-dunlo" />
              23%
            </div>
            <div className="mt-0.5 text-xs text-white/40">Recovery rate</div>
          </motion.div>
        </div>
      </div>
      <div className="rounded-xl border border-white/8 bg-white/5">
        {rows.map((row, i) => (
          <motion.div
            key={row.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 + 0.35 }}
            className="flex items-center justify-between border-t border-white/5 px-4 py-2.5 first:border-t-0"
          >
            <span className="text-sm text-white/60">{row.name}</span>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-white/80">{row.amount}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  row.recovered
                    ? "bg-dunlo/15 text-dunlo"
                    : "bg-white/5 text-white/35"
                }`}
              >
                {row.recovered ? "recovered" : "pending"}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const HIW_STEPS = [
  {
    n: "01",
    title: "Connect Stripe",
    body: "OAuth in 30 seconds. Read-only access — no write permissions, ever.",
    Mockup: MockupConnect,
  },
  {
    n: "02",
    title: "Review sequences",
    body: "Pre-built flows for every failure type. Edit tone and timing, or ship the defaults.",
    Mockup: MockupSequences,
  },
  {
    n: "03",
    title: "Watch revenue return",
    body: "Dunlo tracks opens, flags high-value accounts, and reports recovered revenue in real time.",
    Mockup: MockupDashboard,
  },
] as const;

const STEP_DURATION = 4800;

function HowItWorks() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setActive((a) => (a + 1) % HIW_STEPS.length),
      STEP_DURATION,
    );
    return () => clearInterval(t);
  }, []);

  const { Mockup } = HIW_STEPS[active];

  return (
    <FadeIn>
      <section
        id="how-it-works"
        className="overflow-hidden rounded-3xl bg-gray-900"
      >
        <div className="grid grid-cols-1 gap-10 px-8 py-16 md:grid-cols-[5fr_7fr] md:gap-8 md:px-14 md:py-20">
          {/* ── Left: selector ── */}
          <div className="flex flex-col">
            <SectionPill dark>How it works</SectionPill>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Up and running
              <br />
              in 5 minutes.
            </h2>
            <p className="mt-3 text-sm text-white/45">
              No code. No webhooks. No engineering team.
            </p>

            <div className="mt-10 space-y-1">
              {HIW_STEPS.map((step, i) => {
                const isActive = active === i;
                return (
                  <button
                    key={step.n}
                    onClick={() => setActive(i)}
                    className={`group w-full rounded-xl px-4 py-3.5 text-left transition-colors duration-200 ${
                      isActive ? "bg-white/8" : "hover:bg-white/4"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-mono text-xs font-bold transition-colors ${
                          isActive ? "text-dunlo" : "text-white/25"
                        }`}
                      >
                        {step.n}
                      </span>
                      <span
                        className={`text-sm font-semibold transition-colors ${
                          isActive ? "text-white" : "text-white/40"
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                    {isActive && (
                      <p className="mt-1.5 pl-7 text-xs leading-relaxed text-white/45">
                        {step.body}
                      </p>
                    )}
                    {isActive && (
                      <div className="mt-2.5 pl-7">
                        <div className="h-px w-full overflow-hidden rounded-full bg-white/10">
                          <motion.div
                            key={active}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{
                              duration: STEP_DURATION / 1000,
                              ease: "linear",
                            }}
                            style={{ originX: 0 }}
                            className="h-full bg-dunlo"
                          />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-auto pt-10">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full bg-dunlo px-6 py-3 text-sm font-semibold text-gray-900 transition-all hover:bg-dunlo-hover active:scale-[0.97]"
              >
                Connect Stripe now
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          {/* ── Right: mockup stage ── */}
          <div className="relative flex min-h-[340px] items-center overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-6 md:min-h-[420px] md:p-8">
            {/* Subtle radial glow behind mockup */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="size-64 rounded-full bg-dunlo/5 blur-3xl" />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full"
              >
                <Mockup />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>
    </FadeIn>
  );
}

/* ─── Pricing ───────────────────────────────────────────────────────────────── */
const PLANS = [
  {
    name: "Solo",
    price: 19,
    mrr: "< €5k MRR",
    features: [
      "1 email sequence",
      "Up to €5k MRR",
      "Basic dashboard",
      "Email support",
    ],
    featured: false,
  },
  {
    name: "Starter",
    price: 49,
    mrr: "€5k–€20k MRR",
    features: [
      "2 email sequences",
      "Up to €20k MRR",
      "Priority scoring",
      "All Solo features",
    ],
    featured: false,
  },
  {
    name: "Growth",
    price: 149,
    mrr: "€20k–€80k MRR",
    badge: "Most popular",
    features: [
      "Unlimited sequences",
      "Up to €80k MRR",
      "Founder escalation drafts",
      "High-value account alerts",
      "Recovery insights",
      "Unlimited team members",
    ],
    featured: true,
  },
  {
    name: "Scale",
    price: 399,
    mrr: "Unlimited MRR",
    features: [
      "All Growth features",
      "Unlimited MRR",
      "Custom integrations",
      "Priority SLA",
    ],
    featured: false,
  },
];

function Pricing() {
  return (
    <FadeIn>
      <section
        id="pricing"
        className="overflow-hidden rounded-3xl border border-gray-200/60 bg-white p-8 md:p-12"
      >
        <div className="mb-10 text-center">
          <SectionPill>Pricing</SectionPill>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Simple pricing. No % of MRR.
          </h2>
          <p className="mt-3 text-base text-gray-500">
            All plans free during beta — no billing until launch.
          </p>
        </div>

        <div className="mx-auto mb-8 flex max-w-lg items-center justify-center gap-3 rounded-full border border-dunlo/25 bg-dunlo/8 px-6 py-3">
          <span className="size-2 animate-pulse rounded-full bg-dunlo" />
          <p className="text-sm font-medium text-[#006b38]">
            <strong>Beta:</strong> every plan is currently free — pick your tier
            for when we launch
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan, i) => (
            <FadeIn key={plan.name} i={i}>
              <div
                className={`relative flex h-full flex-col rounded-2xl p-6 transition-shadow hover:shadow-lg ${
                  plan.featured
                    ? "bg-gray-900 text-white shadow-xl ring-1 ring-gray-800"
                    : "border border-gray-100 bg-white shadow-sm"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-dunlo px-3 py-1 text-[11px] font-bold text-white shadow">
                      {plan.badge}
                    </span>
                  </div>
                )}
                <div className={plan.badge ? "mt-2" : ""}>
                  <p
                    className={`text-xs font-semibold uppercase tracking-widest ${plan.featured ? "text-white/50" : "text-gray-400"}`}
                  >
                    {plan.name}
                  </p>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span
                      className={`text-4xl font-bold ${plan.featured ? "text-white" : "text-gray-900"}`}
                    >
                      €{plan.price}
                    </span>
                    <span
                      className={`text-sm ${plan.featured ? "text-white/40" : "text-gray-400"}`}
                    >
                      /mo
                    </span>
                  </div>
                  <p
                    className={`mt-1 text-xs ${plan.featured ? "text-white/40" : "text-gray-400"}`}
                  >
                    {plan.mrr}
                  </p>
                </div>

                <ul className="mt-6 flex-1 space-y-2.5">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className={`flex items-start gap-2.5 text-sm ${plan.featured ? "text-white/80" : "text-gray-600"}`}
                    >
                      <Check size={15} className="mt-0.5 shrink-0 text-dunlo" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/login"
                  className={`mt-8 flex items-center justify-center rounded-full py-2.5 text-sm font-semibold transition-all active:scale-[0.97] ${
                    plan.featured
                      ? "bg-dunlo text-white hover:bg-dunlo-hover"
                      : "border border-gray-200 text-gray-900 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Get started free
                </Link>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>
    </FadeIn>
  );
}

/* ─── FAQ — taap.it split layout ───────────────────────────────────────────── */
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

function Faq() {
  const [open, setOpen] = useState<number | null>(0);

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
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between py-5 text-left"
                  aria-expanded={open === i}
                >
                  <span className="pr-4 text-sm font-semibold text-gray-900">
                    {item.q}
                  </span>
                  <ChevronDown
                    size={15}
                    className={`shrink-0 text-gray-400 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
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

/* ─── CTA Banner ────────────────────────────────────────────────────────────── */
function CtaBanner() {
  return (
    <FadeIn>
      <section className="relative overflow-hidden rounded-3xl bg-gray-900 px-8 py-16 text-center">
        <div
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: 420,
            height: 420,
            background:
              "radial-gradient(circle, rgba(0,232,123,0.14) 0%, transparent 70%)",
          }}
          aria-hidden
        />

        <p className="relative mb-3 inline-flex items-center gap-2 rounded-full border border-dunlo/20 px-4 py-1.5 text-xs font-semibold text-dunlo-dim">
          <span className="size-1.5 animate-pulse rounded-full bg-dunlo" />
          Beta · Free to join
        </p>
        <h2 className="relative mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
          Your next payment failure
          <br />
          doesn't have to be lost revenue.
        </h2>
        <p className="relative mt-4 text-base text-white/50">
          Join the beta. Free until launch. 5-minute setup.
        </p>
        <div className="relative mt-8">
          <Link
            to="/login"
            className="inline-flex items-center gap-0 rounded-full border border-white/10 bg-white/5 px-2 py-2 backdrop-blur-sm transition-all hover:bg-white/10 active:scale-[0.97]"
          >
            <span className="px-4 text-sm font-semibold text-white">
              Get started now
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-dunlo px-4 py-2 text-sm font-semibold text-white">
              for free
              <ChevronRight size={14} />
            </span>
          </Link>
        </div>
      </section>
    </FadeIn>
  );
}

/* ─── Footer ────────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-gray-300/40 bg-[#e9eaeb] px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-3">
          <Logo size={22} />
          <span className="text-xs text-gray-400">
            Stop losing revenue to failed payments.
          </span>
        </div>
        <div className="flex items-center gap-6 text-xs text-gray-400">
          {["Privacy", "Terms", "Contact"].map((l) => (
            <a
              key={l}
              href="#"
              className="transition-colors hover:text-gray-700"
            >
              {l}
            </a>
          ))}
          <span>© 2025 Dunlo</span>
        </div>
      </div>
    </footer>
  );
}
