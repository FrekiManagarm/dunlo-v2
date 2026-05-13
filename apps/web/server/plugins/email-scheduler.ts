import { definePlugin as defineNitroPlugin } from "nitro";
import { env } from "@dunlo-v2/env/server";
import { processScheduledEmails } from "../../src/functions/scheduler";

export default defineNitroPlugin(() => {
  if (env.NODE_ENV === "test") {
    return;
  }

  const intervalMs = env.SCHEDULER_INTERVAL_MINUTES * 60 * 1000;

  const tick = async () => {
    try {
      const result = await processScheduledEmails();
      if (result.processed > 0) {
        console.log(
          `[email-scheduler] processed=${result.processed} sent=${result.sent} failed=${result.failed}`,
        );
      }
    } catch (err) {
      console.error(
        "[email-scheduler] tick failed:",
        err instanceof Error ? err.message : err,
      );
    }
  };

  const timer = setInterval(tick, intervalMs);
  if (typeof (timer as { unref?: () => void }).unref === "function") {
    (timer as { unref: () => void }).unref();
  }

  console.log(
    `[email-scheduler] started; interval=${env.SCHEDULER_INTERVAL_MINUTES}min`,
  );
});
