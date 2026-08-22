import SiteHeader from "@/components/marketplace/SiteHeader";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Fresh For Less Carpet Cleaning collects, uses and protects your personal information.",
  alternates: { canonical: "/privacy" },
};

const UPDATED = "21 August 2026";

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-white pt-10 pb-20">
        <article className="mx-auto max-w-2xl px-4">
          <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
          <p className="mt-2 text-sm text-slate-500">Last updated {UPDATED}</p>

          <div className="prose mt-8 space-y-6 text-slate-700">
            <section>
              <h2 className="text-xl font-bold text-slate-900">Who we are</h2>
              <p className="mt-2">
                Fresh For Less Carpet Cleaning provides carpet and upholstery
                cleaning, and operates a network of independent cleaners through
                this website. It is a trading name of Wirral Carpet Cleaning
                Limited (registered in England and Wales, company number
                11103869, registered office 8 Overton Way, Prenton, Wirral,
                CH43 2LF), which is the data controller for the information
                described here. You can reach us on{" "}
                <a href="tel:03300434811" className="font-semibold underline">
                  0330 043 4811
                </a>{" "}
                or at{" "}
                <a
                  href="mailto:info@freshforlesscarpetcleaning.co.uk"
                  className="font-semibold underline"
                >
                  info@freshforlesscarpetcleaning.co.uk
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900">
                What we collect, and why
              </h2>
              <p className="mt-2">
                <strong>If you book a clean:</strong> your name, email address,
                phone number, the address to be cleaned, what needs cleaning,
                your chosen date and any notes you give us. We need this to
                arrange and carry out the work — the legal basis is performance
                of a contract with you.
              </p>
              <p className="mt-2">
                <strong>If we don&apos;t cover your area:</strong> the contact
                details you leave so we can come back to you, and your postcode
                so we know where to recruit. The legal basis is our legitimate
                interest in responding to enquiries and planning coverage.
              </p>
              <p className="mt-2">
                <strong>If you register as a cleaner:</strong> your name, trading
                name, contact details, insurance details, experience, equipment,
                the areas and hours you work, and a password (stored only as a
                secure hash — we never see it). The legal basis is performance of
                a contract with you, and our legitimate interest in checking that
                cleaners are insured and suitable.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900">
                Who we share it with
              </h2>
              <p className="mt-2">
                <strong>Your cleaner.</strong> When a booking is accepted, we
                share your name, address and phone number with the independent
                cleaner carrying out the work. They need it to reach you and get
                to your home. Cleaners may only use it for your job.
              </p>
              <p className="mt-2">
                We also use service providers who process data on our behalf:
                Vercel (website hosting), Neon (database), Twilio (text
                messages) and Resend (email). We do not sell your information or
                share it for anyone else&apos;s marketing.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900">
                How long we keep it
              </h2>
              <p className="mt-2">
                Booking records are kept for six years, which is how long we are
                required to retain records for tax purposes. Enquiries from areas
                we don&apos;t yet cover are kept for up to twelve months. Cleaner
                records are kept while the account is active and for six years
                after it closes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900">Your rights</h2>
              <p className="mt-2">
                You can ask us for a copy of the information we hold about you,
                ask us to correct it, ask us to delete it, or object to how we
                use it. Contact us using the details above and we&apos;ll
                respond within one month.
              </p>
              <p className="mt-2">
                Where we can only delete some of your information — for example
                we must keep invoice records for tax — we&apos;ll tell you what
                we&apos;ve kept and why.
              </p>
              <p className="mt-2">
                If you&apos;re unhappy with how we&apos;ve handled your
                information you can complain to the Information Commissioner&apos;s
                Office at{" "}
                <a
                  href="https://ico.org.uk"
                  className="font-semibold underline"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  ico.org.uk
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900">Cookies</h2>
              <p className="mt-2">
                We use a small number of strictly necessary cookies to keep you
                signed in to the booking and cleaner areas. These don&apos;t
                track you and can&apos;t be turned off without breaking those
                pages.
              </p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
