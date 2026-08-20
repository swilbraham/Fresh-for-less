import Link from "next/link";

/**
 * Cleaner recruitment band on the home page.
 *
 * Sits low on the page, after the customer has been through the whole pitch —
 * the home page's job is converting customers, and this shouldn't compete with
 * that. Deliberately understated: a working cleaner scanning for "how do I get
 * work" will find it, while a customer reads straight past.
 */
export default function JoinAsPro() {
  return (
    <section className="bg-slate-900 py-16">
      <div className="mx-auto max-w-5xl px-4">
        <div className="grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-accent-400">
              For carpet cleaners
            </p>
            <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
              Are you a carpet cleaner? Fill your diary.
            </h2>
            <p className="mt-4 max-w-xl text-slate-300">
              We send priced local jobs straight to your phone. No lead fees, no
              bidding, nothing to pay for quotes that go nowhere — just a
              commission on work you actually complete.
            </p>

            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "Jobs arrive already priced",
                "You choose your postcodes and days",
                "Customer pays you on the day",
                "Commission only on completed jobs",
              ].map((point) => (
                <li key={point} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-500/20 text-xs font-bold text-accent-400">
                    ✓
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <Link
              href="/pro/register"
              className="rounded-xl bg-accent-600 px-8 py-4 text-center text-base font-semibold text-white transition hover:bg-accent-700"
            >
              Join as a Pro
            </Link>
            <Link
              href="/pro"
              className="rounded-xl border border-slate-700 px-8 py-4 text-center text-base font-semibold text-white transition hover:border-slate-600 hover:bg-slate-800"
            >
              Already signed up? Sign in
            </Link>
            <p className="text-center text-xs text-slate-500 lg:text-right">
              Public liability insurance required
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
