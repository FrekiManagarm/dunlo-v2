import { describe, expect, it, beforeAll } from "vitest";
import { randomBytes } from "node:crypto";

beforeAll(() => {
  if (!process.env.ENCRYPTION_KEY) {
    process.env.ENCRYPTION_KEY = randomBytes(32).toString("hex");
  }
  if (!process.env.DATABASE_URL) process.env.DATABASE_URL = "postgres://test";
  if (!process.env.BETTER_AUTH_SECRET)
    process.env.BETTER_AUTH_SECRET = "x".repeat(32);
  if (!process.env.BETTER_AUTH_URL)
    process.env.BETTER_AUTH_URL = "http://localhost:3000";
  if (!process.env.CORS_ORIGIN) process.env.CORS_ORIGIN = "http://localhost:3000";
  if (!process.env.GOOGLE_CLIENT_ID)
    process.env.GOOGLE_CLIENT_ID = "google-client";
  if (!process.env.GOOGLE_CLIENT_SECRET)
    process.env.GOOGLE_CLIENT_SECRET = "google-secret";
  if (!process.env.STRIPE_CLIENT_ID) process.env.STRIPE_CLIENT_ID = "ca_test";
  if (!process.env.STRIPE_SECRET_KEY) process.env.STRIPE_SECRET_KEY = "sk_test";
  if (!process.env.STRIPE_WEBHOOK_SECRET)
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  if (!process.env.OPENAI_API_KEY)
    process.env.OPENAI_API_KEY = "sk-openai-test";
  if (!process.env.RESEND_API_KEY) process.env.RESEND_API_KEY = "re_test";
  if (!process.env.APP_URL) process.env.APP_URL = "http://localhost:3000";
  if (!process.env.CRON_SECRET) process.env.CRON_SECRET = "x".repeat(16);
});

describe("encrypt / decrypt (AES-256-GCM)", () => {
  it("roundtrips a UTF-8 string", async () => {
    const { encrypt, decrypt } = await import("./encrypt");
    const plaintext = "sk_live_abc123-with-unicode-é-ñ";
    const ciphertext = encrypt(plaintext);
    expect(ciphertext).not.toBe(plaintext);
    expect(decrypt(ciphertext)).toBe(plaintext);
  });

  it("produces a 3-part colon-separated base64 payload", async () => {
    const { encrypt } = await import("./encrypt");
    const ciphertext = encrypt("hello");
    const parts = ciphertext.split(":");
    expect(parts).toHaveLength(3);
    for (const part of parts) {
      expect(part.length).toBeGreaterThan(0);
      expect(() => Buffer.from(part, "base64")).not.toThrow();
    }
  });

  it("produces a different ciphertext on each call (random IV)", async () => {
    const { encrypt } = await import("./encrypt");
    const a = encrypt("same-input");
    const b = encrypt("same-input");
    expect(a).not.toBe(b);
  });

  it("throws when the auth tag is tampered with", async () => {
    const { encrypt, decrypt } = await import("./encrypt");
    const ciphertext = encrypt("super-secret");
    const [iv, , data] = ciphertext.split(":") as [string, string, string];
    const fakeTag = Buffer.alloc(16, 0).toString("base64");
    const tampered = [iv, fakeTag, data].join(":");
    expect(() => decrypt(tampered)).toThrow();
  });

  it("throws when the ciphertext body is tampered with", async () => {
    const { encrypt, decrypt } = await import("./encrypt");
    const ciphertext = encrypt("super-secret");
    const [iv, tag, data] = ciphertext.split(":") as [string, string, string];
    const flipped = Buffer.from(data, "base64");
    flipped[0] = (flipped[0] ?? 0) ^ 0xff;
    const tampered = [iv, tag, flipped.toString("base64")].join(":");
    expect(() => decrypt(tampered)).toThrow();
  });

  it("throws on a malformed payload", async () => {
    const { decrypt } = await import("./encrypt");
    expect(() => decrypt("not-a-valid-ciphertext")).toThrow();
  });
});
