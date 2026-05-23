import { Logo } from "@/components/logo";
import { FOOTER_SECTIONS } from "@/lib/site-navigation";

export function Footer() {
  return (
    <footer className="border-t border-gray-300/50 bg-stone-100 px-4 py-12">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.45fr]">
        <div className="max-w-sm">
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
          <div className="mt-5 flex items-center gap-2">
            <a
              href="https://x.com/mathchambaud"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex size-8 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-700"
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
            <a
              href="https://www.linkedin.com/company/dunlo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex size-8 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-700"
              aria-label="Follow Dunlo on LinkedIn"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.85-3.037-1.853 0-2.136 1.447-2.136 2.94v5.666H9.354V9h3.414v1.561h.047c.476-.9 1.637-1.85 3.37-1.85 3.602 0 4.267 2.371 4.267 5.455v6.286zM5.337 7.433a2.063 2.063 0 1 1 0-4.126 2.063 2.063 0 0 1 0 4.126zM7.114 20.452H3.56V9h3.554v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
              </svg>
            </a>
          </div>
        </div>

        <div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {FOOTER_SECTIONS.map((section) => (
              <nav key={section.title} aria-label={section.title}>
                <h2 className="text-xs font-semibold text-gray-900">
                  {section.title}
                </h2>
                <ul className="mt-4 space-y-3">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="text-xs leading-5 text-gray-500 transition-colors hover:text-gray-900"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          <div className="mt-9 flex flex-col gap-2 border-t border-gray-300/50 pt-5 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} Dunlo</span>
            <span>Built for Stripe-first SaaS founders.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
