export function decryptOptionalWebhookSecret(
  encryptedSecret: string | null,
  decryptValue: (value: string) => string,
): string | null {
  return encryptedSecret ? decryptValue(encryptedSecret) : null;
}
