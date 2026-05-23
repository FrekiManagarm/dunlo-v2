import { createFileRoute } from "@tanstack/react-router";

import { AuthPage } from "@/components/auth-page";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Create account — Dunlo" },
    ],
  }),
  component: () => <AuthPage initialMode="signup" />,
});
