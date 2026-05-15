import { decrypt } from "@dunlo-v2/db/encrypt";

export const EMAIL_PROVIDERS = ["resend", "postmark", "mailgun", "sendgrid"] as const;

export type EmailProviderType = (typeof EMAIL_PROVIDERS)[number];

export type UserEmailProvider = {
  provider: string;
  apiKey: string;
  domain: string | null;
  fromEmail: string;
  fromName: string;
};

export const EMAIL_PROVIDER_LABELS: Record<EmailProviderType, string> = {
  resend: "Resend",
  postmark: "Postmark",
  mailgun: "Mailgun",
  sendgrid: "SendGrid",
};

function normalizeProvider(provider: string): EmailProviderType {
  if ((EMAIL_PROVIDERS as readonly string[]).includes(provider)) {
    return provider as EmailProviderType;
  }
  return "resend";
}

function fromAddress(provider: Pick<UserEmailProvider, "fromEmail" | "fromName">): string {
  return `${provider.fromName} <${provider.fromEmail}>`;
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

async function sendWithResend(args: SendEmailArgs, apiKey: string): Promise<string> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress(args.provider),
      to: args.to,
      subject: args.subject,
      html: args.html,
    }),
  });
  const body = await assertOk(response, "Resend send failed");
  const id = body.id;
  if (typeof id !== "string") throw new Error("Resend returned no email id");
  return id;
}

async function sendWithPostmark(args: SendEmailArgs, apiKey: string): Promise<string> {
  const response = await fetch("https://api.postmarkapp.com/email", {
    method: "POST",
    headers: {
      "X-Postmark-Server-Token": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      From: fromAddress(args.provider),
      To: args.to,
      Subject: args.subject,
      HtmlBody: args.html,
      MessageStream: "outbound",
    }),
  });
  const body = await assertOk(response, "Postmark send failed");
  const id = body.MessageID;
  if (typeof id !== "string") throw new Error("Postmark returned no email id");
  return id;
}

async function sendWithMailgun(args: SendEmailArgs, apiKey: string): Promise<string> {
  const domain = args.provider.domain?.trim();
  if (!domain) throw new Error("Mailgun sending domain is required");

  const form = new FormData();
  form.set("from", fromAddress(args.provider));
  form.set("to", args.to);
  form.set("subject", args.subject);
  form.set("html", args.html);

  const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`api:${apiKey}`)}`,
    },
    body: form,
  });
  const body = await assertOk(response, "Mailgun send failed");
  const id = body.id;
  if (typeof id !== "string") throw new Error("Mailgun returned no email id");
  return id;
}

async function sendWithSendGrid(args: SendEmailArgs, apiKey: string): Promise<string> {
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: args.to }] }],
      from: { email: args.provider.fromEmail, name: args.provider.fromName },
      subject: args.subject,
      content: [{ type: "text/html", value: args.html }],
    }),
  });

  if (!response.ok) {
    const body = await parseJson(response);
    const errors = body.errors;
    const message =
      Array.isArray(errors) && typeof errors[0]?.message === "string"
        ? errors[0].message
        : "SendGrid send failed";
    throw new Error(message);
  }

  return response.headers.get("x-message-id") ?? crypto.randomUUID();
}

export type SendEmailArgs = {
  provider: UserEmailProvider;
  to: string;
  subject: string;
  html: string;
};

export async function sendUserEmail(args: SendEmailArgs): Promise<string> {
  const type = normalizeProvider(args.provider.provider);
  const apiKey = decrypt(args.provider.apiKey);

  switch (type) {
    case "postmark":
      return sendWithPostmark(args, apiKey);
    case "mailgun":
      return sendWithMailgun(args, apiKey);
    case "sendgrid":
      return sendWithSendGrid(args, apiKey);
    case "resend":
    default:
      return sendWithResend(args, apiKey);
  }
}
