import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  server: {
    port: 3001,
    strictPort: true,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tailwindcss(),
    nitro(),
    tanstackStart({
      prerender: {
        crawlLinks: true,
        enabled: true,
      },
      sitemap: {
        enabled: true,
        host: "https://dunlo.io",
      },
      nitro: {
        plugins: ["./server/plugins/email-scheduler.ts"],
        ...(process.env.VERCEL && { preset: "vercel" }),
      },
    }),
    viteReact(),
  ],
});
