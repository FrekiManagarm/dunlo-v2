import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { z } from "zod";

import { getPayments } from "@/functions/payments";

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

export const Route = createFileRoute("/_dashboard/payments")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Payments — Dunlo" },
    ],
  }),
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({
    status: search.status,
    page: search.page ?? 1,
  }),
  loader: async ({ deps }) => {
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
  const { status, page } = Route.useSearch();
  const { payments, hasMore } = Route.useLoaderData();
  const navigate = Route.useNavigate();

  const currentPage = page ?? 1;

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
    navigate({ to: "/payments", search: { status, page: next } });
  };

  return (
    <>
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-100 bg-white/80 px-6 py-4 backdrop-blur-md">
        <div>
          <h1 className="text-[15px] font-semibold tracking-tight text-zinc-900">Payments</h1>
          <p className="text-xs text-zinc-400">All failed payments</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={status ?? "all"}
            onChange={handleStatusChange}
            className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-zinc-700 focus:border-dunlo/40 focus:outline-none"
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
        <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-[0_1px_4px_0_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-zinc-900">
              {status ? `${STATUS_LABEL[status] ?? status} payments` : "All payments"}
            </h2>
            <span className="text-xs text-zinc-400">Page {currentPage}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-50">
                  {["Customer", "Failure type", "Amount", "Status", "Created"].map((h) => (
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
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-xs text-zinc-400">
                      No payments to show.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
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

          <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-3">
            <button
              onClick={() => goToPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={13} />
              Previous
            </button>
            <span className="text-xs text-zinc-400">
              Showing {payments.length} result{payments.length === 1 ? "" : "s"}
            </span>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={!hasMore}
              className="flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
