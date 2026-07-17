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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-dunlo-line bg-dunlo-ground/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link
          href="/"
          aria-label="Dunlo home"
          className="flex min-h-11 items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dunlo-deep"
        >
          <Logo size={26} />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {HEADER_NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="flex min-h-11 items-center rounded-full px-3.5 text-sm text-gray-700 transition-colors hover:bg-white hover:text-dunlo-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dunlo-deep"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href={loginUrl}
            onClick={() => captureCtaClick("Sign in", loginUrl)}
            className="flex min-h-11 items-center rounded-full px-3.5 text-sm font-medium text-gray-700 transition-colors hover:text-dunlo-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dunlo-deep"
          >
            Sign in
          </Link>
          <Link
            href={SIGNUP_URL}
            onClick={() => captureCtaClick("Start free", SIGNUP_URL)}
            className="flex min-h-11 items-center gap-1.5 rounded-full bg-dunlo px-4 text-sm font-semibold text-dunlo-ink transition-colors hover:bg-dunlo-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dunlo-deep"
          >
            Start free
            <ChevronRight size={14} aria-hidden />
          </Link>
        </div>

        <details
          ref={mobileMenuRef}
          onKeyDown={handleMobileMenuKeyDown}
          className="relative group md:hidden"
        >
          <summary className="flex size-11 cursor-pointer list-none items-center justify-center rounded-full border border-dunlo-line bg-white text-dunlo-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dunlo-deep [&::-webkit-details-marker]:hidden">
            <span className="sr-only">
              <span className="group-open:hidden">Open navigation</span>
              <span className="hidden group-open:inline">Close navigation</span>
            </span>
            <Menu className="group-open:hidden" size={20} aria-hidden />
            <X className="hidden group-open:block" size={20} aria-hidden />
          </summary>
          <nav
            aria-label="Mobile primary"
            className="absolute right-0 top-13 w-48 rounded-xl border border-dunlo-line bg-white p-2 shadow-lg"
          >
            {HEADER_NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={closeMobileMenu}
                className="flex min-h-11 items-center rounded-lg px-3 text-sm text-gray-700 hover:bg-dunlo-ground hover:text-dunlo-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dunlo-deep"
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
              className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-gray-700 hover:bg-dunlo-ground hover:text-dunlo-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dunlo-deep"
            >
              Sign in
            </Link>
            <Link
              href={SIGNUP_URL}
              onClick={() => {
                closeMobileMenu();
                captureCtaClick("Start free", SIGNUP_URL);
              }}
              className="mt-1 flex min-h-11 items-center justify-between rounded-full bg-dunlo px-4 text-sm font-semibold text-dunlo-ink hover:bg-dunlo-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dunlo-deep"
            >
              Start free
              <ChevronRight size={14} aria-hidden />
            </Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
