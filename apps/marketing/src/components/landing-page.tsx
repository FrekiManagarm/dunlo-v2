import { BuiltByMathieu } from "@/components/landing/built-by-mathieu";
import { Escalation } from "@/components/landing/escalation";
import { FailureResponseMap } from "@/components/landing/failure-response-map";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Nav } from "@/components/landing/nav";
import { PaymentRecoveryHero } from "@/components/landing/payment-recovery-hero";
import { Pricing } from "@/components/landing/pricing";
import { ResourceLibrary } from "@/components/landing/resource-library";
import { RoiCalculator } from "@/components/landing/roi-calculator";
import { TrustStrip } from "@/components/landing/trust-strip";
import { PublicProofLayer } from "@/components/public-proof-layer";

export function LandingPage() {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-dunlo-ground font-sans text-dunlo-ink selection:bg-dunlo selection:text-dunlo-ink">
      <Nav />
      <main>
        <PaymentRecoveryHero />
        <TrustStrip />
        <FailureResponseMap />
        <HowItWorks />
        <Escalation />
        <RoiCalculator />
        <PublicProofLayer />
        <div className="px-4 md:px-6"><BuiltByMathieu /></div>
        <Pricing />
        <Faq />
        <ResourceLibrary />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
