import Stripe from "stripe";
import { and, eq } from "drizzle-orm";
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

type StoredWebhookStatus = "valid" | "missing" | "retryable";

export async function verifyStoredWebhook(
  retrieve: (
    id: string,
    options: { stripeAccount: string },
  ) => Promise<unknown>,
  webhookEndpointId: string,
  stripeAccountId: string,
): Promise<StoredWebhookStatus> {
  try {
    await retrieve(webhookEndpointId, { stripeAccount: stripeAccountId });
    return "valid";
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "statusCode" in error &&
      error.statusCode === 404
    ) {
      return "missing";
    }
    return "retryable";
  }
}

export async function reconcileWebhook(
  stripeAccountId: string,
  accessToken: string,
  lifecycle?: { connectionId: string; phase: "recovery_confirming" },
): Promise<{ webhookEndpointId: string; webhookSecret: string } | null> {
  const [existing] = await db
    .select({
      webhookEndpointId: stripeConnection.webhookEndpointId,
      webhookSecret: stripeConnection.webhookSecret,
    })
    .from(stripeConnection)
    .where(
      lifecycle
        ? and(
            eq(stripeConnection.id, lifecycle.connectionId),
            eq(stripeConnection.stripeAccountId, stripeAccountId),
            eq(stripeConnection.phase, lifecycle.phase),
          )
        : eq(stripeConnection.stripeAccountId, stripeAccountId),
    )
    .limit(1);
  if (existing?.webhookEndpointId && existing.webhookSecret) {
    if (existing.webhookEndpointId === "local_dev_webhook") {
      return {
        webhookEndpointId: existing.webhookEndpointId,
        webhookSecret: decrypt(existing.webhookSecret),
      };
    }
    const stripe = new Stripe(accessToken, {
      apiVersion: STRIPE_API_VERSION,
    });
    const status = await verifyStoredWebhook(
      stripe.webhookEndpoints.retrieve.bind(stripe.webhookEndpoints),
      existing.webhookEndpointId,
      stripeAccountId,
    );
    if (status === "valid") {
      return {
        webhookEndpointId: existing.webhookEndpointId,
        webhookSecret: decrypt(existing.webhookSecret),
      };
    }
    if (status === "retryable") {
      console.warn(
        "[stripe/reconcileWebhook] stored endpoint verification is retryable",
      );
      return null;
    }
    try {
      await db
        .update(stripeConnection)
        .set({ webhookEndpointId: null, webhookSecret: null })
        .where(eq(stripeConnection.stripeAccountId, stripeAccountId));
    } catch (error) {
      console.error(
        "[stripe/reconcileWebhook] failed to clear endpoint:",
        error,
      );
      return null;
    }
  }

  const baseUrl = env.APP_URL;
  const webhookUrl = `${baseUrl}/api/stripe/webhook/${stripeAccountId}`;

  const isLocalDev =
    baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");

  if (isLocalDev) {
    const persisted = await db
      .update(stripeConnection)
      .set({
        webhookEndpointId: "local_dev_webhook",
        webhookSecret: encrypt("whsec_local_dev_secret"),
      })
      .where(
        lifecycle
          ? and(
              eq(stripeConnection.id, lifecycle.connectionId),
              eq(stripeConnection.phase, lifecycle.phase),
            )
          : eq(stripeConnection.stripeAccountId, stripeAccountId),
      )
      .returning({ id: stripeConnection.id });
    if (!persisted[0]) return null;

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

    const persisted = await db
      .update(stripeConnection)
      .set({
        webhookEndpointId: webhook.id,
        webhookSecret: encrypt(webhook.secret!),
      })
      .where(
        lifecycle
          ? and(
              eq(stripeConnection.id, lifecycle.connectionId),
              eq(stripeConnection.phase, lifecycle.phase),
            )
          : eq(stripeConnection.stripeAccountId, stripeAccountId),
      )
      .returning({ id: stripeConnection.id });

    if (!persisted[0]) {
      try {
        await stripe.webhookEndpoints.del(
          webhook.id,
          {},
          { stripeAccount: stripeAccountId },
        );
      } catch (cleanupError) {
        console.error(
          "[stripe/reconcileWebhook] orphan cleanup failed:",
          cleanupError,
        );
      }
      return null;
    }

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
  const stripe = new Stripe(accessToken, { apiVersion: STRIPE_API_VERSION });
  await stripe.webhookEndpoints.del(
    webhookEndpointId,
    {},
    { stripeAccount: stripeAccountId },
  );
}
