"use client";

import { useEffect, useRef } from "react";
import { subscribeFrame } from "@/lib/motion/ticker";

/**
 * Run `callback` on every animation frame via the shared ticker.
 * The latest callback is always used, so it can close over fresh props.
 */
export function useFrame(callback: (time: number) => void, enabled = true) {
  const ref = useRef(callback);

  useEffect(() => {
    ref.current = callback;
  });

  useEffect(() => {
    if (!enabled) return;
    return subscribeFrame((t) => ref.current(t));
  }, [enabled]);
}
