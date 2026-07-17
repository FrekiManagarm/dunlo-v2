import { FAILURE_RESPONSE_CATEGORIES } from "./landing-content";

export function FailureResponseMap() {
  return (
    <section
      id="failure-responses"
      className="scroll-mt-24 bg-dunlo-ground px-4 py-24 md:px-6 md:py-36"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold text-dunlo-deep">Failure-aware recovery</p>
            <h2 className="mt-5 max-w-xl text-balance text-4xl font-bold leading-[0.94] tracking-[-0.04em] text-dunlo-ink md:text-6xl">
              The decline decides the next move.
            </h2>
          </div>
          <p className="max-w-[58ch] text-pretty text-base leading-7 text-gray-700 md:text-lg md:leading-8">
            A failed payment is not one problem. Dunlo translates Stripe's
            signal into the right timing, message, or human handoff.
          </p>
        </div>

        <div className="mt-16 border-t-2 border-dunlo-ink">
          {FAILURE_RESPONSE_CATEGORIES.map((item) => (
            <article
              key={item.stripeCode}
              className="group grid gap-5 border-b border-dunlo-line py-7 transition-colors hover:bg-white md:grid-cols-[0.52fr_0.95fr_0.8fr] md:items-start md:gap-8 md:px-5 md:py-9"
            >
              <div>
                <h3 className="text-xl font-bold tracking-tight text-dunlo-ink">
                  {item.situation}
                </h3>
                <code className="mt-2 block font-mono text-xs text-dunlo-deep">
                  {item.stripeCode}
                </code>
                {"context" in item ? (
                  <p className="mt-2 text-xs leading-5 text-gray-600">
                    {item.context}
                  </p>
                ) : null}
              </div>
              <dl className="contents text-sm leading-6">
                <div>
                  <dt className="text-xs font-semibold text-gray-500">What Dunlo says</dt>
                  <dd className="mt-2 max-w-[42ch] text-base leading-7 text-gray-700">{item.response}</dd>
                </div>
                <div className="md:text-right">
                  <dt className="text-xs font-semibold text-gray-500">Next action</dt>
                  <dd className="mt-2 text-lg font-bold text-dunlo-ink">{item.action} <span className="ml-2 text-dunlo transition-transform group-hover:translate-x-1" aria-hidden="true">→</span></dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
