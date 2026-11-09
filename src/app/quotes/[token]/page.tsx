import type { Metadata } from "next";
import SiteHeader from "@/components/marketplace/SiteHeader";
import Footer from "@/components/Footer";
import { getQuoteRequestByToken, getSettings } from "@/lib/marketplace/repo";
import { gbp } from "@/lib/marketplace/money";
import { acceptQuoteResponseAction, bookQuoteRequestAction } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Quotes — Fresh For Less Carpet Cleaning",
  robots: { index: false },
};

function minBookableDate(minNoticeDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + Math.max(0, minNoticeDays));
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default async function QuotesPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string; accepted?: string; booked?: string }>;
}) {
  const { token } = await params;
  const { error, booked } = await searchParams;
  const [request, settings] = await Promise.all([
    getQuoteRequestByToken(token),
    getSettings(),
  ]);

  if (!request) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            That quote link doesn&apos;t exist
          </h1>
          <p className="mt-3 text-slate-600">
            Check the link in your text, or start a fresh request — it only
            takes a minute.
          </p>
          <a
            href="/book"
            className="mt-6 inline-flex rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
          >
            Get quotes →
          </a>
        </main>
        <Footer />
      </>
    );
  }

  const items = request.items
    .map((line) => `${line.qty}× ${line.label}`)
    .join(", ");
  const accepted = request.responses.find(
    (x) => x.id === request.accepted_response_id
  );
  const isBooked = request.status === "booked" || Boolean(request.booked_ref);

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-2xl px-4 py-10">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Your quotes{request.customer_name ? `, ${request.customer_name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-2 text-slate-600">
            {items || "Your clean"} · {request.outward}
          </p>

          {error && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}

          {/* Booked: the end state. */}
          {isBooked && (
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
              <p className="text-4xl">🎉</p>
              <h2 className="mt-3 text-xl font-bold text-slate-900">
                Booked — reference {booked || request.booked_ref}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-slate-600">
                {accepted ? `${accepted.cleaner_name} has your job in their diary at ${gbp(accepted.price_pence)}. ` : ""}
                You&apos;ll get a confirmation text with everything you need —
                and you pay your cleaner on the day, when the work is done.
              </p>
            </div>
          )}

          {/* Accepted but not booked: pick the date. */}
          {!isBooked && request.status === "accepted" && accepted && (
            <div className="mt-6 rounded-2xl border-2 border-primary-200 bg-white p-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">
                Your chosen quote
              </p>
              <p className="mt-2 text-3xl font-black text-slate-900">
                {gbp(accepted.price_pence)}
                <span className="ml-2 text-base font-semibold text-slate-500">
                  from {accepted.cleaner_name}
                </span>
              </p>
              {accepted.message && (
                <p className="mt-2 text-sm text-slate-600">&ldquo;{accepted.message}&rdquo;</p>
              )}

              <h2 className="mt-6 font-bold text-slate-900">
                Pick your day to finish the booking
              </h2>
              <form action={bookQuoteRequestAction} className="mt-4 space-y-3">
                <input type="hidden" name="token" value={request.token} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Date
                    <input
                      type="date"
                      name="slotDate"
                      required
                      min={minBookableDate(settings.min_notice_days)}
                      className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    Morning or afternoon
                    <select
                      name="slotWindow"
                      className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5"
                    >
                      <option value="am">Morning</option>
                      <option value="pm">Afternoon</option>
                    </select>
                  </label>
                </div>
                <input
                  name="addressLine"
                  required
                  placeholder="House number & street"
                  aria-label="Address"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    name="town"
                    placeholder="Town"
                    aria-label="Town"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5"
                  />
                  <input
                    name="parking"
                    placeholder="Parking notes (optional)"
                    aria-label="Parking notes"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Your clean is at {request.postcode}.
                </p>
                <label className="flex items-start gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    required
                    className="mt-0.5 h-5 w-5 rounded border-slate-300 accent-primary-600"
                  />
                  <span>
                    I accept the{" "}
                    <a href="/terms" className="font-semibold text-primary-700 underline">
                      terms
                    </a>{" "}
                    and ask for the work to go ahead on the date I&apos;ve picked.
                  </span>
                </label>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-primary-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-primary-700"
                >
                  Confirm my booking — {gbp(accepted.price_pence)}
                </button>
                <p className="text-center text-xs text-slate-500">
                  Nothing to pay now — you pay {accepted.cleaner_name} on the day.
                </p>
              </form>
            </div>
          )}

          {/* Open: the quotes so far, each acceptable. */}
          {!isBooked && request.status === "open" && (
            <div className="mt-6 space-y-4">
              {request.responses.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                  <p className="text-3xl">⏳</p>
                  <h2 className="mt-3 text-lg font-bold text-slate-900">
                    Your request is with local cleaners
                  </h2>
                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                    Quotes usually arrive within a few hours — we&apos;ll text
                    you each one as it lands. This page updates as they come in.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm font-semibold text-slate-700">
                    {request.responses.length} quote
                    {request.responses.length === 1 ? "" : "s"} so far — choose
                    whenever you&apos;re ready:
                  </p>
                  {request.responses.map((response) => (
                    <div
                      key={response.id}
                      className="rounded-2xl border border-slate-200 bg-white p-6"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-2xl font-black text-slate-900">
                            {gbp(response.price_pence)}
                          </p>
                          <p className="text-sm font-semibold text-slate-600">
                            {response.cleaner_name}
                          </p>
                          {response.message && (
                            <p className="mt-1 text-sm text-slate-600">
                              &ldquo;{response.message}&rdquo;
                            </p>
                          )}
                        </div>
                        <form action={acceptQuoteResponseAction}>
                          <input type="hidden" name="token" value={request.token} />
                          <input
                            type="hidden"
                            name="responseId"
                            value={response.id}
                          />
                          <button
                            type="submit"
                            className="rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
                          >
                            Choose this cleaner
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-slate-500">
                    Choosing one locks the job to that cleaner — the others
                    can&apos;t quote any more. You pay on the day, only if the
                    work is done.
                  </p>
                </>
              )}
            </div>
          )}

          {!isBooked && request.status === "closed" && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <h2 className="text-lg font-bold text-slate-900">
                This request is closed
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Start a fresh one any time — it only takes a minute.
              </p>
              <a
                href="/book"
                className="mt-4 inline-flex rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
              >
                Get new quotes →
              </a>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
