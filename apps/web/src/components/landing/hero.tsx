import { Link } from "@tanstack/react-router";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { usePostHog } from "posthog-js/react";
import { HeroScene } from "@/components/hero-scene";
import { LogoMark } from "@/components/logo";

function MagneticCtaButton() {
  const posthog = usePostHog();
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
        onClick={() => posthog.capture("cta_clicked", { location: "hero" })}
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

function smoothChartPath(pts: [number, number][]): string {
  if (pts.length < 2) return "";
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

function DashboardMockup() {
  const raw = [8, 5, 13, 6, 10, 17, 7, 12, 9, 19, 14, 16, 11, 23];
  const svgW = 380;
  const svgH = 56;
  const padT = 6;
  const padB = 2;
  const min = Math.min(...raw);
  const max = Math.max(...raw);

  const pts: [number, number][] = raw.map((v, i) => [
    (i / (raw.length - 1)) * svgW,
    svgH - padB - ((v - min) / (max - min)) * (svgH - padT - padB),
  ]);

  const linePath = smoothChartPath(pts);
  const areaPath = `${linePath} L${svgW},${svgH} L0,${svgH} Z`;
  const lastPt = pts[pts.length - 1];

  const payments = [
    {
      abbr: "MA",
      color: "bg-violet-100 text-violet-700",
      name: "Meridian Analytics",
      amount: "€890",
      detail: "Card expired",
      status: "recovered" as const,
    },
    {
      abbr: "VC",
      color: "bg-sky-100 text-sky-700",
      name: "Volta Cloud",
      amount: "€2,340",
      detail: "Bank declined",
      status: "escalated" as const,
    },
    {
      abbr: "PL",
      color: "bg-amber-100 text-amber-700",
      name: "Praxis Labs",
      amount: "€415",
      detail: "Insufficient funds",
      status: "recovering" as const,
    },
    {
      abbr: "HS",
      color: "bg-emerald-100 text-emerald-800",
      name: "Helix Software",
      amount: "€1,200",
      detail: "Card expired",
      status: "recovered" as const,
    },
  ];

  const statusCfg = {
    recovered: { wrap: "bg-dunlo/8 text-dunlo-deep border-dunlo/25", dot: "bg-dunlo" },
    recovering: { wrap: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-400" },
    escalated: { wrap: "bg-red-50 text-red-600 border-red-200", dot: "bg-red-400" },
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

      {/* Hero metric + secondary stats + area chart */}
      <div className="border-b border-gray-100 px-5 pb-1 pt-5">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              Recovered this month
            </p>
            <p className="mt-1 font-mono text-[22px] font-bold leading-none text-gray-900">
              €12,480
            </p>
            <p className="mt-1.5 text-[11px] font-semibold text-dunlo-dim">
              ↑ +18.4% vs last month
            </p>
          </div>
          <div className="flex items-end gap-5 pb-0.5">
            {(
              [
                { v: "72.3%", l: "success rate" },
                { v: "34", l: "in recovery" },
                { v: "€3,240", l: "MRR at risk", red: true },
              ] as { v: string; l: string; red?: boolean }[]
            ).map((s) => (
              <div key={s.l} className="text-right">
                <p
                  className={`font-mono text-sm font-bold ${s.red ? "text-red-500" : "text-gray-900"}`}
                >
                  {s.v}
                </p>
                <p className="text-[10px] text-gray-400">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Area chart */}
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="w-full"
          style={{ height: 56 }}
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--dunlo-accent)" stopOpacity="0.14" />
              <stop offset="100%" stopColor="var(--dunlo-accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#chartFill)" />
          <path
            d={linePath}
            fill="none"
            stroke="var(--dunlo-accent)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx={lastPt[0]}
            cy={lastPt[1]}
            r="5"
            fill="var(--dunlo-accent)"
            fillOpacity="0.2"
          />
          <circle cx={lastPt[0]} cy={lastPt[1]} r="2.5" fill="var(--dunlo-accent)" />
        </svg>
        <div className="mb-3 mt-1 flex justify-between">
          <span className="text-[10px] text-gray-300">May 1</span>
          <span className="text-[10px] font-medium text-gray-400">Today</span>
        </div>
      </div>

      {/* Payments table */}
      <div className="p-3">
        <div className="mb-2 flex items-center justify-between px-2">
          <p className="text-[11px] font-semibold text-gray-700">
            Active recoveries
          </p>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
            4 of 34
          </span>
        </div>
        <div className="divide-y divide-gray-50">
          {payments.map((p) => {
            const cfg = statusCfg[p.status];
            return (
              <div key={p.name} className="flex items-center gap-2.5 px-2 py-2.5">
                <div
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${p.color}`}
                >
                  {p.abbr}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-semibold text-gray-900">
                    {p.name}
                  </p>
                  <p className="text-[10px] text-gray-400">{p.detail}</p>
                </div>
                <span className="font-mono text-xs font-bold tabular-nums text-gray-800">
                  {p.amount}
                </span>
                <span
                  className={`flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${cfg.wrap}`}
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
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <HeroScene />

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

      <div className="relative mx-auto flex min-h-dvh max-w-6xl items-center px-4 pb-20 pt-28 md:px-6 md:pt-24">
        <div className="grid w-full grid-cols-1 items-center gap-14 md:grid-cols-[5fr_7fr] md:gap-10 lg:gap-14">
          {/* Left: text */}
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

          {/* Right: 3D tilt mockup */}
          <div className="anim-6 relative">
            <div
              className="pointer-events-none absolute inset-10 -z-10 rounded-3xl blur-3xl"
              style={{
                background:
                  "radial-gradient(ellipse, rgba(0,232,123,0.1) 0%, transparent 72%)",
              }}
            />

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-14 top-6 z-10 hidden rounded-2xl border border-gray-100 bg-white px-4 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.07)] md:block"
            >
              <p className="text-[11px] font-semibold text-gray-900">
                €12,480 recovered
              </p>
              <p className="mt-0.5 text-[10px] text-dunlo-dim">
                this month · +18%
              </p>
            </motion.div>

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
