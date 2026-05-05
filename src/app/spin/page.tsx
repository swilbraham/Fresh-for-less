"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QuoteModal from "@/components/QuoteModal";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface Segment {
  label: string;
  color: string;
  textColor: string;
}

const SEGMENTS: Segment[] = [
  { label: "10% Off\nCarpet Cleaning", color: "#3b99f5", textColor: "#ffffff" },
  { label: "Free\nScotchgard", color: "#22c55e", textColor: "#ffffff" },
  { label: "15% Off\nUpholstery", color: "#257bea", textColor: "#ffffff" },
  { label: "Free Room\nwith 3+ Rooms", color: "#4ade80", textColor: "#052e16" },
  { label: "20% Off\nFirst Visit", color: "#1d64d7", textColor: "#ffffff" },
  { label: "Free\nHallway Clean", color: "#16a34a", textColor: "#ffffff" },
  { label: "£25 Off\nAny Service", color: "#60b8fa", textColor: "#172c54" },
  { label: "10% Off\nWhole House", color: "#86efac", textColor: "#052e16" },
];

const SEGMENT_ANGLE = 360 / SEGMENTS.length; // 45°
const STORAGE_KEY = "ffl_spin_result";

/* ------------------------------------------------------------------ */
/*  SVG Wheel helpers                                                  */
/* ------------------------------------------------------------------ */

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

/* ------------------------------------------------------------------ */
/*  Confetti                                                           */
/* ------------------------------------------------------------------ */

const CONFETTI_COLORS = ["#3b99f5", "#22c55e", "#257bea", "#4ade80", "#60b8fa", "#fbbf24"];

