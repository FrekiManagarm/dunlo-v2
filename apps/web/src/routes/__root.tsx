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
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  keywordsMeta,
  ogMeta,
} from "@/lib/seo";

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
      { title: DEFAULT_TITLE },
      {
        name: "description",
        content: DEFAULT_DESCRIPTION,
      },
      keywordsMeta(DEFAULT_KEYWORDS),
      ...ogMeta({ title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION }),
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
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
          logo: absoluteUrl("/brand/dunlo-logo.png"),
          image: DEFAULT_OG_IMAGE,
          email: "hello@dunlo.io",
          description: DEFAULT_DESCRIPTION,
          founder: {
            "@type": "Person",
            name: "Mathieu Chambaud",
            sameAs: "https://x.com/mathchambaud",
            image: absoluteUrl("/founder/mathieu-chambaud-linkedin.jpg"),
          },
          sameAs: ["https://x.com/mathchambaud"],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_NAME,
          url: SITE_URL,
          inLanguage: "en",
          publisher: {
            "@type": "Organization",
            name: SITE_NAME,
            url: SITE_URL,
          },
        }),
      },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    if (!posthog.__loaded) {
      posthog.init(env.VITE_POSTHOG_KEY, {
        api_host: env.VITE_POSTHOG_HOST,
        capture_pageview: false,
        autocapture: false,
        disable_session_recording: false,
      });
    }

    posthog.capture("$pageview");

    const unsubscribe = router.subscribe("onResolved", () => {
      posthog.capture("$pageview");
    });

    return unsubscribe;
  }, [router]);

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
