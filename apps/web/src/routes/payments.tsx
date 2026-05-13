import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  AlertCircle,
  Bell,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Settings,
  Zap,
  Receipt,
} from "lucide-react";
import { z } from "zod";

import { authClient } from "@/lib/auth-client";
import { getUser } from "@/functions/get-user";
import { getPayments } from "@/functions/payments";
import { Logo } from "@/components/logo";

const PAGE_SIZE = 50;

const STATUS_VALUES = [
  "in_recovery",
  "recovered",
  "escalated",
  "failed",
  "dismissed",
] as const;
type StatusFilter = (typeof STATUS_VALUES)[number];

const searchSchema = z.object({
  status: z.enum(STATUS_VALUES).optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
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

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Payments — Dunlo" },
    ],
  }),
  validateSearch: searchSchema,
  beforeLoad: async () => {
    const session = await getUser();
    return { session };
  },
  loaderDeps: ({ search }) => ({
    status: search.status,
    page: search.page ?? 1,
  }),
  loader: async ({ context, deps }) => {
    if (!context.session) {
      throw redirect({ to: "/login" });
    }
    const offset = ((deps.page ?? 1) - 1) * PAGE_SIZE;
    const data = await getPayments({
      data: {
        status: deps.status,
        limit: PAGE_SIZE,
        offset,
      },
    });
    return data;
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { session } = Route.useRouteContext();
  const { status, page } = Route.useSearch();
  const { payments, hasMore } = Route.useLoaderData();
  const navigate = Route.useNavigate();

  const currentPage = page ?? 1;

  const handleSignOut = () => {
    authClient.signOut({
      fetchOptions: { onSuccess: () => navigate({ to: "/" }) },
    });
  };

  const handleStatusChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const value = e.target.value;
    navigate({
      to: "/payments",
      search: {
        status: value === "all" ? undefined : (value as StatusFilter),
        page: 1,
      },
    });
  };

  const goToPage = (next: number) => {
    navigate({
      to: "/payments",
      search: { status, page: next },
    });
  };

  return (
    <div className="flex min-h-dvh bg-[#f7f8fa] font-sans">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-gray-100 bg-white lg:flex">
        <div className="flex items-center border-b border-gray-100 px-5 py-4">
          <Logo size={26} />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {[
            {
              icon: LayoutDashboard,
              label: "Overview",
              active: false,
              to: "/dashboard" as const,
            },
            {
              icon: Receipt,
              label: "Payments",
              active: true,
              to: "/payments" as const,
            },
            {
              icon: Zap,
              label: "Recovery sequences",
              active: false,
              to: null,
            },
            {
              icon: AlertCircle,
              label: "Escalations",
              active: false,
              to: null,
            },
            { icon: Bell, label: "Alerts", active: false, to: null },
            { icon: Settings, label: "Settings", active: false, to: null },
          ].map(({ icon: Icon, label, active, to }) => {
            const className = `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
              active
                ? "bg-gray-100 text-gray-900"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            }`;
            if (to) {
              return (
                <Link key={label} to={to} className={className}>
                  <Icon size={15} />
                  {label}
                </Link>
              );
            }
            return (
              <button key={label} className={className}>
                <Icon size={15} />
                {label}
              </button>
            );
          })}
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
            <h1 className="text-base font-bold text-gray-900">Payments</h1>
            <p className="text-xs text-gray-400">All failed payments</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={status ?? "all"}
              onChange={handleStatusChange}
              className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-gray-700 focus:border-dunlo/40 focus:outline-none"
            >
              <option value="all">All statuses</option>
              <option value="in_recovery">In recovery</option>
              <option value="recovered">Recovered</option>
              <option value="escalated">Escalated</option>
              <option value="failed">Failed</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-900">
                {status
                  ? `${STATUS_LABEL[status] ?? status} payments`
                  : "All payments"}
              </h2>
              <span className="text-xs text-gray-400">
                Page {currentPage}
              </span>
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
                      "Created",
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
                  {payments.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-10 text-center text-xs text-gray-400"
                      >
                        No payments to show.
                      </td>
                    </tr>
                  ) : (
                    payments.map((p) => (
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
                          <span className="text-sm text-gray-600">
                            {p.type}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-mono text-sm font-semibold text-gray-900">
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
                          <span className="text-xs text-gray-400">
                            {p.time}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
              <button
                onClick={() => goToPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={13} />
                Previous
              </button>
              <span className="text-xs text-gray-400">
                Showing {payments.length} result
                {payments.length === 1 ? "" : "s"}
              </span>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={!hasMore}
                className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
