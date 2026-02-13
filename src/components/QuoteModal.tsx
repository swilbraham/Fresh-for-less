"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuoteModal({ isOpen, onClose }: QuoteModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      await fetch("https://formsubmit.co/ajax/simonwilbraham@sky.com", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-primary-600 to-primary-800 px-6 py-8 text-white">
              <button
                onClick={handleClose}
                className="absolute right-4 top-4 rounded-lg p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex items-center gap-3">
                <img
                  src="/images/logo.png"
                  alt="Fresh For Less"
                  className="h-14 w-14 rounded-full object-contain"
                />
                <h3 className="text-2xl font-bold">Get Your Free Quote</h3>
              </div>
              <p className="mt-2 text-sm text-primary-200">
                Tell us about your space and we&apos;ll get back to you within 2 hours.
              </p>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              {submitted ? (
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
                    We&apos;ve received your request and will get back to you within 2 hours with a personalised quote.
                  </p>
                  <button
                    onClick={handleClose}
                    className="mt-6 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
                  >
                    Done
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input type="hidden" name="_subject" value="New Quote Request — Fresh For Less" />
                  <input type="hidden" name="_template" value="table" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                        placeholder="Jane Smith"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-slate-700">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                        placeholder="0330 043 4811"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                      placeholder="jane@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="service" className="mb-1.5 block text-sm font-medium text-slate-700">
                      Service Needed
                    </label>
                    <select
                      id="service"
                      name="service"
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                    >
                      <option value="">Select a service...</option>
                      <option>Carpet Cleaning</option>
                      <option>Upholstery Cleaning</option>
                      <option>Stain Removal</option>
                      <option>Commercial Cleaning</option>
                      <option>Pet Odour Treatment</option>
                      <option>Full Home Package</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="details" className="mb-1.5 block text-sm font-medium text-slate-700">
                      Tell Us More
                    </label>
                    <textarea
                      id="details"
                      name="details"
                      rows={3}
                      className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-none"
                      placeholder="Number of rooms, type of stains, any special concerns..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full rounded-lg bg-primary-600 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition-all hover:bg-primary-700 hover:shadow-primary-600/40 active:scale-[0.98] disabled:opacity-60"
                  >
                    {sending ? "Sending..." : "Request My Free Quote"}
                  </button>
                  <p className="text-center text-xs text-slate-500">
                    No obligation. We&apos;ll respond within 2 hours.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
