import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { AuthPage } from "@/components/auth-page";

const searchSchema = z.object({
  mode: z.enum(["signup", "signin"]).catch("signin"),
});

export const Route = createFileRoute("/login")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Sign in — Dunlo" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { mode } = Route.useSearch();

  return <AuthPage initialMode={mode} />;
}
