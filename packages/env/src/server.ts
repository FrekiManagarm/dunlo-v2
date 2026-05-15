import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    CORS_ORIGIN: z.url(),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

    STRIPE_CLIENT_ID: z.string().min(1),
    STRIPE_SECRET_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),

    ENCRYPTION_KEY: z
      .string()
      .regex(/^[0-9a-fA-F]{64}$/, "ENCRYPTION_KEY must be a 64-char hex string (32 bytes)"),

    AUTUMN_SECRET_KEY: z.string().min(1).optional(),

    ANTHROPIC_API_KEY: z.string().min(1),
    AUTH_EMAIL_PROVIDER: z
      .enum(["resend", "postmark", "mailgun", "sendgrid"])
      .default("resend"),
    RESEND_API_KEY: z.string().min(1).optional(),
    POSTMARK_SERVER_TOKEN: z.string().min(1).optional(),
    MAILGUN_API_KEY: z.string().min(1).optional(),
    MAILGUN_DOMAIN: z.string().min(1).optional(),
    SENDGRID_API_KEY: z.string().min(1).optional(),
    PLATFORM_EMAIL_FROM: z.string().min(1).default("Dunlo <noreply@dunlo.io>"),

    APP_URL: z.url(),
    CRON_SECRET: z.string().min(16),

    SCHEDULER_INTERVAL_MINUTES: z.coerce.number().int().positive().default(5),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
