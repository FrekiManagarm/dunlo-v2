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

    expect(failureResponseMap).toMatch(
      /<dl[^>]*>.*<dt[^>]*>\s*Next action\s*<\/dt>.*<dd[^>]*>\s*\{item\.action\}\s*<\/dd>.*<\/dl>/s,
    );
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
    expect(roi).toContain("const RECOVERABLE_RATE = 0.63");
    expect(roi).toContain("Estimated recoverable this month");
    expect(roi).toMatch(
      /label: "Recoverability assumption",\s*value: "63%",/,
    );
    expect(roi).toContain("Illustrative estimate");
    expect(roi).toContain("5%");
    expect(roi).toContain("63%");
    expect(roi).toContain("not a benchmark result");
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
    expect(proof).toContain("No anonymous uplift claims");
    expect(proof).toContain("No synthetic logos");
    expect(proof).toMatch(/No unapproved\s+customer stories/);
    expect(proof).toContain(
      "The public benchmark exposes the illustrative failed-payment bands and 62% recoverability assumption used in its model.",
    );
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
      "Recovery potential applies a 62% recoverability assumption",
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
    expect(founder).toContain("href={X_PROFILE_URL}");
    expect(founder).toContain("Follow @mathchambaud");
    expect(founder).toContain(
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dunlo-deep focus-visible:ring-offset-2",
    );
    expect(founder).not.toContain("FadeIn");
    expect(founder).not.toContain("rounded-3xl");
    expect(founder).not.toMatch(/^import\s+.*testimonial.*$/im);
  });
});
