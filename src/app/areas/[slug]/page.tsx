import type { Metadata } from "next";
import { areas, getAreaBySlug } from "@/data/areas";
import AreaPage from "@/components/AreaPage";

export function generateStaticParams() {
  return areas.map((area) => ({
    slug: area.slug,
  }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const area = getAreaBySlug(params.slug);
  const name = area?.name ?? "Your Area";

  return {
    title: `Carpet Cleaning in ${name} | Fresh For Less`,
    description: `Professional carpet and upholstery cleaning in ${name}. Affordable prices, eco-friendly products, and outstanding results. Free no-obligation quotes. Call 0330 043 4811.`,
    openGraph: {
      title: `Carpet Cleaning in ${name} | Fresh For Less`,
      description: `Professional carpet and upholstery cleaning in ${name}. Affordable prices, eco-friendly products. Free quotes available.`,
      type: "website",
      locale: "en_GB",
      siteName: "Fresh For Less Carpet Cleaning",
    },
  };
}

export default function AreaPageRoute({
  params,
}: {
  params: { slug: string };
}) {
  return <AreaPage slug={params.slug} />;
}
