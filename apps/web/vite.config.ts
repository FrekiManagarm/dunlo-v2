import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import evlog from "evlog/nitro/v3";
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
    tanstackStart(),
    viteReact(),
    nitro({
      serverDir: "./server",
      modules: [
        evlog({
          env: { service: "dunlo-web" },
        }),
        {
          name: "evlog-plugin-order",
          setup(nitro) {
            const evlogPlugin = nitro.options.plugins.find(
              (plugin) =>
                plugin.includes("/evlog/dist/nitro/v3/plugin") ||
                plugin.includes("\\evlog\\dist\\nitro\\v3\\plugin"),
            );

            if (!evlogPlugin) {
              return;
            }

            nitro.options.plugins = [
              evlogPlugin,
              ...nitro.options.plugins.filter((plugin) => plugin !== evlogPlugin),
            ];
          },
        },
      ],
    }),
  ],
});
