import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { Footer } from "@/components/landing/footer";
import { Logo } from "@/components/logo";
import { SITE_NAME, canonicalLink, ogMeta } from "@/lib/seo";

const UPDATED_AT = "May 19, 2026";
const TITLE = "Terms of Service - Dunlo";
const DESCRIPTION =
  "The terms that apply when using Dunlo's Stripe payment recovery service.";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      ...ogMeta({
        title: TITLE,
        description: DESCRIPTION,
        path: "/terms",
      }),
    ],
    links: [canonicalLink("/terms")],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-dvh bg-stone-100 font-sans text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
          <Link to="/" aria-label="Back to Dunlo home">
            <Logo size={24} />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            <ArrowLeft size={15} />
            Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-16 md:py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-dunlo-deep">
            {SITE_NAME} legal
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-950 md:text-6xl">
            Terms of Service
          </h1>
          <p className="mt-5 text-base leading-8 text-gray-600">
            These terms govern access to Dunlo, a Stripe-first failed-payment
            recovery product for SaaS teams.
          </p>
          <p className="mt-4 text-sm font-medium text-gray-500">
            Last updated: {UPDATED_AT}
          </p>
        </div>

        <div className="mt-14 grid gap-10 border-t border-gray-300 pt-10 lg:grid-cols-[220px_1fr]">
          <aside className="text-sm font-semibold text-gray-500">
            By using Dunlo, you agree to these terms.
          </aside>

          <div className="space-y-12 text-sm leading-7 text-gray-600">
            <section>
              <h2 className="text-2xl font-bold tracking-tight text-gray-950">
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
              <h2 className="text-2xl font-bold tracking-tight text-gray-950">
                Accounts and access
              </h2>
              <p className="mt-4">
                You must provide accurate account information and keep your login
                credentials secure. If you use Google sign-in, Google only acts as
                an authentication provider for your Dunlo account. You are
                responsible for activity that occurs under your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight text-gray-950">
                Stripe and email use
              </h2>
              <p className="mt-4">
                You authorize Dunlo to use connected Stripe data and email
                delivery providers as needed to operate payment recovery
                workflows. You are responsible for ensuring that your use of
                recovery messages complies with laws, customer contracts, and any
                policies that apply to your business.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight text-gray-950">
                Beta availability and fees
              </h2>
              <p className="mt-4">
                Dunlo may be offered free during beta. We may introduce or change
                paid plans later, but we will provide notice before charging for a
                plan that was previously free. Features, limits, and availability
                may change during beta.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight text-gray-950">
                AI-assisted drafts
              </h2>
              <p className="mt-4">
                Dunlo may generate draft escalation messages or summaries. You
                are responsible for reviewing AI-assisted output before sending it
                to customers or relying on it for business decisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight text-gray-950">
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
              <h2 className="text-2xl font-bold tracking-tight text-gray-950">
                Termination
              </h2>
              <p className="mt-4">
                You may stop using Dunlo at any time. We may suspend or terminate
                access if you violate these terms, create risk for Dunlo or
                others, or if we discontinue the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight text-gray-950">
                Disclaimers and liability
              </h2>
              <p className="mt-4">
                Dunlo is provided as-is during beta. We do not guarantee recovered
                revenue, uninterrupted service, or that every failed payment can
                be recovered. To the fullest extent allowed by law, Dunlo will not
                be liable for indirect, incidental, special, consequential, or
                punitive damages.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight text-gray-950">
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
