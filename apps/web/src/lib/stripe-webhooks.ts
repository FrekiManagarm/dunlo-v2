import Stripe from "stripe";
import { eq } from "drizzle-orm";
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
  const [existing] = await db
    .select({
      webhookEndpointId: stripeConnection.webhookEndpointId,
      webhookSecret: stripeConnection.webhookSecret,
    })
    .from(stripeConnection)
    .where(eq(stripeConnection.stripeAccountId, stripeAccountId))
    .limit(1);
  if (existing?.webhookEndpointId && existing.webhookSecret) {
    if (existing.webhookEndpointId === "local_dev_webhook") {
      return {
        webhookEndpointId: existing.webhookEndpointId,
        webhookSecret: decrypt(existing.webhookSecret),
      };
    }
    try {
      const stripe = new Stripe(accessToken, {
        apiVersion: STRIPE_API_VERSION,
      });
      await stripe.webhookEndpoints.retrieve(existing.webhookEndpointId, {
        stripeAccount: stripeAccountId,
      });
      return {
        webhookEndpointId: existing.webhookEndpointId,
        webhookSecret: decrypt(existing.webhookSecret),
      };
    } catch {
      await db
        .update(stripeConnection)
        .set({ webhookEndpointId: null, webhookSecret: null })
        .where(eq(stripeConnection.stripeAccountId, stripeAccountId));
    }
  }

  const baseUrl = env.APP_URL;
  const webhookUrl = `${baseUrl}/api/stripe/webhook/${stripeAccountId}`;

  const isLocalDev =
    baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");

  if (isLocalDev) {
    await db
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

    const remoteEndpoints = await stripe.webhookEndpoints.list(
      { limit: 100 },
      { stripeAccount: stripeAccountId },
    );
    if (
      remoteEndpoints.data.some(
        (endpoint) => endpoint.metadata?.stripeAccountId === stripeAccountId,
      )
    ) {
      console.error(
        "[stripe/reconcileWebhook] existing remote endpoint is missing local credentials",
      );
      return null;
    }

    const webhook = await stripe.webhookEndpoints.create(
      {
        url: webhookUrl,
        connect: true,
        enabled_events: WEBHOOK_EVENTS,
        description: `Dunlo Payment Recovery - ${stripeAccountId}`,
        metadata: { stripeAccountId },
      },
      {
        stripeAccount: stripeAccountId,
        idempotencyKey: `dunlo-webhook-${stripeAccountId}`,
      },
    );

    await db
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
