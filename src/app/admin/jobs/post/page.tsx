import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/marketplace/auth";
import { listOpenJobs, siteUrl } from "@/lib/marketplace/repo";
import { gbp } from "@/lib/marketplace/money";
import { Card } from "@/components/marketplace/shell";
import CopyButton from "@/components/marketplace/CopyButton";
import type { Job } from "@/lib/marketplace/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Post unfilled jobs",
  robots: { index: false, follow: false },
};

function dayLabel(day: string): string {
  return new Date(`${day}T12:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/**
 * One job as a Facebook-safe line: area and town but never the address,
 * date, what needs doing, and what the cleaner keeps. Customer details
 * stay out — this text is written to be pasted somewhere public.
 */
function jobLines(job: Job): string {
  const items = job.items
    .map((line) => `${line.qty}x ${line.label}`)
    .join(", ");
  const where = job.town ? `${job.outward} (${job.town})` : job.outward;
  const keeps = job.total_pence - job.commission_pence;
  return (
    `📍 ${where} — ${dayLabel(job.slot_date)}, ` +
    `${job.slot_window === "am" ? "morning (8–12)" : "afternoon (12–5)"}\n` +
    `${items} · customer pays ${gbp(job.total_pence)} · you keep ${gbp(keeps)}`
  );
}

export default async function PostUnfilledPage() {
  if (!(await isAdmin())) redirect("/admin");

  const jobs = await listOpenJobs();

  const post =
    jobs.length === 0
      ? ""
      : `🧽 CARPET CLEANING JOBS AVAILABLE — PAID ON THE DAY\n\n` +
        jobs.map(jobLines).join("\n\n") +
        `\n\nFirst to accept gets the job — customer pays you cash or card on completion.\n` +
        `Insured & experienced cleaners: sign up free at ${siteUrl()}/pro/register ` +
        `or call 0330 043 4811.`;

  return (
    <main>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link
          href="/admin/jobs"
          className="text-sm font-semibold text-slate-600 hover:text-primary-600"
        >
          ← All jobs
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          Post unfilled jobs ({jobs.length})
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Every open job with no cleaner, written up ready to paste into a
          Facebook group in one go. Safe to post publicly — postcode district
          and town only, never the customer&apos;s name, address or phone.
        </p>

        {jobs.length === 0 ? (
          <Card className="mt-6">
            <p className="text-sm text-slate-500">
              Nothing unfilled right now — every upcoming job has a cleaner.
            </p>
          </Card>
        ) : (
          <Card className="mt-6">
            <CopyButton
              text={post}
              label={`Copy all ${jobs.length} job${jobs.length === 1 ? "" : "s"} for Facebook`}
              className="bg-primary-600 text-white hover:bg-primary-700"
            />
            <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
              {post}
            </pre>
            <p className="mt-3 text-xs text-slate-500">
              A cleaner who answers isn&apos;t on the platform yet — add them
              from{" "}
              <Link
                href="/admin/cleaners"
                className="font-semibold text-primary-600 underline"
              >
                Cleaners
              </Link>{" "}
              (they land approved with a set-up text), then assign them the job
              from its page.
            </p>
          </Card>
        )}
      </div>
    </main>
  );
}
