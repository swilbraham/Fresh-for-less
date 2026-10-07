"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The offer somebody gets on their way out, not on their way in.
 *
 * A phone gives no "closing the tab" signal at all, so this watches for the
 * things it does give: the back button (caught with a pushed history entry),
 * the tab being hidden — switching apps, locking the screen, opening a rival's
 * site — with the offer waiting when they come back, and a stretch of stillness
 * with a price on screen. On a desktop the mouse heading for the browser chrome
 * is still the cleanest signal of all.
 *
 * Shown once per visit. A modal that reappears is an argument, not an offer.
 */
export default function ExitOffer({
  sessionKey,
  armed,
  onAccept,
}: {
  sessionKey: string;
  /** Only arm once there is a price worth leaving. */
  armed: boolean;
  onAccept: (offer: { code: string; pct: number; expiresAt: string }) => void;
}) {
  const [offer, setOffer] = useState<{
    code: string;
    pct: number;
    expiresAt: string;
  } | null>(null);
  const [open, setOpen] = useState(false);
  const shown = useRef(false);
  /** True once the tab has been hidden, so returning counts as coming back. */
  const left = useRef(false);

  useEffect(() => {
    if (!armed) return;

    let idle: ReturnType<typeof setTimeout> | null = null;

    async function reveal() {
      if (shown.current) return;
      shown.current = true;
      try {
        const response = await fetch("/api/marketplace/discount", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionKey }),
        });
        const data = await response.json();
        if (!data.ok) return;
        setOffer({ code: data.code, pct: data.pct, expiresAt: data.expiresAt });
        setOpen(true);
      } catch {
        // An offer that failed to load is not worth an error message.
      }
    }

    function onMouseOut(event: MouseEvent) {
      if (event.relatedTarget === null && event.clientY <= 0) void reveal();
    }

    function onPopState() {
      void reveal();
      // Put the entry back so the next Back press leaves properly: trapping
      // somebody on a page is how you get reported, not booked.
      history.pushState(null, "", location.href);
    }

    /**
     * They left the tab. Nothing can be shown while it is hidden, so the offer
     * is fetched now and displayed the moment they come back — which is also
     * the honest moment for it, since they went to think about it or to look
     * at somebody else's prices.
     */
    function onVisibility() {
      if (document.visibilityState === "visible" && left.current) {
        void reveal();
        return;
      }
      if (document.visibilityState === "hidden") left.current = true;
    }

    function resetIdle() {
      if (idle) clearTimeout(idle);
      // Short enough to catch a phone put down mid-decision. Scrolling counts
      // as activity, so this only fires on genuine stillness.
      idle = setTimeout(() => void reveal(), 30_000);
    }

    document.addEventListener("mouseout", onMouseOut);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onVisibility);
    window.addEventListener("popstate", onPopState);
    ["scroll", "click", "keydown", "touchstart", "touchmove"].forEach((event) =>
      window.addEventListener(event, resetIdle, { passive: true })
    );
    history.pushState(null, "", location.href);
    resetIdle();

    return () => {
      document.removeEventListener("mouseout", onMouseOut);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onVisibility);
      window.removeEventListener("popstate", onPopState);
      ["scroll", "click", "keydown", "touchstart", "touchmove"].forEach((event) =>
        window.removeEventListener(event, resetIdle)
      );
      if (idle) clearTimeout(idle);
    };
  }, [armed, sessionKey]);

  if (!open || !offer) return null;

  const until = new Date(offer.expiresAt).toLocaleString("en-GB", {
    weekday: "long",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-offer-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 id="exit-offer-title" className="text-2xl font-bold text-slate-900">
          Not ready to book yet?
        </h2>
        <p className="mt-2 text-slate-600">
          Here&apos;s {offer.pct}% off if you book within 24 hours. Use this code
          at the last step — nothing to pay until the job is done.
        </p>

        <p className="mt-5 rounded-xl border-2 border-dashed border-accent-300 bg-accent-50 py-4 text-center text-2xl font-bold tracking-widest text-accent-800">
          {offer.code}
        </p>
        <p className="mt-2 text-center text-sm text-slate-500">
          Valid until {until}
        </p>

        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              onAccept(offer);
              setOpen(false);
            }}
            className="rounded-xl bg-accent-600 px-5 py-3 font-semibold text-white transition hover:bg-accent-700"
          >
            Use it now — carry on booking
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-xl px-5 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700"
          >
            No thanks
          </button>
        </div>
      </div>
    </div>
  );
}
