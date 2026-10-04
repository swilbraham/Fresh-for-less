import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/marketplace/auth";
import { Card } from "@/components/marketplace/shell";
import { listLocations, squareStatus } from "@/lib/marketplace/square";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Square",
  robots: { index: false, follow: false },
};

/**
 * What the live deploy believes about Square, read from the live deploy.
 *
 * Every Square failure so far has been a variable that looked right in Vercel
 * and wrong in the running build — an env that stayed sandbox, a location id
 * from the other environment. Guessing at those from an invoice error costs a
 * deploy per guess, so this page asks Square directly and prints the answer.
 */
export default async function SquarePage() {
  if (!(await isAdmin())) redirect("/admin");

  const status = squareStatus();

  let locations: Awaited<ReturnType<typeof listLocations>> = [];
  let error: string | null = null;
  if (status.missing.length === 0) {
    try {
      locations = await listLocations();
    } catch (cause) {
      error = cause instanceof Error ? cause.message : String(cause);
    }
  }

  const match = locations.find((location) => location.id === status.locationId);

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Square</h1>
        <p className="mt-1 text-sm text-slate-600">
          Read live from this deployment. Change a variable in Vercel and it
          only shows here after a new build.
        </p>
      </div>

      <Card title="What this build is using">
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex gap-3">
            <dt className="w-40 text-slate-500">SQUARE_ENV</dt>
            <dd className="font-mono font-semibold text-slate-900">
              {status.env}
            </dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-40 text-slate-500">Calling</dt>
            <dd className="font-mono font-semibold text-slate-900">
              {status.host ?? "— (Square is off)"}
            </dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-40 text-slate-500">SQUARE_LOCATION_ID</dt>
            <dd className="font-mono font-semibold text-slate-900">
              {status.locationId || "— (not set)"}
            </dd>
          </div>
        </dl>

        {status.missing.length > 0 && (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Card payments are off — not set in this build:{" "}
            <span className="font-mono">{status.missing.join(", ")}</span>. Add
            them in Vercel with the Production box ticked, then redeploy.
          </p>
        )}
      </Card>

      {status.missing.length === 0 && (
        <Card
          title="Locations this token can see"
          description="The id below has to be copied exactly. A location from the other environment reads as 'Invalid location id'."
        >
          {error ? (
            <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-mono text-xs text-red-800">
              {error}
            </p>
          ) : locations.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">
              Square answered, but this token has no locations. That normally
              means the token belongs to a different account than the business.
            </p>
          ) : (
            <>
              <ul className="mt-3 divide-y divide-slate-100">
                {locations.map((location) => (
                  <li
                    key={location.id}
                    className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-3"
                  >
                    <span className="font-mono text-sm font-semibold text-slate-900">
                      {location.id}
                    </span>
                    <span className="text-sm text-slate-700">
                      {location.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {[location.status, location.currency, location.country]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                    {location.id === status.locationId && (
                      <span className="rounded-full bg-accent-100 px-2 py-0.5 text-xs font-semibold text-accent-800">
                        in use
                      </span>
                    )}
                  </li>
                ))}
              </ul>

              {!match && (
                <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  SQUARE_LOCATION_ID isn&apos;t one of these, which is why
                  payment links are refused. Copy an id from the list into
                  Vercel and redeploy.
                </p>
              )}
            </>
          )}
        </Card>
      )}

      <Card title="If a link still fails">
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
          <li>
            Chase an invoice on{" "}
            <span className="font-mono">/admin/invoices</span> — it creates the
            link on an invoice that hasn&apos;t got one, so there&apos;s no need
            to raise a fresh one to test.
          </li>
          <li>
            The webhook URL in Square must be{" "}
            <span className="font-mono">/api/square/webhook</span> on the live
            domain, subscribed to <span className="font-mono">payment.updated</span>
            , with its signature key in{" "}
            <span className="font-mono">SQUARE_WEBHOOK_SIGNATURE_KEY</span>.
            Without that, a cleaner can pay and the invoice stays unpaid.
          </li>
        </ul>
      </Card>
    </main>
  );
}
