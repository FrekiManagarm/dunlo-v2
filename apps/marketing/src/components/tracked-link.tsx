"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { captureMarketingEvent } from "@/lib/posthog";

type TrackedLinkProps = ComponentProps<typeof Link> & {
  eventName?: string;
  eventProperties?: Record<string, string | number | boolean>;
};

export function TrackedLink({
  eventName = "cta_clicked",
  eventProperties,
  onClick,
  ...props
}: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        captureMarketingEvent(eventName, eventProperties);
        onClick?.(event);
      }}
    />
  );
}
