# Fresh For Less Carpet Cleaning — Website

## Project Overview
Marketing website for **Fresh For Less Carpet Cleaning**, a local carpet and upholstery cleaning business. The site targets women aged 26-65+, families, and commercial customers. The primary conversion goal is getting users to request a free quote.

## Tech Stack
- **Framework:** Next.js 16 (App Router, server-rendered on Vercel)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (using `@theme` directive, `@tailwindcss/postcss`)
- **Animations:** Framer Motion
- **Font:** Inter (via `next/font/google`)

## Project Structure
```
src/
├── app/
│   ├── globals.css          # Tailwind imports, @theme color tokens, base styles
│   ├── layout.tsx           # Root layout with metadata and font setup
│   └── page.tsx             # Main page — assembles all sections
└── components/
    ├── AnimatedSection.tsx   # Reusable scroll-triggered animation wrapper
    ├── Navbar.tsx            # Fixed navbar with scroll-aware styling + mobile menu
    ├── Footer.tsx            # Site footer with links and contact info
    ├── QuoteModal.tsx        # Quote request form modal (primary CTA)
    └── sections/
        ├── Hero.tsx          # Hero with headline, CTAs, trust metrics
        ├── PainPoints.tsx    # Problem/pain agitation section
        ├── Benefits.tsx      # Solution/benefits grid
        ├── Process.tsx       # 4-step "How It Works" with timeline
        ├── Testimonials.tsx  # Social proof — grid (desktop) + carousel (mobile)
        ├── About.tsx         # Credibility section with dashboard-style stats
        └── FinalCTA.tsx      # Bottom CTA section
```

## Commands
```bash
npm run dev      # Start development server
npm run build    # Production build (static export to /out)
npm run start    # Serve production build
npm run lint     # Run ESLint
```

**Note:** Node.js is installed at `C:\Users\User\AppData\Local\nodejs\node-v22.14.0-win-x64`. It must be on PATH before running commands. Use the PowerShell pattern:
```powershell
$nodePath = 'C:\Users\User\AppData\Local\nodejs\node-v22.14.0-win-x64'
$env:Path = "$nodePath;$env:Path"
```

## Design System
- **Color tokens** defined in `globals.css` via `@theme` — `primary` (blue), `accent` (green), `slate` (neutral)
- **Design direction:** Clean modern interface with systematic grids, geometric typography, frosted glass effects, layered components with depth, precise alignment
- **All icons** are inline SVGs from Heroicons (outline style, 24px)
- **Animations** use Framer Motion — `AnimatedSection` component for scroll-triggered reveals, `motion` for hero animations and floating orbs

## Key Patterns
- All section components are client components (`"use client"`) because they use Framer Motion
- The `QuoteModal` is controlled by `page.tsx` state and passed via `onQuoteClick` props
- The Navbar uses a transparent-to-frosted-glass transition on scroll
- Server-rendered on Vercel (there is no `output: "export"`) — API routes and server actions work
- Testimonials section uses a grid on desktop and a carousel with AnimatePresence on mobile

## Business Details (placeholder)
- **Phone:** (555) 123-4567
- **Email:** info@freshforless.com
- **Hours:** Mon-Sat 7am-7pm
- These are placeholder values and should be replaced with real business info.


## Marketplace (/book, /pro, /admin)

A UK-wide carpet-cleaning marketplace lives alongside the marketing site. Customers
get an instant fixed price, vetted independent cleaners register coverage and
availability, jobs are broadcast to everyone who covers the postcode, and the
first cleaner to accept keeps the job.

### Money model
With deposits on (STRIPE_SECRET_KEY set, the default in production): the
customer pays the platform's commission as a **card deposit at booking**
(Stripe Checkout). The booking is held as `pending_payment` and nothing is
broadcast or sent until Stripe confirms; the cleaner then collects the balance
on the day and keeps all of it — no commission invoice is ever raised for a
deposit-paid job. Deposits are auto-refunded in full when the customer cancels
with more than `settings.cancellation_notice_hours` notice (default 24) — a
late customer cancellation keeps the fee (stated at checkout, on Stripe's
payment page and on the manage page; rescheduling is always free), and admin
cancellations always refund. Provisional (no-coverage) bookings and
phone/admin bookings never take a deposit — those keep the old model: the
cleaner collects the full price and commission is invoiced weekly.

`BOOKING_DEPOSIT=off` reverts the whole site to the old model without a code
change. `src/lib/marketplace/stripe.ts` holds all Stripe calls; activation is
idempotent (`activatePaidBooking`) and driven by the success redirect with the
Stripe webhook (`/api/stripe/webhook`, needs `STRIPE_WEBHOOK_SECRET`) as the
backstop for customers who pay and close the tab.

### Routes
| Route | Who | Purpose |
| --- | --- | --- |
| `/book` | Customer | Postcode check → basket → instant fixed price → date/slot → confirm |
| `/book/confirmed/[ref]` | Customer | Booking receipt and allocation status |
| `/booking/[ref]?t=…` | Customer | Manage a booking — reschedule or cancel, no account needed |
| `/pro` | Cleaner | Pitch + sign in |
| `/pro/register` | Cleaner | Apply, with vetting details, coverage and availability |
| `/pro/dashboard` | Cleaner | Live offers, accept/pass, diary, mark complete |
| `/pro/coverage` | Cleaner | Postcode areas, working week, days off |
| `/pro/invoices` | Cleaner | Commission accrued and invoiced |
| `/admin` | Admin | Overview + notification log |
| `/admin/prices` | Admin | National price list, bundle offers, commission rate, minimum charge |
| `/admin/cleaners` | Admin | Vetting — approve / suspend / reject |
| `/admin/jobs` | Admin | All jobs, cancel, re-broadcast unfilled |
| `/admin/invoices` | Admin | Raise and settle commission invoices |

