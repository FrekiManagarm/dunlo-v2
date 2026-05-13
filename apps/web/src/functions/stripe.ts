import { db } from "@dunlo-v2/db";
import { decrypt } from "@dunlo-v2/db/encrypt";
import {
  emailProvider,
  recoverySequence,
  sequenceStep,
  stripeConnection,
} from "@dunlo-v2/db/schema/domain";
import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";

import { authMiddleware } from "@/middleware/auth";

export type DecryptedStripeConnection = {
  id: string;
  userId: string;
  stripeAccountId: string;
  accessToken: string;
  publishableKey: string | null;
  webhookEndpointId: string | null;
  webhookSecret: string;
  scope: string | null;
  escalationThreshold: number | null;
  escalationCurrency: string;
};

export async function getStripeConnection(
  userId: string,
): Promise<DecryptedStripeConnection | null> {
  const [row] = await db
    .select()
    .from(stripeConnection)
    .where(eq(stripeConnection.userId, userId))
    .limit(1);

  if (!row) return null;

  return {
    id: row.id,
    userId: row.userId,
    stripeAccountId: row.stripeAccountId,
    accessToken: decrypt(row.accessToken),
    publishableKey: row.publishableKey,
    webhookEndpointId: row.webhookEndpointId,
    webhookSecret: decrypt(row.webhookSecret),
    scope: row.scope,
    escalationThreshold: row.escalationThreshold,
    escalationCurrency: row.escalationCurrency,
  };
}

export async function getStripeConnectionByAccountId(
  stripeAccountId: string,
): Promise<DecryptedStripeConnection | null> {
  const [row] = await db
    .select()
    .from(stripeConnection)
    .where(eq(stripeConnection.stripeAccountId, stripeAccountId))
    .limit(1);

  if (!row) return null;

  return {
    id: row.id,
    userId: row.userId,
    stripeAccountId: row.stripeAccountId,
    accessToken: decrypt(row.accessToken),
    publishableKey: row.publishableKey,
    webhookEndpointId: row.webhookEndpointId,
    webhookSecret: decrypt(row.webhookSecret),
    scope: row.scope,
    escalationThreshold: row.escalationThreshold,
    escalationCurrency: row.escalationCurrency,
  };
}

type DefaultSequence = {
  failureCode: string;
  name: string;
  steps: Array<{
    stepNumber: number;
    delayHours: number;
    subject: string;
    body: string;
  }>;
};

const DEFAULT_SEQUENCES: DefaultSequence[] = [
  {
    failureCode: "expired_card",
    name: "Card Expired",
    steps: [
      {
        stepNumber: 1,
        delayHours: 0,
        subject:
          "Your card has expired — update to keep {{product_name}}",
        body: `Hi {{customer_name}},\n\nWe tried to charge {{amount}} to your card ending in {{last_four}}, but it has expired.\n\nUpdate your card here to keep things running: {{update_payment_url}}\n\nThanks,\n{{sender_name}}`,
      },
      {
        stepNumber: 2,
        delayHours: 24,
        subject: "Reminder: update your payment to stay subscribed",
        body: `Hi {{customer_name}},\n\nQuick reminder — your card on file has expired and we still need to charge {{amount}}.\n\nIt only takes a minute to fix: {{update_payment_url}}\n\n{{sender_name}}`,
      },
      {
        stepNumber: 3,
        delayHours: 72,
        subject:
          "Final notice: your {{product_name}} subscription is at risk",
        body: `Hi {{customer_name}},\n\nThis is the last reminder before we pause your subscription. The {{amount}} charge is still failing because your card expired.\n\nUpdate now: {{update_payment_url}}\n\n{{sender_name}}`,
      },
    ],
  },
  {
    failureCode: "card_declined",
    name: "Card Declined",
    steps: [
      {
        stepNumber: 1,
        delayHours: 0,
        subject: "We couldn't process your payment",
        body: `Hi {{customer_name}},\n\nYour card ending in {{last_four}} was declined for {{amount}} ({{failure_reason}}).\n\nYou can update your payment method here: {{update_payment_url}}\n\n{{sender_name}}`,
      },
      {
        stepNumber: 2,
        delayHours: 48,
        subject: "Payment still failing — try a different card",
        body: `Hi {{customer_name}},\n\nWe retried the {{amount}} charge and it failed again.\n\nIf the first card isn't working, you can try another one here: {{update_payment_url}}\n\n{{sender_name}}`,
      },
    ],
  },
  {
    failureCode: "insufficient_funds",
    name: "Insufficient Funds",
    steps: [
      {
        stepNumber: 1,
        delayHours: 24,
        subject: "We'll retry your payment in 48 hours",
        body: `Hi {{customer_name}},\n\nYour {{amount}} payment couldn't go through due to insufficient funds. We'll retry automatically in 48 hours.\n\nNeed to use a different card? Update here: {{update_payment_url}}\n\n{{sender_name}}`,
      },
      {
        stepNumber: 2,
        delayHours: 72,
        subject: "Payment retry failed — please update your details",
        body: `Hi {{customer_name}},\n\nThe retry for {{amount}} failed again. Please update your payment method to avoid losing access: {{update_payment_url}}\n\n{{sender_name}}`,
      },
    ],
  },
  {
    failureCode: "do_not_honor",
    name: "Bank Declined",
    steps: [
      {
        stepNumber: 1,
        delayHours: 0,
        subject: "Your bank declined the payment",
        body: `Hi {{customer_name}},\n\nYour bank declined the {{amount}} charge on the card ending in {{last_four}}. This usually means contacting your bank or trying a different card.\n\nUpdate your payment method here: {{update_payment_url}}\n\n{{sender_name}}`,
      },
      {
        stepNumber: 2,
        delayHours: 48,
        subject: "Please contact your bank or use a different card",
        body: `Hi {{customer_name}},\n\nThe charge for {{amount}} is still being declined by your bank.\n\nTrying a different card usually solves this: {{update_payment_url}}\n\n{{sender_name}}`,
      },
    ],
  },
];

export const getOnboardingState = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    const [conn] = await db
      .select({ id: stripeConnection.id })
      .from(stripeConnection)
      .where(eq(stripeConnection.userId, userId))
      .limit(1);
    const [prov] = await db
      .select({ id: emailProvider.id })
      .from(emailProvider)
      .where(eq(emailProvider.userId, userId))
      .limit(1);
    return {
      stripeConnected: Boolean(conn),
      emailConfigured: Boolean(prov),
    };
  });

export async function seedDefaultSequences(userId: string): Promise<void> {
  for (const seq of DEFAULT_SEQUENCES) {
    const existing = await db
      .select({ id: recoverySequence.id })
      .from(recoverySequence)
      .where(
        and(
          eq(recoverySequence.userId, userId),
          eq(recoverySequence.failureCode, seq.failureCode),
        ),
      )
      .limit(1);

    if (existing.length > 0) continue;

    const sequenceId = crypto.randomUUID();
    await db.insert(recoverySequence).values({
      id: sequenceId,
      userId,
      failureCode: seq.failureCode,
      name: seq.name,
      isActive: true,
    });

    for (const step of seq.steps) {
      await db.insert(sequenceStep).values({
        id: crypto.randomUUID(),
        sequenceId,
        stepNumber: step.stepNumber,
        delayHours: step.delayHours,
        subject: step.subject,
        body: step.body,
      });
    }
  }
}
