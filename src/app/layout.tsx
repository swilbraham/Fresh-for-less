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
  metadataBase: new URL("https://www.freshforlesscarpetcleaning.co.uk"),
  title: {
    default: "Carpet Cleaning Wirral, Liverpool & Chester | Fresh For Less",
    template: "%s | Fresh For Less Carpet Cleaning",
  },
  description:
    "Professional carpet & upholstery cleaning across Wirral, Liverpool, Chester, Warrington & North Wales. Hot-water extraction, stain removal, pet-safe products. Free quotes from £39 — call 0330 043 4811.",
  applicationName: "Fresh For Less Carpet Cleaning",
  authors: [{ name: "Fresh For Less Carpet Cleaning" }],
  keywords: [
    "carpet cleaning",
    "carpet cleaning wirral",
    "carpet cleaning liverpool",
    "carpet cleaning chester",
    "carpet cleaning warrington",
    "carpet cleaning north wales",
    "upholstery cleaning",
    "sofa cleaning",
    "rug cleaning",
    "stain removal",
    "pet odour removal",
    "carpet cleaner near me",
    "professional carpet cleaning",
    "affordable carpet cleaning",
    "commercial carpet cleaning",
    "end of tenancy carpet cleaning",
    "hot water extraction",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "https://www.freshforlesscarpetcleaning.co.uk",
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "Fresh For Less Carpet Cleaning",
    url: "https://www.freshforlesscarpetcleaning.co.uk",
    title: "Carpet Cleaning Wirral, Liverpool & Chester | Fresh For Less",
    description:
      "Professional carpet & upholstery cleaning trusted by 2,000+ families. Free no-obligation quotes, eco-friendly products, 100% satisfaction guarantee.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Carpet Cleaning Wirral, Liverpool & Chester | Fresh For Less",
    description:
      "Professional carpet cleaning across the North West from £39. Free quotes, eco-friendly products, 100% satisfaction guarantee. Call 0330 043 4811.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  additionalType: "https://schema.org/ProfessionalService",
  "@id": "https://www.freshforlesscarpetcleaning.co.uk/#business",
  name: "Fresh For Less Carpet Cleaning",
  description:
    "Professional carpet and upholstery cleaning services across Wirral, Liverpool, Chester, Warrington and North Wales — spotless results at affordable prices.",
  telephone: "0330 043 4811",
  email: "info@freshforlesscarpetcleaning.co.uk",
  url: "https://www.freshforlesscarpetcleaning.co.uk",
  image: "https://www.freshforlesscarpetcleaning.co.uk/images/logo.png",
  logo: "https://www.freshforlesscarpetcleaning.co.uk/images/logo.png",
  priceRange: "££",
  areaServed: [
    { "@type": "AdministrativeArea", name: "Wirral" },
    { "@type": "City", name: "Liverpool" },
    { "@type": "City", name: "Chester" },
    { "@type": "City", name: "Warrington" },
    { "@type": "AdministrativeArea", name: "North Wales" },
  ],
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
