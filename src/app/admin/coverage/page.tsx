import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/marketplace/auth";
import { listCoverage, listUncoveredDemand } from "@/lib/marketplace/repo";
import { AdminNav, Card } from "@/components/marketplace/shell";
import CopyButton from "@/components/marketplace/CopyButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Coverage",
  robots: { index: false, follow: false },
};

/** "CH41" -> "CH", so districts group by town rather than sprawling. */
function areaPrefix(outward: string): string {
  return outward.replace(/[0-9].*$/, "");
}

const AREA_NAMES: Record<string, string> = {
  CH: "Chester, Wirral & Flintshire",
  L: "Liverpool & Merseyside",
  WA: "Warrington, St Helens & Widnes",
  M: "Manchester",
  SK: "Stockport & Macclesfield",
  LL: "North Wales",
  CW: "Crewe & South Cheshire",
  BL: "Bolton",
  OL: "Oldham",
  WN: "Wigan",
  LS: "Leeds",
  DE: "Derby",
  NG: "Nottingham",
};

export default async function CoveragePage() {
  if (!(await isAdmin())) redirect("/admin");

  const [covered, gaps] = await Promise.all([
    listCoverage(),
    listUncoveredDemand(),
  ]);

  const groups = new Map<string, typeof covered>();
  for (const area of covered) {
    const prefix = areaPrefix(area.outward);
    groups.set(prefix, [...(groups.get(prefix) ?? []), area]);
  }
  const ordered = [...groups.entries()].sort(
    (a, b) => b[1].length - a[1].length
  );

  const producing = covered.filter((a) => a.jobs > 0);
  const idle = covered.length - producing.length;

  const allDistricts = covered.map((a) => a.outward).join("\n");
  const earningDistricts = producing.map((a) => a.outward).join("\n");
  const gapDistricts = gaps.map((g) => g.outward).join("\n");

  return (
    <main className="min-h-screen bg-slate-50">
      <AdminNav />

      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900">Coverage</h1>
        <p className="mt-1 text-sm text-slate-500">
          Every postcode a cleaner claims, and what it has actually produced.
        </p>

        <div className="my-6 grid gap-4 sm:grid-cols-4">
          {[
            { label: "Districts covered", value: String(covered.length), hint: "Across all cleaners" },
            { label: "Producing work", value: String(producing.length), hint: "Have had a booking" },
            { label: "Nothing yet", value: String(idle), hint: "Covered but no jobs" },
            { label: "Gaps with demand", value: String(gaps.length), hint: "Wanted, nobody covers" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {stat.label}
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
                {stat.value}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">{stat.hint}</p>
            </div>
          ))}
        </div>

        <Card
          title="Copy for advertising"
          description="One district per line, which is the format Google Ads bulk location entry expects — a comma-separated list is read as a single location and matches nothing. Meta won't take districts at all; it wants towns or a dropped pin with a radius."
          className="mb-6"
        >
          <div className="mt-4 flex flex-wrap gap-3">
            <CopyButton
              text={allDistricts}
              label={`Copy all ${covered.length} districts`}
              className="bg-slate-900 text-white hover:bg-slate-800"
            />
            {producing.length > 0 && (
              <CopyButton
                text={earningDistricts}
                label={`Copy the ${producing.length} that earn`}
                className="border border-accent-300 text-accent-800 hover:bg-accent-50"
              />
            )}
            {gaps.length > 0 && (
              <CopyButton
                text={gapDistricts}
                label={`Copy the ${gaps.length} gaps`}
                className="border border-amber-300 text-amber-800 hover:bg-amber-50"
              />
            )}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            For Meta, target the towns instead, or drop pins with a radius —
            Manchester +9 miles and Warrington +11 miles cover most of this
            patch between them. Spending against districts you cover but which
            have never produced a job is the easiest money to waste, which is
            what the middle button is for.
          </p>
        </Card>

        {gaps.length > 0 && (
          <Card
            title="Wanted, but nobody covers it"
            description="Somebody has tried to book or enquired here. These are the areas worth recruiting in — the demand already exists."
            className="mb-6 border-amber-200"
          >
            <ul className="mt-4 flex flex-wrap gap-2">
              {gaps.map((gap) => (
                <li
                  key={gap.outward}
                  className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm"
                >
                  <span className="font-bold text-amber-900">{gap.outward}</span>
                  <span className="ml-2 text-amber-800">
                    {gap.jobs > 0 && `${gap.jobs} booking${gap.jobs === 1 ? "" : "s"}`}
                    {gap.jobs > 0 && gap.requests > 0 && " · "}
                    {gap.requests > 0 && `${gap.requests} enquir${gap.requests === 1 ? "y" : "ies"}`}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {covered.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-500">
              No approved cleaner has set any coverage yet. Areas are set on the
              cleaner&apos;s own Coverage &amp; diary page, or by you from{" "}
              <Link href="/admin/cleaners" className="font-semibold text-primary-600 underline">
                Cleaners
              </Link>
              .
            </p>
          </Card>
        ) : (
          ordered.map(([prefix, areas]) => (
            <Card
              key={prefix}
              title={`${AREA_NAMES[prefix] ?? prefix} — ${areas.length} district${areas.length === 1 ? "" : "s"}`}
              className="mb-4"
            >
              <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {areas.map((area) => (
                  <li
                    key={area.outward}
                    className={`rounded-xl border px-3 py-2 text-sm ${
                      area.jobs > 0
                        ? "border-accent-200 bg-accent-50/50"
                        : "border-slate-200"
                    }`}
                  >
                    <span className="font-bold text-slate-900">{area.outward}</span>
                    <span className="ml-2 text-xs text-slate-500">
                      {area.jobs > 0
                        ? `${area.jobs} job${area.jobs === 1 ? "" : "s"}`
                        : "no jobs yet"}
                    </span>
                    <span className="block truncate text-xs text-slate-500" title={area.cleaners}>
                      {area.cleaner_count > 1
                        ? `${area.cleaner_count} cleaners · ${area.cleaners}`
                        : area.cleaners}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}
