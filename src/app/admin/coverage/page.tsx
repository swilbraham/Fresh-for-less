import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/marketplace/auth";
import {
  listCoverage,
  listCoverageByCleaner,
  listUncoveredDemand,
  metaPinClusters,
} from "@/lib/marketplace/repo";
import { Card } from "@/components/marketplace/shell";
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

  const [covered, gaps, byCleaner, meta] = await Promise.all([
    listCoverage(),
    listUncoveredDemand(),
    listCoverageByCleaner(),
    metaPinClusters(),
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

  // Single points of failure, grouped by the cleaner holding them: if that
  // one person leaves or is suspended, these districts silently go dark on
  // /book. Grouped per cleaner because that's the recruitment unit.
  const singles = covered.filter((a) => a.cleaner_count === 1);
  const soloByCleaner = new Map<string, typeof covered>();
  for (const area of singles) {
    soloByCleaner.set(area.cleaners, [
      ...(soloByCleaner.get(area.cleaners) ?? []),
      area,
    ]);
  }
  const soloOrdered = [...soloByCleaner.entries()].sort(
    (a, b) => b[1].length - a[1].length
  );

  const prefixName = (outwards: string[]) => {
    const counts = new Map<string, number>();
    for (const o of outwards) {
      const prefix = areaPrefix(o);
      counts.set(prefix, (counts.get(prefix) ?? 0) + 1);
    }
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
    return AREA_NAMES[top] ?? top;
  };
  // Meta's bulk box splits on commas as well as newlines, so the country
  // can't ride in the same line as a column — it goes in as a GB: prefix,
  // which is the one format the postal-code matcher documents.
  const metaFormat = (outwards: string[]) =>
    outwards.map((o) => `GB:${o}`).join("\n");
  const metaAll = metaFormat(covered.map((a) => a.outward));
  const metaEarning = metaFormat(producing.map((a) => a.outward));

  const allPinsText = meta.pins
    .map((pin) => `${pin.lat}, ${pin.lng}  +${pin.radius_miles}mi  (${prefixName(pin.districts)} — ${pin.districts.length} districts)`)
    .join("\n");

  const allDistricts = covered.map((a) => a.outward).join("\n");
  const earningDistricts = producing.map((a) => a.outward).join("\n");
  const gapDistricts = gaps.map((g) => g.outward).join("\n");

  return (
    <main>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900">Coverage</h1>
        <p className="mt-1 text-sm text-slate-500">
          Every postcode a cleaner claims, and what it has actually produced.
        </p>

        <Card
          title="Meta ad targeting — your coverage, ready to paste"
          description="Built from the districts your approved cleaners actually claim, so re-copy whenever coverage changes. The buttons are the bulk Postal codes format; the pins below are plan B for any district the matcher refuses — paste a pin's coordinates into the location search box and drop a pin."
        >
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <CopyButton
              text={metaAll}
              label={`Copy all ${covered.length} districts for Meta`}
              className="bg-slate-900 text-white hover:bg-slate-800"
            />
            {producing.length > 0 && (
              <CopyButton
                text={metaEarning}
                label={`Copy the ${producing.length} that earn, for Meta`}
                className="border border-accent-300 text-accent-800 hover:bg-accent-50"
              />
            )}
          </div>
          <p className="mb-4 text-xs text-slate-500">
            Paste into Ad set → Locations → Add locations in bulk → location
            type <strong>Postal codes</strong>. Each line reads
            &ldquo;GB:district&rdquo; — the prefix pins the match to the UK,
            and there are no commas because Meta&apos;s paste box treats a
            comma as the start of a new location. Then switch the audience to
            &ldquo;People living in this location&rdquo;.
          </p>
          <ul className="space-y-2 text-sm">
            {meta.pins.map((pin) => (
              <li
                key={`${pin.lat},${pin.lng}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {prefixName(pin.districts)}{" "}
                    <span className="font-normal text-slate-500">
                      · pin {pin.lat}, {pin.lng} · {pin.radius_miles} mile radius
                    </span>
                  </p>
                  <p className="mt-0.5 break-words font-mono text-xs text-slate-500">
                    {pin.districts.length > 18
                      ? `${pin.districts.slice(0, 18).join(" ")} +${pin.districts.length - 18} more`
                      : pin.districts.join(" ")}
                  </p>
                </div>
                <CopyButton
                  text={`${pin.lat}, ${pin.lng}`}
                  label="Copy pin"
                  className="border border-slate-300 text-slate-700 hover:bg-slate-100"
                />
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <CopyButton
              text={allPinsText}
              label={`Copy all ${meta.pins.length} pins as a list`}
              className="bg-slate-900 text-white hover:bg-slate-800"
            />
          </div>
          <p className="mt-3 text-xs text-slate-500">
            In Ads Manager: Ad set → Locations → remove the broad location →
            paste a pin into the search box → choose &ldquo;Drop pin&rdquo; →
            set the radius shown → repeat for each. Then switch the audience
            from &ldquo;living in or recently in&rdquo; to{" "}
            <strong>&ldquo;People living in this location&rdquo;</strong> —
            holidaymakers browsing from a beach don&apos;t need their carpets
            done here.
            {meta.unplaced.length > 0 &&
              ` Couldn't place on the map: ${meta.unplaced.join(", ")}.`}
          </p>
        </Card>

        {/* Coverage problems are per cleaner, so show it per cleaner. */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Who claims what</h2>
          <p className="mt-1 text-sm text-slate-500">
            Edit any of these in{" "}
            <Link href="/admin/cleaners" className="font-semibold text-primary-600 underline">
              Cleaners
            </Link>
            . A patch much over 100 districts is worth a second look — it means
            confirmed bookings in places nobody can reach.
          </p>
          <ul className="mt-4 divide-y divide-slate-100 text-sm">
            {byCleaner.map((c) => (
              <li key={c.id} className="py-2.5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-semibold text-slate-900">
                    {c.business_name || c.name}
                    <span className="ml-2 text-xs font-normal text-slate-400">
                      {c.status}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 tabular-nums font-semibold ${
                      c.areas > 100 ? "text-amber-700" : "text-slate-600"
                    }`}
                  >
                    {c.areas} district{c.areas === 1 ? "" : "s"}
                  </span>
                </div>
                {c.sample && (
                  <p className="mt-1 break-words font-mono text-xs text-slate-500">
                    {c.sample.length > 220
                      ? `${c.sample.slice(0, 220)}…`
                      : c.sample}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>

        <div className="my-6 grid gap-4 sm:grid-cols-5">
          {[
            { label: "Districts covered", value: String(covered.length), hint: "Across all cleaners" },
            { label: "Producing work", value: String(producing.length), hint: "Have had a booking" },
            { label: "Nothing yet", value: String(idle), hint: "Covered but no jobs" },
            { label: "One cleaner only", value: String(singles.length), hint: "Goes dark if they leave" },
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
          description="One district per line — the format both Google Ads bulk locations and Meta's Add locations in bulk → Postal codes expect. A comma-separated list is read as a single location and matches nothing."
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
            For Meta: Ad set → Locations → Add locations in bulk → location
            type Postal codes → paste this list → match, then switch the
            audience to &ldquo;People living in this location&rdquo;. Spending
            against districts you cover but which have never produced a job is
            the easiest money to waste, which is what the middle button is
            for.
          </p>
        </Card>


        {soloOrdered.length > 0 && (
          <Card
            title="Covered by one cleaner only"
            description="If that cleaner leaves, is suspended, or just stops answering, these districts silently disappear from /book. The bigger the block, the more a second cleaner there de-risks the business — recruit around the top of this list."
            className="mb-6 border-amber-200"
          >
            <ul className="mt-4 space-y-3 text-sm">
              {soloOrdered.map(([cleanerName, areas]) => (
                <li key={cleanerName}>
                  <p className="font-semibold text-slate-900">
                    {cleanerName}
                    <span className="ml-2 font-normal text-slate-500">
                      — only cover for {areas.length} district
                      {areas.length === 1 ? "" : "s"}
                      {areas.some((a) => a.jobs > 0) &&
                        `, ${areas.reduce((sum, a) => sum + a.jobs, 0)} job${
                          areas.reduce((sum, a) => sum + a.jobs, 0) === 1 ? "" : "s"
                        } to date`}
                    </span>
                  </p>
                  <p className="mt-1 break-words font-mono text-xs text-amber-800">
                    {areas.map((a) => a.outward).join(" ")}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        )}

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
