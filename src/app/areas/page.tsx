import type { Metadata } from "next";
import Link from "next/link";
import { areas, getPostcodeForArea } from "@/data/areas";

export const metadata: Metadata = {
  title: "Areas We Cover | Carpet Cleaning Wirral, Liverpool, Chester & North Wales",
  description:
    "Fresh For Less Carpet Cleaning serves 100+ towns and villages across Wirral, Liverpool, Chester, Warrington, Runcorn and North Wales. Find your local carpet cleaner.",
  alternates: {
    canonical: "https://www.freshforlesscarpetcleaning.co.uk/areas",
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "Fresh For Less Carpet Cleaning",
    url: "https://www.freshforlesscarpetcleaning.co.uk/areas",
    title: "Areas We Cover | Fresh For Less Carpet Cleaning",
    description:
      "Local carpet cleaning across Wirral, Liverpool, Chester, Warrington, Runcorn and North Wales. Find your area below.",
  },
};

const regionOrder = ["Wirral", "Liverpool", "Chester", "Warrington", "Runcorn", "North Wales"];

export default function AreasIndexPage() {
  const grouped = regionOrder.map((region) => ({
    region,
    list: areas.filter((a) => a.region === region).sort((a, b) => a.name.localeCompare(b.name)),
  }));

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Areas served by Fresh For Less Carpet Cleaning",
    itemListElement: areas.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://www.freshforlesscarpetcleaning.co.uk/areas/${a.slug}`,
      name: `Carpet Cleaning ${a.name}`,
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.freshforlesscarpetcleaning.co.uk/" },
      { "@type": "ListItem", position: 2, name: "Areas", item: "https://www.freshforlesscarpetcleaning.co.uk/areas" },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <main className="bg-white">
        <section className="relative overflow-hidden bg-slate-950 pt-24 pb-16 lg:pt-32 lg:pb-20">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-950/90 via-slate-900/80 to-slate-950/90" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-primary-900)_0%,_transparent_50%)] opacity-40" />
          </div>
          <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              Back to Home
            </Link>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Areas We{" "}
              <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                Cover
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
              Fresh For Less provides professional carpet and upholstery cleaning to {areas.length}+ towns and villages
              across Wirral, Liverpool, Chester, Warrington, Runcorn and North Wales. Find your local area below.
            </p>
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {grouped.map(({ region, list }) => (
              <div key={region} className="mb-14 last:mb-0">
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                  Carpet Cleaning in {region}
                </h2>
                <p className="mt-2 text-sm text-slate-500">{list.length} locations covered</p>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {list.map((a) => {
                    const postcode = getPostcodeForArea(a);
                    return (
                      <Link
                        key={a.slug}
                        href={`/areas/${a.slug}`}
                        className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-primary-300 hover:bg-primary-50/40 hover:shadow-md"
                      >
                        <div className="text-sm font-semibold text-slate-900 group-hover:text-primary-700">
                          Carpet Cleaning {a.name}
                        </div>
                        {postcode && (
                          <div className="mt-1 text-xs text-slate-500">{postcode}</div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
