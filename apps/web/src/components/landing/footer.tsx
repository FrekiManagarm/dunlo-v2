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
          <span>© 2025 Dunlo</span>
        </div>
      </div>
    </footer>
  );
}
