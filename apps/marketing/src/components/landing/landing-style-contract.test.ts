import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const repoRoot = resolve(import.meta.dirname, "../../../../..");

describe("landing style contract", () => {
  test("uses an accessible foreground on bright Dunlo green", () => {
    const css = readFileSync(
      resolve(repoRoot, "packages/ui/src/styles/globals.css"),
      "utf8",
    );

    expect(css).toContain("--dunlo-ink:");
    expect(css).toContain("--primary-foreground: var(--dunlo-ink)");
    expect(css).toContain("--accent-foreground: var(--dunlo-ink)");
  });

  test("loads Geist instead of Outfit for marketing", () => {
    const layout = readFileSync(
      resolve(repoRoot, "apps/marketing/src/app/layout.tsx"),
      "utf8",
    );

    expect(layout).toContain("Geist");
    expect(layout).not.toContain("Outfit");
  });
});
