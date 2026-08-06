import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Why Not Join Us? | Fresh For Less Franchise Opportunity",
  description:
    "Run your own carpet cleaning business under the Fresh For Less brand. Proven system, exclusive territory, full training, ongoing lead generation. Enquire today.",
  alternates: {
    canonical: "https://www.freshforlesscarpetcleaning.co.uk/franchise",
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "Fresh For Less Carpet Cleaning",
    url: "https://www.freshforlesscarpetcleaning.co.uk/franchise",
    title: "Why Not Join Us? | Fresh For Less Franchise Opportunity",
    description:
      "Own a Fresh For Less carpet cleaning franchise in your area. Proven system, exclusive territory, full training, ongoing support.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fresh For Less — Franchise Opportunity",
    description:
      "Run your own carpet cleaning business under a trusted local brand. Enquire today.",
  },
};

export default function FranchiseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
