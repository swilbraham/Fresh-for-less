"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

/**
 * A submit button that disables itself while the action is in flight.
 *
 * Without this, an impatient second click fires the action twice. The server
 * handles that safely, but the user still sees a confusing outcome — so stop it
 * at the source as well.
 */
export default function SubmitButton({
  children,
  pendingLabel,
  className = "",
}: {
  children: ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`${className} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {pending ? (pendingLabel ?? "Working…") : children}
    </button>
  );
}
