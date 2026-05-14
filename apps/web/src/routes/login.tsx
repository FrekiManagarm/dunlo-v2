import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { Logo } from "@/components/logo";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "Sign in — Dunlo" },
    ],
  }),
  component: RouteComponent,
});

const PERKS = [
  "Free during beta — no credit card",
  "Connect Stripe in 30 seconds",
  "First recovery email in under 5 min",
  "Cancel anytime, no lock-in",
];

function RouteComponent() {
  const [mode, setMode] = useState<"signup" | "signin">("signup");

  return (
    <div className="flex min-h-dvh bg-[#f7f8fa] font-sans">
      {/* Left panel */}
      <div className="relative hidden flex-col justify-between bg-gray-900 p-12 lg:flex lg:w-[45%]">
        {/* Glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: 500,
            height: 500,
            background:
              "radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 65%)",
          }}
          aria-hidden
        />

        <Link to="/" className="relative z-10">
          <Logo size={26} dark />
        </Link>

        <div className="relative z-10 space-y-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/30">
              The problem
            </p>
            <p className="mt-4 text-6xl font-bold tracking-tighter text-dunlo">
              ~5%
            </p>
            <p className="mt-3 text-xl font-semibold leading-snug text-white">
              of your MRR fails silently
              <br />
              every month.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/50">
              Expired cards, bank declines, insufficient funds — most of it
              is recoverable if you act on the right failure at the right time.
            </p>
          </div>

          <ul className="space-y-3">
            {PERKS.map((p) => (
              <li
                key={p}
                className="flex items-center gap-3 text-sm text-white/70"
              >
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-dunlo/20 border border-dunlo/30">
                  <Check size={11} className="text-dunlo" />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-white/30">
          © {new Date().getFullYear()} Dunlo
        </p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4 lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-dunlo text-[10px] font-bold text-white">
              D
            </span>
            <span className="text-sm font-semibold text-gray-900">dunlo</span>
          </Link>
          <Link to="/" className="text-xs text-gray-500 hover:text-gray-700">
            ← Back
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            {/* Mode switcher */}
            <div className="mb-8 flex rounded-full border border-gray-200 bg-gray-100 p-1">
              {(["signup", "signin"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 rounded-full py-2 text-sm font-semibold transition-all duration-200 ${
                    mode === m
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {m === "signup" ? "Create account" : "Sign in"}
                </button>
              ))}
            </div>

            {mode === "signin" ? (
              <SignInForm onSwitchToSignUp={() => setMode("signup")} />
            ) : (
              <SignUpForm onSwitchToSignIn={() => setMode("signin")} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
