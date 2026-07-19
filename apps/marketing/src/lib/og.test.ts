import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const repoRoot = resolve(import.meta.dirname, "../../../..");
const ogSource = readFileSync(
  resolve(repoRoot, "apps/marketing/src/lib/og.tsx"),
  "utf8",
);
describe("Open Graph design contract", () => {
  test("uses a singular Dunlo recovery path instead of a simulated dashboard", () => {
    expect(ogSource).toContain("RecoveryPath");
    expect(ogSource).toContain('accent: "#00E87B"');
    expect(ogSource).toContain('ink: "#07110C"');
    expect(ogSource).not.toContain("ProductPreview");
    expect(ogSource).not.toContain("Hearthline");
    expect(ogSource).not.toContain("RivetDesk");
    expect(ogSource).not.toContain("Northstar Labs");
  });

  test("avoids decorative grid and ghost-card styling", () => {
    expect(ogSource).not.toContain("backgroundImage");
    expect(ogSource).not.toContain("backgroundSize");
    expect(ogSource).not.toContain("linear-gradient");
    expect(ogSource).not.toContain("boxShadow");
    expect(ogSource).not.toContain("borderRadius: 34");
  });

  test("keeps typography bounded and on brand", () => {
    expect(ogSource).toContain("outfit-${weight}.woff");
    expect(ogSource).toContain("if (title.length > 82) return 48");
    expect(ogSource).toContain("return 66");
    expect(ogSource).toContain("lineHeight: 0.94");
    expect(ogSource).toContain("letterSpacing: -2.1");
  });

  test("keeps the green panel purely visual and the logo singular", () => {
    expect(ogSource.match(/<LogoMark \/>/g)).toHaveLength(1);
    expect(ogSource).not.toContain("metricLabel");
    expect(ogSource).not.toContain("metricValue");
    expect(ogSource).not.toContain("Recovery logic");
    expect(ogSource).not.toContain("matched path");
  });
});
