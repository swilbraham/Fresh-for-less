import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://freshforless.co.uk"),
  title: "Fresh For Less Carpet Cleaning | Professional Carpet & Upholstery Cleaning",
  description:
    "Professional carpet and upholstery cleaning services that deliver spotless results at prices you'll love. Trusted by 2,000+ families and businesses across the UK.",
  keywords: [
    "carpet cleaning",
    "upholstery cleaning",
    "professional cleaning",
    "deep clean",
    "stain removal",
    "affordable carpet cleaning",
    "carpet cleaner near me",
    "pet odour removal",
    "commercial carpet cleaning",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "Fresh For Less Carpet Cleaning",
    title: "Fresh For Less Carpet Cleaning | Professional Results, Affordable Prices",
    description:
      "Professional carpet and upholstery cleaning trusted by 2,000+ families. Free no-obligation quotes, eco-friendly products, 100% satisfaction guarantee.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fresh For Less Carpet Cleaning",
    description:
      "Professional carpet cleaning at affordable prices. Free quotes, eco-friendly products, 100% satisfaction guarantee. Call 0330 043 4811.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  additionalType: "https://schema.org/ProfessionalService",
  name: "Fresh For Less Carpet Cleaning",
  description:
    "Professional carpet and upholstery cleaning services delivering spotless results at affordable prices.",
  telephone: "0330 043 4811",
  url: "https://freshforless.co.uk",
  priceRange: "££",
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "07:00",
    closes: "19:00",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    bestRating: "5",
    ratingCount: "2000",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Cleaning Services",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Carpet Cleaning" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Upholstery Cleaning" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Stain Removal" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Commercial Cleaning" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Pet Odour Treatment" } },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" className={inter.variable}>
      <body className="font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
