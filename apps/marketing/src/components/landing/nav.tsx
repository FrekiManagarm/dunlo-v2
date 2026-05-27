import Link from "next/link";
import { appUrl, SIGNUP_URL } from "@/lib/app-url";
import { ChevronRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { HEADER_NAV_LINKS } from "@/lib/site-navigation";

export function Nav() {
  return (
    <div className="fixed inset-x-0 top-4 z-50 px-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between rounded-full border border-gray-200 bg-white/90 px-4 py-2.5 shadow-sm backdrop-blur-md">
        <Link href="/">
          <Logo size={26} />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {HEADER_NAV_LINKS.map((link) =>
            link.href.includes("#") ? (
              <a
                key={link.label}
                href={link.href}
                className="rounded-full px-3.5 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-full px-3.5 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={appUrl("/login")}
            className="rounded-full px-3.5 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
          >
            Sign in
          </Link>
          <Link
            href={SIGNUP_URL}
            className="flex items-center gap-1.5 rounded-full bg-gray-900 px-4 py-1.5 text-sm font-semibold text-white transition-all hover:bg-gray-700 active:scale-[0.97]"
          >
            Start free
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
