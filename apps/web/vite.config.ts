import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import mdx from "fumadocs-mdx/vite";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 3001,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    mdx(),
    tailwindcss(),
    tanstackStart({
      nitro: {
        plugins: ["./server/plugins/email-scheduler.ts"],
      },
    }),
    viteReact(),
  ],
});
