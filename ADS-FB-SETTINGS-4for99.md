# Facebook Ad Settings — `/4for99` Campaign

Copy-paste-ready values for every field in Meta Ads Manager. Work through this top-to-bottom and you'll have the campaign live in ~30 minutes.

> **Heads-up:** Meta's UI changes constantly. If a field name in your screen differs from the one below, look for the field with the closest meaning — the value should still apply.

---

## ⚙️ One-time setup (do these once, before the campaign)

### A. Custom Audiences to create

In **Audiences → Create Audience → Custom Audience**:

| Audience name | Source | Definition |
|---|---|---|
| `WEB — All visitors 30d` | Website | People who visited any page on freshforlesscarpetcleaning.co.uk in the past 30 days |
| `WEB — Viewed /4for99 30d` | Website | URL contains `/4for99` in the past 30 days |
| `WEB — Submitted Lead 180d` | Website | `Lead` event in past 180 days |
| `WEB — Started form 30d` *(optional)* | Website | URL contains `/4for99` AND time on page > 60 seconds |

### B. Lookalike (create after you have 50+ Leads — usually week 2–3)

| Audience name | Source | Definition |
|---|---|---|
| `LAL 1% — Leads UK` | Lookalike | 1% of `WEB — Submitted Lead 180d`, location: United Kingdom |

### C. Custom Conversion (do this in Events Manager → Custom Conversions → Create)

| Field | Value |
|---|---|
| Source | Your pixel (`613073519035884`) |
| Conversion event | `Lead` |
| Rule | URL contains `freshforlesscarpetcleaning.co.uk/4for99` |
| Name | `Lead — 4for99` |
| Category | Lead |
| Optimisation value | `99.00 GBP` |

### D. Aggregated Event Measurement priorities

Events Manager → your pixel → **Aggregated Event Measurement → Configure Web Events**, pick `freshforlesscarpetcleaning.co.uk`:

| Priority | Event | Value optimisation |
|---|---|---|
| 1 | `Lead` | ON, value = 99 GBP |
| 2 | `ViewContent` | OFF |
| 3 | `PageView` | OFF |

---

## 🟦 Campaign settings

| Field | Value |
|---|---|
| **Campaign name** | `4for99 - Leads - 2026-05` |
| **Buying type** | `Auction` |
| **Objective** | `Leads` |
| **Special ad categories** | None *(skip — none apply)* |
| **A/B test** | OFF |
| **Advantage Campaign Budget (CBO)** | OFF *(control at ad set level for the first 14 days)* |
| **Campaign spending limit** | `£500` total cap *(safety net)* |

---

## 🟨 Ad set 1 — Cold, local broad

| Field | Value |
|---|---|
| **Ad set name** | `01 - Cold - Local broad` |
| **Conversion location** | `Website` |
| **Performance goal** | `Maximise number of conversions` |
| **Pixel** | `Fresh For Less` *(ID `613073519035884`)* |
| **Conversion event** | `Lead` |
| **Cost per result goal** | Leave blank for first 7 days |
| **Daily budget** | `£7` |
| **Schedule — Start** | Tomorrow at 06:00 |
| **Schedule — End** | No end date |
| **Locations** | "*People living in this location*" → drop pins on each: |
| | • Wirral, England — radius **+25 km** |
| | • Liverpool, England — radius **+15 km** |
| | • Chester, England — radius **+20 km** |
| | • Ellesmere Port, England — radius **+10 km** |
| **Age** | `30 – 65+` |
| **Gender** | `All` |
| **Detailed targeting** | *Leave blank — broad* |
| **Languages** | `English (UK)` |
| **Custom audience exclusion** | `WEB — Submitted Lead 180d` |
| **Placements** | `Advantage+ placements` (default — leave on) |

---

## 🟨 Ad set 2 — Cold, interest-stacked

Same as Ad set 1, *except*:

| Field | Value |
|---|---|
| **Ad set name** | `02 - Cold - Interests` |
| **Daily budget** | `£7` |
| **Detailed targeting — Interests (any of)** | `Mrs Hinch`, `Cleaning`, `Home improvement`, `Pinterest`, `Dunelm`, `IKEA`, `B&M Bargains`, `Pet ownership`, `Dog`, `Cat` |
| **Detailed targeting — Behaviours (any of)** | `Parents (with young children)`, `Engaged shoppers` |
| **Advantage detailed targeting** | `ON` *(let Meta expand if it finds cheaper conversions)* |
| **Custom audience exclusion** | `WEB — Submitted Lead 180d` |

---

## 🟨 Ad set 3 — Retargeting

| Field | Value |
|---|---|
| **Ad set name** | `03 - Retargeting - Visited 30d` |
| **Conversion location** | `Website` |
| **Performance goal** | `Maximise number of conversions` |
| **Pixel** | Fresh For Less |
| **Conversion event** | `Lead` |
| **Daily budget** | `£4` |
| **Schedule — Start** | Tomorrow at 06:00 |
| **Schedule — End** | No end date |
| **Locations** | Same as Ad set 1 |
| **Age** | `30 – 65+` |
| **Gender** | `All` |
| **Custom audience — Include** | `WEB — Viewed /4for99 30d`, `WEB — All visitors 30d` |
| **Custom audience — Exclude** | `WEB — Submitted Lead 180d` |
| **Placements** | Advantage+ placements |

