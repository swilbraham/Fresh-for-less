"use client";

import { useEffect, useRef } from "react";

/**
 * Dropped as the last child of a scrollable thread: jumps the container to
 * the newest message. Without it a long thread opens showing the oldest
 * texts and the reply you came to read is below the fold.
 *
 * `watch` should change whenever the thread does (its length, the selected
 * person) so a refresh with a new reply scrolls again.
 */
export default function ScrollToEnd({ watch }: { watch: string }) {
  const marker = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = marker.current?.parentElement;
    if (container) container.scrollTop = container.scrollHeight;
  }, [watch]);

  return <div ref={marker} aria-hidden />;
}
