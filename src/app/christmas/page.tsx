import Link from "next/link";
import type { Metadata } from "next";
import SiteHeader from "@/components/marketplace/SiteHeader";
import Footer from "@/components/Footer";
import { getSettings } from "@/lib/marketplace/repo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  if (settings.quote_mode) {
    return {
      title: "Christmas Carpet Cleaning — 3 Local Quotes in Hours",
      description:
        "Get your carpets and sofas guest-ready for Christmas. Tell us what needs cleaning and up to 3 vetted local cleaners send their best price — compare, pick one, pay nothing upfront. December books out fast.",
      alternates: { canonical: "/christmas" },
    };
  }
  return {
    title: "Christmas Carpet Cleaning — 3 Carpets for £150",
    description:
      "Get your carpets and sofas guest-ready for Christmas. 3 carpets cleaned for £150 — instant fixed price, nothing to pay upfront, vetted local cleaners across the UK. December books out fast.",
    alternates: { canonical: "/christmas" },
  };
}

/** Deterministic snow so the server and client render the same flakes. */
const SNOWFLAKES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${(i * 41) % 100}%`,
  size: 8 + ((i * 7) % 10),
  duration: 10 + ((i * 13) % 10),
  delay: -((i * 17) % 12),
  drift: ((i % 5) - 2) * 16,
}));

const POINTS = (quoteMode: boolean) => [
  ["Guest-ready before the big day", "Carpets, sofas and stairs brought back while you get on with everything else December asks of you."],
  ["Dry in hours, not days", "Hot-water extraction with proper equipment — furniture and tree back in place the same day."],
  quoteMode
    ? ["Three prices, no ring-around", "Tell us once what needs cleaning and up to three vetted local cleaners send their best price. You pick."]
    : ["Instant fixed price", "Pick your rooms online and see the exact price in seconds. No home visit, no haggling."],
  ["Nothing to pay upfront", "A vetted local cleaner is confirmed for your slot; you pay when the work is done."],
];

const SPOTS = [
  ["Red wine", "Gone before the in-laws see it"],
  ["Gravy & grease", "Lifted from carpets and dining chairs"],
  ["Muddy paw prints", "Hallways and stairs brought back"],
  ["Chocolate & sticky fingers", "Sofas and armchairs refreshed"],
];

export default async function ChristmasPage() {
  const settings = await getSettings();
  const quoteMode = settings.quote_mode;
  return (
    <>
      <SiteHeader />
      <main className="bg-white">
        {/* Hero */}
        <section className="relative overflow-hidden bg-slate-900 pb-20 pt-16 md:pt-24">
          <style>{`
            @keyframes fflSnow {
              0% { transform: translate3d(0, -5vh, 0); opacity: 0; }
              10% { opacity: 0.8; }
              100% { transform: translate3d(var(--drift), 110vh, 0); opacity: 0.3; }
            }
          `}</style>
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            {SNOWFLAKES.map((flake) => (
              <span
                key={flake.id}
                className="absolute top-0 select-none text-white/50"
                style={{
                  left: flake.left,
                  fontSize: `${flake.size}px`,
                  animation: `fflSnow ${flake.duration}s linear infinite`,
                  animationDelay: `${flake.delay}s`,
                  ["--drift" as string]: `${flake.drift}px`,
                }}
              >
                ❄
              </span>
            ))}
          </div>

          <div className="relative mx-auto max-w-3xl px-4 text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary-300">
              {quoteMode
                ? "✦ Christmas — 3 quotes from local cleaners, you pick"
                : "✦ Christmas offer — 3 carpets cleaned for £150"}
            </p>
            <h1 className="mt-6 text-4xl font-black leading-tight text-white md:text-5xl">
              Guest-ready carpets
              <span className="block text-primary-400">before Christmas</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-slate-300">
              The family&rsquo;s coming and the carpets have had a year of life
              on them.{" "}
              {quoteMode
                ? "Tell us what needs cleaning, compare quotes from vetted local cleaners, and the house is ready for the big day."
                : "Get an instant price, pick a slot, and a vetted local cleaner has the house ready for the big day."}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/book"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-primary-700 sm:w-auto"
              >
                {quoteMode ? "Get my 3 free quotes →" : "Get my instant price →"}
              </Link>
              <a
                href="tel:03300434811"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/25 px-8 py-4 text-lg font-semibold text-white transition hover:bg-white/10 sm:w-auto"
              >
                0330 043 4811
              </a>
            </div>
            <p className="mt-4 text-sm text-slate-400">
              Pre-Christmas slots fill fast — December always books out.
            </p>
          </div>
        </section>

        {/* Offer */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-5xl px-4">
            <div className="grid items-start gap-8 md:grid-cols-2">
              <div className="rounded-2xl border-2 border-primary-200 bg-slate-50 p-8">
                {quoteMode ? (
                  <>
                    <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">
                      How it works this Christmas
                    </p>
                    <p className="mt-3 text-4xl font-black text-slate-900">
                      3 local quotes, one quick form
                      <span className="mt-1 block text-lg font-semibold text-slate-500">
                        tell us what needs cleaning — vetted cleaners near you
                        text their best price
                      </span>
                    </p>
                    <p className="mt-4 text-sm text-slate-600">
                      Compare your quotes, pick the one you like, and pay
                      nothing until the work is done.
                    </p>
                    <Link
                      href="/book"
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
                    >
                      Get my quotes →
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">
                      The Christmas offer
                    </p>
                    <p className="mt-3 text-4xl font-black text-slate-900">
                      3 carpets cleaned for £150
                      <span className="mt-1 block text-lg font-semibold text-slate-500">
                        any three rooms or staircases — normally £177
                      </span>
                    </p>
                    <p className="mt-4 text-sm text-slate-600">
                      Applied automatically on /book the moment your basket has
                      three — nothing to type, nothing to pay upfront.
                    </p>
                    <Link
                      href="/book"
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
                    >
                      Price my clean →
                    </Link>
                  </>
                )}
              </div>

              <ul className="space-y-3">
                {POINTS(quoteMode).map(([title, body]) => (
                  <li
                    key={title}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <p className="font-bold text-slate-900">{title}</p>
                    <p className="mt-1 text-sm text-slate-600">{body}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* The festive mess list */}
        <section className="bg-slate-50 py-16 md:py-20">
          <div className="mx-auto max-w-5xl px-4 text-center">
            <h2 className="text-3xl font-black text-slate-900">
              Whatever Christmas throws at your carpets
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-500">
              Professional hot-water extraction lifts the stains the big day
              leaves behind — and the ones already there.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {SPOTS.map(([title, body]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm"
                >
                  <p className="font-bold text-primary-600">{title}</p>
                  <p className="mt-1 text-sm text-slate-600">{body}</p>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <Link
                href="/book"
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-primary-700"
              >
                {quoteMode
                  ? "Book before the rush — get my 3 quotes"
                  : "Book before the rush — 3 carpets £150"}
              </Link>
              <p className="mt-4 text-sm text-slate-500">
                Vetted local cleaners across the UK · Fully insured · Pay when
                the work is done
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
