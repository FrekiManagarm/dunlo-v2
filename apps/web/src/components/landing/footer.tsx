import { Logo } from "@/components/logo";

const ALTERNATIVE_LINKS = [
  { label: "Triggla", href: "/alternatives/triggla" },
  { label: "Churn Buster", href: "/alternatives/churn-buster" },
  { label: "Paddle Retain", href: "/alternatives/paddle-retain" },
  { label: "Stripe Smart Retries", href: "/alternatives/stripe-smart-retries" },
];

const COMPANY_LINKS = ["Privacy", "Terms", "Contact"];

export function Footer() {
  return (
    <footer className="border-t border-gray-300/40 bg-[#e9eaeb] px-4 py-10">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.25fr_1fr_1fr] md:gap-8">
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

        <nav aria-label="Alternatives">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
            Alternatives
          </p>
          <div className="mt-4 grid gap-2">
            {ALTERNATIVE_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="w-fit text-sm font-medium text-gray-600 transition-colors hover:text-gray-950 active:scale-[0.98]"
              >
                Dunlo vs {link.label}
              </a>
            ))}
          </div>
        </nav>

        <div className="flex flex-col gap-5 md:items-end">
          <nav
            aria-label="Company"
            className="flex flex-wrap gap-x-6 gap-y-3 text-xs text-gray-400 md:justify-end"
          >
            {COMPANY_LINKS.map((l) => (
              <a
                key={l}
                href="#"
                className="transition-colors hover:text-gray-700"
              >
                {l}
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
          <span className="text-xs text-gray-400">
            © {new Date().getFullYear()} Dunlo
          </span>
        </div>
      </div>
    </footer>
  );
}
