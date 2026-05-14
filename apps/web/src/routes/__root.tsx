import { AutumnProvider } from "autumn-js/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@dunlo-v2/ui/components/sonner";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { createMiddleware } from "@tanstack/react-start";
import { evlogErrorHandler } from "evlog/nitro/v3";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect } from "react";
import { env } from "@dunlo-v2/env/web";
import appCss from "../index.css?url";

export interface RouterAppContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  server: {
    middleware: [createMiddleware().server(evlogErrorHandler)],
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Dunlo — Stop losing revenue to failed payments" },
      {
        name: "description",
        content:
          "Dunlo connects to Stripe, detects every failed payment by type, and sends the right recovery email automatically. Setup in 5 minutes.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Dunlo" },
      {
        property: "og:title",
        content: "Dunlo — Stop losing revenue to failed payments",
      },
      {
        property: "og:description",
        content:
          "Dunlo connects to Stripe, detects every failed payment by type, and sends the right recovery email automatically. Setup in 5 minutes.",
      },
      {
        property: "og:image",
        content: "https://dunlo.io/brand/dunlo-logo.png",
      },
      { property: "og:url", content: "https://dunlo.io" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Dunlo — Stop losing revenue to failed payments",
      },
      {
        name: "twitter:description",
        content:
          "Dunlo connects to Stripe, detects every failed payment by type, and sends the right recovery email automatically. Setup in 5 minutes.",
      },
      {
        name: "twitter:image",
        content: "https://dunlo.io/brand/dunlo-logo.png",
      },
    ],
    links: [
      { rel: "icon", href: "/brand/dunlo-mark.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/brand/dunlo-mark.png", type: "image/png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    posthog.init(env.VITE_POSTHOG_KEY, {
      api_host: env.VITE_POSTHOG_HOST,
      capture_pageview: false,
      autocapture: false,
      disable_session_recording: false,
    });

    posthog.capture("$pageview");

    const unsubscribe = router.subscribe("onResolved", () => {
      posthog.capture("$pageview");
    });

    return unsubscribe;
  }, []);

  return (
    <PostHogProvider client={posthog}>
      <QueryClientProvider client={queryClient}>
        <AutumnProvider useBetterAuth>
          <html lang="en">
            <head>
              <HeadContent />
            </head>
            <body>
              <Outlet />
              <Toaster richColors position="bottom-right" />
              <TanStackRouterDevtools position="bottom-left" />
              <ReactQueryDevtools initialIsOpen={false} />
              <Scripts />
            </body>
          </html>
        </AutumnProvider>
      </QueryClientProvider>
    </PostHogProvider>
  );
}
