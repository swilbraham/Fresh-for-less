"use client";

import AnimatedSection from "../AnimatedSection";

const credentials = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
      </svg>
    ),
    label: "Licensed & Insured",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
      </svg>
    ),
    label: "Family Owned & Operated",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    label: "10+ Years Experience",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
    label: "Eco-Friendly Products",
  },
];

export default function About() {
  return (
    <section id="about" className="relative overflow-hidden bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Image / Visual */}
          <AnimatedSection>
            <div className="relative">
              {/* Team photo */}
              <div className="mb-6 overflow-hidden rounded-2xl shadow-lg">
                <img
                  src="/images/about-cleaner.jpg"
                  alt="Professional carpet cleaning in action"
                  className="h-56 w-full object-cover sm:h-64"
                />
              </div>
              {/* Dashboard-style card */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 shadow-xl">
                {/* Stats dashboard */}
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Performance Dashboard</h4>
                    <p className="text-xs text-slate-500">Customer satisfaction metrics</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Customer Satisfaction", value: "99.2%", color: "bg-accent-500" },
                    { label: "On-Time Arrivals", value: "98.7%", color: "bg-primary-500" },
                    { label: "Repeat Customers", value: "87%", color: "bg-amber-500" },
                    { label: "5-Star Reviews", value: "4.9/5", color: "bg-violet-500" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                      <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                      <p className="mt-1 text-xs text-slate-500">{stat.label}</p>
                      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${stat.color}`}
                          style={{ width: stat.value.includes("%") ? stat.value : "98%" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Credential badges */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {credentials.map((c) => (
                    <div key={c.label} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                      <span className="text-primary-600">{c.icon}</span>
                      <span className="text-xs font-medium text-slate-700">{c.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -bottom-6 -right-6 -z-10 h-64 w-64 rounded-full bg-primary-50 blur-3xl" />
            </div>
          </AnimatedSection>

          {/* Copy */}
          <AnimatedSection delay={0.2}>
            <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 ring-1 ring-primary-100">
              About Us
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              A Local Team That Cares About Your Home
            </h2>
            <p className="mt-6 text-base leading-relaxed text-slate-600">
              Fresh For Less was founded on a simple belief: everyone deserves clean, healthy carpets — and no one should have to pay a fortune for it. We&apos;re a locally owned and operated team of certified professionals who treat every home like our own.
            </p>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              With over a decade of experience and thousands of satisfied customers, we&apos;ve built our reputation on honest pricing, reliable service, and results that speak for themselves. Our technicians are background-checked, fully insured, and trained in the latest cleaning technologies.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              {[
                "Family-owned & operated",
                "Eco-friendly solutions",
                "Background-checked crew",
                "Same-week scheduling",
              ].map((item) => (
                <span
                  key={item}
                  className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700"
                >
                  <svg className="h-4 w-4 text-accent-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  {item}
                </span>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
