"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Booking = { name: string; place: string; age_seconds: number };

/** Pages where a marketing notice has no business appearing. */
const HIDDEN_ON = ["/admin", "/pro", "/booking", "/book"];

const FIRST_DELAY_MS = 8_000; // let the page be read before anything pops up
const VISIBLE_MS = 6_000;
const GAP_MS = 14_000;

/**
 * Honest relative time.
 *
 * The whole point of the notice is that it is true, so a booking from Tuesday
 * says Tuesday rather than "just now". "Just booked" is reserved for the few
 * minutes where it is actually accurate.
 */
function howLongAgo(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  if (minutes < 3) return "just now";
  if (minutes < 60) return `${minutes} minutes ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

/**
 * A small, dismissible notice showing that other people are booking.
 *
 * Every entry is a real booking pulled from the database — see
 * listRecentBookings. If there are no recent bookings, nothing renders, which
 * is the correct behaviour: a quiet fortnight should look quiet rather than be
 * papered over with invented names.
 */
export function RecentBookings() {
  const pathname = usePathname();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [index, setIndex] = useState(0);
  const [showing, setShowing] = useState(false);
  const [dismissed, setDismissed] = useState(true); // assume dismissed until checked

  const hidden = HIDDEN_ON.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  // Someone who closes it has said no. Respect that for the rest of the visit.
  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem("ffl-recent-dismissed") === "1");
    } catch {
      setDismissed(false); // private browsing — just show it
    }
  }, []);

  useEffect(() => {
    if (hidden || dismissed) return;
    let cancelled = false;

    fetch("/api/marketplace/recent")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.bookings?.length) setBookings(data.bookings);
      })
      .catch(() => {
        /* the notice is decoration — never surface a failure for it */
      });

    return () => {
      cancelled = true;
    };
  }, [hidden, dismissed]);

  // Cycle: wait, show one, hide, move to the next.
  useEffect(() => {
    if (hidden || dismissed || bookings.length === 0) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    const show = (delay: number) => {
      timers.push(
        setTimeout(() => {
          setShowing(true);
          timers.push(
            setTimeout(() => {
              setShowing(false);
              setIndex((i) => (i + 1) % bookings.length);
              show(GAP_MS);
            }, VISIBLE_MS)
          );
        }, delay)
      );
    };
    show(FIRST_DELAY_MS);

    return () => timers.forEach(clearTimeout);
  }, [hidden, dismissed, bookings.length]);

  if (hidden || dismissed || bookings.length === 0) return null;

  const booking = bookings[index];
  if (!booking) return null;

  function close() {
    setShowing(false);
    setDismissed(true);
    try {
      sessionStorage.setItem("ffl-recent-dismissed", "1");
    } catch {
      /* nothing to remember it with — it stays gone for this page at least */
    }
  }

  return (
    <div
      className={`pointer-events-none fixed bottom-4 left-4 z-40 max-w-[calc(100vw-2rem)] transition-all duration-500 motion-reduce:transition-none ${
        showing
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
      aria-hidden={!showing}
    >
      <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 py-3 pl-3 pr-2 shadow-lg backdrop-blur">
        <span
          className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-primary-50 text-primary-600"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        </span>

        <p className="text-sm leading-snug text-slate-700">
          <span className="font-semibold text-slate-900">{booking.name}</span>{" "}
          from{" "}
          <span className="font-semibold text-slate-900">{booking.place}</span>{" "}
          booked a clean
          <span className="block text-xs text-slate-500">
            {howLongAgo(booking.age_seconds)}
          </span>
        </p>

        <button
          type="button"
          onClick={close}
          aria-label="Hide booking notifications"
          className="flex h-7 w-7 flex-none items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
            <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
