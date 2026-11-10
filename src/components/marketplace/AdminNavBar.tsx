"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * The admin nav, grouped.
 *
 * Fourteen equal-weight links in one wrapping row gave no clue which page did
 * what, and nothing marked where you already were — so finding anything meant
 * reading all fourteen every time. Grouped by the job in hand (what needs
 * doing today, where work comes from, who does it, what it earns) you read
 * one group of three instead.
 */
const GROUPS: { label: string; links: { href: string; label: string }[] }[] = [
  {
    label: "Today",
    links: [
      { href: "/admin", label: "Overview" },
      { href: "/admin/jobs", label: "Jobs" },
      { href: "/admin/diary", label: "Diary" },
    ],
  },
  {
    label: "Demand",
    links: [
      { href: "/admin/quotes", label: "Quotes" },
      { href: "/admin/leads", label: "Enquiries" },
      { href: "/admin/messages", label: "Messages" },
    ],
  },
  {
    label: "Cleaners",
    links: [
      { href: "/admin/cleaners", label: "Network" },
      { href: "/admin/coverage", label: "Coverage" },
      { href: "/admin/training", label: "Training" },
    ],
  },
  {
    label: "Money",
    links: [
      { href: "/admin/invoices", label: "Commission" },
      { href: "/admin/finances", label: "Finances" },
      { href: "/admin/profit", label: "Profit" },
    ],
  },
  {
    label: "Setup",
    links: [
      { href: "/admin/prices", label: "Prices" },
      { href: "/admin/square", label: "Square" },
    ],
  },
];

export default function AdminNavBar() {
  const pathname = usePathname() ?? "";

  /** /admin matches only itself; every other link owns its whole section. */
  const isCurrent = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <nav className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900 text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2.5">
        <Link href="/admin" className="text-sm font-bold tracking-tight">
          Fresh For Less admin
        </Link>
        {GROUPS.map((group) => (
          <div key={group.label} className="flex items-baseline gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {group.label}
            </span>
            {group.links.map((link) => {
              const current = isCurrent(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={current ? "page" : undefined}
                  className={
                    current
                      ? "rounded-lg bg-white px-2 py-1 text-xs font-bold text-slate-900"
                      : "rounded-lg px-2 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </nav>
  );
}
