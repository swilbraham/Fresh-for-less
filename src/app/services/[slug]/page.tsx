import type { Metadata } from "next";
import ServicePage from "@/components/ServicePage";

const services = [
  {
    slug: "carpet-cleaning",
    title: "Carpet Cleaning",
    metaTitle: "Professional Carpet Cleaning | Fresh For Less",
    metaDescription:
      "Professional carpet deep cleaning from £39. Hot water extraction, stain removal, deodorising, and fast drying. Pet-safe products. Free quotes. Call 0330 043 4811.",
  },
  {
    slug: "upholstery-cleaning",
    title: "Upholstery Cleaning",
    metaTitle: "Upholstery Cleaning — Sofas, Chairs & More | Fresh For Less",
    metaDescription:
      "Expert sofa and upholstery cleaning from £49. Fabric and leather care, stain protection, pet hair removal. Free quotes. Call 0330 043 4811.",
  },
  {
    slug: "end-of-tenancy",
    title: "End of Tenancy Cleaning",
    metaTitle: "End of Tenancy Carpet Cleaning | Fresh For Less",
    metaDescription:
      "End of tenancy carpet cleaning from £99. Full property clean, stain removal included, landlord reports available. Help get your deposit back. Call 0330 043 4811.",
  },
  {
    slug: "commercial-cleaning",
    title: "Commercial Cleaning",
    metaTitle: "Commercial Carpet Cleaning — Offices & Retail | Fresh For Less",
    metaDescription:
      "Professional commercial carpet cleaning for offices, retail, and hospitality. Out-of-hours service, regular contracts available. Free quotes. Call 0330 043 4811.",
  },
  {
    slug: "stain-removal",
    title: "Stain Removal",
    metaTitle: "Specialist Stain Removal | Fresh For Less",
    metaDescription:
      "Professional stain removal from £29. Wine, coffee, ink, pet accidents, food spillages, and more. Expert treatment for stubborn stains. Call 0330 043 4811.",
  },
  {
    slug: "pet-odour-treatment",
    title: "Pet Odour Treatment",
    metaTitle: "Pet Odour & Stain Removal Treatment | Fresh For Less",
    metaDescription:
      "Professional pet odour treatment from £49. Enzyme-based odour neutralisation, urine stain removal, safe for pets and children. Call 0330 043 4811.",
  },
  {
    slug: "hard-floor-cleaning",
    title: "Hard Floor Cleaning",
    metaTitle: "Hard Floor Cleaning — Tile, Laminate, Stone & More | Fresh For Less",
    metaDescription:
      "Professional hard floor cleaning from £3 per sq metre. Tile & grout, laminate, vinyl, stone, and wood floors. Free quotes. Call 0330 043 4811.",
  },
];

export function generateStaticParams() {
  return services.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);

  if (!service) {
    return {
      title: "Service Not Found | Fresh For Less",
    };
  }

  return {
    title: service.metaTitle,
    description: service.metaDescription,
    openGraph: {
      type: "website",
      locale: "en_GB",
      siteName: "Fresh For Less Carpet Cleaning",
      title: service.metaTitle,
      description: service.metaDescription,
    },
  };
}

export default async function ServicePageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ServicePage slug={slug} />;
}