### Code layout
```
src/lib/marketplace/
├── db.ts        # Neon in production, PGlite locally; one Postgres dialect either way
├── schema.ts    # Idempotent DDL + default national price list (runs on cold start)
├── repo.ts      # All queries: matching, broadcast, allocation, invoicing, notifications
├── pricing.ts   # Instant-price engine (exact DP over bundle offers) — shared by server and browser
├── auth.ts      # scrypt passwords, HMAC-signed session cookies, admin gate
├── postcode.ts  # UK postcode parsing; coverage matches on the outward code
├── money.ts     # Integer pence in, formatted GBP out
└── types.ts
```

### Rules worth knowing
- **All money is integer pence.** Never floats.
- **Prices are recomputed server-side at booking.** The browser figure is display only.
- **Allocation race is settled by one conditional UPDATE** in `acceptJob` — a second
  cleaner's accept updates zero rows and is told the job has gone.
- **Commission rate is snapshotted onto each job** at booking, so changing the national
  rate never rewrites historical jobs.
- **A completed job can only be billed once** — enforced by a unique index on
  `commission_invoice_lines.job_id`, so re-running invoicing is safe.
- **Customer address and phone are withheld** from broadcast offers until a cleaner accepts.
- Only slots with a genuinely free covering cleaner are offered to customers.

### Environment variables
| Variable | Needed | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Production (required) | Neon Postgres connection string. Without it, local dev falls back to PGlite in `.data/`. |
| `MARKETPLACE_SECRET` | Production (required) | Long random string; signs session cookies. |
| `ADMIN_PASSWORD` | Production (required) | Gates `/admin`. Dev falls back to `admin`. |
| `MARKETPLACE_BASE_URL` | Recommended | Public origin used to build the link inside job-offer texts. |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_FROM_NUMBER` | Strongly recommended | Delivers job-offer texts. All three must be set. |
| `RESEND_API_KEY` | Optional | Delivers notification emails. |
| `MARKETPLACE_FROM_EMAIL` | Optional | From address, required alongside `RESEND_API_KEY`. |
| `META_VERIFY_TOKEN` / `META_APP_SECRET` / `META_PAGE_ACCESS_TOKEN` | Optional | Facebook/Instagram DMs become leads via `/api/meta/webhook`. Setup steps in `META-DM-LEADS-SETUP.md`. |
| `ANTHROPIC_API_KEY` | Optional | One-line AI summary of each DM lead on `/admin/leads` (`summarise.ts`) and quote-request auto-replies (`social-reply.ts`), both Claude Opus 5. Without it, leads just show the full messages and no auto-reply is sent. |
| `META_AUTO_REPLY` | Optional | Set to `off` to stop the automatic quote reply to Facebook/Instagram DMs without disabling anything else. |
| `META_ALLOWED_PAGES` | Optional | Comma-separated page ids the webhook handles (unset = all connected pages). Currently the Fresh For Less page only. |
| `STRIPE_SECRET_KEY` | Production | Enables booking deposits (customer pays commission by card at booking). Unset = old pay-on-the-day model. |
| `STRIPE_WEBHOOK_SECRET` | Recommended | Signs `/api/stripe/webhook` (Stripe dashboard → Webhooks → `checkout.session.completed`). Without it, only the success redirect activates paid bookings. |
| `BOOKING_DEPOSIT` | Optional | Set to `off` to disable deposits without removing the Stripe key. |

With no provider configured a message is still written to the `notifications`
table and shown in the admin log as "logged only", so nothing is silently lost —
but the cleaner never hears about it.

### Notifications
Job offers go to the email address and mobile number the cleaner gave at
registration, over both channels, subject to the per-cleaner `notify_sms` /
`notify_email` flags they control at `/pro/coverage`.

SMS is the channel that matters: allocation is first-to-accept, so delivery speed
decides who gets the work. Texts are deliberately short and front-loaded to be
readable in a lock-screen preview. Numbers are normalised to E.164 by
`phone.ts`; a non-mobile number is skipped rather than failed.

The cleaner dashboard also self-refreshes every 30 seconds while the tab is
visible (`AutoRefresh.tsx`), so an open dashboard never shows a stale offer list.

### Customer self-service
Customers manage their booking through a signed link, not an account — they book
once, so a password would be friction for no security gain. The link is sent in
the booking-received email and text and shown on the confirmation page.

- The token is an HMAC over the reference with a `booking:` purpose prefix
  (`bookingToken` in `auth.ts`), scoped to exactly one booking.
- A missing, wrong, or unknown reference all return an identical 404 — the page
  never reveals whether a reference exists.
- Server actions re-verify the token on every post. A rendered page is not
  authorisation.

**Reschedule** keeps the assigned cleaner whenever they're free at the new slot;
otherwise the job is released, removed from their diary, and re-broadcast. Both
the old and new cleaner are told which happened. `rescheduled_count` tracks moves.

**Cancellation** is always allowed — refusing it online just moves the call to the
office. Anything inside `settings.cancellation_notice_hours` (admin-set, default
24) is flagged `late_cancellation` and the cleaner's message says so. `cancelled_by`
records whether it was the customer or admin. Both flags surface in `/admin/jobs`.

Hours-until-slot is computed in Postgres as `AT TIME ZONE 'Europe/London'`, so
BST/GMT is handled correctly rather than drifting by an hour in summer.

### Local development
`npm run dev` creates `.data/marketplace` and runs an embedded Postgres (PGlite) —
no external database needed. Delete `.data/` to reset to a clean marketplace.
PGlite is loaded via `createRequire` in `db.ts` rather than a bundled import,
because Next's compiler otherwise resolves its browser build.
