import { db } from "@dunlo-v2/db";
import {
  escalation,
  failedPayment,
  recoveryAttempt,
  recoverySequence,
  sequenceStep,
  stripeConnection,
} from "@dunlo-v2/db/schema/domain";
import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq } from "drizzle-orm";

import { generateEscalationDraft } from "@/functions/escalations";
import { authMiddleware } from "@/middleware/auth";

const TEST_CUSTOMERS = [
  { name: "Sophie Marchand", email: "sophie.marchand@example.com" },
  { name: "Lucas Fontaine", email: "lucas.fontaine@example.com" },
  { name: "Emma Leclerc", email: "emma.leclerc@example.com" },
  { name: "Thomas Renard", email: "thomas.renard@example.com" },
];

const TEST_FAILURE_CODES = ["card_declined", "expired_card", "insufficient_funds", "do_not_honor"];

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

async function findSequence(userId: string, failureCode: string) {
  const [direct] = await db
    .select()
    .from(recoverySequence)
    .where(
      and(
        eq(recoverySequence.userId, userId),
        eq(recoverySequence.failureCode, failureCode),
        eq(recoverySequence.isActive, true),
      ),
    )
    .limit(1);
  if (direct) return direct;

  const [fallback] = await db
    .select()
    .from(recoverySequence)
    .where(
      and(
        eq(recoverySequence.userId, userId),
        eq(recoverySequence.failureCode, "card_declined"),
        eq(recoverySequence.isActive, true),
      ),
    )
    .limit(1);
  return fallback ?? null;
}

export const simulateFailedPayment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    const customer = pickRandom(TEST_CUSTOMERS);
    const failureCode = pickRandom(TEST_FAILURE_CODES);
    const amount = Math.floor(Math.random() * 4900) + 999; // 9.99–58.97

    const paymentId = crypto.randomUUID();
    await db.insert(failedPayment).values({
      id: paymentId,
      userId,
      stripePaymentIntentId: `pi_test_${crypto.randomUUID().replace(/-/g, "")}`,
      stripeCustomerId: `cus_test_${crypto.randomUUID().replace(/-/g, "").slice(0, 14)}`,
      amount,
      currency: "eur",
      failureCode,
      failureMessage: null,
      customerName: customer.name,
      customerEmail: customer.email,
      lastFour: String(Math.floor(1000 + Math.random() * 9000)),
      status: "in_recovery",
    });

    const sequence = await findSequence(userId, failureCode);
    if (sequence) {
      const steps = await db
        .select()
        .from(sequenceStep)
        .where(eq(sequenceStep.sequenceId, sequence.id));

      const now = Date.now();
      for (const step of steps.sort((a, b) => a.stepNumber - b.stepNumber)) {
        await db.insert(recoveryAttempt).values({
          id: crypto.randomUUID(),
          failedPaymentId: paymentId,
          sequenceStepId: step.id,
          status: "scheduled",
          scheduledAt: new Date(now + step.delayHours * 3600 * 1000),
        });
      }
    }

    return { paymentId, customerName: customer.name, amount, failureCode };
  });

export const simulateEscalation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    const [conn] = await db
      .select({ escalationThreshold: stripeConnection.escalationThreshold })
      .from(stripeConnection)
      .where(eq(stripeConnection.userId, userId))
      .limit(1);

    const threshold = conn?.escalationThreshold ?? 50000;
    const amount = threshold + Math.floor(Math.random() * 50000) + 10000;

    const customer = pickRandom(TEST_CUSTOMERS);

    const paymentId = crypto.randomUUID();
    await db.insert(failedPayment).values({
      id: paymentId,
      userId,
      stripePaymentIntentId: `pi_test_${crypto.randomUUID().replace(/-/g, "")}`,
      stripeCustomerId: `cus_test_${crypto.randomUUID().replace(/-/g, "").slice(0, 14)}`,
      amount,
      currency: "eur",
      failureCode: "card_declined",
      failureMessage: null,
      customerName: customer.name,
      customerEmail: customer.email,
      lastFour: String(Math.floor(1000 + Math.random() * 9000)),
      status: "escalated",
    });

    const escalationId = crypto.randomUUID();
    await db.insert(escalation).values({
      id: escalationId,
      failedPaymentId: paymentId,
      userId,
      status: "pending",
    });

    generateEscalationDraft(escalationId).catch((_e: unknown) => {
      console.error("[testing] escalation draft failed");
    });

    return { paymentId, escalationId, customerName: customer.name, amount };
  });

export const simulateRecovery = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    const [target] = await db
      .select({ id: failedPayment.id, customerName: failedPayment.customerName, amount: failedPayment.amount })
      .from(failedPayment)
      .where(and(eq(failedPayment.userId, userId), eq(failedPayment.status, "in_recovery")))
      .orderBy(desc(failedPayment.createdAt))
      .limit(1);

    if (!target) throw new Error("No in-recovery payment to resolve");

    await db
      .update(failedPayment)
      .set({ status: "recovered", recoveredAt: new Date() })
      .where(eq(failedPayment.id, target.id));

    await db
      .update(recoveryAttempt)
      .set({ status: "dismissed" })
      .where(
        and(
          eq(recoveryAttempt.failedPaymentId, target.id),
          eq(recoveryAttempt.status, "scheduled"),
        ),
      );

    return { paymentId: target.id, customerName: target.customerName, amount: target.amount };
  });
