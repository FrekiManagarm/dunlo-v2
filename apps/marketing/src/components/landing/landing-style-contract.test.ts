import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const repoRoot = resolve(import.meta.dirname, "../../../../..");

function read(file: string) {
  return readFileSync(resolve(repoRoot, file), "utf8");
}

const css = read("packages/ui/src/styles/globals.css");
const layout = read("apps/marketing/src/app/layout.tsx");

describe("landing design contract", () => {
  test("preserves the Dunlo identity and accessible foregrounds", () => {
    expect(css).toContain("--dunlo-accent: #00e87b");
    expect(css).toContain("--dunlo-ink:");
    expect(css).toContain("--primary-foreground: var(--dunlo-ink)");
    expect(css).toContain("--dunlo-accent-dim: #006f3d");
    expect(layout).toContain('variable: "--font-app-sans"');
    expect(layout).toContain("outfit-900.woff");
    expect(layout).not.toContain("Geist");
  });

  test("uses product truth rather than synthetic outcome claims", () => {
    const assets = read(
      "apps/marketing/src/components/landing/product-assets.ts",
    );
    const hero = read(
      "apps/marketing/src/components/landing/payment-recovery-hero.tsx",
    );
    const howItWorks = read(
      "apps/marketing/src/components/landing/how-it-works.tsx",
    );
    const escalation = read(
      "apps/marketing/src/components/landing/escalation.tsx",
    );

    expect(hero).toContain("Illustrative diagnostic report");
    expect(hero).toContain("Nothing changes in Stripe.");
    expect(howItWorks).toContain("PRODUCT_IMAGES.sequences");
    expect(escalation).toContain("PRODUCT_IMAGES.escalations");
    expect(`${hero}\n${howItWorks}\n${escalation}`).not.toContain(
      "RECOVERY_EXAMPLES",
    );

    const assetPaths = [...assets.matchAll(/"(\/screenshot_[^"]+\.png)"/g)];
    expect(assetPaths).toHaveLength(3);
    for (const [, publicPath] of assetPaths) {
      expect(
        existsSync(resolve(repoRoot, `apps/marketing/public${publicPath}`)),
      ).toBe(true);
    }
  });

  test("keeps the hero immersive, bounded, and accessible", () => {
    const hero = read(
      "apps/marketing/src/components/landing/payment-recovery-hero.tsx",
    );

    expect(hero).toContain("min-h-[100dvh]");
    expect(hero).toContain("text-[clamp(3rem,5.7vw,5.5rem)]");
    expect(hero).toContain("tracking-[-0.04em]");
    expect(hero).toContain("text-balance");
    expect(hero).toContain("text-pretty");
    expect(hero).toContain('location: "homepage_hero"');
    expect(hero).toContain("focus-visible:ring-2");
  });

  test("maps every Stripe failure to semantic static recovery content", () => {
    const responseMap = read(
      "apps/marketing/src/components/landing/failure-response-map.tsx",
    );

    expect(responseMap).toContain("FAILURE_RESPONSE_CATEGORIES.map");
    expect(responseMap).toContain("<dl");
    expect(responseMap).toContain("{item.response}");
    expect(responseMap).toContain("{item.action}");
    expect(responseMap).not.toContain("<button");
  });

  test("keeps motion transform-only and respects reduced motion", () => {
    expect(css).toContain("@keyframes product-float");
    expect(css).toContain("translate3d");
    expect(css).toMatch(
      /@keyframes product-float\s*\{\s*0%,\s*100%\s*\{\s*transform:\s*translate3d\(0, 0, 0\);\s*\}\s*50%\s*\{\s*transform:\s*translate3d\(0, -8px, 0\);\s*\}\s*\}/,
    );
    expect(css).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.landing-product-float\s*\{\s*animation:\s*none;/,
    );
  });

  test("avoids common generated-landing visual tells", () => {
    const files = [
      "apps/marketing/src/components/landing-page.tsx",
      "apps/marketing/src/components/landing/payment-recovery-hero.tsx",
      "apps/marketing/src/components/landing/failure-response-map.tsx",
      "apps/marketing/src/components/landing/how-it-works.tsx",
      "apps/marketing/src/components/landing/escalation.tsx",
      "apps/marketing/src/components/landing/roi-calculator.tsx",
      "apps/marketing/src/components/landing/pricing.tsx",
    ];
    const source = files.map(read).join("\n");

    expect(source).not.toContain("bg-clip-text");
    expect(source).not.toContain("linear-gradient(to_right");
    expect(source).not.toContain("repeating-linear-gradient");
    expect(source).not.toContain("rounded-[2rem]");
    expect(source).not.toContain("rounded-[2.5rem]");
    expect(source).not.toContain("shadow-[0_40px_100px");
  });

  test("keeps the estimate honest and keyboard accessible", () => {
    const roi = read(
      "apps/marketing/src/components/landing/roi-calculator.tsx",
    );

    expect(roi).toContain("const FAILED_PAYMENT_RATE = 0.05");
    expect(roi).toContain("MODELED_RECOVERY_ASSUMPTION_RATE");
    expect(roi).toContain("MODELED_RECOVERY_ASSUMPTION_PERCENT");
    expect(roi).toContain("RECOVERY_MODEL_UPDATED");
    expect(roi).toContain("Illustrative estimate");
    expect(roi).toContain("not a");
    expect(roi).toContain('type="range"');
    expect(roi).toContain("h-11 w-full");
    expect(roi).toContain("peer-focus-visible:ring-4");
    expect(roi).toContain('location: "homepage_roi_calculator"');
  });

  test("keeps every signup surface tracked", () => {
    const signupSurfaces = [
      ["payment-recovery-hero.tsx", "homepage_hero"],
      ["escalation.tsx", "homepage_founder_review"],
      ["how-it-works.tsx", "homepage_how_it_works"],
      ["roi-calculator.tsx", "homepage_roi_calculator"],
      ["pricing.tsx", "homepage_pricing"],
      ["final-cta.tsx", "homepage_final_cta"],
    ] as const;

    for (const [file, location] of signupSurfaces) {
      const source = read(`apps/marketing/src/components/landing/${file}`);
      expect(source).toContain("SIGNUP_URL");
      expect(source).toContain(`location: "${location}"`);
    }
  });

  test("keeps mobile navigation state-correct", () => {
    const nav = read("apps/marketing/src/components/landing/nav.tsx");

    expect(nav).toContain("<details");
    expect(nav).toContain("group-open:hidden");
    expect(nav).toContain("group-open:inline");
    expect(nav).toContain('event.key !== "Escape"');
    expect(nav).toContain("onClick={closeMobileMenu}");
  });
});
