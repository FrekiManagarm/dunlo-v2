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

  test("loads distinct Next font variables for marketing", () => {
    expect(layout).toContain('variable: "--font-geist-sans"');
    expect(layout).toContain('variable: "--font-jetbrains-mono"');
    expect(layout).toContain(
      'className={`${geist.variable} ${jetbrainsMono.variable}`}',
    );
  });

  test("maps Tailwind typography to the generated Next font variables", () => {
    expect(css).toMatch(
      /--font-sans:\s*var\(--font-geist-sans\),\s*ui-sans-serif,\s*system-ui,\s*sans-serif;/,
    );
    expect(css).toMatch(
      /--font-mono:\s*var\(--font-jetbrains-mono\),\s*ui-monospace,\s*monospace;/,
    );
  });

  test("uses Geist instead of Outfit throughout the marketing font stack", () => {
    expect(layout).toContain("Geist");
    expect(`${layout}\n${css}`).not.toContain("Outfit");
  });

  test("removes floating motion and disables landing reveals on request", () => {
    expect(css).not.toContain("landing-float");
    expect(css).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{\s*\.anim-1,\s*\.anim-2,\s*\.anim-3,\s*\.anim-4,\s*\.anim-5,\s*\.anim-6,\s*\.landing-rise\s*\{\s*animation:\s*none;\s*\}\s*\}/s,
    );
  });
});
