export type CleanerStatus = "pending" | "approved" | "suspended" | "rejected";
export type JobStatus =
  | "provisional"
  | "offered"
  | "accepted"
  | "completed"
  | "cancelled"
  | "unfilled";
export type SlotWindow = "am" | "pm";

export type Settings = {
  commission_pct: string | number;
  minimum_charge_pence: number;
  min_notice_days: number;
  booking_email: string;
  cancellation_notice_hours: number;
  protection_pct: string | number;
  protection_enabled: boolean;
  payee_name: string;
  payee_account: string;
  payee_sort_code: string;
  payee_address: string;
  payment_terms_days: number;
  legal_footer: string;
  admin_mobile: string;
  admin_sms_enabled: boolean;
};

export type PriceItem = {
  code: string;
  label: string;
  hint: string;
  kind: string;
  unit_price_pence: number;
  max_qty: number;
  sort: number;
  active: boolean;
};

export type PriceBundle = {
  id: number;
  item_code: string;
  qty: number;
  price_pence: number;
  label: string;
  applies_to: string;
  active: boolean;
};

export type QuoteLine = {
  code: string;
  label: string;
  qty: number;
  amount_pence: number;
  note: string;
};

export type Quote = {
  lines: QuoteLine[];
  subtotal_pence: number;
  minimum_applied: boolean;
  total_pence: number;
  commission_pct: number;
  commission_pence: number;
  savings_pence: number;
  /** Stain guard, when the customer opts in. */
  protection_pence: number;
  cleaning_pence: number;
};

export type Cleaner = {
  id: number;
  name: string;
  business_name: string;
  email: string;
  phone: string;
  status: CleanerStatus;
  insurance_provider: string;
  insurance_expiry: string | null;
  years_experience: number;
  equipment: string;
  dbs_checked: boolean;
  vat_registered: boolean;
  vat_number: string;
  admin_notes: string;
  notify_sms: boolean;
  /** Set while the cleaner is paused: no offers, no texts. */
  paused_at: string | null;
  notify_email: boolean;
  created_at: string;
  reviewed_at: string | null;
};

export type Job = {
  id: number;
  ref: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address_line: string;
  town: string;
  postcode: string;
  outward: string;
  slot_date: string;
  slot_window: SlotWindow;
  items: QuoteLine[];
  notes: string;
  parking: string;
  subtotal_pence: number;
  total_pence: number;
  /** List price before a price agreed on the phone replaced it; 0 if none. */
  list_total_pence: number;
  commission_pct: string | number;
  commission_pence: number;
  commission_on_net: boolean;
  status: JobStatus;
  cleaner_id: number | null;
  created_at: string;
  accepted_at: string | null;
  completed_at: string | null;
  cancelled_by: string;
  late_cancellation: boolean;
  rescheduled_count: number;
  /** True when the evening run completed this rather than the cleaner. */
  completion_assumed: boolean;
  /** '' until the customer is asked; then 'yes' or 'no'. */
  customer_confirmed: string;
  /** Set when the cleaner says the job never happened. */
  cleaner_disputed_at: string | null;
  cleaner_dispute_reason: string;
  /** Hours until the slot opens; negative once it has passed. */
  hours_until_slot: string | number;
  /** The site that sent this customer, '' when they came here directly. */
  source: string;
  /** Taken off the list price by a discount code; 0 for most jobs. */
  discount_pence: number;
};

/** A priced basket, whether or not it turned into a booking. */
export type QuoteRecord = {
  id: number;
  session_key: string;
  postcode: string;
  outward: string;
  covered: boolean;
  items: QuoteLine[];
  subtotal_pence: number;
  total_pence: number;
  source: string;
  /** The job reference, once this quote became a booking. */
  booked_ref: string;
  /** Set on quotes the office built and sent as a link. */
  token: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  expires_at: string | null;
  /** An agreed price that overrides the list total; 0 when there isn't one. */
  override_pence: number;
  /** A chase-up discount texted to this quote; 0 when none has been sent. */
  offer_pct: number;
  offer_sent_at: string | null;
  created_at: string;
  updated_at: string;
};
