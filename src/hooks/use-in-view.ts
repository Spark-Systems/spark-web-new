"use client";

import { useEffect, useState, type RefObject } from "react";

/** Becomes true the first time the element intersects the viewport. */
export function useInViewOnce(ref: RefObject<Element | null>, threshold = 0.12) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold, inView]);

  return inView;
}
