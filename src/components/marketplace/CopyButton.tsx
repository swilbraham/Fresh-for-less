"use client";

import { useRef, useState } from "react";

/**
 * Copy a prepared list to the clipboard, with a fallback that actually works.
 *
 * The clipboard API can be refused — an insecure context, a locked-down
 * browser, some in-app webviews. Telling someone to press Ctrl+C is useless if
 * nothing is selected, so a refusal reveals the text in a field and selects it
 * for them.
 */
export default function CopyButton({
  text,
  label,
  className = "",
}: {
  text: string;
  label: string;
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "done" | "manual">("idle");
  const field = useRef<HTMLTextAreaElement>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState("done");
      setTimeout(() => setState("idle"), 2500);
    } catch {
      setState("manual");
      // Reveal and select it so the keyboard shortcut has something to act on.
      requestAnimationFrame(() => {
        field.current?.focus();
        field.current?.select();
      });
    }
  };

  return (
    <div className={state === "manual" ? "w-full" : ""}>
      <button
        type="button"
        onClick={copy}
        className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${className}`}
      >
        {state === "done" ? "Copied ✓" : label}
      </button>

      {state === "manual" && (
        <div className="mt-2">
          <p className="text-xs text-slate-500">
            Your browser blocked the clipboard — it&apos;s selected below, press
            Ctrl+C (or Cmd+C).
          </p>
          <textarea
            ref={field}
            readOnly
            value={text}
            rows={3}
            aria-label={label}
            // Focus can be stolen between reveal and select, so re-select on any
            // interaction — clicking the box always selects the lot.
            onFocus={(event) => event.currentTarget.select()}
            onClick={(event) => event.currentTarget.select()}
            className="mt-1 w-full rounded-xl border border-slate-300 p-2 font-mono text-xs"
          />
        </div>
      )}
    </div>
  );
}
