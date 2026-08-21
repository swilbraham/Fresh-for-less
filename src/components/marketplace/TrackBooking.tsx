"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Reports a completed booking to the Meta Pixel.
 *
 * Without a conversion event the pixel only ever sees PageView, so Meta can
 * only optimise for clicks or landing-page views — which buys traffic that
 * never books. This is the signal the campaign actually bids on.
 *
 * A confirmed booking and a provisional request are deliberately different
 * events: a request in an uncovered area is a lead, not a sale, and blending
 * them would teach Meta to chase areas that can't be serviced.
 */
export default function TrackBooking({
  valuePence,
  provisional,
  reference,
}: {
  valuePence: number;
  provisional: boolean;
  reference: string;
}) {
  const fired = useRef(false);

  useEffect(() => {
    // Refreshing the confirmation page must not report a second booking.
    if (fired.current) return;
    const key = `ffl-tracked-${reference}`;
    if (sessionStorage.getItem(key)) return;
    if (typeof window.fbq !== "function") return;

    window.fbq("track", provisional ? "Lead" : "Schedule", {
      content_name: provisional ? "Provisional booking" : "Confirmed booking",
      value: valuePence / 100,
      currency: "GBP",
    });

    sessionStorage.setItem(key, "1");
    fired.current = true;
  }, [valuePence, provisional, reference]);

  return null;
}
