#!/usr/bin/env python3
"""Generate Google Ads Editor CSV bundle for the /4for99 campaign."""
import csv
import os

OUT = "/Users/simonwilbrahan/Fresh For Less Carpet/ads-import/google"
os.makedirs(OUT, exist_ok=True)

CAMPAIGN = "4for99 - Search - Merseyside & Cheshire"
BASE_URL = "https://www.freshforlesscarpetcleaning.co.uk/4for99/"
UTM_BASE = "utm_source=google&utm_medium=cpc&utm_campaign=4for99"


def write(name, headers, rows):
    path = os.path.join(OUT, name)
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(headers)
        w.writerows(rows)
    print(f"✓ {name}  ({len(rows)} rows)")


# --- 1. Campaign ---
write("01_campaigns.csv",
      ["Action", "Campaign", "Campaign type", "Networks",
       "Budget", "Bid Strategy Type", "Bid Strategy max CPC",
       "Languages", "Status", "Campaign Final URL Suffix",
       "Ad Schedule"],
      [["Add", CAMPAIGN, "Search",
        "Google search",
        "15.00", "Maximize Clicks", "2.50",
        "English", "Paused",
        UTM_BASE,
        "Monday[06:00-21:00];Tuesday[06:00-21:00];Wednesday[06:00-21:00];"
        "Thursday[06:00-21:00];Friday[06:00-21:00];Saturday[06:00-21:00];"
        "Sunday[06:00-21:00]"]])


# --- 2. Locations (separate sheet for geo-targeting) ---
write("02_campaign-locations.csv",
      ["Action", "Campaign", "Location"],
      [
          ["Add", CAMPAIGN, "Wirral, England, United Kingdom"],
          ["Add", CAMPAIGN, "Liverpool, England, United Kingdom"],
          ["Add", CAMPAIGN, "Birkenhead, England, United Kingdom"],
          ["Add", CAMPAIGN, "Wallasey, England, United Kingdom"],
          ["Add", CAMPAIGN, "Bebington, England, United Kingdom"],
          ["Add", CAMPAIGN, "Heswall, England, United Kingdom"],
          ["Add", CAMPAIGN, "Chester, England, United Kingdom"],
          ["Add", CAMPAIGN, "Ellesmere Port, England, United Kingdom"],
          ["Add", CAMPAIGN, "Bromborough, England, United Kingdom"],
          ["Add", CAMPAIGN, "Neston, England, United Kingdom"],
      ])


# --- 3. Ad groups ---
ad_groups = [
    ("01-Local-intent", "local"),
    ("02-Pricing-deal", "price"),
    ("03-Pain-stains", "stains"),
    ("04-Service-method", "service"),
    ("05-End-of-tenancy", "eot"),
]
ag_rows = []
for name, _ in ad_groups:
    ag_rows.append(["Add", CAMPAIGN, name, "1.50", "Standard", "Enabled"])
write("03_adgroups.csv",
      ["Action", "Campaign", "Ad group", "Max CPC",
       "Ad rotation", "Status"],
      ag_rows)


