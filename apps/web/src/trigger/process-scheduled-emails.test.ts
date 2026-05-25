import { describe, expect, it, vi } from "vitest";

const processScheduledEmailsMock = vi.fn();
const schedulesTaskMock = vi.fn((definition) => definition);
const loggerInfoMock = vi.fn();

vi.mock("@trigger.dev/sdk", () => ({
  logger: {
    info: loggerInfoMock,
  },
  schedules: {
    task: schedulesTaskMock,
  },
}));

vi.mock("../functions/scheduler", () => ({
  processScheduledEmails: processScheduledEmailsMock,
}));

describe("processScheduledEmailsTask", () => {
  it("registers the scheduled email processor every 15 minutes", async () => {
    await import("./process-scheduled-emails");

    expect(schedulesTaskMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "process-scheduled-emails",
        cron: "*/15 * * * *",
      }),
    );
  });

  it("delegates scheduled email work to the shared scheduler", async () => {
    processScheduledEmailsMock.mockResolvedValueOnce({
      processed: 3,
      sent: 2,
      failed: 1,
    });

    const { processScheduledEmailsTask } = await import(
      "./process-scheduled-emails"
    );
    const task = processScheduledEmailsTask as unknown as {
      run: () => Promise<{ processed: number; sent: number; failed: number }>;
    };

    await expect(task.run()).resolves.toEqual({
      processed: 3,
      sent: 2,
      failed: 1,
    });
    expect(processScheduledEmailsMock).toHaveBeenCalledTimes(1);
    expect(loggerInfoMock).toHaveBeenCalledWith(
      "Processed scheduled recovery emails",
      { processed: 3, sent: 2, failed: 1 },
    );
  });
});
