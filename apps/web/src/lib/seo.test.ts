import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGE_ALT, ogMeta } from "./seo";

const brandDir = join(process.cwd(), "public", "brand");

function readPngDimensions(path: string) {
  const png = readFileSync(path);

  return {
    width: png.readUInt32BE(16),
    height: png.readUInt32BE(20),
  };
}

describe("social preview metadata", () => {
  test("uses the canonical high-contrast OG image for social cards", () => {
    const tags = ogMeta({
      title: "Dunlo",
      description: "Stripe payment recovery for SaaS.",
    });

    expect(tags).toContainEqual({
      property: "og:image",
      content: "https://dunlo.io/brand/dunlo-og.png",
    });
    expect(tags).toContainEqual({ property: "og:image:width", content: "1200" });
    expect(tags).toContainEqual({ property: "og:image:height", content: "630" });
    expect(tags).toContainEqual({
      name: "twitter:image",
      content: DEFAULT_OG_IMAGE,
    });
    expect(DEFAULT_OG_IMAGE_ALT).toMatch(/failure[- ]reason/i);
  });

  test("ships a 1200x630 OG asset with the failure-reason tagline", () => {
    const pngDimensions = readPngDimensions(join(brandDir, "dunlo-og.png"));
    const svg = readFileSync(join(brandDir, "dunlo-og.svg"), "utf8");

    expect(pngDimensions).toEqual({ width: 1200, height: 630 });
    expect(svg).toContain("Recover failed Stripe payments");
    expect(svg).toContain(
      "with the right email for each failure reason.",
    );
  });
});
