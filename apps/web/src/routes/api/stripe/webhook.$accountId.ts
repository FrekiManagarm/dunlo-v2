import { createFileRoute } from "@tanstack/react-router";
import type Stripe from "stripe";

import { getStripeConnectionByAccountId } from "@/functions/stripe";
import { getConnectedStripe } from "@/lib/stripe";
import { sendAlertNotification } from "@/lib/notifications";
import { env } from "@dunlo-v2/env/server";
import {
  processFailedPayment,
  processRecoveredPayment,
  processPaymentMethodUpdate,
} from "@/routes/api/stripe/webhook";

const FAILURE_EVENTS = new Set([
  "payment_intent.payment_failed",
  "invoice.payment_failed",
]);

const SUCCESS_EVENTS = new Set([
  "payment_intent.succeeded",
  "invoice.payment_succeeded",
]);

const PAYMENT_METHOD_EVENTS = new Set(["customer.updated"]);

export const Route = createFileRoute("/api/stripe/webhook/$accountId")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const { accountId } = params;
        const rawBody = await request.text();
        const sig = request.headers.get("stripe-signature");

        if (!sig) {
          return new Response("Missing stripe-signature header", {
            status: 400,
          });
        }

        const connection = await getStripeConnectionByAccountId(accountId);
        if (!connection) {
          return new Response("Unknown connected account", { status: 400 });
        }

        const webhookSecret =
          env.NODE_ENV === "development"
            ? env.STRIPE_WEBHOOK_SECRET
            : connection.webhookSecret;

        const stripe = getConnectedStripe(connection.accessToken);
        let event: Stripe.Event;
        try {
          event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
        } catch (err) {
          console.error(
            "[stripe/webhook/$accountId] signature verification failed",
            err,
          );
          return new Response("Invalid signature", { status: 400 });
        }

        if (event.account && event.account !== accountId) {
          console.error(
            `[stripe/webhook/$accountId] account mismatch: expected ${accountId}, got ${event.account}`,
          );
          return new Response("Account mismatch", { status: 400 });
        }

        try {
          if (FAILURE_EVENTS.has(event.type)) {
            const result = await processFailedPayment(event, connection);
            if (result) {
              await sendAlertNotification({
                userId: connection.userId,
                eventType: result.wasEscalated ? "escalation" : "failure",
                customerName: result.customerName,
                customerEmail: result.customerEmail,
                amount: result.amount,
                currency: result.currency,
              }).catch((e) =>
                console.error(
                  "[webhook/$accountId] alert notification failed",
                  e,
                ),
              );
            }
          } else if (SUCCESS_EVENTS.has(event.type)) {
            const result = await processRecoveredPayment(event, connection);
            if (result) {
              await sendAlertNotification({
                userId: connection.userId,
                eventType: "recovery",
                customerName: result.customerName,
                customerEmail: result.customerEmail,
                amount: result.amount,
                currency: result.currency,
              }).catch((e) =>
                console.error(
                  "[webhook/$accountId] alert notification failed",
                  e,
                ),
              );
            }
          } else if (PAYMENT_METHOD_EVENTS.has(event.type)) {
            await processPaymentMethodUpdate(event, connection);
          }
        } catch (err) {
          console.error(
            "[stripe/webhook/$accountId] handler error",
            event.type,
            event.id,
            err,
          );
          return new Response("Handler error", { status: 500 });
        }

        return Response.json({ received: true });
      },
    },
  },
});
