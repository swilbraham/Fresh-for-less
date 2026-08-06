"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QuoteModal from "@/components/QuoteModal";
import AnimatedSection from "@/components/AnimatedSection";

/* ─────────────────── DATA ─────────────────── */

const whyJoin = [
  {
    title: "Proven System",
    desc: "Over 2,400 cleans delivered and a 4.9★ average rating — the playbook works. You skip the guesswork and start earning from week one.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
  {
    title: "Exclusive Territory",
    desc: "You own the postcodes we assign you — no other Fresh For Less franchisee competes for the same customers.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
      </svg>
    ),
  },
  {
    title: "Full Training",
    desc: "Five days of hands-on training with our senior technicians. Hot-water extraction, stain science, upholstery, quoting, upselling — you leave job-ready.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
      </svg>
    ),
  },
  {
    title: "Leads On Tap",
    desc: "Head office runs Google Ads, Facebook, and SEO across your territory. Warm bookings land in your inbox — you spend the day cleaning, not chasing work.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
      </svg>
    ),
  },
  {
    title: "Trusted Brand",
    desc: "Customers know Fresh For Less. Local Google reviews, a live website, a recognisable logo — instant credibility over any brand-new sole trader.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
  },
  {
    title: "Low Overheads",
    desc: "No shop, no staff. Run it from home in a branded van. Most franchisees are cash-flow positive inside the first quarter.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
      </svg>
    ),
  },
];

const included = [
  "Exclusive postcode territory — protected from day one",
  "5-day residential training course at head office",
  "Professional hot-water extraction machine",
  "Chemicals & consumables starter pack (worth £600+)",
  "Branded uniform, business cards & flyers",
  "Your own page on freshforlesscarpetcleaning.co.uk",
  "Central booking system + CRM login",
  "Ongoing lead generation (Google Ads, Meta, SEO)",
  "Public liability insurance guidance & supplier deals",
  "Monthly 1:1 coaching call for the first year",
];

const process = [
  {
    step: "1",
    title: "Enquire",
    desc: "Fill in the form below. We'll call you within 48 hours for an informal chat about your area and goals.",
  },
  {
    step: "2",
    title: "Discovery Meeting",
    desc: "Come and meet the team, see the equipment, and walk through the numbers. No pressure — we're picky about who we work with.",
  },
  {
    step: "3",
    title: "Territory Agreement",
    desc: "We map your postcodes, agree on your launch date, and hand over the franchise pack.",
  },
  {
    step: "4",
    title: "Training Week",
    desc: "5 days of hands-on training. By Friday you'll have run three real jobs alongside a senior tech.",
  },
  {
    step: "5",
    title: "Launch",
    desc: "Your van rolls out, your local ads switch on, and your first bookings land the same week.",
  },
];

const franchiseFaqs = [
  {
    q: "Do I need carpet cleaning experience?",
    a: "No. Around half of our franchisees came from unrelated trades — delivery drivers, tradespeople, ex-forces, one former teacher. If you're practical and willing to learn, training covers everything.",
  },
  {
    q: "How much can I earn?",
    a: "It depends on your effort, territory density, and how many hours you work. Full-time franchisees typically build to £45,000–£70,000+ per year after 12 months. We'll share real numbers under NDA at your discovery meeting.",
  },
  {
    q: "How much does it cost to get started?",
    a: "Franchise fees start from around £14,995 inclusive of equipment, training, and launch marketing. Finance options are available — we'll walk you through them.",
  },
  {
    q: "What ongoing fees are there?",
    a: "A flat monthly management fee that covers your lead generation, CRM access, brand licence, and support. No percentage-of-revenue royalty games.",
  },
  {
    q: "How big is a territory?",
    a: "Typically 80,000–120,000 households. We size each territory so a single-van operator can comfortably grow to £80k+ turnover without saturating.",
  },
  {
    q: "How long is the agreement?",
    a: "5 years, renewable. You can sell your territory back to us or to an approved buyer at any time.",
  },
];

/* ─────────────────── PAGE ─────────────────── */