# --- 4. Keywords per ad group ---
keywords_by_group = {
    "01-Local-intent": [
        ("[carpet cleaning wirral]", "Exact"),
        ("\"carpet cleaning wirral\"", "Phrase"),
        ("[carpet cleaner wirral]", "Exact"),
        ("\"carpet cleaner wirral\"", "Phrase"),
        ("[carpet cleaning liverpool]", "Exact"),
        ("\"carpet cleaning liverpool\"", "Phrase"),
        ("[carpet cleaning chester]", "Exact"),
        ("\"carpet cleaning chester\"", "Phrase"),
        ("[carpet cleaning birkenhead]", "Exact"),
        ("\"carpet cleaning birkenhead\"", "Phrase"),
        ("[carpet cleaning bebington]", "Exact"),
        ("[carpet cleaning heswall]", "Exact"),
        ("[carpet cleaning ellesmere port]", "Exact"),
        ("[carpet cleaning wallasey]", "Exact"),
        ("\"carpet cleaning near me\"", "Phrase"),
        ("[carpet cleaning near me]", "Exact"),
        ("\"professional carpet cleaning near me\"", "Phrase"),
        ("\"local carpet cleaner\"", "Phrase"),
    ],
    "02-Pricing-deal": [
        ("\"cheap carpet cleaning\"", "Phrase"),
        ("\"affordable carpet cleaning\"", "Phrase"),
        ("\"carpet cleaning prices\"", "Phrase"),
        ("\"carpet cleaning offer\"", "Phrase"),
        ("\"carpet cleaning offers\"", "Phrase"),
        ("\"carpet cleaning deal\"", "Phrase"),
        ("\"carpet cleaning deals\"", "Phrase"),
        ("\"best price carpet cleaning\"", "Phrase"),
        ("\"carpet cleaning quote\"", "Phrase"),
        ("\"4 carpets cleaned\"", "Phrase"),
        ("\"3 rooms carpet cleaning\"", "Phrase"),
    ],
    "03-Pain-stains": [
        ("\"remove pet stains carpet\"", "Phrase"),
        ("\"remove cat urine carpet\"", "Phrase"),
        ("\"remove dog urine carpet\"", "Phrase"),
        ("\"remove red wine carpet\"", "Phrase"),
        ("\"remove coffee stain carpet\"", "Phrase"),
        ("\"smelly carpet cleaning\"", "Phrase"),
        ("\"pet odour carpet\"", "Phrase"),
        ("\"stain removal carpet\"", "Phrase"),
        ("\"carpet stain removal near me\"", "Phrase"),
    ],
    "04-Service-method": [
        ("\"carpet steam cleaning\"", "Phrase"),
        ("\"deep carpet clean\"", "Phrase"),
        ("\"professional carpet clean\"", "Phrase"),
        ("\"hot water extraction carpet\"", "Phrase"),
        ("\"carpet shampooing service\"", "Phrase"),
        ("\"carpet cleaning service\"", "Phrase"),
        ("\"carpet cleaning company\"", "Phrase"),
    ],
    "05-End-of-tenancy": [
        ("\"end of tenancy carpet cleaning\"", "Phrase"),
        ("\"end of tenancy carpet clean\"", "Phrase"),
        ("\"moving out carpet cleaning\"", "Phrase"),
        ("\"carpet cleaning before moving\"", "Phrase"),
        ("\"landlord carpet cleaning\"", "Phrase"),
    ],
}
kw_rows = []
for ag, kws in keywords_by_group.items():
    suffix = next(s for n, s in ad_groups if n == ag)
    for kw, mt in kws:
        kw_rows.append([
            "Add", CAMPAIGN, ag, kw, mt, "Enabled",
            f"{BASE_URL}?{UTM_BASE}&utm_content={suffix}",
        ])
write("04_keywords.csv",
      ["Action", "Campaign", "Ad group", "Keyword",
       "Match type", "Status", "Final URL"],
      kw_rows)


# --- 5. Negative keywords (campaign-level) ---
negatives = [
    "machine", "hire", "rental", "rent", "diy",
    "bissell", "vax", "rug doctor", "karcher", "shark",
    "amazon", "argos", "homebase", "screwfix", "b&q", "wickes",
    "how to", "youtube", "video", "videos",
    "training", "course", "courses",
    "career", "careers", "salary", "jobs", "job",
    "vacancy", "vacancies",
    "wholesaler", "supplier", "suppliers",
    "free", "homemade", "recipe", "powder", "spray", "foam",
    "review machines", "best machine",
]
neg_rows = [["Add", CAMPAIGN, n, "Broad"] for n in negatives]
write("05_negative-keywords.csv",
      ["Action", "Campaign", "Keyword", "Match type"],
      neg_rows)


# --- 6. Responsive Search Ads ---
headlines = [
    ("4 Carpets Cleaned for £99", 1),
    ("Was £160 — Now Just £99", 1),
    ("Save 38% This Week Only", 1),
    ("Wirral's Top-Rated Cleaners", 2),
    ("Hot-Water Extraction Clean", 2),
    ("Dries in Just 2–4 Hours", 2),
    ("100% Satisfaction Guarantee", ""),
    ("2,400+ Happy Local Families", ""),
    ("Book Online in 60 Seconds", ""),
    ("Stains & Odours Removed", ""),
    ("Pet & Kid-Safe Products", ""),
    ("Free Re-clean If Not Happy", ""),
    ("Fully Insured Local Team", ""),
    ("Same-Week Slots Available", ""),
    ("Call 0330 043 4811", ""),
]
descriptions = [
    "Professional carpet cleaning across Wirral, Liverpool & Chester. Just £99 for 4 carpets.",
    "Hot-water extraction, dries 2–4 hours. Stains, odours & allergens lifted. Book today.",
    "Was £160 — now £99. Limited slots this week. 4.9★ from 2,400+ local families.",
    "Not happy? We come back and re-clean for free. No hidden fees. Tap to book online.",
]

