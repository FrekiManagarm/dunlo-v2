import { motion } from "framer-motion";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  Mail,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
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

function RouteComponent() {
  const posthog = usePostHog();
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const { data: payment } = useSuspenseQuery(paymentDetailQueryOptions(id));

  useEffect(() => {
    posthog.capture("payment_viewed", { payment_id: id });
  }, [id, posthog]);
  const [recovering, setRecovering] = useState(false);
  const [escalating, setEscalating] = useState(false);

  const isDone =
    payment.status === "recovered" || payment.status === "dismissed";
  const isEscalated =
    payment.status === "escalated" || Boolean(payment.escalation);

  const isTestPayment = payment.stripePaymentIntentId.startsWith("pi_test_");
  const stripeUrl =
    !isTestPayment && payment.stripeAccountId
      ? `https://dashboard.stripe.com/${payment.stripeAccountId}/payments/${payment.stripePaymentIntentId}`
      : null;

  const invalidatePaymentViews = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["payments"] }),
      queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      queryClient.invalidateQueries({ queryKey: ["escalations"] }),
      queryClient.invalidateQueries({ queryKey: ["alerts", "feed"] }),
    ]);

  const handleRecover = async () => {
    setRecovering(true);
    try {
      await markPaymentRecovered({ data: { id: payment.id } });
      await invalidatePaymentViews();
      toast.success("Payment marked as recovered");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setRecovering(false);
    }
  };

  const handleEscalate = async () => {
    setEscalating(true);
    try {
      await escalatePaymentManually({ data: { id: payment.id } });
      await invalidatePaymentViews();
      toast.success("Escalated — AI draft is being generated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setEscalating(false);
    }
  };

  return (
    <>
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-100 bg-white/80 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            to="/payments"
            className="flex size-7 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
          >
            <ArrowLeft size={15} />
          </Link>
          <div>
            <h1 className="text-[15px] font-semibold tracking-tight text-zinc-900">
              {payment.customerName ?? payment.customerEmail}
            </h1>
            <p className="text-xs text-zinc-400">{payment.customerEmail}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {stripeUrl && (
            <a
              href={stripeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition-all hover:bg-zinc-50 active:scale-[0.97]"
            >
              <ExternalLink size={11} />
              Stripe
            </a>
          )}
          {!isDone && !isEscalated && (
            <button
              onClick={handleEscalate}
              disabled={escalating}
              className="flex items-center gap-1.5 rounded-xl border border-amber-100 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition-all hover:bg-amber-100 active:scale-[0.97] disabled:opacity-50"
            >
              <TrendingUp size={11} />
              {escalating ? "Escalating…" : "Escalate"}
            </button>
          )}
          {!isDone && (
            <button
              onClick={handleRecover}
              disabled={recovering}
              className="flex items-center gap-1.5 rounded-xl bg-dunlo px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-dunlo-hover active:scale-[0.97] disabled:opacity-50"
            >
              <CheckCircle2 size={11} />
              {recovering ? "Marking…" : "Mark recovered"}
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto space-y-4 p-6">
        {/* Summary card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-zinc-100 bg-white shadow-[0_1px_4px_0_rgba(0,0,0,0.04)]"
        >
          <div className="flex items-start justify-between gap-4 p-5">
            <div className="flex items-start gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-50">
                <CreditCard size={16} className="text-zinc-400" />
              </div>
              <div>
                <p className="text-xl font-bold tracking-tight text-zinc-900 font-mono">
                  {payment.formattedAmount}
                </p>
                <p className="mt-0.5 text-xs text-zinc-400">
                  {payment.customerEmail}
                </p>
              </div>
            </div>
            <span
              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLE[payment.status] ?? STATUS_STYLE.failed}`}
            >
              {STATUS_LABEL[payment.status] ?? payment.status}
            </span>
          </div>

          <div className="grid grid-cols-3 divide-x divide-zinc-50 border-t border-zinc-50">
            <div className="px-5 py-3.5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                Failure
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-800">
                {payment.failureLabel}
              </p>
              {payment.failureMessage && (
                <p
                  className="mt-0.5 text-[11px] text-zinc-400 truncate"
                  title={payment.failureMessage}
                >
                  {payment.failureMessage}
                </p>
              )}
            </div>
            <div className="px-5 py-3.5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                Detected
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-800">
                {formatDate(payment.createdAt)}
              </p>
            </div>
            <div className="px-5 py-3.5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                {payment.lastFour ? "Card" : "ID"}
              </p>
              <p className="mt-1 text-sm font-mono text-zinc-800">
                {payment.lastFour
                  ? `•••• ${payment.lastFour}`
                  : payment.stripePaymentIntentId.slice(0, 16) + "…"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Recovery timeline */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-zinc-100 bg-white shadow-[0_1px_4px_0_rgba(0,0,0,0.04)]"
        >
          <div className="border-b border-zinc-50 px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
              Recovery sequence
            </p>
          </div>

          {payment.attempts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-zinc-50">
                <Mail size={16} className="text-zinc-300" />
              </div>
              <p className="text-sm font-medium text-zinc-500">
                No emails scheduled
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                {isEscalated
                  ? "This payment is escalated — check the Escalations page."
                  : "No matching recovery sequence found for this failure code."}
              </p>
            </div>
          ) : (
            <div className="relative px-5 py-4">
              <div className="absolute left-10 top-8 bottom-8 w-px bg-zinc-100" />
              <div className="space-y-1">
                {payment.attempts.map((attempt, i) => {
                  const meta: {
                    icon: React.ElementType;
                    label: string;
                    style: string;
                  } = ATTEMPT_META[attempt.status] ?? ATTEMPT_META.scheduled!;
                  const Icon = meta.icon;
                  const isCancelled = attempt.status === "dismissed";

                  return (
                    <motion.div
                      key={attempt.id}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.08 + i * 0.04,
                        duration: 0.18,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className={`flex items-start gap-4 rounded-xl px-2 py-3 transition-colors ${isCancelled ? "opacity-40" : ""}`}
                    >
                      <div className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border border-white bg-white shadow-[0_0_0_3px_#f4f4f5]">
                        <Icon
                          size={12}
                          className={
                            meta.style
                              .split(" ")
                              .find((c) => c.startsWith("text-")) ??
                            "text-zinc-400"
                          }
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-zinc-800 truncate">
                            {attempt.subject}
                          </p>
                          <span
                            className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${meta.style}`}
                          >
                            {meta.label}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-zinc-400">
                          Step {attempt.stepNumber}
                          {attempt.delayHours > 0
                            ? ` · ${attempt.delayHours < 24 ? `${attempt.delayHours}h delay` : `${Math.round(attempt.delayHours / 24)}d delay`}`
                            : " · Immediate"}
                          {attempt.sentAt
                            ? ` · Sent ${formatDate(attempt.sentAt)}`
                            : ` · ${attempt.status === "scheduled" ? `Scheduled ${formatDate(attempt.scheduledAt)}` : ""}`}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>

        {/* Escalation notice */}
        {payment.escalation && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4"
          >
            <AlertTriangle
              size={14}
              className="mt-0.5 shrink-0 text-amber-500"
            />
            <div>
              <p className="text-sm font-semibold text-amber-800">Escalated</p>
              <p className="mt-0.5 text-xs text-amber-700">
                This payment is in the escalation queue.{" "}
                <Link
                  to="/escalations"
                  className="underline underline-offset-2"
                >
                  View in Escalations →
                </Link>
              </p>
            </div>
          </motion.div>
        )}

        {/* Recovery notice */}
        {payment.status === "recovered" && payment.recoveredAt && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-start gap-3 rounded-2xl border border-dunlo/20 bg-dunlo/5 px-5 py-4"
          >
            <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-dunlo" />
            <div>
              <p className="text-sm font-semibold text-dunlo-deep">Recovered</p>
              <p className="mt-0.5 text-xs text-dunlo-dim">
                Payment recovered on {formatDate(payment.recoveredAt)}.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}
