// Fire a fire-and-forget SMS notification to the business owner on every quote
// submission, via the Answered247 relay (which owns the Twilio credentials).
// Silent on any failure — must never block the primary form submit path.
//
// Uses navigator.sendBeacon() with a text/plain payload so the request is a
// "simple" CORS request (no OPTIONS preflight), survives page navigation and
// keeps working under Safari ITP, incognito modes, and stricter privacy
// settings that were blocking the previous fetch()+application/json approach.
const NOTIFY_URL = "https://answered247.co.uk/api/notify-lead";

export function notifyLead(page: string, formData: FormData): void {
  try {
    const fields: Record<string, string> = {};
    formData.forEach((value, key) => {
      if (typeof value === "string") fields[key] = value;
    });
    const payload = JSON.stringify({
      page,
      url: typeof window !== "undefined" ? window.location.href : "",
      fields,
    });
    const body = new Blob([payload], { type: "text/plain;charset=UTF-8" });
    let sent = false;
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      try {
        sent = navigator.sendBeacon(NOTIFY_URL, body);
      } catch {
        // ignore — fall through to fetch
      }
    }
    if (!sent) {
      void fetch(NOTIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: payload,
        keepalive: true,
        mode: "no-cors",
      }).catch(() => {
        // Silent — never block form submission
      });
    }
  } catch {
    // Silent
  }
}
