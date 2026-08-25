import NjordBadge from "./NjordBadge";

/**
 * The Njord Approved standard.
 *
 * The same six points serve two very different readers, so the copy is written
 * twice rather than shared: a cleaner needs to know what is required of them,
 * a customer needs to know what it buys them. Keeping both in one file means
 * the standard can't quietly say different things in different places.
 */

type Point = { title: string; body: string };

const FOR_CLEANERS: Point[] = [
  {
    title: "Trained & Certified",
    body: "Professionally trained and certified.",
  },
  {
    title: "Fully Insured",
    body: "Valid public liability insurance must be maintained.",
  },
  {
    title: "Greener Cleaning",
    body: "Modern professional chemistry and cleaning methods designed to reduce unnecessary chemical and water use.",
  },
  {
    title: "Professional & Friendly",
    body: "Reliable, presentable and committed to providing excellent customer service.",
  },
  {
    title: "Accountable",
    body: "You stand behind your work. Complaints are dealt with promptly and put right, and approved status can be withdrawn if the standard slips.",
  },
];

const FOR_CUSTOMERS: Point[] = [
  {
    title: "Trained & Certified",
    body: "Your cleaner is professionally trained and certified — not someone who bought a machine last week.",
  },
  {
    title: "Fully Insured",
    body: "Valid public liability insurance, checked before they are approved and kept current.",
  },
  {
    title: "Greener Cleaning",
    body: "Modern chemistry and methods chosen to use less water and fewer unnecessary chemicals in your home.",
  },
  {
    title: "Professional & Friendly",
    body: "Reliable, presentable and there to do a proper job.",
  },
  {
    title: "Accountable",
    body: "Approved status has to be earned and kept. If a job is not right, tell us and we will put it right.",
  },
];

export default function NjordApproved({
  audience,
}: {
  audience: "cleaner" | "customer";
}) {
  const cleaner = audience === "cleaner";
  const points = cleaner ? FOR_CLEANERS : FOR_CUSTOMERS;

  return (
    <section className="@container overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-sm">
      <div className="border-b border-slate-800 bg-slate-950/40 px-6 py-6 text-center">
        <NjordBadge className="mx-auto h-auto w-full max-w-[280px]" />
        <h2 className="mt-4 text-lg font-bold text-white">
          The Njord Approved Standard
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
          {cleaner
            ? "Every cleaner receiving work through the network must meet the Njord Approved standard."
            : "Work is offered only to Njord Approved cleaners — trained, insured, and held to a published standard."}
        </p>
      </div>

      <ul className="grid gap-x-8 gap-y-5 px-6 py-6 @lg:grid-cols-2">
        {points.map((point) => (
          <li key={point.title} className="flex gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-500/15 text-xs font-bold text-primary-400">
              ✓
            </span>
            <div>
              <p className="font-semibold text-white">{point.title}</p>
              <p className="mt-0.5 text-sm text-slate-400">{point.body}</p>
            </div>
          </li>
        ))}
      </ul>

      {cleaner && (
        <div className="border-t border-slate-800 px-6 py-4 text-center">
          <p className="text-sm text-slate-400">
            Training and approval is run by Njord Chemicals —{" "}
            <a
              href="https://www.njordchemicals.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary-400 underline underline-offset-2 hover:text-primary-300"
            >
              njordchemicals.com
            </a>
          </p>
        </div>
      )}
    </section>
  );
}
