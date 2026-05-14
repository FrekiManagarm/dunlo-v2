import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useRouterState,
} from "@tanstack/react-router";
import {
  AlertCircle,
  Bell,
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings,
  Zap,
} from "lucide-react";

import { Logo } from "@/components/logo";
import { authClient } from "@/lib/auth-client";
import { getUser } from "@/functions/get-user";

export const Route = createFileRoute("/_dashboard")({
  beforeLoad: async () => {
    const session = await getUser();
    if (!session) throw redirect({ to: "/login" });
    return { session };
  },
  component: DashboardLayout,
});

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Overview", to: "/dashboard" as const },
  { icon: Receipt, label: "Payments", to: "/payments" as const },
  { icon: Zap, label: "Recovery sequences", to: "/sequences" as const },
  { icon: AlertCircle, label: "Escalations", to: "/escalations" as const },
  { icon: Bell, label: "Alerts", to: "/alerts" as const },
  { icon: Settings, label: "Settings", to: "/settings" as const },
] as const;

function DashboardLayout() {
  const { session } = Route.useRouteContext();
  const { location } = useRouterState();
  const navigate = Route.useNavigate();

  const handleSignOut = () => {
    authClient.signOut({
      fetchOptions: { onSuccess: () => navigate({ to: "/" }) },
    });
  };

  return (
    <div className="flex h-dvh bg-[#f7f8fa] font-sans">
      <aside className="hidden h-dvh w-58 shrink-0 sticky top-0 flex-col border-r border-zinc-100 bg-white lg:flex">
        <div className="flex items-center border-b border-zinc-100 px-5 py-4">
          <Logo size={26} />
        </div>
        <nav className="flex-1 px-3 py-4 space-y-px">
          {NAV_ITEMS.map(({ icon: Icon, label, to }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={label}
                to={to}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                  active
                    ? "bg-dunlo/[0.07] font-semibold text-dunlo-deep"
                    : "font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
                }`}
              >
                <Icon size={15} className={active ? "text-dunlo" : ""} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-zinc-100 p-4">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-700">
              {session?.user.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-900">
                {session?.user.name}
              </p>
              <p className="truncate text-xs text-zinc-400">
                {session?.user.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-xs text-zinc-400 transition-colors hover:text-zinc-700"
          >
            <LogOut size={12} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
