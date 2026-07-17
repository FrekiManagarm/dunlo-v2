"use client";

import { useRef, type KeyboardEvent } from "react";
import Link from "next/link";
import { appUrl, SIGNUP_URL } from "@/lib/app-url";
import { ChevronRight, Menu, X } from "lucide-react";
import { captureMarketingEvent } from "@/lib/posthog";
import { Logo } from "@/components/logo";
import { HEADER_NAV_LINKS } from "@/lib/site-navigation";

export function Nav() {
  const loginUrl = appUrl("/login");
  const mobileMenuRef = useRef<HTMLDetailsElement>(null);

  function captureCtaClick(buttonText: string, destination: string) {
    captureMarketingEvent("cta_clicked", {
      button_text: buttonText,
      destination,
      location: "marketing_nav",
    });
  }

  function closeMobileMenu() {
    mobileMenuRef.current?.removeAttribute("open");
  }

  function handleMobileMenuKeyDown(event: KeyboardEvent<HTMLDetailsElement>) {
    if (event.key !== "Escape") return;
    closeMobileMenu();
    mobileMenuRef.current?.querySelector<HTMLElement>("summary")?.focus();
  }

  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3 md:top-4 md:px-6">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full border border-white/12 bg-dunlo-ink/92 px-3 text-white shadow-[0_6px_8px_rgba(3,18,12,0.18)] backdrop-blur-md md:px-4">
        <Link
          href="/"
          aria-label="Dunlo home"
          className="flex min-h-11 items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dunlo-deep"
        >
          <Logo size={26} dark />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {HEADER_NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="flex min-h-11 items-center rounded-full px-3.5 text-sm text-white/68 transition-colors hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href={loginUrl}
            onClick={() => captureCtaClick("Sign in", loginUrl)}
            className="flex min-h-11 items-center rounded-full px-3.5 text-sm font-medium text-white/68 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Sign in
          </Link>
          <Link
            href={SIGNUP_URL}
            onClick={() => captureCtaClick("Start free", SIGNUP_URL)}
            className="flex min-h-10 items-center gap-1.5 rounded-full bg-dunlo px-4 text-sm font-bold text-dunlo-ink transition-transform hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Start free
            <ChevronRight size={14} aria-hidden />
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Link
            href={SIGNUP_URL}
            onClick={() => captureCtaClick("Start free", SIGNUP_URL)}
            className="inline-flex min-h-10 shrink-0 items-center rounded-full bg-dunlo px-4 text-sm font-bold text-dunlo-ink transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Start free
          </Link>
          <details
            ref={mobileMenuRef}
            onKeyDown={handleMobileMenuKeyDown}
            className="relative group"
          >
            <summary className="flex size-10 cursor-pointer list-none items-center justify-center rounded-full border border-white/18 bg-white/8 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white [&::-webkit-details-marker]:hidden">
              <span className="sr-only">
                <span className="group-open:hidden">Open navigation</span>
                <span className="hidden group-open:inline">
                  Close navigation
                </span>
              </span>
              <Menu className="group-open:hidden" size={20} aria-hidden />
              <X className="hidden group-open:block" size={20} aria-hidden />
            </summary>
            <nav
              aria-label="Mobile primary"
              className="absolute right-0 top-12 w-52 rounded-xl border border-white/12 bg-dunlo-ink p-2 shadow-[0_6px_8px_rgba(3,18,12,0.28)]"
            >
              {HEADER_NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className="flex min-h-11 items-center rounded-lg px-3 text-sm text-white/72 hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {link.label}
                </a>
              ))}
              <Link
                href={loginUrl}
                onClick={() => {
                  closeMobileMenu();
                  captureCtaClick("Sign in", loginUrl);
                }}
                className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-white/72 hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Sign in
              </Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
