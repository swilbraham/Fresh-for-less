import Link from "next/link";
import type { ReactNode } from "react";

export function Alert({
  tone = "error",
  children,
}: {
  tone?: "error" | "success" | "info";
  children: ReactNode;
}) {
  const tones = {
    error: "border-red-200 bg-red-50 text-red-700",
    success: "border-accent-200 bg-accent-50 text-accent-900",
    info: "border-primary-200 bg-primary-50 text-primary-900",
  };
  return (
    <p className={`mb-6 rounded-xl border px-4 py-3 text-sm ${tones[tone]}`}>
      {children}
    </p>
  );
}

export function Card({
  title,
  description,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}
    >
      {title && <h2 className="text-lg font-bold text-slate-900">{title}</h2>}
      {description && (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      )}
      {children}
    </section>
  );
}

export function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  placeholder,
  hint,
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
  placeholder?: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
      />
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** The am/pm checkbox grid used at registration and on the coverage page. */
export function AvailabilityGrid({
  availability,
}: {
  availability: { weekday: number; am: boolean; pm: boolean }[];
}) {
  const byDay = new Map(availability.map((a) => [a.weekday, a]));
  const order = [1, 2, 3, 4, 5, 6, 0];

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-2 font-semibold">Day</th>
            <th className="px-4 py-2 font-semibold">Morning</th>
            <th className="px-4 py-2 font-semibold">Afternoon</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {order.map((weekday) => {
            const row = byDay.get(weekday);
            return (
              <tr key={weekday}>
                <td className="px-4 py-2 font-medium text-slate-800">
                  {WEEKDAY_NAMES[weekday]}
                </td>
                {(["am", "pm"] as const).map((window) => (
                  <td key={window} className="px-4 py-2">
                    <input
                      type="checkbox"
                      name={`day-${weekday}-${window}`}
                      defaultChecked={row?.[window] ?? false}
                      aria-label={`${WEEKDAY_NAMES[weekday]} ${window}`}
                      className="h-5 w-5 rounded border-slate-300 accent-primary-600"
                    />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function ProNav({ name }: { name: string }) {
  const links = [
    { href: "/pro/dashboard", label: "Jobs" },
    { href: "/pro/history", label: "History" },
    { href: "/pro/coverage", label: "Coverage & diary" },
    { href: "/pro/invoices", label: "Commission" },
  ];
  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <span className="font-bold text-slate-900">Fresh For Less Pro</span>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm font-semibold text-slate-600 hover:text-primary-600"
          >
            {link.label}
          </Link>
        ))}
        <span className="ml-auto text-sm text-slate-500">{name}</span>
      </div>
    </nav>
  );
}

export function AdminNav() {
  const links = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/prices", label: "Prices & commission" },
    { href: "/admin/cleaners", label: "Cleaners" },
    { href: "/admin/coverage", label: "Coverage" },
    { href: "/admin/jobs", label: "Jobs" },
    { href: "/admin/messages", label: "Messages" },
    { href: "/admin/invoices", label: "Commission invoices" },
  ];
  return (
    <nav className="border-b border-slate-800 bg-slate-900 text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <span className="font-bold">Marketplace admin</span>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm font-semibold text-slate-300 hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function StatusPill({ status }: { status: string }) {
  const tones: Record<string, string> = {
    approved: "bg-accent-100 text-accent-800",
    completed: "bg-accent-100 text-accent-800",
    paid: "bg-accent-100 text-accent-800",
    pending: "bg-amber-100 text-amber-800",
    offered: "bg-primary-100 text-primary-800",
    accepted: "bg-primary-100 text-primary-800",
    issued: "bg-amber-100 text-amber-800",
    unfilled: "bg-red-100 text-red-700",
    cancelled: "bg-slate-200 text-slate-600",
    suspended: "bg-red-100 text-red-700",
    rejected: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
        tones[status] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}
