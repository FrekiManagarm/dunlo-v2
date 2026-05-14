import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";
import mdx from "fumadocs-mdx/vite";
import * as MdxConfig from "./source.config.js";

export default defineConfig({
  server: {
    port: 3001,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    mdx(MdxConfig),
    tailwindcss(),
    nitro(),
    tanstackStart({
      nitro: {
        plugins: ["./server/plugins/email-scheduler.ts"],
        ...(process.env.VERCEL && { preset: "vercel" }),
      },
    }),
    viteReact(),
  ],
});
