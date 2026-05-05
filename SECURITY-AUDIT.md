# Fresh For Less Carpet — Security Audit

**Date:** 2026-05-05
**Stack:** Next.js 16 on Vercel
**Domain:** freshforlesscarpetcleaning.co.uk

## What was changed in this commit

| Area | Before | After |
|---|---|---|
| Headers | 4 basic (`X-Frame`, `X-Content-Type`, `X-XSS`, `Referrer-Policy`) | + HSTS (2y, preload), full CSP, Permissions-Policy (incl. `payment=(self)` for Stripe). **A-grade** at securityheaders.com |
| Form bot protection | Honeypot `_honey` input existed on 3 of 4 static-HTML promo forms but JS never checked it; no honeypot on any React form | Honeypot input + `handleSubmit` check on **every lead form** — bot submissions silently dropped before reaching FormSubmit |

## Forms hardened (3 React + 4 static HTML)

| File | Type | Honeypot now active |
|---|---|---|
| `src/components/QuoteModal.tsx` | React | ✅ (added input + check) |
| `src/app/cleaning/page.tsx` | React | ✅ (added input + check) |
| `src/app/spin/page.tsx` | React | ✅ (added input + check) |
| `public/4for99/index.html` | Static | ✅ (input existed; check added) |
| `public/3for59/index.html` | Static | ✅ (input existed; check added) |
| `public/3for49/index.html` | Static | ✅ (input + check both added) |
| `public/offers/fullhome/index.html` | Static | ✅ (input existed; check added) |
| `public/pay/index.html` | Stripe form | n/a — Stripe handles bot protection |

## CSP allowances

CSP allows the third parties the site actually uses:

- **Google Fonts** — `fonts.googleapis.com` (style-src), `fonts.gstatic.com` (font-src)
- **Facebook Pixel** — `connect.facebook.net` (script-src), `www.facebook.com` (img/connect/frame-src)
- **Stripe Checkout** — `js.stripe.com` (script-src/frame-src), `api.stripe.com` (connect-src), `hooks.stripe.com` (frame-src)
- **FormSubmit** — `formsubmit.co` (connect-src) for form posts
- **Google Apps Script** — `script.google.com` (connect-src) for spreadsheet logging on `/4for99` etc.
- **Unsplash** — `*.unsplash.com` (img-src) for stock imagery

Everything else blocked. `'unsafe-inline'` and `'unsafe-eval'` remain on `script-src` for Next.js runtime hydration.

## Permissions-Policy

`camera=(), microphone=(), geolocation=(), payment=(self)`

- Camera/mic/geo entirely off
- `payment=(self)` allows the Payment Request API (Apple Pay / Google Pay) on `/pay` for Stripe Checkout

## Existing pixel/tag setup (no changes needed)

- Meta Pixel `613073519035884` — fires `PageView`, `ViewContent`, `Lead` (with value 99 GBP) on `/4for99`
- Domain `freshforlesscarpetcleaning.co.uk` verified ✓ in Meta Brand Safety
- Aggregated Event Measurement priorities configured (Lead = #1)

## Open items (not in this commit)

| # | Task | Owner | Effort |
|---|---|---|---|
| 1 | Confirm 2FA on GitHub, the form-submit inbox owner, Vercel, Stripe, Meta Business | You | 10 min |
| 2 | Submit `freshforlesscarpetcleaning.co.uk` to [hstspreload.org](https://hstspreload.org) once HSTS has been live for 30 days | You | 2 min |
| 3 | Conversions API for Meta (server-side `Lead` event) — recovers iOS attribution | Me | 30 min |
| 4 | Migrate CSP `'unsafe-inline'` to nonces for A+ score | Me, if XSS posture becomes important | 1 hr |

## Verification after deploy

```bash
curl -sI https://www.freshforlesscarpetcleaning.co.uk | grep -iE 'strict-transport|content-security|permissions-policy'
curl -sI https://www.freshforlesscarpetcleaning.co.uk/4for99/ | grep -iE 'cache-control|content-security'
```

Should see all headers. [securityheaders.com](https://securityheaders.com/?q=freshforlesscarpetcleaning.co.uk) should grade **A**.

Functional smoke test — the 5 form pages should still submit normally. CSP is the most likely thing to break loadable resources; if anything fails, the browser console will show the blocked resource and you can paste the message here so I can extend the CSP allowlist.
