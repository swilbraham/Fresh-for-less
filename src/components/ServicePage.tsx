"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QuoteModal from "@/components/QuoteModal";
import WhatsAppButton from "@/components/WhatsAppButton";
import AnimatedSection from "@/components/AnimatedSection";

interface ServiceFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface ServiceFAQ {
  question: string;
  answer: string;
}

interface ServiceData {
  title: string;
  description: string;
  heroSubtitle: string;
  pricing: string;
  features: ServiceFeature[];
  faqs: ServiceFAQ[];
}

const servicesData: Record<string, ServiceData> = {
  "carpet-cleaning": {
    title: "Carpet Cleaning",
    description:
      "Professional deep carpet cleaning that removes embedded dirt, allergens, and stubborn stains — leaving your carpets fresh, soft, and looking like new.",
    heroSubtitle: "Deep Clean. Fresh Feel. Affordable Price.",
    pricing: "Starting from £39",
    features: [
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
          </svg>
        ),
        title: "Hot Water Extraction",
        description:
          "Industry-leading hot water extraction method that deep cleans carpet fibres and removes dirt other methods leave behind.",
      },
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
          </svg>
        ),
        title: "Pre-Treatment of Stains",
        description:
          "Targeted pre-treatment spray breaks down tough stains before the main clean for superior results.",
      },
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.115 5.19l.319 1.913A6 6 0 0 0 8.11 10.36L9.75 12l-.387.775c-.217.433-.132.956.21 1.298l1.348 1.348c.21.21.329.497.329.795v1.089c0 .426.24.815.622 1.006l.153.076c.433.217.956.132 1.298-.21l.723-.723a8.7 8.7 0 0 0 2.288-4.042 1.087 1.087 0 0 0-.358-1.099l-1.33-1.108c-.251-.21-.582-.299-.905-.245l-1.17.195a1.125 1.125 0 0 1-.98-.314l-.295-.295a1.125 1.125 0 0 1 0-1.591l.13-.132a1.125 1.125 0 0 1 1.3-.21l.603.302a.809.809 0 0 0 1.086-1.086L14.25 7.5l1.256-.837a4.5 4.5 0 0 0 1.528-1.732l.146-.292M6.115 5.19A9 9 0 1 0 17.18 4.64M6.115 5.19A8.965 8.965 0 0 1 12 3c1.929 0 3.716.607 5.18 1.64" />
          </svg>
        ),
        title: "Deodorising",
        description:
          "Professional-grade deodorising eliminates odours at the source, leaving your carpets smelling fresh and clean.",
      },
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        ),
        title: "Fast Drying (4-6 hrs)",
        description:
          "Our powerful extraction equipment removes most moisture, so carpets are dry and ready to use within 4-6 hours.",
      },
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
          </svg>
        ),
        title: "Pet-Safe Products",
        description:
          "All our cleaning products are non-toxic and completely safe for children, pets, and people with allergies.",
      },
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        ),
        title: "All Carpet Types",
        description:
          "We clean all carpet types including wool, nylon, polyester, and delicate fibres with tailored methods for each.",
      },
    ],
    faqs: [
      {
        question: "How does the carpet cleaning process work?",
        answer:
          "We start with a thorough vacuum and pre-treatment of stains, then use hot water extraction to deep clean the carpet fibres. This removes dirt, bacteria, and allergens from deep within the pile. We finish with a deodorising treatment and groom the carpet for a professional finish.",
      },
      {
        question: "How long does it take for carpets to dry?",
        answer:
          "Most carpets are dry within 4-6 hours. We use powerful extraction equipment that removes the majority of moisture during the cleaning process. We recommend good ventilation to speed up drying time.",
      },
      {
        question: "How often should I have my carpets professionally cleaned?",
        answer:
          "We recommend professional cleaning every 6-12 months for most households. Homes with pets, children, or allergy sufferers may benefit from more frequent cleaning, around every 3-6 months.",
      },
    ],
  },

  "upholstery-cleaning": {
    title: "Upholstery Cleaning",
    description:
      "Expert upholstery cleaning for sofas, chairs, and cushions. We restore your furniture to its original freshness with gentle yet thorough cleaning methods.",
    heroSubtitle: "Revive Your Furniture. Restore the Freshness.",
    pricing: "Starting from £49",
    features: [
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
          </svg>
        ),
        title: "Sofa Deep Clean",
        description:
          "Full deep cleaning of all sofa surfaces including cushions, arms, backs, and bases for a complete refresh.",
      },
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
          </svg>
        ),
        title: "Fabric & Leather Care",
        description:
          "Specialist treatments for all upholstery types, from delicate fabrics to real leather, with appropriate cleaning methods for each.",
      },
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
          </svg>
        ),
        title: "Stain Protection",
        description:
          "Optional Scotchgard-style stain protection treatment that repels spills and keeps your furniture looking cleaner for longer.",
      },
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
          </svg>
        ),
        title: "Cushion Refresh",
        description:
          "Individual cushion cleaning and fluffing restores shape and comfort, removing flattened, tired-looking cushions.",
      },
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.115 5.19l.319 1.913A6 6 0 0 0 8.11 10.36L9.75 12l-.387.775c-.217.433-.132.956.21 1.298l1.348 1.348c.21.21.329.497.329.795v1.089c0 .426.24.815.622 1.006l.153.076c.433.217.956.132 1.298-.21l.723-.723a8.7 8.7 0 0 0 2.288-4.042 1.087 1.087 0 0 0-.358-1.099l-1.33-1.108c-.251-.21-.582-.299-.905-.245l-1.17.195a1.125 1.125 0 0 1-.98-.314l-.295-.295a1.125 1.125 0 0 1 0-1.591l.13-.132a1.125 1.125 0 0 1 1.3-.21l.603.302a.809.809 0 0 0 1.086-1.086L14.25 7.5l1.256-.837a4.5 4.5 0 0 0 1.528-1.732l.146-.292M6.115 5.19A9 9 0 1 0 17.18 4.64M6.115 5.19A8.965 8.965 0 0 1 12 3c1.929 0 3.716.607 5.18 1.64" />
          </svg>
        ),
        title: "Pet Hair Removal",
        description:
          "Specialist pet hair removal techniques lift stubborn fur from fabric weaves that regular vacuuming misses.",
      },
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
          </svg>
        ),
        title: "Colour Restoration",
        description:
          "Our cleaning process revives faded and dulled colours, bringing back the vibrant look of your upholstery.",
      },
    ],
    faqs: [
      {
        question: "What types of upholstery fabric can you clean?",
        answer:
          "We clean virtually all upholstery fabrics including cotton, linen, polyester, microfibre, velvet, and blended fabrics. We also offer specialist leather cleaning and conditioning. We always test a small area first to ensure the best results.",
      },
      {
        question: "How long does upholstery take to dry?",
        answer:
          "Most upholstery is dry within 4-6 hours depending on the fabric type and room ventilation. Leather pieces are typically dry much faster, usually within 1-2 hours.",
      },
      {
        question: "Can you clean leather sofas?",
        answer:
          "Yes, we offer specialist leather cleaning and conditioning. Our process cleans, nourishes, and protects the leather to keep it supple and prevent cracking. We use pH-balanced products specifically designed for leather care.",
      },
    ],
  },

  "end-of-tenancy": {
    title: "End of Tenancy Cleaning",
    description:
      "Thorough carpet cleaning designed to meet landlord and letting agent standards. Help secure your deposit with professionally cleaned carpets throughout the property.",
    heroSubtitle: "Get Your Deposit Back. Guaranteed Clean.",
    pricing: "Starting from £99",
    features: [
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
        ),
        title: "Full Property Carpet Clean",
        description:
          "Every carpeted room in the property is professionally deep cleaned to meet checkout standards.",
      },
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
          </svg>
        ),
        title: "High-Traffic Area Treatment",
        description:
          "Extra attention given to hallways, stairs, and living areas where heavy foot traffic causes the most wear.",
      },
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
          </svg>
        ),
        title: "Stain Removal Included",
        description:
          "All visible stains are treated as part of the service — no hidden extras for stain removal on end of tenancy cleans.",
      },
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.115 5.19l.319 1.913A6 6 0 0 0 8.11 10.36L9.75 12l-.387.775c-.217.433-.132.956.21 1.298l1.348 1.348c.21.21.329.497.329.795v1.089c0 .426.24.815.622 1.006l.153.076c.433.217.956.132 1.298-.21l.723-.723a8.7 8.7 0 0 0 2.288-4.042 1.087 1.087 0 0 0-.358-1.099l-1.33-1.108c-.251-.21-.582-.299-.905-.245l-1.17.195a1.125 1.125 0 0 1-.98-.314l-.295-.295a1.125 1.125 0 0 1 0-1.591l.13-.132a1.125 1.125 0 0 1 1.3-.21l.603.302a.809.809 0 0 0 1.086-1.086L14.25 7.5l1.256-.837a4.5 4.5 0 0 0 1.528-1.732l.146-.292M6.115 5.19A9 9 0 1 0 17.18 4.64M6.115 5.19A8.965 8.965 0 0 1 12 3c1.929 0 3.716.607 5.18 1.64" />
          </svg>
        ),
        title: "Deodorising Throughout",
        description:
          "Full deodorising treatment across all carpeted areas to ensure the property smells as fresh as it looks.",
      },
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
        ),
        title: "Landlord Reports Available",
        description:
          "We can provide a written cleaning report for your landlord or letting agent as proof of professional cleaning.",
      },
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        ),
        title: "Quick Turnaround",
        description:
          "Same-day and next-day appointments available — perfect for tight move-out deadlines and last-minute bookings.",
      },
    ],
    faqs: [
      {
        question: "Will carpet cleaning help me get my deposit back?",
        answer:
          "Yes, professional carpet cleaning is one of the most common requirements for deposit return. Many landlords and letting agents require proof of professional cleaning. We can provide a receipt and cleaning report to support your deposit claim.",
      },
      {
        question: "How quickly can you fit me in before my move-out date?",
        answer:
          "We offer same-day and next-day appointments for end of tenancy cleans, subject to availability. We understand move-out dates are often tight, so we do our best to accommodate urgent bookings.",
      },
      {
        question: "What is included in the end of tenancy carpet clean?",
        answer:
          "Our end of tenancy service includes full carpet cleaning of all rooms, stain treatment, deodorising, and high-traffic area treatment. We clean hallways, stairs, bedrooms, and living areas — every carpeted surface in the property.",
      },
    ],
  },

  "commercial-cleaning": {
    title: "Commercial Cleaning",
    description:
      "Professional carpet cleaning for offices, retail spaces, restaurants, and hospitality venues. Flexible scheduling with minimal disruption to your business.",
    heroSubtitle: "Keep Your Business Looking Its Best.",
    pricing: "Price on Application",
    features: [
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
          </svg>
        ),
        title: "Office Carpet Cleaning",
        description:
          "Complete carpet cleaning for offices of all sizes, from small suites to multi-floor buildings.",
      },
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
          </svg>
        ),
        title: "Retail Floor Care",
        description:
          "Keep your shop floor looking immaculate for customers with regular professional carpet maintenance.",
      },
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845l.265.265Z" />
          </svg>
        ),
        title: "Restaurant & Hospitality",
        description:
          "Specialist cleaning for restaurants, hotels, and hospitality venues where hygiene and presentation are critical.",
      },
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
          </svg>
        ),
        title: "Out-of-Hours Service",
        description:
          "Evening and weekend cleaning available so there is no disruption to your business during working hours.",
      },
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
          </svg>
        ),
        title: "Regular Contracts",
        description:
          "Discounted rates for regular cleaning contracts — weekly, fortnightly, or monthly schedules to suit your needs.",
      },
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
          </svg>
        ),
        title: "Large Area Coverage",
        description:
          "Equipment and experience to handle large commercial spaces efficiently, minimising downtime and disruption.",
      },
    ],
    faqs: [
      {
        question: "Can you clean outside of business hours?",
        answer:
          "Absolutely. We offer evening and weekend cleaning to ensure zero disruption to your business operations. We can work around your schedule to find the most convenient time.",
      },
      {
        question: "How much disruption will there be?",
        answer:
          "Minimal. We work efficiently and can section off areas being cleaned so your business can continue operating. Most commercial carpets are dry within 2-4 hours with our high-powered equipment.",
      },
      {
        question: "Do you offer regular cleaning contracts?",
        answer:
          "Yes, we offer discounted rates for regular contracts on a weekly, fortnightly, or monthly basis. Regular maintenance keeps carpets in top condition and extends their lifespan, saving you money in the long run.",
      },
    ],
  },

  "stain-removal": {
    title: "Stain Removal",
    description:
      "Specialist stain treatment for even the most stubborn marks. From wine and coffee to ink and pet accidents, we have the expertise and products to tackle it all.",
    heroSubtitle: "Stubborn Stains? We Have the Solution.",
    pricing: "Starting from £29 per stain",
    features: [
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
          </svg>
        ),
        title: "Wine & Coffee Stains",
        description:
          "Targeted treatment for tannin-based stains like red wine, coffee, and tea — even old, set-in marks.",
      },
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
          </svg>
        ),
        title: "Ink & Paint Marks",
        description:
          "Specialist solvents and techniques to lift ink, paint, and marker stains without damaging carpet fibres.",
      },
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.115 5.19l.319 1.913A6 6 0 0 0 8.11 10.36L9.75 12l-.387.775c-.217.433-.132.956.21 1.298l1.348 1.348c.21.21.329.497.329.795v1.089c0 .426.24.815.622 1.006l.153.076c.433.217.956.132 1.298-.21l.723-.723a8.7 8.7 0 0 0 2.288-4.042 1.087 1.087 0 0 0-.358-1.099l-1.33-1.108c-.251-.21-.582-.299-.905-.245l-1.17.195a1.125 1.125 0 0 1-.98-.314l-.295-.295a1.125 1.125 0 0 1 0-1.591l.13-.132a1.125 1.125 0 0 1 1.3-.21l.603.302a.809.809 0 0 0 1.086-1.086L14.25 7.5l1.256-.837a4.5 4.5 0 0 0 1.528-1.732l.146-.292M6.115 5.19A9 9 0 1 0 17.18 4.64M6.115 5.19A8.965 8.965 0 0 1 12 3c1.929 0 3.716.607 5.18 1.64" />
          </svg>
        ),
        title: "Pet Accidents",
        description:
          "Enzyme-based treatments that break down pet urine and vomit stains at a molecular level for complete removal.",
      },
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845l.265.265Z" />
          </svg>
        ),
        title: "Food Spillages",
        description:
          "Effective removal of food-based stains including curry, ketchup, chocolate, and grease marks.",
      },
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
          </svg>
        ),
        title: "Rust & Dye Transfer",
        description:
          "Advanced chemical treatments for rust stains, dye bleeds, and colour transfer marks on carpets and rugs.",
      },
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
          </svg>
        ),
        title: "Bleach Spot Repair",
        description:
          "Colour matching and repair for bleach spots and discolouration, restoring a uniform appearance to your carpet.",
      },
    ],
    faqs: [
      {
        question: "What is the success rate for stain removal?",
        answer:
          "We successfully remove or significantly reduce the vast majority of stains. Some older or chemically-set stains may not be 100% removable, but we will always be upfront about what to expect after our initial assessment.",
      },
      {
        question: "Do you guarantee stain removal?",
        answer:
          "We guarantee our best effort using professional-grade products and techniques. While most stains come out completely, some stubborn or old stains may only be reduced. We always assess the stain first and give you an honest expectation.",
      },
      {
        question: "Should I try to clean the stain myself first?",
        answer:
          "We recommend blotting (not rubbing) excess spillage with a clean cloth, but avoid using shop-bought stain removers as they can set the stain or damage carpet fibres. The sooner you call us, the better the results.",
      },
    ],
  },

  "pet-odour-treatment": {
    title: "Pet Odour Treatment",
    description:
      "Professional pet odour and stain removal that eliminates smells at the source. Our enzyme-based treatments neutralise odours permanently, not just mask them.",
    heroSubtitle: "Love Your Pets. Love Your Clean Home.",
    pricing: "Starting from £49",
    features: [
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
          </svg>
        ),
        title: "Enzyme Treatment",
        description:
          "Professional enzyme-based solutions that break down organic matter at a molecular level, not just mask the smell.",
      },
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.115 5.19l.319 1.913A6 6 0 0 0 8.11 10.36L9.75 12l-.387.775c-.217.433-.132.956.21 1.298l1.348 1.348c.21.21.329.497.329.795v1.089c0 .426.24.815.622 1.006l.153.076c.433.217.956.132 1.298-.21l.723-.723a8.7 8.7 0 0 0 2.288-4.042 1.087 1.087 0 0 0-.358-1.099l-1.33-1.108c-.251-.21-.582-.299-.905-.245l-1.17.195a1.125 1.125 0 0 1-.98-.314l-.295-.295a1.125 1.125 0 0 1 0-1.591l.13-.132a1.125 1.125 0 0 1 1.3-.21l.603.302a.809.809 0 0 0 1.086-1.086L14.25 7.5l1.256-.837a4.5 4.5 0 0 0 1.528-1.732l.146-.292M6.115 5.19A9 9 0 1 0 17.18 4.64M6.115 5.19A8.965 8.965 0 0 1 12 3c1.929 0 3.716.607 5.18 1.64" />
          </svg>
        ),
        title: "Deep Odour Neutralisation",
        description:
          "Treatment penetrates deep into carpet fibres and underlay to neutralise odour-causing bacteria at the source.",
      },
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
          </svg>
        ),
        title: "Urine Stain Removal",
        description:
          "Complete removal of visible urine stains and the invisible residue that causes recurring odours.",
      },
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285ZM12 12.75h.007v.008H12v-.008Z" />
          </svg>
        ),
        title: "Bacteria Elimination",
        description:
          "Antibacterial treatment kills harmful bacteria left by pet accidents, creating a healthier home environment.",
      },
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
          </svg>
        ),
        title: "Safe for Pets",
        description:
          "All our treatments are non-toxic and safe for your pets and family once dry. No harsh chemicals.",
      },
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        ),
        title: "Long-Lasting Freshness",
        description:
          "Our treatment provides lasting results — not a temporary fix. Odours are eliminated, not masked with fragrances.",
      },
    ],
    faqs: [
      {
        question: "How does the pet odour treatment work?",
        answer:
          "We use professional enzyme-based solutions that break down the organic compounds in pet urine, vomit, and other accidents. The enzymes digest the odour-causing bacteria at a molecular level, permanently neutralising the smell rather than masking it.",
      },
      {
        question: "Is it safe for my pets and children?",
        answer:
          "Yes, absolutely. All our products are non-toxic, eco-friendly, and completely safe for pets and children once the carpet is dry. We use professional-grade but pet-safe formulations specifically designed for homes with animals.",
      },
      {
        question: "Will I need repeat treatments?",
        answer:
          "In most cases, a single treatment is enough. For severe or long-standing odour issues where urine has soaked into the underlay, a second treatment may be recommended. We will always be upfront about what to expect.",
      },
    ],
  },
  "hard-floor-cleaning": {
    title: "Hard Floor Cleaning",
    description:
      "Professional hard floor cleaning for tile, laminate, vinyl, stone, and wood floors. We restore your floors to their original shine using specialist equipment and floor-specific products.",
    heroSubtitle: "Restore. Protect. Shine.",
    pricing: "Starting from £3 per sq metre",
    features: [
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
          </svg>
        ),
        title: "Tile & Grout Cleaning",
        description:
          "Deep clean tile surfaces and restore discoloured grout lines to their original colour with our specialist equipment.",
      },
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
          </svg>
        ),
        title: "Laminate Floor Care",
        description:
          "Gentle yet effective cleaning for laminate floors that removes grime without damaging the surface or causing warping.",
      },
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
          </svg>
        ),
        title: "Vinyl Deep Clean",
        description:
          "Remove built-up dirt, scuffs, and marks from vinyl flooring, restoring its original appearance and extending its lifespan.",
      },
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
          </svg>
        ),
        title: "Stone Floor Restoration",
        description:
          "Specialist cleaning for natural stone floors including slate, marble, travertine, and limestone. We clean, seal, and protect.",
      },
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
        ),
        title: "Wood Floor Cleaning",
        description:
          "Safe cleaning methods for hardwood and engineered wood floors that remove dirt without damaging the finish or grain.",
      },
      {
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
          </svg>
        ),
        title: "Anti-Slip Treatment",
        description:
          "Optional anti-slip treatment for tiled and stone floors to improve safety in kitchens, bathrooms, and high-traffic areas.",
      },
    ],
    faqs: [
      {
        question: "What types of hard floors do you clean?",
        answer:
          "We clean all hard floor types including ceramic and porcelain tile, natural stone (slate, marble, travertine, limestone), laminate, vinyl, LVT (luxury vinyl tile), and hardwood/engineered wood floors.",
      },
      {
        question: "How long does hard floor cleaning take?",
        answer:
          "It depends on the size and condition of the floor, but most rooms take 30-45 minutes. A full kitchen and hallway would typically take 1-2 hours including drying time.",
      },
      {
        question: "Will it damage my floor?",
        answer:
          "No. We use floor-specific products and techniques that are safe for all hard floor types. Our technicians assess your floor before starting and choose the right approach for the material and finish.",
      },
    ],
  },
};

