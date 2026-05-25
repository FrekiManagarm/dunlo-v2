import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

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
    tanstackStart({
      prerender: {
        crawlLinks: true,
        enabled: true,
      },
      sitemap: {
        enabled: true,
        host: "https://dunlo.io",
      },
    }),
    viteReact(),
  ],
});