function Confetti() {
  const particles = useMemo(
    () =>
      Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 500,
        y: -(Math.random() * 300 + 150),
        rot: Math.random() * 720 - 360,
        scale: Math.random() * 0.6 + 0.4,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        delay: Math.random() * 0.3,
        width: Math.random() > 0.5 ? 8 : 6,
        height: Math.random() > 0.5 ? 14 : 10,
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute left-1/2 top-1/2 rounded-sm"
          style={{ width: p.width, height: p.height, backgroundColor: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
          animate={{
            x: p.x,
            y: [p.y, p.y + 500],
            opacity: [1, 1, 0],
            scale: p.scale,
            rotate: p.rot,
          }}
          transition={{ duration: 2.5, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Wheel SVG                                                          */
/* ------------------------------------------------------------------ */

const CX = 150;
const CY = 150;
const R = 140;

function WheelSVG() {
  return (
    <svg viewBox="0 0 300 300" className="h-full w-full" role="img" aria-label="Discount wheel with 8 prize segments">
      {/* Outer ring */}
      <circle cx={CX} cy={CY} r={R + 4} fill="none" stroke="#1e293b" strokeWidth={3} />

      {/* Segments */}
      {SEGMENTS.map((seg, i) => {
        const startAngle = i * SEGMENT_ANGLE;
        const endAngle = startAngle + SEGMENT_ANGLE;
        const midAngle = startAngle + SEGMENT_ANGLE / 2;
        const textR = R * 0.62;
        const textPos = polarToCartesian(CX, CY, textR, midAngle);
        const lines = seg.label.split("\n");
        // Flip text 180° for bottom-half segments so it's always readable
        const textRotation = midAngle > 90 && midAngle < 270 ? midAngle + 180 : midAngle;

        return (
          <g key={i}>
            {/* Slice */}
            <path d={describeArc(CX, CY, R, startAngle, endAngle)} fill={seg.color} stroke="#ffffff" strokeWidth={1.5} />

            {/* Text */}
            <text
              x={textPos.x}
              y={textPos.y}
              fill={seg.textColor}
              fontSize="9.5"
              fontWeight="700"
              textAnchor="middle"
              dominantBaseline="central"
              transform={`rotate(${textRotation}, ${textPos.x}, ${textPos.y})`}
            >
              {lines.map((line, li) => (
                <tspan key={li} x={textPos.x} dy={li === 0 ? (lines.length > 1 ? "-0.5em" : "0") : "1.15em"}>
                  {line}
                </tspan>
              ))}
            </text>
          </g>
        );
      })}

      {/* Segment divider dots at outer edge */}
      {SEGMENTS.map((_, i) => {
        const angle = i * SEGMENT_ANGLE;
        const dot = polarToCartesian(CX, CY, R - 6, angle);
        return <circle key={`dot-${i}`} cx={dot.x} cy={dot.y} r={2.5} fill="white" opacity={0.6} />;
      })}

      {/* Centre hub */}
      <circle cx={CX} cy={CY} r={28} fill="#ffffff" stroke="#e2e8f0" strokeWidth={2} />
      <circle cx={CX} cy={CY} r={22} fill="#f8fafc" />
      <text x={CX} y={CY} textAnchor="middle" dominantBaseline="central" fontSize="10" fontWeight="800" fill="#1e293b">
        SPIN
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

type SpinState = "idle" | "spinning" | "revealing" | "form" | "submitted";

export default function SpinPage() {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [spinState, setSpinState] = useState<SpinState>("idle");
  const [rotation, setRotation] = useState(0);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [sending, setSending] = useState(false);

  // Check localStorage for previous spin
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (typeof data.segmentIndex === "number" && data.segmentIndex >= 0 && data.segmentIndex < SEGMENTS.length) {
          setWinnerIndex(data.segmentIndex);
          setSpinState("form");
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSpin = useCallback(() => {
    if (spinState !== "idle") return;

    const winner = Math.floor(Math.random() * SEGMENTS.length);
    setWinnerIndex(winner);
    setSpinState("spinning");

    // Calculate rotation: land the winner under the pointer (top = 0°)
    // Segment i center is at i * 45 + 22.5 degrees
    const segmentCenter = winner * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
    const targetOffset = 360 - segmentCenter;
    const fullSpins = (5 + Math.floor(Math.random() * 4)) * 360;
    const jitter = (Math.random() - 0.5) * (SEGMENT_ANGLE * 0.4);

    setRotation((prev) => prev + fullSpins + targetOffset + jitter);
  }, [spinState]);

  const handleSpinComplete = useCallback(() => {
    if (spinState !== "spinning") return;

    setShowConfetti(true);
    setSpinState("revealing");

    // Save to localStorage
    if (winnerIndex !== null) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ segmentIndex: winnerIndex, timestamp: Date.now() }));
      } catch {
        // ignore
      }
    }

    // Transition to form after reveal
    setTimeout(() => {
      setSpinState("form");
    }, 2500);

    // Clean up confetti
    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
  }, [spinState, winnerIndex]);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Honeypot — silently drop bot submissions
    if (formData.get("_honey")) return;

    setSending(true);
    try {
      await fetch("https://formsubmit.co/ajax/simonwilbraham@sky.com", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      setSpinState("submitted");
    } catch {
      setSpinState("submitted");
    } finally {
      setSending(false);
    }
  };

  const wonDiscount = winnerIndex !== null ? SEGMENTS[winnerIndex].label.replace("\n", " ") : "";

  return (
    <>
      <Navbar onQuoteClick={() => setQuoteOpen(true)} />

      <main>
        <section className="relative min-h-[100dvh] overflow-hidden bg-slate-950">
          {/* Background layers (matching Hero.tsx pattern) */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-slate-950" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary-950/80 via-slate-900/60 to-slate-950/80" />
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

          {/* Content */}
          <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-4 pb-16 pt-24">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-4 py-1.5 text-sm font-medium text-primary-300"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-400" />
              </span>
              Exclusive Offer
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-3 text-center text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
            >
              Spin to{" "}
              <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                Win a Discount
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8 max-w-md text-center text-slate-400"
            >
              Try your luck! Spin the wheel and claim an exclusive discount on our professional cleaning services.
            </motion.p>

            {/* Wheel Area */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring", duration: 0.8 }}
              className="relative mx-auto w-[280px] sm:w-[340px] lg:w-[380px]"
            >
              {/* Pointer */}
              <div className="absolute -top-3 left-1/2 z-20 -translate-x-1/2">
                <svg width="32" height="36" viewBox="0 0 32 36" fill="none">
                  <path d="M16 36L4 8L0 0H32L28 8L16 36Z" fill="#257bea" stroke="#1d64d7" strokeWidth="1.5" />
                </svg>
              </div>

              {/* Glow ring */}
              <div
                className={`absolute -inset-3 rounded-full transition-opacity duration-500 ${
                  spinState === "spinning" ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  background: "conic-gradient(from 0deg, #3b99f5, #22c55e, #257bea, #4ade80, #3b99f5)",
                  filter: "blur(16px)",
                }}
              />

              {/* Rotating wheel */}
              <motion.div
                className="relative"
                animate={{ rotate: rotation }}
                transition={{
                  duration: rotation === 0 ? 0 : 5,
                  ease: [0.12, 0.8, 0.2, 1],
                }}
                onAnimationComplete={() => {
                  if (rotation > 0) handleSpinComplete();
                }}
              >
                <div className="rounded-full shadow-2xl shadow-primary-900/50 ring-4 ring-slate-800/80">
                  <WheelSVG />
                </div>
              </motion.div>

              {/* Confetti */}
              {showConfetti && <Confetti />}
            </motion.div>

            {/* Spin Button */}
            <AnimatePresence mode="wait">
              {spinState === "idle" && (
                <motion.button
                  key="spin-btn"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: 0.6 }}
                  onClick={handleSpin}
                  className="mt-8 rounded-xl bg-primary-600 px-10 py-4 text-lg font-bold text-white shadow-2xl shadow-primary-600/30 transition-all hover:bg-primary-700 hover:shadow-primary-600/50 active:scale-[0.97]"
                >
                  Spin the Wheel!
                </motion.button>
              )}
            </AnimatePresence>

            {/* Revealing state — discount card */}
            <AnimatePresence>
              {(spinState === "revealing" || spinState === "form" || spinState === "submitted") && winnerIndex !== null && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="mt-8 w-full max-w-md"
                >
                  {/* Discount Card */}
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07] shadow-2xl backdrop-blur-xl">
                    <div className="bg-gradient-to-r from-accent-600 to-accent-500 px-6 py-4 text-center">
                      <p className="text-sm font-medium text-accent-100">You Won</p>
                      <h2 className="text-2xl font-bold text-white">{wonDiscount}</h2>
                    </div>

                    <div className="p-6">
                      <AnimatePresence mode="wait">
                        {/* Form */}
                        {spinState === "form" && (
                          <motion.form
                            key="claim-form"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            onSubmit={handleFormSubmit}
                            className="space-y-4"
                          >
                            <p className="mb-4 text-center text-sm text-slate-300">
                              Enter your details to claim your discount. We&apos;ll get in touch within 2 hours.
                            </p>

                            <input type="hidden" name="_subject" value="Spin the Wheel Discount Claim — Fresh For Less" />
                            <input type="hidden" name="_template" value="table" />
                            {/* Honeypot — bots fill this; humans never see it */}
                            <input
                              type="text"
                              name="_honey"
                              tabIndex={-1}
                              autoComplete="off"
                              aria-hidden="true"
                              style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, width: 0 }}
                            />
                            <input type="hidden" name="discount_won" value={wonDiscount} />

                            <div className="grid gap-4 sm:grid-cols-2">
                              <div>
                                <label htmlFor="spin-name" className="mb-1.5 block text-sm font-medium text-slate-300">
                                  Full Name
                                </label>
                                <input
                                  type="text"
                                  id="spin-name"
                                  name="name"
                                  required
                                  className="w-full rounded-lg border border-slate-600 bg-slate-800/60 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                                  placeholder="Jane Smith"
                                />
                              </div>
                              <div>
                                <label htmlFor="spin-phone" className="mb-1.5 block text-sm font-medium text-slate-300">
                                  Phone Number
                                </label>
                                <input
                                  type="tel"
                                  id="spin-phone"
                                  name="phone"
                                  required
                                  className="w-full rounded-lg border border-slate-600 bg-slate-800/60 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                                  placeholder="0330 043 4811"
                                />
                              </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                              <div>
                                <label htmlFor="spin-email" className="mb-1.5 block text-sm font-medium text-slate-300">
                                  Email Address
                                </label>
                                <input
                                type="email"
                                id="spin-email"
                                name="email"
                                required
                                className="w-full rounded-lg border border-slate-600 bg-slate-800/60 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                                placeholder="jane@example.com"
                              />
                              </div>
                              <div>
                                <label htmlFor="spin-postcode" className="mb-1.5 block text-sm font-medium text-slate-300">
                                  Postcode
                                </label>
                                <input
                                  type="text"
                                  id="spin-postcode"
                                  name="postcode"
                                  required
                                  className="w-full rounded-lg border border-slate-600 bg-slate-800/60 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                                  placeholder="SW1A 1AA"
                                />
                              </div>
                            </div>

                            <button
                              type="submit"
                              disabled={sending}
                              className="w-full rounded-lg bg-accent-600 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-600/25 transition-all hover:bg-accent-700 hover:shadow-accent-600/40 active:scale-[0.98] disabled:opacity-60"
                            >
                              {sending ? "Sending..." : "Claim My Discount"}
                            </button>

                            <p className="text-center text-xs text-slate-500">
                              No obligation. We&apos;ll respond within 2 hours.
                            </p>
                          </motion.form>
                        )}

                        {/* Success */}
                        {spinState === "submitted" && (
                          <motion.div key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-6 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-500/20">
                              <svg className="h-8 w-8 text-accent-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                              </svg>
                            </div>
                            <h4 className="mt-4 text-xl font-bold text-white">Discount Claimed!</h4>
                            <p className="mt-2 text-sm text-slate-400">
                              We&apos;ve received your details and will get in touch within 2 hours to book your discounted clean.
                            </p>
                          </motion.div>
                        )}

                        {/* Revealing (brief pause before form) */}
                        {spinState === "revealing" && (
                          <motion.div key="revealing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6 text-center">
                            <p className="text-lg font-semibold text-white">Congratulations!</p>
                            <p className="mt-1 text-sm text-slate-400">Preparing your claim form...</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Trust metrics */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500"
            >
              {[
                { icon: "M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z", text: "4.9/5 Rated" },
                { icon: "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z", text: "2,000+ Homes Cleaned" },
                { icon: "M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z", text: "100% Satisfaction" },
              ].map((item, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-primary-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  {item.text}
                </span>
              ))}
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
      <QuoteModal isOpen={quoteOpen} onClose={() => setQuoteOpen(false)} />
    </>
  );
}
