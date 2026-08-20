import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/marketplace/auth";
import { getBundles, getPriceItems, getSettings } from "@/lib/marketplace/repo";
import { gbpShort } from "@/lib/marketplace/money";
import {
  addBundleAction,
  addPriceItemAction,
  deleteBundleAction,
  deletePriceItemAction,
  savePricesAction,
} from "../actions";
import { AdminNav, Alert, Card } from "@/components/marketplace/shell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Prices & commission",
  robots: { index: false, follow: false },
};

const KINDS = [
  { value: "carpet", label: "Carpets & stairs" },
  { value: "upholstery", label: "Upholstery" },
  { value: "extra", label: "Optional extras" },
];

export default async function AdminPricesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin");
  const { error, saved } = await searchParams;

  const [settings, items, bundles] = await Promise.all([
    getSettings(),
    getPriceItems(),
    getBundles(),
  ]);

  return (
    <main className="min-h-screen bg-slate-50">
      <AdminNav />

      <div className="mx-auto max-w-5xl px-4 py-8">
        {error && <Alert>{error}</Alert>}
        {saved && <Alert tone="success">Prices updated. Live on /book now.</Alert>}

        <form action={savePricesAction} className="space-y-6">
          <Card
            title="Platform settings"
            description="These apply nationally to every job and every cleaner."
          >
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="commissionPct"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Commission rate (%)
                </label>
                <input
                  id="commissionPct"
                  name="commissionPct"
                  type="number"
                  step="0.5"
                  min="0"
                  max="90"
                  defaultValue={Number(settings.commission_pct)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-primary-500"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Charged to the cleaner on completed jobs. The rate in force when
                  a job is booked is locked to that job.
                </p>
              </div>
              <div>
                <label
                  htmlFor="minimumCharge"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Minimum job charge (£)
                </label>
                <input
                  id="minimumCharge"
                  name="minimumCharge"
                  defaultValue={(settings.minimum_charge_pence / 100).toFixed(2)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-primary-500"
                />
                <p className="mt-1 text-xs text-slate-500">
                  No job is priced below this, however small the basket.
                </p>
              </div>
              <div>
                <label
                  htmlFor="minNoticeDays"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Minimum notice (days)
                </label>
                <input
                  id="minNoticeDays"
                  name="minNoticeDays"
                  type="number"
                  min="0"
                  max="30"
                  defaultValue={settings.min_notice_days}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label
                  htmlFor="cancellationNoticeHours"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Free cancellation notice (hours)
                </label>
                <input
                  id="cancellationNoticeHours"
                  name="cancellationNoticeHours"
                  type="number"
                  min="0"
                  max="336"
                  defaultValue={settings.cancellation_notice_hours}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-primary-500"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Customers can always cancel themselves, but anything inside this
                  window is flagged as a late cancellation for you and the cleaner.
                </p>
              </div>
              <div>
                <label
                  htmlFor="bookingEmail"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Office email
                </label>
                <input
                  id="bookingEmail"
                  name="bookingEmail"
                  type="email"
                  defaultValue={settings.booking_email}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-primary-500"
                />
              </div>
            </div>
          </Card>

          <Card
            title="National price list"
            description="Every price the instant quote is built from. Untick to hide an item from customers without deleting its history."
          >
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="py-2 font-semibold">Live</th>
                    <th className="py-2 font-semibold">Label</th>
                    <th className="py-2 font-semibold">Hint shown to customer</th>
                    <th className="py-2 font-semibold">Price (£)</th>
                    <th className="py-2 font-semibold">Max qty</th>
                    <th className="py-2 font-semibold" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.code}>
                      <td className="py-2">
                        <input
                          type="checkbox"
                          name={`active-${item.code}`}
                          defaultChecked={item.active}
                          aria-label={`${item.label} live`}
                          className="h-5 w-5 rounded border-slate-300 accent-accent-600"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          name={`label-${item.code}`}
                          defaultValue={item.label}
                          aria-label={`${item.code} label`}
                          className="w-full rounded-lg border border-slate-300 px-3 py-1.5"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          name={`hint-${item.code}`}
                          defaultValue={item.hint}
                          aria-label={`${item.code} hint`}
                          className="w-full rounded-lg border border-slate-300 px-3 py-1.5"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          name={`price-${item.code}`}
                          defaultValue={(item.unit_price_pence / 100).toFixed(2)}
                          aria-label={`${item.code} price`}
                          className="w-24 rounded-lg border border-slate-300 px-3 py-1.5 tabular-nums"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          name={`max-${item.code}`}
                          type="number"
                          min="1"
                          max="50"
                          defaultValue={item.max_qty}
                          aria-label={`${item.code} max quantity`}
                          className="w-20 rounded-lg border border-slate-300 px-3 py-1.5 tabular-nums"
                        />
                      </td>
                      <td className="py-2 text-right text-xs text-slate-400">
                        {item.code}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <button
            type="submit"
            className="w-full rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
          >
            Save prices &amp; settings
          </button>
        </form>

        {/* Bundle offers */}
        <Card
          title="Fixed-price offers"
          description="e.g. 4 rooms for £99. The quote automatically works out the cheapest combination for the customer."
          className="mt-8"
        >
          {bundles.length > 0 && (
            <ul className="mt-4 divide-y divide-slate-100">
              {bundles.map((bundle) => {
                const item = items.find((i) => i.code === bundle.item_code);
                return (
                  <li
                    key={bundle.id}
                    className="flex items-center justify-between gap-4 py-2 text-sm"
                  >
                    <span className="text-slate-700">
                      <strong>{bundle.label}</strong> — {bundle.qty} ×{" "}
                      {item?.label ?? bundle.item_code} for{" "}
                      {gbpShort(bundle.price_pence)}
                    </span>
                    <form action={deleteBundleAction}>
                      <input type="hidden" name="id" value={bundle.id} />
                      <button
                        type="submit"
                        className="text-xs font-semibold text-red-600 underline"
                      >
                        Remove
                      </button>
                    </form>
                  </li>
                );
              })}
            </ul>
          )}

          <form
            action={addBundleAction}
            className="mt-5 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-5"
          >
            <select
              name="itemCode"
              aria-label="Offer applies to"
              className="rounded-xl border border-slate-300 px-3 py-2.5"
            >
              {items.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label}
                </option>
              ))}
            </select>
            <input
              name="qty"
              type="number"
              min="2"
              max="50"
              placeholder="Qty"
              aria-label="Offer quantity"
              className="rounded-xl border border-slate-300 px-3 py-2.5"
            />
            <input
              name="price"
              placeholder="Price £"
              aria-label="Offer price"
              className="rounded-xl border border-slate-300 px-3 py-2.5"
            />
            <input
              name="label"
              placeholder="Label, e.g. 4 rooms for £99"
              aria-label="Offer label"
              className="rounded-xl border border-slate-300 px-3 py-2.5"
            />
            <button
              type="submit"
              className="rounded-xl bg-primary-600 px-4 py-2.5 font-semibold text-white"
            >
              Add offer
            </button>
          </form>
        </Card>

        {/* New item */}
        <Card title="Add a new priced item" className="mt-8">
          <form action={addPriceItemAction} className="mt-4 grid gap-3 sm:grid-cols-3">
            <input
              name="code"
              placeholder="Code, e.g. curtains"
              aria-label="Item code"
              className="rounded-xl border border-slate-300 px-3 py-2.5"
            />
            <input
              name="label"
              placeholder="Label, e.g. Curtains (per pair)"
              aria-label="Item label"
              className="rounded-xl border border-slate-300 px-3 py-2.5"
            />
            <input
              name="price"
              placeholder="Price £"
              aria-label="Item price"
              className="rounded-xl border border-slate-300 px-3 py-2.5"
            />
            <input
              name="hint"
              placeholder="Hint shown to customer"
              aria-label="Item hint"
              className="rounded-xl border border-slate-300 px-3 py-2.5 sm:col-span-2"
            />
            <select
              name="kind"
              aria-label="Item group"
              className="rounded-xl border border-slate-300 px-3 py-2.5"
            >
              {KINDS.map((kind) => (
                <option key={kind.value} value={kind.value}>
                  {kind.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-xl bg-primary-600 px-4 py-2.5 font-semibold text-white sm:col-span-3"
            >
              Add item
            </button>
          </form>

          <details className="mt-6">
            <summary className="cursor-pointer text-sm font-semibold text-slate-600">
              Remove an item permanently
            </summary>
            <ul className="mt-3 flex flex-wrap gap-2">
              {items.map((item) => (
                <li key={item.code}>
                  <form action={deletePriceItemAction}>
                    <input type="hidden" name="code" value={item.code} />
                    <button
                      type="submit"
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-red-100 hover:text-red-700"
                    >
                      {item.label} ×
                    </button>
                  </form>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-slate-500">
              Deleting also removes any offers attached to it. Untick
              &ldquo;live&rdquo; above instead if you only want to hide it.
            </p>
          </details>
        </Card>
      </div>
    </main>
  );
}
