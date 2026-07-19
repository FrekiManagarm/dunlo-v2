import { db } from "@dunlo-v2/db";
import {
  recoverySequence,
  sequenceStep,
  stripeConnection,
} from "@dunlo-v2/db/schema/domain";
import { createServerFn } from "@tanstack/react-start";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";

import { authMiddleware } from "@/middleware/auth";
import { seedDefaultSequences } from "@/functions/stripe";

export type SequenceWithSteps = {
  id: string;
  failureCode: string;
  name: string;
  isActive: boolean;
  steps: Array<{
    id: string;
    stepNumber: number;
    delayHours: number;
    subject: string;
    body: string;
  }>;
};

export const getSequences = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<SequenceWithSteps[]> => {
    if (!context.session?.user) {
      throw new Error("Unauthorized");
    }
    const userId = context.session.user.id;

    const sequences = await db
      .select()
      .from(recoverySequence)
      .where(eq(recoverySequence.userId, userId))
      .orderBy(asc(recoverySequence.failureCode));

    if (sequences.length === 0) return [];

    const steps = await db
      .select()
      .from(sequenceStep)
      .innerJoin(
        recoverySequence,
        eq(sequenceStep.sequenceId, recoverySequence.id),
      )
      .where(eq(recoverySequence.userId, userId))
      .orderBy(asc(sequenceStep.stepNumber));

    return sequences.map((seq) => ({
      id: seq.id,
      failureCode: seq.failureCode,
      name: seq.name,
      isActive: seq.isActive,
      steps: steps
        .filter((row) => row.sequence_step.sequenceId === seq.id)
        .map((row) => ({
          id: row.sequence_step.id,
          stepNumber: row.sequence_step.stepNumber,
          delayHours: row.sequence_step.delayHours,
          subject: row.sequence_step.subject,
          body: row.sequence_step.body,
        })),
    }));
  });

const updateStepSchema = z.object({
  stepId: z.string().min(1),
  subject: z.string().min(1).max(500).optional(),
  body: z.string().min(1).max(10000).optional(),
  delayHours: z
    .number()
    .int()
    .min(0)
    .max(24 * 30)
    .optional(),
});

export const updateSequenceStep = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((input) => updateStepSchema.parse(input))
  .handler(async ({ context, data }) => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    const [owned] = await db
      .select({ id: sequenceStep.id })
      .from(sequenceStep)
      .innerJoin(
        recoverySequence,
        eq(sequenceStep.sequenceId, recoverySequence.id),
      )
      .where(
        and(
          eq(sequenceStep.id, data.stepId),
          eq(recoverySequence.userId, userId),
        ),
      )
      .limit(1);

    if (!owned) throw new Error("Step not found");

    const patch: Record<string, unknown> = { updatedAt: new Date() };
    if (data.subject !== undefined) patch.subject = data.subject;
    if (data.body !== undefined) patch.body = data.body;
    if (data.delayHours !== undefined) patch.delayHours = data.delayHours;

    await db
      .update(sequenceStep)
      .set(patch)
      .where(eq(sequenceStep.id, data.stepId));

    return { ok: true };
  });

const toggleSchema = z.object({
  sequenceId: z.string().min(1),
  isActive: z.boolean(),
});

export const toggleSequence = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((input) => toggleSchema.parse(input))
  .handler(async ({ context, data }) => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    const [owned] = await db
      .select({ id: recoverySequence.id })
      .from(recoverySequence)
      .where(
        and(
          eq(recoverySequence.id, data.sequenceId),
          eq(recoverySequence.userId, userId),
        ),
      )
      .limit(1);

    if (!owned) throw new Error("Sequence not found");
    if (data.isActive) {
      const [connection] = await db
        .select({ id: stripeConnection.id })
        .from(stripeConnection)
        .where(
          and(
            eq(stripeConnection.userId, userId),
            eq(stripeConnection.phase, "recovery_active"),
          ),
        )
        .limit(1);
      if (!connection)
        throw new Error("Confirm recovery before activating sequences");
    }

    await db
      .update(recoverySequence)
      .set({ isActive: data.isActive, updatedAt: new Date() })
      .where(eq(recoverySequence.id, data.sequenceId));

    return { ok: true };
  });

const addStepSchema = z.object({
  sequenceId: z.string().min(1),
  stepNumber: z.number().int().min(1).max(20),
  subject: z.string().min(1).max(500),
  body: z.string().min(1).max(10000),
  delayHours: z
    .number()
    .int()
    .min(0)
    .max(24 * 30),
});

export const addSequenceStep = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((input) => addStepSchema.parse(input))
  .handler(async ({ context, data }) => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    const [owned] = await db
      .select({ id: recoverySequence.id })
      .from(recoverySequence)
      .where(
        and(
          eq(recoverySequence.id, data.sequenceId),
          eq(recoverySequence.userId, userId),
        ),
      )
      .limit(1);

    if (!owned) throw new Error("Sequence not found");

    const id = crypto.randomUUID();
    await db.insert(sequenceStep).values({
      id,
      sequenceId: data.sequenceId,
      stepNumber: data.stepNumber,
      subject: data.subject,
      body: data.body,
      delayHours: data.delayHours,
    });

    return { id };
  });

const deleteStepSchema = z.object({ stepId: z.string().min(1) });

export const deleteSequenceStep = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((input) => deleteStepSchema.parse(input))
  .handler(async ({ context, data }) => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    const [owned] = await db
      .select({ id: sequenceStep.id })
      .from(sequenceStep)
      .innerJoin(
        recoverySequence,
        eq(sequenceStep.sequenceId, recoverySequence.id),
      )
      .where(
        and(
          eq(sequenceStep.id, data.stepId),
          eq(recoverySequence.userId, userId),
        ),
      )
      .limit(1);

    if (!owned) throw new Error("Step not found");

    await db.delete(sequenceStep).where(eq(sequenceStep.id, data.stepId));

    return { ok: true };
  });

export const resetSequencesToDefault = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    const [connection] = await db
      .select({ phase: stripeConnection.phase })
      .from(stripeConnection)
      .where(
        and(
          eq(stripeConnection.userId, userId),
          eq(stripeConnection.phase, "recovery_active"),
        ),
      )
      .limit(1);
    if (connection) {
      throw new Error(
        "Resetting active recovery sequences requires a new confirmation",
      );
    }

    await db
      .delete(recoverySequence)
      .where(eq(recoverySequence.userId, userId));

    await seedDefaultSequences(userId, { isActive: false });

    return { ok: true };
  });
