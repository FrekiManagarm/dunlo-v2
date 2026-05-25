import { logger, schedules } from "@trigger.dev/sdk";
import { processScheduledEmails } from "../functions/scheduler";

export const processScheduledEmailsTask = schedules.task({
  id: "process-scheduled-emails",
  cron: "*/15 * * * *",
  run: async () => {
    const result = await processScheduledEmails();

    logger.info("Processed scheduled recovery emails", result);

    return result;
  },
});
