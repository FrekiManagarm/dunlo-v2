import { Logo } from "@/components/logo";

export function Footer() {
  return (
    <footer className="border-t border-gray-300/40 bg-[#e9eaeb] px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-3">
          <Logo size={22} />
          <span className="text-xs text-gray-400">
            Stop losing revenue to failed payments.
          </span>
        </div>
        <div className="flex items-center gap-6 text-xs text-gray-400">
          {["Privacy", "Terms", "Contact"].map((l) => (
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
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.632 5.905-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <span>© {new Date().getFullYear()} Dunlo</span>
        </div>
      </div>
    </footer>
  );
}
