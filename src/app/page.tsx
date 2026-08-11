"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/sections/Hero";
import PainPoints from "@/components/sections/PainPoints";
import Benefits from "@/components/sections/Benefits";
import Process from "@/components/sections/Process";
import Testimonials from "@/components/sections/Testimonials";
import FAQ from "@/components/sections/FAQ";
import About from "@/components/sections/About";
import FinalCTA from "@/components/sections/FinalCTA";
import Footer from "@/components/Footer";
import QuoteModal from "@/components/QuoteModal";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function Home() {
  const [quoteOpen, setQuoteOpen] = useState(false);

  const openQuote = () => setQuoteOpen(true);
  const closeQuote = () => setQuoteOpen(false);

  return (
    <>
      <Navbar onQuoteClick={openQuote} />
      <main>
        <Hero onQuoteClick={openQuote} />
        <PainPoints />
        <Benefits />
        <Process />
        <Testimonials />
        <FAQ />
        <About />
        <FinalCTA onQuoteClick={openQuote} />
      </main>
      <Footer />
      <QuoteModal isOpen={quoteOpen} onClose={closeQuote} />
      <WhatsAppButton />
    </>
  );
}
