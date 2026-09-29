import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/marketplace/auth";
import { listTrainingEnquiries } from "@/lib/marketplace/repo";
import {
  addTrainingEnquiryAction,
  setTrainingEnquiryStatusAction,
  deleteTrainingEnquiryAction,
} from "../actions";
import { Alert, Card } from "@/components/marketplace/shell";
import ConfirmButton from "@/components/marketplace/ConfirmButton";

export const dynamic = "force-dynamic";

export const metadata = { title: "Training enquiries", robots: { index: false, follow: false } };

const TABS = [
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "booked", label: "Booked on course" },
  { key: "dead", label: "Not proceeding" },
  { key: "", label: "All" },
];

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none";

export default async function TrainingEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; saved?: string; error?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin");
  const { status, saved, error } = await searchParams;
  const active = status ?? "new";

  const enquiries = await listTrainingEnquiries(active || undefined);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {error && <Alert>{error}</Alert>}
        {saved && <Alert tone="success">Saved.</Alert>}

        <h1 className="text-2xl font-bold text-slate-900">Training enquiries</h1>
        <p className="mt-1 text-sm text-slate-500">
          People asking about the carpet cleaning training course. Enquiries from
          the{" "}
          <Link href="/training" className="font-semibold text-primary-600 underline">
            /training
          </Link>{" "}
          page land here on their own — use the form below for ones taken on the
          phone or from a DM.
        </p>

        <Card className="mt-5">
          <h2 className="font-bold text-slate-900">Add an enquiry</h2>
          <form action={addTrainingEnquiryAction} className="mt-3 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="name" required placeholder="Name" className={inputClass} />
              <input name="phone" type="tel" placeholder="Phone" className={inputClass} />
            </div>
            <input name="email" type="email" placeholder="Email (optional)" className={inputClass} />
            <textarea
              name="message"
              rows={2}
              placeholder="What they asked — preferred dates, experience, questions…"
              className={`${inputClass} resize-none`}
            />
            <button
              type="submit"
              className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
            >
              Save enquiry
            </button>
          </form>
        </Card>

        <div className="my-5 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <Link
              key={t.key || "all"}
              href={t.key ? `/admin/training?status=${t.key}` : "/admin/training?status="}
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

        {enquiries.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-500">Nothing here.</p>
          </Card>
        ) : (
          <ul className="space-y-3">
            {enquiries.map((enq) => (
              <li
                key={enq.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-bold text-slate-900">
                    {enq.name}
                    {enq.phone && (
                      <a
                        href={`tel:${enq.phone}`}
                        className="ml-3 font-semibold text-primary-600 underline"
                      >
                        {enq.phone}
                      </a>
                    )}
                    {enq.email && (
                      <a
                        href={`mailto:${enq.email}`}
                        className="ml-3 text-sm font-semibold text-primary-600 underline"
                      >
                        {enq.email}
                      </a>
                    )}
                  </p>
                  <span className="font-mono text-xs text-slate-400">
                    {enq.ref} · {enq.created_at}
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  via {enq.source === "admin" ? "phone/DM (entered by office)" : enq.source}
                </p>

                {enq.message && (
                  <p className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                    {enq.message}
                  </p>
                )}
                {enq.notes && (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{enq.notes}</p>
                )}

                <form
                  action={setTrainingEnquiryStatusAction}
                  className="mt-3 flex flex-wrap items-center gap-2 text-xs"
                >
                  <input type="hidden" name="id" value={enq.id} />
                  <input type="hidden" name="back" value={active} />
                  {["contacted", "booked", "dead"]
                    .filter((s) => s !== enq.status)
                    .map((s) => (
                      <button
                        key={s}
                        type="submit"
                        name="status"
                        value={s}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        {s === "dead"
                          ? "Not proceeding"
                          : s === "booked"
                            ? "Booked on course"
                            : "Mark contacted"}
                      </button>
                    ))}
                  <span className="ml-1 text-slate-400">now: {enq.status}</span>
                  <ConfirmButton
                    action={deleteTrainingEnquiryAction.bind(null, enq.id, active)}
                    confirmText={`Delete this enquiry from ${enq.name} permanently? Mark it "Not proceeding" instead if you just want it out of the way.`}
                    className="ml-auto rounded-lg px-3 py-1.5 font-semibold text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </ConfirmButton>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
