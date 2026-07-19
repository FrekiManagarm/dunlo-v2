import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/benchmark")({
  beforeLoad: () => {
    throw redirect({ to: "/diagnostic" });
  },
});
