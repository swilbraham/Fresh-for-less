import Link from "next/link";

/**
 * Brand header for the customer-facing marketplace pages.
 *
 * The main Navbar can't be reused here: it needs an onQuoteClick callback and
 * its links are homepage anchors that do nothing on /book. This keeps the same
 * logo, wordmark and phone CTA so the booking flow reads as Fresh For Less
 * rather than a detached third-party tool.
 */
export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 lg:h-20">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/images/logo.png"
            alt="Fresh For Less Carpet Cleaning"
            className="h-12 w-12 rounded-full object-contain lg:h-14 lg:w-14"
          />
          <div>
            <span className="block text-lg font-bold tracking-tight text-slate-900 lg:text-xl">
              Fresh For Less
            </span>
            <span className="hidden text-[10px] font-medium uppercase tracking-widest text-primary-600 sm:block">
              Carpet Cleaning
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="hidden text-sm font-semibold text-slate-600 transition hover:text-primary-600 sm:block"
          >
            Back to site
          </Link>
          <a
            href="tel:03300434811"
            className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
            </svg>
            <span className="hidden sm:inline">0330 043 4811</span>
            <span className="sm:hidden">Call</span>
          </a>
        </div>
      </div>
    </header>
  );
}
