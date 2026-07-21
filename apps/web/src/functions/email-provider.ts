import { db } from "@dunlo-v2/db";
import { emailProvider, stripeConnection } from "@dunlo-v2/db/schema/domain";
import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { authMiddleware } from "@/middleware/auth";
import {
  EMAIL_PROVIDERS,
  sendUserEmail,
  type EmailProviderType,
} from "@/lib/email-providers";
import { wrapEmail } from "@/lib/email-wrapper";

function maskKey(plain: string): string {
  if (!plain) return "";
  const prefix = plain.slice(0, 4);
  return `${prefix}_${"*".repeat(8)}`;
}

async function markEmailConfigured(userId: string): Promise<void> {
  await db
    .update(stripeConnection)
    .set({ phase: "email_configured" })
    .where(
      and(
        eq(stripeConnection.userId, userId),
        eq(stripeConnection.phase, "write_authorized"),
      ),
    );
}

export type EmailProviderState = {
  provider: EmailProviderType;
  apiKey: string | null;
  domain: string;
  fromEmail: string;
  fromName: string;
  configured: boolean;
};

export const getEmailProvider = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<EmailProviderState> => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    const [row] = await db
      .select()
      .from(emailProvider)
      .where(eq(emailProvider.userId, userId))
      .limit(1);

    if (!row) {
      return {
        provider: "postmark",
        apiKey: null,
        domain: "",
        fromEmail: "",
        fromName: "",
        configured: false,
      };
    }

    let masked: string | null = null;
    try {
      const { decrypt } = await import("@dunlo-v2/db/encrypt");
      const plain = decrypt(row.apiKey);
      masked = maskKey(plain);
    } catch {
      masked = null;
    }

    return {
      provider: EMAIL_PROVIDERS.includes(row.provider as EmailProviderType)
        ? (row.provider as EmailProviderType)
        : "resend",
      apiKey: masked,
      domain: row.domain ?? "",
      fromEmail: row.fromEmail ?? "",
      fromName: row.fromName ?? "",
      configured: Boolean(masked && row.fromEmail && row.fromName),
    };
  });

const saveSchema = z
  .object({
    provider: z.enum(EMAIL_PROVIDERS),
    apiKey: z.string().max(500),
    domain: z.string().max(200).optional(),
    fromEmail: z.email("Invalid email"),
    fromName: z.string().min(1).max(100),
  })
  .refine(
    (value) => value.provider !== "mailgun" || Boolean(value.domain?.trim()),
    {
      message: "Mailgun sending domain is required",
      path: ["domain"],
    },
  );

export const saveEmailProvider = createServerFn({ method: "POST" })
  .inputValidator((input) => saveSchema.parse(input))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const userId = context.session.user.id;

    const [existing] = await db
      .select()
      .from(emailProvider)
      .where(eq(emailProvider.userId, userId))
      .limit(1);

    const trimmedKey = data.apiKey.trim();

    const { encrypt } = await import("@dunlo-v2/db/encrypt");
    if (!existing) {
      if (!trimmedKey) {
        throw new Error("API key is required on first setup");
      }
      await db.insert(emailProvider).values({
        id: crypto.randomUUID(),
        userId,
        provider: data.provider,
        apiKey: encrypt(trimmedKey),
        domain: data.domain?.trim() || null,
        fromEmail: data.fromEmail,
        fromName: data.fromName,
      });
    } else {
      const patch: Record<string, unknown> = {
        provider: data.provider,
        domain: data.domain?.trim() || null,
        fromEmail: data.fromEmail,
        fromName: data.fromName,
        updatedAt: new Date(),
      };
      if (trimmedKey) {
        patch.apiKey = encrypt(trimmedKey);
      }
      await db
        .update(emailProvider)
        .set(patch)
        .where(eq(emailProvider.userId, userId));
    }

    await markEmailConfigured(userId);
    return { ok: true };
  });

export const sendTestEmail = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (!context.session?.user) throw new Error("Unauthorized");
    const userId = context.session.user.id;
    const userEmail = context.session.user.email;

    const [row] = await db
      .select()
      .from(emailProvider)
      .where(eq(emailProvider.userId, userId))
      .limit(1);

    if (!row) throw new Error("Configure your email provider first");

    await sendUserEmail({
      provider: {
        provider: row.provider,
        apiKey: row.apiKey,
        domain: row.domain,
        fromEmail: row.fromEmail,
        fromName: row.fromName,
      },
      to: userEmail,
      subject: "Hello from Dunlo — your email setup is working",
      html: wrapEmail(`
        <h1 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Your email setup is working</h1>
        <p style="margin:0 0 24px;font-size:14px;line-height:1.55;color:#475569;">
          Nice work. Your email provider, sending domain, and from name are all wired up correctly.
          You can now run recovery sequences from this address.
        </p>
        <p style="margin:0;font-size:14px;color:#475569;">— The Dunlo team</p>
      `),
    });

    await markEmailConfigured(userId);
    return { ok: true };
  });
