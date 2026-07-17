import { FAILURE_RESPONSE_CATEGORIES } from "./landing-content";

export function FailureResponseMap() {
  return (
    <section
      id="failure-responses"
      className="scroll-mt-24 px-4 py-10 md:px-6 md:py-16"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold text-dunlo-deep">
              Example response logic
            </p>
            <h2 className="mt-3 max-w-xl text-balance text-3xl font-semibold leading-none tracking-[-0.03em] text-dunlo-ink md:text-5xl">
              Four paths after Stripe reports a failure.
            </h2>
          </div>
          <p className="max-w-[65ch] text-pretty text-sm leading-6 text-gray-700 md:text-base md:leading-7">
            Dunlo turns the signal into a response path: what the customer
            needs to hear, what should happen next, and when automation should
            pause for a person.
          </p>
        </div>

        <div className="mt-8 grid border-y-2 border-dunlo-ink md:grid-cols-2">
          {FAILURE_RESPONSE_CATEGORIES.map((item, index) => (
            <article
              key={item.stripeCode}
              className="grid gap-4 border-b border-dunlo-line p-5 last:border-b-0 md:p-6 md:[&:nth-child(odd)]:border-r md:[&:nth-last-child(-n+2)]:border-b-0"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="text-xs font-semibold text-dunlo-deep">
                  Response category
                </p>
                <span className="text-xs font-semibold text-gray-600">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-dunlo-ink">
                  {item.situation}
                </h3>
                <code className="mt-1 block font-mono text-xs text-gray-600">
                  {item.stripeCode}
                </code>
                {"context" in item ? (
                  <p className="mt-2 text-xs leading-5 text-gray-600">
                    {item.context}
                  </p>
                ) : null}
              </div>
              <dl className="grid gap-3 text-sm leading-6">
                <div>
                  <dt className="text-xs font-semibold text-gray-600">
                    Response
                  </dt>
                  <dd className="mt-1 text-gray-700">{item.response}</dd>
                </div>
                <div className="border-l-2 border-dunlo pl-3">
                  <dt className="text-xs font-semibold text-gray-600">
                    Next step
                  </dt>
                  <dd className="mt-1 font-semibold text-dunlo-ink">
                    {item.action}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
