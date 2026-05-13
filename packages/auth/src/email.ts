import { env } from "@dunlo-v2/env/server";
import { Resend } from "resend";

const resend = new Resend(env.RESEND_API_KEY);

const FROM = "Dunlo <noreply@dunlo.io>";
const ACCENT = "#00e87b";

export async function sendAuthEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
  });
  if (error) {
    console.error("[auth-email] resend error", error);
    throw new Error(error.message ?? "Failed to send auth email");
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
                  <span style="display:inline-block;width:24px;height:24px;border-radius:9999px;background:${ACCENT};color:#fff;font-weight:700;font-size:12px;text-align:center;line-height:24px;">D</span>
                  <span style="font-weight:700;font-size:14px;color:#0f172a;">dunlo</span>
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
