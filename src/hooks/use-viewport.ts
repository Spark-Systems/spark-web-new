"use client";

import { useSyncExternalStore } from "react";

export const MOBILE_MAX_WIDTH = 760;

export interface Viewport {
  /** Viewport height clamped to 500–1100px; drives scroll-scene lengths. */
  vh: number;
  vw: number;
  isMobile: boolean;
}

const SERVER_VIEWPORT: Viewport = { vh: 900, vw: 1440, isMobile: false };

let snapshot: Viewport = SERVER_VIEWPORT;

function read(): Viewport {
  const vh = Math.max(500, Math.min(1100, window.innerHeight));
  const vw = window.innerWidth;
  const isMobile = vw < MOBILE_MAX_WIDTH;
  // Keep the same object while nothing changed so React skips re-renders.
  if (snapshot.vh !== vh || snapshot.vw !== vw || snapshot.isMobile !== isMobile) {
    snapshot = { vh, vw, isMobile };
  }
  return snapshot;
}

function subscribe(onChange: () => void) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

export function useViewport(): Viewport {
  return useSyncExternalStore(subscribe, read, () => SERVER_VIEWPORT);
}
