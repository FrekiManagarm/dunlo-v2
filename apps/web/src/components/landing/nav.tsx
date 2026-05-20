import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { Logo } from "@/components/logo";

export function Nav() {
  const posthog = usePostHog();

  return (
    <div className="fixed inset-x-0 top-4 z-50 px-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between rounded-full border border-gray-200 bg-white/90 px-4 py-2.5 shadow-sm backdrop-blur-md">
        <Link to="/">
          <Logo size={26} />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {[
            { label: "Features", href: "#features" },
            { label: "Pricing", href: "#pricing" },
            { label: "FAQ", href: "#faq" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-full px-3.5 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/blog"
            className="rounded-full px-3.5 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            Blog
          </Link>
          <Link
            to="/benchmark"
            className="rounded-full px-3.5 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            Benchmark
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="rounded-full px-3.5 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
          >
            Sign in
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-1.5 rounded-full bg-gray-900 px-4 py-1.5 text-sm font-semibold text-white transition-all hover:bg-gray-700 active:scale-[0.97]"
            onClick={() => posthog.capture("cta_clicked", { location: "nav" })}
          >
            Start free
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
