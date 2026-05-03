# Facebook / Instagram Ads — Fresh For Less Carpet Cleaning

**Offer:** 4 Carpets Professionally Cleaned for £99 (was £160, save 38%)
**Landing page:** https://www.freshforlesscarpetcleaning.co.uk/4for99/
**Phone:** 0330 043 4811
**Service area:** Merseyside & Cheshire
**Pixel event firing:** `Lead` with `value: 99, currency: GBP` (already wired on the page)

---

## 1. Campaign structure (Ads Manager)

| Level | Setting | Value |
|---|---|---|
| Campaign | Objective | **Leads** (Sales objective with Lead event optimization works equally well) |
| Campaign | Buying type | Auction |
| Campaign | Budget | £15–25/day to start (CBO off — control at ad-set level while you find a winner) |
| Ad set | Conversion location | Website |
| Ad set | Performance goal | Maximise number of conversions → **Lead** |
| Ad set | Pixel | Existing Fresh For Less pixel (`613073519035884`) |
| Ad set | Conversion window | 7-day click, 1-day view |
| Ad set | Placements | Advantage+ placements (let Meta optimise) |

Run **3 ad sets in parallel** so the algorithm can compare audiences:

1. **Cold — Local broad** (no interest stack — let the algo work)
2. **Cold — Pet & family interests** (interest-stacked control)
3. **Retargeting** (anyone who visited freshforlesscarpetcleaning.co.uk in last 30 days)

---

## 2. Audience targeting

### Ad set 1 — Cold, local broad
- **Location:** "People living in this location" → drop pins on Wirral, Liverpool, Birkenhead, Wallasey, Bebington, Heswall, Hoylake, West Kirby, Chester, Ellesmere Port, Bromborough, Neston, Helsby. **20 km radius** around each centre, or a single 25 km radius around CH41.
- **Age:** 30–65+
- **Gender:** All (Meta will lean female on its own once the pixel learns)
- **Detailed targeting:** *None* — broad
- **Languages:** English (UK)
- **Estimated reach:** ~450k–700k

### Ad set 2 — Cold, interest-stacked
Same geo + age, plus **Detailed targeting** (any of):
- Mrs Hinch
- Cleaning
- Home improvement
- Pinterest (interest)
- Dunelm / IKEA / The Range / B&M (engaged shoppers)
- Pets (dog owners, cat owners)
- Parents (with children 03–12 years)

Toggle **Advantage detailed targeting: ON** so Meta can expand if it finds cheaper conversions.

### Ad set 3 — Retargeting
- **Custom audience:** Website visitors past 30 days, *excluding* anyone who already submitted the form (build a "Form completed" custom audience from the Lead event).
- **Daily budget:** £3–5 is plenty — small audience.
- Run a stronger urgency creative here (see Variant D below).

### After 14 days — add a 4th ad set
- **1% Lookalike** of "Lead — last 180 days" custom audience (needs ~50+ leads first).

---

## 3. Ad copy — 4 tested variants

> **How to use:** Run all 4 in the same ad set (under one ad set, not 4 ad sets). Meta will distribute spend toward the best CTR/CPL within ~3 days. Kill anything below 1% CTR after 1,000 impressions.

### Variant A — "Kids & pets" pain hook *(usually the cheapest CPL for this audience)*

**Primary text:**
```
Kids, dogs and red wine? Your carpets have been through it. 🐾

We deep-clean 4 carpets — lounge, hallway, stairs, bedroom, you pick — for just £99 (normally £160).

✅ Hot-water extraction (the proper deep clean, not a wet hoover)
✅ Stains, pet smells & allergens lifted
✅ Dry in 2–4 hours, not days
✅ If you're not thrilled, we re-clean it FREE

Covering Wirral, Liverpool & Cheshire. 4.9★ from 2,400+ local families.

👇 Tap below to grab a slot — only 7 left this week.
```

**Headline (40 chars max):** `4 Carpets Cleaned for £99`
**Description (30 chars max):** `Was £160 · Save 38% this week`
**Call-to-action button:** `Book Now`
**Destination URL:** `https://www.freshforlesscarpetcleaning.co.uk/4for99/`

