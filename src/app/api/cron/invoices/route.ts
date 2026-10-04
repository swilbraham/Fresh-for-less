import { NextResponse } from "next/server";
import {
  generateCommissionInvoices,
  getSettings,
  notify,
  notifyInvoiceRaised,
} from "@/lib/marketplace/repo";
import { gbpShort } from "@/lib/marketplace/money";
import { commissionDueBy } from "@/lib/marketplace/terms";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function iso(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function longDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/**
 * Nightly commission run — Vercel cron hits this at 8pm.
 *
 * It bills every completed job that isn't already on an invoice, not just ones
 * inside the labelled week, so anything completed late still gets picked up
 * rather than silently falling through the gap. The unique index on invoice
 * lines means a double trigger can't double-bill.
 */
export async function GET(request: Request) {
  // Vercel signs scheduled requests with CRON_SECRET. Without this the endpoint
  // would be a public button for raising everyone's invoices.
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  // Nightly at 8pm, covering today. The run still bills every completed job
  // that isn't already on an invoice rather than only the ones inside the
  // labelled day, so a job marked complete late is picked up by the next run
  // instead of falling through the gap.
  const today = new Date();
  const dueBy = commissionDueBy(today);

  const raised = await generateCommissionInvoices(iso(today), iso(today));

  for (const invoice of raised) {
    await notifyInvoiceRaised(invoice, longDate(dueBy));
  }

  if (raised.length > 0) {
    const settings = await getSettings();
    const total = raised.reduce((sum, i) => sum + i.totalPence, 0);
    await notify({
      recipient: settings.booking_email,
      subject: `Commission run ${iso(today)} — ${raised.length} invoice${raised.length === 1 ? "" : "s"}, ${gbpShort(total)}`,
      body:
        `Commission raised for ${longDate(today)}:\n\n` +
        raised
          .map((i) => `${i.ref} — ${gbpShort(i.totalPence)} (${i.jobs} job${i.jobs === 1 ? "" : "s"})`)
          .join("\n") +
        `\n\nTotal: ${gbpShort(total)}, payable by ${longDate(dueBy)}.`,
    });
  }

  return NextResponse.json({
    ok: true,
    period: { from: iso(today), to: iso(today) },
    invoicesRaised: raised.length,
    totalPence: raised.reduce((sum, i) => sum + i.totalPence, 0),
  });
}
