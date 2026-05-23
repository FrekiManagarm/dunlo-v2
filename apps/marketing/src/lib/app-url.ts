export const APP_ORIGIN =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://app.dunlo.io";

export function appUrl(path = "/") {
  return `${APP_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}
