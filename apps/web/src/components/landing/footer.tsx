import { Logo } from "@/components/logo";

const FOOTER_LINKS = [
  { label: "About Dunlo", href: "/#about" },
  { label: "Benchmark", href: "/benchmark" },
  { label: "Blog", href: "/blog" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

const COMPARISON_LINKS = [
  { label: "Dunlo vs Churn Buster", href: "/alternatives/churn-buster" },
  { label: "Dunlo vs Paddle Retain", href: "/alternatives/paddle-retain" },
  {
    label: "Dunlo vs Stripe Smart Retries",
    href: "/alternatives/stripe-smart-retries",
  },
  { label: "Dunlo vs Triggla", href: "/alternatives/triggla" },
  { label: "Dunlo vs Slicker", href: "/alternatives/slicker" },
];

export function Footer() {
  return (
    <footer className="border-t border-gray-300/50 bg-stone-100 px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Logo size={22} />
            <span className="text-xs text-gray-400">
              Stop losing revenue to failed payments.
            </span>
          </div>
          <p className="mt-6 max-w-sm text-xs leading-6 text-gray-500">
            Stripe-first recovery for teams that want precise dunning without a
            recovered-revenue cut.
          </p>
        </div>

        <div className="flex flex-col gap-5 md:items-end">
          <div className="flex flex-col gap-4 md:items-end">
            <nav
              aria-label="Company"
              className="flex flex-wrap gap-x-6 gap-y-3 text-xs text-gray-400 md:justify-end"
            >
              {FOOTER_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="transition-colors hover:text-gray-700"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="https://x.com/mathchambaud"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-gray-700"
                aria-label="Follow on X"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.632 5.905-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </nav>
            <nav
              aria-label="Comparisons"
              className="flex max-w-xl flex-wrap gap-x-5 gap-y-2 text-xs text-gray-400 md:justify-end"
            >
              {COMPARISON_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="transition-colors hover:text-gray-700"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
          <span className="text-xs text-gray-400">
            © {new Date().getFullYear()} Dunlo
          </span>
        </div>
      </div>
    </footer>
  );
}
