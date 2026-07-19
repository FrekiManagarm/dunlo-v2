import { queryOptions } from "@tanstack/react-query";

import { getAlertFeed, getNotificationSettings } from "@/functions/alerts";
import {
  getPublicBenchmarkData,
  getUserBenchmarkData,
} from "@/functions/benchmark";
import { getEmailProvider } from "@/functions/email-provider";
import {
  getDiagnosticReport,
  getDiagnosticState,
} from "@/functions/diagnostic";
import { getEscalations, getEscalationSettings } from "@/functions/escalations";
import {
  getDashboardData,
  getPaymentDetail,
  getPayments,
} from "@/functions/payments";
import { getSequences } from "@/functions/sequences";
import { getOnboardingState } from "@/functions/stripe";

const PAYMENT_STATUSES = [
  "in_recovery",
  "recovered",
  "escalated",
  "failed",
  "dismissed",
] as const;
type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const dashboardQueryOptions = () =>
  queryOptions({
    queryKey: ["dashboard"] as const,
    queryFn: () => getDashboardData(),
  });

export const paymentsListQueryOptions = (params: {
  status?: PaymentStatus;
  limit: number;
  offset: number;
}) =>
  queryOptions({
    queryKey: ["payments", "list", params] as const,
    queryFn: () => getPayments({ data: params }),
  });

export const paymentDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["payments", "detail", id] as const,
    queryFn: () => getPaymentDetail({ data: { id } }),
  });

export const escalationsQueryOptions = () =>
  queryOptions({
    queryKey: ["escalations"] as const,
    queryFn: () => getEscalations(),
  });

export const escalationSettingsQueryOptions = () =>
  queryOptions({
    queryKey: ["escalation-settings"] as const,
    queryFn: () => getEscalationSettings(),
  });

export const sequencesQueryOptions = () =>
  queryOptions({
    queryKey: ["sequences"] as const,
    queryFn: () => getSequences(),
  });

export const alertFeedQueryOptions = () =>
  queryOptions({
    queryKey: ["alerts", "feed"] as const,
    queryFn: () => getAlertFeed(),
  });

export const notificationSettingsQueryOptions = () =>
  queryOptions({
    queryKey: ["alerts", "settings"] as const,
    queryFn: () => getNotificationSettings(),
  });

export const emailProviderQueryOptions = () =>
  queryOptions({
    queryKey: ["email-provider"] as const,
    queryFn: () => getEmailProvider(),
  });

export const onboardingStateQueryOptions = () =>
  queryOptions({
    queryKey: ["onboarding-state"] as const,
    queryFn: () => getOnboardingState(),
  });

export const diagnosticStateQueryOptions = (connectionId?: string) =>
  queryOptions({
    queryKey: ["diagnostic", "state", connectionId ?? "current"] as const,
    queryFn: () => getDiagnosticState({ data: { connectionId } }),
    refetchInterval: (query) =>
      query.state.data?.phase === "diagnosing" ? 2_500 : false,
  });

export const diagnosticReportQueryOptions = (connectionId: string) =>
  queryOptions({
    queryKey: ["diagnostic", "report", connectionId] as const,
    queryFn: () => getDiagnosticReport({ data: { connectionId } }),
  });

export const publicBenchmarkQueryOptions = () =>
  queryOptions({
    queryKey: ["benchmark", "public"] as const,
    queryFn: () => getPublicBenchmarkData(),
  });

export const userBenchmarkQueryOptions = () =>
  queryOptions({
    queryKey: ["benchmark", "user"] as const,
    queryFn: () => getUserBenchmarkData(),
  });
