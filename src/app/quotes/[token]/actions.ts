"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  acceptQuoteResponse,
  bookQuoteRequest,
} from "@/lib/marketplace/repo";
import type { SlotWindow } from "@/lib/marketplace/types";

function field(data: FormData, name: string, max = 200): string {
  return String(data.get(name) ?? "").trim().slice(0, max);
}

export async function acceptQuoteResponseAction(data: FormData) {
  const token = field(data, "token", 40);
  const responseId = Number(field(data, "responseId", 12));
  if (!token || !Number.isFinite(responseId)) redirect("/book");

  const result = await acceptQuoteResponse(token, responseId);
  revalidatePath(`/quotes/${token}`);
  if (!result.ok) {
    redirect(
      `/quotes/${token}?error=${encodeURIComponent(result.reason ?? "Try again.")}`
    );
  }
  redirect(`/quotes/${token}?accepted=1`);
}

export async function bookQuoteRequestAction(data: FormData) {
  const token = field(data, "token", 40);
  if (!token) redirect("/book");

  const addressLine = field(data, "addressLine", 160);
  const town = field(data, "town", 80);
  const slotDate = field(data, "slotDate", 10);
  const slotWindow: SlotWindow = field(data, "slotWindow", 2) === "pm" ? "pm" : "am";
  const parking = field(data, "parking", 200);
  const termsAccepted = data.get("termsAccepted") === "on";

  const problems: string[] = [];
  if (addressLine.length < 4) problems.push("your address");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(slotDate)) problems.push("a date");
  if (!termsAccepted) problems.push("a tick to accept the terms");
  if (problems.length) {
    redirect(
      `/quotes/${token}?error=${encodeURIComponent(`Please add ${problems.join(", ")}.`)}`
    );
  }

  let result: Awaited<ReturnType<typeof bookQuoteRequest>>;
  try {
    result = await bookQuoteRequest(token, {
      addressLine,
      town,
      slotDate,
      slotWindow,
      parking,
      termsAccepted,
    });
  } catch (error) {
    console.error("bookQuoteRequest failed", error);
    redirect(
      `/quotes/${token}?error=${encodeURIComponent("Something went wrong — please try again.")}`
    );
  }

  revalidatePath(`/quotes/${token}`);
  if (!result.ok) {
    redirect(`/quotes/${token}?error=${encodeURIComponent(result.reason)}`);
  }
  redirect(`/quotes/${token}?booked=${encodeURIComponent(result.ref)}`);
}
