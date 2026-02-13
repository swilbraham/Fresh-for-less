"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QuoteModal from "@/components/QuoteModal";
import AnimatedSection from "@/components/AnimatedSection";

/* ─────────────────── DATA ─────────────────── */

const benefits = [
  {
    title: "Deep Clean",
    desc: "Professional hot water extraction that reaches deep into carpet fibres, removing dirt, bacteria, and allergens.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
      </svg>
    ),
  },
  {
    title: "Fast Drying",
    desc: "Our advanced equipment means your carpets dry in hours, not days. Get back to enjoying your home sooner.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
  {
    title: "Eco-Friendly",
    desc: "Safe, non-toxic products that are kind to your family, pets, and the environment. No harsh chemicals.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
  },
  {
    title: "No Hidden Fees",
    desc: "Transparent, upfront pricing every time. The quote we give is the price you pay — guaranteed.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
      </svg>
    ),
  },
];

const testimonials = [
  {
    name: "Sarah M.",
    role: "Homeowner",
    quote:
      "Fresh For Less completely transformed our stained carpets — they look like the day we moved in. And the price? Half what the other company quoted us.",
    rating: 5,
  },
  {
    name: "Jennifer T.",
    role: "Mum of 3",
    quote:
      "With three kids and two dogs, our carpets take a beating. The team was so professional and thorough. My allergies have actually improved since the cleaning.",
    rating: 5,
  },
  {
    name: "David R.",
    role: "Office Manager",
    quote:
      "They arrived exactly when promised and the results were outstanding. Our employees noticed the difference immediately on Monday.",
    rating: 5,
  },
];

/* ─────────────────── HELPERS ─────────────────── */

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

/* ─────────────────── PAGE ─────────────────── */

