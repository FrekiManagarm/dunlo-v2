import { defineConfig } from "@trigger.dev/sdk";

const project = process.env.TRIGGER_PROJECT_ID;

if (!project) {
  throw new Error("TRIGGER_PROJECT_ID is required to run Trigger.dev tasks");
}

export default defineConfig({
  project,
  runtime: "node",
  logLevel: "log",
  maxDuration: 3600,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ["src/trigger"],
});
