import { motion } from "framer-motion";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight, CreditCard } from "lucide-react";
import { z } from "zod";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@dunlo-v2/ui/components/select";

import { paymentsListQueryOptions } from "@/lib/queries";

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
  recovered: "bg-dunlo/[0.07] text-dunlo-deep border-dunlo/25",
  in_recovery: "bg-amber-50 text-amber-700 border-amber-100",
  escalated: "bg-red-50 text-red-700 border-red-100",
  failed: "bg-zinc-100 text-zinc-500 border-zinc-200",
  dismissed: "bg-zinc-100 text-zinc-400 border-zinc-200",
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
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(
      paymentsListQueryOptions({
        status: deps.status,
        limit: PAGE_SIZE,
        offset: ((deps.page ?? 1) - 1) * PAGE_SIZE,
      }),
    ),
  component: RouteComponent,
});

function RouteComponent() {
  const { status, page } = Route.useSearch();
  const { data } = useSuspenseQuery(
    paymentsListQueryOptions({
      status,
      limit: PAGE_SIZE,
      offset: ((page ?? 1) - 1) * PAGE_SIZE,
    }),
  );
  const { payments, hasMore } = data;
  const navigate = Route.useNavigate();

  const currentPage = page ?? 1;

  const handleStatusChange = (value: string | null) => {
    navigate({
      to: "/payments",
      search: {
        status: !value || value === "all" ? undefined : (value as StatusFilter),
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
          <Select value={status ?? "all"} onValueChange={handleStatusChange}>
            <SelectTrigger className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-zinc-700 focus:border-dunlo/40 focus:outline-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="in_recovery">In recovery</SelectItem>
              <SelectItem value="recovered">Recovered</SelectItem>
              <SelectItem value="escalated">Escalated</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>
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
                  {["Customer", "Failure type", "Amount", "Status", "Created", ""].map((h, i) => (
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
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <CreditCard size={18} className="text-zinc-200" />
                        <p className="text-xs text-zinc-400">No payments to show.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="group transition-colors hover:bg-zinc-50/60"
                    >
                      <td className="px-5 py-3.5">
                        <Link to="/payments/$id" params={{ id: p.id }} className="block">
                          <p className="text-sm font-semibold text-zinc-900 transition-colors group-hover:text-dunlo-deep">
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
                          <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${STATUS_STYLE[p.status] ?? "bg-zinc-100 text-zinc-400 border-zinc-200"}`}>
                            {STATUS_LABEL[p.status] ?? p.status}
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link to="/payments/$id" params={{ id: p.id }} className="block text-[11px] text-zinc-400">
                          {p.time}
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
