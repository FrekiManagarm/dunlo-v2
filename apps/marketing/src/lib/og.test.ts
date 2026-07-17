import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const repoRoot = resolve(import.meta.dirname, "../../../..");
const ogSource = readFileSync(
  resolve(repoRoot, "apps/marketing/src/lib/og.tsx"),
  "utf8",
);
const homepageOg = readFileSync(
  resolve(repoRoot, "apps/marketing/src/app/opengraph-image.tsx"),
  "utf8",
);

describe("Open Graph design contract", () => {
  test("uses the Dunlo recovery system instead of a simulated dashboard", () => {
    expect(ogSource).toContain("Recovery logic");
    expect(ogSource).toContain("matched path");
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
    expect(ogSource).toContain("breakTechnicalSignal");
    expect(ogSource).toContain('/([._-])/g, "$1\\u200B"');
  });

  test("uses a real Stripe event on the homepage artwork", () => {
    expect(homepageOg).toContain('metricLabel: "Stripe event"');
    expect(homepageOg).toContain('metricValue: "invoice.payment_failed"');
    expect(homepageOg).not.toContain("$2.8k");
  });
});
