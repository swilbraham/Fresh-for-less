import { isAdmin } from "@/lib/marketplace/auth";
import { query } from "@/lib/marketplace/db";

export const dynamic = "force-dynamic";

/** RFC 4180 quoting — commas, quotes and newlines all survive a round trip. */
function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const text =
    typeof value === "object" ? JSON.stringify(value) : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => csvCell(row[h])).join(","));
  }
  // BOM so Excel opens UTF-8 (and pound signs) correctly.
  return `﻿${lines.join("\r\n")}\r\n`;
}

const EXPORTS: Record<string, { sql: string; filename: string }> = {
  jobs: {
    filename: "jobs",
    sql: `SELECT j.ref, j.status,
                 to_char(j.created_at, 'YYYY-MM-DD HH24:MI') AS booked_at,
                 to_char(j.slot_date, 'YYYY-MM-DD')          AS slot_date,
                 j.slot_window,
                 j.customer_name, j.customer_email, j.customer_phone,
                 j.address_line, j.town, j.postcode,
                 c.name AS cleaner, c.email AS cleaner_email,
                 round(j.total_pence / 100.0, 2)      AS total_gbp,
                 round(j.commission_pence / 100.0, 2) AS commission_gbp,
                 j.commission_pct,
                 to_char(j.completed_at, 'YYYY-MM-DD HH24:MI') AS completed_at,
                 j.cancelled_by, j.late_cancellation, j.rescheduled_count,
                 j.notes
            FROM jobs j LEFT JOIN cleaners c ON c.id = j.cleaner_id
           ORDER BY j.created_at DESC`,
  },
  cleaners: {
    filename: "cleaners",
    sql: `SELECT c.name, c.business_name, c.email, c.phone, c.status,
                 c.insurance_provider,
                 to_char(c.insurance_expiry, 'YYYY-MM-DD') AS insurance_expiry,
                 c.years_experience, c.equipment,
                 to_char(c.created_at, 'YYYY-MM-DD') AS applied_on,
                 (SELECT string_agg(a.outward, ' ' ORDER BY a.outward)
                    FROM cleaner_areas a WHERE a.cleaner_id = c.id) AS covers,
                 (SELECT count(*) FROM jobs j
                   WHERE j.cleaner_id = c.id AND j.status = 'completed') AS jobs_completed,
                 (SELECT count(*) FROM job_drops d WHERE d.cleaner_id = c.id) AS jobs_dropped
            FROM cleaners c ORDER BY c.created_at DESC`,
  },
  // Completed work month by month — the shape an accountant actually wants.
  // Dated by when the job was finished, in London time, to match /admin/finances.
  finance: {
    filename: "finance-by-month",
    sql: `SELECT to_char(date_trunc('month', j.completed_at AT TIME ZONE 'Europe/London'), 'YYYY-MM') AS month,
                 count(*)                                    AS jobs_completed,
                 round(COALESCE(sum(j.total_pence),0) / 100.0, 2)      AS customer_value_gbp,
                 round(COALESCE(sum(j.commission_pence),0) / 100.0, 2) AS commission_gbp,
                 round(COALESCE(sum(j.total_pence - j.commission_pence),0) / 100.0, 2)
                                                             AS cleaners_kept_gbp,
                 round(
                   COALESCE(sum(j.commission_pence),0) * 100.0
                   / NULLIF(sum(j.total_pence), 0), 2)       AS effective_rate_pct
            FROM jobs j
           WHERE j.status = 'completed' AND j.completed_at IS NOT NULL
           GROUP BY 1
           ORDER BY 1 DESC`,
  },
  invoices: {
    filename: "commission-invoices",
    sql: `SELECT i.ref, c.name AS cleaner, c.email AS cleaner_email,
                 to_char(i.period_start, 'YYYY-MM-DD') AS period_start,
                 to_char(i.period_end,   'YYYY-MM-DD') AS period_end,
                 round(i.total_pence / 100.0, 2) AS total_gbp,
                 i.status,
                 to_char(i.issued_at, 'YYYY-MM-DD') AS issued_at,
                 to_char(i.paid_at,   'YYYY-MM-DD') AS paid_at,
                 (SELECT count(*) FROM commission_invoice_lines l
                   WHERE l.invoice_id = i.id) AS job_count
            FROM commission_invoices i
            JOIN cleaners c ON c.id = i.cleaner_id
           ORDER BY i.issued_at DESC`,
  },
};

/** Admin-only data export. Everything here is personal data — see SECURITY.md. */
export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return new Response("Not authorised", { status: 401 });
  }

  const type = new URL(request.url).searchParams.get("type") ?? "jobs";
  const spec = EXPORTS[type];
  if (!spec) return new Response("Unknown export", { status: 400 });

  const rows = await query<Record<string, unknown>>(spec.sql);
  const today = new Date().toISOString().slice(0, 10);

  return new Response(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ffl-${spec.filename}-${today}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
