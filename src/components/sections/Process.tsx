"use client";

import AnimatedSection from "../AnimatedSection";

const steps = [
  {
    step: "01",
    title: "Request a Quote",
    description:
      "Fill out our quick form or give us a call. Tell us about your space, and we'll provide a transparent, no-obligation quote within 2 hours.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
      </svg>
    ),
  },
  {
    step: "02",
    title: "We Arrive On Time",
    description:
      "Our uniformed, background-checked technicians show up at the scheduled time — fully equipped with professional-grade cleaning systems.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
  {
    step: "03",
    title: "Deep Clean Magic",
    description:
      "We pre-treat stains, then deep clean every fibre with hot water extraction. We move carefully through each room, ensuring nothing is missed.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
      </svg>
    ),
  },
  {
    step: "04",
    title: "Enjoy Fresh Carpets",
    description:
      "Walk through your home and see the difference. Fresh, clean, soft carpets that look and smell amazing — with fast dry times so you can enjoy them sooner.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
      </svg>
    ),
  },
];

export default function Process() {
  return (
    <section id="process" className="relative overflow-hidden bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700 ring-1 ring-accent-200">
            Simple Process
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Four Steps to Spotless
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            We make professional carpet cleaning effortless. Here&apos;s how it works.
          </p>
        </AnimatedSection>

        {/* Clean room result image */}
        <AnimatedSection className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl shadow-lg">
          <img
            src="/images/clean-room.jpg"
            alt="Beautiful, freshly cleaned living room"
            className="h-48 w-full object-cover sm:h-56 lg:h-64"
          />
        </AnimatedSection>

        <div className="relative mt-12">
          {/* Connection line */}
          <div className="absolute left-8 top-0 bottom-0 hidden w-px bg-gradient-to-b from-primary-200 via-primary-300 to-accent-200 lg:left-1/2 lg:block" />

          <div className="space-y-8 lg:space-y-0">
            {steps.map((step, i) => (
              <AnimatedSection key={step.step} delay={i * 0.15}>
                <div className={`relative flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-16 ${i % 2 === 1 ? "lg:flex-row-reverse" : ""} ${i > 0 ? "lg:mt-8" : ""}`}>
                  {/* Content */}
                  <div className={`flex-1 ${i % 2 === 1 ? "lg:text-right" : ""}`}>
                    <div className={`inline-flex items-center gap-3 ${i % 2 === 1 ? "lg:flex-row-reverse" : ""}`}>
                      <span className="text-sm font-bold text-primary-600">{step.step}</span>
                      <div className="h-px w-8 bg-primary-300" />
                    </div>
                    <h3 className="mt-3 text-2xl font-bold text-slate-900">{step.title}</h3>
                    <p className="mt-3 max-w-md text-base leading-relaxed text-slate-600">
                      {step.description}
                    </p>
                  </div>

                  {/* Center node (desktop) */}
                  <div className="hidden lg:flex lg:items-center lg:justify-center">
                    <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-primary-200 bg-white text-primary-600 shadow-lg shadow-primary-500/10">
                      {step.icon}
                    </div>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="hidden flex-1 lg:block" />
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
