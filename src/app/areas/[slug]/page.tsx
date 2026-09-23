import type { Metadata } from "next";
import { areas, getAreaBySlug, getCountyForRegion, getPostcodeForArea } from "@/data/areas";
import AreaPage from "@/components/AreaPage";

export function generateStaticParams() {
  return areas.map((area) => ({
    slug: area.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const area = getAreaBySlug(slug);
  const name = area?.name ?? "Your Area";
  const county = area ? getCountyForRegion(area.region) : "UK";
  const postcode = area ? getPostcodeForArea(area) : "";
  const postcodeStr = postcode ? ` (${postcode})` : "";

  return {
    title: {
      absolute: `Carpet Cleaning ${name}${postcodeStr} | Fresh For Less`,
    },
    description: `Professional carpet & upholstery cleaning in ${name}, ${county}${postcode ? ` ${postcode}` : ""} — 3 rooms for £99, £90 minimum charge. Hot-water extraction, stain removal, pet-safe products, fast drying. Free local quotes — call 0330 043 4811.`,
    alternates: {
      canonical: `https://www.freshforlesscarpetcleaning.co.uk/areas/${slug}`,
    },
    openGraph: {
      images: [{ url: "/images/og-image.jpg", width: 1200, height: 630, alt: "Fresh For Less Carpet Cleaning" }],
      title: `Carpet Cleaning in ${name}, ${county} | Fresh For Less`,
      description: `Local carpet and upholstery cleaning in ${name}, ${county}. 3 rooms for £99, eco-friendly products, same-week availability. Free quotes.`,
      type: "website",
      locale: "en_GB",
      siteName: "Fresh For Less Carpet Cleaning",
      url: `https://www.freshforlesscarpetcleaning.co.uk/areas/${slug}`,
    },
    twitter: {
      images: ["/images/og-image.jpg"],
      card: "summary_large_image",
      title: `Carpet Cleaning ${name} | Fresh For Less`,
      description: `Local carpet cleaning in ${name}${postcode ? ` (${postcode})` : ""} — 3 rooms for £99. Free quotes — 0330 043 4811.`,
    },
  };
}

export default async function AreaPageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <AreaPage slug={slug} />;
}
