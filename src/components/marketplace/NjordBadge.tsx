"use client";

import { useState } from "react";

/**
 * The Njord Approved badge.
 *
 * Client-side only so a missing image file degrades to nothing rather than a
 * broken-image icon — the logo lives in /public/images and may not be there
 * yet on a fresh checkout.
 */
export default function NjordBadge({
  className = "",
}: {
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/njord-approved.png"
      alt="Njord Approved"
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