export default function FranchisePage() {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [formSending, setFormSending] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const openQuote = () => setQuoteOpen(true);
  const closeQuote = () => setQuoteOpen(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (formData.get("_honey")) return;

    setFormSending(true);

    try {
      await fetch("https://api.web3forms.com/submit", {
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
          <div className="absolute inset-0">
            <img src="/images/hero-bg.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-slate-950/80" />
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
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                <span className="inline-flex items-center gap-2 rounded-full border border-accent-500/20 bg-accent-500/10 px-4 py-1.5 text-xs font-medium text-accent-300 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-400 animate-pulse" />
                  Franchise Opportunity — UK-wide
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
              >
                Why Not{" "}
                <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                  Join Us?
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-300 sm:text-xl"
              >
                Run your own Fresh For Less carpet cleaning business — exclusive territory, proven system,
                and a steady stream of local leads from day one.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
              >
                <a
                  href="#enquire"
                  className="group relative overflow-hidden rounded-xl bg-accent-600 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-accent-600/30 transition-all hover:bg-accent-700 hover:shadow-accent-600/50 active:scale-[0.98]"
                >
                  <span className="relative z-10">Register My Interest</span>
                </a>
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

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.75 }}
                className="mx-auto mt-14 flex max-w-lg flex-wrap items-center justify-center gap-x-8 gap-y-4 border-t border-slate-800 pt-8"
              >
                {[
                  { value: "From £14,995", label: "All-Inclusive Start-Up" },
                  { value: "5 Days", label: "Full Training" },
                  { value: "Week 1", label: "First Bookings" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
        </section>

        {/* ══════════ WHY JOIN ══════════ */}
        <section className="bg-white py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center">
              <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 ring-1 ring-primary-100">
                Why Fresh For Less
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Everything You Need to Run a Profitable Local Business
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
                Skip the years of trial and error. Start with the systems, brand, and leads already in place.
              </p>
            </AnimatedSection>

            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {whyJoin.map((b, i) => (
                <AnimatedSection key={b.title} delay={i * 0.08}>
                  <div className="group h-full rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-lg">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-100">
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

        {/* ══════════ WHAT'S INCLUDED ══════════ */}
        <section className="bg-slate-50 py-16 lg:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <AnimatedSection>
                <span className="inline-flex items-center rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700 ring-1 ring-accent-100">
                  What&apos;s Included
                </span>
                <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                  A Complete Business-in-a-Box
                </h2>
                <p className="mt-4 text-lg text-slate-600">
                  Your franchise fee covers everything you need to launch — no surprise bills, no hidden costs.
                </p>
                <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">Investment from</p>
                  <p className="mt-1 text-4xl font-extrabold text-slate-900">£14,995</p>
                  <p className="mt-1 text-sm text-slate-500">All-inclusive. Finance options available.</p>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.15}>
                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                  <ul className="space-y-4">
                    {included.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent-100 text-accent-700">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                        </span>
                        <span className="text-sm font-medium leading-relaxed text-slate-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* ══════════ IDEAL CANDIDATE ══════════ */}
        <section className="bg-white py-16 lg:py-24">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <AnimatedSection>
              <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 ring-1 ring-primary-100">
                Is This For You?
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Who We&apos;re Looking For
              </h2>
              <p className="mx-auto mt-4 text-lg text-slate-600">
                You don&apos;t need to be a cleaning expert. You do need to be someone who takes pride in a job well done.
              </p>
            </AnimatedSection>

            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {[
                "You want to be your own boss without starting from scratch",
                "You&apos;re happy to work with your hands and meet customers face-to-face",
                "You&apos;re reliable — you turn up when you say you will",
                "You&apos;ve got a full UK driving licence",
                "You can commit full-time from day one",
                "You&apos;re coachable and open to following a proven system",
              ].map((item, i) => (
                <AnimatedSection key={i} delay={i * 0.05}>
                  <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
                    <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </span>
                    <span className="text-sm font-medium text-slate-700" dangerouslySetInnerHTML={{ __html: item }} />
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ PROCESS ══════════ */}
        <section className="bg-slate-950 py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center">
              <span className="inline-flex items-center rounded-full border border-primary-500/20 bg-primary-500/10 px-3 py-1 text-xs font-semibold text-primary-300 backdrop-blur-sm">
                How It Works
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                From First Enquiry to First Job in 6 Weeks
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
                A clear, no-pressure path. We&apos;re as picky about who we work with as you should be.
              </p>
            </AnimatedSection>

            <div className="mt-12 grid gap-6 md:grid-cols-3 lg:grid-cols-5">
              {process.map((s, i) => (
                <AnimatedSection key={s.step} delay={i * 0.08}>
                  <div className="h-full rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 text-sm font-bold text-white">
                      {s.step}
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-white">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.desc}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ TESTIMONIAL ══════════ */}
        <section className="bg-white py-16 lg:py-24">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <AnimatedSection>
              <div className="flex justify-center">
                <svg className="h-10 w-10 text-primary-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
                </svg>
              </div>
              <p className="mt-6 text-xl font-medium leading-relaxed text-slate-700 sm:text-2xl">
                &ldquo;I&apos;d been a delivery driver for 12 years. Six months in with Fresh For Less
                and I&apos;m earning more, working fewer hours, and my kids see me at teatime. Best
                decision I&apos;ve made.&rdquo;
              </p>
              <div className="mt-6">
                <p className="font-semibold text-slate-900">Mark D.</p>
                <p className="text-sm text-slate-500">Franchisee — Wirral & Chester</p>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* ══════════ FAQ ══════════ */}
        <section className="bg-slate-50 py-16 lg:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center">
              <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                FAQ
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Common Questions
              </h2>
            </AnimatedSection>

            <div className="mt-12 space-y-3">
              {franchiseFaqs.map((f, i) => (
                <AnimatedSection key={f.q} delay={i * 0.05}>
                  <details className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all open:shadow-md">
                    <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-semibold text-slate-900">
                      {f.q}
                      <svg className="h-5 w-5 flex-shrink-0 text-slate-400 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </summary>
                    <p className="mt-4 text-sm leading-relaxed text-slate-600">{f.a}</p>
                  </details>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ ENQUIRY FORM ══════════ */}
        <section id="enquire" className="bg-white py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl">
              <AnimatedSection className="text-center">
                <span className="inline-flex items-center rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700 ring-1 ring-accent-100">
                  Register Your Interest
                </span>
                <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                  Let&apos;s Have a Chat
                </h2>
                <p className="mt-4 text-lg text-slate-600">
                  Fill in the form and we&apos;ll be in touch within 48 hours. No pressure, no hard sell —
                  just an honest conversation about whether it&apos;s the right fit.
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
                      <h4 className="mt-4 text-xl font-bold text-slate-900">Thanks — we&apos;ve got it.</h4>
                      <p className="mt-2 text-sm text-slate-600">
                        One of the team will be in touch within 48 hours. Keep an eye on your inbox
                        (and please check spam just in case).
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <input type="hidden" name="access_key" value="ef4b17e6-367d-4c61-9f46-9c5ffa4045d7" />
                      <input type="hidden" name="subject" value="New Franchise Enquiry — Fresh For Less" />
                      <input type="hidden" name="from_name" value="Fresh For Less Website" />
                      <input
                        type="text"
                        name="_honey"
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden="true"
                        style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, width: 0 }}
                      />

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="fr-name" className="mb-1.5 block text-sm font-medium text-slate-700">
                            Full Name
                          </label>
                          <input
                            type="text"
                            id="fr-name"
                            name="name"
                            required
                            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                            placeholder="Jane Smith"
                          />
                        </div>
                        <div>
                          <label htmlFor="fr-phone" className="mb-1.5 block text-sm font-medium text-slate-700">
                            Phone
                          </label>
                          <input
                            type="tel"
                            id="fr-phone"
                            name="phone"
                            required
                            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                            placeholder="07700 900 000"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="fr-email" className="mb-1.5 block text-sm font-medium text-slate-700">
                          Email
                        </label>
                        <input
                          type="email"
                          id="fr-email"
                          name="email"
                          required
                          className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                          placeholder="jane@example.com"
                        />
                      </div>

                      <div>
                        <label htmlFor="fr-location" className="mb-1.5 block text-sm font-medium text-slate-700">
                          Town / Area You&apos;d Cover
                        </label>
                        <input
                          type="text"
                          id="fr-location"
                          name="location"
                          required
                          className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                          placeholder="e.g. Bolton, or M14 3XX"
                        />
                      </div>

                      <div>
                        <label htmlFor="fr-experience" className="mb-1.5 block text-sm font-medium text-slate-700">
                          Any Relevant Experience?
                        </label>
                        <select
                          id="fr-experience"
                          name="experience"
                          required
                          className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                        >
                          <option value="">Select...</option>
                          <option>None — starting fresh</option>
                          <option>Cleaning or trade background</option>
                          <option>Self-employed / ran a business before</option>
                          <option>Sales or customer-facing</option>
                          <option>Other</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="fr-notes" className="mb-1.5 block text-sm font-medium text-slate-700">
                          Anything Else We Should Know?
                        </label>
                        <textarea
                          id="fr-notes"
                          name="notes"
                          rows={3}
                          className="w-full resize-none rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                          placeholder="Timescale, budget, questions..."
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={formSending}
                        className="w-full rounded-lg bg-accent-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent-600/25 transition-all hover:bg-accent-700 hover:shadow-accent-600/40 active:scale-[0.98] disabled:opacity-60"
                      >
                        {formSending ? "Sending..." : "Send My Enquiry"}
                      </button>
                      <p className="text-center text-xs text-slate-500">
                        Your details stay private. We&apos;ll reply within 48 hours.
                      </p>
                    </form>
                  )}
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <QuoteModal isOpen={quoteOpen} onClose={closeQuote} />
    </>
  );
}
