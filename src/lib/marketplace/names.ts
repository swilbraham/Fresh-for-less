/**
 * Customers book Fresh For Less, not the individual's business. Telling them
 * "Roberts Carpet Care will clean your carpets" undercuts the brand they chose
 * and reads like the job has been handed to a stranger — so customer-facing
 * messages use the cleaner's first name only. The trading name still belongs
 * on admin screens and the cleaner's own pages.
 */
export function firstName(fullName: string, fallback = "your cleaner"): string {
  const first = String(fullName ?? "").trim().split(/\s+/)[0];
  return first || fallback;
}
