# Bulk-import campaign files

Pre-built CSVs that let you skip 90% of the click-by-click campaign creation in Google Ads and Facebook Ads Manager. **Total time to launch from this folder: ~10 minutes per platform**, vs ~45–60 min building by hand.

> **Important:** all rows are set to **PAUSED** status. You can review every setting after import, then enable when you're ready. No risk of accidentally going live with the wrong settings.

---

## 🟦 Google Ads — `google/` folder

10 CSV files, one per entity type. You import them via the **free Google Ads Editor** desktop app — Google's bulk-edit tool.

### Step 1 — Install Google Ads Editor

Download from [ads.google.com/intl/en_uk/home/tools/ads-editor/](https://ads.google.com/intl/en_uk/home/tools/ads-editor/) (Mac & Windows). Sign in with the same Google account that owns your Ads account.

### Step 2 — Import the files in this order

In Google Ads Editor: **Account → Import → From File** (or `Ctrl/Cmd + Shift + I`)

Import the CSVs **in numbered order** — each one builds on the last:

| # | File | What it creates |
|---|---|---|
| 01 | `01_campaigns.csv` | Campaign shell: budget, schedule, bidding strategy |
| 02 | `02_campaign-locations.csv` | 10 geo targets (Wirral, Liverpool, Chester, etc.) |
| 03 | `03_adgroups.csv` | 5 ad groups, each with default max CPC of £1.50 |
| 04 | `04_keywords.csv` | 50 keywords across the 5 ad groups, with match types |
| 05 | `05_negative-keywords.csv` | 41 campaign-level negatives (saves ~30% of spend on garbage clicks) |
| 06 | `06_responsive-search-ads.csv` | 1 RSA per ad group, 15 headlines + 4 descriptions, with the right pins |
| 07 | `07_sitelinks.csv` | 6 sitelink extensions |
| 08 | `08_callouts.csv` | 10 callout extensions |
| 09 | `09_structured-snippets.csv` | 2 structured snippets (services + service catalog) |
| 10 | `10_call-extensions.csv` | Call extension wired to 0330 043 4811 |

After each import, review the changes in Editor's pending-changes panel. Editor flags any errors *before* you commit them to your live account.

### Step 3 — Push to live account

Click **Post** (top-right) → review the dialog → **Post**. Editor uploads everything to your Google Ads account. The campaign is created in **Paused** state.

### Step 4 — Final live-account-only steps

These few things can't be done via CSV — do them in the web UI at [ads.google.com](https://ads.google.com) after import:

1. **Conversion tracking** — Tools → Conversions → New → website → "Submit lead form" → £99 value. (Send me the conversion ID + label and I'll wire the gtag snippet into `/4for99/`.)
2. **Link Google Business Profile** — Tools → Linked accounts → Business Profile → connect.
3. **Promotion extension** — UI doesn't accept promotion extensions via CSV; takes 60 seconds to add manually (£61 off, GBP, expires next Sunday).
4. **Audience signals (observation)** — add `In-market: Cleaning Services` and `Affinity: Home Decor Enthusiasts` as observation-only audiences.

### Step 5 — Enable the campaign

Once you've reviewed everything in the UI, flip the campaign status from **Paused → Enabled** and you're live.

---

## 🟪 Facebook Ads Manager — `facebook/` folder

One file: `fb-bulk-import.csv` containing the campaign shell, 4 ad sets, and 7 ads.

### Step 1 — Open Ads Manager bulk editor

Go to [business.facebook.com/adsmanager](https://business.facebook.com/adsmanager) → top toolbar → **⋯ More tools** → **Bulk import**.

### Step 2 — Upload `fb-bulk-import.csv`

Click **Upload CSV** → pick `facebook/fb-bulk-import.csv` → **Continue**.

Facebook will validate the file and show any errors in a side panel. Common ones to fix:

- **"Page ID required"** — Facebook needs your Page's numeric ID. Find it at [facebook.com/your-page/about](https://facebook.com/) under "Page transparency" → Page ID. Paste it into the **Page ID** column for every ad row, save, re-upload.
- **"Image not found"** — Facebook can't read local file paths. After upload, click each ad → manually attach the matching image file from `ads-creative/`. Filenames in the CSV match the files in `ads-creative/` so it's clear which goes where.
- **"Custom audience not found"** — first time only. Create the `WEB - Submitted Lead 180d` audience in [Audiences](https://www.facebook.com/adsmanager/audiences) before re-uploading.

### Step 3 — Attach images per ad

Facebook's bulk uploader doesn't take image files — only references. So for each of the 7 ads:

1. Click the ad in the bulk-import preview.
2. Under **Media**, click **Add media** → **Upload images**.
3. Pick the matching files from `/Users/simonwilbrahan/Fresh For Less Carpet/ads-creative/`:
   - **Feed (1:1)** — pick the `_1x1.png` for that variant
   - **Instagram feed (4:5)** — pick the `_4x5.png`
   - **Stories/Reels (9:16)** — pick the `_9x16.png`
4. Click **Save**.

### Step 4 — Review & publish

Bulk edit defaults everything to **Paused**. Review the campaign tree → flip **Active** when you're ready.

---

## ⚠️ What can't be automated (you'll do these once, manually)

| Task | Where | ~Time |
|---|---|---|
| **Set up Meta Pixel custom conversions** (Lead, ViewContent) | Events Manager | 5 min — already partly done |
| **Set up Aggregated Event Measurement priorities** (Lead = #1) | Events Manager → AEM | 2 min — has a 24–72h cooldown |
| **Set up Google Ads conversion action** | Tools → Conversions | 5 min — gives you ID/label so I can wire the gtag |
| **Connect Google Business Profile** to Google Ads | Tools → Linked accounts | 1 min |
| **Connect Instagram account** to your Facebook Page | Page Settings | 2 min |
| **Verify `freshforlesscarpetcleaning.co.uk`** in Meta Brand Safety | (already done ✓) | – |

---

## 🔁 To regenerate these CSVs

If you change the offer (price, copy, locations, etc.) and want to rebuild the import bundles, run:

```bash
python3 /tmp/build-google-csv.py    # rebuilds google/*.csv
python3 /tmp/build-fb-csv.py        # rebuilds facebook/fb-bulk-import.csv
```

Both scripts are checked into the repo at `ads-import/build-*.py` *(commit `[next]`)* — open them, edit the values, re-run. No external dependencies beyond Python 3 standard library.

---

## 🚀 What this saves you

| Action | Manual time | With imports | Saved |
|---|---|---|---|
| Build Google campaign | ~50 min | ~10 min | ~40 min |
| Build Facebook campaign | ~35 min | ~10 min | ~25 min |
| Per-ad image upload (FB) | n/a | ~5 min | – |
| **Total** | ~85 min | **~25 min** | **~60 min** |

Plus: every value comes pre-checked. No typos, no missing UTMs, no forgotten negative keywords.