# RSA columns in Editor: one row per ad group with all fields filled
rsa_headers = ["Action", "Campaign", "Ad group", "Ad type"]
for i in range(1, 16):
    rsa_headers += [f"Headline {i}", f"Headline {i} position"]
for i in range(1, 5):
    rsa_headers += [f"Description {i}", f"Description {i} position"]
rsa_headers += ["Path 1", "Path 2", "Final URL", "Status"]

rsa_rows = []
for ag, suffix in ad_groups:
    row = ["Add", CAMPAIGN, ag, "Responsive search ad"]
    for h, pos in headlines:
        row += [h, str(pos) if pos else ""]
    for d in descriptions:
        row += [d, ""]
    row += [
        "4-carpets", "99-pounds",
        f"{BASE_URL}?{UTM_BASE}&utm_content={suffix}",
        "Enabled",
    ]
    rsa_rows.append(row)
write("06_responsive-search-ads.csv", rsa_headers, rsa_rows)


# --- 7. Sitelink extensions ---
sitelinks = [
    ("Book the £99 Offer", "4 carpets cleaned, save £61",
     "Limited slots this week",
     f"{BASE_URL}?{UTM_BASE}&utm_content=sitelink_offer"),
    ("Get a Free Quote", "60-second quote form",
     "Reply within 2 hours",
     f"https://www.freshforlesscarpetcleaning.co.uk/?"
     f"{UTM_BASE}&utm_content=sitelink_quote"),
    ("Pet Stain Removal", "Cat urine, dog mess, paw prints",
     "Specialist deodorising",
     f"https://www.freshforlesscarpetcleaning.co.uk/?"
     f"{UTM_BASE}&utm_content=sitelink_pets"),
    ("Customer Reviews", "4.9★ from 2,400+ families",
     "Read real Wirral reviews",
     f"https://www.freshforlesscarpetcleaning.co.uk/?"
     f"{UTM_BASE}&utm_content=sitelink_reviews"),
    ("Service Areas", "Wirral · Liverpool · Chester",
     "Same-week availability",
     f"https://www.freshforlesscarpetcleaning.co.uk/?"
     f"{UTM_BASE}&utm_content=sitelink_areas"),
    ("WhatsApp Us", "Booked in 5 minutes",
     "Tap to message direct",
     "https://wa.me/447479921066"),
]
sl_rows = [["Add", CAMPAIGN, t, d1, d2, url]
           for t, d1, d2, url in sitelinks]
write("07_sitelinks.csv",
      ["Action", "Campaign", "Sitelink text",
       "Description 1", "Description 2", "Final URL"],
      sl_rows)


# --- 8. Callout extensions ---
callouts = [
    "Was £160 — Now £99",
    "Free Re-clean Guarantee",
    "Dries in 2–4 Hours",
    "Hot-Water Extraction",
    "Pet & Kid Safe Products",
    "Fully Insured",
    "Same-Week Booking",
    "4.9★ 2,400+ Reviews",
    "No Hidden Fees",
    "Local Wirral Team",
]
co_rows = [["Add", CAMPAIGN, c] for c in callouts]
write("08_callouts.csv",
      ["Action", "Campaign", "Callout text"],
      co_rows)


# --- 9. Structured snippets ---
ss_rows = [
    ["Add", CAMPAIGN, "Services",
     "Carpet Cleaning;Stain Removal;Pet Odour Treatment;"
     "Deodorising;Stain Protection"],
    ["Add", CAMPAIGN, "Service catalog",
     "4-Carpet Offer;Stairs & Landing;Upholstery Cleaning;"
     "Rugs;End of Tenancy"],
]
write("09_structured-snippets.csv",
      ["Action", "Campaign", "Header", "Values"],
      ss_rows)


# --- 10. Phone (call extension) ---
write("10_call-extensions.csv",
      ["Action", "Campaign", "Phone number", "Country code",
       "Call conversion"],
      [["Add", CAMPAIGN, "0330 043 4811", "GB", "Yes"]])


print("\nDone — all CSVs written to:", OUT)
