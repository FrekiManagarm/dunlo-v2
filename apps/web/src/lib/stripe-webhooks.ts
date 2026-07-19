import Stripe from "stripe";
import { eq, sql } from "drizzle-orm";
import { db } from "@dunlo-v2/db";
import { stripeConnection } from "@dunlo-v2/db/schema/domain";
import { decrypt, encrypt } from "@dunlo-v2/db/encrypt";
import { env } from "@dunlo-v2/env/server";

const STRIPE_API_VERSION = "2024-12-18.acacia" as Stripe.LatestApiVersion;

const WEBHOOK_EVENTS: Stripe.WebhookEndpointCreateParams.EnabledEvent[] = [
  "payment_intent.payment_failed",
  "payment_intent.succeeded",
  "invoice.payment_failed",
  "invoice.payment_succeeded",
  "customer.updated",
];

export async function reconcileWebhook(
  stripeAccountId: string,
  accessToken: string,
): Promise<{ webhookEndpointId: string; webhookSecret: string } | null> {
  return db.transaction(async (tx) => {
    await tx.execute(
      sql`SELECT pg_advisory_xact_lock(hashtext(${stripeAccountId}))`,
    );
    const [existing] = await tx
      .select({
        webhookEndpointId: stripeConnection.webhookEndpointId,
        webhookSecret: stripeConnection.webhookSecret,
      })
      .from(stripeConnection)
      .where(eq(stripeConnection.stripeAccountId, stripeAccountId))
      .limit(1);
    if (existing?.webhookEndpointId && existing.webhookSecret) {
      return {
        webhookEndpointId: existing.webhookEndpointId,
        webhookSecret: decrypt(existing.webhookSecret),
      };
    }

    const baseUrl = env.APP_URL;
    const webhookUrl = `${baseUrl}/api/stripe/webhook/${stripeAccountId}`;

    const isLocalDev =
      baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");

    if (isLocalDev) {
      await tx
        .update(stripeConnection)
        .set({
          webhookEndpointId: "local_dev_webhook",
          webhookSecret: encrypt("whsec_local_dev_secret"),
        })
        .where(eq(stripeConnection.stripeAccountId, stripeAccountId));

      return {
        webhookEndpointId: "local_dev_webhook",
        webhookSecret: "whsec_local_dev_secret",
      };
    }

    try {
      const stripe = new Stripe(accessToken, {
        apiVersion: STRIPE_API_VERSION,
      });

      const webhook = await stripe.webhookEndpoints.create(
        {
          url: webhookUrl,
          connect: true,
          enabled_events: WEBHOOK_EVENTS,
          description: `Dunlo Payment Recovery - ${stripeAccountId}`,
          metadata: { stripeAccountId },
        },
        { stripeAccount: stripeAccountId },
      );

      await tx
        .update(stripeConnection)
        .set({
          webhookEndpointId: webhook.id,
          webhookSecret: encrypt(webhook.secret!),
        })
        .where(eq(stripeConnection.stripeAccountId, stripeAccountId));

      return { webhookEndpointId: webhook.id, webhookSecret: webhook.secret! };
    } catch (err) {
      console.error("[stripe/reconcileWebhook] failed:", err);
      return null;
    }
  });
}

export async function deleteWebhooks(
  webhookEndpointId: string,
  accessToken: string,
  stripeAccountId: string,
): Promise<void> {
  try {
    const stripe = new Stripe(accessToken, { apiVersion: STRIPE_API_VERSION });
    await stripe.webhookEndpoints.del(
      webhookEndpointId,
      {},
      { stripeAccount: stripeAccountId },
    );
  } catch (err) {
    console.error("[stripe/deleteWebhooks] failed:", err);
  }
}
