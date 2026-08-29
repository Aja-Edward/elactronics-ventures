import Link from "next/link";

/**
 * Closing call to action. Lifted out of the old single About page so all eight
 * of its successors end the same way rather than dead-ending.
 */
export default function WorkWithUs() {
  return (
    <section className="border-t border-brand-100 bg-surface py-14">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-brand-900">
            Work with us
          </h2>
          <p className="mt-1 text-sm text-steel-700">
            Tell us about your scope and we will come back with a quote.
          </p>
        </div>
        <Link
          href="/request-quote"
          className="rounded bg-accent-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-700"
        >
          Request a Quote
        </Link>
      </div>
    </section>
  );
}
