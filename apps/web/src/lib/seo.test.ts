import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGE_ALT, SITE_URL, ogMeta } from "./seo";

const publicDir = join(process.cwd(), "public");
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
      content: "https://dunlo.io/brand/dunlo-og-v2.png",
    });
    expect(tags).toContainEqual({
      property: "og:image:type",
      content: "image/png",
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
    const pngDimensions = readPngDimensions(join(brandDir, "dunlo-og-v2.png"));
    const svg = readFileSync(join(brandDir, "dunlo-og-v2.svg"), "utf8");

    expect(pngDimensions).toEqual({ width: 1200, height: 630 });
    expect(svg).toContain("Recover failed Stripe payments");
    expect(svg).toContain(
      "with the right email for each failure reason.",
    );
  });
});

describe("AI-readable SEO files", () => {
  test("publishes an llms.txt product overview", () => {
    const llms = readFileSync(join(publicDir, "llms.txt"), "utf8");

    expect(llms).toContain("# Dunlo");
    expect(llms).toContain("Stripe payment recovery SaaS");
    expect(llms).toContain(`${SITE_URL}/pricing.md`);
    expect(llms).toContain("hello@dunlo.io");
  });

  test("publishes machine-readable pricing", () => {
    const pricing = readFileSync(join(publicDir, "pricing.md"), "utf8");

    expect(pricing).toContain("# Pricing - Dunlo");
    expect(pricing).toContain("## Solo");
    expect(pricing).toContain("Price: $19/month");
    expect(pricing).toContain("## Scale");
    expect(pricing).toContain("Revenue share: none");
  });

  test("includes machine-readable files in the sitemap", () => {
    const sitemap = readFileSync(join(publicDir, "sitemap.xml"), "utf8");

    expect(sitemap).toContain(`<loc>${SITE_URL}/llms.txt</loc>`);
    expect(sitemap).toContain(`<loc>${SITE_URL}/pricing.md</loc>`);
  });
});
