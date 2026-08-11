"use client";

import AnimatedSection from "../AnimatedSection";

type Package = {
  name: string;
  price: number;
  originalPrice?: number;
  subtitle: string;
  description: string;
  popular: boolean;
  features: string[];
};

const packages: Package[] = [
  {
    name: "3 Rooms Cleaned",
    price: 99,
    originalPrice: 150,
    subtitle: "per service",
    description: "Our most popular choice — save £51 today",
    popular: true,
    features: [
      "3 rooms of your choice — professionally deep-cleaned",
      "Hot water extraction — the industry gold standard",
      "Pre-treatment of all stains & high-traffic areas",
      "Deodorising treatment included",
      "Typically dry in 2–4 hours",
      "Free hallway clean",
      "100% satisfaction guarantee",
    ],
  },
];

const trustBadges = [
  {
    label: "Fully Insured",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
  },
  {
    label: "DBS Checked",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
      </svg>
    ),
  },
  {
    label: "Eco-Friendly Products",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
      </svg>
    ),
  },
  {
    label: "Satisfaction Guaranteed",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
      </svg>
    ),
  },
];

export default function Pricing({ onQuoteClick }: { onQuoteClick: () => void }) {
  return (
    <section id="pricing" className="relative overflow-hidden bg-slate-50 py-20 lg:py-28">
      {/* Top border accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedSection className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700 ring-1 ring-accent-200">
            Simple Pricing
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Affordable Packages. <br className="hidden sm:block" />
            No Hidden Fees.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Transparent pricing with everything included. Pick the package that suits your home and book today.
          </p>
        </AnimatedSection>

        {/* Pricing cards */}
        <div className="mx-auto mt-14 grid max-w-md gap-6 lg:gap-8">
          {packages.map((pkg, i) => (
            <AnimatedSection key={pkg.name} delay={i * 0.1}>
              <div
                className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-lg lg:p-8 ${
                  pkg.popular
                    ? "border-accent-400 shadow-lg shadow-accent-500/15 ring-2 ring-accent-300 hover:shadow-accent-500/25"
                    : "border-slate-200/80 hover:border-primary-200 hover:shadow-primary-500/5"
                }`}
              >
                {/* Popular badge */}
                {pkg.popular && (
                  <div className="absolute top-0 right-6">
                    <div className="rounded-b-lg bg-accent-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
                      🔥 Limited Offer
                    </div>
                  </div>
                )}

                {/* Frosted hover glow */}
                <div
                  className={`absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity group-hover:opacity-100 ${
                    pkg.popular ? "bg-accent-100" : "bg-primary-50"
                  }`}
                />

                <div className="relative flex flex-1 flex-col">
                  {/* Package name */}
                  <h3 className="text-lg font-bold text-slate-900">{pkg.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{pkg.description}</p>

                  {/* Price */}
                  <div className="mt-5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span
                      className={`text-4xl font-extrabold tracking-tight ${
                        pkg.popular ? "text-accent-600" : "text-slate-900"
                      }`}
                    >
                      &pound;{pkg.price}
                    </span>
                    {pkg.originalPrice && (
                      <span className="text-lg font-semibold text-slate-400 line-through">
                        &pound;{pkg.originalPrice}
                      </span>
                    )}
                    <span className="text-sm font-medium text-slate-500">{pkg.subtitle}</span>
                  </div>

                  {/* Save badge */}
                  {pkg.originalPrice && (
                    <div className="mt-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent-700 ring-1 ring-accent-200">
                        Save &pound;{pkg.originalPrice - pkg.price} · {Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100)}% off
                      </span>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="my-6 h-px bg-slate-100" />

                  {/* Features */}
                  <ul className="flex-1 space-y-3">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-slate-700">
                        <svg
                          className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={onQuoteClick}
                    className={`mt-8 w-full rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
                      pkg.popular
                        ? "bg-primary-600 text-white shadow-lg shadow-primary-500/25 hover:bg-primary-700 hover:shadow-primary-500/30"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    Get a Free Quote
                  </button>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Additional rooms note */}
        <AnimatedSection delay={0.35}>
          <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-slate-500">
            Need more rooms? Additional rooms from just &pound;33 each. A minimum cleaning charge of &pound;60.00 applies. Commercial quotes available on request.
          </p>
        </AnimatedSection>

        {/* Trust badges */}
        <AnimatedSection delay={0.45}>
          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            {trustBadges.map((badge) => (
              <div
                key={badge.label}
                className="flex flex-col items-center gap-2 rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-100"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 text-accent-500">
                  {badge.icon}
                </div>
                <span className="text-xs font-semibold text-slate-700">{badge.label}</span>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
