import { Footer } from "@/components/landing/footer";
import { Nav } from "@/components/landing/nav";
import { SITE_NAME } from "@/lib/seo";

const UPDATED_AT = "May 19, 2026";
export function TermsPage() {
  return (
    <div className="min-h-dvh bg-dunlo-ground font-sans text-dunlo-ink">
      <Nav />

      <main>
        <header className="bg-dunlo-ink px-5 pb-20 pt-36 text-white md:pb-24 md:pt-44">
          <div className="mx-auto max-w-5xl">
            <p className="text-sm font-semibold text-dunlo">
              {SITE_NAME} legal
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-[0.96] tracking-[-0.04em] md:text-6xl">
              Terms of Service
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/68">
              These terms govern access to Dunlo, a Stripe-first failed-payment
              recovery product for SaaS teams.
            </p>
            <p className="mt-5 text-sm font-medium text-white/48">
              Last updated: {UPDATED_AT}
            </p>
          </div>
        </header>

        <div className="mx-auto grid max-w-5xl gap-10 px-5 py-16 lg:grid-cols-[220px_1fr] md:py-20">
          <aside className="text-sm font-semibold text-dunlo-ink/56">
            By using Dunlo, you agree to these terms.
          </aside>

          <div className="space-y-12 text-sm leading-7 text-dunlo-ink/68">
            <section>
              <h2 className="text-2xl font-bold tracking-tight text-dunlo-ink">
                The service
              </h2>
              <p className="mt-4">
                Dunlo monitors failed Stripe payments, helps send recovery
                emails, tracks recovered revenue, and provides related payment
                recovery workflows. The product is currently in beta and may
                change as we improve it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight text-dunlo-ink">
                Accounts and access
              </h2>
              <p className="mt-4">
                You must provide accurate account information and keep your
                login credentials secure. If you use Google sign-in, Google only
                acts as an authentication provider for your Dunlo account. You
                are responsible for activity that occurs under your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight text-dunlo-ink">
                Stripe and email use
              </h2>
              <p className="mt-4">
                You authorize Dunlo to use connected Stripe data and email
                delivery providers as needed to operate payment recovery
                workflows. You are responsible for ensuring that your use of
                recovery messages complies with laws, customer contracts, and
                any policies that apply to your business.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight text-dunlo-ink">
                Beta availability and fees
              </h2>
              <p className="mt-4">
                Dunlo may be offered free during beta. We may introduce or
                change paid plans later, but we will provide notice before
                charging for a plan that was previously free. Features, limits,
                and availability may change during beta.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight text-dunlo-ink">
                AI-assisted drafts
              </h2>
              <p className="mt-4">
                Dunlo may generate draft escalation messages or summaries. You
                are responsible for reviewing AI-assisted output before sending
                it to customers or relying on it for business decisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight text-dunlo-ink">
                Acceptable use
              </h2>
              <p className="mt-4">
                You may not misuse Dunlo, interfere with the service, attempt
                unauthorized access, send unlawful or abusive messages, violate
                third-party rights, or use Dunlo in a way that creates security,
                privacy, or deliverability risk for other users.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight text-dunlo-ink">
                Termination
              </h2>
              <p className="mt-4">
                You may stop using Dunlo at any time. We may suspend or
                terminate access if you violate these terms, create risk for
                Dunlo or others, or if we discontinue the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight text-dunlo-ink">
                Disclaimers and liability
              </h2>
              <p className="mt-4">
                Dunlo is provided as-is during beta. We do not guarantee
                recovered revenue, uninterrupted service, or that every failed
                payment can be recovered. To the fullest extent allowed by law,
                Dunlo will not be liable for indirect, incidental, special,
                consequential, or punitive damages.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight text-dunlo-ink">
                Contact
              </h2>
              <p className="mt-4">
                Questions about these terms can be sent to{" "}
                <a
                  href="mailto:hello@dunlo.io"
                  className="font-semibold text-dunlo-dim hover:underline"
                >
                  hello@dunlo.io
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