const whyChooseUsPoints = [
  { title: "Fully Insured", description: "Complete peace of mind with full public liability insurance." },
  { title: "DBS Checked", description: "All our technicians are DBS checked for your security." },
  { title: "Eco-Friendly Products", description: "Safe for children, pets, and the environment." },
  { title: "No Hidden Fees", description: "Transparent pricing with no surprises on the day." },
  { title: "Satisfaction Guarantee", description: "Not happy? We will come back and re-clean for free." },
  { title: "5-Star Rated", description: "Trusted by thousands of happy customers across the region." },
];

function FAQItem({ faq, index }: { faq: ServiceFAQ; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AnimatedSection delay={index * 0.1}>
      <div className="rounded-xl border border-slate-200 bg-white">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between px-6 py-5 text-left"
        >
          <span className="pr-4 text-base font-semibold text-slate-900">{faq.question}</span>
          <svg
            className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
        {isOpen && (
          <div className="border-t border-slate-100 px-6 pb-5 pt-4">
            <p className="text-sm leading-relaxed text-slate-600">{faq.answer}</p>
          </div>
        )}
      </div>
    </AnimatedSection>
  );
}

export default function ServicePage({ slug }: { slug: string }) {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const openQuote = () => setQuoteOpen(true);
  const closeQuote = () => setQuoteOpen(false);

  const service = servicesData[slug];

  if (!service) {
    return (
      <>
        <Navbar onQuoteClick={openQuote} />
        <main className="flex min-h-screen items-center justify-center pt-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">Service Not Found</h1>
            <a href="/" className="mt-4 inline-block text-primary-600 hover:underline">
              Back to Home
            </a>
          </div>
        </main>
        <Footer />
        <QuoteModal isOpen={quoteOpen} onClose={closeQuote} />
      </>
    );
  }

  return (
    <>
      <Navbar onQuoteClick={openQuote} />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-primary-950 pt-24 pb-16 lg:pt-32 lg:pb-24">
          {/* Background orbs */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary-600/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-accent-600/10 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mx-auto max-w-3xl text-center"
            >
              <a
                href="/"
                className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80 backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                Back to Home
              </a>

              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                {service.title}
              </h1>
              <p className="mt-3 text-lg font-medium text-primary-300 sm:text-xl">
                {service.heroSubtitle}
              </p>
              <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
                {service.description}
              </p>

              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <button
                  onClick={openQuote}
                  className="w-full rounded-xl bg-accent-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-accent-600/25 transition-all hover:bg-accent-700 hover:shadow-accent-600/40 active:scale-[0.98] sm:w-auto"
                >
                  Get a Free Quote
                </button>
                <a
                  href="tel:03300434811"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 active:scale-[0.98] sm:w-auto"
                >
                  <svg className="h-5 w-5 text-accent-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                  </svg>
                  0330 043 4811
                </a>
              </div>

              {/* Pricing badge */}
              <div className="mt-8">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 text-sm font-medium text-white backdrop-blur-sm">
                  <svg className="h-4 w-4 text-accent-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                  </svg>
                  {service.pricing}
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* What's Included Section */}
        <section className="bg-white py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  What&apos;s Included
                </h2>
                <p className="mt-4 text-lg text-slate-600">
                  Everything you get with our {service.title.toLowerCase()} service.
                </p>
              </div>
            </AnimatedSection>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {service.features.map((feature, index) => (
                <AnimatedSection key={feature.title} delay={index * 0.1}>
                  <div className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-primary-200 hover:shadow-lg hover:shadow-primary-600/5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-100">
                      {feature.icon}
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-slate-900">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="bg-slate-50 py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Why Choose Fresh For Less
                </h2>
                <p className="mt-4 text-lg text-slate-600">
                  Trusted by thousands of customers for professional, reliable cleaning.
                </p>
              </div>
            </AnimatedSection>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {whyChooseUsPoints.map((point, index) => (
                <AnimatedSection key={point.title} delay={index * 0.1}>
                  <div className="flex items-start gap-4 rounded-xl bg-white p-5 shadow-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-50">
                      <svg className="h-5 w-5 text-accent-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{point.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{point.description}</p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-white py-16 lg:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Frequently Asked Questions
                </h2>
                <p className="mt-4 text-lg text-slate-600">
                  Common questions about our {service.title.toLowerCase()} service.
                </p>
              </div>
            </AnimatedSection>

            <div className="mt-10 space-y-4">
              {service.faqs.map((faq, index) => (
                <FAQItem key={faq.question} faq={faq} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bg-gradient-to-br from-primary-600 to-primary-800 py-16 lg:py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <AnimatedSection>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready for Spotless {service.title}?
              </h2>
              <p className="mt-4 text-lg text-primary-100">
                Get a free, no-obligation quote today. We respond within 2 hours.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <button
                  onClick={openQuote}
                  className="w-full rounded-xl bg-white px-8 py-4 text-base font-semibold text-primary-700 shadow-lg transition-all hover:bg-primary-50 active:scale-[0.98] sm:w-auto"
                >
                  Get Your Free Quote
                </button>
                <a
                  href="tel:03300434811"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/30 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-white/10 active:scale-[0.98] sm:w-auto"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                  </svg>
                  Call 0330 043 4811
                </a>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </main>

      <Footer />
      <QuoteModal isOpen={quoteOpen} onClose={closeQuote} />
      <WhatsAppButton />
    </>
  );
}
