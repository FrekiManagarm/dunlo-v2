import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  server: {
    port: 3001,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      nitro: {
        plugins: ["./server/plugins/email-scheduler.ts"],
        ...(process.env.VERCEL && {
          preset: "vercel",
          output: { dir: resolve(__dirname, "../../.vercel/output") },
        }),
      },
    }),
    viteReact(),
  ],
});
