import { createDb } from "@dunlo-v2/db";
import * as schema from "@dunlo-v2/db/schema/auth";
import { env } from "@dunlo-v2/env/server";
import { betterAuth } from "better-auth";
import { autumn } from "autumn-js/better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import {
  passwordResetEmailHtml,
  sendAuthEmail,
  verificationEmailHtml,
} from "./email";

export function createAuth() {
  const db = createDb();

  return betterAuth({
    appName: "Dunlo",
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: schema,
    }),
    trustedOrigins: [env.CORS_ORIGIN],
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      sendResetPassword: async ({ user, url }) => {
        await sendAuthEmail({
          to: user.email,
          subject: "Reset your Dunlo password",
          html: passwordResetEmailHtml({ url }),
        });
      },
    },

    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        await sendAuthEmail({
          to: user.email,
          subject: "Verify your Dunlo email",
          html: verificationEmailHtml({ url }),
        });
      },
    },

    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5,
      },
    },

    advanced: {
      useSecureCookies: env.NODE_ENV === "production",
    },

    rateLimit: {
      enabled: true,
      window: 60,
      max: 10,
      storage: "memory",
    },

    plugins: [
      tanstackStartCookies(),
      autumn(env.AUTUMN_SECRET_KEY ? { secretKey: env.AUTUMN_SECRET_KEY } : {}),
    ],
  });
}

export const auth = createAuth();
