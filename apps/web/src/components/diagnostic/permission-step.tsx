import { ExternalLink, ShieldCheck } from "lucide-react";

export function PermissionStep() {
  return (
    <section aria-labelledby="diagnostic-permission" className="space-y-6">
      <div className="flex size-11 items-center justify-center rounded-full bg-dunlo/10 text-dunlo-deep">
        <ShieldCheck size={22} />
      </div>
      <div>
        <h1
          id="diagnostic-permission"
          className="text-2xl font-bold text-zinc-950"
        >
          See your recurring payment picture first
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Dunlo requests read-only Stripe access to analyze subscription
          invoices and payment evidence. It cannot create webhooks, change
          Stripe settings, send email, or start recovery from this permission.
        </p>
      </div>
      <a
        href="/api/stripe/connect"
        className="inline-flex h-11 items-center gap-2 rounded-full bg-dunlo px-5 text-sm font-semibold text-white transition-colors hover:bg-dunlo-hover"
      >
        Connect Stripe read-only <ExternalLink size={14} />
      </a>
    </section>
  );
}
