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
    expect(roi).toContain("Estimated recoverable this month");
    expect(roi).toContain("Start measuring failed payments");
    expect(roi).toContain('href="/benchmark"');
  });
});
