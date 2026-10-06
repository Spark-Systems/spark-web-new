"use client";

import { useEffect } from "react";

const SELECTOR = "[data-reveal]:not([data-revealed])";

/**
 * Fades in every `[data-reveal]` element (see <Reveal />) the first time it
 * enters the viewport. One observer serves the whole page, so revealed
 * elements can stay in Server Components. Elements added later (a new page
 * after client-side navigation, or a layout swapped in after hydration) are
 * picked up too: DOM additions trigger a rescan, batched to one per frame.
 */
export function RevealObserver() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.setAttribute("data-revealed", "");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12 },
    );
    // Observing an element twice is a no-op, so rescanning everything is safe.
    const scan = () => document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => io.observe(el));

    let frame = 0;
    const mo = new MutationObserver(() => {
      if (!frame) frame = requestAnimationFrame(() => ((frame = 0), scan()));
    });
    mo.observe(document.body, { childList: true, subtree: true });
    scan();

    return () => {
      mo.disconnect();
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
