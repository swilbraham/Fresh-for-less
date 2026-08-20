"use client";

import { useState } from "react";
import type { OpenSlot } from "@/lib/marketplace/repo";

function shortDate(day: string): string {
  return new Date(`${day}T12:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/**
 * Radio grid of free half-days. Holds the choice in state and posts it as two
 * plain fields, so the server action never has to parse a composite value.
 */
export default function SlotPicker({ slots }: { slots: OpenSlot[] }) {
  const [chosen, setChosen] = useState<{ day: string; window: "am" | "pm" } | null>(
    null
  );

  const options = slots.flatMap((slot) =>
    (["am", "pm"] as const)
      .filter((w) => slot[w])
      .map((w) => ({ day: slot.day, window: w }))
  );

  return (
    <>
      <input type="hidden" name="slotDate" value={chosen?.day ?? ""} />
      <input type="hidden" name="slotWindow" value={chosen?.window ?? ""} />

      <fieldset>
        <legend className="sr-only">Choose a new date and time</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {options.map((option) => {
            const id = `${option.day}-${option.window}`;
            const selected =
              chosen?.day === option.day && chosen?.window === option.window;
            return (
              <label
                key={id}
                htmlFor={id}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                  selected
                    ? "border-primary-600 bg-primary-50"
                    : "border-slate-200 hover:border-primary-400"
                }`}
              >
                <input
                  id={id}
                  type="radio"
                  name="slot"
                  value={id}
                  required
                  checked={selected}
                  onChange={() => setChosen(option)}
                  className="h-4 w-4 accent-primary-600"
                />
                <span>
                  <span className="block font-semibold text-slate-800">
                    {shortDate(option.day)}
                  </span>
                  <span className="block text-slate-500">
                    {option.window === "am" ? "Morning" : "Afternoon"}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </>
  );
}