---

## 🟨 Ad set 4 — Click-to-WhatsApp *(optional but recommended)*

| Field | Value |
|---|---|
| **Ad set name** | `04 - WhatsApp - Cold` |
| **Conversion location** | `Messaging apps` |
| **Messaging apps** | `WhatsApp` only |
| **WhatsApp number** | `+44 7479 921066` |
| **Performance goal** | `Maximise number of conversations` |
| **Daily budget** | `£5` |
| **Locations** | Same as Ad set 1 |
| **Age** | `30 – 65+` |
| **Detailed targeting** | Same interests as Ad set 2 |
| **Placements** | Advantage+ |

---

## 🟦 The 4 ads (run all 4 inside Ad sets 1 & 2; only Variant D in Ad set 3; only Variant E in Ad set 4)

### Common ad-level settings (apply to every ad)

| Field | Value |
|---|---|
| **Identity — Facebook Page** | Fresh For Less Carpet Cleaning |
| **Identity — Instagram account** | Connect if available, else use Page-only |
| **Format** | `Single image or video` |
| **Multi-advertiser ads** | `OFF` |
| **Advantage+ creative** | `OFF` *(we want to control crops manually)* |
| **Languages** | English (UK) |

---

### 📷 Ad A — `Hero £99`

| Field | Value |
|---|---|
| **Ad name** | `A - Hero card - £99` |
| **Image (1:1 — Feed)** | Upload `ads-creative/4for99_A_hero_1x1.png` |
| **Image (4:5 — IG Feed)** | Click *Edit per placement* → upload `ads-creative/4for99_A_hero_4x5.png` for Instagram Feed |
| **Image (9:16 — Stories)** | Upload `ads-creative/4for99_A_hero_9x16.png` for Stories/Reels |
| **Primary text** | *(paste below)* |
| **Headline** | `4 Carpets Cleaned for £99` |
| **Description** | `Was £160 · Save 38% this week` |
| **Call-to-action button** | `Book Now` |
| **Website URL** | `https://www.freshforlesscarpetcleaning.co.uk/4for99/?utm_source=facebook&utm_medium=cpc&utm_campaign=4for99&utm_content=A_hero` |
| **Display link** | `freshforlesscarpetcleaning.co.uk` |

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

---

### 📋 Ad B — `Offer Stack`

| Field | Value |
|---|---|
| **Ad name** | `B - Offer stack - what you get` |
| **Image 1:1** | `ads-creative/4for99_B_offer_1x1.png` |
| **Image 4:5** | `ads-creative/4for99_B_offer_4x5.png` |
| **Image 9:16** | `ads-creative/4for99_B_offer_9x16.png` |
| **Primary text** | *(paste below)* |
| **Headline** | `£99 — Was £160 (Save 38%)` |
| **Description** | `4 carpets, no hidden fees` |
| **Call-to-action button** | `Book Now` |
| **Website URL** | `https://www.freshforlesscarpetcleaning.co.uk/4for99/?utm_source=facebook&utm_medium=cpc&utm_campaign=4for99&utm_content=B_offer` |

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

---

### ⭐ Ad C — `Reviews`

| Field | Value |
|---|---|
| **Ad name** | `C - Review - red wine` |
| **Image 1:1** | `ads-creative/4for99_C_reviews_1x1.png` |
| **Image 4:5** | `ads-creative/4for99_C_reviews_4x5.png` |
| **Image 9:16** | `ads-creative/4for99_C_reviews_9x16.png` |
| **Primary text** | *(paste below)* |
| **Headline** | `4.9★ Carpet Clean — Just £99` |
| **Description** | `2,400+ happy local families` |
| **Call-to-action button** | `Book Now` |
| **Website URL** | `https://www.freshforlesscarpetcleaning.co.uk/4for99/?utm_source=facebook&utm_medium=cpc&utm_campaign=4for99&utm_content=C_reviews` |

**Primary text:**
```
"Absolutely gobsmacked at the difference. Our living room carpet looked brand new — even the red wine stain from Christmas is gone!"
— Sarah T., Wirral ★★★★★

We've deep-cleaned 2,400+ carpets across Merseyside & Cheshire, and right now 4 of yours can be next — for £99 (normally £160).

Hot-water extraction, deodorising, stain pre-treatment, and a 2–4hr dry time so you're not living in a damp house all weekend.

If you're not thrilled, we come back and re-clean for free. Simple as that.

Tap to grab one of this week's slots.
```

---

### ⏰ Ad D — `Urgency` *(use in Ad set 3 — Retargeting)*

