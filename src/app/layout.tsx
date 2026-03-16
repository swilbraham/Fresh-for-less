import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
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
      <head>
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '613073519035884');
fbq('track', 'PageView');`}
        </Script>
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=613073519035884&ev=PageView&noscript=1"
          />
        </noscript>
      </head>
      <body className="font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Script
          src="https://cleanerbot-kappa.vercel.app/embed.js"
          data-tenant-id="cmmlqnyuy0000ky04u1rgt7kb"
          strategy="afterInteractive"
        />
        <Script id="cleanerbot-listener" strategy="afterInteractive">
          {`window.addEventListener("message", function(e) {
            if (e.data && e.data.type === "cleanerbot:quote-submitted") {
              setTimeout(function() { window.history.back(); }, 3500);
            }
          });`}
        </Script>
      </body>
    </html>
  );
}
