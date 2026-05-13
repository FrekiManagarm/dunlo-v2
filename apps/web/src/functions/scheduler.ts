import { db } from "@dunlo-v2/db";
import { decrypt } from "@dunlo-v2/db/encrypt";
import {
  emailProvider,
  failedPayment,
  recoveryAttempt,
  sequenceStep,
  stripeConnection,
} from "@dunlo-v2/db/schema/domain";
import { env } from "@dunlo-v2/env/server";
import { and, eq, lte } from "drizzle-orm";
import { marked } from "marked";
import { getConnectedStripe } from "@/lib/stripe";
import {
  formatAmount,
  humanizeFailureCode,
  renderTemplate,
} from "@/lib/template";
import { sendUserEmail } from "@/lib/resend";

type SchedulerResult = {
  processed: number;
  sent: number;
  failed: number;
};

const BATCH_SIZE = 50;

function markdownToHtml(md: string): string {
  try {
    return marked.parse(md, { async: false }) as string;
  } catch {
    return md
      .split(/\n{2,}/)
      .map((block) => {
        const withBold = block.replace(
          /\*\*([^*]+)\*\*/g,
          "<strong>$1</strong>",
        );
        return `<p>${withBold.replace(/\n/g, "<br/>")}</p>`;
      })
      .join("\n");
  }
}

export async function processScheduledEmails(): Promise<SchedulerResult> {
  const now = new Date();

  const rows = await db
    .select({
      attempt: recoveryAttempt,
      step: sequenceStep,
      payment: failedPayment,
    })
    .from(recoveryAttempt)
    .innerJoin(sequenceStep, eq(sequenceStep.id, recoveryAttempt.sequenceStepId))
    .innerJoin(
      failedPayment,
      eq(failedPayment.id, recoveryAttempt.failedPaymentId),
    )
    .where(
      and(
        eq(recoveryAttempt.status, "scheduled"),
        lte(recoveryAttempt.scheduledAt, now),
      ),
    )
    .limit(BATCH_SIZE);

  let processed = 0;
  let sent = 0;
  let failed = 0;

  for (const { attempt, step, payment } of rows) {
    processed += 1;

    if (payment.status === "recovered" || payment.status === "dismissed") {
      await db
        .update(recoveryAttempt)
        .set({ status: "failed", errorMessage: "payment_no_longer_active" })
        .where(eq(recoveryAttempt.id, attempt.id));
      continue;
    }

    const [provider] = await db
      .select()
      .from(emailProvider)
      .where(eq(emailProvider.userId, payment.userId))
      .limit(1);

    if (!provider) {
      await db
        .update(recoveryAttempt)
        .set({
          status: "failed",
          errorMessage: "no_email_provider_configured",
        })
        .where(eq(recoveryAttempt.id, attempt.id));
      failed += 1;
      continue;
    }

    const [connection] = await db
      .select()
      .from(stripeConnection)
      .where(eq(stripeConnection.userId, payment.userId))
      .limit(1);

    if (!connection) {
      await db
        .update(recoveryAttempt)
        .set({
          status: "failed",
          errorMessage: "no_stripe_connection",
        })
        .where(eq(recoveryAttempt.id, attempt.id));
      failed += 1;
      continue;
    }

    let updatePaymentUrl = "";
    try {
      const stripe = getConnectedStripe(decrypt(connection.accessToken));
      const portal = await stripe.billingPortal.sessions.create({
        customer: payment.stripeCustomerId,
        return_url: env.APP_URL,
      });
      updatePaymentUrl = portal.url;
    } catch (err) {
      console.warn(
        "[scheduler] billing portal unavailable for payment",
        payment.id,
        err instanceof Error ? err.message : err,
      );
      updatePaymentUrl = "";
    }

    const vars: Record<string, string | undefined> = {
      customer_name: payment.customerName ?? "there",
      amount: formatAmount(payment.amount, payment.currency),
      currency: (payment.currency ?? "eur").toUpperCase(),
      last_four: payment.lastFour ?? "",
      failure_reason: humanizeFailureCode(payment.failureCode ?? ""),
      product_name: payment.description ?? "your subscription",
      sender_name: provider.fromName,
      update_payment_url: updatePaymentUrl,
    };

    const subject = renderTemplate(step.subject, vars);
    const renderedBody = renderTemplate(step.body, vars);
    const html = markdownToHtml(renderedBody);

    try {
      const resendId = await sendUserEmail({
        provider: {
          apiKey: provider.apiKey,
          fromEmail: provider.fromEmail,
          fromName: provider.fromName,
        },
        to: payment.customerEmail,
        subject,
        html,
      });

      await db
        .update(recoveryAttempt)
        .set({
          status: "sent",
          sentAt: new Date(),
          resendEmailId: resendId,
        })
        .where(eq(recoveryAttempt.id, attempt.id));

      sent += 1;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await db
        .update(recoveryAttempt)
        .set({
          status: "failed",
          errorMessage: message.slice(0, 500),
        })
        .where(eq(recoveryAttempt.id, attempt.id));
      failed += 1;
    }
  }

  return { processed, sent, failed };
}
