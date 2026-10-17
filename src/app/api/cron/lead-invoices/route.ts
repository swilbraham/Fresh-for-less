import { NextResponse } from "next/server";
import { claimLeadFeesForText, sendLeadFeeText } from "@/lib/marketplace/repo";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Hourly: text each lead buyer their fee an hour after purchase. The hour
 * keeps money talk out of the moment they should be calling the customer;
 * the claim-before-send stamp keeps a retry from billing twice.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  const leads = await claimLeadFeesForText();
  let sent = 0;
  for (const lead of leads) {
    try {
      await sendLeadFeeText(lead);
      sent += 1;
    } catch (error) {
      console.error(`lead fee text failed for quote ${lead.id}`, error);
    }
  }
  return NextResponse.json({ ok: true, claimed: leads.length, sent });
}