---

### Variant B — Price-led, no-fluff *(strongest for in-market buyers)*

**Primary text:**
```
4 carpets. Professionally cleaned. £99.

That's it. No hidden fees, no upsells at the door, no "from" prices that turn into £180 by the time the kit comes out the van.

What you get for your £99:
• 4 rooms / carpets — your choice
• Industrial hot-water extraction
• Pre-treatment of stains & high-traffic areas
• Deodorising treatment included
• Carpets dry in 2–4 hours
• 100% satisfaction guarantee

Was £160. Now £99. This price is only for bookings made this week.

📞 0330 043 4811 or tap Book Now.
```

**Headline:** `£99 — Was £160 (Save 38%)`
**Description:** `4 carpets, no hidden fees`
**CTA:** `Book Now`

---

### Variant C — Social proof / authority

**Primary text:**
```
"Absolutely gobsmacked at the difference. Our living room carpet looked brand new — even the red wine stain from Christmas is gone!"
— Sarah T., Wirral ★★★★★

We've deep-cleaned 2,400+ carpets across Merseyside & Cheshire, and right now 4 of yours can be next — for £99 (normally £160).

Hot-water extraction, deodorising, stain pre-treatment, and a 2–4hr dry time so you're not living in a damp house all weekend.

If you're not thrilled, we come back and re-clean for free. Simple as that.

Tap to grab one of this week's slots.
```

**Headline:** `4.9★ Carpet Clean — Just £99`
**Description:** `2,400+ happy local families`
**CTA:** `Book Now`

---

### Variant D — Urgency / retargeting *(use in retargeting ad set)*

**Primary text:**
```
Still thinking about it? 👀

Your 4-carpet £99 deal is still available — but only 7 slots left this week before we have to bump the price back to £160.

If you're going to do it, do it now. Takes 60 seconds.

📞 0330 043 4811 or tap below.
```

**Headline:** `Last few £99 slots left`
**Description:** `Lock in before price goes back up`
**CTA:** `Book Now`

---

### Variant E — Click-to-WhatsApp *(usually the cheapest CPL)*

> **Why this exists:** A subset of your audience won't fill in any web form, ever, but will happily ping a WhatsApp message. Click-to-WhatsApp ads typically come in 30–50% cheaper per lead than form-fill variants because the friction is lower. They're also easier to qualify and close — you're already in a 1:1 conversation. Run this in its own ad set so the conversion event and goal are different from the form variants.

**Special ad set setup (different from variants A–D):**
- **Campaign objective:** Engagement → **Messaging** (or under the Leads objective, choose "Messaging" as conversion location)
- **Messaging app:** **WhatsApp**
- **WhatsApp number:** `+44 7479 921066` (already used on the site)
- **Performance goal:** Maximise number of conversations
- **Pre-filled message:** *(see below)*
- **Same audience targeting** as your cold ad sets (geo + age + interests from §2)
- **Budget:** £5–8/day in its own ad set

**Primary text:**
```
Don't fancy filling in a form? 💬

Just message us on WhatsApp — tell us how many carpets, where you are, and we'll get you booked in for the £99 deal in under 5 minutes.

✅ 4 carpets professionally cleaned — £99 (was £160)
✅ Hot-water extraction · stains, pet smells & allergens out
✅ Dry in 2–4 hours
✅ 4.9★ from 2,400+ Wirral & Cheshire families

Tap "Send Message" below — we usually reply within minutes.
```

**Headline:** `Message us on WhatsApp 💬`
**Description:** `4 carpets, £99 — booked in 5 mins`
**Call-to-action button:** `Send Message`
**Destination:** WhatsApp (configured in the ad set, not via URL)

**Pre-filled message customers see when they tap the ad:**
```
Hi! I saw your 4 carpets for £99 offer on Facebook. Could you let me know if you cover my area?
```

This is pre-filled in the WhatsApp chat window so they only have to tap "send" — even lower friction than typing a question.

