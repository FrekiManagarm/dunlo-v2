import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const repoRoot = resolve(import.meta.dirname, "../../../../..");
const css = readFileSync(
  resolve(repoRoot, "packages/ui/src/styles/globals.css"),
  "utf8",
);
const layout = readFileSync(
  resolve(repoRoot, "apps/marketing/src/app/layout.tsx"),
  "utf8",
);
const webRoot = readFileSync(
  resolve(repoRoot, "apps/web/src/routes/__root.tsx"),
  "utf8",
);

describe("landing style contract", () => {
  test("uses an accessible foreground on bright Dunlo green", () => {
    expect(css).toContain("--dunlo-ink:");
    expect(css).toContain("--primary-foreground: var(--dunlo-ink)");
    expect(css).toContain("--accent-foreground: var(--dunlo-ink)");
    expect(css).toContain("--sidebar-primary-foreground: var(--dunlo-ink)");
  });

  test("uses an accessible green for links on white", () => {
    expect(css).toContain("--dunlo-accent-dim: #006f3d");
  });

  test("loads app-neutral Next font variables for marketing", () => {
    expect(layout).toContain('variable: "--font-app-sans"');
    expect(layout).toContain('variable: "--font-app-mono"');
    expect(layout).toContain(
      'className={`${geist.variable} ${jetbrainsMono.variable}`}',
    );
  });

  test("maps Tailwind typography to app fonts with shared fallbacks", () => {
    expect(css).toMatch(
      /--font-sans:\s*var\(--font-app-sans,\s*"Outfit"\),\s*ui-sans-serif,\s*system-ui,\s*sans-serif;/,
    );
    expect(css).toMatch(
      /--font-mono:\s*var\(--font-app-mono,\s*"JetBrains Mono"\),\s*ui-monospace,\s*monospace;/,
    );
  });

  test("uses Geist instead of Outfit in the marketing layout", () => {
    expect(layout).toContain("Geist");
    expect(layout).not.toContain("Outfit");
  });

  test("keeps the web app fonts available to shared CSS fallbacks", () => {
    expect(webRoot).toContain("family=Outfit");
    expect(webRoot).toContain("family=JetBrains+Mono");
  });

  test("removes floating motion and disables landing reveals on request", () => {
    expect(css).not.toContain("landing-float");
    expect(css).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{\s*\.anim-1,\s*\.anim-2,\s*\.anim-3,\s*\.anim-4,\s*\.anim-5,\s*\.anim-6,\s*\.landing-rise\s*\{\s*animation:\s*none;\s*\}\s*\}/s,
    );
  });
});
