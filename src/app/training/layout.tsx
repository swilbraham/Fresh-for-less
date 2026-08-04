import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Carpet Cleaning Training Course | 5 Days on Real Jobs",
  description:
    "Learn carpet cleaning on real customer jobs — not in a classroom. 5-day one-to-one training with a fully insured technician. All equipment provided, certificate of completion. Call 0330 043 4811.",
  alternates: {
    canonical: "https://www.freshforlesscarpetcleaning.co.uk/training",
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "Fresh For Less Carpet Cleaning",
    url: "https://www.freshforlesscarpetcleaning.co.uk/training",
    title: "Carpet Cleaning Training Course | 5 Days on Real Jobs | Fresh For Less",
    description:
      "A 5-day live carpet cleaning training experience on genuine customer bookings. One trainee per course, all equipment provided, certificate of completion.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Carpet Cleaning Training Course | Fresh For Less",
    description:
      "Learn carpet cleaning on real customer jobs. 5-day one-to-one training, certificate of completion. Call 0330 043 4811.",
  },
};

export default function TrainingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
