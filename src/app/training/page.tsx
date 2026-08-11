"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";

/* ─────────────────── DATA ─────────────────── */

const days = [
  {
    day: "Day 1",
    title: "Foundations on the Job",
    points: [
      "Van setup and equipment walkthrough",
      "Customer introductions and site etiquette",
      "Carpet inspections and fibre identification",
      "Pre-vacuuming and preparation",
      "Mixing chemicals safely and correctly",
      "Assisting on 2–4 real customer jobs",
    ],
  },
  {
    day: "Days 2–4",
    title: "Hands-On, Building Responsibility",
    points: [
      "Pre-treatment and stain assessment",
      "Agitation techniques",
      "Operating the extraction machine",
      "Specialist stain removal",
      "Drying and finishing",
      "Talking to customers, quoting and upselling",
    ],
  },
  {
    day: "Day 5",
    title: "You Run the Jobs",
    points: [
      "Complete jobs yourself under supervision",
      "Pricing and business setup advice",
      "Marketing that actually wins work",
      "Open Q&A on anything carpet cleaning",
      "Certificate of completion",
    ],
  },
];

const highlights = [
  {
    title: "Real Homes",
    desc: "Real stains, pets, furniture and customer interactions — not staged samples in a workshop.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    title: "One-to-One",
    desc: "One trainee per course. A full working week of individual training with maximum hands-on time.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    ),
  },
  {
    title: "Business Skills",
    desc: "Quoting, pricing, upselling and marketing — learned live on jobs, then reviewed in depth on day 5.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
      </svg>
    ),
  },
  {
    title: "Certificate",
    desc: "Finish with a certificate of completion for your 5-day practical carpet cleaning training.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
      </svg>
    ),
  },
];

const learnPoints = [
  "Hot-water extraction on real carpets",
  "Stain removal on genuine household stains",
  "Upholstery cleaning basics",
  "Quoting jobs and pricing confidently",
  "Handling customers in their own homes",
  "Working efficiently to a daily schedule",
  "Chemical safety and dilution",
  "Marketing and winning your first customers",
];

const faqs = [
  {
    question: "Do I need any experience?",
    answer:
      "None at all. The course is designed for complete beginners. By day five you will have cleaned carpets in real customers' homes, dealt with real stains and spoken to real customers — all under direct supervision.",
  },
  {
    question: "Is this classroom training?",
    answer:
      "No — that's the whole point. There is no workshop and no demo rig. Every day you are out on genuine customer bookings with an experienced technician, learning in real homes with real furniture, pets and stains.",
  },
  {
    question: "Am I insured while training?",
    answer:
      "Yes. All work is carried out under the direct supervision of our fully insured technician, and trainees are covered while on our jobs. Customers give written consent before a trainee attends their booking.",
  },
  {
    question: "What do I need to bring?",
    answer:
      "Just comfortable work clothes and sturdy footwear. All equipment, chemicals and materials are provided — you'll be using the same professional kit we use every day.",
  },
  {
    question: "Will I be ready to start my own business afterwards?",
    answer:
      "You will have completed a full week of real jobs, plus a dedicated session on pricing, business setup and marketing. Most trainees leave with everything they need to take their first paying customer. You also receive a certificate of completion.",
  },
  {
    question: "How many people are on each course?",
    answer:
      "One. We deliberately take a single trainee at a time so you get maximum hands-on time on every job and our customers get the same quality of service as always.",
  },
  {
    question: "Where is the course held? I'm not local — can I still attend?",
    answer:
      "The course runs on our real customer rounds across Wirral, Liverpool and Chester, and trainees join us from all over the UK. We're easy to reach — around 40 minutes from Liverpool, an hour from Manchester, and close to the M53 and M56 — with plenty of affordable hotels and B&Bs nearby. Tell us where you're travelling from and we'll suggest somewhere convenient to stay for the week.",
  },
  {
    question: "Do you run courses in other parts of the country?",
    answer:
      "No — and that's deliberate. The training happens on our genuine customer bookings, which is exactly what makes it worth more than a classroom course. Trainees travel to us from across England, Scotland, Wales and Northern Ireland for the week, then take everything home to launch in their own area.",
  },
  {
    question: "Can I launch under the Fresh For Less brand instead of going it alone?",
    answer:
      "Possibly — our best course graduates can apply to join the Fresh For Less network as licensees: an exclusive territory in your own area, our brand, area pages on this website, and centrally managed Google and Meta advertising feeding you leads, for a licence fee and a monthly fee. Your £995 course fee is credited in full against the licence. Mention it in your enquiry and we'll talk openly about the numbers during your course week.",
  },
];

