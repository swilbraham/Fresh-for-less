#!/usr/bin/env python3
"""Generate Facebook Ads Manager bulk-upload CSV for the /4for99 campaign.

Format reference: https://www.facebook.com/business/help/216402145125255
"""
import csv
import os

OUT = "/Users/simonwilbrahan/Fresh For Less Carpet/ads-import/facebook"
os.makedirs(OUT, exist_ok=True)

CAMPAIGN = "4for99 - Leads - 2026-05"
LANDING = "https://www.freshforlesscarpetcleaning.co.uk/4for99/"
DISPLAY = "freshforlesscarpetcleaning.co.uk"
PIXEL_ID = "613073519035884"

# Facebook bulk-upload accepts a single flat CSV where each row is an
# entity (Campaign / Ad Set / Ad). Required columns vary by row type.

HEADERS = [
    # ---- general ----
    "Campaign Name",
    "Campaign Objective",
    "Buying Type",
    "Campaign Status",
    "Campaign Daily Budget",
    "Campaign Spending Limit",
    # ---- ad set ----
    "Ad Set Name",
    "Ad Set Run Status",
    "Ad Set Daily Budget",
    "Conversion Location",
    "Optimisation Goal",
    "Pixel ID",
    "Conversion Event",
    "Locations",
    "Age Min",
    "Age Max",
    "Genders",
    "Languages",
    "Custom Audience Excluded",
    "Detailed Targeting",
    "Placement Type",
    "Conversion Window",
    # ---- ad ----
    "Ad Name",
    "Ad Status",
    "Page ID",
    "Body",
    "Title",
    "Description",
    "Link",
    "Display Link",
    "Call to Action",
    "Image Filename 1:1",
    "Image Filename 4:5",
    "Image Filename 9:16",
    "URL Tags",
]


def row_template():
    return {h: "" for h in HEADERS}


# Reused values
LOCATIONS = "Wirral, GB; Liverpool, GB; Birkenhead, GB; Wallasey, GB; " \
            "Bebington, GB; Heswall, GB; Chester, GB; Ellesmere Port, GB; " \
            "Bromborough, GB; Neston, GB"
INTERESTS_STACK = ("Mrs Hinch; Cleaning; Home improvement; Pinterest; "
                   "Dunelm; IKEA; B&M Bargains; Pet ownership; Dog; Cat; "
                   "Parents (with young children); Engaged shoppers")

# === Build rows ===
rows = []

# 1. Campaign
c = row_template()
c.update({
    "Campaign Name": CAMPAIGN,
    "Campaign Objective": "OUTCOME_LEADS",
    "Buying Type": "AUCTION",
    "Campaign Status": "PAUSED",
    "Campaign Spending Limit": "500",
})
rows.append(c)

# Helper for ad sets / ads
def adset(name, daily, audience_inc=None, exclude_leads=True,
          interests=None, conversion_loc="WEBSITE",
          opt_goal="OFFSITE_CONVERSIONS"):
    r = row_template()
    r.update({
        "Campaign Name": CAMPAIGN,
        "Ad Set Name": name,
        "Ad Set Run Status": "PAUSED",
        "Ad Set Daily Budget": str(daily),
        "Conversion Location": conversion_loc,
        "Optimisation Goal": opt_goal,
        "Pixel ID": PIXEL_ID,
        "Conversion Event": "LEAD",
        "Locations": LOCATIONS,
        "Age Min": "30",
        "Age Max": "65",
        "Genders": "All",
        "Languages": "English (UK)",
        "Custom Audience Excluded":
            "WEB - Submitted Lead 180d" if exclude_leads else "",
        "Detailed Targeting": interests or "",
        "Placement Type": "Automatic",
        "Conversion Window": "7_DAY_CLICK_1_DAY_VIEW",
    })
    return r


def ad(name, body, title, desc, image_basename, utm_tag, cta="BOOK_NOW"):
    r = row_template()
    r.update({
        "Campaign Name": CAMPAIGN,
        "Ad Name": name,
        "Ad Status": "PAUSED",
        "Body": body,
        "Title": title,
        "Description": desc,
        "Link": LANDING,
        "Display Link": DISPLAY,
        "Call to Action": cta,
        "Image Filename 1:1": f"{image_basename}_1x1.png",
        "Image Filename 4:5": f"{image_basename}_4x5.png",
        "Image Filename 9:16": f"{image_basename}_9x16.png",
        "URL Tags": (f"utm_source=facebook&utm_medium=cpc&"
                     f"utm_campaign=4for99&utm_content={utm_tag}"),
    })
    return r


# 2. Ad sets
ad_sets = [
    adset("01 - Cold - Local broad", 7),
    adset("02 - Cold - Interests", 7, interests=INTERESTS_STACK),
    adset("03 - Retargeting - Visited 30d", 4, exclude_leads=True),
    adset("04 - WhatsApp - Cold", 5,
          conversion_loc="MESSAGING_APPS",
          opt_goal="CONVERSATIONS",
          interests=INTERESTS_STACK),
]
rows.extend(ad_sets)

