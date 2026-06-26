import { AnimatePresence, motion } from "framer-motion";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Area, AreaChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock3,
  ExternalLink,
  type LucideIcon,
  MailWarning,
  Settings,
  Zap,
} from "lucide-react";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@dunlo-v2/ui/components/chart";

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

type TrendPoint = {
  label: string;
  failedAmount: number;
  recoveredAmount: number;
};

type Metric = {
  label: string;
  value: string;
  meta: string;
  icon: LucideIcon;
  tone: "green" | "amber" | "red" | "zinc";
};

function RouteComponent() {
  const { session } = Route.useRouteContext();
  const { data } = useSuspenseQuery(dashboardQueryOptions());
  const {
    stripeConnected,
    stats: s,
    recentPayments,
    pendingEscalations,
    recoveryTrend,
    currency,
  } = data;

  const firstName = session?.user.name?.split(" ")[0] ?? "there";
  const closedCount = recentPayments.filter((p) =>
    ["recovered", "failed", "dismissed"].includes(p.status),
  ).length;
  const metrics: Metric[] = [
    {
      label: "MRR at risk",
      value: formatAmount(s.mrrAtRisk, currency),
      meta: s.mrrAtRisk > 0 ? "still exposed" : "no active exposure",
      icon: MailWarning,
      tone: s.mrrAtRisk > 0 ? "red" : "zinc",
    },
    {
      label: "In recovery",
      value: String(s.inRecoveryCount),
      meta: `active account${s.inRecoveryCount === 1 ? "" : "s"}`,
      icon: Clock3,
      tone: s.inRecoveryCount > 0 ? "amber" : "zinc",
    },
    {
      label: "Handled",
      value: String(closedCount),
      meta: "recent failures",
      icon: CheckCircle2,
      tone: closedCount > 0 ? "green" : "zinc",
    },
    {
      label: "Needs attention",
      value: String(pendingEscalations),
      meta: pendingEscalations > 0 ? "quick founder review" : "nothing urgent",
      icon: MailWarning,
      tone: pendingEscalations > 0 ? "red" : "zinc",
    },
  ];

  return (
    <div className="min-h-dvh bg-zinc-50">
      <div className="sticky top-0 z-20 border-b border-zinc-200/70 bg-zinc-50/85 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="flex w-full items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
              Dashboard
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-zinc-950 sm:text-2xl">
              Good morning, {firstName}
            </h1>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-dunlo/25 bg-white px-3 py-1.5 shadow-[0_14px_30px_-22px_rgba(24,24,27,0.45)] sm:flex">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-dunlo opacity-30" />
              <span className="relative inline-flex size-2 rounded-full bg-dunlo" />
            </span>
            <span className="text-[11px] font-semibold text-dunlo-deep">
              {stripeConnected ? "Stripe connected" : "Stripe not connected"}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-380 space-y-5 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        <AnimatePresence>
          {!stripeConnected && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden rounded-[2rem] border border-dunlo/20 bg-white shadow-[0_24px_60px_-40px_rgba(24,24,27,0.55)]"
            >
              <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-dunlo/8">
                    <Zap size={18} strokeWidth={2} className="text-dunlo" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-950">
                      Connect Stripe to start recovering payments
                    </p>
                    <p className="mt-1 max-w-[58ch] text-sm leading-relaxed text-zinc-500">
                      Dunlo can monitor failed charges, start recovery emails,
                      and show recovered revenue as soon as OAuth is connected.
                    </p>
                  </div>
                </div>
                <a
                  href="/api/stripe/connect"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 text-sm font-semibold text-white transition-all hover:bg-zinc-800 active:scale-[0.98]"
                >
                  Connect Stripe
                  <ExternalLink size={14} strokeWidth={2} />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]"
        >
          <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
            <div className="overflow-hidden rounded-[2.25rem] bg-zinc-950 p-6 text-white shadow-[0_28px_80px_-46px_rgba(24,24,27,0.85)] sm:p-7">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                Money back
              </p>
              <p className="mt-3 font-mono text-5xl font-bold tracking-tight text-white">
                {formatAmount(s.recoveredAmount, currency)}
              </p>
              <p className="mt-5 max-w-[32ch] text-sm leading-relaxed text-zinc-400">
                {s.recoveredAmount > 0
                  ? "Recovered from failed charges while you stay focused on building the product."
                  : stripeConnected
                    ? "Dunlo will show recovered revenue here as soon as the first payment comes back."
                    : "Connect Stripe once, then let Dunlo watch failed payments in the background."}
              </p>
            </div>

            <div className="rounded-[2rem] border border-zinc-200/70 bg-white p-5">
              <div className="flex flex-col gap-1 border-b border-zinc-100 pb-5">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                  Next actions
                </p>
                <p className="text-sm font-semibold text-zinc-950">
                  {pendingEscalations > 0
                    ? `${pendingEscalations} customer${pendingEscalations === 1 ? "" : "s"} to review`
                    : "Nothing urgent right now"}
                </p>
              </div>

              <div className="mt-4 grid gap-3">
                <QuickAction
                  icon={Zap}
                  label="Recovery emails"
                  meta="Adjust timing and tone"
                  to="/sequences"
                />
                <QuickAction
                  icon={Settings}
                  label="Founder alerts"
                  meta="Choose when Dunlo pings you"
                  to="/settings"
                />
              </div>
            </div>
          </aside>

          <div className="min-w-0 space-y-6">
            <div className="rounded-[2.25rem] border border-zinc-200/70 bg-white p-5 sm:p-6 lg:p-8">
              <div className="mb-7">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                      Founder brief
                    </p>
                    <h2 className="mt-1 text-lg font-semibold tracking-tight text-zinc-950">
                      What changed this month
                    </h2>
                  </div>
                  <span className="w-fit rounded-full border border-zinc-200 px-3 py-1 font-mono text-[10px] font-semibold text-zinc-400">
                    This month
                  </span>
                </div>

                <div className="mt-5 grid gap-px overflow-hidden rounded-[1.5rem] border border-zinc-100 bg-zinc-100 sm:grid-cols-2 xl:grid-cols-4">
                  {metrics.map((metric, index) => (
                    <BriefMetric
                      key={metric.label}
                      metric={metric}
                      index={index}
                    />
                  ))}
                </div>
              </div>

              <RecoveryTrendChart currency={currency} data={recoveryTrend} />
            </div>

            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.16,
                duration: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="overflow-hidden rounded-[2rem] border border-zinc-200/70 bg-white"
            >
              <div className="grid gap-4 border-b border-zinc-100 px-5 py-5 sm:grid-cols-[1fr_auto] sm:items-end sm:px-6">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                    Customer follow-up
                  </p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight text-zinc-950">
                    Failed charges to watch
                  </h2>
                </div>
                <Link
                  to="/payments"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-dunlo-dim transition-all hover:gap-2.5 active:scale-[0.98]"
                >
                  View all
                  <ArrowRight size={14} strokeWidth={2} />
                </Link>
              </div>

              {recentPayments.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                  <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-zinc-50">
                    <CheckCircle2
                      size={22}
                      strokeWidth={2}
                      className="text-zinc-300"
                    />
                  </div>
                  <p className="text-sm font-semibold text-zinc-800">
                    No failed payments to chase
                  </p>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-500">
                    When Stripe sends a failed charge, Dunlo will put the
                    customer here with the amount, reason, and recovery state.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-190">
                    <thead>
                      <tr className="border-b border-zinc-100">
                        {["Customer", "Failure", "Amount", "Status", ""].map(
                          (h, i) => (
                            <th
                              key={i}
                              className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-400 first:pl-6 last:pr-6"
                            >
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {recentPayments.map((p, index) => (
                        <motion.tr
                          key={p.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: index * 0.025,
                            duration: 0.22,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          className="group transition-colors hover:bg-zinc-50/80"
                        >
                          <td className="px-5 py-4 pl-6">
                            <Link
                              to="/payments/$id"
                              params={{ id: p.id }}
                              className="block"
                            >
                              <p className="text-sm font-semibold text-zinc-950 transition-colors group-hover:text-dunlo-deep">
                                {p.name}
                              </p>
                              <p className="mt-0.5 text-xs text-zinc-400">
                                {p.email}
                              </p>
                            </Link>
                          </td>
                          <td className="px-5 py-4">
                            <Link
                              to="/payments/$id"
                              params={{ id: p.id }}
                              className="block text-sm text-zinc-500"
                            >
                              {p.type}
                            </Link>
                          </td>
                          <td className="px-5 py-4">
                            <Link
                              to="/payments/$id"
                              params={{ id: p.id }}
                              className="block"
                            >
                              <span className="font-mono text-sm font-semibold text-zinc-950">
                                {p.amount}
                              </span>
                            </Link>
                          </td>
                          <td className="px-5 py-4">
                            <Link
                              to="/payments/$id"
                              params={{ id: p.id }}
                              className="block"
                            >
                              <span
                                className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${STATUS_STYLE[p.status] ?? STATUS_STYLE.failed}`}
                              >
                                {STATUS_LABEL[p.status] ?? p.status}
                              </span>
                            </Link>
                          </td>
                          <td className="px-5 py-4 pr-6 text-right">
                            <Link
                              to="/payments/$id"
                              params={{ id: p.id }}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-300 opacity-0 transition-all group-hover:opacity-100 group-hover:text-dunlo-dim"
                            >
                              Detail <ArrowRight size={12} strokeWidth={2} />
                            </Link>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.section>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

function BriefMetric({ metric, index }: { metric: Metric; index: number }) {
  const Icon = metric.icon;
  const toneClass = {
    green: "bg-dunlo/[0.08] text-dunlo",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    zinc: "bg-zinc-50 text-zinc-400",
  }[metric.tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.12 + index * 0.045,
        duration: 0.24,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="bg-white p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
          {metric.label}
        </p>
        <span
          className={`flex size-8 shrink-0 items-center justify-center rounded-full ${toneClass}`}
        >
          <Icon size={15} strokeWidth={2} />
        </span>
      </div>
      <p className="mt-4 font-mono text-2xl font-bold leading-none tracking-tight text-zinc-950">
        {metric.value}
      </p>
      <p className="mt-2 text-xs text-zinc-400">{metric.meta}</p>
    </motion.div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  meta,
  to,
}: {
  icon: typeof Zap;
  label: string;
  meta: string;
  to: "/sequences" | "/settings";
}) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between gap-4 rounded-3xl bg-zinc-50/70 px-4 py-3 transition-all hover:bg-zinc-50 active:scale-[0.99]"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-zinc-50 text-zinc-400 transition-colors group-hover:bg-dunlo/8 group-hover:text-dunlo">
          <Icon size={15} strokeWidth={2} />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-zinc-900">
            {label}
          </span>
          <span className="mt-0.5 block truncate text-xs text-zinc-400">
            {meta}
          </span>
        </span>
      </div>
      <ArrowRight
        size={14}
        strokeWidth={2}
        className="shrink-0 text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:text-dunlo"
      />
    </Link>
  );
}

function RecoveryTrendChart({
  currency,
  data,
}: {
  currency: string;
  data: TrendPoint[];
}) {
  const maxValue = Math.max(
    1,
    ...data.flatMap((point) => [point.failedAmount, point.recoveredAmount]),
  );
  const hasData = data.some(
    (point) => point.failedAmount > 0 || point.recoveredAmount > 0,
  );
  const chartConfig = {
    failedAmount: {
      label: "Failed",
      color: "var(--color-zinc-300)",
    },
    recoveredAmount: {
      label: "Recovered",
      color: "var(--dunlo-accent)",
    },
  } satisfies ChartConfig;

  return (
    <div className="relative min-h-85">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-950">Recovery curve</p>
          <p className="mt-1 text-xs text-zinc-400">
            Failed charges against money brought back
          </p>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-medium text-zinc-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-zinc-300" />
            Failed
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-dunlo" />
            Recovered
          </span>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[1.6rem] bg-zinc-50/70 p-4">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-65 w-full"
          initialDimension={{ width: 720, height: 260 }}
        >
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{ top: 12, right: 14, bottom: 4, left: 4 }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="4 8"
              className="stroke-zinc-200"
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              interval="preserveStartEnd"
              minTickGap={26}
            />
            <YAxis
              width={62}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={[0, maxValue]}
              tickFormatter={(value) => formatAmount(Number(value), currency)}
            />
            <ChartTooltip
              cursor={{ stroke: "var(--dunlo-accent)", strokeDasharray: "4 6" }}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  formatter={(value, name) => (
                    <>
                      <span className="text-muted-foreground">
                        {chartConfig[name as keyof typeof chartConfig]?.label ??
                          name}
                      </span>
                      <span className="ml-auto font-mono font-medium text-foreground tabular-nums">
                        {formatAmount(Number(value), currency)}
                      </span>
                    </>
                  )}
                />
              }
            />
            <Bar
              dataKey="failedAmount"
              fill="var(--color-failedAmount)"
              radius={[5, 5, 0, 0]}
              barSize={18}
            />
            <Area
              dataKey="recoveredAmount"
              type="monotone"
              fill="var(--color-recoveredAmount)"
              fillOpacity={0.16}
              stroke="var(--color-recoveredAmount)"
              strokeWidth={3}
              dot={{
                r: 3,
                strokeWidth: 2,
                fill: "white",
                stroke: "var(--color-recoveredAmount)",
              }}
              activeDot={{
                r: 5,
                strokeWidth: 2,
                fill: "white",
                stroke: "var(--color-recoveredAmount)",
              }}
            />
          </AreaChart>
        </ChartContainer>

        {!hasData ? (
          <div className="absolute inset-3 flex flex-col items-center justify-center rounded-3xl bg-white/80 text-center backdrop-blur-sm">
            <Activity size={20} strokeWidth={2} className="text-zinc-300" />
            <p className="mt-3 text-sm font-semibold text-zinc-700">
              Nothing to read yet
            </p>
            <p className="mt-1 max-w-xs text-xs leading-relaxed text-zinc-400">
              Once a failed payment arrives, this turns into a simple recovery
              curve you can scan in a few seconds.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
