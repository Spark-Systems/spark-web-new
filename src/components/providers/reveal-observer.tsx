"use client";

import { useEffect } from "react";

/**
 * Fades in every `[data-reveal]` element (see <Reveal />) the first time it
 * enters the viewport. One observer serves the whole page, so revealed
 * elements can stay in Server Components.
 */
export function RevealObserver() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed])");
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
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
