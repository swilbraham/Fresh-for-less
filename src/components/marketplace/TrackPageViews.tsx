"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Reports a Meta Pixel PageView on every client-side route change.
 *
 * The pixel snippet in the layout only runs on a full page load, so App
 * Router navigations — including landing on the booking confirmation —
 * were invisible to Meta. The very first load is skipped here because the
 * snippet itself already reports it; everything after is ours.
 */
export default function TrackPageViews() {
  const pathname = usePathname();
  const firstLoad = useRef(true);

  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    if (typeof window.fbq === "function") {
      window.fbq("track", "PageView");
    }
  }, [pathname]);

  return null;
}
