import { createHmac, timingSafeEqual } from "node:crypto";

const STATE_TTL_MS = 10 * 60 * 1000;

export type StripeOAuthIntent = "diagnostic" | "activation";

type StripeOAuthStatePayload = {
  nonce: string;
  userId: string;
  intent: StripeOAuthIntent;
  targetStripeAccountId?: string;
  issuedAt: string;
  returnPath: string;
};

type CreateStripeOAuthStateInput = {
  nonce: string;
  userId: string;
  intent: StripeOAuthIntent;
  targetStripeAccountId?: string;
  issuedAt: Date;
  returnPath: string;
};

type VerifyStripeOAuthStateInput = {
  nonce: string;
  userId: string;
  now: Date;
  secret: string;
};

export class StripeOAuthStateError extends Error {}

function invalidState(): never {
  throw new StripeOAuthStateError("invalid_oauth_state");
}

export function isInternalStripeOAuthReturnPath(path: string): boolean {
  if (
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.includes("\\") ||
    /%5c/i.test(path)
  ) {
    return false;
  }
  try {
    return (
      new URL(path, "https://router.dunlo.invalid").origin ===
      "https://router.dunlo.invalid"
    );
  } catch {
    return false;
  }
}

function sign(encodedPayload: string, secret: string): string {
  return createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");
}

function decodePayload(encodedPayload: string): StripeOAuthStatePayload {
  try {
    const parsed = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as Partial<StripeOAuthStatePayload>;
    if (
      typeof parsed.nonce !== "string" ||
      typeof parsed.userId !== "string" ||
      (parsed.intent !== "diagnostic" && parsed.intent !== "activation") ||
      typeof parsed.issuedAt !== "string" ||
      typeof parsed.returnPath !== "string" ||
      (parsed.targetStripeAccountId !== undefined &&
        typeof parsed.targetStripeAccountId !== "string")
    ) {
      invalidState();
    }
    return parsed as StripeOAuthStatePayload;
  } catch (error) {
    if (error instanceof StripeOAuthStateError) throw error;
    return invalidState();
  }
}

export function createStripeOAuthState(
  input: CreateStripeOAuthStateInput,
  secret: string,
): { nonce: string; sealed: string } {
  if (
    !input.nonce ||
    !input.userId ||
    !isInternalStripeOAuthReturnPath(input.returnPath)
  ) {
    invalidState();
  }
  if (input.intent === "activation" && !input.targetStripeAccountId) {
    throw new StripeOAuthStateError("activation_target_required");
  }

  const payload: StripeOAuthStatePayload = {
    nonce: input.nonce,
    userId: input.userId,
    intent: input.intent,
    ...(input.targetStripeAccountId
      ? { targetStripeAccountId: input.targetStripeAccountId }
      : {}),
    issuedAt: input.issuedAt.toISOString(),
    returnPath: input.returnPath,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );
  return {
    nonce: input.nonce,
    sealed: `${encodedPayload}.${sign(encodedPayload, secret)}`,
  };
}

export function verifyStripeOAuthState(
  sealed: string,
  input: VerifyStripeOAuthStateInput,
): StripeOAuthStatePayload {
  const [encodedPayload, signature, ...rest] = sealed.split(".");
  if (!encodedPayload || !signature || rest.length > 0) invalidState();

  const expectedSignature = Buffer.from(sign(encodedPayload, input.secret));
  const receivedSignature = Buffer.from(signature);
  if (
    expectedSignature.length !== receivedSignature.length ||
    !timingSafeEqual(expectedSignature, receivedSignature)
  ) {
    invalidState();
  }

  const payload = decodePayload(encodedPayload);
  if (payload.nonce !== input.nonce) invalidState();
  if (payload.userId !== input.userId) {
    throw new StripeOAuthStateError("oauth_state_user_mismatch");
  }
  const issuedAt = new Date(payload.issuedAt);
  if (
    Number.isNaN(issuedAt.getTime()) ||
    input.now.getTime() - issuedAt.getTime() > STATE_TTL_MS ||
    issuedAt.getTime() - input.now.getTime() > STATE_TTL_MS
  ) {
    throw new StripeOAuthStateError("oauth_state_expired");
  }
  if (payload.intent === "activation" && !payload.targetStripeAccountId) {
    throw new StripeOAuthStateError("activation_target_required");
  }
  if (!isInternalStripeOAuthReturnPath(payload.returnPath)) invalidState();
  return {
    ...payload,
    targetStripeAccountId: payload.targetStripeAccountId,
  };
}

export function buildStripeOAuthStateCookie(
  sealed: string,
  isProduction: boolean,
): string {
  const parts = [
    `stripe_oauth_state=${sealed}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=600",
  ];
  if (isProduction) parts.push("Secure");
  return parts.join("; ");
}

export function clearStripeOAuthStateCookie(isProduction: boolean): string {
  const parts = [
    "stripe_oauth_state=",
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
  ];
  if (isProduction) parts.push("Secure");
  return parts.join("; ");
}
