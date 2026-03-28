"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QuoteModal from "@/components/QuoteModal";
import WhatsAppButton from "@/components/WhatsAppButton";
import AnimatedSection from "@/components/AnimatedSection";
import { getAreaBySlug, getAreasByRegion, areas } from "@/data/areas";

const services = [
  {
    title: "Carpet Cleaning",
    description: "Deep hot-water extraction to remove dirt, stains, and allergens from all carpet types.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5M10.5 21H3m1.5 0h1.5m0 0V3.545M6 21V9m0-3.545A2.25 2.25 0 0 1 8.25 3h7.5A2.25 2.25 0 0 1 18 5.25v.295" />
      </svg>
    ),
  },
  {
    title: "Upholstery Cleaning",
    description: "Professional cleaning for sofas, armchairs, and fabric furniture to restore freshness.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    title: "Stain Removal",
    description: "Specialist stain treatment for wine, coffee, pet accidents, and other stubborn marks.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
      </svg>
    ),
  },
  {
    title: "Pet Odour Treatment",
    description: "Eliminate pet smells at the source with our deep-cleaning deodorising treatment.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
      </svg>
    ),
  },
  {
    title: "Commercial Cleaning",
    description: "Tailored carpet cleaning for offices, shops, pubs, and commercial premises.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
  },
  {
    title: "Rug Cleaning",
    description: "Careful cleaning for all rug types including delicate oriental and antique rugs.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
      </svg>
    ),
  },
];

const trustPoints = [
  {
    title: "Local Team",
    description: "Our technicians live and work in the area, so we understand local needs and can respond quickly.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
      </svg>
    ),
  },
  {
    title: "Fast Response",
    description: "We offer same-week availability and flexible scheduling to fit around your busy life.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
  {
    title: "Eco-Friendly Products",
    description: "We use safe, non-toxic cleaning solutions that are gentle on your family, pets, and the environment.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
      </svg>
    ),
  },
  {
    title: "Transparent Pricing",
    description: "No hidden fees, no surprises. We provide clear quotes upfront so you know exactly what to expect.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
      </svg>
    ),
  },
  {
    title: "Satisfaction Guarantee",
    description: "We stand behind our work with a 100% satisfaction guarantee. Not happy? We'll re-clean for free.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
      </svg>
    ),
  },
  {
    title: "Fully Insured",
    description: "We carry full public liability insurance for your complete peace of mind.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
  },
];

export default function AreaPage({ slug }: { slug: string }) {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const openQuote = () => setQuoteOpen(true);
  const closeQuote = () => setQuoteOpen(false);

  const area = getAreaBySlug(slug);
  if (!area) return null;

  const nearbyAreaData = area.nearbyAreas
    .map((s) => areas.find((a) => a.slug === s))
    .filter(Boolean) as typeof areas;

  return (
    <>
      <Navbar onQuoteClick={openQuote} />
      <main>
        {/* ── Hero ─────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-slate-950 pt-24 pb-16 lg:pt-32 lg:pb-24">
          {/* Background layers */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-950/90 via-slate-900/80 to-slate-950/90" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-primary-900)_0%,_transparent_50%)] opacity-40" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--color-accent-900)_0%,_transparent_50%)] opacity-20" />
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
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

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-4"
            >
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                Back to Home
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-4 py-1.5 text-xs font-medium text-primary-300 backdrop-blur-sm">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                Serving {area.region}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              Carpet Cleaning in{" "}
              <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                {area.name}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-400"
            >
              {area.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-10 flex flex-col gap-4 sm:flex-row"
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
          </div>
        </section>

        {/* ── Services ─────────────────────────────────── */}
        <section className="bg-white py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div className="text-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-xs font-medium text-primary-700">
                  Our Services
                </span>
                <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                  Services Available in {area.name}
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
                  We offer a full range of professional cleaning services to homes and businesses throughout {area.name}.
                </p>
              </div>
            </AnimatedSection>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service, i) => (
                <AnimatedSection key={service.title} delay={i * 0.1}>
                  <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-primary-200 hover:shadow-lg hover:shadow-primary-100/50">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-100">
                      {service.icon}
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-slate-900">{service.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{service.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why Choose Us ────────────────────────────── */}
        <section className="bg-slate-50 py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div className="text-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-accent-200 bg-accent-50 px-4 py-1.5 text-xs font-medium text-accent-700">
                  Why Choose Us
                </span>
                <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                  Why Choose Fresh For Less in {area.name}?
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
                  We&apos;re proud to serve {area.name} with a service built on trust, quality, and genuine value.
                </p>
              </div>
            </AnimatedSection>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {trustPoints.map((point, i) => (
                <AnimatedSection key={point.title} delay={i * 0.1}>
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                      {point.icon}
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-slate-900">{point.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{point.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ── Nearby Areas ─────────────────────────────── */}
        <section className="bg-white py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div className="text-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-1.5 text-xs font-medium text-slate-700">
                  Areas We Cover
                </span>
                <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                  Nearby Areas We Serve
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
                  We also provide professional carpet cleaning in these areas near {area.name}.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                {nearbyAreaData.map((nearby) => (
                  <Link
                    key={nearby.slug}
                    href={`/areas/${nearby.slug}`}
                    className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 hover:shadow-md"
                  >
                    {nearby.name}
                  </Link>
                ))}
              </div>
            </AnimatedSection>

            {/* Additional region links */}
            <AnimatedSection delay={0.3}>
              <div className="mt-12 border-t border-slate-200 pt-8">
                <h3 className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-slate-500">
                  All {area.region} Areas
                </h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {getAreasByRegion(area.region)
                    .filter((a) => a.slug !== area.slug)
                    .map((a) => (
                      <Link
                        key={a.slug}
                        href={`/areas/${a.slug}`}
                        className="text-sm text-slate-500 transition-colors hover:text-primary-600"
                      >
                        {a.name}
                      </Link>
                    ))}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-slate-950 py-20 lg:py-28">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-950/70 via-slate-900/50 to-slate-950/70" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--color-primary-800)_0%,_transparent_60%)] opacity-30" />
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
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
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-400" />
                Limited Availability — Book This Week
              </span>

              <h2 className="mt-6 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Ready for Spotless Carpets in{" "}
                <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                  {area.name}?
                </span>
              </h2>

              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
                Get your free, no-obligation quote in minutes. We&apos;ll assess your needs and provide transparent
                pricing — no hidden fees, no pressure. Just honest, professional service in {area.name}.
              </p>

              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <button
                  onClick={openQuote}
                  className="group relative overflow-hidden rounded-xl bg-primary-600 px-10 py-4 text-base font-semibold text-white shadow-2xl shadow-primary-600/30 transition-all hover:bg-primary-700 hover:shadow-primary-600/50 active:scale-[0.98]"
                >
                  <span className="relative z-10">Get Your Free Quote Now</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500 opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
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
      <WhatsAppButton />
    </>
  );
}
