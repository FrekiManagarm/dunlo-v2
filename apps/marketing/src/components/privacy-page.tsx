import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Footer } from "@/components/landing/footer";
import { Logo } from "@/components/logo";
import { SITE_NAME } from "@/lib/seo";

const UPDATED_AT = "May 19, 2026";
export function PrivacyPolicyPage() {
  return (
    <div className="min-h-dvh bg-stone-100 font-sans text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
          <Link href="/" aria-label="Back to Dunlo home">
            <Logo size={24} />
          </Link>
          <Link
            href="/"
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
            Privacy Policy
          </h1>
          <p className="mt-5 text-base leading-8 text-gray-600">
            Dunlo helps SaaS teams recover failed Stripe payments. This policy
            explains what data we collect, why we use it, how Google sign-in data
            is handled, and how you can contact us about your information.
          </p>
          <p className="mt-4 text-sm font-medium text-gray-500">
            Last updated: {UPDATED_AT}
          </p>
        </div>

        <div className="mt-14 grid gap-10 border-t border-gray-300 pt-10 lg:grid-cols-[220px_1fr]">
          <aside className="text-sm font-semibold text-gray-500">
            Applies to dunlo.io and the Dunlo app.
          </aside>

          <div className="space-y-12 text-sm leading-7 text-gray-600">
            <section>
              <h2 className="text-2xl font-bold tracking-tight text-gray-950">
                Information we collect
              </h2>
              <p className="mt-4">
                We collect account information such as your name, email address,
                authentication method, profile image if provided, session
                metadata, and security logs. When you connect Stripe, we process
                the Stripe account details and failed-payment information needed
                to detect recoverable payment failures, send recovery messages,
                and show recovery analytics.
              </p>
              <p className="mt-4">
                We may also collect product usage information, browser and device
                metadata, support messages, email delivery events, and billing or
                subscription records if Dunlo introduces paid plans.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight text-gray-950">
                Google user data
              </h2>
              <p className="mt-4">
                If you sign in with Google, Dunlo uses Google OAuth to access the
                basic profile information Google returns for authentication:
                your email address, name, profile picture, and Google account
                identifier. We use this information only to create or sign in to
                your Dunlo account, maintain your session, prevent abuse, and show
                your account identity inside the product.
              </p>
              <p className="mt-4">
                Dunlo does not request access to Gmail, Google Drive, Google
                Calendar, or other Google product data. We do not sell Google user
                data, use it for advertising, or transfer it except to service
                providers that help us operate authentication, hosting, security,
                analytics, or support under appropriate confidentiality
                obligations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight text-gray-950">
                How we use data
              </h2>
              <p className="mt-4">
                We use data to provide the Dunlo service, authenticate users,
                connect Stripe accounts, identify failed payments, send recovery
                emails, track recovery outcomes, improve reliability, protect the
                service, respond to support requests, and comply with legal
                obligations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight text-gray-950">
                Sharing and processors
              </h2>
              <p className="mt-4">
                We share data only as needed to run Dunlo, such as with hosting,
                database, authentication, analytics, email delivery, payment, and
                support providers. We may disclose information if required by law,
                to protect Dunlo or users, or as part of a merger, acquisition, or
                similar business transaction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight text-gray-950">
                Cookies and security
              </h2>
              <p className="mt-4">
                Dunlo uses cookies and similar technologies to keep users signed
                in, secure sessions, remember authentication state, and understand
                product usage. We use technical, organizational, and access
                controls designed to protect data, including encryption for
                sensitive connected-account secrets.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight text-gray-950">
                Retention and deletion
              </h2>
              <p className="mt-4">
                We keep data for as long as needed to provide Dunlo, maintain
                security, resolve disputes, comply with legal obligations, and
                support legitimate business records. You can request deletion of
                your account or personal information by contacting us. Some data
                may be retained where required by law or for security and audit
                purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight text-gray-950">
                Contact
              </h2>
              <p className="mt-4">
                For privacy questions, data requests, or account deletion, contact
                us at{" "}
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
