import { db } from "@dunlo-v2/db";
import {
  escalation,
  failedPayment,
  notificationSettings,
  recoveryAttempt,
} from "@dunlo-v2/db/schema/domain";
import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { authMiddleware } from "@/middleware/auth";

export type AlertEventType = "failure" | "recovery" | "escalation" | "emailSent";

export type FeedEvent = {
  id: string;
  type: AlertEventType;
  label: string;
  customerName: string | null;
  customerEmail: string;
  amount: number;
  currency: string;
  timestamp: Date;
};

export type NotificationSettings = {
  id: string;
  userId: string;
  emailOnFailure: boolean;
  emailOnRecovery: boolean;
  emailOnEscalation: boolean;
  emailOnEmailSent: boolean;
  slackOnFailure: boolean;
  slackOnRecovery: boolean;
  slackOnEscalation: boolean;
  slackOnEmailSent: boolean;
  slackWebhookUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export const getAlertFeed = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<FeedEvent[]> => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    const [failures, escalations, sentAttempts] = await Promise.all([
      db
        .select()
        .from(failedPayment)
        .where(eq(failedPayment.userId, userId))
        .orderBy(desc(failedPayment.createdAt)),
      db
        .select()
        .from(escalation)
        .innerJoin(failedPayment, eq(escalation.failedPaymentId, failedPayment.id))
        .where(eq(escalation.userId, userId))
        .orderBy(desc(escalation.createdAt)),
      db
        .select({ attempt: recoveryAttempt, payment: failedPayment })
        .from(recoveryAttempt)
        .innerJoin(
          failedPayment,
          eq(recoveryAttempt.failedPaymentId, failedPayment.id),
        )
        .where(
          and(
            eq(failedPayment.userId, userId),
            eq(recoveryAttempt.status, "sent"),
          ),
        )
        .orderBy(desc(recoveryAttempt.sentAt)),
    ]);

    const events: FeedEvent[] = [];

    for (const p of failures) {
      events.push({
        id: `failure-${p.id}`,
        type: "failure",
        label: "New failed payment",
        customerName: p.customerName,
        customerEmail: p.customerEmail,
        amount: p.amount,
        currency: p.currency,
        timestamp: p.createdAt,
      });
    }

    for (const p of failures) {
      if (p.status === "recovered" && p.recoveredAt) {
        events.push({
          id: `recovery-${p.id}`,
          type: "recovery",
          label: "Payment recovered",
          customerName: p.customerName,
          customerEmail: p.customerEmail,
          amount: p.amount,
          currency: p.currency,
          timestamp: p.recoveredAt,
        });
      }
    }

    for (const row of escalations) {
      events.push({
        id: `escalation-${row.escalation.id}`,
        type: "escalation",
        label: "Escalation triggered",
        customerName: row.failed_payment.customerName,
        customerEmail: row.failed_payment.customerEmail,
        amount: row.failed_payment.amount,
        currency: row.failed_payment.currency,
        timestamp: row.escalation.createdAt,
      });
    }

    for (const { attempt, payment } of sentAttempts) {
      if (attempt.sentAt) {
        events.push({
          id: `emailSent-${attempt.id}`,
          type: "emailSent",
          label: "Recovery email sent",
          customerName: payment.customerName,
          customerEmail: payment.customerEmail,
          amount: payment.amount,
          currency: payment.currency,
          timestamp: attempt.sentAt,
        });
      }
    }

    return events
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 50);
  });

export const getNotificationSettings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<NotificationSettings> => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    const [existing] = await db
      .select()
      .from(notificationSettings)
      .where(eq(notificationSettings.userId, userId))
      .limit(1);

    if (existing) return existing as NotificationSettings;

    const [created] = await db
      .insert(notificationSettings)
      .values({ id: crypto.randomUUID(), userId })
      .returning();

    return created as NotificationSettings;
  });

const settingsSchema = z.object({
  emailOnFailure: z.boolean(),
  emailOnRecovery: z.boolean(),
  emailOnEscalation: z.boolean(),
  emailOnEmailSent: z.boolean(),
  slackOnFailure: z.boolean(),
  slackOnRecovery: z.boolean(),
  slackOnEscalation: z.boolean(),
  slackOnEmailSent: z.boolean(),
  slackWebhookUrl: z
    .string()
    .url()
    .nullable()
    .or(z.literal(""))
    .transform((v) => v || null),
});

export const updateNotificationSettings = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((input) => settingsSchema.parse(input))
  .handler(async ({ context, data }) => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    await db
      .insert(notificationSettings)
      .values({ id: crypto.randomUUID(), userId, ...data })
      .onConflictDoUpdate({
        target: notificationSettings.userId,
        set: { ...data, updatedAt: new Date() },
      });

    return { ok: true };
  });
