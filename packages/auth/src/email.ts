import { env } from "@dunlo-v2/env/server";

const ACCENT = "#00e87b";

const LOGO_SVG = `<svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;">
  <rect width="32" height="32" rx="8.5" fill="${ACCENT}"/>
  <path d="M 16 25 A 9 9 0 1 0 7 16" stroke="white" stroke-width="2.5" stroke-linecap="round" fill="none"/>
  <path d="M 4.5 18.5 L 7 16 L 9.5 18.5" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`;

export async function sendAuthEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  await sendPlatformEmail({ to, subject, html });
}

async function parseJson(response: Response): Promise<Record<string, unknown>> {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function assertOk(response: Response, fallback: string): Promise<Record<string, unknown>> {
  const body = await parseJson(response);
  if (!response.ok) {
    const message =
      typeof body.message === "string"
        ? body.message
        : typeof body.error === "string"
          ? body.error
          : fallback;
    throw new Error(message);
  }
  return body;
}

async function sendPlatformEmail(args: {
  to: string;
  subject: string;
  html: string;
}) {
  const from = env.PLATFORM_EMAIL_FROM;

  try {
    switch (env.AUTH_EMAIL_PROVIDER) {
      case "postmark": {
        if (!env.POSTMARK_SERVER_TOKEN) throw new Error("POSTMARK_SERVER_TOKEN is required");
        const response = await fetch("https://api.postmarkapp.com/email", {
          method: "POST",
          headers: {
            "X-Postmark-Server-Token": env.POSTMARK_SERVER_TOKEN,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            From: from,
            To: args.to,
            Subject: args.subject,
            HtmlBody: args.html,
            MessageStream: "outbound",
          }),
        });
        await assertOk(response, "Postmark auth email failed");
        return;
      }
      case "mailgun": {
        if (!env.MAILGUN_API_KEY) throw new Error("MAILGUN_API_KEY is required");
        if (!env.MAILGUN_DOMAIN) throw new Error("MAILGUN_DOMAIN is required");
        const form = new FormData();
        form.set("from", from);
        form.set("to", args.to);
        form.set("subject", args.subject);
        form.set("html", args.html);
        const response = await fetch(`https://api.mailgun.net/v3/${env.MAILGUN_DOMAIN}/messages`, {
          method: "POST",
          headers: {
            Authorization: `Basic ${btoa(`api:${env.MAILGUN_API_KEY}`)}`,
          },
          body: form,
        });
        await assertOk(response, "Mailgun auth email failed");
        return;
      }
      case "sendgrid": {
        if (!env.SENDGRID_API_KEY) throw new Error("SENDGRID_API_KEY is required");
        const match = from.match(/^(.*)<([^>]+)>$/);
        const email = match?.[2]?.trim() ?? from;
        const name = match?.[1]?.trim() || "Dunlo";
        const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: args.to }] }],
            from: { email, name },
            subject: args.subject,
            content: [{ type: "text/html", value: args.html }],
          }),
        });
        if (!response.ok) throw new Error("SendGrid auth email failed");
        return;
      }
      case "resend":
      default: {
        if (!env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is required");
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from,
            to: args.to,
            subject: args.subject,
            html: args.html,
          }),
        });
        await assertOk(response, "Resend auth email failed");
      }
    }
  } catch (error) {
    console.error("[auth-email] delivery failed", error);
    throw error;
  }
}

function wrap(inner: string) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f7f8fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;border:1px solid #eef0f3;padding:32px;">
            <tr>
              <td>
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:24px;">
                  ${LOGO_SVG}
                  <span style="font-weight:700;font-size:15px;color:#0f172a;vertical-align:middle;margin-left:8px;">dunlo</span>
                </div>
                ${inner}
                <p style="margin-top:32px;font-size:12px;color:#94a3b8;">If you didn't request this email, you can safely ignore it.</p>
              </td>
            </tr>
          </table>
          <p style="margin-top:16px;font-size:11px;color:#94a3b8;">© ${new Date().getFullYear()} Dunlo</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function verificationEmailHtml({ url }: { url: string }) {
  return wrap(`
    <h1 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Verify your email</h1>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.55;color:#475569;">
      Tap the button below to verify your email and finish setting up your Dunlo account.
    </p>
    <a href="${url}" style="display:inline-block;background:${ACCENT};color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 20px;border-radius:9999px;">
      Verify email
    </a>
    <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;word-break:break-all;">
      Or paste this link into your browser:<br/>${url}
    </p>
  `);
}

export function passwordResetEmailHtml({ url }: { url: string }) {
  return wrap(`
    <h1 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Reset your password</h1>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.55;color:#475569;">
      We received a request to reset your Dunlo password. The link below expires in 1 hour.
    </p>
    <a href="${url}" style="display:inline-block;background:${ACCENT};color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 20px;border-radius:9999px;">
      Reset password
    </a>
    <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;word-break:break-all;">
      Or paste this link into your browser:<br/>${url}
    </p>
  `);
}
