"use client";

import { useSyncExternalStore } from "react";

/**
 * Shown while preview mode is on (opened from the admin): the site is showing
 * saved drafts, not what visitors see. Hidden inside the admin's live preview
 * panel (an iframe), which has its own controls.
 */
export function PreviewBar() {
  const framed = useSyncExternalStore(
    () => () => {},
    () => window.self !== window.top,
    () => true,
  );
  if (framed) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-100 flex -translate-x-1/2 items-center gap-3 whitespace-nowrap rounded-full border border-white/16 bg-ink/90 py-2 pl-4 pr-2 text-sm text-snow shadow-[0_18px_50px_-18px_rgba(0,0,0,0.8)] backdrop-blur">
      <span className="size-2 rounded-full bg-brand" aria-hidden />
      <span>Preview: unpublished changes are showing</span>
      {/* A plain link (not client navigation) so the route handler can clear the preview cookie. */}
      <a
        href="/api/preview/exit"
        className="rounded-full bg-white/10 px-3 py-1 transition-colors hover:bg-brand"
      >
        Exit preview
      </a>
    </div>
  );
}
