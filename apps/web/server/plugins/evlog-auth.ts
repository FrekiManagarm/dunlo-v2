import { auth } from "@dunlo-v2/auth";
import {
  createAuthMiddleware,
  type BetterAuthInstance,
} from "evlog/better-auth";
import { definePlugin } from "nitro";

export default definePlugin((nitroApp) => {
  const identify = createAuthMiddleware(auth as BetterAuthInstance, {
    exclude: ["/api/auth/**"],
    maskEmail: true,
  });

  nitroApp.hooks.hook("request", async (event) => {
    const log = event.req.context?.log as
      | Parameters<typeof identify>[0]
      | undefined;

    if (!log) {
      return;
    }

    await identify(log, event.req.headers, new URL(event.req.url).pathname);
  });
});
