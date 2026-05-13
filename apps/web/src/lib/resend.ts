import { decrypt } from "@dunlo-v2/db/encrypt";
import { Resend } from "resend";

export type UserEmailProvider = {
  apiKey: string;
  fromEmail: string;
  fromName: string;
};

export function getResendClient(apiKey: string): Resend {
  return new Resend(apiKey);
}

export function getUserResend(provider: { apiKey: string }): Resend {
  const decrypted = decrypt(provider.apiKey);
  return new Resend(decrypted);
}

export async function sendUserEmail(args: {
  provider: UserEmailProvider;
  to: string;
  subject: string;
  html: string;
}): Promise<string> {
  const { provider, to, subject, html } = args;
  const resend = getUserResend(provider);
  const result = await resend.emails.send({
    from: `${provider.fromName} <${provider.fromEmail}>`,
    to,
    subject,
    html,
  });

  if (result.error) {
    throw new Error(result.error.message ?? "Resend send failed");
  }
  if (!result.data?.id) {
    throw new Error("Resend returned no email id");
  }
  return result.data.id;
}
