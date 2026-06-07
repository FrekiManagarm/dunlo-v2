"use client";

import posthog, { type PostHogConfig } from "posthog-js";
import { PostHogProvider as PostHogReactProvider } from "posthog-js/react";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

const posthogOptions: Partial<PostHogConfig> = {
  ...(posthogHost ? { api_host: posthogHost } : {}),
  capture_pageview: false,
  autocapture: false,
  disable_session_recording: false,
};

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!posthogKey || !posthog.__loaded) {
      return;
    }

    const search = searchParams.toString();
    const url = `${window.location.origin}${pathname}${search ? `?${search}` : ""}`;

    posthog.capture("$pageview", {
      $current_url: url,
    });
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [isPostHogReady, setIsPostHogReady] = useState(false);

  useEffect(() => {
    if (!posthogKey) {
      return;
    }

    if (!posthog.__loaded) {
      posthog.init(posthogKey, posthogOptions);
    }

    setIsPostHogReady(true);
  }, []);

  if (!posthogKey) {
    return children;
  }

  return (
    <PostHogReactProvider client={posthog}>
      {isPostHogReady ? (
        <Suspense fallback={null}>
          <PostHogPageView />
        </Suspense>
      ) : null}
      {children}
    </PostHogReactProvider>
  );
}
