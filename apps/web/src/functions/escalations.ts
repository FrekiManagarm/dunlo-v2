import { db } from "@dunlo-v2/db";
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
import { ANTHROPIC_MODEL, getAnthropic } from "@/lib/anthropic";
import { formatAmount, humanizeFailureCode } from "@/lib/template";
import { wrapEmail } from "@/lib/email-wrapper";

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
      .innerJoin(
        failedPayment,
        eq(escalation.failedPaymentId, failedPayment.id),
      )
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
  .inputValidator((input) => updateDraftSchema.parse(input))
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
  .inputValidator((input) => sendSchema.parse(input))
  .handler(async ({ context, data }) => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    const [row] = await db
      .select()
      .from(escalation)
      .innerJoin(
        failedPayment,
        eq(escalation.failedPaymentId, failedPayment.id),
      )
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

    const { decrypt } = await import("@dunlo-v2/db/encrypt");
    const apiKey = decrypt(provider.apiKey);
    const resend = getResendClient(apiKey);

    await resend.emails.send({
      from: `${provider.fromName} <${provider.fromEmail}>`,
      to: row.failed_payment.customerEmail,
      subject: row.escalation.draftSubject,
      html: wrapEmail(`<p style="font-size:14px;line-height:1.65;color:#475569;margin:0;">${row.escalation.draftBody.replace(/\n/g, "<br />")}</p>`),
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
  .inputValidator((input) => dismissSchema.parse(input))
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
  .inputValidator((input) => updateSettingsSchema.parse(input))
  .handler(async ({ context, data }) => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    await db
      .update(stripeConnection)
      .set({
        escalationThreshold:
          data.threshold === null ? null : data.threshold * 100,
        escalationCurrency: data.currency,
        updatedAt: new Date(),
      })
      .where(eq(stripeConnection.userId, userId));

    return { ok: true };
  });

/**
 * Plain async draft generator — NOT a server function so it can be
 * fire-and-forget from the webhook (no client round-trip, no middleware).
 * Always resolves; failures fall back to a generic draft.
 */
export async function generateEscalationDraft(
  escalationId: string,
): Promise<void> {
  const [row] = await db
    .select()
    .from(escalation)
    .innerJoin(failedPayment, eq(escalation.failedPaymentId, failedPayment.id))
    .where(eq(escalation.id, escalationId))
    .limit(1);

  if (!row) return;

  const payment = row.failed_payment;
  const customerName = payment.customerName ?? "there";
  const productName = payment.description ?? "your subscription";
  const subject = `Quick question about your ${productName} payment`;

  const fallback = {
    subject,
    body: `Hi ${customerName}, I noticed your recent payment didn't go through — let me know if there's anything I can do to help.`,
  };

  try {
    const system =
      "You are writing a short, personal email from a SaaS founder to a customer whose payment failed. The email should feel human, not automated. 2-3 sentences max. No subject line needed.";

    const userPrompt =
      `Customer: ${customerName}. ` +
      `Monthly value: ${formatAmount(payment.amount, payment.currency)}. ` +
      `Product: ${productName}. ` +
      `Failure: ${humanizeFailureCode(payment.failureCode)}. ` +
      `Write the email body only.`;

    const response = await getAnthropic().messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 400,
      system,
      messages: [{ role: "user", content: userPrompt }],
    });

    const first = response.content[0];
    const body =
      first && first.type === "text" && first.text.trim().length > 0
        ? first.text.trim()
        : fallback.body;

    await db
      .update(escalation)
      .set({
        draftSubject: subject,
        draftBody: body,
        updatedAt: new Date(),
      })
      .where(eq(escalation.id, escalationId));
  } catch (e) {
    console.error("[escalations] AI draft generation failed:", e);
    await db
      .update(escalation)
      .set({
        draftSubject: fallback.subject,
        draftBody: fallback.body,
        updatedAt: new Date(),
      })
      .where(eq(escalation.id, escalationId));
  }
}

export const regenerateEscalationDraft = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((input) =>
    z.object({ escalationId: z.string().min(1) }).parse(input),
  )
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

    await generateEscalationDraft(data.escalationId);
    return { ok: true };
  });
