import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePostHog } from "posthog-js/react";
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
  BookOpen,
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings,
  Zap,
} from "lucide-react";

import { Logo } from "@/components/logo";
import { FeedbackWidget } from "@/components/feedback-widget";
import { WelcomeGuide } from "@/components/welcome-guide";
import { authClient } from "@/lib/auth-client";
import { getUser } from "@/functions/get-user";

export const Route = createFileRoute("/_dashboard")({
  beforeLoad: async () => {
    const session = await getUser();
    if (!session) throw redirect({ to: "/login", search: { mode: "signin" } });
    return { session };
  },
  component: DashboardLayout,
});

const MAIN_NAV = [
  { icon: LayoutDashboard, label: "Overview", to: "/dashboard" as const },
  { icon: Receipt, label: "Payments", to: "/payments" as const },
  { icon: Zap, label: "Recovery sequences", to: "/sequences" as const },
  { icon: AlertCircle, label: "Escalations", to: "/escalations" as const },
] as const;

const SECONDARY_NAV = [
  { icon: Bell, label: "Alerts", to: "/alerts" as const },
  { icon: Settings, label: "Settings", to: "/settings" as const },
] as const;

const GUIDE_KEY = "dunlo_welcome_seen_v1";

function DashboardLayout() {
  const { session } = Route.useRouteContext();
  const { location } = useRouterState();
  const navigate = Route.useNavigate();
  const posthog = usePostHog();
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(GUIDE_KEY)) {
      setGuideOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!session?.user.id) return;

    posthog.identify(session.user.id, {
      email: session.user.email,
      name: session.user.name,
    });
  }, [posthog, session?.user.email, session?.user.id, session?.user.name]);

  const openGuide = () => setGuideOpen(true);
  const closeGuide = () => {
    localStorage.setItem(GUIDE_KEY, "1");
    setGuideOpen(false);
  };

  const handleSignOut = () => {
    authClient.signOut({
      fetchOptions: { onSuccess: () => navigate({ to: "/" }) },
    });
  };

  const initials = session?.user.name
    ? session.user.name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div className="flex h-dvh bg-[#f7f8fa] font-sans">
      <aside className="hidden h-dvh w-58 shrink-0 sticky top-0 flex-col border-r border-zinc-100 bg-white lg:flex">
        {/* Logo + beta badge */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4.5">
          <Logo size={26} />
          <span className="rounded-full bg-dunlo/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-dunlo-deep">
            Beta
          </span>
        </div>

        {/* Nav */}
        <nav className="relative flex-1 px-3 py-4">
          {/* Main items */}
          <ul className="space-y-px">
            {MAIN_NAV.map(({ icon: Icon, label, to }) => {
              const active = location.pathname === to;
              return (
                <li key={label}>
                  <Link
                    to={to}
                    className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-all ${
                      active
                        ? "bg-dunlo/8 font-semibold text-dunlo-deep"
                        : "font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="sidebar-active-indicator"
                        className="absolute left-0 top-1/2 h-5 w-0.75 -translate-y-1/2 rounded-r-full bg-dunlo"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                    <Icon
                      size={15}
                      strokeWidth={active ? 2.5 : 2}
                      className={
                        active
                          ? "text-dunlo"
                          : "text-zinc-400 transition-colors group-hover:text-zinc-600"
                      }
                    />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Divider */}
          <div className="mx-1 my-3 h-px bg-zinc-100" />

          {/* Secondary items */}
          <ul className="space-y-px">
            {SECONDARY_NAV.map(({ icon: Icon, label, to }) => {
              const active = location.pathname === to;
              return (
                <li key={label}>
                  <Link
                    to={to}
                    className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-all ${
                      active
                        ? "bg-dunlo/8 font-semibold text-dunlo-deep"
                        : "font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="sidebar-active-indicator"
                        className="absolute left-0 top-1/2 h-5 w-0.75 -translate-y-1/2 rounded-r-full bg-dunlo"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                    <Icon
                      size={15}
                      strokeWidth={active ? 2.5 : 2}
                      className={
                        active
                          ? "text-dunlo"
                          : "text-zinc-400 transition-colors group-hover:text-zinc-600"
                      }
                    />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="space-y-px border-t border-zinc-100 px-3 py-3">
          <button
            onClick={openGuide}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-zinc-500 transition-all hover:bg-zinc-50 hover:text-zinc-800 active:scale-[0.98]"
          >
            <BookOpen
              size={15}
              strokeWidth={2}
              className="text-zinc-400 transition-colors group-hover:text-zinc-600"
            />
            How it works
          </button>
          <FeedbackWidget
            user={session?.user}
            path={location.pathname}
            variant="sidebar"
          />
        </div>

        {/* User card */}
        <div className="border-t border-zinc-100 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-[11px] font-bold tracking-tight text-zinc-700">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold leading-tight text-zinc-900">
                {session?.user.name}
              </p>
              <p className="truncate text-[11px] leading-tight text-zinc-400">
                {session?.user.email}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign out"
              className="flex size-7 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-all hover:bg-zinc-100 hover:text-zinc-700 active:scale-95"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

      <WelcomeGuide open={guideOpen} onClose={closeGuide} />
    </div>
  );
}
