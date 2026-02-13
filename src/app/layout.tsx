import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Fresh For Less Carpet Cleaning | Professional Carpet & Upholstery Cleaning",
  description:
    "Professional carpet and upholstery cleaning services that deliver spotless results at prices you'll love. Trusted by families and businesses alike.",
  keywords: [
    "carpet cleaning",
    "upholstery cleaning",
    "professional cleaning",
    "deep clean",
    "stain removal",
    "affordable carpet cleaning",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
