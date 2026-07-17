import { existsSync, readFileSync } from "node:fs";
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

function readOptionalSource(file: string) {
  const path = resolve(repoRoot, file);
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

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

  test("keeps the hero static preview honest and non-interactive", () => {
    const hero = readFileSync(
      resolve(
        repoRoot,
        "apps/marketing/src/components/landing/payment-recovery-hero.tsx",
      ),
      "utf8",
    );

    expect(hero).toContain("Recover failed payments without losing customer trust.");
    expect(hero).toContain("Example data");
    expect(hero).not.toContain("<button");
    expect(hero).not.toContain("<Button");
    expect(hero).not.toContain("<input");
    expect(hero).not.toContain("<select");
    expect(hero).not.toContain("<textarea");
    expect(hero).not.toMatch(/role\s*=\s*(["'])button\1/);
  });

  test("keeps trust links visibly focused and closes responsive borders", () => {
    const trustStrip = readFileSync(
      resolve(
        repoRoot,
        "apps/marketing/src/components/landing/trust-strip.tsx",
      ),
      "utf8",
    );

    expect(trustStrip).toContain("focus-visible:outline-none");
    expect(trustStrip).toContain("focus-visible:ring-2");
    expect(trustStrip).toContain("focus-visible:ring-inset");
    expect(trustStrip).toContain("focus-visible:ring-dunlo-deep");
    expect(trustStrip).toContain("sm:last:border-r-0");
    expect(trustStrip).toContain("ArrowUpRight");
    expect(trustStrip).toContain("group-hover:translate-x-0.5");
  });

  test("does not render inert escalation buttons", () => {
    const escalation = readFileSync(
      resolve(
        repoRoot,
        "apps/marketing/src/components/landing/escalation.tsx",
      ),
      "utf8",
    );

    expect(escalation).not.toMatch(/<button[^>]*>\s*(Review|Regenerate|Send)/);
    expect(escalation).toContain("Example product preview");
    expect(escalation).not.toContain('"use client"');
    expect(escalation).not.toContain("<button");
    expect(escalation).not.toContain("<Button");
    expect(escalation).not.toMatch(/role\s*=\s*(["'])button\1/);
    expect(escalation).not.toContain("setInterval");
    expect(escalation).toContain('location: "homepage_founder_review"');
    expect(escalation).toContain("href={SIGNUP_URL}");
    expect(escalation).toContain("destination: SIGNUP_URL");
  });

  test("keeps the founder review preview readable and its CTA focused", () => {
    const escalation = readFileSync(
      resolve(
        repoRoot,
        "apps/marketing/src/components/landing/escalation.tsx",
      ),
      "utf8",
    );

    expect(escalation).toMatch(
      /<dd className="(?=[^"]*\bmin-w-0\b)(?=[^"]*(?:\bbreak-all\b|\[overflow-wrap:anywhere\]))[^"]*">\s*authentication_required\s*<\/dd>/s,
    );
    expect(escalation).toContain(
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-dunlo-ink",
    );
  });

  test("presents recovery actions as semantic static content", () => {
    const failureResponseMap = readFileSync(
      resolve(
        repoRoot,
        "apps/marketing/src/components/landing/failure-response-map.tsx",
      ),
      "utf8",
    );

    expect(failureResponseMap).toContain(
      'import { FAILURE_RESPONSE_CATEGORIES } from "./landing-content";',
    );
    expect(failureResponseMap).toContain("FAILURE_RESPONSE_CATEGORIES.map");
    expect(failureResponseMap).toContain("Example response logic");
    expect(failureResponseMap).toContain("md:grid-cols-2");
    expect(failureResponseMap).toMatch(
      /<dl[^>]*>.*<dt[^>]*>\s*Response\s*<\/dt>.*<dd[^>]*>\s*\{item\.response\}\s*<\/dd>.*<dt[^>]*>\s*Next step\s*<\/dt>.*<dd[^>]*>\s*\{item\.action\}\s*<\/dd>.*<\/dl>/s,
    );
    expect(failureResponseMap).not.toContain("RECOVERY_EXAMPLES");
    expect(failureResponseMap).not.toContain("item.status");
    expect(failureResponseMap).not.toContain("rounded-full bg-dunlo");
  });

  test("keeps setup user-controlled and ROI CTA accurate", () => {
    const howItWorks = readFileSync(
      resolve(
        repoRoot,
        "apps/marketing/src/components/landing/how-it-works.tsx",
      ),
      "utf8",
    );
    const roi = readFileSync(
      resolve(
        repoRoot,
        "apps/marketing/src/components/landing/roi-calculator.tsx",
      ),
      "utf8",
    );

    expect(howItWorks).not.toContain("setInterval");
    expect(howItWorks).toContain("aria-pressed={isActive}");
    expect(howItWorks).toContain(
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dunlo-deep focus-visible:ring-offset-2 focus-visible:ring-offset-white",
    );
    expect(roi).not.toContain("STARTER_PRICE");
    expect(roi).not.toContain("30-day ROI");
    expect(roi).not.toMatch(/\bconst roi\s*=/);
    expect(roi).not.toContain("payback window");
    expect(roi).toMatch(/>\s*Recovery estimate\s*<\/p>/);
    expect(roi).not.toMatch(/>\s*ROI calculator\s*<\/p>/);
    expect(roi).toContain("const FAILED_PAYMENT_RATE = 0.05");
    expect(roi).toContain(
      'import { RECOVERABILITY_RATE, RECOVERABILITY_PERCENT, RECOVERY_MODEL_UPDATED } from "@/lib/recovery-assumptions";',
    );
    expect(roi).toContain(
      "Math.round(monthlyFailed * RECOVERABILITY_RATE)",
    );
    expect(roi).toContain("Estimated recoverable this month");
    expect(roi).toMatch(
      /label: "Recoverability assumption",\s*value: RECOVERABILITY_PERCENT,/,
    );
    expect(roi).toContain("Illustrative estimate");
    expect(roi).toContain("5%");
    expect(roi).toContain("RECOVERABILITY_PERCENT");
    expect(roi).toContain("RECOVERY_MODEL_UPDATED");
    expect(roi).not.toContain("63%");
    expect(roi).toMatch(/not\s*\n?\s*a benchmark result/);
    expect(roi).toContain("Start measuring failed payments");
    expect(roi).toContain('href="/benchmark"');
    expect(roi).toContain("Explore the public benchmark");
    expect(roi).not.toContain("Review the benchmark methodology");
    expect(roi).toContain("peer-focus-visible:ring-dunlo-deep");
    expect(roi).toContain("peer-focus-visible:ring-offset-2");
    expect(roi).toContain("peer-focus-visible:ring-offset-white");
    expect(roi).not.toContain("peer-focus-visible:ring-dunlo/20");
    expect(
      roi.match(
        /focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dunlo-deep focus-visible:ring-offset-2 focus-visible:ring-offset-white/g,
      ),
    ).toHaveLength(2);
    expect(roi).toContain("href={SIGNUP_URL}");
    expect(roi).toContain("destination: SIGNUP_URL");
    expect(roi).toContain('location: "homepage_roi_calculator"');
    expect(roi).toMatch(
      /<div className="bg-stone-50 p-4 md:p-7">\s*<div className="rounded-xl border border-gray-200 bg-white p-4 md:p-5">/,
    );
    expect(roi).toContain("useReducedMotion");
    expect(roi).toContain("shouldReduceMotion");
    expect(roi).not.toContain("font-mono");
  });

  test("centralizes the homepage recovery assumption at 62%", () => {
    const assumptions = readOptionalSource(
      "apps/marketing/src/lib/recovery-assumptions.ts",
    );
    const roi = readFileSync(
      resolve(
        repoRoot,
        "apps/marketing/src/components/landing/roi-calculator.tsx",
      ),
      "utf8",
    );
    const proof = readFileSync(
      resolve(repoRoot, "apps/marketing/src/components/public-proof-layer.tsx"),
      "utf8",
    );

    expect(assumptions).toContain(
      "export const RECOVERABILITY_RATE = 0.62",
    );
    expect(assumptions).toContain(
      "export const RECOVERABILITY_PERCENT = `${Math.round(RECOVERABILITY_RATE * 100)}%`",
    );
    expect(assumptions).toContain(
      'export const RECOVERY_MODEL_UPDATED = "July 2026"',
    );
    expect(roi).toContain("RECOVERABILITY_RATE");
    expect(proof).toContain("RECOVERABILITY_PERCENT");
    expect(`${roi}\n${proof}`).not.toContain("63%");
  });

  test("publishes verifiable beta proof without synthetic testimonials", () => {
    const proof = readFileSync(
      resolve(
        repoRoot,
        "apps/marketing/src/components/public-proof-layer.tsx",
      ),
      "utf8",
    );

    expect(proof).toContain("What can be verified today");
    expect(proof).not.toContain("No anonymous uplift claims");
    expect(proof).not.toContain("No synthetic logos");
    expect(proof).not.toMatch(/No unapproved\s+customer stories/);
    expect(proof).toMatch(
      /During beta, customer outcomes are published only with approval and\s+enough context to be useful\./,
    );
    expect(proof).toContain("RECOVERABILITY_PERCENT");
    expect(proof).toContain("RECOVERY_MODEL_UPDATED");
    expect(proof).toContain('cta: "Inspect the public model"');
    expect(proof).toContain(
      "Failure reasons, recovery timing, customer update links, and founder review are documented before signup.",
    );
    expect(proof).not.toContain("Stripe-hosted update links");
    expect(proof).toContain("/state-of-stripe-payments-2026");
    expect(proof).toMatch(
      /type PublicProofLayerProps\s*=\s*\{\s*compact\?\s*:\s*boolean;?\s*\}/s,
    );
    expect(proof).toMatch(
      /export function PublicProofLayer\s*\(\s*\{\s*compact\s*=\s*false\s*\}\s*:\s*PublicProofLayerProps\s*\)/s,
    );
    expect(proof).toMatch(/className=\{\s*compact\s*\?/s);
    expect(
      [...proof.matchAll(/href:\s*"([^"]+)"/g)].map((match) => match[1]),
    ).toEqual([
      "/benchmark",
      "/stripe-failed-payments",
      "/state-of-stripe-payments-2026",
    ]);
    expect(proof).not.toMatch(/^import\s+.*testimonial.*$/im);
    expect(proof).toMatch(
      /<Link\s+href=\{item\.href\}\s+className="[^"]*focus-visible:outline-none[^"]*focus-visible:ring-2[^"]*focus-visible:ring-dunlo-deep[^"]*focus-visible:ring-offset-2[^"]*"/s,
    );
    expect(proof).toMatch(
      /<div className="(?=[^"]*\bborder-b\b)(?=[^"]*\bborder-dunlo-line\b)(?=[^"]*\blg:border-b-0\b)(?=[^"]*\blg:border-r\b)[^"]*">/,
    );
  });

  test("labels public benchmark rates as product modelling assumptions", () => {
    const benchmark = readFileSync(
      resolve(
        repoRoot,
        "apps/marketing/src/components/public-benchmark.tsx",
      ),
      "utf8",
    );

    expect(benchmark).toContain(
      "Illustrative modelled failed-payment rate for",
    );
    expect(benchmark).not.toContain("Average failed payment rate");
    expect(benchmark).toContain(
      "The model increases assumed failed-payment rates as MRR grows.",
    );
    expect(benchmark).toContain(
      "Modelled failed-payment rates by MRR band are 4.2%, 5.1%, 5.8%, and 6.4%; they are illustrative product assumptions, not measured averages.",
    );
    expect(benchmark).toContain(
      'import { RECOVERABILITY_RATE, RECOVERABILITY_PERCENT } from "@/lib/recovery-assumptions";',
    );
    expect(benchmark).not.toContain("BASE_RECOVERY_RATE");
    expect(benchmark).toContain("failedMrr * RECOVERABILITY_RATE");
    expect(benchmark).toContain(
      "Recovery potential applies a ${RECOVERABILITY_PERCENT} recoverability assumption",
    );
    expect(benchmark).toContain("product modelling assumptions");
  });

  test("keeps founder accountability real and visibly focused", () => {
    const founder = readFileSync(
      resolve(
        repoRoot,
        "apps/marketing/src/components/landing/built-by-mathieu.tsx",
      ),
      "utf8",
    );

    expect(founder).toContain(
      'const X_PROFILE_URL = "https://x.com/mathchambaud"',
    );
    expect(founder).toContain(
      'const FOUNDER_IMAGE_URL = "/founder/mathieu-chambaud-linkedin.jpg"',
    );
    expect(founder).toContain("Built and supported by Mathieu Chambaud");
    expect(founder).toContain(
      "A founder-led beta with a public standard for proof.",
    );
    expect(founder).toContain("Beta feedback goes directly to me.");
    expect(founder).toContain('alt="Mathieu Chambaud, founder of Dunlo"');
    expect(founder).toContain('id="founder"');
    expect(founder).toMatch(
      /<section\s+id="founder"\s+className="[^"]*\bscroll-mt-24\b[^"]*"/s,
    );
    expect(founder).toContain("href={X_PROFILE_URL}");
    expect(founder).toContain("Follow @mathchambaud");
    expect(founder).toContain(
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dunlo-deep focus-visible:ring-offset-2",
    );
    expect(founder).not.toContain("FadeIn");
    expect(founder).not.toContain("rounded-3xl");
    expect(founder).not.toMatch(/^import\s+.*testimonial.*$/im);
  });

  test("removes decorative grids and oversized card radii from the landing composition", () => {
    const files = [
      "apps/marketing/src/components/landing-page.tsx",
      "apps/marketing/src/components/landing/payment-recovery-hero.tsx",
      "apps/marketing/src/components/landing/escalation.tsx",
      "apps/marketing/src/components/landing/how-it-works.tsx",
      "apps/marketing/src/components/landing/roi-calculator.tsx",
    ];
    const source = files
      .map((file) => readFileSync(resolve(repoRoot, file), "utf8"))
      .join("\n");

    expect(source).not.toContain("linear-gradient(to_right");
    expect(source).not.toContain("rounded-[2rem]");
    expect(source).not.toContain("shadow-[0_40px_100px");
  });

  test("composes the landing sections in the customer-trust narrative order", () => {
    const landingPage = readFileSync(
      resolve(repoRoot, "apps/marketing/src/components/landing-page.tsx"),
      "utf8",
    );
    const sections = [
      "<PaymentRecoveryHero />",
      "<TrustStrip />",
      "<FailureResponseMap />",
      "<Escalation />",
      "<HowItWorks />",
      "<RoiCalculator />",
      "<PublicProofLayer />",
      "<BuiltByMathieu />",
      "<Pricing />",
      "<Faq />",
      "<ResourceLibrary />",
      "<FinalCta />",
    ];
    const positions = sections.map((section) => landingPage.indexOf(section));

    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(landingPage).toContain("bg-dunlo-ground");
    expect(landingPage).not.toContain("{/*");
    expect(landingPage).not.toMatch(
      /\b(?:recoveredEvents|signalCards|recoveryPaths|founderStats|resourceLinks|faqItems)\b/,
    );
    expect(landingPage).not.toMatch(
      /function (?:HeroSection|RestoredSection|RecoveryDesk|ResourceLinksSection|FeaturesSection|PricingSection|FaqSection|FinalCta|GridBackdrop)\b/,
    );
    expect(landingPage).not.toContain("BetaTestimonialsSection");
    expect(landingPage).toContain(
      'import { FailureResponseMap } from "@/components/landing/failure-response-map";',
    );
  });

  test("uses shared pricing, FAQ, and resource content in extracted sections", () => {
    const pricing = readOptionalSource(
      "apps/marketing/src/components/landing/pricing.tsx",
    );
    const faq = readOptionalSource(
      "apps/marketing/src/components/landing/faq.tsx",
    );
    const resources = readOptionalSource(
      "apps/marketing/src/components/landing/resource-library.tsx",
    );

    expect(pricing).toContain(
      'import { PRICING_FEATURES } from "./landing-content";',
    );
    expect(pricing).toContain("PRICING_FEATURES.map");
    expect(faq).toContain('import { FAQ_ITEMS } from "./landing-content";');
    expect(faq).toContain("FAQ_ITEMS.map");
    expect(resources).toContain(
      'import { RESOURCE_LINKS } from "./landing-content";',
    );
    expect(resources).toContain("RESOURCE_LINKS.map");
    expect(resources).toContain('href="/blog"');
    expect(resources).toContain("last:border-b-0");
    expect(resources).toContain("md:[&:nth-last-child(-n+2)]:border-b-0");
    expect(pricing).not.toMatch(/const\s+PRICING_FEATURES\s*=/);
    expect(faq).not.toMatch(/const\s+FAQ_ITEMS\s*=/);
    expect(resources).not.toMatch(/const\s+RESOURCE_LINKS\s*=/);
  });

  test("keeps conversion destinations and analytics accurate", () => {
    const pricing = readOptionalSource(
      "apps/marketing/src/components/landing/pricing.tsx",
    );
    const finalCta = readOptionalSource(
      "apps/marketing/src/components/landing/final-cta.tsx",
    );

    for (const [source, location] of [
      [pricing, "homepage_pricing"],
      [finalCta, "homepage_final_cta"],
    ]) {
      expect(source).toContain("href={SIGNUP_URL}");
      expect(source).toContain('button_text: "Start free in beta"');
      expect(source).toContain("destination: SIGNUP_URL");
      expect(source).toContain(`location: "${location}"`);
    }
  });

  test("gives every extracted interactive element an explicit focus treatment", () => {
    const pricing = readOptionalSource(
      "apps/marketing/src/components/landing/pricing.tsx",
    );
    const faq = readOptionalSource(
      "apps/marketing/src/components/landing/faq.tsx",
    );
    const resources = readOptionalSource(
      "apps/marketing/src/components/landing/resource-library.tsx",
    );
    const finalCta = readOptionalSource(
      "apps/marketing/src/components/landing/final-cta.tsx",
    );

    expect(pricing).toMatch(
      /<TrackedLink[\s\S]*?className="[^"]*focus-visible:outline-none[^"]*focus-visible:ring-2[^"]*"/,
    );
    expect(faq).toMatch(
      /<summary className="[^"]*focus-visible:outline-none[^"]*focus-visible:ring-2[^"]*"/,
    );
    expect(
      resources.match(
        /<Link[\s\S]*?className="[^"]*focus-visible:outline-none[^"]*focus-visible:ring-2[^"]*"/g,
      ),
    ).toHaveLength(2);
    expect(finalCta).toMatch(
      /<TrackedLink[\s\S]*?className="[^"]*focus-visible:outline-none[^"]*focus-visible:ring-2[^"]*"/,
    );
  });

  test("keeps the range and footer controls touchable with strong focus treatment", () => {
    const roi = readFileSync(
      resolve(
        repoRoot,
        "apps/marketing/src/components/landing/roi-calculator.tsx",
      ),
      "utf8",
    );
    const footer = readFileSync(
      resolve(repoRoot, "apps/marketing/src/components/landing/footer.tsx"),
      "utf8",
    );

    const rangeInput = roi
      .match(/<input\b[\s\S]*?\/>/g)
      ?.find((element) => element.includes('id="mrr-slider"'));
    const rangeThumb = roi.match(
      /<div\b(?=[^>]*className="[^"]*\bpointer-events-none\b)[\s\S]*?\/>/,
    )?.[0];
    const footerLinks = footer.match(/<a\b[\s\S]*?>/g) ?? [];
    const socialLinks = footerLinks.filter((element) =>
      element.includes("aria-label="),
    );
    const navigationLink = footerLinks.find((element) =>
      element.includes("href={link.href}"),
    );

    expect(rangeInput).toBeDefined();
    expect(rangeInput).toMatch(
      /className="(?=[^"]*\bpeer\b)(?=[^"]*\bh-11\b)(?=[^"]*\bw-full\b)[^"]*"/,
    );
    expect(rangeThumb).toBeDefined();
    expect(rangeThumb).toMatch(
      /className="(?=[^"]*\bpeer-focus-visible:ring-4\b)(?=[^"]*\bpeer-focus-visible:ring-dunlo-deep\b)(?=[^"]*\bpeer-focus-visible:ring-offset-2\b)(?=[^"]*\bpeer-focus-visible:ring-offset-white\b)[^"]*"/,
    );
    expect(socialLinks).toHaveLength(2);
    for (const socialLink of socialLinks) {
      expect(socialLink).toMatch(
        /className="(?=[^"]*\bsize-11\b)(?=[^"]*\bfocus-visible:outline-none\b)(?=[^"]*\bfocus-visible:ring-2\b)(?=[^"]*\bfocus-visible:ring-dunlo-deep\b)(?=[^"]*\bfocus-visible:ring-offset-2\b)(?=[^"]*\bfocus-visible:ring-offset-stone-100\b)[^"]*"/,
      );
    }
    expect(navigationLink).toBeDefined();
    expect(navigationLink).toMatch(
      /className="(?=[^"]*\bfocus-visible:outline-none\b)(?=[^"]*\bfocus-visible:ring-2\b)(?=[^"]*\bfocus-visible:ring-dunlo-deep\b)(?=[^"]*\bfocus-visible:ring-offset-2\b)(?=[^"]*\bfocus-visible:ring-offset-stone-100\b)[^"]*"/,
    );
    expect(footer).not.toMatch(/\btext-gray-(?:400|500)\b/);
  });

  test("keeps the mobile navigation control state-correct", () => {
    const nav = readFileSync(
      resolve(repoRoot, "apps/marketing/src/components/landing/nav.tsx"),
      "utf8",
    );

    expect(nav).toContain("ChevronRight, Menu, X");
    expect(nav).toMatch(/<details[\s\S]*?className="[^"]*\bgroup\b[^"]*"/);
    expect(nav).toContain('className="group-open:hidden"');
    expect(nav).toContain(">Open navigation</span>");
    expect(nav).toContain('className="hidden group-open:inline"');
    expect(nav).toMatch(/>\s*Close navigation\s*<\/span>/);
    expect(nav).toContain(
      '<Menu className="group-open:hidden" size={20} aria-hidden />',
    );
    expect(nav).toContain(
      '<X className="hidden group-open:block" size={20} aria-hidden />',
    );
    expect(nav).toContain('event.key !== "Escape"');
    expect(nav).toContain("onClick={closeMobileMenu}");
    expect(nav).toMatch(
      /<div className="flex items-center gap-2 md:hidden">[\s\S]*?<Link[\s\S]*?href=\{SIGNUP_URL\}[\s\S]*?className="[^"]*\bmin-h-11\b[^"]*\bfocus-visible:ring-2\b[^"]*"[\s\S]*?>\s*Start free\s*<\/Link>[\s\S]*?<details/,
    );
    const mobileMenu = nav.slice(nav.indexOf('aria-label="Mobile primary"'));
    expect(mobileMenu).not.toContain("href={SIGNUP_URL}");
  });

  test("documents resources as the prelude to the actual final CTA", () => {
    const spec = readFileSync(
      resolve(
        repoRoot,
        "docs/superpowers/specs/2026-07-17-customer-trust-landing-redesign-design.md",
      ),
      "utf8",
    );
    const plan = readFileSync(
      resolve(
        repoRoot,
        "docs/superpowers/plans/2026-07-17-customer-trust-landing-redesign.md",
      ),
      "utf8",
    );
    const decision =
      "Resources appear immediately before the final CTA so signup is the homepage's actual ending before the footer.";

    expect(spec).toContain(decision);
    expect(plan).toContain(decision);
  });

  test("keeps footer navigation live and small text contrast-safe", () => {
    const navigation = readFileSync(
      resolve(repoRoot, "apps/marketing/src/lib/site-navigation.ts"),
      "utf8",
    );
    const footer = readFileSync(
      resolve(repoRoot, "apps/marketing/src/components/landing/footer.tsx"),
      "utf8",
    );

    expect(navigation).toContain(
      '{ label: "How it works", href: "/#how-it-works" }',
    );
    expect(navigation).not.toContain(
      '{ label: "Features", href: "/#features" }',
    );
    expect(footer).not.toMatch(/\btext-gray-(?:400|500)\b/);
  });

  test("labels the setup workflow as synthetic without invented revenue", () => {
    const howItWorks = readFileSync(
      resolve(
        repoRoot,
        "apps/marketing/src/components/landing/how-it-works.tsx",
      ),
      "utf8",
    );

    expect(howItWorks).toContain("Example product preview");
    expect(howItWorks).toMatch(/>\s*Example\s*</);
    expect(howItWorks).not.toMatch(/>\s*live\s*</i);
    expect(howItWorks).not.toContain("$500+");
    expect(howItWorks).not.toContain("$956");
  });

  test("removes tracked uppercase styling from four named marketing labels", () => {
    const howItWorks = readFileSync(
      resolve(
        repoRoot,
        "apps/marketing/src/components/landing/how-it-works.tsx",
      ),
      "utf8",
    );
    const roi = readFileSync(
      resolve(
        repoRoot,
        "apps/marketing/src/components/landing/roi-calculator.tsx",
      ),
      "utf8",
    );

    const labels = [
      [howItWorks, "How it works"],
      [howItWorks, "Example product preview"],
      [roi, "Recovery estimate"],
      [roi, "30-day estimate"],
    ] as const;

    for (const [source, label] of labels) {
      const paragraph = source.match(
        new RegExp(`<p\\b[^>]*>\\s*${label}\\s*<\\/p>`),
      )?.[0];

      expect(paragraph).toBeDefined();
      expect(paragraph).not.toMatch(/\buppercase\b|\btracking-/);
    }
  });

  test("tracks the setup workflow signup CTA", () => {
    const howItWorks = readFileSync(
      resolve(
        repoRoot,
        "apps/marketing/src/components/landing/how-it-works.tsx",
      ),
      "utf8",
    );

    expect(howItWorks).toContain(
      'import { TrackedLink } from "@/components/tracked-link";',
    );
    expect(howItWorks).toContain("<TrackedLink");
    expect(howItWorks).toContain("href={SIGNUP_URL}");
    expect(howItWorks).toContain('button_text: "Start free in beta"');
    expect(howItWorks).toContain("destination: SIGNUP_URL");
    expect(howItWorks).toContain('location: "homepage_how_it_works"');
  });

  test("respects reduced motion in the setup workflow heading", () => {
    const howItWorks = readFileSync(
      resolve(
        repoRoot,
        "apps/marketing/src/components/landing/how-it-works.tsx",
      ),
      "utf8",
    );

    expect(howItWorks).toContain("useReducedMotion");
    expect(howItWorks).toContain(
      "const shouldReduceMotion = useReducedMotion();",
    );
    expect(howItWorks).toContain(
      "initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}",
    );
    expect(howItWorks).toContain(
      "exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}",
    );
    expect(howItWorks).toContain(
      "duration: shouldReduceMotion ? 0 : 0.28",
    );
  });

  test("closes trust-strip borders at tablet and desktop breakpoints", () => {
    const trustStrip = readFileSync(
      resolve(
        repoRoot,
        "apps/marketing/src/components/landing/trust-strip.tsx",
      ),
      "utf8",
    );

    expect(trustStrip).toContain(
      "sm:[&:nth-last-child(-n+2)]:border-b-0",
    );
    expect(trustStrip).toContain("sm:last:border-r-0");
  });

  test("uses div layout wrappers around section components", () => {
    const landingPage = readFileSync(
      resolve(repoRoot, "apps/marketing/src/components/landing-page.tsx"),
      "utf8",
    );

    for (const component of ["Escalation", "HowItWorks", "RoiCalculator"]) {
      expect(landingPage).toMatch(
        new RegExp(
          `<div className="px-4 py-8 md:px-6 md:py-14">\\s*<div className="mx-auto max-w-7xl">\\s*<${component} />`,
        ),
      );
    }
    expect(landingPage).toMatch(
      /<div className="px-4 md:px-6">\s*<BuiltByMathieu \/>\s*<\/div>/,
    );
    expect(landingPage).not.toMatch(
      /<section className="px-4 (?:py-8 md:px-6 md:py-14|md:px-6)">/,
    );
  });

  test("gives conversion CTAs explicit transition and hover feedback", () => {
    const pricing = readFileSync(
      resolve(repoRoot, "apps/marketing/src/components/landing/pricing.tsx"),
      "utf8",
    );
    const finalCta = readFileSync(
      resolve(repoRoot, "apps/marketing/src/components/landing/final-cta.tsx"),
      "utf8",
    );

    expect(pricing).toContain("transition-colors hover:bg-dunlo-hover");
    expect(finalCta).toContain("transition-colors hover:bg-gray-800");
  });

  test("tracks every composed signup surface with a stable location", () => {
    const signupSurfaces = [
      ["payment-recovery-hero.tsx", "homepage_hero"],
      ["escalation.tsx", "homepage_founder_review"],
      ["how-it-works.tsx", "homepage_how_it_works"],
      ["roi-calculator.tsx", "homepage_roi_calculator"],
      ["pricing.tsx", "homepage_pricing"],
      ["final-cta.tsx", "homepage_final_cta"],
    ] as const;

    for (const [file, location] of signupSurfaces) {
      const source = readFileSync(
        resolve(repoRoot, `apps/marketing/src/components/landing/${file}`),
        "utf8",
      );
      const signupElement = source.match(
        /<(TrackedLink|Link)\b[\s\S]*?href=\{SIGNUP_URL\}[\s\S]*?>/,
      );
      const usesTrackedLink = signupElement?.[1] === "TrackedLink";
      const capturesClick = source.includes("captureMarketingEvent(");

      expect(signupElement).not.toBeNull();
      expect(usesTrackedLink || capturesClick).toBe(true);
      expect(source).toContain("destination: SIGNUP_URL");
      expect(source).toContain(`location: "${location}"`);
    }
  });
});
