import { db } from "@dunlo-v2/db";
import { decrypt } from "@dunlo-v2/db/encrypt";
import {
  emailProvider,
  escalation,
  failedPayment,
  stripeConnection,
} from "@dunlo-v2/db/schema/domain";
import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { authMiddleware } from "@/middleware/auth";
import { getResendClient } from "@/lib/resend";

export type EscalationRow = {
  id: string;
  status: "pending" | "sent" | "dismissed";
  draftSubject: string | null;
  draftBody: string | null;
  createdAt: Date;
  payment: {
    id: string;
    customerName: string | null;
    customerEmail: string;
    amount: number;
    currency: string;
    failureCode: string;
    description: string | null;
  };
};

export const getEscalations = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<EscalationRow[]> => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    const rows = await db
      .select()
      .from(escalation)
      .innerJoin(failedPayment, eq(escalation.failedPaymentId, failedPayment.id))
      .where(
        and(
          eq(escalation.userId, userId),
          inArray(escalation.status, ["pending", "sent"]),
        ),
      )
      .orderBy(desc(escalation.createdAt));

    return rows.map((row) => ({
      id: row.escalation.id,
      status: row.escalation.status as EscalationRow["status"],
      draftSubject: row.escalation.draftSubject,
      draftBody: row.escalation.draftBody,
      createdAt: row.escalation.createdAt,
      payment: {
        id: row.failed_payment.id,
        customerName: row.failed_payment.customerName,
        customerEmail: row.failed_payment.customerEmail,
        amount: row.failed_payment.amount,
        currency: row.failed_payment.currency,
        failureCode: row.failed_payment.failureCode,
        description: row.failed_payment.description,
      },
    }));
  });

const updateDraftSchema = z.object({
  escalationId: z.string().min(1),
  subject: z.string().min(1).max(500),
  body: z.string().min(1).max(10000),
});

export const updateEscalationDraft = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => updateDraftSchema.parse(input))
  .handler(async ({ context, data }) => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    const [owned] = await db
      .select({ id: escalation.id })
      .from(escalation)
      .where(
        and(
          eq(escalation.id, data.escalationId),
          eq(escalation.userId, userId),
        ),
      )
      .limit(1);

    if (!owned) throw new Error("Escalation not found");

    await db
      .update(escalation)
      .set({
        draftSubject: data.subject,
        draftBody: data.body,
        updatedAt: new Date(),
      })
      .where(eq(escalation.id, data.escalationId));

    return { ok: true };
  });

const sendSchema = z.object({ escalationId: z.string().min(1) });

export const sendEscalationEmail = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => sendSchema.parse(input))
  .handler(async ({ context, data }) => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    const [row] = await db
      .select()
      .from(escalation)
      .innerJoin(failedPayment, eq(escalation.failedPaymentId, failedPayment.id))
      .where(
        and(
          eq(escalation.id, data.escalationId),
          eq(escalation.userId, userId),
        ),
      )
      .limit(1);

    if (!row) throw new Error("Escalation not found");
    if (!row.escalation.draftSubject || !row.escalation.draftBody) {
      throw new Error("Draft not ready yet");
    }

    const [provider] = await db
      .select()
      .from(emailProvider)
      .where(eq(emailProvider.userId, userId))
      .limit(1);

    if (!provider) throw new Error("Configure your email provider first");

    const apiKey = decrypt(provider.apiKey);
    const resend = getResendClient(apiKey);

    await resend.emails.send({
      from: `${provider.fromName} <${provider.fromEmail}>`,
      to: row.failed_payment.customerEmail,
      subject: row.escalation.draftSubject,
      html: row.escalation.draftBody.replace(/\n/g, "<br />"),
    });

    await db
      .update(escalation)
      .set({ status: "sent", updatedAt: new Date() })
      .where(eq(escalation.id, data.escalationId));

    return { ok: true };
  });

const dismissSchema = z.object({ escalationId: z.string().min(1) });

export const dismissEscalation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => dismissSchema.parse(input))
  .handler(async ({ context, data }) => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    const [owned] = await db
      .select({ id: escalation.id })
      .from(escalation)
      .where(
        and(
          eq(escalation.id, data.escalationId),
          eq(escalation.userId, userId),
        ),
      )
      .limit(1);

    if (!owned) throw new Error("Escalation not found");

    await db
      .update(escalation)
      .set({ status: "dismissed", updatedAt: new Date() })
      .where(eq(escalation.id, data.escalationId));

    return { ok: true };
  });

export type EscalationSettings = {
  thresholdMajor: number | null;
  currency: string;
  hasConnection: boolean;
};

export const getEscalationSettings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<EscalationSettings> => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    const [row] = await db
      .select()
      .from(stripeConnection)
      .where(eq(stripeConnection.userId, userId))
      .limit(1);

    if (!row) {
      return { thresholdMajor: null, currency: "eur", hasConnection: false };
    }

    return {
      thresholdMajor:
        row.escalationThreshold !== null
          ? Math.round(row.escalationThreshold / 100)
          : null,
      currency: row.escalationCurrency ?? "eur",
      hasConnection: true,
    };
  });

const updateSettingsSchema = z.object({
  threshold: z.number().int().min(0).max(1_000_000).nullable(),
  currency: z.enum(["eur", "usd", "gbp"]),
});

export const updateEscalationSettings = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => updateSettingsSchema.parse(input))
  .handler(async ({ context, data }) => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    await db
      .update(stripeConnection)
      .set({
        escalationThreshold: data.threshold === null ? null : data.threshold * 100,
        escalationCurrency: data.currency,
        updatedAt: new Date(),
      })
      .where(eq(stripeConnection.userId, userId));

    return { ok: true };
  });

