import { AnimatePresence, motion } from "framer-motion";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Settings,
  Zap,
} from "lucide-react";

import { dashboardQueryOptions } from "@/lib/queries";
import { formatAmount } from "@/lib/template";

export const Route = createFileRoute("/_dashboard/dashboard")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Dashboard — Dunlo" },
    ],
  }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(dashboardQueryOptions()),
  component: RouteComponent,
});

const STATUS_STYLE: Record<string, string> = {
  recovered: "bg-dunlo/[0.07] text-dunlo-deep border-dunlo/25",
  in_recovery: "bg-amber-50 text-amber-700 border-amber-100",
  escalated: "bg-red-50 text-red-700 border-red-100",
  failed: "bg-zinc-100 text-zinc-500 border-zinc-200",
  dismissed: "bg-zinc-100 text-zinc-400 border-zinc-200",
};

const STATUS_LABEL: Record<string, string> = {
  recovered: "Recovered",
  in_recovery: "In recovery",
  escalated: "Escalated",
  failed: "Failed",
  dismissed: "Dismissed",
};


function RouteComponent() {
  const { session } = Route.useRouteContext();
  const { data } = useSuspenseQuery(dashboardQueryOptions());
  const { stripeConnected, stats: s, recentPayments, currency } = data;

  const firstName = session?.user.name?.split(" ")[0] ?? "there";

  const stats = [
    {
      label: "Recovered this month",
      value: formatAmount(s.recoveredAmount, currency),
      delta: stripeConnected ? "Current month" : "Connect Stripe",
      positive: s.recoveredAmount > 0,
      accent: "border-t-dunlo",
      valueColor: s.recoveredAmount > 0 ? "text-dunlo-deep" : "text-zinc-800",
    },
    {
      label: "Recovery rate",
      value: `${s.successRate.toFixed(1)}%`,
      delta: s.successRate > 0 ? `of closed payments` : "No data yet",
      positive: s.successRate > 0,
      accent: "border-t-dunlo/50",
      valueColor: s.successRate > 0 ? "text-dunlo-deep" : "text-zinc-800",
    },
    {
      label: "In recovery",
      value: String(s.inRecoveryCount),
      delta: `active account${s.inRecoveryCount === 1 ? "" : "s"}`,
      positive: null,
      accent: "border-t-amber-300",
      valueColor: s.inRecoveryCount > 0 ? "text-amber-700" : "text-zinc-800",
    },
    {
      label: "MRR at risk",
      value: formatAmount(s.mrrAtRisk, currency),
      delta: s.mrrAtRisk > 0 ? "needs recovery" : "All clear",
      positive: s.mrrAtRisk === 0,
      accent: s.mrrAtRisk > 0 ? "border-t-red-300" : "border-t-zinc-200",
      valueColor: s.mrrAtRisk > 0 ? "text-red-600" : "text-zinc-800",
    },
  ];

  return (
    <>
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-100 bg-white/80 px-6 py-4 backdrop-blur-md">
        <div>
          <h1 className="text-[15px] font-semibold tracking-tight text-zinc-900">
            Good morning, {firstName}
          </h1>
          <p className="text-xs text-zinc-400">Here's what's happening with your revenue.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-dunlo/25 bg-dunlo/[0.07] px-3 py-1.5">
          <span className="size-1.5 animate-pulse rounded-full bg-dunlo" />
          <span className="text-[11px] font-semibold text-dunlo-deep">
            {stripeConnected ? "Stripe connected" : "Stripe not connected"}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Stripe connect banner */}
        <AnimatePresence>
          {!stripeConnected && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden rounded-2xl border border-dunlo/20 bg-dunlo/[0.05] p-5"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-dunlo/10 via-transparent to-transparent" />
              <div className="relative flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-dunlo/10">
                    <Zap size={15} className="text-dunlo" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">
                      Connect Stripe to start recovering payments
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      Takes 2 minutes. OAuth, no code required.
                    </p>
                  </div>
                </div>
                <a
                  href="/api/stripe/connect"
                  className="shrink-0 flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-zinc-700 active:scale-[0.97]"
                >
                  Connect Stripe
                  <ExternalLink size={11} />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, delta, accent, valueColor }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.22, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className={`rounded-2xl border border-zinc-100 border-t-2 bg-white px-5 py-4 shadow-[0_1px_4px_0_rgba(0,0,0,0.04)] ${accent}`}
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                {label}
              </p>
              <p className={`mt-2 font-mono text-[1.6rem] font-bold leading-none tracking-tight ${valueColor}`}>
                {value}
              </p>
              <p className="mt-1.5 text-[11px] text-zinc-400">{delta}</p>
            </motion.div>
          ))}
        </div>

        {/* Recent payments table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-[0_1px_4px_0_rgba(0,0,0,0.04)]"
        >
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">Recent payments</h2>
              <p className="text-[11px] text-zinc-400">Last 20 failed charges</p>
            </div>
            <Link
              to="/payments"
              className="flex items-center gap-1 text-xs font-semibold text-dunlo-dim transition-all hover:gap-1.5"
            >
              View all <ArrowRight size={11} />
            </Link>
          </div>

          {recentPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-zinc-50">
                <CheckCircle2 size={20} className="text-zinc-300" />
              </div>
              <p className="text-sm font-semibold text-zinc-700">No failed payments yet</p>
              <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-zinc-400">
                Your dashboard will populate automatically when Stripe detects a failed charge.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-50">
                    {["Customer", "Failure", "Amount", "Status", ""].map((h, i) => (
                      <th
                        key={i}
                        className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-400"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {recentPayments.map((p) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="group transition-colors hover:bg-zinc-50/60"
                    >
                      <td className="px-5 py-3.5">
                        <Link to="/payments/$id" params={{ id: p.id }} className="block">
                          <p className="text-sm font-semibold text-zinc-900 group-hover:text-dunlo-deep transition-colors">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-zinc-400">{p.email}</p>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link to="/payments/$id" params={{ id: p.id }} className="block text-sm text-zinc-500">
                          {p.type}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link to="/payments/$id" params={{ id: p.id }} className="block">
                          <span className="font-mono text-sm font-semibold text-zinc-900">{p.amount}</span>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link to="/payments/$id" params={{ id: p.id }} className="block">
                          <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${STATUS_STYLE[p.status] ?? STATUS_STYLE.failed}`}>
                            {STATUS_LABEL[p.status] ?? p.status}
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to="/payments/$id"
                          params={{ id: p.id }}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-300 opacity-0 transition-all group-hover:opacity-100 group-hover:text-dunlo-dim"
                        >
                          Detail <ArrowRight size={10} />
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Quick links — 2-col, NO 3-col grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          <Link
            to="/sequences"
            className="group flex items-center justify-between rounded-2xl border border-zinc-100 bg-white px-5 py-4 shadow-[0_1px_4px_0_rgba(0,0,0,0.04)] transition-all hover:border-zinc-200 hover:shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-xl bg-zinc-50 transition-colors group-hover:bg-dunlo/[0.07]">
                <Zap size={13} className="text-zinc-400 transition-colors group-hover:text-dunlo" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-800">Recovery sequences</p>
                <p className="text-[11px] text-zinc-400">Customize emails per failure type</p>
              </div>
            </div>
            <ArrowRight
              size={13}
              className="shrink-0 text-zinc-300 transition-all group-hover:translate-x-0.5 group-hover:text-dunlo"
            />
          </Link>

          <Link
            to="/settings"
            className="group flex items-center justify-between rounded-2xl border border-zinc-100 bg-white px-5 py-4 shadow-[0_1px_4px_0_rgba(0,0,0,0.04)] transition-all hover:border-zinc-200 hover:shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-xl bg-zinc-50 transition-colors group-hover:bg-amber-50">
                <Settings size={13} className="text-zinc-400 transition-colors group-hover:text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-800">Escalation threshold</p>
                <p className="text-[11px] text-zinc-400">Alert for high-value accounts</p>
              </div>
            </div>
            <ArrowRight
              size={13}
              className="shrink-0 text-zinc-300 transition-all group-hover:translate-x-0.5 group-hover:text-amber-500"
            />
          </Link>
        </motion.div>
      </div>
    </>
  );
}
