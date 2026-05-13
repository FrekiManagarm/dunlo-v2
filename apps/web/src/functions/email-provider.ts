import { db } from "@dunlo-v2/db";
import { emailProvider } from "@dunlo-v2/db/schema/domain";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { authMiddleware } from "@/middleware/auth";
import { getResendClient } from "@/lib/resend";

function maskKey(plain: string): string {
  if (!plain) return "";
  const prefix = plain.slice(0, 4);
  return `${prefix}_${"*".repeat(8)}`;
}

export type EmailProviderState = {
  apiKey: string | null;
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
      return { apiKey: null, fromEmail: "", fromName: "", configured: false };
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
      apiKey: masked,
      fromEmail: row.fromEmail ?? "",
      fromName: row.fromName ?? "",
      configured: Boolean(masked && row.fromEmail && row.fromName),
    };
  });

const saveSchema = z.object({
  apiKey: z.string().max(200),
  fromEmail: z.email("Invalid email"),
  fromName: z.string().min(1).max(100),
});

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
        provider: "resend",
        apiKey: encrypt(trimmedKey),
        fromEmail: data.fromEmail,
        fromName: data.fromName,
      });
    } else {
      const patch: Record<string, unknown> = {
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

    const { decrypt } = await import("@dunlo-v2/db/encrypt");
    const apiKey = decrypt(row.apiKey);
    const resend = getResendClient(apiKey);

    const result = await resend.emails.send({
      from: `${row.fromName} <${row.fromEmail}>`,
      to: userEmail,
      subject: "Hello from Dunlo — your email setup is working",
      html: `<p>Nice work. Your Resend API key, sending domain, and from name are all wired up correctly.</p><p>You can now run recovery sequences from this address.</p><p>— The Dunlo team</p>`,
    });

    if ("error" in result && result.error) {
      throw new Error(result.error.message ?? "Resend failed");
    }

    return { ok: true };
  });