| Field | Value |
|---|---|
| **Ad name** | `D - Urgency - last 7 slots` |
| **Image 1:1** | `ads-creative/4for99_D_urgency_1x1.png` |
| **Image 4:5** | `ads-creative/4for99_D_urgency_4x5.png` |
| **Image 9:16** | `ads-creative/4for99_D_urgency_9x16.png` |
| **Primary text** | *(paste below)* |
| **Headline** | `Last few £99 slots left` |
| **Description** | `Lock in before price goes back up` |
| **Call-to-action button** | `Book Now` |
| **Website URL** | `https://www.freshforlesscarpetcleaning.co.uk/4for99/?utm_source=facebook&utm_medium=cpc&utm_campaign=4for99&utm_content=D_urgency` |

**Primary text:**
```
Still thinking about it? 👀

Your 4-carpet £99 deal is still available — but only 7 slots left this week before we have to bump the price back to £160.

If you're going to do it, do it now. Takes 60 seconds.

📞 0330 043 4811 or tap below.
```

---

### 💬 Ad E — `WhatsApp` *(use in Ad set 4 — WhatsApp)*

| Field | Value |
|---|---|
| **Ad name** | `E - WhatsApp - cold` |
| **Image 1:1** | `ads-creative/4for99_A_hero_1x1.png` *(re-use the hero card)* |
| **Image 4:5** | `ads-creative/4for99_A_hero_4x5.png` |
| **Image 9:16** | `ads-creative/4for99_A_hero_9x16.png` |
| **Primary text** | *(paste below)* |
| **Headline** | `Message us on WhatsApp 💬` |
| **Description** | `4 carpets, £99 — booked in 5 mins` |
| **Call-to-action button** | `Send Message` |
| **WhatsApp number** | `+44 7479 921066` |
| **Pre-filled message** | `Hi! I saw your 4 carpets for £99 offer on Facebook. Could you let me know if you cover my area?` |

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

---

## 📊 Reporting columns to add in Ads Manager

Click **Columns → Customise Columns** and add these (in this order) so you see the right things at a glance:

1. Delivery
2. Amount spent
3. Impressions
4. Reach
5. Frequency *(red flag at >3.0)*
6. CPM (cost per 1,000 impressions)
7. Link clicks
8. CTR (link click-through rate) *(target ≥ 1.5%)*
9. CPC (cost per link click)
10. Results (Leads)
11. **Cost per result** *(your headline number — target £8–18)*
12. Conversion rate *(landing-page → Lead — target ≥ 4%)*

Save this as a custom preset called `4for99 — daily check`.

---

## 🚨 Rules to set up (Ads Manager → Automated rules)

### Rule 1 — Auto-pause expensive ads

| Field | Value |
|---|---|
| Apply to | All active ads in this campaign |
| Action | Turn off ad |
| Condition 1 | `Cost per result is greater than £35` |
| Condition 2 | `Impressions are greater than 1,000` |
| Time range | Last 3 days |
| Schedule | Continuously |
| Notification | Email me |

### Rule 2 — Auto-pause low-CTR ads

| Field | Value |
|---|---|
| Apply to | All active ads |
| Action | Turn off ad |
| Condition 1 | `CTR (link) is less than 1%` |
| Condition 2 | `Impressions are greater than 1,500` |
| Time range | Last 7 days |

### Rule 3 — Frequency cap warning

| Field | Value |
|---|---|
| Apply to | All active ads |
| Action | Send notification |
| Condition | `Frequency is greater than 3.5` |
| Time range | Last 7 days |

---

## 🗓️ Day-by-day playbook for the first 14 days

| Day | What to do |
|---|---|
| **Day 0** | Publish. Don't touch anything. |
| **Day 1–6** | **Don't touch anything.** Meta is in learning phase — it needs ~50 conversions to exit. Mid-flight edits reset the algorithm. Just check daily that nothing has been disapproved. |
| **Day 7** | First real review. Look at: (a) which ad has the lowest CPL, (b) which audience is delivering most leads. Pause the bottom 50% of ads in each ad set. |
| **Day 8–13** | Let winning ads breathe with full budget. Add 1 new creative variant if you have a fresh angle. |
| **Day 14** | Build the **1% Lookalike** of your `WEB — Submitted Lead 180d` audience (you should have 50+ leads by now). Launch as a new ad set at £10/day. |

---

## ✅ Pre-launch final checklist

Tick each before clicking **Publish All**:

- [ ] Pixel firing on /4for99/ (Pixel Helper shows PageView + ViewContent)
- [ ] Domain `freshforlesscarpetcleaning.co.uk` verified ✓ in Brand Safety
- [ ] Custom conversion `Lead — 4for99` created
- [ ] AEM priorities set (Lead = #1)
- [ ] All 4 custom audiences created
- [ ] Page connected to a phone you check (or WhatsApp Business linked)
- [ ] Lead notification email going to a phone-checked inbox (speed-to-lead = #1 conversion factor)
- [ ] Each ad has 3 image crops uploaded (1:1, 4:5, 9:16)
- [ ] Each URL has a unique `utm_content` parameter
- [ ] Campaign spend cap of £500 set
- [ ] Automated rules saved (auto-pause CPL > £35, CTR < 1%)
- [ ] Tested the form on /4for99/ end-to-end and confirmed the lead arrives in your inbox

---

*All settings reflect the Meta Ads Manager UI as of 2026-05. Field names may shift — match by meaning if a label has changed.*
