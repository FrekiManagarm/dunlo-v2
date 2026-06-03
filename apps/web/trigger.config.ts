import { defineConfig } from "@trigger.dev/sdk";
import { config as loadEnv } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(appDir, ".env"), quiet: true });

const project = process.env.TRIGGER_PROJECT_ID ?? "";

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
