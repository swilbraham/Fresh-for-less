"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Keeps the offers list live without a manual reload.
 *
 * Jobs are first-to-accept, so a stale dashboard costs the cleaner work. This
 * re-fetches the server component on an interval, but only while the tab is
 * actually visible — a phone in a pocket shouldn't poll — and immediately when
 * they come back to it.
 */
export default function AutoRefresh({ seconds = 30 }: { seconds?: number }) {
  const router = useRouter();
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState !== "visible") return;
      router.refresh();
      setRefreshedAt(new Date());
    };

    const timer = setInterval(refresh, seconds * 1000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router, seconds]);

  return (
    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-500" />
      </span>
      Checking for new jobs automatically
      {refreshedAt && (
        <span suppressHydrationWarning>
          {" "}
          · last checked{" "}
          {refreshedAt.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      )}
    </p>
  );
}