# 3. Ads — Variant A,B,C run in ad sets 01 and 02; D in 03; E in 04
ads_master = [
    ("A - Hero card",
     ("Kids, dogs and red wine? Your carpets have been through it. 🐾\n\n"
      "We deep-clean 4 carpets — lounge, hallway, stairs, bedroom, you "
      "pick — for just £99 (normally £160).\n\n"
      "✅ Hot-water extraction (the proper deep clean, not a wet hoover)\n"
      "✅ Stains, pet smells & allergens lifted\n"
      "✅ Dry in 2–4 hours, not days\n"
      "✅ If you're not thrilled, we re-clean it FREE\n\n"
      "Covering Wirral, Liverpool & Cheshire. 4.9★ from 2,400+ local "
      "families.\n\n"
      "👇 Tap below to grab a slot — only 7 left this week."),
     "4 Carpets Cleaned for £99",
     "Was £160 · Save 38% this week",
     "4for99_A_hero", "A_hero"),
    ("B - Offer stack",
     ("4 carpets. Professionally cleaned. £99.\n\n"
      "That's it. No hidden fees, no upsells at the door, no \"from\" "
      "prices that turn into £180 by the time the kit comes out the van."
      "\n\nWhat you get for your £99:\n"
      "• 4 carpets — your choice\n"
      "• Industrial hot-water extraction\n"
      "• Pre-treatment of stains & high-traffic areas\n"
      "• Deodorising treatment included\n"
      "• Carpets dry in 2–4 hours\n"
      "• 100% satisfaction guarantee\n\n"
      "Was £160. Now £99. This price is only for bookings made this week."
      "\n\n📞 0330 043 4811 or tap Book Now."),
     "£99 — Was £160 (Save 38%)",
     "4 carpets, no hidden fees",
     "4for99_B_offer", "B_offer"),
    ("C - Reviews",
     ("\"Absolutely gobsmacked at the difference. Our living room carpet "
      "looked brand new — even the red wine stain from Christmas is "
      "gone!\"\n— Sarah T., Wirral ★★★★★\n\n"
      "We've deep-cleaned 2,400+ carpets across Merseyside & Cheshire, "
      "and right now 4 of yours can be next — for £99 (normally £160)."
      "\n\nHot-water extraction, deodorising, stain pre-treatment, and a "
      "2–4hr dry time so you're not living in a damp house all weekend."
      "\n\nIf you're not thrilled, we come back and re-clean for free. "
      "Simple as that.\n\nTap to grab one of this week's slots."),
     "4.9★ Carpet Clean — Just £99",
     "2,400+ happy local families",
     "4for99_C_reviews", "C_reviews"),
]

# Variants A, B, C in ad set 01
for adset_name in ["01 - Cold - Local broad", "02 - Cold - Interests"]:
    for ad_name, body, title, desc, img, utm in ads_master:
        r = ad(ad_name, body, title, desc, img, utm)
        r["Ad Set Name"] = adset_name
        rows.append(r)

# Variant D in retargeting ad set
d = ad(
    "D - Urgency",
    ("Still thinking about it? 👀\n\n"
     "Your 4-carpet £99 deal is still available — but only 7 slots left "
     "this week before we have to bump the price back to £160.\n\n"
     "If you're going to do it, do it now. Takes 60 seconds.\n\n"
     "📞 0330 043 4811 or tap below."),
    "Last few £99 slots left",
    "Lock in before price goes back up",
    "4for99_D_urgency",
    "D_urgency",
)
d["Ad Set Name"] = "03 - Retargeting - Visited 30d"
rows.append(d)

# Variant E (WhatsApp) in ad set 04
e = ad(
    "E - WhatsApp",
    ("Don't fancy filling in a form? 💬\n\n"
     "Just message us on WhatsApp — tell us how many carpets, where you "
     "are, and we'll get you booked in for the £99 deal in under 5 "
     "minutes.\n\n"
     "✅ 4 carpets professionally cleaned — £99 (was £160)\n"
     "✅ Hot-water extraction · stains, pet smells & allergens out\n"
     "✅ Dry in 2–4 hours\n"
     "✅ 4.9★ from 2,400+ Wirral & Cheshire families\n\n"
     "Tap \"Send Message\" below — we usually reply within minutes."),
    "Message us on WhatsApp 💬",
    "4 carpets, £99 — booked in 5 mins",
    "4for99_A_hero",   # reuse hero image
    "E_whatsapp",
    cta="WHATSAPP_MESSAGE",
)
e["Ad Set Name"] = "04 - WhatsApp - Cold"
e["Link"] = "https://wa.me/447479921066"
rows.append(e)

# Write
with open(os.path.join(OUT, "fb-bulk-import.csv"), "w",
          newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=HEADERS, quoting=csv.QUOTE_MINIMAL)
    w.writeheader()
    for r in rows:
        w.writerow(r)

print(f"✓ fb-bulk-import.csv  ({len(rows)} rows)")
print(f"\nWritten to: {OUT}")
