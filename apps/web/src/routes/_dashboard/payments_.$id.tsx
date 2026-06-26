import { motion } from "framer-motion";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  History,
  Mail,
  ReceiptText,
  TrendingUp,
  WalletCards,
  XCircle,
} from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { usePostHog } from "posthog-js/react";

import {
  escalatePaymentManually,
  markPaymentRecovered,
} from "@/functions/payments";
import { paymentDetailQueryOptions } from "@/lib/queries";

export const Route = createFileRoute("/_dashboard/payments_/$id")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Payment detail — Dunlo" },
    ],
  }),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(paymentDetailQueryOptions(params.id)),
  component: RouteComponent,
});

const STATUS_STYLE: Record<string, string> = {
  recovered: "bg-dunlo/[0.07] text-dunlo-deep border-dunlo/25",
  in_recovery: "bg-amber-50 text-amber-700 border-amber-100",
  escalated: "bg-red-50 text-red-700 border-red-100",
  failed: "bg-zinc-100 text-zinc-600 border-zinc-200",
  dismissed: "bg-zinc-100 text-zinc-500 border-zinc-200",
};

const STATUS_LABEL: Record<string, string> = {
  recovered: "Recovered",
  in_recovery: "In recovery",
  escalated: "Escalated",
  failed: "Failed",
  dismissed: "Dismissed",
};

const ATTEMPT_META: Record<
  string,
  { icon: React.ElementType; label: string; style: string }