const courseSchema = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "5-Day Live Carpet Cleaning Training Course",
  description:
    "Hands-on carpet cleaning training on real customer jobs. One trainee per course, all equipment provided, certificate of completion. Trainees welcome from anywhere in the UK.",
  provider: {
    "@type": "LocalBusiness",
    name: "Fresh For Less Carpet Cleaning",
    telephone: "0330 043 4811",
    url: "https://www.freshforlesscarpetcleaning.co.uk",
    address: {
      "@type": "PostalAddress",
      addressRegion: "Merseyside",
      addressCountry: "GB",
    },
  },
  offers: {
    "@type": "Offer",
    price: "995",
    priceCurrency: "GBP",
    category: "Paid",
  },
  hasCourseInstance: {
    "@type": "CourseInstance",
    courseMode: "Onsite",
    courseWorkload: "P5D",
    location: {
      "@type": "Place",
      name: "Wirral, Merseyside (training on real customer jobs across Wirral, Liverpool and Chester)",
    },
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

/* ─────────────────── HELPERS ─────────────────── */

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-slate-50"
      >
        <span className="pr-4 font-semibold text-slate-900">{question}</span>
        <svg
          className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-4 leading-relaxed text-slate-600">{answer}</div>
      )}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="mt-0.5 h-5 w-5 shrink-0 text-accent-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

/* ─────────────────── PAGE ─────────────────── */

