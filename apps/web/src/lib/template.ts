const KNOWN_FAILURE_CODES: Record<string, string> = {
  expired_card: "Card expired",
  card_declined: "Card declined",
  insufficient_funds: "Insufficient funds",
  do_not_honor: "Bank declined the payment",
};

export function renderTemplate(
  template: string,
  vars: Record<string, string | undefined>,
): string {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_match, key: string) => {
    const value = vars[key];
    return value ?? "";
  });
}

export function formatAmount(cents: number, currency: string): string {
  const code = (currency || "eur").toUpperCase();
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${code}`;
  }
}

export function humanizeFailureCode(code: string): string {
  if (!code) return "";
  if (KNOWN_FAILURE_CODES[code]) return KNOWN_FAILURE_CODES[code];
  return code
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
