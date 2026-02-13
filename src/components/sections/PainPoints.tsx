"use client";

import AnimatedSection from "../AnimatedSection";

const painPoints = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
      </svg>
    ),
    title: "Stubborn Stains That Won't Budge",
    description:
      "Coffee spills, red wine, muddy footprints — no matter how much you scrub, those stains seem permanent. DIY methods just spread them around.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    title: "No Time to Deep Clean",
    description:
      "Between work, kids, and everything else, who has hours to spend wrestling with a rented carpet cleaner that barely works?",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
      </svg>
    ),
    title: "Allergies & Indoor Air Quality",
    description:
      "Dust mites, pet dander, and allergens trapped deep in your carpets can trigger sneezing, itchy eyes, and breathing issues — especially for kids.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
      </svg>
    ),
    title: "Overpriced Quotes From Big Companies",
    description:
      "Major carpet cleaning franchises charge a fortune for basic service. You deserve professional results without the premium price tag.",
  },
];

export default function PainPoints() {
  return (
    <section className="relative overflow-hidden bg-white py-20 lg:py-28">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--color-slate-100)_0%,_transparent_70%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 ring-1 ring-red-100">
            Sound Familiar?
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Dirty Carpets Are More Than Just an Eyesore
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            They affect your home&apos;s comfort, your family&apos;s health, and how you feel every time you walk through the door.
          </p>
        </AnimatedSection>

        {/* Visual banner */}
        <AnimatedSection className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl shadow-lg">
          <img
            src="/images/clean-carpet.jpg"
            alt="Close-up of clean, fresh carpet fibres"
            className="h-48 w-full object-cover sm:h-56 lg:h-64"
          />
        </AnimatedSection>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:gap-8">
          {painPoints.map((point, i) => (
            <AnimatedSection key={point.title} delay={i * 0.1}>
              <div className="group relative h-full rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:border-slate-300 hover:shadow-lg lg:p-8">
                {/* Frosted glass accent */}
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-red-50 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500 ring-1 ring-red-100">
                    {point.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-900">{point.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{point.description}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
