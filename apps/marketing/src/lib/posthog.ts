"use client";

import posthog from "posthog-js";

type MarketingEventProperties = Record<string, string | number | boolean>;

export function captureMarketingEvent(
  event: string,
  properties?: MarketingEventProperties,
) {
  if (!posthog.__loaded) {
    return;
  }

  posthog.capture(event, properties);
}
