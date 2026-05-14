import { createFileRoute } from "@tanstack/react-router";
import { CtaBanner } from "@/components/landing/cta-banner";
import { Faq } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Nav } from "@/components/landing/nav";
import { Pricing } from "@/components/landing/pricing";
import { StatsBanner } from "@/components/landing/stats-banner";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  SITE_NAME,
  SITE_URL,
  canonicalLink,
  ogMeta,
} from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: DEFAULT_TITLE },
      { name: "description", content: DEFAULT_DESCRIPTION },
      ...ogMeta({ title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION }),
    ],
    links: [canonicalLink("/")],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Dunlo",
          applicationCategory: "BusinessApplication",
          description:
            "Stripe payment recovery SaaS that detects failed payments by type and sends automated recovery emails.",
          operatingSystem: "Web",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "EUR",
            description: "Free during beta",
          },
          provider: {
            "@type": "Organization",
            name: SITE_NAME,
            url: SITE_URL,
          },
          url: SITE_URL,
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Does Dunlo work with Stripe Connect?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. Dunlo connects to both standard Stripe accounts and Stripe Connect platforms. We read your payment intents and customer data to detect failed payments and trigger recovery flows.",
              },
            },
            {
              "@type": "Question",
              name: "What happens after the beta?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "During beta, every plan is free. When we launch, you'll pick the tier that fits your MRR. We'll give you a 2-week heads-up before any billing starts.",
              },
            },
            {
              "@type": "Question",
              name: "Will my recovery emails go to spam?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Dunlo sends from your domain via your own email provider. You control deliverability. We avoid spam-trigger patterns and our templates are written for high inbox placement.",
              },
            },
            {
              "@type": "Question",
              name: "How long does setup take?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "About 5 minutes: connect Stripe, add your email provider, review the default sequences. No code, no engineering team needed.",
              },
            },
            {
              "@type": "Question",
              name: "Can I cancel anytime?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. No lock-in. During beta there's nothing to cancel. After launch, you can downgrade or pause at any time from your dashboard.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-dvh bg-[#e9eaeb] font-sans">
      <Nav />
      <Hero />
      <div className="mx-auto max-w-6xl space-y-3 px-3 pb-6 md:space-y-4 md:px-4">
        <StatsBanner />
        <Features />
        <HowItWorks />
        <Pricing />
        <Faq />
        <CtaBanner />
      </div>
      <Footer />
    </div>
  );
}
