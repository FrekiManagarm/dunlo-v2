import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle,
  ChevronRight,
  DollarSign,
  ExternalLink,
  TrendingUp,
} from "lucide-react";

import { getDashboardData } from "@/functions/payments";
import { formatAmount } from "@/lib/template";

export const Route = createFileRoute("/_dashboard/dashboard")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Dashboard — Dunlo" },
    ],
  }),
  loader: async () => {
    const data = await getDashboardData();
    return data;
  },
  component: RouteComponent,
});

const STATUS_STYLE: Record<string, string> = {
  recovered: "bg-dunlo/8 text-dunlo-deep border-dunlo/25",
  in_recovery: "bg-amber-50 text-amber-700 border-amber-200",
  escalated: "bg-red-50 text-red-700 border-red-200",
  pending: "bg-gray-100 text-gray-600 border-gray-200",
  failed: "bg-gray-100 text-gray-600 border-gray-200",
  dismissed: "bg-gray-100 text-gray-600 border-gray-200",
};

const STATUS_LABEL: Record<string, string> = {
  recovered: "recovered",
  in_recovery: "in recovery",
  escalated: "escalated",
  pending: "pending",
  failed: "failed",
  dismissed: "dismissed",
};

function RouteComponent() {
  const { session } = Route.useRouteContext();
  const loaderData = Route.useLoaderData();

  const { stripeConnected, stats: s, recentPayments, currency } = loaderData;

  const stats = [
    {
      label: "Recovered this month",
      value: formatAmount(s.recoveredAmount, currency),
      delta: stripeConnected ? "Current month" : "Connect Stripe to track",
      icon: TrendingUp,
      positive: s.recoveredAmount > 0 ? true : null,
    },
    {
      label: "Failed payments",
      value: String(s.inRecoveryCount),
      delta: `${s.inRecoveryCount} in recovery`,
      icon: AlertCircle,
      positive: null,
    },
    {
      label: "Recovery rate",
      value: `${s.successRate.toFixed(1)}%`,
      delta: "Current month",
      icon: CheckCircle,
      positive: s.successRate > 0 ? true : null,
    },
    {
      label: "MRR at risk",
      value: formatAmount(s.mrrAtRisk, currency),
      delta: `${s.inRecoveryCount} account${s.inRecoveryCount === 1 ? "" : "s"}`,
      icon: DollarSign,
      positive: s.mrrAtRisk > 0 ? false : null,
    },
  ];

  return (
    <>
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-100 bg-white/80 px-6 py-4 backdrop-blur-md">
        <div>
          <h1 className="text-[15px] font-semibold tracking-tight text-zinc-900">Overview</h1>
          <p className="text-xs text-zinc-400">
            Welcome back, {session?.user.name?.split(" ")[0]}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-dunlo/25 bg-dunlo/[0.07] px-3 py-1.5">
            <span className="size-1.5 animate-pulse rounded-full bg-dunlo" />
            <span className="text-[11px] font-semibold text-dunlo-deep">
              {stripeConnected ? "Beta · Stripe connected" : "Beta · Stripe not connected"}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {!stripeConnected && (
          <div className="flex items-center justify-between rounded-2xl border border-dunlo/25 bg-dunlo/[0.07] p-5">
            <div>
              <p className="text-sm font-semibold text-zinc-900">
                Connect Stripe to start recovering payments
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">
                Takes 2 minutes. OAuth, no code required.
              </p>
            </div>
            <a
              href="/api/stripe/connect"
              className="flex shrink-0 items-center gap-2 rounded-full bg-dunlo px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-dunlo-hover active:scale-[0.97]"
            >
              Connect Stripe
              <ExternalLink size={13} />
            </a>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, delta, icon: Icon, positive }) => (
            <div
              key={label}
              className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-[0_1px_4px_0_rgba(0,0,0,0.04)]"
            >
              <div className="flex items-start justify-between">
                <p className="text-xs font-medium text-zinc-400">{label}</p>
                <div className="rounded-xl bg-zinc-50 p-1.5">
                  <Icon size={14} className="text-zinc-400" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-zinc-900">{value}</p>
              <p
                className={`mt-1 text-xs font-semibold ${
                  positive === true
                    ? "text-dunlo-dim"
                    : positive === false
                      ? "text-red-500"
                      : "text-zinc-400"
                }`}
              >
                {delta}
              </p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-[0_1px_4px_0_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-zinc-900">Payments in recovery</h2>
            <Link
              to="/payments"
              className="flex items-center gap-1 text-xs font-medium text-dunlo-dim hover:underline"
            >
              View all <ChevronRight size={13} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-50">
                  {["Customer", "Failure type", "Amount", "Status", "Time"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {recentPayments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-xs text-zinc-400">
                      No failed payments yet — your dashboard will populate when a payment fails.
                    </td>
                  </tr>
                ) : (
                  recentPayments.map((p) => (
                    <tr key={p.id} className="transition-colors hover:bg-zinc-50/50">
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-zinc-900">{p.name}</p>
                        <p className="text-xs text-zinc-400">{p.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-zinc-600">{p.type}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono text-sm font-semibold text-zinc-900">
                          {p.amount}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${STATUS_STYLE[p.status] ?? STATUS_STYLE.pending}`}
                        >
                          {STATUS_LABEL[p.status] ?? p.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-zinc-400">{p.time}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              title: "Edit recovery sequences",
              desc: "Customize emails per failure type",
              cta: "Open editor",
            },
            {
              title: "Set escalation threshold",
              desc: "Get alerted for high-value accounts",
              cta: "Configure",
            },
            {
              title: "View analytics",
              desc: "Track recovery rate trends over time",
              cta: "View report",
            },
          ].map((a) => (
            <div
              key={a.title}
              className="group rounded-2xl border border-zinc-100 bg-white p-5 shadow-[0_1px_4px_0_rgba(0,0,0,0.04)] transition-shadow hover:shadow-md"
            >
              <p className="text-sm font-semibold text-zinc-900">{a.title}</p>
              <p className="mt-1 text-xs text-zinc-400">{a.desc}</p>
              <button className="mt-4 flex items-center gap-1 text-xs font-semibold text-dunlo-dim transition-all group-hover:gap-2">
                {a.cta}
                <ChevronRight size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
