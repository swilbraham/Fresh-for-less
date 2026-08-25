"use client";

import { useEffect, useRef } from "react";
import { GOOGLE_ADS_BOOKING_TARGET } from "@/lib/analytics";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Reports a completed booking to the Meta Pixel and Google Ads.
 *
 * Without a conversion event the tags only ever see PageView, so both networks
 * can only optimise for clicks or landing-page views — which buys traffic that
 * never books. This is the signal the campaigns actually bid on.
 *
 * A confirmed booking and a provisional request are deliberately different
 * events: a request in an uncovered area is a lead, not a sale, and blending
 * them would teach the networks to chase areas that can't be serviced. Meta
 * gets both as separate events; Google is sent confirmed bookings only, since
 * there is a single conversion action to report against.
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

    if (typeof window.fbq === "function") {
      window.fbq("track", provisional ? "Lead" : "Schedule", {
        content_name: provisional ? "Provisional booking" : "Confirmed booking",
        value: valuePence / 100,
        currency: "GBP",
      });
    }

    /**
     * gtag.js loads afterInteractive, so on a fast confirmation render this
     * effect can beat it. Retry briefly rather than dropping the conversion.
     * transaction_id lets Google discard duplicates if it arrives twice.
     */
    let attempts = 0;
    const sendGoogle = () => {
      if (provisional) return true; // not a sale — don't report it
      if (typeof window.gtag !== "function") return false;
      window.gtag("event", "conversion", {
        send_to: GOOGLE_ADS_BOOKING_TARGET,
        value: valuePence / 100,
        currency: "GBP",
        transaction_id: reference,
      });
      return true;
    };

    let timer: ReturnType<typeof setTimeout>;
    const attempt = () => {
      if (sendGoogle() || ++attempts > 12) return;
      timer = setTimeout(attempt, 300);
    };
    attempt();

    sessionStorage.setItem(key, "1");
    fired.current = true;
    return () => clearTimeout(timer);
  }, [valuePence, provisional, reference]);

  return null;
}
