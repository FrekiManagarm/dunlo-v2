import { NextResponse } from "next/server";
import { z } from "zod";

const leadSchema = z.object({
  email: z.email(),
  mrr: z.number().min(0).max(1_000_000),
  mrrRange: z.string().min(1).max(40),
  failedPaymentRate: z.number().min(0).max(100),
  failedMrr: z.number().min(0).max(1_000_000),
  recoverableMrr: z.number().min(0).max(1_000_000),
});

function platformRecipient() {
  const from = process.env.PLATFORM_EMAIL_FROM ?? "Dunlo <hello@dunlo.io>";
  const match = from.match(/<([^>]+)>/);
  return match?.[1]?.trim() || "hello@dunlo.io";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendLeadNotification(lead: z.infer<typeof leadSchema>) {
  const provider = process.env.AUTH_EMAIL_PROVIDER ?? "resend";
  const from = process.env.PLATFORM_EMAIL_FROM ?? "Dunlo <noreply@dunlo.io>";
  const to = platformRecipient();
  const subject = `Benchmark report request: ${lead.email}`;
  const html = `
    <h1>New benchmark lead</h1>
    <p><strong>Email:</strong> ${escapeHtml(lead.email)}</p>
    <p><strong>MRR:</strong> $${lead.mrr.toLocaleString("en-US")}</p>
    <p><strong>MRR range:</strong> ${escapeHtml(lead.mrrRange)}</p>
    <p><strong>Estimated failed payment rate:</strong> ${lead.failedPaymentRate.toFixed(1)}%</p>
    <p><strong>Estimated failed MRR:</strong> $${lead.failedMrr.toLocaleString("en-US")}/mo</p>
    <p><strong>Estimated recoverable MRR:</strong> $${lead.recoverableMrr.toLocaleString("en-US")}/mo</p>
  `;

  if (provider === "postmark" && process.env.POSTMARK_SERVER_TOKEN) {
    await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        "X-Postmark-Server-Token": process.env.POSTMARK_SERVER_TOKEN,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        From: from,
        To: to,
        Subject: subject,
        HtmlBody: html,
        MessageStream: "outbound",
      }),
    });
    return;
  }

  if (provider === "sendgrid" && process.env.SENDGRID_API_KEY) {
    const match = from.match(/^(.*)<([^>]+)>$/);
    const email = match?.[2]?.trim() ?? from;
    const name = match?.[1]?.trim() || "Dunlo";
    await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email, name },
        subject,
        content: [{ type: "text/html", value: html }],
      }),
    });
    return;
  }

  if (process.env.RESEND_API_KEY) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    return;
  }

  console.info("[benchmark-lead]", lead);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = leadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    await sendLeadNotification(parsed.data);
  } catch (error) {
    console.error("[benchmark-lead] notification failed", error);
  }

  return NextResponse.json({ ok: true });
}