> = {
  scheduled: {
    icon: Clock,
    label: "Scheduled",
    style: "bg-zinc-50 text-zinc-500 border-zinc-200",
  },
  sent: {
    icon: Mail,
    label: "Sent",
    style: "bg-blue-50 text-blue-600 border-blue-100",
  },
  dismissed: {
    icon: XCircle,
    label: "Cancelled",
    style: "bg-zinc-100 text-zinc-400 border-zinc-200",
  },
  failed: {
    icon: XCircle,
    label: "Failed",
    style: "bg-red-50 text-red-500 border-red-100",
  },
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function formatShortDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function formatTenure(iso: string) {
  const start = new Date(iso);
  const now = new Date();
  const months =
    (now.getFullYear() - start.getFullYear()) * 12 +
    now.getMonth() -
    start.getMonth();

  if (months <= 0) return "less than a month";
  if (months < 12) return `${months} month${months === 1 ? "" : "s"}`;

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  return remainingMonths > 0
    ? `${years}y ${remainingMonths}m`
    : `${years} year${years === 1 ? "" : "s"}`;
}

function initials(nameOrEmail: string) {
  const source = nameOrEmail.includes("@")
    ? (nameOrEmail.split("@")[0] ?? nameOrEmail)
    : nameOrEmail;
  return source
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function attemptDelayLabel(delayHours: number) {
  if (delayHours <= 0) return "Immediate";
  if (delayHours < 24) return `${delayHours}h delay`;
  return `${Math.round(delayHours / 24)}d delay`;
}

function RouteComponent() {
  const posthog = usePostHog();
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const { data: payment } = useSuspenseQuery(paymentDetailQueryOptions(id));

  useEffect(() => {
    posthog.capture("payment_viewed", { payment_id: id });
  }, [id, posthog]);

  const isDone =
    payment.status === "recovered" || payment.status === "dismissed";
  const isEscalated =
    payment.status === "escalated" || Boolean(payment.escalation);

  const isTestPayment = payment.stripePaymentIntentId.startsWith("pi_test_");
  const stripeUrl =
    !isTestPayment && payment.stripeAccountId
      ? `https://dashboard.stripe.com/${payment.stripeAccountId}/payments/${payment.stripePaymentIntentId}`
      : null;
  const customerContext = payment.customerContext;
  const stripeContext = customerContext.stripe;
  const subscription = stripeContext?.subscription ?? null;
  const payingSince =
    stripeContext?.payingSince ??
    subscription?.startedAt ??
    customerContext.firstFailedPaymentAt;
  const ltvLabel =
    stripeContext?.totalPaidFormatted ??
    customerContext.localRecoveredAmountFormatted;
  const ltvSubtext =
    typeof stripeContext?.paidInvoiceCount === "number"
      ? `${stripeContext.paidInvoiceCount} paid invoice${stripeContext.paidInvoiceCount === 1 ? "" : "s"}`
      : `${customerContext.recoveredFailedPaymentCount} recovered failed payment${customerContext.recoveredFailedPaymentCount === 1 ? "" : "s"} tracked`;
  const customerName = payment.customerName ?? payment.customerEmail;
  const relationshipLabel = `${formatTenure(payingSince)} relationship`;
  const customerSignal =
    customerContext.previousFailedPaymentCount === 0
      ? "First payment issue"
      : `${customerContext.previousFailedPaymentCount} previous issue${customerContext.previousFailedPaymentCount === 1 ? "" : "s"}`;
  const prioritySignal =
    typeof stripeContext?.totalPaid === "number" &&
    stripeContext.totalPaid > payment.amount * 4
      ? "Prioritize recovery"
      : customerContext.previousFailedPaymentCount === 0
        ? "Use a light touch"
        : "Watch this account";
  const recoveryPathItems = [
    {
      id: "failed",
      label: "Payment failed",
      detail: `${payment.failureLabel} · ${formatDate(payment.createdAt)}`,
      state: "active",
      icon: AlertTriangle,
    },
    ...payment.attempts.map((attempt) => {
      const meta = ATTEMPT_META[attempt.status] ?? ATTEMPT_META.scheduled!;
      return {
        id: attempt.id,
        label: attempt.subject,
        detail: `Step ${attempt.stepNumber} · ${attemptDelayLabel(attempt.delayHours)}${
          attempt.sentAt
            ? ` · Sent ${formatDate(attempt.sentAt)}`
            : attempt.status === "scheduled"
              ? ` · Scheduled ${formatDate(attempt.scheduledAt)}`
              : ""
        }`,
        state: attempt.status,
        icon: meta.icon,
      };
    }),
    ...(payment.escalation
      ? [
          {
            id: "escalation",
            label: "Escalation queue",
            detail: "Founder review and draft follow-up",
            state: "escalated",
            icon: TrendingUp,
          },
        ]
      : []),
    ...(payment.status === "recovered" && payment.recoveredAt
      ? [
          {
            id: "recovered",
            label: "Payment recovered",
            detail: formatDate(payment.recoveredAt),
            state: "recovered",
            icon: CheckCircle2,
          },
        ]
      : []),
  ];

  const invalidatePaymentViews = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["payments"] }),
      queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      queryClient.invalidateQueries({ queryKey: ["escalations"] }),
      queryClient.invalidateQueries({ queryKey: ["alerts", "feed"] }),
    ]);

  const recoverMutation = useMutation({
    mutationFn: (paymentId: string) =>
      markPaymentRecovered({ data: { id: paymentId } }),
    onSuccess: async () => {
      await invalidatePaymentViews();
      toast.success("Payment marked as recovered");
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Failed");
    },
  });

  const escalateMutation = useMutation({
    mutationFn: (paymentId: string) =>
      escalatePaymentManually({ data: { id: paymentId } }),
    onSuccess: async () => {
      await invalidatePaymentViews();
      toast.success("Escalated — AI draft is being generated");
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Failed");
    },
  });
  const { mutateAsync: recoverPayment } = recoverMutation;
  const { mutateAsync: escalatePayment } = escalateMutation;

  const handleRecover = async () => {
    await recoverPayment(payment.id).catch(() => undefined);
  };

  const handleEscalate = async () => {
    await escalatePayment(payment.id).catch(() => undefined);
  };

  return (
    <>
      <div className="sticky top-0 z-20 border-b border-zinc-100 bg-white/85 backdrop-blur-md">
        <div className="flex w-full flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/payments"
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-800 active:scale-[0.98]"
              aria-label="Back to payments"
            >
              <ArrowLeft size={15} />
            </Link>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                Recovery case
              </p>
              <h1 className="truncate text-[15px] font-semibold tracking-tight text-zinc-950">
                {customerName}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {stripeUrl && (
              <a
                href={stripeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 active:scale-[0.98]"
              >
                <ExternalLink size={11} />
                Stripe
              </a>
            )}
            {!isDone && !isEscalated && (
              <button
                onClick={handleEscalate}
                disabled={escalateMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-100 active:scale-[0.98] disabled:opacity-50"
              >
                <TrendingUp size={11} />
                {escalateMutation.isPending ? "Escalating..." : "Escalate"}
              </button>
            )}
            {!isDone && (
              <button
                onClick={handleRecover}
                disabled={recoverMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-full bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50"
              >
                <CheckCircle2 size={11} />
                {recoverMutation.isPending ? "Marking..." : "Mark recovered"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid w-full gap-5 px-4 py-5 md:px-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)]">
        <div className="space-y-5">
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden rounded-[2rem] border border-zinc-900 bg-zinc-950 text-white shadow-[0_24px_60px_-32px_rgba(24,24,27,0.55)]"
          >
            <div className="grid gap-8 p-6 md:grid-cols-[minmax(0,1fr)_220px] md:p-8">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLE[payment.status] ?? STATUS_STYLE.failed}`}
                  >
                    {STATUS_LABEL[payment.status] ?? payment.status}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-zinc-300">
                    {prioritySignal}
                  </span>
                </div>

                <div className="mt-12">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                    Failed amount
                  </p>
                  <p className="mt-2 font-mono text-5xl font-semibold tracking-tight text-white md:text-6xl">
                    {payment.formattedAmount}
                  </p>
                </div>

                <div className="mt-8 max-w-2xl border-t border-white/10 pt-5">
                  <p className="text-lg font-semibold tracking-tight text-white">
                    {payment.failureLabel}
                  </p>
                  <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-zinc-400">
                    {payment.failureMessage ??
                      "Stripe reported this payment as failed. Dunlo is keeping the recovery path open while the customer updates their payment method."}
                  </p>
                </div>
              </div>

              <div className="grid content-end gap-3 text-sm">
                <div className="border-t border-white/10 pt-3 md:border-t-0 md:pt-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                    Detected
                  </p>
                  <p className="mt-1 font-medium text-zinc-100">
                    {formatDate(payment.createdAt)}
                  </p>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                    Payment method
                  </p>
                  <p className="mt-1 font-mono font-medium text-zinc-100">
                    {payment.lastFour
                      ? `card ending ${payment.lastFour}`
                      : payment.stripePaymentIntentId.slice(0, 18)}
                  </p>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                    Customer signal
                  </p>
                  <p className="mt-1 font-medium text-zinc-100">
                    {customerSignal}
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.04,
              duration: 0.24,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="rounded-[2rem] border border-zinc-200/70 bg-white shadow-[0_18px_45px_-32px_rgba(24,24,27,0.28)]"
          >
            <div className="flex flex-col gap-2 border-b border-zinc-100 px-6 py-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                  Recovery path
                </p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-zinc-950">
                  What happens next
                </h2>
              </div>
              <p className="text-xs font-medium text-zinc-400">
                {payment.attempts.length > 0
                  ? `${payment.attempts.length} email step${payment.attempts.length === 1 ? "" : "s"} tracked`
                  : "No email sequence attached"}
              </p>
            </div>

            <div className="px-6 py-5">
              <div className="grid gap-3 md:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
                {recoveryPathItems.map((item, i) => {
                  const Icon = item.icon;
                  const isMuted =
                    item.state === "dismissed" || item.state === "failed";
                  const isResolved = item.state === "recovered";

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.08 + i * 0.04,
                        duration: 0.2,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className={`relative min-h-36 rounded-[1.35rem] border p-4 transition-transform active:scale-[0.99] ${
                        isResolved
                          ? "border-dunlo/25 bg-dunlo/6"
                          : item.state === "active"
                            ? "border-zinc-900 bg-zinc-950 text-white"
                            : "border-zinc-100 bg-zinc-50/60"
                      } ${isMuted ? "opacity-55" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className={`flex size-8 items-center justify-center rounded-full ${
                            item.state === "active"
                              ? "bg-white/10 text-white"
                              : isResolved
                                ? "bg-dunlo/15 text-dunlo-deep"
                                : "bg-white text-zinc-500"
                          }`}
                        >
                          <Icon size={14} />
                        </div>
                        <span
                          className={`font-mono text-[11px] ${
                            item.state === "active"
                              ? "text-zinc-500"
                              : "text-zinc-400"
                          }`}
                        >
                          0{i + 1}
                        </span>
                      </div>
                      <p
                        className={`mt-8 text-sm font-semibold leading-snug ${
                          item.state === "active"
                            ? "text-white"
                            : "text-zinc-900"
                        }`}
                      >
                        {item.label}
                      </p>
                      <p
                        className={`mt-2 text-xs leading-relaxed ${
                          item.state === "active"
                            ? "text-zinc-400"
                            : "text-zinc-500"
                        }`}
                      >
                        {item.detail}
                      </p>
                    </motion.div>
                  );
                })}
              </div>

              {payment.attempts.length === 0 && !payment.escalation && (
                <div className="mt-4 rounded-2xl border border-dashed border-zinc-200 px-4 py-3 text-xs font-medium text-zinc-500">
                  {isEscalated
                    ? "This payment is escalated. Review it from the Escalations page."
                    : "No matching recovery sequence was found for this failure code."}
                </div>
              )}
            </div>
          </motion.section>

          {(payment.escalation ||
            (payment.status === "recovered" && payment.recoveredAt)) && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.08,
                duration: 0.24,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`rounded-[1.5rem] border px-5 py-4 ${
                payment.status === "recovered"
                  ? "border-dunlo/20 bg-dunlo/5"
                  : "border-amber-100 bg-amber-50"
              }`}
            >
              <div className="flex items-start gap-3">
                {payment.status === "recovered" ? (
                  <CheckCircle2
                    size={15}
                    className="mt-0.5 shrink-0 text-dunlo"
                  />
                ) : (
                  <AlertTriangle
                    size={15}
                    className="mt-0.5 shrink-0 text-amber-600"
                  />
                )}
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      payment.status === "recovered"
                        ? "text-dunlo-deep"
                        : "text-amber-900"
                    }`}
                  >
                    {payment.status === "recovered" ? "Recovered" : "Escalated"}
                  </p>
                  <p
                    className={`mt-0.5 text-xs ${
                      payment.status === "recovered"
                        ? "text-dunlo-dim"
                        : "text-amber-800"
                    }`}
                  >
                    {payment.status === "recovered" && payment.recoveredAt
                      ? `Payment recovered on ${formatDate(payment.recoveredAt)}.`
                      : "This payment is in the escalation queue."}
                    {payment.escalation && payment.status !== "recovered" && (
                      <>
                        {" "}
                        <Link
                          to="/escalations"
                          className="underline underline-offset-2"
                        >
                          View in Escalations
                        </Link>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </motion.section>
          )}

          <details className="group rounded-[1.5rem] border border-zinc-200/70 bg-white">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-50 active:scale-[0.99]">
              Technical details
              <span className="text-xs font-medium text-zinc-400 group-open:hidden">
                Show Stripe IDs
              </span>
              <span className="hidden text-xs font-medium text-zinc-400 group-open:inline">
                Hide
              </span>
            </summary>
            <div className="grid gap-0 border-t border-zinc-100 md:grid-cols-2 md:divide-x md:divide-zinc-100">
              <div className="space-y-4 px-5 py-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                    Payment intent
                  </p>
                  <p className="mt-1 break-all font-mono text-xs text-zinc-700">
                    {payment.stripePaymentIntentId}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                    Stripe customer
                  </p>
                  <p className="mt-1 break-all font-mono text-xs text-zinc-700">
                    {customerContext.stripeCustomerId}
                  </p>
                </div>
              </div>
              <div className="space-y-4 px-5 py-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                    Stripe account
                  </p>
                  <p className="mt-1 break-all font-mono text-xs text-zinc-700">
                    {payment.stripeAccountId}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                    Context source
                  </p>
                  <p className="mt-1 text-xs font-medium text-zinc-700">
                    {stripeContext?.stripeAvailable
                      ? "Stripe + Dunlo history"
                      : "Dunlo history only"}
                  </p>
                </div>
              </div>
            </div>
          </details>
        </div>

        <motion.aside
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="lg:sticky lg:top-24 lg:self-start"
        >
          <div className="overflow-hidden rounded-[2rem] border border-zinc-200/70 bg-white shadow-[0_18px_45px_-34px_rgba(24,24,27,0.28)]">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                  {initials(customerName)}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                    Customer dossier
                  </p>
                  <h2 className="mt-1 truncate text-lg font-semibold tracking-tight text-zinc-950">
                    {customerName}
                  </h2>
                  <p className="truncate text-xs text-zinc-400">
                    {payment.customerEmail}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-dunlo/20 bg-dunlo/5 px-4 py-3">
                <p className="text-sm font-semibold text-dunlo-deep">
                  {prioritySignal}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-dunlo-dim">
                  {relationshipLabel} · {ltvLabel} paid · {customerSignal}
                </p>
              </div>
            </div>

            <div className="divide-y divide-zinc-100 border-t border-zinc-100">
              <div className="grid grid-cols-[32px_minmax(0,1fr)] gap-3 px-6 py-4">
                <CalendarDays size={15} className="mt-0.5 text-zinc-400" />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                    Paying since
                  </p>
                  <p className="mt-1 text-sm font-semibold text-zinc-950">
                    {formatShortDate(payingSince)}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    {relationshipLabel}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-[32px_minmax(0,1fr)] gap-3 px-6 py-4">
                <WalletCards size={15} className="mt-0.5 text-zinc-400" />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                    Subscription
                  </p>
                  <p className="mt-1 truncate text-sm font-semibold text-zinc-950">
                    {subscription?.plan ?? "No subscription found"}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    {subscription
                      ? `${subscription.status}${subscription.interval ? ` · ${subscription.interval}` : ""}`
                      : "Stripe did not return an active plan"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-[32px_minmax(0,1fr)] gap-3 px-6 py-4">
                <ReceiptText size={15} className="mt-0.5 text-zinc-400" />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                    Paid value
                  </p>
                  <p className="mt-1 font-mono text-sm font-semibold text-zinc-950">
                    {ltvLabel}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-400">{ltvSubtext}</p>
                </div>
              </div>

              <div className="grid grid-cols-[32px_minmax(0,1fr)] gap-3 px-6 py-4">
                <History size={15} className="mt-0.5 text-zinc-400" />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                    Failure history
                  </p>
                  <p className="mt-1 text-sm font-semibold text-zinc-950">
                    {customerSignal}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    {customerContext.failedPaymentCount} total tracked by Dunlo
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-[32px_minmax(0,1fr)] gap-3 px-6 py-4">
                <CreditCard size={15} className="mt-0.5 text-zinc-400" />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                    Last paid invoice
                  </p>
                  <p className="mt-1 text-sm font-semibold text-zinc-950">
                    {stripeContext?.lastPaidInvoiceAt
                      ? formatShortDate(stripeContext.lastPaidInvoiceAt)
                      : "Not available"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.aside>
      </div>
    </>
  );
}
