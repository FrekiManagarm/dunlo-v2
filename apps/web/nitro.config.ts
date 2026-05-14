import evlog from "evlog/nitro/v3";
import { defineConfig } from "nitro";

export default defineConfig({
  experimental: {
    asyncContext: true,
  },
  ...(process.env.VERCEL && { preset: "vercel" }),
  modules: [
    evlog({
      env: { service: "dunlo-v2-web" },
    }),
  ],
});