export default function CleaningLandingPage() {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [formSending, setFormSending] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const openQuote = () => setQuoteOpen(true);
  const closeQuote = () => setQuoteOpen(false);

  const handleInlineSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormSending(true);
    const formData = new FormData(e.currentTarget);

    try {
      await fetch("https://formsubmit.co/ajax/simonwilbraham@sky.com", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      setFormSubmitted(true);
    } catch {
      setFormSubmitted(true);
    } finally {
      setFormSending(false);
    }
  };

  return (
    <>
      <Navbar onQuoteClick={openQuote} />

      <main>
        {/* ══════════ HERO ══════════ */}
        <section className="relative min-h-[90dvh] overflow-hidden bg-slate-950">
          {/* Background layers */}
          <div className="absolute inset-0">
            <img src="/images/hero-bg.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-slate-950/75" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary-950/80 via-slate-900/60 to-slate-950/80" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-primary-900)_0%,_transparent_50%)] opacity-40" />
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: "64px 64px",
              }}
            />
          </div>

          {/* Floating orbs */}
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 right-1/4 h-72 w-72 rounded-full bg-primary-500/10 blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/4 left-1/3 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl"
          />

          <div className="relative mx-auto flex min-h-[90dvh] max-w-7xl items-center px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl py-32 text-center lg:py-40">
              {/* Badge */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                <span className="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-4 py-1.5 text-xs font-medium text-primary-300 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-400 animate-pulse" />
                  Professional Carpet Cleaning You Can Trust
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
              >
                Spotless Carpets,{" "}
                <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                  Affordable Prices
                </span>
              </motion.h1>

              {/* Subtext */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-400 sm:text-xl"
              >
                Professional deep-cleaning that removes stubborn stains, allergens, and odours — leaving your home healthier and your carpets looking brand new.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
              >
                <button
                  onClick={openQuote}
                  className="group relative overflow-hidden rounded-xl bg-primary-600 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-primary-600/30 transition-all hover:bg-primary-700 hover:shadow-primary-600/50 active:scale-[0.98]"
                >
                  <span className="relative z-10">Get Your Free Quote</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500 opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
                <a
                  href="tel:03300434811"
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-slate-600 hover:bg-slate-800"
                >
                  <svg className="h-5 w-5 text-accent-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                  </svg>
                  Call 0330 043 4811
                </a>
              </motion.div>

              {/* Trust metrics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.75 }}
                className="mx-auto mt-14 flex max-w-lg flex-wrap items-center justify-center gap-x-8 gap-y-4 border-t border-slate-800 pt-8"
              >
                {[
                  { value: "4.9/5", label: "Customer Rating" },
                  { value: "2,000+", label: "Homes Cleaned" },
                  { value: "100%", label: "Satisfaction Guarantee" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
        </section>

        {/* ══════════ BENEFITS ══════════ */}
        <section className="bg-white py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Why Choose Fresh For Less?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
                Professional results at honest prices — here&apos;s what sets us apart.
              </p>
            </AnimatedSection>

            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map((b, i) => (
                <AnimatedSection key={b.title} delay={i * 0.1}>
                  <div className="group rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-sm transition-all hover:shadow-lg">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-100">
                      {b.icon}
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-slate-900">{b.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{b.desc}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ SOCIAL PROOF ══════════ */}
        <section className="bg-slate-50 py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center">
              <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                Real Results
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                What Our Customers Say
              </h2>
            </AnimatedSection>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {testimonials.map((t, i) => (
                <AnimatedSection key={t.name} delay={i * 0.1}>
                  <div className="group relative h-full rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-lg">
                    <StarRating count={t.rating} />
                    <p className="mt-4 text-sm leading-relaxed text-slate-700">&ldquo;{t.quote}&rdquo;</p>
                    <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                        {t.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                        <p className="text-xs text-slate-500">{t.role}</p>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ INLINE QUOTE FORM ══════════ */}
        <section id="quote-form" className="bg-white py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl">
              <AnimatedSection className="text-center">
                <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 ring-1 ring-primary-100">
                  Free &amp; No Obligation
                </span>
                <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                  Get Your Free Quote in Minutes
                </h2>
                <p className="mt-4 text-lg text-slate-600">
                  Tell us about your space and we&apos;ll get back to you within 2 hours.
                </p>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
                  {formSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="py-8 text-center"
                    >
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-100">
                        <svg className="h-8 w-8 text-accent-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      </div>
                      <h4 className="mt-4 text-xl font-bold text-slate-900">Thank You!</h4>
                      <p className="mt-2 text-sm text-slate-600">
                        We&apos;ve received your request and will get back to you within 2 hours with a personalised quote.
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleInlineSubmit} className="space-y-5">
                      <input type="hidden" name="_subject" value="New Quote Request — Fresh For Less (Landing Page)" />
                      <input type="hidden" name="_template" value="table" />
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="lp-name" className="mb-1.5 block text-sm font-medium text-slate-700">
                            Full Name
                          </label>
                          <input
                            type="text"
                            id="lp-name"
                            name="name"
                            required
                            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                            placeholder="Jane Smith"
                          />
                        </div>
                        <div>
                          <label htmlFor="lp-phone" className="mb-1.5 block text-sm font-medium text-slate-700">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            id="lp-phone"
                            name="phone"
                            required
                            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                            placeholder="07700 900 000"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="lp-email" className="mb-1.5 block text-sm font-medium text-slate-700">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="lp-email"
                          name="email"
                          required
                          className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                          placeholder="jane@example.com"
                        />
                      </div>
                      <div>
                        <label htmlFor="lp-service" className="mb-1.5 block text-sm font-medium text-slate-700">
                          Service Needed
                        </label>
                        <select
                          id="lp-service"
                          name="service"
                          required
                          className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                        >
                          <option value="">Select a service...</option>
                          <option>Carpet Cleaning</option>
                          <option>Upholstery Cleaning</option>
                          <option>Stain Removal</option>
                          <option>Commercial Cleaning</option>
                          <option>Pet Odour Treatment</option>
                          <option>Full Home Package</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="lp-details" className="mb-1.5 block text-sm font-medium text-slate-700">
                          Tell Us More
                        </label>
                        <textarea
                          id="lp-details"
                          name="details"
                          rows={3}
                          className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-none"
                          placeholder="Number of rooms, type of stains, any special concerns..."
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={formSending}
                        className="w-full rounded-lg bg-primary-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition-all hover:bg-primary-700 hover:shadow-primary-600/40 active:scale-[0.98] disabled:opacity-60"
                      >
                        {formSending ? "Sending..." : "Request My Free Quote"}
                      </button>
                      <p className="text-center text-xs text-slate-500">
                        No obligation. We&apos;ll respond within 2 hours.
                      </p>
                    </form>
                  )}
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* ══════════ FINAL CTA ══════════ */}
        <section className="relative overflow-hidden bg-slate-950 py-20 lg:py-28">
          <div className="absolute inset-0">
            <img src="/images/cta-interior.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-slate-950/80" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary-950/70 via-slate-900/50 to-slate-950/70" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--color-primary-800)_0%,_transparent_60%)] opacity-30" />
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: "48px 48px",
              }}
            />
          </div>

          <motion.div
            animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/3 left-1/4 h-48 w-48 rounded-full bg-primary-500/15 blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -15, 0], y: [0, 20, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/3 right-1/4 h-64 w-64 rounded-full bg-accent-500/10 blur-3xl"
          />

          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <AnimatedSection>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-4 py-1.5 text-xs font-medium text-primary-300 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-400 animate-pulse" />
                Limited Availability — Book This Week
              </span>

              <h2 className="mt-6 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Ready for Carpets That Look{" "}
                <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                  and Feel Amazing?
                </span>
              </h2>

              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
                Get your free, no-obligation quote in minutes. Transparent pricing, no hidden fees, no pressure. Just honest, professional service.
              </p>

              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <a
                  href="#quote-form"
                  className="group relative overflow-hidden rounded-xl bg-primary-600 px-10 py-4 text-base font-semibold text-white shadow-2xl shadow-primary-600/30 transition-all hover:bg-primary-700 hover:shadow-primary-600/50 active:scale-[0.98]"
                >
                  <span className="relative z-10">Get Your Free Quote Now</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500 opacity-0 transition-opacity group-hover:opacity-100" />
                </a>
                <a
                  href="tel:03300434811"
                  className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-slate-600 hover:bg-slate-800"
                >
                  <svg className="h-5 w-5 text-accent-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                  </svg>
                  Call 0330 043 4811
                </a>
              </div>

              <div className="mx-auto mt-12 flex max-w-lg flex-wrap items-center justify-center gap-x-8 gap-y-4 border-t border-slate-800 pt-8">
                {["Free Estimates", "No Hidden Fees", "100% Satisfaction Guarantee"].map((item) => (
                  <span key={item} className="flex items-center gap-2 text-sm text-slate-400">
                    <svg className="h-4 w-4 text-accent-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    {item}
                  </span>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </section>
      </main>

      <Footer />
      <QuoteModal isOpen={quoteOpen} onClose={closeQuote} />
    </>
  );
}
