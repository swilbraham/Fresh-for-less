"use client";

import { motion } from "framer-motion";

export default function Hero({ onQuoteClick }: { onQuoteClick: () => void }) {
  return (
    <section className="relative min-h-[100dvh] overflow-hidden bg-slate-950">
      {/* Background Image + Gradient Layers */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-bg.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/75" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950/80 via-slate-900/60 to-slate-950/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-primary-900)_0%,_transparent_50%)] opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--color-accent-900)_0%,_transparent_50%)] opacity-20" />
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* Floating Orbs */}
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

      <div className="relative mx-auto flex min-h-[100dvh] max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-12 py-32 lg:grid-cols-5 lg:py-40">
          <div className="lg:col-span-3">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-4 py-1.5 text-xs font-medium text-primary-300 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-400 animate-pulse" />
                Trusted by 2,000+ Families &amp; Businesses
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
            >
              Carpets That Look{" "}
              <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                Brand New
              </span>
              <br />
              Without the Brand-New Price
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400 sm:text-xl"
            >
              Professional deep-cleaning that removes stubborn stains, allergens, and odours — leaving your home healthier and your carpets looking fresh. Affordable rates, guaranteed results.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
            >
              <button
                onClick={onQuoteClick}
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

            {/* Trust Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.75 }}
              className="mt-14 grid grid-cols-3 gap-6 border-t border-slate-800 pt-8"
            >
              {[
                { value: "4.9/5", label: "Customer Rating" },
                { value: "2,000+", label: "Homes Cleaned" },
                { value: "100%", label: "Satisfaction Guaranteed" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-white sm:text-3xl">{stat.value}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Logo Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="hidden lg:col-span-2 lg:flex lg:items-center lg:justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary-500/20 blur-3xl" />
              <img
                src="/images/logo.png"
                alt="Fresh For Less Carpet Cleaning"
                className="relative h-72 w-72 object-contain drop-shadow-2xl xl:h-80 xl:w-80"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
