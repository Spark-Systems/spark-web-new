"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";

const MotionContext = createContext(true);

/** Provides whether decorative motion is allowed (honours prefers-reduced-motion). */
export function MotionProvider({ children }: { children: ReactNode }) {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  return <MotionContext.Provider value={!reduced}>{children}</MotionContext.Provider>;
}

export const useMotion = () => useContext(MotionContext);
