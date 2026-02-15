import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Professional Carpet Cleaning | Fresh For Less — Free Quote",
  description:
    "Get your carpets professionally cleaned at affordable prices. Free no-obligation quotes, eco-friendly products, 100% satisfaction guarantee. Call 0330 043 4811.",
  openGraph: {
    title: "Professional Carpet Cleaning | Fresh For Less — Free Quote",
    description:
      "Spotless carpets at affordable prices. Trusted by 2,000+ families. Free quotes, eco-friendly products, fast drying. Book today.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Professional Carpet Cleaning | Fresh For Less",
    description:
      "Spotless carpets at affordable prices. Free quotes, eco-friendly products, 100% satisfaction guarantee. Call 0330 043 4811.",
  },
};

export default function CleaningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
