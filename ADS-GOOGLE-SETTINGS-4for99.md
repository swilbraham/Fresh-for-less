# Google Ads Campaign — `/4for99` Carpet Offer

Copy-paste-ready setup for **Google Search Ads** targeting Merseyside & Cheshire. Different mindset to Facebook: people searching Google have already decided they need carpet cleaning — your job is to win the click, not start the conversation.

> **Why Search before Performance Max:** Search gives you complete keyword visibility and control while you learn your CPC. Once you've got 30+ conversions, layer Performance Max on top of it for retargeting and YouTube reach.

---

## ⚙️ One-time setup

### A. Create a Google Ads account
1. Go to [ads.google.com](https://ads.google.com).
2. Skip "Smart Mode" — click **Switch to Expert Mode** at the bottom (the smart-mode wizard locks you out of half the controls below).
3. Skip the "Create your first campaign" prompt — click **Create an account without a campaign**.

### B. Link Google Business Profile
Tools → **Linked accounts** → Google Business Profile → connect `Fresh For Less Carpet Cleaning`. This unlocks the location extension and Google Maps placements. **Do this before you launch.**

### C. Set up conversion tracking

You need to tell Google Ads when a lead has converted. Two events to track:

| Event | Source | Type | Value |
|---|---|---|---|
| `Form Lead — 4for99` | Website (form submit) | Lead | £99 |
| `Phone Call — Click` | Call from ads | Phone calls | £99 |

#### Setting up the form-submit conversion
1. Tools → **Conversions → +New conversion action → Website**.
2. Enter `https://www.freshforlesscarpetcleaning.co.uk` → Scan.
3. Pick **Add a conversion action manually**.
4. Goal: **Submit lead form** | Name: `Form Lead — 4for99` | Value: Use one value `99 GBP` | Count: **One** | Window: 30 days click, 1 day view | Attribution: **Data-driven** (or **Last click** if you don't yet have enough data).
5. **Save and continue → Use Google Tag Manager** *(recommended)* OR **Install the tag yourself**.
6. Note the **Conversion ID** (`AW-XXXXXXXXX`) and **Conversion Label** (`abcdEfg123`).

> **I can wire this snippet into the page for you in the next step** — just tell me the IDs once Google gives them to you.

#### Setting up the phone-click conversion
- Same flow → goal **Phone calls** → "Calls from ads using call extensions" → 60-second min duration → £99 value.

---

## 🟦 Campaign settings

| Field | Value |
|---|---|
| **Campaign name** | `4for99 — Search — Merseyside & Cheshire` |
| **Goal** | `Leads` |
| **Campaign type** | `Search` |
| **Conversion goals** | Tick `Form Lead — 4for99` and `Phone Call — Click`. Untick everything else (esp. "page views"). |
| **Networks — Search Network** | ✅ ON |
| **Networks — Display Network** | ❌ OFF *(turn this off — Google enables it by default and it wastes budget on garbage placements)* |
| **Networks — Search partners** | ❌ OFF *(test later, not on day 1)* |
| **Locations — Target** | "*People in or regularly in your targeted locations*" *(the default "people in or interested in" sends you traffic from anywhere)* |
| **Locations — Add** | `Wirral, England`, `Liverpool, England`, `Birkenhead, England`, `Wallasey, England`, `Bebington, England`, `Heswall, England`, `Chester, England`, `Ellesmere Port, England`, `Bromborough, England`, `Neston, England` |
| **Languages** | `English` |
| **Audiences (observation)** | Add: `In-market: Cleaning Services`, `Affinity: Home Decor Enthusiasts`. **Mode = Observation** (not Targeting) — gather data, don't restrict reach. |
| **Budget** | `£15/day` *(start here; £20/day if you have monthly Google search volume in the area)* |
| **Bid strategy** | **Maximise clicks**, max CPC bid = `£2.50` *(for the first 2 weeks)* |
| **Ad rotation** | `Optimise: prefer best-performing ads` |
| **Ad schedule** | `Mon–Sun 06:00 – 21:00` *(no point burning budget at 03:00)* |
| **Final URL suffix (campaign-level)** | `utm_source=google&utm_medium=cpc&utm_campaign=4for99` |

---

## 🟨 Ad groups & keywords

Run **5 ad groups**, each tightly themed. Tight themes = high quality scores = lower CPC.

> **Match type notation:**
> - `keyword` = broad match
> - `"keyword"` = phrase match
> - `[keyword]` = exact match
>
> Paste these into Google Ads as-is — it'll respect the punctuation.

### Ad Group 1 — Local intent (HIGH PRIORITY — biggest budget share)

**Final URL:** `https://www.freshforlesscarpetcleaning.co.uk/4for99/?utm_content=local`

**Keywords (paste this block):**
```
[carpet cleaning wirral]
"carpet cleaning wirral"
[carpet cleaner wirral]
"carpet cleaner wirral"
[carpet cleaning liverpool]
"carpet cleaning liverpool"
[carpet cleaning chester]
"carpet cleaning chester"
[carpet cleaning birkenhead]
"carpet cleaning birkenhead"
[carpet cleaning bebington]
[carpet cleaning heswall]
[carpet cleaning ellesmere port]
[carpet cleaning wallasey]
"carpet cleaning near me"
[carpet cleaning near me]
"professional carpet cleaning near me"
"local carpet cleaner"
```

### Ad Group 2 — Pricing / deal intent

**Final URL:** `https://www.freshforlesscarpetcleaning.co.uk/4for99/?utm_content=price`

```
"cheap carpet cleaning"
"affordable carpet cleaning"
"carpet cleaning prices"
"carpet cleaning offer"
"carpet cleaning offers"
"carpet cleaning deal"
"carpet cleaning deals"
"best price carpet cleaning"
"carpet cleaning quote"
"4 carpets cleaned"
"3 rooms carpet cleaning"
```

### Ad Group 3 — Pain / specific stains

**Final URL:** `https://www.freshforlesscarpetcleaning.co.uk/4for99/?utm_content=stains`

```
"remove pet stains carpet"
"remove cat urine carpet"
"remove dog urine carpet"
"remove red wine carpet"
"remove coffee stain carpet"
"smelly carpet cleaning"
"pet odour carpet"
"stain removal carpet"
"carpet stain removal near me"
```

### Ad Group 4 — Service / method modifiers

**Final URL:** `https://www.freshforlesscarpetcleaning.co.uk/4for99/?utm_content=service`

```
"carpet steam cleaning"
"deep carpet clean"
"professional carpet clean"
"hot water extraction carpet"
"carpet shampooing service"
"carpet cleaning service"
"carpet cleaning company"
```

### Ad Group 5 — End of tenancy / move out

**Final URL:** `https://www.freshforlesscarpetcleaning.co.uk/4for99/?utm_content=eot`

```
"end of tenancy carpet cleaning"
"end of tenancy carpet clean"
"moving out carpet cleaning"
"carpet cleaning before moving"
"landlord carpet cleaning"
```

---

## 🚫 Campaign-level negative keywords (CRITICAL — adds ~30% margin)

Add these as a **shared negative keyword list** (Tools → Negative keyword lists → Create) and apply to the whole campaign.

```
machine
hire
rental
rent
diy
bissell
vax
rug doctor
karcher
shark
amazon
argos
homebase
screwfix
b&q
wickes
how to
youtube
video
videos
training
course
courses
career
careers
salary
jobs
job
vacancy
vacancies
wholesaler
supplier
suppliers
upholstery cleaning machine
free
solution
solutions homemade
recipe
homemade
powder
spray
foam
review machines
best machine
best carpet cleaner uk -wirral -liverpool -chester
```

> **Why these matter:** without negatives, "carpet cleaner" matches anyone searching for a Bissell to buy at Argos. You pay £2 a click for someone who'll never hire you.

---

## 📝 Responsive Search Ad — paste into all 5 ad groups

Google's RSAs let you supply up to 15 headlines and 4 descriptions; Google mixes them. Pin the offer to position 1 so it always shows first.

### Headlines (15 — paste each on a new row, max 30 chars)

| # | Headline | Pin |
|---|---|---|
| 1 | `4 Carpets Cleaned for £99` | **Pin to position 1** |
| 2 | `Was £160 — Now Just £99` | **Pin to position 1** |
| 3 | `Save 38% This Week Only` | Pin to position 1 |
| 4 | `Wirral's Top-Rated Cleaners` | Pin to position 2 |
| 5 | `Hot-Water Extraction Clean` | Pin to position 2 |
| 6 | `Dries in Just 2–4 Hours` | Pin to position 2 |
| 7 | `100% Satisfaction Guarantee` | – |
| 8 | `2,400+ Happy Local Families` | – |
| 9 | `Book Online in 60 Seconds` | – |
| 10 | `Stains & Odours Removed` | – |
| 11 | `Pet & Kid-Safe Products` | – |
| 12 | `Free Re-clean If Not Happy` | – |
| 13 | `Fully Insured Local Team` | – |
| 14 | `Same-Week Slots Available` | – |
| 15 | `Call 0330 043 4811` | – |

### Descriptions (4 — max 90 chars each)

```
Professional carpet cleaning across Wirral, Liverpool & Chester. Just £99 for 4 carpets.
Hot-water extraction, dries 2–4 hours. Stains, odours & allergens lifted. Book today.
Was £160 — now £99. Limited slots this week. 4.9★ from 2,400+ local families.
Not happy? We come back and re-clean for free. No hidden fees. Tap to book online.
```

### Path fields (display URL extension)

| Field | Value |
|---|---|
| Path 1 | `4-carpets` |
| Path 2 | `99-pounds` |

So the displayed URL becomes `freshforlesscarpetcleaning.co.uk/4-carpets/99-pounds` — even though the real link is `/4for99/`.

---

## 📎 Ad extensions (assets) — set up at campaign level

Extensions are free clicks. Set up *all* of these — campaigns with full extensions get ~15% lower CPC because their Ad Rank is higher.

### Sitelinks (add 6, Google shows up to 4)

| Title (max 25 chars) | Description 1 (max 35) | Description 2 (max 35) | URL |
|---|---|---|---|
| `Book the £99 Offer` | `4 carpets cleaned, save £61` | `Limited slots this week` | `/4for99/?utm_content=sitelink_offer` |
| `Get a Free Quote` | `60-second quote form` | `Reply within 2 hours` | `/?utm_content=sitelink_quote` |
| `Pet Stain Removal` | `Cat urine, dog mess, paw prints` | `Specialist deodorising` | `/services/pet-stains/?utm_content=sitelink_pets` |
| `Customer Reviews` | `4.9★ from 2,400+ families` | `Read real Wirral reviews` | `/reviews/?utm_content=sitelink_reviews` |
| `Service Areas` | `Wirral · Liverpool · Chester` | `Same-week availability` | `/areas/?utm_content=sitelink_areas` |
| `WhatsApp Us` | `Booked in 5 minutes` | `Tap to message direct` | `https://wa.me/447479921066` |

### Callout extensions (10 — short proof points)

```
Was £160 — Now £99
Free Re-clean Guarantee
Dries in 2–4 Hours
Hot-Water Extraction
Pet & Kid Safe Products
Fully Insured
Same-Week Booking
4.9★ 2,400+ Reviews
No Hidden Fees
Local Wirral Team
```

### Structured snippets

| Header | Values |
|---|---|
| `Services` | Carpet Cleaning, Stain Removal, Pet Odour Treatment, Deodorising, Stain Protection |
| `Service catalog` | 4-Carpet Offer, Stairs & Landing, Upholstery Cleaning, Rugs, End of Tenancy |

### Call extension

| Field | Value |
|---|---|
| Phone number | `0330 043 4811` |
| Country | UK |
| Conversions | Tick "Count calls as conversions" → 60s minimum |

### Location extension

Connect Google Business Profile (one click, see step B above).

### Promotion extension

| Field | Value |
|---|---|
| Occasion | None *(or "Special offer")* |
| Promotion type | Monetary discount |
| Currency | GBP |
| Discount | `£61 off` *(or 38%)* |
| Minimum order | None |
| Item | `4 carpets professionally cleaned` |
| Promotion code | None *(unless you want to issue one)* |
| Final URL | `https://www.freshforlesscarpetcleaning.co.uk/4for99/?utm_content=promo` |

---

## 💰 Budget & bidding playbook

| Phase | Days | Daily | Bid strategy | Why |
|---|---|---|---|---|
| **Learning** | Day 0–14 | `£15` | `Maximise clicks`, max CPC `£2.50` | Build a base of impressions and clicks. Maximise Conversions can't work without conversion data yet. |
| **Optimising** | Day 15–30 | `£20` | `Maximise clicks`, lower max CPC to `£2.00` once average CPC stabilises | Trim wasted clicks. |
| **Scaling** | Day 31+ | `£25–40` | Switch to `Target CPA = £25` once you have **30+ conversions** | Google's algorithm now has enough data to bid smart. |

**What "good" looks like for a UK local carpet-cleaning Search campaign:**

| Metric | Bad | OK | Good |
|---|---|---|---|
| **Avg CPC** | >£2.50 | £1.50–£2.00 | **£0.80–£1.20** |
| **CTR** | <4% | 4–7% | **>8%** |
| **Quality Score** | 1–4 | 5–7 | **8–10** |
| **Conv rate** | <3% | 3–5% | **6%+** |
| **CPA (cost per Lead)** | >£40 | £18–£28 | **£10–£18** |

**Break-even maths reminder:**
- £99 offer, ~£25 cost → £74 gross margin
- Max sustainable CPA = £74 → kill anything over that

---

## 🛡️ Account-level protection rules

Tools → **Automated rules** → create:

### Rule 1 — Pause expensive keywords
- **Apply to:** All enabled keywords in this campaign
- **Action:** Pause keywords
- **Condition 1:** Cost > £30
- **Condition 2:** Conversions = 0
- **Time range:** Last 14 days
- **Frequency:** Daily

### Rule 2 — Pause search terms with zero conversions and high spend
- **Apply to:** Search terms (Tools → Search terms → Apply rule)
- **Action:** Add as negative keyword
- **Condition:** Cost > £15 AND Conversions = 0
- **Time range:** Last 30 days

---

## 🔌 Conversion-tracking snippets I'll add to the site

Once you give me the **Google Ads Conversion ID** (`AW-XXXXXXXXX`) and **Label** (`abcdEfg123`), I'll add this to `/4for99/index.html`:

### A — Global gtag.js (in `<head>`, near the existing FB pixel)
```html
<!-- Google Ads tag -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-XXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-XXXXXXXXX');
</script>
```

### B — Form-submit conversion (extend the existing `handleSubmit`)
```js
// Inside the existing .then(result => {...}) block, after fbq('track','Lead'):
if (typeof gtag === 'function') {
  gtag('event', 'conversion', {
    'send_to': 'AW-XXXXXXXXX/abcdEfg123',
    'value': 99.00,
    'currency': 'GBP',
    'transaction_id': ''
  });
}
```

Just tell me the IDs and I'll wire it in and push.

---

## ✅ Pre-launch checklist

- [ ] Google Ads account created in **Expert Mode** (not Smart Mode)
- [ ] Google Business Profile linked
- [ ] Conversion `Form Lead — 4for99` created (£99 value)
- [ ] Conversion `Phone Call — Click` created (£99 value)
- [ ] gtag.js + form-submit snippet installed on /4for99/ *(I do this once you have IDs)*
- [ ] Campaign set to **Search Network only** (Display & Search Partners OFF)
- [ ] Locations set to "*People in or regularly in*" — not the default
- [ ] All 5 ad groups have the keywords + RSA + sitelinks
- [ ] Negative keyword list applied at campaign level
- [ ] Daily budget set to £15
- [ ] Max CPC bid cap of £2.50 in place
- [ ] Ad schedule limits to 06:00–21:00
- [ ] Tested the form on /4for99/ end-to-end and confirmed the conversion fires in Google Ads (Conversions → Diagnostics)
- [ ] Phone `0330 043 4811` set up to track call duration (Google needs 60+ second calls)

---

## 🎯 What to do in week 1 vs week 4

| Week | Action |
|---|---|
| **1** | Don't change keywords or bids. Let it run. Check daily for: rejected ads, search terms that are clearly off-target → add as negatives. |
| **2** | Pause any keyword with > £15 spend and zero conversions. Add 5–10 more negative keywords from the search-terms report. |
| **3** | If you have 20+ conversions, build a **1st-party Customer Match list** of converters and add as audience targeting (observation) on the campaign. |
| **4** | Once at 30+ conversions, switch bidding from Maximise Clicks → **Target CPA £25**. Watch CPL drop by 20–40% over the next 14 days. |
| **5+** | Add a **Performance Max campaign** layered on top — uses YouTube, Discover, Gmail, Maps. Set its target CPA at £20. Use the same conversions and Customer Match list. |

---

## 🔗 Useful URLs

- Google Ads: [ads.google.com](https://ads.google.com)
- Conversion diagnostics: Tools → Conversions → click your conversion → "Diagnostics" tab
- Search terms report: Reports → Predefined → Search terms
- Auction insights: Campaigns → click campaign → Insights → Auction insights *(see who you're competing against)*

---

*All settings reflect the Google Ads UI as of 2026-05. The Maximise Clicks → Target CPA progression is the standard pro path for any small local services business — don't let Google nudge you into Target CPA on day 1, you'll burn budget on no data.*
