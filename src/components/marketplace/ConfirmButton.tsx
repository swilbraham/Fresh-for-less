"use client";

import type { ReactNode } from "react";

/**
 * A submit button that overrides its form's action and asks first.
 *
 * Lets a destructive per-row action sit inside the big prices form without
 * nesting a second <form>, which HTML forbids. The action must arrive with its
 * argument already bound — a button using formAction cannot also carry
 * name/value data, because React uses that slot for the action reference.
 */
export default function ConfirmButton({
  action,
  confirmText,
  className = "",
  children,
}: {
  action: (data: FormData) => void | Promise<void>;
  confirmText: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      formAction={action}
      onClick={(event) => {
        if (!window.confirm(confirmText)) event.preventDefault();
      }}
      className={className}
    >
      {children}
    </button>
  );
}
