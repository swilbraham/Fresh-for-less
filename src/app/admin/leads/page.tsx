import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/marketplace/auth";
import { listLeads, hasCoverage } from "@/lib/marketplace/repo";
import { setLeadStatusAction, deleteLeadAction } from "../actions";
import { AdminNav, Alert, Card } from "@/components/marketplace/shell";
import ConfirmButton from "@/components/marketplace/ConfirmButton";

export const dynamic = "force-dynamic";

export const metadata = { title: "Enquiries", robots: { index: false, follow: false } };

const TABS = [
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "booked", label: "Booked" },
  { key: "dead", label: "Not proceeding" },
  { key: "", label: "All" },
];

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; saved?: string; error?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin");
  const { status, saved, error } = await searchParams;
  const active = status ?? "new";

  const leads = await listLeads(active || undefined);
  const covered = new Map<string, boolean>();
  for (const outward of new Set(leads.map((l) => l.outward).filter(Boolean))) {
    covered.set(outward, await hasCoverage(outward));
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <AdminNav />
      <div className="mx-auto max-w-4xl px-4 py-8">
        {error && <Alert>{error}</Alert>}
        {saved && <Alert tone="success">Enquiry updated.</Alert>}

        <h1 className="text-2xl font-bold text-slate-900">Enquiries</h1>
        <p className="mt-1 text-sm text-slate-500">
          From the offer pages. These aren&apos;t bookings — there&apos;s no
          date or address yet — so ring them, then take the details on{" "}
          <Link href="/admin/jobs/new" className="font-semibold text-primary-600 underline">
            new booking
          </Link>
          .
        </p>

        <div className="my-5 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <Link
              key={t.key || "all"}
              href={t.key ? `/admin/leads?status=${t.key}` : "/admin/leads?status="}
              className={`rounded-xl px-3 py-1.5 text-sm ${
                active === t.key
                  ? "bg-primary-600 font-semibold text-white"
                  : "border border-slate-200 bg-white text-slate-600"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        {leads.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-500">Nothing here.</p>
          </Card>
        ) : (
          <ul className="space-y-3">
            {leads.map((lead) => {
              const cover = lead.outward ? covered.get(lead.outward) : undefined;
              return (
                <li
                  key={lead.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-bold text-slate-900">
                      {lead.name}
                      {lead.phone ? (
                        <a
                          href={`tel:${lead.phone}`}
                          className="ml-3 font-semibold text-primary-600 underline"
                        >
                          {lead.phone}
                        </a>
                      ) : (
                        <span className="ml-3 text-sm font-normal text-slate-400">
                          no phone yet — reply in the {lead.source === "instagram-dm" ? "Instagram" : "Facebook"} inbox
                        </span>
                      )}
                    </p>
                    <span className="font-mono text-xs text-slate-400">
                      {lead.ref} · {lead.created_at.slice(0, 16).replace("T", " ")}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-slate-600">
                    {lead.postcode || "no postcode"}
                    {lead.rooms ? ` · ${lead.rooms}` : ""}
                    {cover === false && (
                      <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                        no cover
                      </span>
                    )}
                    {cover === true && (
                      <span className="ml-2 rounded-full bg-accent-100 px-2 py-0.5 text-xs font-semibold text-accent-700">
                        covered
                      </span>
                    )}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    via {lead.source || "unknown"}
                    {lead.landing_path ? ` · ${lead.landing_path}` : ""}
                    {lead.referrer ? ` · from ${lead.referrer.slice(0, 60)}` : ""}
                  </p>

                  {lead.summary && (
                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      {lead.summary}
                    </p>
                  )}
                  {lead.notes && (
                    <p className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                      {lead.notes}
                    </p>
                  )}

                  <form action={setLeadStatusAction} className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <input type="hidden" name="id" value={lead.id} />
                    <input type="hidden" name="back" value={active} />
                    {lead.status !== "booked" && (
                      <Link
                        href={`/admin/jobs/new?lead=${lead.id}&name=${encodeURIComponent(lead.name)}&phone=${encodeURIComponent(lead.phone)}&postcode=${encodeURIComponent(lead.postcode ?? "")}`}
                        className="rounded-lg bg-accent-600 px-3 py-1.5 font-semibold text-white hover:bg-accent-700"
                      >
                        Book them in →
                      </Link>
                    )}
                    {["contacted", "booked", "dead"]
                      .filter((s) => s !== lead.status)
                      .map((s) => (
                        <button
                          key={s}
                          type="submit"
                          name="status"
                          value={s}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          {s === "dead" ? "Not proceeding" : `Mark ${s}`}
                        </button>
                      ))}
                    <span className="ml-1 text-slate-400">now: {lead.status}</span>
                    <ConfirmButton
                      action={deleteLeadAction.bind(null, lead.id, active)}
                      confirmText={`Delete this enquiry from ${lead.name} permanently? Mark it "Not proceeding" instead if you just want it out of the way.`}
                      className="ml-auto rounded-lg px-3 py-1.5 font-semibold text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </ConfirmButton>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
