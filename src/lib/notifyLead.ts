// Fire a fire-and-forget SMS notification to the business owner on every quote
// submission, via the Answered247 relay (which owns the Twilio credentials).
// Silent on any failure — must never block the primary form submit path.
const NOTIFY_URL = "https://answered247.co.uk/api/notify-lead";

export function notifyLead(page: string, formData: FormData): void {
  try {
    const fields: Record<string, string> = {};
    formData.forEach((value, key) => {
      if (typeof value === "string") fields[key] = value;
    });
    void fetch(NOTIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page,
        url: typeof window !== "undefined" ? window.location.href : "",
        fields,
      }),
      keepalive: true,
    }).catch(() => {
      // Silent — never block form submission
    });
  } catch {
    // Silent
  }
}
