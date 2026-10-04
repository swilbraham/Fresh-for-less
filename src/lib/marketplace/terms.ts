/**
 * Commission terms, stated in one place so the booking page, the cleaner's
 * dashboard, the offer card and the invoice page can never contradict each
 * other. Vague payment terms are what arguments are made of.
 *
 * Settled per job rather than per week. The cleaner is paid in full by the
 * customer on the day, so the money is already in their hands before any
 * commission is asked for — which is why a week of credit was never needed,
 * and why a week of unbilled jobs was a balance that grew before anybody
 * acted on it.
 */

export const COMMISSION_TERMS_SHORT =
  "Commission is invoiced the evening you finish, payable within 48 hours.";

export const COMMISSION_TERMS_LONG = [
  "You collect the full job price from the customer on the day.",
  "Every evening at 8pm we total the commission on whatever you completed",
  "that day and send you a payment link by text and email.",
  "It is payable within 48 hours of the clean being completed.",
  "Nothing is due on jobs that were cancelled or that you never took.",
].join(" ");

/**
 * The consequence, in the same words everywhere it appears. A sanction a
 * cleaner can honestly say they never saw is not a sanction.
 */
export const COMMISSION_ENFORCEMENT =
  "Commission unpaid 48 hours after the clean suspends your account, and you stop being offered work until it is settled.";

/** The hours a cleaner has to settle, from completion. Stated once. */
export const COMMISSION_DUE_HOURS = 48;

/** When tonight's run goes out, for a dashboard line or an invoice page. */
export function formatCommissionRun(from: Date = new Date()): string {
  return from.getHours() >= 20 ? "tomorrow at 8pm" : "tonight at 8pm";
}

/** When a job completed now has to be paid by. */
export function commissionDueBy(completedAt: Date = new Date()): Date {
  const due = new Date(completedAt);
  due.setHours(due.getHours() + COMMISSION_DUE_HOURS);
  return due;
}

export function formatCommissionDueBy(completedAt: Date = new Date()): string {
  return commissionDueBy(completedAt).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/**
 * The deadline printed on an invoice. The run goes out at 8pm on the evening
 * the job was completed, so the 48 hours are counted from that evening — not
 * from a credit period stored in settings, which is how an invoice ended up
 * promising a week while the terms promised two days.
 */
export function invoiceDueBy(issuedDay: string): Date {
  return commissionDueBy(new Date(`${issuedDay}T20:00:00`));
}

export function formatInvoiceDueBy(issuedDay: string): string {
  return invoiceDueBy(issuedDay).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
