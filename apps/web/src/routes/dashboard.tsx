import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle,
  ChevronRight,
  DollarSign,
  LayoutDashboard,
  LogOut,
  Settings,
  TrendingUp,
  Zap,
  Bell,
  ExternalLink,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { getUser } from "@/functions/get-user";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await getUser();
    return { session };
  },
  loader: async ({ context }) => {
    if (!context.session) {
      throw redirect({ to: "/login" });
    }
  },
});

const PAYMENTS = [
  {
    id: 1,
    name: "Meridian Analytics",
    email: "billing@meridian.io",
    amount: "€890",
    status: "recovered",
    type: "Card expired",
    time: "2 min ago",
  },
  {
    id: 2,
    name: "Volta Cloud",
    email: "ops@voltacloud.eu",
    amount: "€2,340",
    status: "escalated",
    type: "Bank declined",
    time: "18 min ago",
  },
  {
    id: 3,
    name: "Praxis Labs",
    email: "cfo@praxislabs.com",
    amount: "€415",
    status: "recovering",
    type: "Insufficient funds",
    time: "1 hour ago",
  },
  {
    id: 4,
    name: "Helix Software",
    email: "admin@helix.dev",
    amount: "€1,200",
    status: "recovered",
    type: "Card expired",
    time: "3 hours ago",
  },
  {
    id: 5,
    name: "Orbis Finance",
    email: "finance@orbis.io",
    amount: "€3,500",
    status: "escalated",
    type: "Bank declined",
    time: "5 hours ago",
  },
];

const STATUS_STYLE: Record<string, string> = {
  recovered: "bg-dunlo/8 text-dunlo-deep border-dunlo/25",
  recovering: "bg-amber-50 text-amber-700 border-amber-200",
  escalated: "bg-red-50 text-red-700 border-red-200",
  pending: "bg-gray-100 text-gray-600 border-gray-200",
};

function RouteComponent() {
  const { session } = Route.useRouteContext();
  const navigate = Route.useNavigate();

  const handleSignOut = () => {
    authClient.signOut({
      fetchOptions: { onSuccess: () => navigate({ to: "/" }) },
    });
  };

  const stats = [
    {
      label: "Recovered this month",
      value: "€12,480",
      delta: "+18% vs last month",
      icon: TrendingUp,
      positive: true,
    },
    {
      label: "Failed payments",
      value: "47",
      delta: "34 in recovery",
      icon: AlertCircle,
      positive: null,
    },
    {
      label: "Recovery rate",
      value: "72.3%",
      delta: "+4.1% this week",
      icon: CheckCircle,
      positive: true,
    },
    {
      label: "MRR at risk",
      value: "€3,240",
      delta: "13 accounts",
      icon: DollarSign,
      positive: false,
    },
  ];

  return (
    <div className="flex min-h-dvh bg-[#f7f8fa] font-sans">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-gray-100 bg-white lg:flex">
        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
          <span className="flex size-7 items-center justify-center rounded-full bg-dunlo text-[11px] font-bold text-white">
            D
          </span>
          <span className="text-sm font-semibold text-gray-900">dunlo</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {[
            { icon: LayoutDashboard, label: "Overview", active: true },
            { icon: Zap, label: "Recovery sequences", active: false },
            { icon: AlertCircle, label: "Escalations", active: false },
            { icon: Bell, label: "Alerts", active: false },
            { icon: Settings, label: "Settings", active: false },
          ].map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>

        <div className="border-t border-gray-100 p-4">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-700">
              {session?.user.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">
                {session?.user.name}
              </p>
              <p className="truncate text-xs text-gray-400">
                {session?.user.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-xs text-gray-400 transition-colors hover:text-gray-700"
          >
            <LogOut size={12} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-100 bg-white/80 px-6 py-4 backdrop-blur-md">
          <div>
            <h1 className="text-base font-bold text-gray-900">Overview</h1>
            <p className="text-xs text-gray-400">
              Welcome back, {session?.user.name?.split(" ")[0]}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-dunlo/25 bg-dunlo/8 px-3 py-1.5">
              <span className="size-1.5 animate-pulse rounded-full bg-dunlo" />
              <span className="text-[11px] font-semibold text-dunlo-deep">
                Beta · Stripe connected
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Stripe CTA */}
          <div className="flex items-center justify-between rounded-2xl border border-dunlo/25 bg-dunlo/8 p-5">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Connect Stripe to start recovering payments
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                Takes 2 minutes. OAuth, no code required.
              </p>
            </div>
            <button className="flex shrink-0 items-center gap-2 rounded-full bg-dunlo px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-dunlo-hover active:scale-[0.97]">
              Connect Stripe
              <ExternalLink size={13} />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(({ label, value, delta, icon: Icon, positive }) => (
              <div
                key={label}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <p className="text-xs font-medium text-gray-400">{label}</p>
                  <div className="rounded-xl bg-gray-50 p-1.5">
                    <Icon size={14} className="text-gray-400" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
                <p
                  className={`mt-1 text-xs font-semibold ${
                    positive === true
                      ? "text-dunlo-dim"
                      : positive === false
                        ? "text-red-500"
                        : "text-gray-400"
                  }`}
                >
                  {delta}
                </p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-900">
                Payments in recovery
              </h2>
              <button className="flex items-center gap-1 text-xs font-medium text-dunlo-dim hover:underline">
                View all <ChevronRight size={13} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50">
                    {[
                      "Customer",
                      "Failure type",
                      "Amount",
                      "Status",
                      "Time",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {PAYMENTS.map((p) => (
                    <tr
                      key={p.id}
                      className="transition-colors hover:bg-gray-50/50"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-gray-900">
                          {p.name}
                        </p>
                        <p className="text-xs text-gray-400">{p.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-600">{p.type}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono text-sm font-semibold text-gray-900">
                          {p.amount}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${STATUS_STYLE[p.status]}`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-gray-400">{p.time}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick actions */}
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
                className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <p className="text-sm font-semibold text-gray-900">{a.title}</p>
                <p className="mt-1 text-xs text-gray-400">{a.desc}</p>
                <button className="mt-4 flex items-center gap-1 text-xs font-semibold text-dunlo-dim transition-all group-hover:gap-2">
                  {a.cta}
                  <ChevronRight size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
