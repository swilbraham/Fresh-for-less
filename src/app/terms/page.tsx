import Link from "next/link";
import SiteHeader from "@/components/marketplace/SiteHeader";
import Footer from "@/components/Footer";
import { getSettings } from "@/lib/marketplace/repo";
import { gbpShort } from "@/lib/marketplace/money";
import { COMPANY, COMPANY_DISCLOSURE } from "@/lib/company";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Terms & Conditions",
  description:
    "The terms you agree to when you book a clean with Fresh For Less.",
  alternates: { canonical: "/terms" },
};

/** Last substantive revision. Shown so a customer can tell which version they agreed to. */
const UPDATED = "4 October 2026";

function Section({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold text-slate-900">{heading}</h2>
      <div className="mt-2 space-y-3 text-slate-700">{children}</div>
    </section>
  );
}

export default async function TermsPage() {
  // Read from settings rather than restating them, so the terms cannot drift
  // away from what the booking form actually enforces.
  const settings = await getSettings();
  const noticeHours = settings.cancellation_notice_hours;
  const minimum = gbpShort(settings.minimum_charge_pence);

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-slate-50">
        <article className="mx-auto max-w-3xl px-4 py-14 text-[15px] leading-relaxed">
          <h1 className="text-3xl font-extrabold text-slate-900">
            Terms &amp; Conditions
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Last updated {UPDATED}. These are the terms you agree to when you
            book through this website.
          </p>

          <Section heading="1. Who you are booking with">
            <p>
              You are booking with {COMPANY.tradingName}. The clean itself is
              carried out by a self-employed cleaner we have approved, insured
              and vetted. Your agreement for the work is with us, so if
              anything goes wrong you come to us and we deal with it — you do
              not have to take it up with the cleaner yourself.
            </p>
            <p className="text-sm text-slate-500">{COMPANY_DISCLOSURE}</p>
          </Section>

          <Section heading="2. Your booking">
            <p>
              Choosing a date and half-day and submitting the form is a request
              to book. Your appointment is confirmed when we send you a
              confirmation with a booking reference. If nobody is available to
              cover your postcode on that day, we will contact you to arrange
              another before anything is confirmed.
            </p>
            <p>
              You choose the date and whether you want a morning or an
              afternoon. Morning means arrival between 8am and 1pm, afternoon
              between 12pm and 5pm. We cannot give a precise arrival time:
              traffic and the job before yours both move, and a false promise
              is worse than an honest window. Your cleaner will contact you on
              the day.
            </p>
          </Section>

          <Section heading="3. Price">
            <p>
              The price shown when you book is fixed and includes everything
              needed to do the job described — labour, machine, chemistry,
              water and VAT where applicable. There is a {minimum} minimum
              charge for any visit.
            </p>
            <p>
              Your cleaner will not add charges on the doorstep. If what they
              find is genuinely different from what you booked — far more
              rooms, or a floor that needs a different treatment — they will
              stop and ring us, and we will agree any change with you before
              any further work is done. You are free to say no and pay only for
              what was booked.
            </p>
          </Section>

          <Section heading="4. Paying">
            <p>
              You pay your cleaner directly on the day, once the work is
              finished, by card, cash or bank transfer. Nothing is taken when
              you book and no deposit is held.
            </p>
          </Section>

          <Section heading="5. Getting ready for us">
            <p>
              Please clear the floor of small items, breakables and anything
              precious before we arrive, and move what you can. Your cleaner
              will move ordinary furniture where it is safe to do so, but will
              not move beds, large wardrobes, pianos, electronics or anything
              holding a full aquarium.
            </p>
            <p>
              We need somewhere to park within a reasonable distance, and
              access to mains water and electricity. If parking charges apply
              at your address, those are passed on at cost and will be agreed
              with you first.
            </p>
            <p>
              Please tell us when booking about anything that affects the job:
              pets, stairs, a lift being out of order, or a floor covering you
              are unsure about.
            </p>
          </Section>

          <Section heading="6. Changing or cancelling your booking">
            <p>
              You can change or cancel free of charge up to {noticeHours} hours
              before your slot, using the link in your confirmation or by
              ringing us. Inside {noticeHours} hours we may charge a
              contribution towards the slot your cleaner has held for you, and
              we will tell you if we intend to.
            </p>
            <p>
              If nobody is in when your cleaner arrives, or they cannot get
              access, the visit counts as a late cancellation.
            </p>
            <p className="rounded-xl border border-slate-200 bg-white p-4">
              <strong className="font-semibold text-slate-900">
                Your legal right to cancel.
              </strong>{" "}
              Because you are booking online, you normally have 14 days from
              the day you book to cancel for any reason. Most of our
              appointments fall inside that period, so by ticking the box when
              you book you are asking us to start the work before the 14 days
              are up. You keep the right to cancel during those 14 days, but if
              the clean has already been carried out in full you lose it, and
              if work has been partly done you pay a fair amount for what was
              done. This does not affect the rest of your rights below.
            </p>
          </Section>

          <Section heading="7. If we cannot make it">
            <p>
              If your cleaner cannot attend we will tell you as soon as we
              know, and offer you the earliest alternative slot or a full
              release from the booking. Nothing is owed for a visit that did
              not happen.
            </p>
          </Section>

          <Section heading="8. Our guarantee">
            <p>
              If you are not happy with the work, tell us within 48 hours of
              the visit and we will come back and put it right at no charge. We
              would always rather re-clean than argue.
            </p>
            <p>
              Cleaning improves what is there; it cannot undo everything. Some
              marks are permanent damage to the fibre rather than soil — bleach
              or dye spots, sun fading, pile that has worn flat, burns, old
              pet damage or earlier treatment with the wrong product. Your
              cleaner will tell you honestly if they think something will not
              come out, before starting rather than afterwards.
            </p>
          </Section>

          <Section heading="9. Damage and liability">
            <p>
              Our cleaners carry public liability insurance. If we damage
              something through our work or our carelessness, tell us within 48
              hours and we will put it right or compensate you fairly.
            </p>
            <p>
              We are not responsible for pre-existing damage, for faults in the
              item itself, for colour loss on a material that was not
              colourfast despite a proper test, or for furniture failing when
              it is moved back onto a floor that is still drying.
            </p>
            <p>
              Nothing in these terms limits our liability for death or personal
              injury caused by our negligence, for fraud, or for anything else
              that cannot be limited by law. Your statutory rights as a
              consumer are unaffected.
            </p>
          </Section>

          <Section heading="10. Drying and aftercare">
            <p>
              Carpets are usually touch-dry in two to six hours depending on
              the fibre, the weather and the ventilation. Keep the room aired,
              take care walking from a damp carpet onto a hard floor, and leave
              protective pads under furniture feet until everything is dry.
            </p>
          </Section>

          <Section heading="11. If something goes wrong">
            <p>
              Contact us first and we will try to sort it quickly. If we cannot
              agree, you can take the matter to the courts of England and
              Wales, and these terms are governed by the law of England and
              Wales.
            </p>
          </Section>

          <Section heading="12. Your information">
            <p>
              We pass your name, address and phone number to the cleaner doing
              your job so they can reach you and get to you. Nothing else is
              shared and we never sell your details. See our{" "}
              <Link href="/privacy" className="font-semibold text-primary-600 underline">
                privacy policy
              </Link>
              .
            </p>
          </Section>

          <Section heading="13. Changes to these terms">
            <p>
              We may update these terms. The version that applies to your
              booking is the one published when you booked, and the date at the
              top tells you which that is.
            </p>
          </Section>

          <p className="mt-10 rounded-xl bg-white p-4 text-sm text-slate-500">
            Questions about any of this? Ring us before you book — we would
            rather explain it now than have it come as a surprise on the day.
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
