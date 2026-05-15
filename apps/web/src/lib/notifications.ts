import { formatAmount } from "./template";
import type { AlertEventType } from "@/functions/alerts";

export type { AlertEventType };

type AlertPayload = {
  userId: string;
  eventType: AlertEventType;
  customerName: string | null;
  customerEmail: string;
  amount: number;
  currency: string;
};

const LABELS: Record<AlertEventType, string> = {
  failure: "New failed payment",
  recovery: "Payment recovered",
  escalation: "Escalation triggered",
  emailSent: "Recovery email sent",
};

export function buildAlertMessage(
  eventType: AlertEventType,
  customerName: string | null,
  customerEmail: string,
  amount: number,
  currency: string,
): { label: string; subject: string; message: string } {
  const label = LABELS[eventType];
  const customer = customerName ?? customerEmail;
  const amountStr = formatAmount(amount, currency);

  return {
    label,
    subject: `Dunlo alert: ${label}`,
    message: `${label}: ${customer} — ${amountStr}`,
  };
}

export async function sendAlertNotification(payload: AlertPayload): Promise<void> {
  const [{ db }, { notificationSettings }, { user }, { eq }, { env }, { sendAuthEmail }] =
    await Promise.all([
      import("@dunlo-v2/db"),
      import("@dunlo-v2/db/schema/domain"),
      import("@dunlo-v2/db/schema/auth"),
      import("drizzle-orm"),
      import("@dunlo-v2/env/server"),
      import("@dunlo-v2/auth/email"),
    ]);

  const [settings] = await db
    .select()
    .from(notificationSettings)
    .where(eq(notificationSettings.userId, payload.userId))
    .limit(1);

  if (!settings) return;

  const { subject, message } = buildAlertMessage(
    payload.eventType,
    payload.customerName,
    payload.customerEmail,
    payload.amount,
    payload.currency,
  );

  type NotificationSettingsRow = typeof notificationSettings.$inferSelect;

  function emailToggleOn(s: NotificationSettingsRow, eventType: AlertEventType): boolean {
    const map: Record<AlertEventType, boolean> = {
      failure: s.emailOnFailure,
      recovery: s.emailOnRecovery,
      escalation: s.emailOnEscalation,
      emailSent: s.emailOnEmailSent,
    };
    return map[eventType];
  }

  function slackToggleOn(s: NotificationSettingsRow, eventType: AlertEventType): boolean {
    const map: Record<AlertEventType, boolean> = {
      failure: s.slackOnFailure,
      recovery: s.slackOnRecovery,
      escalation: s.slackOnEscalation,
      emailSent: s.slackOnEmailSent,
    };
    return map[eventType];
  }

  if (emailToggleOn(settings, payload.eventType)) {
    const [ownerRow] = await db
      .select({ email: user.email })
      .from(user)
      .where(eq(user.id, payload.userId))
      .limit(1);

    if (ownerRow?.email) {
      try {
        await sendAuthEmail({
          to: ownerRow.email,
          subject,
          html: `<p>${message}</p><p style="margin-top:16px"><a href="${env.APP_URL}/dashboard">View dashboard →</a></p>`,
        });
      } catch (e) {
        console.error("[notifications] email delivery failed", e);
      }
    }
  }

  if (slackToggleOn(settings, payload.eventType) && settings.slackWebhookUrl) {
    try {
      await fetch(settings.slackWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message }),
      });
    } catch (e) {
      console.error("[notifications] slack delivery failed", e);
    }
  }
}
