import { RECOVERY_EXAMPLES } from "./landing-content";

export function FailureResponseMap() {
  return (
    <section
      id="failure-responses"
      className="scroll-mt-24 px-4 py-16 md:px-6 md:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold text-dunlo-deep">
              One failed payment is not the same as another
            </p>
            <h2 className="mt-4 max-w-xl text-balance text-4xl font-semibold leading-none tracking-[-0.03em] text-dunlo-ink md:text-6xl">
              The right message starts with what actually failed.
            </h2>
          </div>
          <p className="max-w-[65ch] text-pretty text-base leading-7 text-gray-700 md:text-lg">
            An expired card needs an update link. Insufficient funds needs
            better timing. An important customer may need a person, not another
            automated reminder.
          </p>
        </div>

        <div className="mt-12 border-y-2 border-dunlo-ink">
          {RECOVERY_EXAMPLES.map((item, index) => (
            <article
              key={item.stripeCode}
              className="grid gap-4 border-b border-dunlo-line py-6 last:border-b-0 md:grid-cols-[3rem_0.8fr_1.4fr_auto] md:items-center"
            >
              <span className="font-mono text-xs font-semibold text-gray-600">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-lg font-semibold text-dunlo-ink">
                  {item.reason}
                </h3>
                <code className="mt-1 block font-mono text-xs text-gray-600">
                  {item.stripeCode}
                </code>
              </div>
              <p className="max-w-2xl text-sm leading-6 text-gray-700">
                {item.customerMeaning}
              </p>
              <span className="w-fit rounded-full bg-dunlo px-3 py-2 text-xs font-bold text-dunlo-ink">
                {item.action}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