export default function TrainingPage() {
  const [formSending, setFormSending] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const scrollToEnquiry = () => {
    document.getElementById("enquiry")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Honeypot — silently drop bot submissions
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Navbar onQuoteClick={scrollToEnquiry} />

      <main>
        {/* ══════════ HERO ══════════ */}
        <section className="relative overflow-hidden bg-slate-950">
          <div className="absolute inset-0">
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

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl py-32 text-center lg:py-40">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                <span className="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-4 py-1.5 text-xs font-medium text-primary-300 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-400" />
                  5-Day Live Training Experience
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl"
              >
                Learn Carpet Cleaning{" "}
                <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                  on Real Customer Jobs
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-400 sm:text-xl"
              >
                No classroom. No demo rig. You spend a full working week on genuine
                customer bookings alongside an experienced, fully insured technician —
                and finish ready to take your first paying customer. Trainees welcome
                from anywhere in the UK.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
              >
                <button
                  onClick={scrollToEnquiry}
                  className="group relative overflow-hidden rounded-xl bg-primary-600 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-primary-600/30 transition-all hover:bg-primary-700 hover:shadow-primary-600/50 active:scale-[0.98]"
                >
                  <span className="relative z-10">Enquire About the Next Course</span>
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

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.75 }}
                className="mx-auto mt-14 flex max-w-lg flex-wrap items-center justify-center gap-x-8 gap-y-4 border-t border-slate-800 pt-8"
              >
                {[
                  { value: "5 Days", label: "On Real Jobs" },
                  { value: "1", label: "Trainee Per Course" },
                  { value: "10–15+", label: "Customer Jobs Attended" },
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

        {/* ══════════ WHY REAL JOBS ══════════ */}
        <section className="bg-white py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Why Train on Real Jobs?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
                A classroom can show you the theory. It can&apos;t show you a nervous
                customer, a ten-year-old wine stain or a landing full of furniture.
                Our course can — because every day is a real working day.
              </p>
            </AnimatedSection>

            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {highlights.map((h, i) => (
                <AnimatedSection key={h.title} delay={i * 0.1}>
                  <div className="group h-full rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-sm transition-all hover:shadow-lg">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-100">
                      {h.icon}
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-slate-900">{h.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{h.desc}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ COURSE OUTLINE ══════════ */}
        <section className="bg-slate-50 py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center">
              <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 ring-1 ring-primary-100">
                The Week at a Glance
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                The 5-Day Course Outline
              </h2>
            </AnimatedSection>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {days.map((d, i) => (
                <AnimatedSection key={d.day} delay={i * 0.1}>
                  <div className="h-full rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <span className="inline-block rounded-full bg-primary-50 px-3 py-1 text-sm font-bold text-primary-700">
                      {d.day}
                    </span>
                    <h3 className="mt-3 font-bold text-slate-900">{d.title}</h3>
                    <ul className="mt-4 space-y-2.5">
                      {d.points.map((p) => (
                        <li key={p} className="flex items-start gap-2.5">
                          <CheckIcon />
                          <span className="text-sm text-slate-600">{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </AnimatedSection>
              ))}
            </div>

            <AnimatedSection delay={0.3}>
              <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-slate-500">
                Every customer is asked in advance and gives written consent before a
                trainee attends their booking. Their price and service stay exactly the same.
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* ══════════ WHAT YOU'LL LEARN ══════════ */}
        <section className="bg-white py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <AnimatedSection className="text-center">
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                  What You&apos;ll Learn
                </h2>
              </AnimatedSection>
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {learnPoints.map((point, i) => (
                  <AnimatedSection key={point} delay={i * 0.05}>
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-5 py-4">
                      <CheckIcon />
                      <span className="font-medium text-slate-700">{point}</span>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ UK-WIDE ══════════ */}
        <section className="bg-white py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Train With Us From Anywhere in the UK
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
                Because the course runs on real customer jobs, it happens on our rounds
                across Wirral, Liverpool and Chester — and trainees travel to us from all
                over England, Scotland, Wales and Northern Ireland to learn this way.
                Most book a local hotel or B&amp;B for the week and treat it as a working
                residential course.
              </p>
            </AnimatedSection>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                {
                  title: "Easy to reach",
                  desc: "Minutes from the M53 and M56, around 40 minutes from Liverpool and an hour from Manchester. Direct trains to Liverpool from most of the UK.",
                },
                {
                  title: "Affordable stays",
                  desc: "Plenty of reasonably priced hotels and B&Bs nearby — tell us where you're travelling from and we'll suggest somewhere convenient for the week.",
                },
                {
                  title: "Launch back home",
                  desc: "Everything you learn — the technical skills, pricing and marketing — is designed to set up your own round in your own area, wherever that is.",
                },
              ].map((item, i) => (
                <AnimatedSection key={item.title} delay={i * 0.1}>
                  <div className="h-full rounded-2xl bg-slate-50 p-6">
                    <h3 className="font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.desc}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ PRICING ══════════ */}
        <section className="bg-slate-50 py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl">
              <AnimatedSection>
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl sm:p-10">
                  <span className="inline-flex items-center rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700 ring-1 ring-accent-100">
                    One Trainee Per Course
                  </span>
                  <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                    Course Fee
                  </h2>
                  <p className="mt-4 text-5xl font-extrabold text-primary-600">£995</p>
                  <p className="mt-1 text-sm text-slate-500">per person · full 5-day course</p>
                  <ul className="mx-auto mt-8 max-w-md space-y-3 text-left">
                    {[
                      "A full working week, one-to-one, on real customer jobs",
                      "All equipment, chemicals and materials provided",
                      "Dedicated pricing, business setup and marketing session",
                      "Certificate of completion",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <CheckIcon />
                        <span className="text-sm text-slate-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={scrollToEnquiry}
                    className="mt-8 w-full rounded-xl bg-primary-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-primary-600/25 transition-all hover:bg-primary-700 active:scale-[0.98] sm:w-auto"
                  >
                    Reserve Your Week
                  </button>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* ══════════ NETWORK / FRANCHISE ══════════ */}
        <section className="bg-slate-950 py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <AnimatedSection>
                <span className="inline-flex items-center gap-2 rounded-full border border-accent-500/20 bg-accent-500/10 px-4 py-1.5 text-xs font-medium text-accent-300">
                  For Our Best Graduates
                </span>
                <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  Join the Fresh For Less Network
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
                  Don&apos;t want to build a brand from scratch? Our strongest trainees
                  can apply to launch under the Fresh For Less name in their own area —
                  a franchise-style licence with our marketing engine behind you.
                </p>
              </AnimatedSection>
              <div className="mt-10 grid gap-4 text-left sm:grid-cols-2">
                {[
                  {
                    title: "Exclusive territory",
                    desc: "The Fresh For Less brand and van livery in your own patch — one licensee per area.",
                  },
                  {
                    title: "Leads from day one",
                    desc: "Area pages on this website plus Google and Meta ads, run centrally by us for your territory.",
                  },
                  {
                    title: "Systems and support",
                    desc: "The full operations manual, pricing structure and direct phone support when a job gets tricky.",
                  },
                  {
                    title: "Course fee credited",
                    desc: "Your £995 training fee is credited in full against the licence fee if you join the network.",
                  },
                ].map((item, i) => (
                  <AnimatedSection key={item.title} delay={i * 0.08}>
                    <div className="h-full rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                      <h3 className="font-bold text-white">{item.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.desc}</p>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
              <AnimatedSection delay={0.3}>
                <p className="mt-8 text-sm text-slate-500">
                  Places are limited and offered to graduates we&apos;d trust with our own
                  customers. Interested? Mention the network in your enquiry below.
                </p>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* ══════════ FAQ ══════════ */}
        <section className="bg-white py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <AnimatedSection className="text-center">
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                  Frequently Asked Questions
                </h2>
              </AnimatedSection>
              <div className="mt-10 space-y-3">
                {faqs.map((faq) => (
                  <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ ENQUIRY FORM ══════════ */}
        <section id="enquiry" className="bg-slate-50 py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl">
              <AnimatedSection className="text-center">
                <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 ring-1 ring-primary-100">
                  Limited Places
                </span>
                <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                  Enquire About the Next Course
                </h2>
                <p className="mt-4 text-lg text-slate-600">
                  One trainee per course means dates book up fast. Send us your details
                  and we&apos;ll come back with the next available week.
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
                        We&apos;ve received your enquiry and will get back to you with
                        available course dates, usually within 2 hours.
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <input type="hidden" name="access_key" value="ef4b17e6-367d-4c61-9f46-9c5ffa4045d7" />
                      <input type="hidden" name="subject" value="Training Course Enquiry — Fresh For Less" />
                      <input type="hidden" name="from_name" value="Fresh For Less Website" />
                      {/* Honeypot — bots fill this; humans never see it */}
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
                          <label htmlFor="tr-name" className="mb-1.5 block text-sm font-medium text-slate-700">
                            Full Name
                          </label>
                          <input
                            type="text"
                            id="tr-name"
                            name="name"
                            required
                            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                            placeholder="Jane Smith"
                          />
                        </div>
                        <div>
                          <label htmlFor="tr-phone" className="mb-1.5 block text-sm font-medium text-slate-700">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            id="tr-phone"
                            name="phone"
                            required
                            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                            placeholder="07700 900 000"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="tr-email" className="mb-1.5 block text-sm font-medium text-slate-700">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="tr-email"
                          name="email"
                          required
                          className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                          placeholder="jane@example.com"
                        />
                      </div>
                      <div>
                        <label htmlFor="tr-message" className="mb-1.5 block text-sm font-medium text-slate-700">
                          Anything You&apos;d Like to Ask?
                        </label>
                        <textarea
                          id="tr-message"
                          name="message"
                          rows={3}
                          className="w-full resize-none rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                          placeholder="Preferred dates, experience level, questions about the course..."
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={formSending}
                        className="w-full rounded-xl bg-primary-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-primary-600/25 transition-all hover:bg-primary-700 active:scale-[0.98] disabled:opacity-60"
                      >
                        {formSending ? "Sending..." : "Send Enquiry"}
                      </button>
                    </form>
                  )}
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
