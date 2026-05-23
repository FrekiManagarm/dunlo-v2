import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/alternatives")({
  component: () => <Outlet />,
});
