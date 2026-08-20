"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { bookingToken, verifyBookingToken } from "@/lib/marketplace/auth";
import {
  cancelJobByCustomer,
  getJobByRef,
  rescheduleJob,
} from "@/lib/marketplace/repo";
import type { SlotWindow } from "@/lib/marketplace/types";

function field(data: FormData, name: string, max = 200): string {
  return String(data.get(name) ?? "").trim().slice(0, max);
}

/**
 * Every action re-checks the signed token. The page having rendered isn't
 * authorisation — the form post has to prove it too.
 */
async function authorise(data: FormData) {
  const ref = field(data, "ref", 20).toUpperCase();
  const token = field(data, "token", 64);
  if (!ref || !verifyBookingToken(ref, token)) {
    redirect("/booking/invalid");
  }
  const job = await getJobByRef(ref);
  if (!job) redirect("/booking/invalid");
  return { job, ref, token };
}

function back(ref: string, token: string, params: string): never {
  redirect(`/booking/${ref}?t=${token}&${params}`);
}

export async function rescheduleBookingAction(data: FormData) {
  const { job, ref, token } = await authorise(data);

  const slotDate = field(data, "slotDate", 10);
  const slotWindow: SlotWindow = field(data, "slotWindow", 2) === "pm" ? "pm" : "am";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(slotDate)) {
    back(ref, token, `error=${encodeURIComponent("Pick a new date.")}`);
  }

  const result = await rescheduleJob(job.id, slotDate, slotWindow);
  revalidatePath(`/booking/${ref}`);

  if (!result.ok) {
    back(ref, token, `error=${encodeURIComponent(result.reason ?? "Couldn't move that booking.")}`);
  }
  back(ref, token, `moved=${result.keptCleaner ? "kept" : "rebroadcast"}`);
}

export async function cancelBookingAction(data: FormData) {
  const { job, ref, token } = await authorise(data);

  const result = await cancelJobByCustomer(job.id, field(data, "reason", 200));
  revalidatePath(`/booking/${ref}`);

  if (!result.ok) {
    back(ref, token, `error=${encodeURIComponent(result.reason ?? "Couldn't cancel that booking.")}`);
  }
  back(ref, token, "cancelled=1");
}

/** Used by the confirmation page to build the manage link. */
export async function linkFor(ref: string): Promise<string> {
  return `/booking/${ref}?t=${bookingToken(ref)}`;
}
