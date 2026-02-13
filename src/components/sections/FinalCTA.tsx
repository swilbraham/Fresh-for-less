"use client";

import { motion } from "framer-motion";
import AnimatedSection from "../AnimatedSection";

export default function FinalCTA({ onQuoteClick }: { onQuoteClick: () => void }) {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-20 lg:py-28">
      {/* Background with image */}
      <div className="absolute inset-0">
        <img
          src="/images/cta-interior.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
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

      {/* Floating orbs */}
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
            Get your free, no-obligation quote in minutes. We&apos;ll assess your needs and provide transparent pricing — no hidden fees, no pressure. Just honest, professional service.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <button
              onClick={onQuoteClick}
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

          {/* Trust row */}
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
  );
}