**Alternative copy variant (shorter, more punchy):**
```
4 carpets. £99. Want it? 🟢 Tap Send Message — sorted in 5 mins.
```

**How to track this in your CRM:**
Click-to-WhatsApp ads don't fire the website pixel (no website is involved). You'll need to:
1. Tag every lead that comes via WhatsApp with `source: facebook-whatsapp` in your CRM
2. Reconcile against Meta's "Conversations started" metric in Ads Manager
3. Or: set up the **WhatsApp Business API** + Meta Conversions API integration to fire a `Lead` event server-side when each new chat starts. This is the most accurate but takes ~1 hour to set up.

For week 1, just count manually — the volume should be low enough.

**Compliance note:** WhatsApp Business policy says you can't message anyone first who hasn't opted in. The pre-filled message means *they* message *you* first, so you're clean. Don't add anyone's number from these ads to a marketing list without explicit consent.

---

## 4. Creative direction

### Format priority
1. **Single-image** (cheapest to produce, easiest to test) — start here
2. **Carousel** (3–5 cards, before/after split) — phase 2
3. **Reels-format video** (9:16, 15s) — phase 3, highest organic-feel CPM

### Image concept 1 — Before/After split *(highest-performing creative across cleaning ads in this niche)*
- 1:1 (1080×1080) and 4:5 (1080×1350) crops
- Diagonal split — left "BEFORE" (visibly stained, slightly muted), right "AFTER" (rich colour, clean)
- **Top overlay (large, bold):** `4 CARPETS · £99`
- **Bottom-left badge:** `WAS £160 · SAVE 38%`
- **Bottom-right pill:** `Wirral · Liverpool · Cheshire`
- Logo top-right, small (don't fight the image)
- Keep text under 20% of the frame area — Meta still penalises text-heavy ads in the auction

### Image concept 2 — Family in a clean home
- Mum + dog on a freshly-cleaned carpet, soft natural light
- Headline overlay top-third: `4 carpets cleaned for £99`
- Sub-overlay: `Pet- and kid-safe products. Dry in 2 hours.`
- Use stock if needed (Unsplash: search "family living room dog") — but a real customer photo will outperform stock 2-3× on CTR

### Image concept 3 — The £99 hero card
- Brand-blue gradient background (matches the landing page hero — `#0f172a` → `#1e293b`)
- Giant `£99` in fresh-green (`#22c55e`) with a `£160` strikethrough next to it
- Subline: `4 Carpets · Professionally Cleaned · This Week Only`
- Trust strip at bottom: `★ 4.9 · Fully Insured · 2,400+ Local Families`

### Video concept — 15s Reel script
| Sec | Visual | Voiceover / Caption |
|---|---|---|
| 0–2 | Close-up on a stained carpet, kid's toy on it | **"Carpets been through it?"** |
| 2–5 | Cleaner walks in with extractor, smiles | **"We've got you."** |
| 5–9 | Time-lapse: dirty patch → clean patch | **"4 carpets, professionally deep-cleaned, just £99."** |
| 9–12 | Wide shot, mum + dog walking on dry, fresh carpet | **"Hot-water extraction. Dry in 2 hours. Stains, smells, gone."** |
| 12–15 | Card with logo, phone, URL, `BOOK NOW` button | **"4for99 — only 7 slots this week. Tap below."** |

Shoot vertical (9:16). Use natural sound + a punchy royalty-free track. Subtitles burnt in (85% of Reels watched on mute).

---

## 5. Budget & projected performance

| Stage | Daily | Weekly | Notes |
|---|---|---|---|
| Week 1 — Learning | £20 | £140 | 3 ad sets × ~£7/day. Don't switch anything off for 7 days — Meta needs ~50 conversions to exit the learning phase. |
| Week 2 — Scale winners | £30–40 | £210–280 | Kill bottom 50% of ads, double the budget on best ad set. |
| Week 3+ — Optimise | £50–75 | £350–525 | Add lookalike ad set once you have 50+ leads. |

### What "good" looks like for a UK local carpet-cleaning offer
- **CPM:** £8–15 (cold) / £18–28 (retargeting)
- **CTR (link):** 1.5–3% — anything under 1% kill it
- **CPL (Lead event):** **£8–18 is excellent**, £19–28 is healthy, £29+ needs creative review
- **Booked-job rate from Lead:** aim for 50%+ (depends on speed-to-call — call new leads within 5 minutes for best conversion)
- **Effective CPA per booked job:** £16–36 — comfortable on a £99 ticket with upsell room (extra carpet £20, stain protection £29, upholstery £39+)

### Break-even maths
- Offer price: £99
- Variable cost (your time, fuel, products): assume ~£25
- Gross margin per job: ~£74
- **Max sustainable CPA:** £74 → kill any ad set spending more than that to acquire one booked job
- With 50% lead-to-booking, that means **max sustainable CPL = £37**

---

## 6. Pixel & tracking checks

### Already set up ✅
- `PageView` on landing
- `Lead` event firing on form submit, `value: 99, currency: GBP`
- Pixel ID `613073519035884` confirmed in `/public/4for99/index.html` line 21

### Add before launch (recommended)
1. **`ViewContent`** event fired on page-load *of /4for99/* specifically — lets you build a "viewed offer but didn't convert" retargeting audience. Add this snippet just before the closing `</script>` of the existing pixel block:
   ```html
   fbq('track', 'ViewContent', {
     content_name: '4 for 99 Carpet Clean',
     content_category: 'Offer Page',
     value: 99.00,
     currency: 'GBP'
   });
   ```
2. **Conversions API (CAPI)** — iOS 17+ has gutted browser-side pixel reliability. Strongly recommend setting up CAPI via either Meta's free Conversions API Gateway or a Stape/Server-side GTM container. Expect 15–30% more attributed leads.
3. **UTM tags on every ad URL** so you can split-test in Google Analytics / sheet:
   - Ad A: `?utm_source=facebook&utm_medium=cpc&utm_campaign=4for99&utm_content=variant_a_pets`
   - Ad B: `?utm_source=facebook&utm_medium=cpc&utm_campaign=4for99&utm_content=variant_b_price`
   - Ad C: `?utm_source=facebook&utm_medium=cpc&utm_campaign=4for99&utm_content=variant_c_proof`
   - Retargeting: `?utm_source=facebook&utm_medium=cpc&utm_campaign=4for99&utm_content=retargeting_urgency`

---

## 7. Pre-launch checklist

- [ ] Pixel verified firing on /4for99/ (use Meta Pixel Helper Chrome extension)
- [ ] `Lead` event marked as a **Custom Conversion** in Events Manager (priority 1 in the 8-event slot)
- [ ] **Domain verified** for freshforlesscarpetcleaning.co.uk in Business Settings → Brand Safety → Domains
- [ ] Phone number `0330 043 4811` added to Page Info (so click-to-call extensions work)
- [ ] Page reviews/star rating turned ON on the Facebook Page
- [ ] WhatsApp Business connected to the Page (huge lift on lead response speed)
- [ ] Lead notification email goes to a phone-checked inbox — speed-to-lead is the #1 factor
- [ ] Negative-keyword equivalent: exclude `Job title: Carpet Cleaner` so you're not advertising to competitors
- [ ] Disclaimer line added if you collect health info? (You don't — fine to skip)

---

## 8. What to test next (after 2 weeks)

1. **Free quote** vs **fixed-£99** offer — does removing the price barrier increase top-of-funnel cheaper than it costs you in lower close rate?
2. **Photo of you/your van** vs polished branded creative — owner-led ads consistently outperform corporate ones for local services
3. **Messenger destination** instead of website — cuts the form friction, but harder to track in CRM
4. **Lead form (Instant Form)** instead of website — typically halves CPL but lead quality drops 20–30%, so test on a separate ad set
5. **"Stairs & landing only" £35** mini-offer as a tripwire for the people who can't stretch to £99

---

*Generated with the `/ads copy facebook` sub-skill. Pair this with `/ads creative 4for99` for a designer-ready brief, or `/ads testing 4for99` for a 4-week structured A/B plan.*
